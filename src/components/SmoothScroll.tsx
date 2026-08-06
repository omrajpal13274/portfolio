"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Lenis smooth scroll, driven by GSAP's ticker.
 *
 * Two details that matter:
 *
 * 1. Lenis and ScrollTrigger must share a clock. Running Lenis on its own
 *    requestAnimationFrame loop while ScrollTrigger runs on GSAP's produces
 *    a one-frame disagreement about scroll position, which reads as jitter
 *    on any scrubbed animation. Driving `lenis.raf` from `gsap.ticker` and
 *    calling `ScrollTrigger.update` on every Lenis scroll keeps them locked.
 *
 * 2. `lagSmoothing(0)` disables GSAP's frame-skip recovery. That feature is
 *    right for standalone tweens and wrong for scrubbed ones, where it makes
 *    the animation jump ahead of the scrollbar after a stall.
 *
 * Disabled entirely under reduced-motion, which restores native scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      // Touch devices already have momentum scrolling. Adding ours on top
      // fights the platform and feels broken.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}
