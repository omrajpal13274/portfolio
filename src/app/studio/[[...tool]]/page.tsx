import type { Metadata } from "next";
import { sanityConfigured } from "@/sanity/env";
import StudioClient from "./StudioClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

/**
 * The admin panel.
 *
 * Rendering the Studio without a project ID throws, so an unconfigured site
 * gets setup instructions instead of a stack trace. This is the state the
 * repo ships in.
 */
export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      // Inline layout on purpose. Importing StudioClient pulls Sanity's global
      // CSS reset into this route's stylesheet even when the Studio is not
      // rendered, and that reset zeroes out utility padding. Inline styles sit
      // above it.
      <div
        style={{
          maxWidth: "42rem",
          margin: "0 auto",
          padding: "6rem 1.5rem",
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, opacity: 0.5 }}>STUDIO</p>
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: 900,
            letterSpacing: "-0.035em",
            margin: "1rem 0 0",
          }}
        >
          Not connected yet
        </h1>
        <p style={{ marginTop: "1.5rem", fontSize: 16, lineHeight: 1.6 }}>
          The site is serving its local seed content. To edit everything from
          here instead, create a Sanity project and restart the dev server:
        </p>
        <pre
          style={{
            marginTop: "1.5rem",
            overflowX: "auto",
            border: "3px solid #0e0e0e",
            padding: "1.25rem",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          {`npx sanity@5 login
npx sanity@5 init --env=.env.local`}
        </pre>
        <p style={{ marginTop: "1.5rem", fontSize: 16, lineHeight: 1.6 }}>
          That writes <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> into{" "}
          <code>.env.local</code>. This panel then opens onto an empty list,
          which is correct: everything on the site still lives in the seed file.
          Publishing a document here takes over its collection. Nothing breaks
          in between.
        </p>
      </div>
    );
  }

  return <StudioClient />;
}
