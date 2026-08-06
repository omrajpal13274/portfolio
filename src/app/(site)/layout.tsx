import { SmoothScroll } from "@/components/SmoothScroll";
import { SprayDefs } from "@/components/SprayDefs";
import { TransitionProvider } from "@/components/PageTransition";

/**
 * The public site.
 *
 * The Sanity Studio deliberately sits outside this route group — it ships its
 * own scroll behaviour, and inheriting Lenis would make the admin unusable.
 *
 * TransitionProvider must live here rather than in a page, because the
 * travelling wordmark clone has to survive the route change from the catalog
 * to a project page.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TransitionProvider>
      <SprayDefs />
      <SmoothScroll />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:bg-red focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-paper"
      >
        Skip to content
      </a>
      <main id="main">{children}</main>
    </TransitionProvider>
  );
}
