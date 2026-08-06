"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

/**
 * Single registration point for every GSAP plugin the site uses.
 *
 * All of these — including SplitText and DrawSVG, which were paid Club
 * GreenSock plugins until Webflow released them in April 2025 — now ship in
 * the public `gsap` package.
 *
 * Registration is guarded because these modules touch `window` at import
 * time, and Next.js evaluates client modules on the server during SSR.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP);
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP };

/** True when the visitor has asked the OS to minimise motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
