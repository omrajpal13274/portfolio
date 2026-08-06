import { defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";
import { project } from "./project";

const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({
      name: "thesis",
      title: "Thesis",
      type: "text",
      rows: 3,
      description: "The line on the THESIS station. Keep it to one or two sentences.",
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({
      name: "socials",
      title: "Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "url", type: "url", title: "URL" },
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        },
      ],
    }),
    defineField({ name: "resume", title: "Résumé (PDF)", type: "file" }),

    // Editorial copy. Structural labels ("Trajectory", "Open project") stay in
    // the components — they are layout. What lives here is everything that
    // would need editing in six months without a developer.
    defineField({
      name: "currently",
      title: "Currently at",
      type: "string",
      description: "Shown in the hero. Changes when the job changes.",
    }),
    defineField({
      name: "stats",
      title: "Headline stats",
      type: "array",
      description:
        "The numbers on the thesis station. Three fits the layout; more will wrap.",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "value",
              type: "string",
              title: "Value",
              description: 'The number itself, e.g. "40%".',
            },
            { name: "label", type: "string", title: "Label" },
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
    }),
    defineField({
      name: "workIntro",
      title: "Work standfirst",
      type: "text",
      rows: 2,
      description: "The line above the project catalogue.",
    }),
    defineField({
      name: "contactHeading",
      title: "Contact heading",
      type: "text",
      rows: 2,
      description: "The pitch on the closing station.",
    }),
    defineField({
      name: "footerNote",
      title: "Footer note",
      type: "string",
      description: "Small print at the foot of the closing station.",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

const experience = defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  description:
    "Order these oldest first. The trajectory runs left to right along the scroll, so the top of this list is the earliest role and the bottom is the current one.",
  fields: [
    orderRankField({ type: "experience" }),
    defineField({ name: "org", title: "Organisation", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "start", title: "Start", type: "string" }),
    defineField({ name: "end", title: "End", type: "string" }),
    defineField({
      name: "current",
      title: "Current role",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
  ],
  preview: { select: { title: "org", subtitle: "role" } },
});

const award = defineType({
  name: "award",
  title: "Award",
  type: "document",
  fields: [
    orderRankField({ type: "award" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "org", title: "Awarded by", type: "string" }),
    defineField({ name: "year", title: "Year", type: "string" }),
    defineField({
      name: "metric",
      title: "Headline metric",
      type: "string",
      description: 'The one number read from across the room, e.g. "$5,000".',
    }),
    defineField({ name: "metricLabel", title: "Metric label", type: "string" }),
    defineField({ name: "detail", title: "Detail", type: "text", rows: 3 }),
    defineField({
      name: "project",
      title: "Recognises project",
      type: "reference",
      to: [{ type: "project" }],
      description:
        "Optional. Adds a link back to the project instead of repeating it here.",
    }),
  ],
  preview: { select: { title: "title", subtitle: "org" } },
});

export const schemaTypes = [project, experience, award, siteSettings];
