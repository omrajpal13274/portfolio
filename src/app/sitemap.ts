import type { MetadataRoute } from "next";
import { getSiteContent } from "@/content";

export const revalidate = 3600;

/**
 * Project URLs come from the CMS, so the sitemap is generated rather than
 * written down — publishing a project in the Studio adds it here too.
 *
 * /studio is deliberately absent; it is disallowed in robots.ts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getSiteContent();
  const base = "https://omrajpal.in";

  return [
    {
      url: base,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${base}/work/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
