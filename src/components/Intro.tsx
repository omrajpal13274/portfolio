"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { SprayCan, CAN_SILHOUETTE } from "./Doodle";
import { openIntroGate } from "@/lib/introGate";

const SEEN_KEY = "om:boot-seen";
const SLATS = 6;

/**
 * The splash.
 *
 * The drawing is the loading meter. Red floods up inside the skull as the page
 * loads and is full at 100 — which is why there is no progress bar underneath:
 * two meters for one number is one too many, and a bar would be the generic
 * half of the pair. The site's grammar is red as applied paint, so a loader
 * that fills with paint is the one this site can have and no other can.
 *
 * The name is deliberately absent. It lands three seconds later at the top of
 * the site, and showing it twice spends the reveal before the site can make it.
 *
 * The number tracks real loading: it climbs to 92 under its own steam, then
 * waits on fonts and window `load`. A floor keeps the sequence from flashing
 * past on a warm cache; a ceiling keeps a slow asset from trapping anyone.
 *
 * Shown once per browser session — decided before first paint by a class on
 * <html>, not by React state, so there is no hydration mismatch and no flash.
 */
export function Intro({ name, role }: { name: string; role: string }) {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const flood = useRef<SVGRectElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  const finish = () => {
    sessionStorage.setItem(SEEN_KEY, "1");
    // Release the first screen, which has been holding its entrance so it does
    // not play behind the sheet.
    openIntroGate();
    setDone(true);
  };

  useGSAP(
    () => {
      if (done) return;

      if (
        document.documentElement.classList.contains("boot-seen") ||
        prefersReducedMotion()
      ) {
        finish();
        return;
      }

      const loaded = Promise.race([
        Promise.all([
          document.fonts?.ready ?? Promise.resolve(),
          document.readyState === "complete"
            ? Promise.resolve()
            : new Promise((r) =>
                window.addEventListener("load", r, { once: true }),
              ),
        ]),
        new Promise((r) => setTimeout(r, 3500)),
      ]);

      const ready = Promise.all([
        loaded,
        new Promise((r) => setTimeout(r, 1800)),
      ]);

      const progress = { value: 0 };

      const write = () => {
        if (counter.current) {
          counter.current.textContent = String(
            Math.round(progress.value),
          ).padStart(3, "0");
        }
        // The artwork is a 400-unit square, so the paint line is simply the
        // complement of progress in that space.
        if (flood.current) {
          flood.current.setAttribute(
            "y",
            String(400 - (progress.value / 100) * 400),
          );
        }
      };

      const tl = gsap.timeline();
      timeline.current = tl;

      tl.from(".intro-meta", {
        autoAlpha: 0,
        y: 12,
        duration: 0.4,
        stagger: 0.07,
      })
        // The head draws itself before it starts filling — you watch it get
        // made, then watch it fill.
        .fromTo(
          ".intro-can [data-line]",
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            duration: 0.75,
            stagger: 0.03,
            ease: "power2.inOut",
          },
          0,
        )
        .fromTo(
          ".intro-can [data-fill]",
          { autoAlpha: 0, scale: 0.7, transformOrigin: "center" },
          { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.06 },
          0.5,
        )
        .from(
          ".intro-count",
          { yPercent: 26, autoAlpha: 0, duration: 0.7, ease: "power4.out" },
          0.1,
        )
        .to(
          progress,
          { value: 92, duration: 1.6, ease: "power2.out", onUpdate: write },
          0.35,
        );

      ready.then(() => {
        const out = gsap.timeline({ onComplete: finish });
        out
          .to(progress, {
            value: 100,
            duration: 0.45,
            ease: "power2.inOut",
            onUpdate: write,
          })
          .to(
            ".intro-content",
            { autoAlpha: 0, y: -30, duration: 0.35, ease: "power2.in" },
            "+=0.25",
          )
          .to(
            ".intro-slat",
            {
              yPercent: -101,
              duration: 0.8,
              stagger: 0.06,
              ease: "power4.inOut",
            },
            "-=0.1",
          );
        timeline.current = out;
      });
    },
    { scope: root, dependencies: [done] },
  );

  if (done) return null;

  return (
    <div ref={root} data-boot className="fixed inset-0 z-[200] overflow-hidden">
      {/* The sheet, in slats that lift on a stagger. */}
      <div aria-hidden="true" className="absolute inset-0 flex">
        {Array.from({ length: SLATS }, (_, i) => (
          <div key={i} className="intro-slat h-full flex-1 bg-paper" />
        ))}
      </div>

      <div className="intro-content absolute inset-0 flex flex-col justify-between px-6 py-8 sm:px-12 sm:py-10">
        <div className="flex items-start justify-between gap-6">
          <p className="micro intro-meta uppercase">{role}</p>
          <p className="micro intro-meta uppercase opacity-50">
            Portfolio &rsquo;26
          </p>
        </div>

        <div className="flex items-end justify-between gap-6">
          <button
            type="button"
            onClick={() => {
              timeline.current?.kill();
              finish();
            }}
            className="micro intro-meta mb-2 uppercase link-underline"
          >
            Skip
          </button>
        </div>
      </div>

      {/* The meter. Centred on mobile, held left of the count on wide screens. */}
      <div
        aria-hidden="true"
        className="intro-content pointer-events-none absolute top-1/2 left-1/2 h-[44vh] w-[72vw] -translate-x-1/2 -translate-y-[62%] sm:left-[7vw] sm:h-[68vh] sm:w-[38vw] sm:translate-x-0 sm:-translate-y-1/2"
      >
        <svg
          viewBox="0 0 400 400"
          className="intro-can boil h-full w-full text-ink"
          style={{ filter: "url(#boil)" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <clipPath id="intro-can-clip">
              <path d={CAN_SILHOUETTE} />
            </clipPath>
          </defs>
          <rect
            ref={flood}
            x="0"
            y="400"
            width="400"
            height="400"
            fill="var(--color-red)"
            clipPath="url(#intro-can-clip)"
          />
          <SprayCan />
        </svg>
      </div>

      {/* Sits hard into the corner but stays whole. Headlines on this site are
          allowed to crop; the count is not — a clipped digit is an unreadable
          number, which is the one thing this screen exists to show. */}
      <p className="intro-count intro-content display-tight pointer-events-none absolute right-[4vw] bottom-[3vh] pb-[0.1em] text-[26vw] leading-[0.72] tabular-nums sm:right-[5vw] sm:bottom-[4vh] sm:text-[21vw]">
        <span ref={counter}>000</span>
      </p>

      <span className="sr-only">Loading {name}&rsquo;s portfolio</span>
    </div>
  );
}
