import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * On-demand revalidation for Sanity.
 *
 * Pages carry `revalidate = 3600`, which is the floor: without this route an
 * edit in the Studio can take an hour to show up, and the obvious reaction to
 * that is to publish again, and again. This closes the loop — Sanity posts
 * here on publish and the affected pages are rebuilt within a second.
 *
 * Setup (sanity.io/manage → API → Webhooks):
 *   URL      https://omrajpal.in/api/revalidate
 *   Dataset  your dataset
 *   Trigger  create, update, delete
 *   Filter   _type in ["project","experience","award","siteSettings"]
 *   Projection  {_type, "slug": slug.current}
 *   Secret   the same value as SANITY_REVALIDATE_SECRET
 *
 * The secret is required, not optional. Without it this endpoint is an
 * unauthenticated way for anyone to force cache rebuilds, so it refuses to run
 * rather than defaulting to open.
 */

type Payload = { _type?: string; slug?: string };

export async function POST(request: NextRequest) {
  // Read per request, not at module scope. A module-scope `process.env` read
  // is evaluated when the route is first loaded, so adding the secret in
  // Vercel later would appear to do nothing until the next deploy.
  const SECRET = process.env.SANITY_REVALIDATE_SECRET;

  if (!SECRET) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not set" },
      { status: 501 },
    );
  }

  try {
    const { isValidSignature, body } = await parseBody<Payload>(
      request,
      SECRET,
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
    if (!body?._type) {
      return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    // "layout", not "page". Both the catalogue and the project pages live in
    // the (site) route group, so their internal cache keys carry that segment
    // and `revalidatePath("/", "page")` matches nothing: Sanity gets its 200,
    // the CDN entry is never purged, and the edit only appears when the hourly
    // window lapses. Revalidating at layout scope invalidates by prefix, which
    // does reach them. It rebuilds more than strictly changed, which on a site
    // this size is a handful of pages and the right trade for correctness.
    revalidatePath("/", "layout");

    // The slug may be the thing that just changed, so the sitemap follows.
    if (body._type === "project") {
      revalidatePath("/sitemap.xml");
    }

    return NextResponse.json({ revalidated: true, type: body._type });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[revalidate]", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
