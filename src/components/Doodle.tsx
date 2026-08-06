"use client";

import { type JSX } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useInView } from "@/lib/useInView";
import type { DoodleKind } from "@/content/types";

/**
 * Hand-drawn line art, one per project.
 *
 * Deliberately rough: heavy uniform contours, wonky proportions, no gradients
 * or shading. The drawings carry the site's personality, so they must look
 * made rather than generated — anything neat reads as clip art here.
 *
 * The `boil` filter (see SprayDefs) jitters every line a few times a second,
 * which is what a rough animated loop does. That is why these read as GIFs
 * without any actually being loaded, and it applies equally to real artwork
 * dropped in later via the CMS.
 */

const L = {
  stroke: "currentColor",
  fill: "none",
  strokeWidth: 9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const HEAVY = { ...L, strokeWidth: 13 };

/**
 * The skull contour as a closed path. Exported because the splash clips a
 * rising fill to it — the head is the loading meter there, and sharing one
 * source of truth stops the fill and the outline from drifting apart.
 */
export const HEAD_SILHOUETTE =
  "M118 168 C112 96, 176 60, 226 66 C286 73, 316 122, 306 186 C300 232, 280 268, 240 282 C196 297, 148 274, 130 232 C124 216, 119 192, 118 168 Z";

export function Head() {
  return (
    <>
      {/* skull */}
      <path data-line d={HEAD_SILHOUETTE} {...HEAVY} />
      {/* spikes */}
      <path data-line d="M126 122 L96 62 L160 96" {...L} />
      <path data-line d="M172 86 L166 24 L214 74" {...L} />
      <path data-line d="M228 68 L252 16 L272 84" {...L} />
      {/* shades */}
      <path data-line d="M132 160 L302 148" {...L} />
      <ellipse data-fill cx={172} cy={175} rx={35} ry={26} fill="currentColor" />
      <ellipse data-fill cx={262} cy={168} rx={33} ry={25} fill="currentColor" />
      <path data-line d="M206 172 L228 170" {...L} />
      {/* headphones */}
      <path data-line d="M104 158 C96 74, 190 32, 268 48 C328 60, 356 112, 348 166" {...HEAVY} />
      <rect data-line x={72} y={150} width={44} height={78} rx={20} {...HEAVY} />
      <rect data-line x={336} y={148} width={44} height={78} rx={20} {...HEAVY} />
      {/* grin */}
      <path data-line d="M176 236 C206 262, 250 258, 272 230" {...L} />
      <path data-line d="M196 240 L200 254 M222 246 L224 260 M248 242 L250 254" {...L} />
      {/* neck */}
      <path data-line d="M186 290 L182 340 M262 282 L272 336" {...L} />
      <path data-line d="M140 348 C186 314, 268 312, 316 350" {...HEAVY} />
    </>
  );
}

function Stamp() {
  return (
    <>
      <path
        data-line
        d="M76 200 C76 130, 132 74, 202 76 C272 78, 326 134, 322 204 C318 274, 262 326, 194 322 C126 318, 76 268, 76 200 Z"
        {...HEAVY}
      />
      <path
        data-line
        d="M108 200 C108 148, 152 106, 202 108 C252 110, 292 152, 290 202 C288 254, 246 292, 196 290 C146 288, 108 250, 108 200 Z"
        {...L}
      />
      <path data-line d="M140 258 L266 142" {...HEAVY} />
      <path data-line d="M198 132 L210 164 L244 166 L218 188 L228 220 L198 202 L170 222 L178 188 L152 166 L186 162 Z" {...L} />
      {/* pressed-on double edge */}
      <path data-line d="M92 148 C118 96, 176 66, 232 72" {...L} opacity={0.55} />
      <path data-line d="M312 250 C288 300, 238 328, 186 326" {...L} opacity={0.55} />
    </>
  );
}

function Eye() {
  return (
    <>
      <path
        data-line
        d="M44 202 C104 118, 300 118, 358 202 C300 288, 104 288, 44 202 Z"
        {...HEAVY}
      />
      <circle data-line cx={201} cy={202} r={62} {...HEAVY} />
      <circle data-fill cx={201} cy={202} r={31} fill="currentColor" />
      <circle data-fill cx={216} cy={188} r={9} fill="#fff" />
      {/* lashes */}
      <path data-line d="M78 148 L58 108 M136 118 L126 74 M201 106 L201 62 M266 118 L278 76 M324 150 L346 112" {...L} />
      {/* brow */}
      <path data-line d="M62 70 C140 26, 262 26, 340 70" {...HEAVY} />
    </>
  );
}

function Megaphone() {
  return (
    <>
      <path data-line d="M56 156 L56 246 L124 262 L124 140 Z" {...HEAVY} />
      <path data-line d="M124 140 L288 70 L288 332 L124 262 Z" {...HEAVY} />
      <path data-line d="M74 250 L88 330 L128 326 L118 258" {...L} />
      <path data-line d="M312 128 C348 158, 348 244, 312 274" {...L} />
      <path data-line d="M340 96 C396 142, 396 260, 340 306" {...L} />
      <path data-line d="M288 190 L326 190" {...L} />
    </>
  );
}

function Ghost() {
  return (
    <>
      <path
        data-line
        d="M84 330 L84 178 C84 108, 138 58, 204 58 C270 58, 322 108, 322 178 L322 330 L286 296 L250 330 L214 296 L178 330 L142 296 Z"
        {...HEAVY}
      />
      <ellipse data-fill cx={158} cy={166} rx={19} ry={26} fill="currentColor" />
      <ellipse data-fill cx={250} cy={166} rx={19} ry={26} fill="currentColor" />
      <path data-line d="M166 232 C192 258, 224 256, 244 230" {...L} />
      {/* query beams */}
      <path data-line d="M40 96 L14 66 M368 96 L394 66 M204 30 L204 0" {...L} opacity={0.6} />
    </>
  );
}

function Brain() {
  return (
    <>
      <path
        data-line
        d="M196 82 C158 54, 106 68, 96 112 C58 122, 50 172, 82 196 C56 226, 74 278, 116 282 C126 322, 178 334, 200 304"
        {...HEAVY}
      />
      <path
        data-line
        d="M204 82 C242 54, 296 68, 306 112 C344 122, 352 172, 320 196 C346 226, 328 278, 286 282 C276 322, 224 334, 202 304"
        {...HEAVY}
      />
      <path data-line d="M200 96 L200 306" {...L} />
      <path data-line d="M148 128 C176 140, 172 176, 144 184 C170 198, 168 232, 142 240" {...L} />
      <path data-line d="M252 128 C224 140, 228 176, 256 184 C230 198, 232 232, 258 240" {...L} />
    </>
  );
}

function Box() {
  return (
    <>
      <path data-line d="M62 148 L200 96 L338 148 L338 300 L200 352 L62 300 Z" {...HEAVY} />
      <path data-line d="M62 148 L200 200 L338 148" {...HEAVY} />
      <path data-line d="M200 200 L200 352" {...HEAVY} />
      {/* tape */}
      <path data-line d="M132 122 L132 274" {...L} />
      <path data-line d="M268 122 L268 274" {...L} />
      {/* speed lines */}
      <path data-line d="M24 208 L4 208 M34 246 L8 246 M28 170 L2 170" {...L} opacity={0.7} />
    </>
  );
}

function Arm() {
  return (
    <>
      <path data-line d="M92 344 L212 344 L212 300 L92 300 Z" {...HEAVY} />
      <path data-line d="M110 344 L92 372 M194 344 L212 372" {...L} />
      <circle data-line cx={152} cy={300} r={26} {...HEAVY} />
      <path data-line d="M152 300 L236 168" {...HEAVY} />
      <circle data-line cx={236} cy={168} r={22} {...HEAVY} />
      <path data-line d="M236 168 L340 196" {...HEAVY} />
      <circle data-line cx={340} cy={196} r={17} {...L} />
      <path data-line d="M340 196 L372 146" {...L} />
      <path data-line d="M372 146 L396 130 M372 146 L390 174" {...L} />
      {/* arc of travel */}
      <path data-line d="M152 214 C196 158, 274 152, 330 190" {...L} opacity={0.5} strokeDasharray="4 18" />
    </>
  );
}

/**
 * The can body as a closed path, used by the splash to clip its rising fill.
 *
 * Kept out of `DoodleKind` on purpose: this is the loader's own illustration,
 * not one a project can be assigned. Using the site's own instrument as the
 * loading meter means the splash is literally the can filling before anything
 * gets sprayed — and it keeps the hero's character unspent until the hero.
 */
export const CAN_SILHOUETTE =
  "M182 40 L218 40 L218 76 L236 78 C254 82, 266 98, 269 118 L274 156 L274 330 C274 350, 258 364, 238 364 L162 364 C142 364, 126 350, 126 330 L126 156 L131 118 C134 98, 146 82, 164 78 L182 76 Z";

export function SprayCan() {
  return (
    <>
      {/* body + nozzle, one continuous contour */}
      <path data-line d={CAN_SILHOUETTE} {...HEAVY} />
      {/* cap seam */}
      <path data-line d="M131 122 C168 112, 232 112, 269 122" {...L} />
      {/* label band */}
      <path data-line d="M128 188 C168 180, 232 180, 272 188" {...L} />
      <path data-line d="M128 262 C168 254, 232 254, 272 262" {...L} />
      {/* a mark on the label, because every can on this site has one */}
      <path data-line d="M168 212 L232 240 M232 212 L168 240" {...L} />
      {/* nozzle button */}
      <path data-line d="M178 40 L222 40" {...HEAVY} />
      {/* the spray itself */}
      <path
        data-line
        d="M236 34 C258 22, 286 20, 306 28"
        {...L}
        opacity={0.75}
      />
      <path data-line d="M244 56 C268 50, 296 52, 314 62" {...L} opacity={0.6} />
      <path data-line d="M330 16 L344 10 M336 44 L352 44 M330 70 L346 78" {...L} opacity={0.5} />
    </>
  );
}

const DOODLES: Record<DoodleKind, () => JSX.Element> = {
  head: Head,
  stamp: Stamp,
  eye: Eye,
  megaphone: Megaphone,
  ghost: Ghost,
  brain: Brain,
  box: Box,
  arm: Arm,
};

export function Doodle({
  kind,
  className,
  animate = true,
}: {
  kind: DoodleKind;
  className?: string;
  animate?: boolean;
}) {
  const [ref, seen] = useInView<SVGSVGElement>();
  const Drawing = DOODLES[kind] ?? DOODLES.head;

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !animate || !seen) return;

      const lines = root.querySelectorAll("[data-line]");
      const fills = root.querySelectorAll("[data-fill]");

      if (prefersReducedMotion()) {
        gsap.set(lines, { drawSVG: "100%" });
        gsap.set(fills, { autoAlpha: 1 });
        return;
      }

      const tl = gsap.timeline();

      tl.fromTo(
        lines,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.7, stagger: 0.045, ease: "power2.inOut" },
        0,
      ).fromTo(
        fills,
        { autoAlpha: 0, scale: 0.6, transformOrigin: "center" },
        { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: "back.out(2)" },
        0.3,
      );
    },
    { scope: ref, dependencies: [seen, kind, animate] },
  );

  return (
    <svg
      ref={ref}
      viewBox="0 0 400 400"
      aria-hidden="true"
      className={`boil ${className ?? ""}`}
      style={{ filter: "url(#boil)" }}
      preserveAspectRatio="xMidYMid meet"
    >
      <Drawing />
    </svg>
  );
}
