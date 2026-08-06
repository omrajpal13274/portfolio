import { defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    // Provides the drag-to-reorder handle in the Studio. The site sorts on
    // this field, so dragging a card here is what moves it in the catalog.
    orderRankField({ type: "project" }),

    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "Shown as the large rotated wordmark. One word reads best — anything past about ten characters gets cramped.",
      validation: (rule) => rule.required().max(24),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      options: { source: "title", maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "One sentence, shown under the wordmark and in link previews.",
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: "illustration",
      title: "Illustration",
      type: "image",
      description:
        "Transparent PNG, SVG, or GIF. Heavy black line art works best — the type overlaps it and the red spray goes on top. Falls back to the built-in doodle when empty.",
      options: { hotspot: true },
    }),
    defineField({
      name: "doodle",
      title: "Fallback doodle",
      type: "string",
      description: "Used until an illustration is uploaded.",
      initialValue: "head",
      options: {
        list: [
          { title: "Head", value: "head" },
          { title: "Stamp", value: "stamp" },
          { title: "Eye", value: "eye" },
          { title: "Megaphone", value: "megaphone" },
          { title: "Ghost", value: "ghost" },
          { title: "Brain", value: "brain" },
          { title: "Box", value: "box" },
          { title: "Robot arm", value: "arm" },
        ],
      },
    }),
    defineField({ name: "org", title: "Organisation", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({
      name: "period",
      title: "Period",
      type: "string",
      description: 'Free text, e.g. "Jun 2025 — Oct 2025".',
    }),
    defineField({
      name: "stack",
      title: "Stack",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "live",
      options: {
        list: [
          { title: "Shipped", value: "live" },
          { title: "Restricted (NDA or defence)", value: "restricted" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "restrictionNote",
      title: "Restriction note",
      type: "text",
      rows: 2,
      description: "Why this cannot be shown. Displayed on the restriction stamp.",
      hidden: ({ document }) => document?.status !== "restricted",
    }),
    defineField({
      name: "problem",
      title: "The problem",
      type: "array",
      of: [{ type: "text", rows: 4 }],
      description: "One entry per paragraph.",
    }),
    defineField({
      name: "build",
      title: "What I built",
      type: "array",
      of: [{ type: "text", rows: 4 }],
    }),
    defineField({
      name: "outcome",
      title: "Outcome",
      type: "array",
      of: [{ type: "text", rows: 4 }],
    }),
    defineField({
      name: "award",
      title: "Award badge",
      type: "string",
      description:
        'Recognition this project won, shown as a red badge on the project itself — e.g. "IBM Bob Hackathon 2026 — 1st place". Leave empty if none.',
    }),
    defineField({
      name: "links",
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
  ],
  preview: {
    select: { title: "title", subtitle: "tagline", media: "illustration" },
  },
});
