import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/content";
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

  /* One call for both collections: the backend already knows what is visible,
     and asking it twice would let the two halves disagree mid-publish. */
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const rows = await getSitemapEntries();
    postEntries = rows.map((row) => ({
      url: `${BASE_URL}/${row.kind}/${row.slug}`,
      lastModified: safeDate(row.updatedAt, now),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    /* Never emit a sitemap missing every post: better to serve the last cached
       copy than to tell Google the content is gone. */
    console.error("sitemap: failed to enumerate posts", err);
  }

  return [...staticEntries, ...postEntries];
}
