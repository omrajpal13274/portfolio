import Image from "next/image";
import { Doodle } from "./Doodle";
import type { Project } from "@/content/types";

/**
 * A project's drawing: the uploaded illustration if there is one, the built-in
 * doodle otherwise.
 *
 * Shared so the two places that show it cannot disagree. They did: the
 * catalogue honoured `illustrationUrl` and the project page always drew the
 * doodle, so uploading an illustration in the Studio changed one of them and
 * silently ignored the other.
 *
 * Always decorative. The project's own title sits next to it in both places,
 * so an alt text here would be read out twice.
 */
export function Artwork({
  project,
  className,
  sizes,
  animate = true,
}: {
  project: Pick<Project, "illustrationUrl" | "doodle">;
  className?: string;
  /** Passed to next/image. Widths are viewport fractions in both layouts. */
  sizes?: string;
  /** Doodles draw themselves in on first view. Off for the always-on ones. */
  animate?: boolean;
}) {
  if (project.illustrationUrl) {
    return (
      <Image
        src={project.illustrationUrl}
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes ?? "34vw"}
        className={`object-contain ${className ?? ""}`}
        // Uploads are transparent line art and animated GIFs. Optimisation
        // would flatten the first and drop the frames of the second.
        unoptimized
      />
    );
  }

  return (
    <Doodle kind={project.doodle} className={className} animate={animate} />
  );
}
