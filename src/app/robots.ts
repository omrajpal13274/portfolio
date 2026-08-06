import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin panel. Already noindex via its own metadata; this keeps
      // crawlers from spending requests on a 4MB bundle they cannot read.
      disallow: "/studio",
    },
    sitemap: "https://omrajpal.in/sitemap.xml",
  };
}
