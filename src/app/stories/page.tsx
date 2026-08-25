import type { Metadata } from "next";
import { StoryListPage, STORIES_PER_PAGE } from "@/components/content/StoryListPage";
import { getPostsPage } from "@/lib/content";
import { seo } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = seo({
  path: "/stories",
  title: "Dating Success Stories — Real Openers That Worked",
  description:
    "Real people who matched, found the right words, and ended up in something real. The couples who started with one good message.",
});

export default async function StoriesIndexPage() {
  const { posts, hasMore } = await getPostsPage("stories", 1, STORIES_PER_PAGE);
  return <StoryListPage posts={posts} page={1} hasMore={hasMore} />;
}
