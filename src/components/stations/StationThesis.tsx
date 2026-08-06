"use client";

import { gsap, useGSAP, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { useInView } from "@/lib/useInView";
import { Panel } from "@/components/Panel";
import { Spray } from "@/components/Spray";
import type { SiteSettings } from "@/content/types";


export function StationThesis({
  settings,
  containerAnimation,
}: {
  settings: SiteSettings;
  containerAnimation?: gsap.core.Tween;
}) {
  const counts = settings.stats;
  const [root, seen] = useInView<HTMLDivElement>();

  useGSAP(
    () => {
      if (prefersReducedMotion() || !seen) return;
      const split = new SplitText(".thesis-copy", {
        type: "lines,words",
        linesClass: "overflow-hidden",
      });

      gsap.from(split.words, {
        yPercent: 115,
        duration: 0.85,
        stagger: 0.016,
        ease: "power4.out",
      });

      gsap.from(".count", {
        autoAlpha: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.15,
      });

      return () => split.revert();
    },
    { scope: root, dependencies: [seen] },
  );

  return (
    <Panel
      id="thesis"
      name="THESIS"
      tone="ink"
      containerAnimation={containerAnimation}
      className="px-6 py-24 sm:px-12 wide:py-0"
    >
      {/* Observed element and drift target kept separate — see StationProof. */}
      <div ref={root}>
        <div data-drift className="relative max-w-6xl">
        <blockquote className="display thesis-copy text-[8.5vw] leading-[0.95] wide:text-[4vw]">
          {settings.thesis}
        </blockquote>

        <div className="mt-16 flex flex-wrap gap-x-20 gap-y-10">
          {counts.map((count, i) => (
            <div key={count.label} className="count">
              <div className="relative inline-block text-[13vw] wide:text-[5vw]">
                {i === 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute -top-[0.28em] -right-[0.14em] -bottom-[0.26em] -left-[0.14em] block"
                  >
                    <Spray
                      kind="swipe"
                      delay={0.3}
                      className="h-full w-full"
                    />
                  </span>
                ) : null}
                <p
                  className={`display-tight relative text-[13vw] wide:text-[5vw] ${
                    i === 0 ? "px-[0.12em] text-paper" : ""
                  }`}
                >
                  {count.value}
                </p>
              </div>
              <p className="micro mt-1 uppercase opacity-60">{count.label}</p>
            </div>
          ))}

          </div>
        </div>
      </div>
    </Panel>
  );
}
