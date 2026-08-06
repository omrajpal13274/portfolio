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
    /**
     * Re-cuts the path to the list's real width so the scale stays 1:1, plus
     * one extra half-period past the end. The panel clips that tail, so the
     * line runs off its edge rather than stopping dead at the last entry —
     * which is what makes it read as carrying on into the next section.
     */
    const layout = () => {
      const width = el.getBoundingClientRect().width;
      if (!width || !svg) return;
      const span = width / experience.length;
      const full = width + span;
      svg.setAttribute("viewBox", `0 0 ${full} ${WAVE_HEIGHT}`);
      svg.style.width = `${full}px`;
      path.setAttribute("d", wavePath(experience.length + 1, span));
    };

    const update = () => {
      const rect = el.getBoundingClientRect();
      const horizontal = window.innerWidth >= 1024;

      // 0 as the list enters the viewport, 1 once it has fully crossed it.
      const travelled = horizontal
        ? window.innerWidth - rect.left
        : window.innerHeight - rect.top;
      const distance = horizontal
        ? window.innerWidth + rect.width
        : window.innerHeight + rect.height;

      // Mapped across the list's whole crossing: 0 as its leading edge enters,
      // 1 as its trailing edge leaves. An earlier 1.85x multiplier finished the
      // line at 82% before the list had even reached the left of the viewport,
      // so it was already complete for almost the entire time it was readable —
      // which looked like it was not animating at all. The small margin over 1
      // only stops it finishing exactly on the last pixel.
      const raw = distance > 0 ? travelled / distance : 0;
      const progress = Math.max(0, Math.min(1, raw * 1.12));

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
              <path
                ref={wave}
                fill="none"
                stroke="var(--color-red)"
                strokeWidth={6}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
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
