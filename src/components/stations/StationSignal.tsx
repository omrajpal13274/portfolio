"use client";

import { Panel } from "@/components/Panel";
import { Doodle } from "@/components/Doodle";
import type { SiteSettings } from "@/content/types";

/**
 * The end of the track.
 *
 * A full red panel. The accent has been used sparingly as spray up to this
 * point, so handing it the entire final screen lands as an ending rather than
 * as more decoration — you cannot scroll past it and wonder whether there is
 * more.
 */
export function StationSignal({
  settings,
  containerAnimation,
}: {
  settings: SiteSettings;
  containerAnimation?: gsap.core.Tween;
}) {
  return (
    <Panel
      id="signal"
      name="SIGNAL"
      tone="red"
      containerAnimation={containerAnimation}
      className="px-6 py-24 sm:px-12 wide:py-0"
    >
      <div data-drift className="relative z-10 max-w-5xl">
        <h2 className="display-tight text-[11vw] wide:text-[5.5vw]">
          {settings.contactHeading}
        </h2>

        <a
          href={`mailto:${settings.email}`}
          className="display mt-12 inline-block text-[6.5vw] leading-none link-underline wide:text-[3vw]"
        >
          {settings.email}
        </a>

        <ul className="mt-16 flex flex-wrap gap-x-10 gap-y-4">
          {settings.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.url}
                target={social.url.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer noopener"
                className="micro group flex items-center gap-2 uppercase link-underline"
              >
                {social.label}
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </a>
            </li>
          ))}
          {settings.resumeUrl ? (
            <li>
              <a
                href={settings.resumeUrl}
                className="micro group flex items-center gap-2 uppercase link-underline"
              >
                R&eacute;sum&eacute;
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-y-1"
                >
                  &darr;
                </span>
              </a>
            </li>
          ) : null}
        </ul>

        <p className="micro mt-20 uppercase opacity-60">
          {settings.footerNote}
        </p>
      </div>

      <div
        data-drift-deep
        className="pointer-events-none absolute right-[5%] bottom-[7%] h-[32%] w-[36%] wide:h-[46%] wide:w-[24%]"
      >
        <Doodle
          kind="megaphone"
          className="h-full w-full"
        />
      </div>
    </Panel>
  );
}
