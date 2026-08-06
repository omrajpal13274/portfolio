"use client";

import { useEffect } from "react";
import { Doodle } from "@/components/Doodle";
import { Spray } from "@/components/Spray";
import { SprayDefs } from "@/components/SprayDefs";

/**
 * Last resort for an unhandled client error.
 *
 * A CMS outage cannot reach this — those are caught in src/content and fall
 * back to seed content. What lands here is a genuine runtime fault, which on a
 * site this animation-heavy most often means a component threw during a GSAP
 * callback. Reset re-renders the segment, which is usually enough.
 *
 * Treated as the redaction stamp rather than the 404's strike: something is
 * being withheld because it broke, not because it is missing. Deliberately a
 * different mark from the 404 so the two are distinguishable at a glance.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <>
      <SprayDefs />
      <main className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-ink px-6 py-8 text-paper sm:px-12">
        <div className="flex items-center justify-between gap-6">
          <p className="micro uppercase opacity-50">Om Rajpal</p>
          <p className="micro uppercase text-red">Fault</p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-[-4vw] hidden h-[64vh] w-[38vw] -translate-y-1/2 opacity-25 lg:block"
        >
          <Doodle kind="brain" className="h-full w-full" />
        </div>

        <div className="relative z-10">
          <div className="relative inline-block">
            <h1 className="display-tight text-[19vw] leading-[0.78] sm:text-[13vw] lg:text-[9vw]">
              Something
              <br />
              broke
            </h1>
            {/* Parked in the gap the short second line leaves, so it reads as
                a mark struck beside the words rather than a glyph obscured by
                one. Both the block and the gap scale with the font size, so
                the placement holds across viewports. */}
            <Spray
              kind="cross"
              className="pointer-events-none absolute top-[52%] left-[63%] h-[42%] w-[24%]"
            />
          </div>

          <p className="mt-7 max-w-md text-base leading-relaxed opacity-60">
            An unexpected error stopped this page rendering. Reloading clears it
            more often than not.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={reset}
              className="open-cta micro inline-flex items-center gap-4 border-2 border-paper px-5 py-3 uppercase"
            >
              Try again
              <span aria-hidden="true">&rarr;</span>
            </button>
            {/* A plain anchor, not next/link, on purpose: a soft navigation
                keeps the same React tree that just threw. A full load is the
                thing most likely to actually recover. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="micro inline-flex items-center gap-4 border-2 border-paper/40 px-5 py-3 uppercase"
            >
              Back to the catalog
            </a>
          </div>
        </div>

        {/* The digest is the only handle on a production stack trace, which is
            stripped from the client. Worth showing if someone reports it. */}
        <p className="micro uppercase opacity-40">
          {error.digest ? `Reference ${error.digest}` : "omrajpal.in"}
        </p>
      </main>
    </>
  );
}
