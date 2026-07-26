import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/content";
import { TOOLS } from "@/lib/tools";
import { SITE_URL } from "@/lib/site";

/* Built at compile time: guides/stories are markdown in the repo, so the full
   set is known at build and the URLs are baked in (no runtime filesystem reads,
   which a standalone / static deploy may not have). Adding a guide is a code
   change + redeploy anyway, so a build-time sitemap is always current. */
const BASE_URL = SITE_URL;

function safeDate(iso: string | undefined, fallback: Date): Date {
  if (!iso) return fallback;
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d : fallback;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/tools`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...TOOLS.map((t) => ({
      url: `${BASE_URL}/tools/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${BASE_URL}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/stories`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let guideEntries: MetadataRoute.Sitemap = [];
  try {
    guideEntries = getAllPosts("guides").map((post) => ({
      url: `${BASE_URL}/guides/${post.slug}`,
      lastModified: safeDate(post.date, now),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch (err) {
    console.error("sitemap: failed to enumerate guides", err);
  }

  let storyEntries: MetadataRoute.Sitemap = [];
  try {
    storyEntries = getAllPosts("stories").map((post) => ({
      url: `${BASE_URL}/stories/${post.slug}`,
      lastModified: safeDate(post.date, now),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch (err) {
    console.error("sitemap: failed to enumerate stories", err);
  }

  return [...staticEntries, ...guideEntries, ...storyEntries];
}
