import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { StoryListPage, STORIES_PER_PAGE } from "@/components/content/StoryListPage";
import { getPostsPage } from "@/lib/content";
import { seo } from "@/lib/seo";

/* ─────────────────────────────────────────────
   /stories/page/[n] — the archive beyond page one; same contract as the
   guides archive.
   ───────────────────────────────────────────── */

export const dynamicParams = true;
export const revalidate = 300;

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
    path: `/stories/page/${n}`,
    title: `Dating Success Stories — Page ${n}`,
    description:
      "Real people who matched and ended up in something real — the archive.",
  });
}

export default async function StoriesArchivePage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const page = parsePage(n);
  if (page === null) notFound();
  if (page === 1) permanentRedirect("/stories");

  const { posts, hasMore } = await getPostsPage("stories", page, STORIES_PER_PAGE);
  if (posts.length === 0) notFound();
  return <StoryListPage posts={posts} page={page} hasMore={hasMore} />;
}
