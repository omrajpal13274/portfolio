"use client";

import Link from "next/link";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useInView } from "@/lib/useInView";
import { Panel } from "@/components/Panel";
import { Spray } from "@/components/Spray";
import type { Award } from "@/content/types";

/**
 * Achievements.
 *
 * Deliberately not a second pass over the work. Each entry leads with the one
 * number worth reading from across the room and, where it recognises a
 * project, links back to it rather than restating what that project was — the
 * project panels already carry their own award badge.
 */
export function StationProof({
  awards,
  containerAnimation,
}: {
  awards: Award[];
  containerAnimation?: gsap.core.Tween;
}) {
  const [root, seen] = useInView<HTMLDivElement>();

  useGSAP(
    () => {
      if (prefersReducedMotion() || !seen) return;
      gsap.from(".proof-item", {
        autoAlpha: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.09,
        ease: "power3.out",
      });
    },
    { scope: root, dependencies: [seen] },
  );

  return (
    <Panel
      id="proof"
      name="ACHIEVEMENTS"
      tone="ink"
      width="auto"
      containerAnimation={containerAnimation}
      drift={4}
      className="px-6 py-24 sm:px-12 wide:py-0"
    >
      {/* Observed element and drifting element kept separate: the parallax
          tween animates `[data-drift]`, so observing that same node would
          measure something that is itself moving. */}
      <div ref={root}>
        <div data-drift>
        <div className="relative mb-14 inline-block">
          <p className="micro uppercase opacity-50">Recognition</p>
          <h2 className="display-tight mt-4 text-[13vw] wide:text-[6vw]">
            Achievements
          </h2>
          <Spray
            kind="underline"
            className="absolute -bottom-[14%] left-0 h-[26%] w-[70%]"
          />
        </div>

        <ul className="flex flex-col gap-16 wide:flex-row wide:gap-0">
          {awards.map((award) => (
            <li
              key={award.title}
              className="proof-item relative flex w-full shrink-0 flex-col wide:w-[25rem] wide:border-l-[3px] wide:border-paper/25 wide:pl-12 wide:first:border-l-0 wide:first:pl-0"
            >
              {/* The metric was previously set at 6vw, which rendered "$5,000"
                  exactly as wide as its own column — running edge-to-edge into
                  the next one with a sprayed blob layered on top. Numbers are
                  the thing being read here, so they get room instead of scale. */}
              {award.metric ? (
                <p className="metric display-tight text-[15vw] leading-none wide:text-[4.2vw]">
                  {award.metric}
                </p>
              ) : null}
              <p className="micro mt-3 uppercase opacity-60">
                {award.metricLabel}
              </p>

              <h3 className="display mt-10 text-xl leading-tight">
                {award.title}
              </h3>
              <p className="micro mt-2 text-red uppercase">
                {award.org} &middot; {award.year}
              </p>
              <p className="mt-4 max-w-[19rem] text-sm leading-relaxed opacity-60">
                {award.detail}
              </p>

              {award.projectSlug ? (
                <Link
                  href={`/work/${award.projectSlug}`}
                  className="micro mt-6 inline-flex w-fit items-center gap-2 uppercase link-underline"
                >
                  See the project
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              ) : null}
            </li>
          ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}
