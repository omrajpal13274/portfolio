"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { Panel } from "@/components/Panel";
import { Artwork } from "@/components/Artwork";
import { Spray } from "@/components/Spray";
import { useWordmarkTransition } from "@/components/PageTransition";
import type { Project } from "@/content/types";

/**
 * The catalog.
 *
 * Opens with a title panel, then a strip of narrow columns — one per project —
 * each showing only its name, set vertically. Hovering a column expands it and
 * brings its detail forward; the rest recede. Because the columns share a fixed
 * total width and only redistribute it (see `.work-strip` in globals.css), the
 * track's scrollWidth never changes, which keeps the pinned ScrollTrigger's
 * cached end distance valid.
 *
 * Projects that won something carry the win here, on the work. The achievements
 * section then summarises recognition instead of listing the same projects
 * twice.
 */

/**
 * Wordmark size, stepped down by title length.
 *
 * Rotated text turns its rendered width into vertical height, so a long name at
 * a fixed size runs off the top of the column. Stepping the size keeps every
 * name inside the same optical envelope regardless of length.
 */
function wordmarkSize(title: string): number {
  const n = title.length;
  if (n <= 4) return 8.6;
  if (n <= 6) return 7.2;
  if (n <= 8) return 6.2;
  if (n <= 10) return 5.2;
  return 4.4;
}

export function StationWork({
  projects,
  workIntro,
  containerAnimation,
}: {
  projects: Project[];
  workIntro: string;
  containerAnimation?: gsap.core.Tween;
}) {
  const { launch } = useWordmarkTransition();

  return (
    <div
      id="work"
      data-station="WORK"
      className="flex w-full shrink-0 flex-col wide:w-auto wide:flex-row"
    >
      <Panel
        id="work-opener"
        tone="paper"
        width="auto"
        containerAnimation={containerAnimation}
        drift={6}
        className="wide:w-[42vw] px-6 py-24 sm:px-12 wide:py-0"
      >
        <div data-drift className="relative">
          <p className="micro uppercase opacity-50">
            {String(projects.length).padStart(2, "0")} projects
          </p>
          <div className="relative mt-5 inline-block">
            <h2 className="display-tight text-[17vw] wide:text-[8.5vw]">
              Selected
              <br />
              work
            </h2>
            <Spray
              kind="underline"
              className="absolute -bottom-[6%] left-0 h-[22%] w-[86%]"
            />
          </div>
          <p className="display mt-10 max-w-md text-xl leading-tight">
            {workIntro}
          </p>
          <p className="micro mt-8 uppercase opacity-50">
            Hover a column to open it
          </p>
        </div>
      </Panel>

      <div
        className="work-strip"
        style={{ "--strip-width": `${projects.length * 21}vw` } as CSSProperties}
      >
        {projects.map((project, index) => {
          const href = `/work/${project.slug}`;
          const restricted = project.status === "restricted";
          const dark = index % 2 === 0;

          return (
            <article
              key={project.slug}
              className={`work-col group relative overflow-hidden border-ink-line px-6 py-20 sm:px-10 wide:h-screen wide:px-0 wide:py-0 ${
                dark
                  ? "panel-ink bg-ink text-paper"
                  : "bg-paper text-ink border-l border-ink/15"
              }`}
            >
              {/* Column header: index only when narrow — an organisation name
                  cannot fit a collapsed column and would wrap into noise. */}
              <div className="work-fade relative flex items-baseline gap-4 wide:absolute wide:top-10 wide:left-8 wide:z-20">
                <span className="micro tabular-nums opacity-60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {restricted ? (
                  <span className="micro text-red uppercase wide:hidden">
                    Restricted
                  </span>
                ) : null}
              </div>

              {/* The name. In flow on mobile; on the track it is centred in
                  the column and slides aside as the column opens (see
                  `.work-name` in globals.css). */}
              <div className="work-name relative mt-6 wide:mt-0">
                <Link
                  href={href}
                  data-wordmark
                  onClick={(event) => {
                    event.preventDefault();
                    launch(event.currentTarget, href);
                  }}
                  style={
                    {
                      "--wm": `${wordmarkSize(project.title)}vw`,
                    } as CSSProperties
                  }
                  className="wordmark-rotated display-tight inline-block text-[14vw] whitespace-nowrap transition-colors duration-300 group-hover:text-red focus-visible:outline-none wide:text-[length:var(--wm)]"
                >
                  {project.title}
                </Link>
              </div>

              {/* Detail — always present on mobile, revealed on hover/focus on
                  the track. Offset clears the vertical wordmark. */}
              <div className="work-detail work-fade relative mt-8 wide:z-10 wide:mt-0">
                <p className="micro uppercase opacity-50">{project.org}</p>

                {project.award ? (
                  <p className="micro mt-4 block w-fit bg-red px-3 py-2 text-paper uppercase">
                    {project.award}
                  </p>
                ) : null}

                <div className="relative mt-5 inline-block">
                  <p className="display max-w-md text-xl leading-tight wide:text-2xl">
                    {project.tagline}
                  </p>
                  <Spray
                    kind="underline"
                    className="pointer-events-none absolute -bottom-[18%] left-0 h-[34%] w-[62%]"
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <p className="micro uppercase opacity-50">{project.period}</p>
                  {restricted ? (
                    <p className="micro text-red uppercase">Source restricted</p>
                  ) : null}
                </div>

                {/* Bordered and self-contained, so the one thing you can act on
                    reads as a target instead of another line of small caps. */}
                <Link
                  href={href}
                  onClick={(event) => {
                    // Fly the column's own wordmark, so opening from the button
                    // and opening from the name are the same move. Without this
                    // the button navigated flat while the name animated.
                    const mark = event.currentTarget
                      .closest("article")
                      ?.querySelector<HTMLElement>("[data-wordmark]");
                    if (!mark) return;
                    event.preventDefault();
                    launch(mark, href);
                  }}
                  className={`open-cta micro mt-7 inline-flex items-center gap-4 border-2 px-5 py-3 uppercase ${
                    dark ? "border-paper" : "border-ink"
                  }`}
                >
                  Open project
                  <span
                    aria-hidden="true"
                    className="open-arrow inline-block"
                  >
                    &rarr;
                  </span>
                </Link>
              </div>

              <div
                data-drift-deep
                className="work-fade pointer-events-none absolute right-6 bottom-8 z-0 h-[26%] w-[34%] wide:top-[4%] wide:right-8 wide:bottom-auto wide:h-[20%] wide:w-[24%]"
              >
                <Artwork
                  project={project}
                  className="h-full w-full"
                  sizes="(min-width: 1024px) 24vw, 34vw"
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
