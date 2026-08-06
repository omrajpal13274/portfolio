"use client";

import Link from "next/link";

/**
 * The fixed corner furniture and the progress bar.
 *
 * The track runs white panels straight into near-black ones, so any fixed
 * overlay has to stay legible against both. Rather than tracking which panel
 * is underneath and swapping colours — which would always lag the scroll by a
 * frame and flicker at the boundary — the chrome is painted white and blended
 * with `difference`. On white it resolves black, on black it resolves white,
 * and on the red panel it inverts to a colour that still separates. It is
 * never wrong because it is never deciding.
 *
 * The progress bar sits outside that blend, because it must stay red.
 */
export function Chrome({
  name,
  stationIndex,
  stationCount,
  stationName,
  progress,
}: {
  name: string;
  stationIndex: number;
  stationCount: number;
  stationName: string;
  progress: number;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-50 mix-blend-difference">
        <div className="flex h-full flex-col justify-between p-5 text-paper sm:p-7">
          <div className="flex items-start justify-between gap-6">
            <Link
              href="/"
              className="micro pointer-events-auto uppercase link-underline"
            >
              {name}
            </Link>
            <p className="micro text-right uppercase">
              {pad(stationIndex + 1)}
              <span className="opacity-50">/{pad(stationCount)}</span>
              <span className="ml-3 hidden sm:inline">{stationName}</span>
            </p>
          </div>

          <div className="flex items-end justify-between gap-6">
            <a
              href="#work"
              className="micro group pointer-events-auto flex items-center gap-3 uppercase"
            >
              Check out the work
              <span aria-hidden="true" className="rule-grow inline-block h-px w-12 bg-current" />
              <span aria-hidden="true">&rarr;</span>
            </a>
            <p className="micro hidden uppercase sm:block">
              Scroll <span aria-hidden="true">&darr;</span>
            </p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-1">
        <div
          className="h-full bg-red transition-[width] duration-150 ease-out"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </>
  );
}
