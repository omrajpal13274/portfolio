"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Artwork } from "./Artwork";
import {
  announceArrival,
  consumePendingTraverse,
  WORDMARK_LANDED,
} from "./PageTransition";
import { gsap, useGSAP, SplitText, prefersReducedMotion } from "@/lib/gsap";
import type { Project } from "@/content/types";

/**
 * A project page.
 *
 * Built as a run of full-bleed bands rather than one scrolling column, which
 * is the same grammar as the catalogue — ink for the arrival, paper for the
 * long-form middle, red for the payoff, ink again to send you onward. A single
 * white page under a white catalogue read as a document instead of part of
 * this site.
 *
 * Problem / built / outcome are numbered because they genuinely are a
 * sequence. Nothing else on the page is numbered, because nothing else is.
 */

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="reveal flex flex-col gap-1 border-t-[3px] border-ink py-5 sm:flex-row sm:gap-10">
      <dt className="micro uppercase opacity-50 sm:w-36 sm:shrink-0 sm:pt-1">
        {label}
      </dt>
      <dd className="text-lg font-medium">{children}</dd>
    </div>
  );
}

function Chapter({
  index,
  heading,
  paragraphs,
}: {
  index: number;
  heading: string;
  paragraphs: string[];
}) {
  if (!paragraphs?.length) return null;
  return (
    <section className="reveal grid gap-6 border-t-[3px] border-ink pt-6 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-12">
      <h2 className="micro flex items-baseline gap-3 uppercase">
        <span className="text-red tabular-nums">
          {String(index).padStart(2, "0")}
        </span>
        <span className="opacity-50">{heading}</span>
      </h2>
      <div className="max-w-2xl space-y-6">
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-lg leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

export function ProjectView({
  project,
  index,
  total,
  previous,
  next,
}: {
  project: Project;
  index: number;
  total: number;
  previous?: Project;
  next?: Project;
}) {
  const root = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  // True only when arriving via the catalogue traverse. False on a direct load,
  // so the server-rendered title is visible and never depends on JavaScript.
  const [masked] = useState(() => consumePendingTraverse());
  /**
   * Arriving through the traverse, this page is built behind an ink curtain.
   * Running the entrance on mount would spend it unseen, so it waits for the
   * curtain to clear. A direct load has no curtain and starts immediately.
   */
  const [ready, setReady] = useState(!masked);
  const restricted = project.status === "restricted";
  const pad = (n: number) => String(n).padStart(2, "0");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (title.current) announceArrival(title.current);
  }, []);

  useEffect(() => {
    if (ready) return;
    const go = () => setReady(true);
    window.addEventListener(WORDMARK_LANDED, go);
    // Never let a missed event leave the page permanently blank.
    const failsafe = window.setTimeout(go, 3000);
    return () => {
      window.removeEventListener(WORDMARK_LANDED, go);
      window.clearTimeout(failsafe);
    };
  }, [ready]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      /**
       * Hidden from the first frame, not from the first frame of the
       * animation. Arriving through the traverse, this page is built while
       * the curtain is still down, so anything left at its natural state is
       * briefly visible as the curtain passes and is then yanked back to its
       * start state when the entrance runs. `gsap.from` sets that start state
       * the moment it is called, which is exactly too late.
       */
      if (!ready) {
        gsap.set([".lede", ".hero-line", ".reveal"], { autoAlpha: 0 });
        return;
      }

      // Under the traverse this fires as the uncover begins, so the page
      // composes itself into the wipe rather than after it.
      const start = masked ? 0.24 : 0.2;

      const split = new SplitText(".lede", { type: "lines" });
      gsap.set(".lede", { autoAlpha: 1 });

      // fromTo, not from: these are already at zero opacity, and `from` would
      // read that as the value to animate towards and play 0 to 0.
      gsap.fromTo(
        split.lines,
        { yPercent: 60, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.07,
          ease: "power3.out",
          delay: start,
        },
      );

      gsap.fromTo(
        ".hero-line",
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.07,
          ease: "power3.out",
          delay: Math.max(0, start - 0.1),
        },
      );

      gsap.fromTo(
        ".reveal",
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power3.out",
          delay: start + 0.15,
        },
      );

      return () => split.revert();
    },
    { scope: root, dependencies: [masked, ready] },
  );

  return (
    <div ref={root} className="relative min-h-screen bg-paper text-ink">
      {/* ── 1. Arrival ─────────────────────────────────────────────────── */}
      <header className="panel-ink relative overflow-hidden bg-ink text-paper">
        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-8 pb-20 sm:px-10">
          <div className="hero-line flex items-center justify-between gap-6">
            <Link
              href="/#work"
              className="micro inline-flex items-center gap-3 uppercase link-underline"
            >
              <span aria-hidden="true">&larr;</span>
              <span
                aria-hidden="true"
                className="inline-block h-px w-10 bg-current"
              />
              Catalog
            </Link>
            <p className="micro tabular-nums uppercase">
              <span className="text-red">{pad(index + 1)}</span>
              <span className="opacity-40">/{pad(total)}</span>
            </p>
          </div>

          <p className="micro hero-line mt-16 uppercase opacity-50">
            {project.org}
          </p>

          <h1
            ref={title}
            className="display-tight mt-4 pb-[0.06em] text-[15vw] whitespace-nowrap lg:text-[8.5vw]"
            style={masked ? { visibility: "hidden" } : undefined}
          >
            {project.title}
          </h1>

          {project.award ? (
            <p className="micro hero-line mt-6 block w-fit bg-red px-3 py-2 text-paper uppercase">
              {project.award}
            </p>
          ) : null}

          <p className="lede display mt-8 max-w-3xl text-2xl leading-tight sm:text-4xl">
            {project.tagline}
          </p>
        </div>

        {/* Big, and cropped by the band — the drawings carry this site, so on
            the page about one project its own drawing gets to be loud. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[4vw] -bottom-[22%] hidden h-[150%] w-[34%] opacity-40 lg:block"
        >
          <Artwork
            project={project}
            className="h-full w-full"
            sizes="(min-width: 1024px) 34vw, 0px"
          />
        </div>
      </header>

      {/* ── 2. The middle ──────────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-6xl px-6 pb-24 sm:px-10">
        {restricted ? (
          <div className="reveal relative mt-14 max-w-2xl">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1.5 bg-red"
            />
            <div className="pl-7">
              <p className="micro text-red uppercase">Source restricted</p>
              <p className="mt-3 text-base leading-relaxed">
                {project.restrictionNote}
              </p>
            </div>
          </div>
        ) : null}

        <dl className="mt-16">
          <Spec label="Role">{project.role}</Spec>
          <Spec label="Period">{project.period}</Spec>
          <Spec label="Status">
            <span className={restricted ? "text-red" : undefined}>
              {restricted ? "Restricted" : "Shipped"}
            </span>
          </Spec>
          <Spec label="Stack">
            <span className="flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="chip micro border border-ink/25 px-2.5 py-1 uppercase"
                >
                  {item}
                </span>
              ))}
            </span>
          </Spec>
        </dl>

        <div className="mt-24 space-y-16">
          <Chapter index={1} heading="The problem" paragraphs={project.problem} />
          <Chapter index={2} heading="What I built" paragraphs={project.build} />
        </div>
      </div>

      {/* ── 3. The payoff ──────────────────────────────────────────────── */}
      {project.outcome?.length ? (
        <section className="relative overflow-hidden bg-red text-ink">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
            <h2 className="micro flex items-baseline gap-3 uppercase">
              <span className="tabular-nums">03</span>
              <span className="opacity-60">Outcome</span>
            </h2>
            <div className="mt-8 max-w-4xl space-y-6">
              {project.outcome.map((paragraph) => (
                <p
                  key={paragraph}
                  className="display text-2xl leading-tight sm:text-4xl"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {project.links.length ? (
              <div className="mt-14 flex flex-wrap gap-10 border-t-[3px] border-ink pt-8">
                {project.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="micro group flex items-center gap-3 uppercase link-underline"
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── 4. Onward ──────────────────────────────────────────────────── */}
      <nav className="panel-ink relative bg-ink text-paper">
        {/* Laid out from what exists rather than from a fixed two-column grid.
            The first and last projects have only one neighbour, and the grid
            left an empty half with a rule hanging in it. */}
        <div
          className={`mx-auto flex max-w-6xl flex-col gap-px px-6 py-14 sm:px-10 lg:flex-row ${
            previous && next ? "lg:justify-between" : "lg:justify-start"
          }`}
        >
          {previous ? (
            <Link
              href={`/work/${previous.slug}`}
              className="group block py-6 lg:pr-12"
            >
              <span className="micro uppercase opacity-50">&larr; Previous</span>
              <span className="display-tight mt-3 block text-4xl transition-colors group-hover:text-red sm:text-5xl">
                {previous.title}
              </span>
            </Link>
          ) : null}

          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className={`group block py-6 lg:text-right ${
                previous
                  ? "border-t border-paper/20 lg:border-t-0 lg:border-l lg:pl-12"
                  : ""
              }`}
            >
              <span className="micro uppercase opacity-50">Next &rarr;</span>
              <span className="display-tight mt-3 block text-4xl transition-colors group-hover:text-red sm:text-5xl">
                {next.title}
              </span>
            </Link>
          ) : null}
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-14 sm:px-10">
          <Link
            href="/#work"
            className="micro inline-flex items-center gap-3 uppercase link-underline"
          >
            <span aria-hidden="true">&larr;</span> All projects
          </Link>
        </div>
      </nav>
    </div>
  );
}
