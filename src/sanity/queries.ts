import { groq } from "next-sanity";

/**
 * Projects, in the order set by dragging them in the Studio.
 *
 * `orderRank` is a lexicographic rank string maintained by the
 * @sanity/orderable-document-list plugin. Sorting on it is what makes
 * drag-to-reorder in the admin panel show up as reordering on the site.
 */
export const projectsQuery = groq`
  *[_type == "project"] | order(orderRank) {
    "slug": slug.current,
    title,
    tagline,
    org,
    role,
    period,
    stack,
    status,
    restrictionNote,
    problem,
    build,
    outcome,
    links[]{ label, url },
    award,
    "illustrationUrl": illustration.asset->url,
    doodle
  }
`;

export const settingsQuery = groq`
  *[_type == "siteSettings"][0] {
    name,
    role,
    thesis,
    location,
    email,
    socials[]{ label, url },
    "resumeUrl": resume.asset->url,
    currently,
    stats[]{ value, label },
    workIntro,
    contactHeading,
    footerNote
  }
`;

export const experienceQuery = groq`
  *[_type == "experience"] | order(orderRank) {
    org, role, location, start, end, summary, current
  }
`;

export const awardsQuery = groq`
  *[_type == "award"] | order(orderRank) {
    title, org, year, detail, metric, metricLabel,
    "projectSlug": project->slug.current
  }
`;
