"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { Panel } from "@/components/Panel";
import { Doodle } from "@/components/Doodle";
import { Spray } from "@/components/Spray";
import { useIntroGate } from "@/lib/introGate";
import type { SiteSettings } from "@/content/types";

/**
 * The opening frame.
 *
 * Name at full width, three facts under it, one drawing holding the right.
 *
 * The name is marked with paint behind it rather than a ring around it. A ring
 * was tried and cut: at this scale the stroke has to cross the glyphs to
 * enclose them, and a mark that damages the one word the page exists to say is
 * not worth the texture. Paint behind does the opposite — the letters knock out
 * of it in white and read harder than they did unmarked.
 */
export function StationIndex({
  settings,
  containerAnimation,
}: {
  settings: SiteSettings;
  containerAnimation?: gsap.core.Tween;
}) {
  const root = useRef<HTMLDivElement>(null);
  const introDone = useIntroGate();

  useGSAP(
    () => {
      // Waits for the splash to clear, so the entrance is actually seen.
      if (prefersReducedMotion() || !introDone) return;
      const split = new SplitText(".hero-name", { type: "chars" });
      // A partial rise with a fade rather than a slide behind a mask. The mask
      // clipped at the line box, and with leading at 0.82 that box is shorter
      // than the glyphs — it ate the descenders of "j" and "p" permanently.
      gsap.from(split.chars, {
        yPercent: 45,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.03,
        ease: "power4.out",
        delay: 0.15,
      });
      gsap.from(".hero-meta", {
        autoAlpha: 0,
        y: 16,
        duration: 0.6,
        stagger: 0.08,
        delay: 0.5,
        ease: "power3.out",
      });
      return () => split.revert();
    },
    { scope: root, dependencies: [introDone] },
  );

  return (
    <Panel
      id="index"
      name="INDEX"
      tone="paper"
      containerAnimation={containerAnimation}
      className="px-6 py-24 sm:px-12 wide:py-0"
    >
      <div ref={root} data-drift className="relative z-10">
        {/* Meant to run toward the right edge and crop. The paint sits behind
            the letters and they knock out of it in white — no stroke crosses a
            glyph, so the name reads harder than it did unmarked. */}
        <div className="relative inline-block text-[17vw] wide:text-[13vw]">
          <span
            aria-hidden="true"
            className="absolute -top-[0.25em] -right-[0.05em] -bottom-[0.15em] -left-[0.05em] block"
          >
            <Spray
              kind="swipe"
              delay={0.45}
              className="h-full w-full"
            />
          </span>
          <h1 className="display-tight hero-name relative pb-[0.08em] text-[17vw] whitespace-nowrap text-paper wide:text-[13vw]">
            {settings.name}
          </h1>
        </div>

        <div className="mt-10 flex flex-wrap items-end gap-x-14 gap-y-6">
          <div className="hero-meta">
            <p className="micro uppercase opacity-50">Role</p>
            <p className="display mt-1 text-3xl">{settings.role}</p>
          </div>
          <div className="hero-meta">
            <p className="micro uppercase opacity-50">Based</p>
            <p className="display mt-1 text-3xl">{settings.location}</p>
          </div>
          <div className="hero-meta">
            <p className="micro uppercase opacity-50">Currently</p>
            <p className="display mt-1 text-3xl">{settings.currently}</p>
          </div>
        </div>
      </div>

      <div
        data-drift-deep
        className="pointer-events-none absolute right-[2%] bottom-[4%] h-[52%] w-[42%] wide:h-[70%] wide:w-[30%]"
      >
        <Doodle
          kind="head"
          className="h-full w-full"
        />
      </div>
    </Panel>
  );
}
