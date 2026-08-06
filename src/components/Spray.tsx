"use client";

import { type JSX } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useInView } from "@/lib/useInView";

/**
 * Red spray-paint marks, laid over the composition.
 *
 * These are the site's only use of the accent colour, and they always sit on
 * top of the artwork and the type rather than beside them — a mark is applied
 * to a page, not designed into it. That is the difference between this reading
 * as defacement and reading as decoration.
 *
 * Marks are revealed rather than faded in: strokes draw on with DrawSVG, fills
 * punch in with a fast overshoot, both of which behave like a can being used.
 */

export type SprayKind =
  | "swipe"
  | "scribble"
  | "cross"
  | "circle"
  | "blob"
  | "underline"
  | "arrow"
  | "tag";

const STROKE = {
  stroke: "currentColor",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const MARKS: Record<SprayKind, () => JSX.Element> = {
  /**
   * A pass of the can, laid down as a solid bar.
   *
   * This is the answer to marking a headline. Any ring or strike has to cross
   * the glyphs to do its job, which damages the one word a page exists to say.
   * Paint behind the type does the opposite — the letters knock out of it in
   * white and get *more* legible, not less.
   */
  swipe: () => (
    <path
      data-swipe
      d="M4 24 C96 10, 268 6, 438 12 C566 17, 664 10, 716 22 C726 58, 724 106, 714 134 C566 146, 302 150, 122 142 C58 139, 14 133, 5 122 Z"
      fill="currentColor"
    />
  ),
  // A scrawled loop, the kind you get from not lifting the can.
  scribble: () => (
    <path
      data-stroke
      d="M22 96 C90 34, 176 30, 250 58 C318 84, 300 132, 226 138 C150 144, 74 122, 40 92 C96 118, 200 130, 262 104"
      strokeWidth={17}
      {...STROKE}
    />
  ),
  cross: () => (
    <>
      <path data-stroke d="M30 34 L268 140" strokeWidth={16} {...STROKE} />
      <path data-stroke d="M266 30 L34 144" strokeWidth={16} {...STROKE} />
    </>
  ),
  // Circling something the way you would on a printout.
  circle: () => (
    <path
      data-stroke
      d="M150 22 C238 22, 288 56, 286 88 C284 126, 210 152, 142 150 C70 148, 16 120, 18 84 C20 50, 78 24, 152 22 C210 22, 258 38, 274 62"
      strokeWidth={15}
      {...STROKE}
    />
  ),
  // A sprayed dot with the paint running out of it.
  blob: () => (
    <>
      <ellipse data-fill cx={130} cy={62} rx={54} ry={48} fill="currentColor" />
      <path data-stroke d="M114 106 L110 176" strokeWidth={7} {...STROKE} />
      <path data-stroke d="M140 108 L146 150" strokeWidth={6} {...STROKE} />
      <ellipse data-fill cx={110} cy={178} rx={7} ry={9} fill="currentColor" />
    </>
  ),
  underline: () => (
    <path
      data-stroke
      d="M14 58 C110 26, 220 26, 320 50 C232 66, 118 70, 26 52"
      strokeWidth={14}
      {...STROKE}
    />
  ),
  arrow: () => (
    <>
      <path data-stroke d="M16 76 L268 70" strokeWidth={14} {...STROKE} />
      <path data-stroke d="M214 28 L276 70 L214 116" strokeWidth={14} {...STROKE} />
    </>
  ),
  // A quick tag — no letters, just the gesture of one.
  tag: () => (
    <>
      <path
        data-stroke
        d="M26 132 C54 46, 86 44, 96 118 C106 44, 150 40, 156 122 C168 48, 210 44, 224 116"
        strokeWidth={15}
        {...STROKE}
      />
      <path data-stroke d="M22 150 L242 140" strokeWidth={9} {...STROKE} />
    </>
  ),
};

/**
 * Whether the mark stretches to fill its box or keeps its drawn proportions.
 *
 * A cross-out and an underline are made *against* something — you drag them
 * the length of the word, so they stretch. A scribble, a tag, or a sprayed
 * blob is its own gesture and keeps its shape wherever it lands. Getting this
 * backwards is what turns a scribble into a flat smear.
 */
const STRETCHES: Record<SprayKind, boolean> = {
  swipe: true,
  scribble: false,
  cross: true,
  circle: true,
  blob: false,
  underline: true,
  arrow: true,
  tag: false,
};

const VIEWBOX: Record<SprayKind, string> = {
  swipe: "0 0 720 156",
  scribble: "0 0 320 176",
  cross: "0 0 300 176",
  circle: "0 0 304 176",
  blob: "0 0 260 200",
  underline: "0 0 336 96",
  arrow: "0 0 292 144",
  tag: "0 0 264 176",
};

export function Spray({
  kind,
  className,
  delay = 0,
  mist = false,
  stretch,
}: {
  kind: SprayKind;
  className?: string;
  delay?: number;
  /** Adds the soft overspray cloud behind the mark. */
  mist?: boolean;
  /** Overrides the per-kind stretch default. */
  stretch?: boolean;
}) {
  const [ref, seen] = useInView<SVGSVGElement>();
  const Mark = MARKS[kind] ?? MARKS.scribble;

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !seen) return;

      const strokes = root.querySelectorAll("[data-stroke]");
      const fills = root.querySelectorAll("[data-fill]");
      const swipes = root.querySelectorAll("[data-swipe]");

      if (prefersReducedMotion()) {
        gsap.set(strokes, { drawSVG: "100%" });
        gsap.set([...strokes, ...fills, ...swipes], { autoAlpha: 1, scaleX: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power2.out" }, delay });

      if (strokes.length) {
        tl.fromTo(
          strokes,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.42, stagger: 0.09, ease: "power1.inOut" },
          0,
        );
      }
      if (swipes.length) {
        tl.fromTo(
          swipes,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.5, ease: "power3.inOut" },
          0,
        );
      }
      if (fills.length) {
        tl.fromTo(
          fills,
          { scale: 0.2, autoAlpha: 0, transformOrigin: "center" },
          { scale: 1, autoAlpha: 1, duration: 0.34, stagger: 0.06, ease: "back.out(2.2)" },
          0.05,
        );
      }
    },
    { scope: ref, dependencies: [seen, kind] },
  );

  return (
    <svg
      ref={ref}
      viewBox={VIEWBOX[kind]}
      aria-hidden="true"
      className={`spray text-red ${className ?? ""}`}
      preserveAspectRatio={
        (stretch ?? STRETCHES[kind]) ? "none" : "xMidYMid meet"
      }
      overflow="visible"
    >
      {mist ? (
        <g style={{ filter: "url(#spray-mist)" }} opacity={0.7}>
          <Mark />
        </g>
      ) : null}
      <g style={{ filter: "url(#spray-edge)" }}>
        <Mark />
      </g>
    </svg>
  );
}
