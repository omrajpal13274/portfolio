export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-08-06";

/**
 * Server-only. Required because the dataset is private — without it every
 * query comes back 401 and the site silently serves seed content instead.
 *
 * Deliberately not prefixed with NEXT_PUBLIC_, so it never reaches the
 * browser. That is safe here because pages are statically generated and
 * revalidated on the server; nothing fetches Sanity from the client.
 */
export const readToken = process.env.SANITY_API_READ_TOKEN ?? "";

/**
 * The site is designed to work without a CMS. Every Sanity call is guarded by
 * this flag and falls back to the local seed content, so missing credentials
 * are a supported state rather than a crash.
 *
 * Note: the Sanity CLI replaces this file with a template that throws on
 * missing environment variables. If `sanity init` is ever re-run and answers
 * "yes" to overwriting env.ts, restore this version or the fallback is lost.
 */
export const sanityConfigured = projectId.length > 0;
