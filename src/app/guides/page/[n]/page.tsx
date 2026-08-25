import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { GuideListPage, GUIDES_PER_PAGE } from "@/components/content/GuideListPage";
import { getPostsPage } from "@/lib/content";
import { seo } from "@/lib/seo";

/* ─────────────────────────────────────────────
   /guides/page/[n] — the archive beyond page one. Real URLs rather than a
   load-more button: a crawler can walk the whole archive, and no page ever
   carries more than one page's worth of cards.
   ───────────────────────────────────────────── */

export const dynamicParams = true;
export const revalidate = 300;

/* On-demand only: the set of valid pages shifts every publish, so prerendering
   them at build would just be a list to keep stale. */
export function generateStaticParams() {
  return [];
}

function parsePage(n: string): number | null {
  if (!/^\d+$/.test(n)) return null;
  const page = Number(n);
  return page >= 1 ? page : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  return seo({
    path: `/guides/page/${n}`,
    title: `Dating App Guides — Page ${n}`,
    description:
      "Field guides for what actually works on dating apps. Openers, replies, asking her out, recovery scripts.",
  });
}

export default async function GuidesArchivePage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const page = parsePage(n);
  if (page === null) notFound();
  /* Page one lives at /guides — one canonical URL per page of content. */
  if (page === 1) permanentRedirect("/guides");

  const { posts, hasMore } = await getPostsPage("guides", page, GUIDES_PER_PAGE);
  if (posts.length === 0) notFound();
  return <GuideListPage posts={posts} page={page} hasMore={hasMore} />;
}
