"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useInView } from "@/lib/useInView";
import { Panel } from "@/components/Panel";
import { Spray } from "@/components/Spray";
import type { ExperienceEntry } from "@/content/types";

/**
 * The career timeline.
 *
 * The one layout here where horizontal is genuinely the better orientation
 * rather than the more striking one: a timeline is a line, and the scroll
 * direction and the axis of the data are the same thing. Oldest first, so
 * scrolling forward moves forward in time.
 */

/**
 * A wave whose centreline crosses zero exactly under each entry's node.
 *
 * One entry is a half-period, so every crossing lands on a node and the bulge
 * alternates above and below the line between them.
 *
 * Built in real pixels from the list's measured width rather than in abstract
 * viewBox units. An earlier version used a fixed 100-unit span stretched to fit
 * with `preserveAspectRatio="none"`, which scaled the path 3.36x horizontally
 * and 1x vertically — and under non-uniform scale a dash pattern is computed in
 * user units but painted along a distorted path. The stroke advanced at
 * different rates through the steep and flat parts, so the line ran out before
 * the last entry even at 218% "drawn". Matching the viewBox to the rendered box
 * keeps the scale at 1:1 and makes arc length mean what it says.
 */
const WAVE_HEIGHT = 96;
const WAVE_MID = WAVE_HEIGHT / 2;
const WAVE_AMP = 34;

/**
 * Where the drawing tip sits on screen, as a fraction of the viewport, for as
 * long as the list is crossing it. A little right of centre: the line reaches
 * each pin just before that entry settles into the position you read it in, so
 * it stays ahead of you without ever being so far ahead that it has already
 * finished under everything visible.
 */
const TIP_ANCHOR = 0.62;

function wavePath(segments: number, span: number): string {
  let d = `M 0 ${WAVE_MID}`;
  for (let i = 0; i < segments; i += 1) {
    const x0 = i * span;
    const bulge = i % 2 === 0 ? WAVE_MID - WAVE_AMP : WAVE_MID + WAVE_AMP;
    d += ` Q ${x0 + span / 2} ${bulge} ${x0 + span} ${WAVE_MID}`;
  }
  return d;
}

/**
 * A push pin, drawn in the same rough contour as the rest of the site's line
 * art. Its needle tip sits on the wave's zero-crossing, so each entry reads as
 * literally pinned to the thread rather than sitting near it — which is the
 * whole reason to use a pin instead of an abstract marker.
 *
 * Strokes take `currentColor`, so the colour is set by the parent and the
 * hover rule can move it without touching this file.
 */
function PushPin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 56" className={className} aria-hidden="true">
      {/* needle, running down to the tip at the crossing */}
      <path
        d="M20 41 L20 54"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      {/* collar */}
      <path
        d="M11 31 C13 29, 27 29, 29 31 C28 37, 24 41, 20 41 C16 41, 12 37, 11 31 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
      {/* head */}
      <path
        d="M20 5 C29 5, 34 11, 33.5 18 C33 25, 27 30.5, 20 30.5 C13 30.5, 7 25, 6.5 18 C6 11, 11 5, 20 5 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* catch-light, so the head reads as domed rather than as a blob */}
      <path
        d="M13 14 C15 11.5, 18 10.5, 21 11.5"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StationTrajectory({
  experience,
  containerAnimation,
}: {
  experience: ExperienceEntry[];
  containerAnimation?: gsap.core.Tween;
}) {
  const [root, seen] = useInView<HTMLDivElement>();
  const wave = useRef<SVGPathElement>(null);
  const list = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !seen) return;

      gsap.from(".traj-entry", {
        autoAlpha: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.09,
        ease: "power3.out",
      });

      // Scales from the needle tip so each pin reads as being pushed in.
      gsap.from(".traj-node", {
        scale: 0,
        duration: 0.45,
        stagger: 0.09,
        delay: 0.15,
        ease: "back.out(2.4)",
        transformOrigin: "50% 100%",
      });
    },
    { scope: root, dependencies: [seen] },
  );

  /**
   * The wave draws itself in step with the scroll rather than playing once on
   * entry, so it reads as being laid down ahead of you as you travel along it.
   *
   * Driven by the panel's own measured position instead of a ScrollTrigger
   * bound to `containerAnimation`. Trigger positions against a horizontally
   * translated container are computed from layout at refresh time and have
   * already proved unreliable here; a rect read per frame cannot disagree with
   * what is actually on screen, and it works unchanged for the vertical
   * (mobile) layout.
   */
  useEffect(() => {
    const path = wave.current;
    const el = list.current;
    if (!path || !el) return;

    if (prefersReducedMotion()) {
      gsap.set(path, { drawSVG: "0% 100%" });
      return;
    }

    const svg = path.ownerSVGElement;

    // The x-span the path covers, in pixels — the list's width plus the extra
    // half-period. Held from the last cut so `update` measures progress against
    // the geometry that is actually on screen.
    let drawnSpan = 0;

    /**
     * Re-cuts the path to the list's real width so the scale stays 1:1, plus
     * one extra half-period past the end. The panel clips that tail, so the
     * line runs off its edge rather than stopping dead at the last entry —
     * which is what makes it read as carrying on into the next section.
     */
    const layout = () => {
      const width = el.getBoundingClientRect().width;
      if (!width || !svg || !experience.length) return;
      const span = width / experience.length;
      const full = width + span;
      drawnSpan = full;
      svg.setAttribute("viewBox", `0 0 ${full} ${WAVE_HEIGHT}`);
      svg.style.width = `${full}px`;
      // Pinned in pixels alongside the width, because the class that sizes this
      // box is `h-24` — six rem, which is only WAVE_HEIGHT while the root font
      // size is the default 16px. A visitor browsing at a larger or smaller
      // base font size got a box whose height disagreed with the viewBox, and
      // the vertical scale went with it.
      svg.style.height = `${WAVE_HEIGHT}px`;
      path.setAttribute("d", wavePath(experience.length + 1, span));
    };

    // The `wide` variant verbatim, rather than an `innerWidth` comparison that
    // counts the scrollbar differently and so can disagree with the CSS by a
    // few pixels either side of the breakpoint.
    const wide = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );

    const update = () => {
      const rect = el.getBoundingClientRect();

      // Re-cut if the list has been re-laid out under us. A font swap, a page
      // zoom, or the breakpoint flipping all change its width without reliably
      // firing `resize`, and a stale viewBox breaks the 1:1 scale that makes
      // arc length mean pixels. It also covers the first paint, where the
      // mount-time call can measure zero and bail.
      // Nothing to draw against while the list has no width — the panel is
      // display:none below the breakpoint, and measuring it there would push a
      // degenerate geometry through the plugin.
      if (!rect.width) return;

      const cut = rect.width * (1 + 1 / experience.length);
      if (!drawnSpan || Math.abs(cut - drawnSpan) > 0.5) layout();
      if (!drawnSpan) return;

      /**
       * The tip is drawn to a fixed point on the screen, not to a fraction of
       * the list's crossing. Normalising by a distance containing the viewport
       * width — as this did — makes the thread advance at
       * `(listWidth + span) / (viewportWidth + listWidth)` pixels per pixel of
       * list travel, a rate that is never 1 and changes with the screen. The
       * tip therefore slid forward through the entries, and how far it slid
       * depended on the window: on a 1920 screen the last entry was threaded as
       * it reached the centre, on a 13-inch laptop at 68% across, so the last
       * two entries arrived already drawn and scrolling did nothing under them.
       *
       * Measuring how far the list has pushed past a fixed anchor makes the
       * rate exactly 1 by construction, so every entry is threaded at the same
       * point in its journey across the screen at every viewport size.
       */
      const raw = wide.matches
        ? (window.innerWidth * TIP_ANCHOR - rect.left) / drawnSpan
        : (window.innerHeight * TIP_ANCHOR - rect.top) / (rect.height || 1);

      const progress = Math.max(0, Math.min(1, raw));

      gsap.set(path, { drawSVG: `0% ${(progress * 100).toFixed(2)}%` });
    };

    const onResize = () => {
      layout();
      update();
    };

    layout();
    update();

    // Ticked every frame rather than driven by `scroll`. Lenis settles the
    // final position without reliably emitting a trailing scroll event, so a
    // listener-based version was left holding a stale value — the line sat at
    // 0% drawn at a scroll position where it should have been 86%. One rect
    // read per frame is cheap next to what this page already does, and it
    // cannot fall out of step with what is on screen.
    gsap.ticker.add(update);
    window.addEventListener("resize", onResize);
    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener("resize", onResize);
    };
  }, [experience.length]);

  return (
    <Panel
      id="trajectory"
      name="TRAJECTORY"
      tone="paper"
      width="auto"
      containerAnimation={containerAnimation}
      drift={4}
      className="px-6 py-24 sm:px-12 wide:py-0"
    >
      <div ref={root}>
        <div data-drift>
          <div className="relative mb-14 inline-block">
            <h2 className="display-tight text-[13vw] wide:text-[6vw]">
              Trajectory
            </h2>
            <Spray
              kind="underline"
              className="absolute -bottom-[22%] left-0 h-[34%] w-full"
            />
          </div>

          <ol
            ref={list}
            className="relative flex flex-col wide:flex-row wide:items-stretch"
          >
            {/* The connector. Sits astride the row's top edge so the wave's
                zero-crossings land on the nodes. Hidden on the stacked layout,
                where the entries are joined by their left rule instead. */}
            <svg
              aria-hidden="true"
              preserveAspectRatio="none"
              className="pointer-events-none absolute -top-12 left-0 hidden h-24 w-full overflow-visible wide:block"
            >
              {/* No `vector-effect: non-scaling-stroke` here, deliberately.
                  With it, the dash pattern is generated in screen space, so
                  DrawSVG has to multiply its measured length by the element's
                  screen CTM scale — and it writes `stroke-dasharray` as
                  `drawn, measured - drawn`. Any reading other than 1:1 makes
                  that pair sum to less than the real path, and a dash pattern
                  shorter than the path it is painted on *repeats*: the line
                  came out as a drawn run, a gap, then a second run, instead of
                  one line. Without the attribute the length is the path's own
                  arc length and the dasharray is in the same user units, so the
                  two agree by construction at any scale. The box is kept 1:1
                  anyway, so the stroke renders identically. */}
              <path
                ref={wave}
                fill="none"
                stroke="var(--color-red)"
                strokeWidth={6}
                strokeLinecap="round"
              />
            </svg>

            {experience.map((entry) => (
              <li
                key={`${entry.org}-${entry.start}`}
                className="traj-entry group relative w-full shrink-0 border-l-[3px] border-ink pt-6 pb-10 pl-6 last:pb-0 wide:w-[21rem] wide:border-l-0 wide:pr-12 wide:pb-0 wide:pl-0"
              >
                {/* Positioned by its tip, not its centre: the needle lands on
                    the crossing, the body stands above it. */}
                <PushPin
                  className={`traj-node absolute -top-[52px] -left-[18px] h-[52px] w-[36px] ${
                    entry.current ? "text-red" : "text-ink"
                  }`}
                />
                <p
                  className={`micro uppercase ${
                    entry.current ? "text-red" : "opacity-50"
                  }`}
                >
                  {entry.start} &ndash; {entry.end}
                </p>
                <h3 className="display mt-4 text-3xl leading-tight">
                  {entry.org}
                </h3>
                <p className="mt-2 text-base font-medium">{entry.role}</p>
                <p className="mt-4 max-w-[19rem] text-sm leading-relaxed opacity-60">
                  {entry.summary}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Panel>
  );
}
