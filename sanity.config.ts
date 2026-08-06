import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { schemaTypes } from "./src/sanity/schemas";
import { dataset, projectId } from "./src/sanity/env";

/**
 * Sanity Studio, embedded at /studio.
 *
 * Projects, experience, and awards are all mounted as orderable lists, so
 * reordering them is a drag in the sidebar rather than a numeric field to
 * maintain by hand. That ordering is what the site reads.
 */
export default defineConfig({
  name: "omrajpal",
  title: "Om Rajpal — Content",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title("Content")
          .items([
            orderableDocumentListDeskItem({
              type: "project",
              title: "Projects",
              S,
              context,
            }),
            orderableDocumentListDeskItem({
              type: "experience",
              title: "Experience",
              S,
              context,
            }),
            orderableDocumentListDeskItem({
              type: "award",
              title: "Awards",
              S,
              context,
            }),
            S.divider(),
            S.listItem()
              .title("Site settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings"),
              ),
          ]),
    }),
  ],
});
