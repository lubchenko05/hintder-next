import type { Metadata } from "next";
import { GuideListPage, GUIDES_PER_PAGE } from "@/components/content/GuideListPage";
import { getPostsPage } from "@/lib/content";
import { seo } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = seo({
  path: "/guides",
  title: "Dating App Guides — Openers, Replies & Recovery",
  description:
    "Field guides for what actually works on dating apps in 2026. Openers, replies, asking her out, recovery scripts.",
});

export default async function GuidesIndexPage() {
  const { posts, hasMore } = await getPostsPage("guides", 1, GUIDES_PER_PAGE);
  return <GuideListPage posts={posts} page={1} hasMore={hasMore} />;
}
