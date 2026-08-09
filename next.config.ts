import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // The Sanity Studio bundle is large and ships its own toolchain; keeping it
  // out of the shared client graph keeps the public site's payload small.
  transpilePackages: ["next-sanity"],

  /**
   * Vercel serves this over HTTPS but sets none of these for you.
   *
   * No Content-Security-Policy here, deliberately. The boot-seen script in the
   * root layout is inline, and so is Next's own bootstrapping, so a real policy
   * means plumbing a nonce through both via middleware. A CSP with
   * 'unsafe-inline' would pass a scanner while blocking nothing, which is worse
   * than none: it reads as protection that isn't there.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stops a browser second-guessing a declared content type, which is
          // how a served file gets treated as script.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // SAMEORIGIN rather than DENY: the Studio is on this origin, and
          // Sanity's Presentation tool frames the site to preview it. DENY
          // would break that the day it gets switched on.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Nothing here uses hardware. Saying so means an injected script
          // cannot silently ask on the page's behalf.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // No X-Robots-Tag for /studio here: its page metadata already sets
      // noindex/nofollow and robots.ts disallows the path.
    ];
  },
};

export default nextConfig;
