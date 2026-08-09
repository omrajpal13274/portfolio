import type { Metadata } from "next";
import Link from "next/link";
import { Doodle } from "@/components/Doodle";
import { Spray } from "@/components/Spray";
import { SprayDefs } from "@/components/SprayDefs";

/**
 * Sits at the app root, not inside (site), on purpose: this must render for a
 * URL that matched no route at all, including one outside the site group. It
 * therefore brings its own SprayDefs, since it cannot rely on the site layout
 * having mounted them.
 *
 * The number is the hero, treated the way the splash treats its counter —
 * enormous, cropped by the edge, with the red struck through it. A deleted
 * project is the realistic way to arrive here, so the copy says what happened
 * and offers the catalogue rather than only announcing the code.
 */
// Without this the page inherits the root layout's title and a dead URL reads
// as the homepage in the tab and in search results. noindex because a 404 that
// returns readable prose is exactly the kind of page a crawler will otherwise
// keep.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SprayDefs />
      <main className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-ink px-6 py-8 text-paper sm:px-12">
        <div className="flex items-center justify-between gap-6">
          <p className="micro uppercase opacity-50">Om Rajpal</p>
          <p className="micro tabular-nums uppercase">
            <span className="text-red">404</span>
            <span className="opacity-40">/error</span>
          </p>
        </div>

        {/* The ghost is the only doodle that means "not here" without a
            caption, and it is drawn in rather than simply placed. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-[-6vw] hidden h-[70vh] w-[42vw] -translate-y-1/2 opacity-25 lg:block"
        >
          <Doodle kind="ghost" className="h-full w-full" />
        </div>

        <div className="relative z-10">
          <div className="relative inline-block">
            <p
              aria-hidden="true"
              className="display-tight text-[42vw] leading-[0.74] sm:text-[30vw] lg:text-[22vw]"
            >
              404
            </p>
            {/* Struck through, not underlined. The page is cancelled. */}
            <Spray
              kind="swipe"
              className="pointer-events-none absolute top-[46%] -left-[6%] h-[26%] w-[112%] -translate-y-1/2"
            />
          </div>

          <h1 className="display mt-6 max-w-xl text-2xl leading-tight sm:text-4xl">
            This page moved, or never existed.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed opacity-60">
            If you followed a link to a project, it may have been renamed since.
            Everything that is still around is one scroll away.
          </p>

          <Link
            href="/"
            className="open-cta micro mt-9 inline-flex items-center gap-4 border-2 border-paper px-5 py-3 uppercase"
          >
            Back to the catalog
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <p className="micro uppercase opacity-40">omrajpal.in</p>
      </main>
    </>
  );
}
