"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

export interface TrackPosition {
  progress: number;
  index: number;
  name: string;
}

/**
 * The `wide` variant from globals.css, expressed for JavaScript.
 *
 * Everywhere that decides "is this rendering sideways?" has to ask the same
 * way. A `window.innerWidth >= 1024` comparison is not the same test as a
 * `min-width: 1024px` media query — the query counts the classic scrollbar and
 * the property does not — so the two can disagree either side of the
 * breakpoint, leaving the code driving the layout in a different mode from the
 * layout itself.
 *
 * STACKED is the exact negation rather than `max-width: 1023px`. Browser zoom
 * produces fractional viewport widths, and at 1023.5px neither of those two
 * queries matched, so the page briefly had no position indicator at all.
 */
const WIDE = "(min-width: 1024px)";
const MOTION = "(prefers-reduced-motion: no-preference)";
const STACKED = `not all and ${WIDE}, (prefers-reduced-motion: reduce)`;

/**
 * The horizontal scroll mechanic.
 *
 * A viewport-height wrapper is pinned while the track inside it translates on
 * X, driven by ordinary vertical scroll. Both reference sites achieve their
 * horizontal feel by setting `overflow: hidden` and taking over the wheel
 * entirely; this does not. The document stays as tall as the track is wide,
 * so the native scrollbar, keyboard paging, find-in-page, and screen readers
 * all keep working — the page just happens to render sideways.
 *
 * Below the `lg` breakpoint, and whenever reduced motion is requested, none of
 * this runs and the stations stack vertically as a plain document.
 *
 * The track tween is handed back to children because any ScrollTrigger living
 * inside a horizontally-moving container needs it as `containerAnimation` —
 * without it, those triggers measure vertical position and fire at the wrong
 * time.
 */
export function HorizontalTrack({
  children,
  onPosition,
}: {
  children: (containerAnimation?: gsap.core.Tween) => ReactNode;
  onPosition?: (position: TrackPosition) => void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [tween, setTween] = useState<gsap.core.Tween | undefined>();

  useGSAP(
    () => {
      const el = track.current;
      const frame = wrapper.current;
      if (!el || !frame) return;

      /**
       * Report which station currently occupies the middle of the viewport.
       *
       * This deliberately works from layout offsets and scroll progress rather
       * than from `getBoundingClientRect`. With `scrub: 1` the track's
       * transform trails the scroll position by up to a second, so measuring
       * the live DOM inside `onUpdate` reads a position the user has already
       * left — the label would lag, and after scrolling stopped it would be
       * stranded on a stale value because no further updates fire.
       *
       * Offsets are unaffected by the transform, so this reports where the
       * track is heading, which is also what a reader expects a position
       * indicator to say.
       */
      const report = (progress: number) => {
        if (!onPosition) return;

        const stations = Array.from(
          el.querySelectorAll<HTMLElement>("[data-station]"),
        );
        if (!stations.length) return;

        // Cumulative widths rather than offsetLeft: the pinned wrapper can
        // become the offsetParent mid-flight, which shifts those values.
        let cursor = 0;
        const bounds = stations.map((station) => {
          const span = { start: cursor, size: station.offsetWidth };
          cursor += station.offsetWidth;
          return span;
        });

        const horizontal =
          window.matchMedia(WIDE).matches && !prefersReducedMotion();

        let index = 0;
        if (horizontal) {
          const distance = Math.max(0, el.scrollWidth - window.innerWidth);
          const centre = progress * distance + window.innerWidth / 2;
          bounds.forEach((span, i) => {
            if (centre >= span.start && centre < span.start + span.size) {
              index = i;
            }
          });
        } else {
          const centre = window.scrollY + window.innerHeight / 2;
          stations.forEach((station, i) => {
            const top = station.getBoundingClientRect().top + window.scrollY;
            if (centre >= top && centre < top + station.offsetHeight) index = i;
          });
        }

        onPosition({
          progress,
          index,
          name: stations[index]?.dataset.station ?? "",
        });
      };

      const mm = gsap.matchMedia();

      mm.add(
        { desktop: WIDE, motion: MOTION },
        (context) => {
          const { desktop, motion } = context.conditions as {
            desktop: boolean;
            motion: boolean;
          };
          if (!desktop || !motion) {
            gsap.set(el, { clearProps: "transform" });
            report(0);
            return;
          }

          const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);

          const scrollTween = gsap.to(el, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              pin: true,
              scrub: 1,
              start: "top top",
              // Scroll length equals horizontal travel, so a pixel of wheel is
              // a pixel of sideways movement. Any other ratio feels wrong.
              end: () => `+=${distance()}`,
              invalidateOnRefresh: true,
              onUpdate: (self) => report(self.progress),
              onRefresh: (self) => report(self.progress),
            },
          });

          setTween(scrollTween);
          return () => setTween(undefined);
        },
      );

      // Vertical layouts have no ScrollTrigger driving the rail, so they read
      // document scroll directly. Reduced-motion desktop visitors still see a
      // working position indicator this way.
      mm.add(
        STACKED,
        () => {
          const onScroll = () => {
            const max =
              document.documentElement.scrollHeight - window.innerHeight;
            report(max > 0 ? window.scrollY / max : 0);
          };
          onScroll();
          window.addEventListener("scroll", onScroll, { passive: true });
          return () => window.removeEventListener("scroll", onScroll);
        },
      );

      return () => mm.revert();
    },
    { scope: wrapper },
  );

  return (
    <div
      ref={wrapper}
      className="relative wide:h-screen wide:overflow-hidden"
    >
      <div
        ref={track}
        data-catalog
        className="flex w-full flex-col wide:w-max wide:flex-row"
      >
        {children(tween)}
      </div>
    </div>
  );
}
