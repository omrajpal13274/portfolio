// Enforces at build time what was previously only true by convention: the
// Sanity client, its credentials, and the read token never reach the browser.
// An accidental import from a client component now fails the build loudly
// instead of quietly shipping the SDK to every visitor.
import "server-only";

import { createClient } from "next-sanity";
import {
  apiVersion,
  dataset,
  projectId,
  readToken,
  sanityConfigured,
} from "./env";

export const client = sanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      // Pages are statically generated and revalidated on the server, so the
      // CDN's eventual consistency would only add staleness on top of the
      // revalidation window without saving a request the reader waits on.
      useCdn: false,
      perspective: "published",
      token: readToken || undefined,
    })
  : null;
