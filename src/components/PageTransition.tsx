"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * The wordmark traverse.
 *
 * Opening a project runs in four beats, and the order of them is the whole
 * point:
 *
 *   1. COVER   An ink curtain sweeps up over the catalogue. The name does not
 *              move at all: it stays exactly where it was clicked, still
 *              rotated, and the page is simply taken away from around it. Its
 *              colour is carried to white on the way, because a column's black
 *              type would otherwise vanish into the ink.
 *   2. HOLD    For a beat the screen is nothing but that name, sitting where
 *              it always was. The route change happens underneath, unseen.
 *   3. TURN    It rotates upright, in place, at its own size. Nothing else.
 *   4. FLIGHT  It travels to the heading and grows into it, with no rotation
 *              left to spend, while the curtain continues upward and off.
 *
 * Turning and travelling were one movement first, which was wrong in a way
 * that only measuring showed: a five-hundred-pixel word turning ninety degrees
 * sweeps a bounding box far larger than either end state, so combining it with
 * a doubling in size read as "expands, rotates, shrinks, arrives". Separated,
 * the turn happens at a constant size and the flight is monotonic growth.
 *
 * Rotation is about the element's centre. About a corner it would swing
 * through an arc; about the centre it turns where it stands.
 *
 * This does not use GSAP Flip, despite Flip being the obvious tool. Tailwind
 * v4's `-rotate-90` compiles to the independent CSS `rotate` property rather
 * than to `transform`, so `transform` reads as `none` on the source element.
 * Flip diffs transforms, so it cannot see the rotation at all, and a naive
 * clone inherits the utility class and ends up rotated twice.
 *
 * Every failure path falls back to an ordinary navigation with the heading
 * simply visible, and the curtain lifts on a timer if the destination never
 * announces itself, so a wrong turn can never strand anyone behind ink.
 */

const ARRIVED_EVENT = "wordmark:arrived";

/** Fired once the traverse is over, so the project page can start its own. */
export const WORDMARK_LANDED = "wordmark:landed";

const COVER = 0.55;
const NAVIGATE_AT = 0.4;
/** The name sits still, covered, before it does anything. */
const HOLD = 0.14;
/** The turn, in place. */
const TURN = 0.52;
/** A breath between turning and travelling, so they read as two moves. */
const SETTLE = 0.12;
/** Travel and growth only — no rotation left to spend. */
const FLIGHT = 0.9;
/** If the destination never announces itself, uncover anyway. */
const ABANDON_AFTER = 2000;

/**
 * Set the moment a traverse begins, read once by the arriving project page.
 *
 * The project page needs to know whether to render its heading hidden (a clone
 * is flying towards it) or visible (someone opened the URL directly). A module
 * flag is right for this: it is false during SSR and on a cold load, so the
 * server-rendered heading is always visible and never depends on JavaScript.
 */
let pendingTraverse = false;

export function consumePendingTraverse(): boolean {
  const pending = pendingTraverse;
  pendingTraverse = false;
  return pending;
}

interface TransitionApi {
  launch: (el: HTMLElement, href: string) => void;
}

const TransitionContext = createContext<TransitionApi>({ launch: () => {} });

export const useWordmarkTransition = () => useContext(TransitionContext);

/** Called by the project page once its heading is in the DOM. */
export function announceArrival(target: HTMLElement) {
  window.dispatchEvent(new CustomEvent(ARRIVED_EVENT, { detail: { target } }));
}

/** The clone's own layout size, the basis for every scale ratio. */
interface CloneBox {
  width: number;
  height: number;
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const clone = useRef<HTMLElement | null>(null);
  const box = useRef<CloneBox | null>(null);
  const covered = useRef(false);
  const target = useRef<HTMLElement | null>(null);
  const abandon = useRef<number | null>(null);
  const router = useRouter();

  /** Put everything back so a later traverse starts from a clean slate. */
  const reset = useCallback(() => {
    clone.current?.remove();
    clone.current = null;
    box.current = null;
    target.current = null;
    covered.current = false;
    if (abandon.current) {
      window.clearTimeout(abandon.current);
      abandon.current = null;
    }
    if (curtain.current) gsap.set(curtain.current, { scaleY: 0 });
    window.dispatchEvent(new Event(WORDMARK_LANDED));
  }, []);

  /** Beat 3: uncover the page while the name flies to its heading. */
  const land = useCallback(() => {
    const node = clone.current;
    const dest = target.current;
    const size = box.current;

    if (abandon.current) {
      window.clearTimeout(abandon.current);
      abandon.current = null;
    }

    // No destination to hand over to: just lift the curtain and show whatever
    // is underneath rather than holding the reader behind it.
    if (!node || !dest || !size || !curtain.current) {
      if (dest) gsap.set(dest, { autoAlpha: 1 });
      if (curtain.current) {
        gsap.to(curtain.current, {
          scaleY: 0,
          transformOrigin: "top",
          duration: 0.5,
          ease: "power3.inOut",
          onComplete: reset,
        });
      } else {
        reset();
      }
      return;
    }

    const rect = dest.getBoundingClientRect();
    const destStyles = getComputedStyle(dest);

    /**
     * Grow by font-size, not by transform scale.
     *
     * Scaled text is one rasterisation stretched by the compositor; text set
     * at a size is hinted and spaced for that size. They are never quite the
     * same shape, so however exactly a scaled clone was positioned, the final
     * swap to the real heading shifted the glyphs — which is the little jolt
     * at the end that no amount of easing could fix. Animating the font-size
     * means the clone is already, literally, the same rendering as the thing
     * replacing it, and the hand-over can be a single frame with nothing to
     * see. It costs a layout per frame for one element.
     */

    // Tell the page to start composing itself NOW, as the uncover begins,
    // rather than after it. The curtain shrinks towards the top, so the body
    // of the page is revealed first — waiting until the end would uncover a
    // blank sheet and only then fill it.
    window.dispatchEvent(new Event(WORDMARK_LANDED));

    const tl = gsap.timeline({
      onComplete: () => {
        // One frame, both operations: reveal the heading and drop the clone
        // together. Crossfading them would show the same word twice.
        gsap.set(dest, { autoAlpha: 1 });
        reset();
      },
    });

    tl.to(
      node,
      {
        fontSize: destStyles.fontSize,
        // No scale in play, so the transform is pure translation and the
        // clone's top-left is exactly where it is put.
        x: rect.left,
        y: rect.top,
        color: destStyles.color,
        duration: FLIGHT,
        ease: "power3.inOut",
      },
      0,
    ).to(
      curtain.current,
      {
        scaleY: 0,
        transformOrigin: "top",
        duration: FLIGHT - 0.16,
        ease: "power4.inOut",
      },
      0.16,
    );
  }, [reset]);

  /** Beats 1 and 2: cover the screen, leaving only the name. */
  const launch = useCallback(
    (el: HTMLElement, href: string) => {
      if (prefersReducedMotion() || !stage.current || !curtain.current) {
        router.push(href);
        return;
      }

      clone.current?.remove();
      covered.current = false;
      target.current = null;

      const rect = el.getBoundingClientRect();
      const styles = getComputedStyle(el);

      // Layout dimensions are unaffected by rotation; the bounding rect is
      // not. Comparing them tells us whether this wordmark is rotated without
      // having to know which breakpoint we are at.
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      const rotated =
        Math.abs(rect.width - height) < 2 && Math.abs(rect.height - width) < 2;

      /**
       * The clone grows by font-size, not by transform scale, so its spacing
       * has to be expressed relative to the font or it would not grow with it.
       * A computed letter-spacing of "-4px" stays -4px however large the type
       * gets; as an em it tracks properly, which is what keeps the clone
       * identical to the heading it is going to become.
       */
      const fontPx = parseFloat(styles.fontSize) || 16;
      const rel = (value: string) =>
        value === "normal" || !value
          ? "normal"
          : `${parseFloat(value) / fontPx}em`;

      const node = document.createElement("span");
      node.textContent = el.textContent;
      node.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        margin: 0;
        padding: 0;
        display: inline-block;
        white-space: nowrap;
        pointer-events: none;
        font-family: ${styles.fontFamily};
        font-size: ${styles.fontSize};
        font-weight: ${styles.fontWeight};
        letter-spacing: ${rel(styles.letterSpacing)};
        line-height: ${
          styles.lineHeight === "normal"
            ? "normal"
            : parseFloat(styles.lineHeight) / fontPx
        };
        color: ${styles.color};
      `;
      stage.current.appendChild(node);

      // Measure what the clone actually is, rather than trusting it to match
      // the source. It is sized by its own text now, not by fixed dimensions.
      const cw = node.offsetWidth;
      const ch = node.offsetHeight;

      // Rotating about the centre leaves the centre where it is, so the clone
      // is placed by matching centres. A rotated wordmark's visual box is the
      // layout box turned on its side, which is why the half-extents swap.
      gsap.set(node, {
        transformOrigin: "50% 50%",
        rotation: rotated ? -90 : 0,
        x: rect.left + rect.width / 2 - cw / 2,
        y: rect.top + rect.height / 2 - ch / 2,
        scale: 1,
      });

      // Where the name sits once it has turned but not yet travelled: same
      // centre, clamped so a column near the edge does not swing half of
      // itself off screen when it goes from tall-and-thin to wide-and-short.
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = 32;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const clamp = (v: number, half: number, limit: number) =>
        half * 2 + margin * 2 > limit
          ? limit / 2
          : Math.min(Math.max(v, half + margin), limit - half - margin);
      const uprightX = clamp(cx, cw / 2, vw) - cw / 2;
      const uprightY = clamp(cy, ch / 2, vh) - ch / 2;

      clone.current = node;
      box.current = { width: cw, height: ch };
      pendingTraverse = true;

      const tl = gsap.timeline();

      tl.fromTo(
        curtain.current,
        { scaleY: 0, transformOrigin: "bottom" },
        { scaleY: 1, duration: COVER, ease: "power4.inOut" },
        0,
      )
        // The only thing that changes about the name during the cover. A
        // column's black type would be swallowed by the ink otherwise, and
        // the whole point of this beat is that the name is all that is left.
        .to(
          node,
          { color: "#ffffff", duration: COVER * 0.7, ease: "power2.out" },
          0.08,
        )
        .call(() => router.push(href), [], NAVIGATE_AT)

        // Beat 2: the turn, on its own, going nowhere.
        //
        // Rotating and travelling together looked wrong for a reason that is
        // obvious once measured: a long word turning 90 degrees sweeps a
        // bounding box far larger than either end state, so combining it with
        // a 2x growth read as "expands, rotates, shrinks, arrives". Turning in
        // place first means the flight that follows is pure translation.
        .to(
          node,
          {
            rotation: 0,
            // Upright, the word is as wide as it was tall. Near an edge that
            // would put half of it off screen, so the centre is nudged just
            // far enough to keep it whole. Only ever a few pixels inland.
            x: uprightX,
            y: uprightY,
            duration: TURN,
            ease: "power3.inOut",
          },
          COVER + HOLD,
        )

        .call(
          () => {
            covered.current = true;
            // The destination may have announced itself while the curtain was
            // still moving; if so, go straight on.
            if (target.current) land();
            else
              abandon.current = window.setTimeout(land, ABANDON_AFTER);
          },
          [],
          COVER + HOLD + TURN + SETTLE,
        );
    },
    [router, land],
  );

  useEffect(() => {
    const onArrive = (event: Event) => {
      const dest = (event as CustomEvent<{ target: HTMLElement }>).detail
        ?.target;
      if (!dest) return;
      target.current = dest;
      // Only fly once the cover is complete; otherwise the landing would race
      // the curtain and the name would arrive before the page is hidden.
      if (covered.current) land();
    };

    window.addEventListener(ARRIVED_EVENT, onArrive);
    return () => window.removeEventListener(ARRIVED_EVENT, onArrive);
  }, [land]);

  return (
    <TransitionContext.Provider value={{ launch }}>
      {children}
      {/* Curtain below, travelling name above it. Both clear Chrome (z-50) and
          sit under the splash (z-200), which must always win. */}
      <div
        ref={curtain}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[95] origin-bottom scale-y-0 bg-ink"
      />
      <div
        ref={stage}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[96]"
      />
    </TransitionContext.Provider>
  );
}
