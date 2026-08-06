"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

export type PanelTone = "paper" | "ink" | "red";

const TONES: Record<PanelTone, string> = {
  paper: "bg-paper text-ink",
  ink: "panel-ink bg-ink text-paper",
  red: "bg-red text-ink",
};

/**
 * A full-height panel on the horizontal track.
 *
 * The reference's panels appear to *cover* each other rather than slide along
 * beside each other. That effect does not come from the panels moving at
 * different speeds — they can't, they're in one track — it comes from each
 * panel's contents drifting against its own edges as it crosses the viewport.
 * The hard tonal boundary between neighbouring panels then reads as one
 * sliding over the other.
 *
 * Content drifts, illustrations drift further. Under reduced motion or on
 * mobile nothing drifts and these are simply stacked blocks.
 */
export function Panel({
  id,
  name,
  tone = "paper",
  width = "screen",
  containerAnimation,
  children,
  className = "",
  drift = 8,
}: {
  id: string;
  /**
   * Marks this panel as a station for the progress indicator. Omit for panels
   * that belong to a group counted as one station — the eight work panels are
   * one entry ("WORK"), not eight, and tagging each of them would make the
   * counter read 03/06 … 10/06.
   */
  name?: string;
  tone?: PanelTone;
  width?: "screen" | "auto";
  containerAnimation?: gsap.core.Tween;
  children: ReactNode;
  className?: string;
  /** Percent of its own width the content drifts across the crossing. */
  drift?: number;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerAnimation) return;
      const inner = root.current?.querySelector("[data-drift]");
      if (!inner) return;

      gsap.fromTo(
        inner,
        { xPercent: drift },
        {
          xPercent: -drift,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            containerAnimation,
            start: "left right",
            end: "right left",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );

      const deep = root.current?.querySelectorAll("[data-drift-deep]");
      if (deep?.length) {
        gsap.fromTo(
          deep,
          { xPercent: drift * 2.4 },
          {
            xPercent: -drift * 2.4,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              containerAnimation,
              start: "left right",
              end: "right left",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      }
    },
    { scope: root, dependencies: [containerAnimation, drift] },
  );

  return (
    <section
      ref={root}
      id={id}
      data-station={name || undefined}
      aria-label={name || undefined}
      className={`relative flex shrink-0 flex-col justify-center overflow-hidden ${
        TONES[tone]
      } ${
        width === "screen" ? "w-full wide:w-screen" : "w-full wide:w-auto"
      } min-h-[100svh] wide:h-screen wide:min-h-0 ${className}`}
    >
      {children}
    </section>
  );
}
