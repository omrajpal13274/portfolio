/**
 * Content shape for the site.
 *
 * These types are the contract between the two content sources: the local
 * seed file (src/content/seed.ts) and Sanity. Both must satisfy them, so the
 * rendering layer never needs to know which one it is talking to.
 */

export type ProjectStatus = "live" | "restricted" | "archived";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  /** URL segment: /work/<slug> */
  slug: string;
  /** The giant wordmark in the catalog. Keep it to one word where possible. */
  title: string;
  /** One line under the wordmark on the project page. */
  tagline: string;
  org: string;
  role: string;
  period: string;
  stack: string[];
  /**
   * "restricted" renders the redaction treatment: the schematic still draws,
   * but body copy and links are struck out under a SOURCE RESTRICTED stamp.
   */
  status: ProjectStatus;
  /** Why the restriction exists. Shown on the stamp. Restricted projects only. */
  restrictionNote?: string;
  /** Long-form body. Rendered as paragraphs, in order. */
  problem: string[];
  build: string[];
  outcome: string[];
  links: ProjectLink[];
  /**
   * Short recognition badge shown on the project itself, e.g.
   * "IBM Bob Hackathon 2026 — 1st place".
   *
   * Three of these projects also appear in the achievements section, which
   * without this read as the same content twice. Carrying the win on the work
   * makes achievements a summary of recognition rather than a second copy of
   * the portfolio.
   */
  award?: string;
  /**
   * Transparent illustration or GIF, uploaded in the Studio. Replaces the
   * built-in doodle everywhere when present.
   */
  illustrationUrl?: string;
  /** Identifier for the built-in hand-drawn illustration. See Doodle.tsx. */
  doodle: DoodleKind;
}

export type DoodleKind =
  | "head"
  | "stamp"
  | "eye"
  | "megaphone"
  | "ghost"
  | "brain"
  | "box"
  | "arm";

export interface ExperienceEntry {
  org: string;
  role: string;
  location: string;
  start: string;
  end: string;
  summary: string;
  /** Marks the current role. Rendered with the warning accent. */
  current?: boolean;
}

export interface Award {
  title: string;
  org: string;
  year: string;
  detail: string;
  /** The single number worth reading from across the room. */
  metric?: string;
  metricLabel?: string;
  /** Slug of the project this recognises. Renders as a link back to it. */
  projectSlug?: string;
}

/** A headline number on the thesis panel. Grows as more work ships. */
export interface SiteStat {
  value: string;
  label: string;
}

export interface SiteSettings {
  name: string;
  role: string;
  thesis: string;
  location: string;
  email: string;
  socials: ProjectLink[];
  resumeUrl?: string;

  /**
   * Copy that changes over time, as opposed to the structural labels
   * ("Trajectory", "Open project", "The problem") which are part of the layout
   * and are left in the components. The test applied here was simply: would
   * this need editing in six months without a developer?
   */

  /** Current employer, shown in the hero. Changes when the job changes. */
  currently: string;
  /** Headline counts on the thesis panel. */
  stats: SiteStat[];
  /** Standfirst above the project catalogue. */
  workIntro: string;
  /** The pitch on the closing panel. */
  contactHeading: string;
  /** Small print at the foot of the closing panel. */
  footerNote: string;
}

export interface SiteContent {
  settings: SiteSettings;
  projects: Project[];
  experience: ExperienceEntry[];
  awards: Award[];
}
