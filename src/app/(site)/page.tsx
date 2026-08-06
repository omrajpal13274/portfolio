import { Catalog } from "@/components/Catalog";
import { getSiteContent } from "@/content";

// Content is fetched at build time and refreshed hourly, so publishing in the
// Studio reaches the live site without a redeploy.
export const revalidate = 3600;

export default async function HomePage() {
  const content = await getSiteContent();
  return <Catalog content={content} />;
}
