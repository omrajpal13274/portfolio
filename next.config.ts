import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // The Sanity Studio bundle is large and ships its own toolchain; keeping it
  // out of the shared client graph keeps the public site's payload small.
  transpilePackages: ["next-sanity"],
};

export default nextConfig;
