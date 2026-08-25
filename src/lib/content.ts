/* ─────────────────────────────────────────────
   content.ts — the one door every page uses to reach guides and stories.

   Behind it sit two sources: the markdown files that shipped with the repo and
   the backend API that replaced them. `CONTENT_SOURCE` picks one, which makes
   the migration reversible with an env var instead of a revert.

   Everything here is async even when the files are doing the work: the API is
   async, and a surface that changes shape depending on a flag would have to be
   re-audited at every call site the day the flag flips.
   ───────────────────────────────────────────── */

import * as api from "@/lib/content-api";
import * as fsSource from "@/lib/content-fs";
import type { ContentKind, ContentPost, ContentPostWithHtml } from "@/lib/content-types";

export type {
  ContentKind,
  ContentPost,
  ContentPostWithHtml,
  StoryBlock,
  StoryMetric,
  StoryThreadMessage,
} from "@/lib/content-types";

/** `api` (default) or `fs` — the markdown files, kept for one release. */
const SOURCE = process.env.CONTENT_SOURCE === "fs" ? "fs" : "api";

export function contentSource(): "api" | "fs" {
  return SOURCE;
}

export async function getAllPosts(kind: ContentKind): Promise<ContentPost[]> {
  return SOURCE === "fs" ? fsSource.getAllPosts(kind) : api.getAllPosts(kind);
}

export async function getAllSlugs(kind: ContentKind): Promise<string[]> {
  return SOURCE === "fs" ? fsSource.getAllSlugs(kind) : api.getAllSlugs(kind);
}

/** A post, a redirect when the slug moved, or null when there's nothing. */
export async function getPostWithHtml(
  kind: ContentKind,
  slug: string,
): Promise<ContentPostWithHtml | { redirectTo: string } | null> {
  return SOURCE === "fs"
    ? fsSource.getPostWithHtml(kind, slug)
    : api.getPostWithHtml(kind, slug);
}

export async function getRelatedPosts(
  kind: ContentKind,
  slug: string,
  limit = 3,
): Promise<ContentPost[]> {
  if (SOURCE === "fs") {
    const all = await fsSource.getAllPosts(kind);
    const current = all.find((p) => p.slug === slug);
    return fsSource.getRelatedPosts(kind, slug, current?.category ?? "", limit);
  }
  return api.getRelatedPosts(kind, slug, limit);
}

/** Every visible post, for sitemap.xml. */
export async function getSitemapEntries(): Promise<
  { kind: ContentKind; slug: string; updatedAt: string }[]
> {
  if (SOURCE === "fs") {
    const entries: { kind: ContentKind; slug: string; updatedAt: string }[] = [];
    for (const kind of ["guides", "stories"] as ContentKind[]) {
      for (const post of fsSource.getAllPosts(kind)) {
        entries.push({ kind, slug: post.slug, updatedAt: post.date });
      }
    }
    return entries;
  }
  return api.getSitemapEntries();
}

export { markdownToHtml } from "@/lib/content-fs";
