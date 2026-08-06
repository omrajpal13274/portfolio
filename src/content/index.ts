import { client } from "@/sanity/client";
import {
  awardsQuery,
  experienceQuery,
  projectsQuery,
  settingsQuery,
} from "@/sanity/queries";
import { seedContent } from "./seed";
import type {
  Award,
  DoodleKind,
  SiteStat,
  ExperienceEntry,
  Project,
  ProjectLink,
  ProjectStatus,
  SiteContent,
  SiteSettings,
} from "./types";

/**
 * Single entry point for all site content.
 *
 * Resolution order:
 *   1. Sanity, if credentials are present AND the collection has documents
 *   2. Local seed content
 *
 * The second condition matters more than it looks. A freshly created Sanity
 * project returns empty arrays for everything, which would otherwise render a
 * blank site the moment credentials are added but before anything is
 * published. Falling back per collection means the site degrades field by
 * field rather than all at once.
 *
 * Everything from Sanity passes through a normaliser first. This is not
 * defensive padding — it is the boundary that makes the rest of the codebase
 * safe. A CMS field that has simply never been filled comes back as `null`,
 * and a component that does `project.stack.map(...)` on that takes the entire
 * site down with a 500. Publishing one project with only a title did exactly
 * that. Editors will always leave fields empty; the type system cannot stop
 * them, so this layer has to.
 */

const DOODLES: DoodleKind[] = [
  "head",
  "stamp",
  "eye",
  "megaphone",
  "ghost",
  "brain",
  "box",
  "arm",
];

const STATUSES: ProjectStatus[] = ["live", "restricted", "archived"];

/** Anything that is not a populated array becomes an empty one. */
function list<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : [];
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function oneOf<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return typeof value === "string" && (allowed as string[]).includes(value)
    ? (value as T)
    : fallback;
}

/**
 * Returns null for documents too incomplete to render — a project with no slug
 * has no URL and would break `generateStaticParams`, so it is dropped rather
 * than half-rendered.
 */
function normaliseProject(raw: Record<string, unknown>): Project | null {
  const slug = text(raw.slug);
  const title = text(raw.title);
  if (!slug || !title) return null;

  return {
    slug,
    title,
    tagline: text(raw.tagline),
    org: text(raw.org),
    role: text(raw.role),
    period: text(raw.period),
    stack: list<string>(raw.stack),
    status: oneOf(raw.status, STATUSES, "live"),
    restrictionNote: text(raw.restrictionNote) || undefined,
    problem: list<string>(raw.problem),
    build: list<string>(raw.build),
    outcome: list<string>(raw.outcome),
    links: list<ProjectLink>(raw.links).filter((l) => l?.label && l?.url),
    illustrationUrl: text(raw.illustrationUrl) || undefined,
    doodle: oneOf(raw.doodle, DOODLES, "head"),
    award: text(raw.award) || undefined,
  };
}

function normaliseExperience(raw: Record<string, unknown>): ExperienceEntry {
  return {
    org: text(raw.org, "Untitled"),
    role: text(raw.role),
    location: text(raw.location),
    start: text(raw.start),
    end: text(raw.end),
    summary: text(raw.summary),
    current: raw.current === true,
  };
}

function normaliseAward(raw: Record<string, unknown>): Award {
  return {
    title: text(raw.title, "Untitled"),
    org: text(raw.org),
    year: text(raw.year),
    detail: text(raw.detail),
    metric: text(raw.metric) || undefined,
    metricLabel: text(raw.metricLabel) || undefined,
    projectSlug: text(raw.projectSlug) || undefined,
  };
}

function normaliseSettings(raw: Record<string, unknown> | null): SiteSettings | null {
  if (!raw) return null;
  const name = text(raw.name);
  if (!name) return null;

  return {
    name,
    role: text(raw.role, seedContent.settings.role),
    thesis: text(raw.thesis, seedContent.settings.thesis),
    location: text(raw.location, seedContent.settings.location),
    email: text(raw.email, seedContent.settings.email),
    socials: list<ProjectLink>(raw.socials).filter((l) => l?.label && l?.url)
      .length
      ? list<ProjectLink>(raw.socials).filter((l) => l?.label && l?.url)
      : seedContent.settings.socials,
    resumeUrl: text(raw.resumeUrl) || undefined,

    // Editorial copy falls back field by field, so an editor who fills in only
    // some of it never blanks the rest of the page.
    currently: text(raw.currently, seedContent.settings.currently),
    stats: list<SiteStat>(raw.stats).filter((s) => s?.value && s?.label).length
      ? list<SiteStat>(raw.stats).filter((s) => s?.value && s?.label)
      : seedContent.settings.stats,
    workIntro: text(raw.workIntro, seedContent.settings.workIntro),
    contactHeading: text(
      raw.contactHeading,
      seedContent.settings.contactHeading,
    ),
    footerNote: text(raw.footerNote, seedContent.settings.footerNote),
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!client) return seedContent;

  try {
    const [settings, projects, experience, awards] = await Promise.all([
      client.fetch<Record<string, unknown> | null>(settingsQuery),
      client.fetch<Record<string, unknown>[]>(projectsQuery),
      client.fetch<Record<string, unknown>[]>(experienceQuery),
      client.fetch<Record<string, unknown>[]>(awardsQuery),
    ]);

    const cleanProjects = list<Record<string, unknown>>(projects)
      .map(normaliseProject)
      .filter((p): p is Project => p !== null);
    const cleanExperience = list<Record<string, unknown>>(experience).map(
      normaliseExperience,
    );
    const cleanAwards = list<Record<string, unknown>>(awards).map(normaliseAward);
    const cleanSettings = normaliseSettings(settings);

    return {
      settings: cleanSettings ?? seedContent.settings,
      projects: cleanProjects.length ? cleanProjects : seedContent.projects,
      experience: cleanExperience.length
        ? cleanExperience
        : seedContent.experience,
      awards: cleanAwards.length ? cleanAwards : seedContent.awards,
    };
  } catch (error) {
    // A CMS outage should never take the portfolio down. Log and serve seed.
    console.error("[content] Sanity fetch failed, serving seed content:", error);
    return seedContent;
  }
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const { projects } = await getSiteContent();
  return projects.find((p) => p.slug === slug);
}

export type { Project, SiteContent } from "./types";
