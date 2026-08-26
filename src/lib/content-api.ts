import type { ContentKind, ContentPost, ContentPostWithHtml, StoryBlock } from "@/lib/content-types";

/* ─────────────────────────────────────────────
   content-api.ts — the API-backed content source.

   Posts live in the backend database, not in this repo, so publishing one is a
   POST rather than a commit + tag + deploy. Every read is tagged for on-demand
   revalidation: after a publish the backend calls /api/revalidate with the same
   tags and the affected pages rebuild in seconds instead of waiting out the TTL.

   Every function here fails soft. A build must not break because the API is
   briefly unreachable, and a page that has a cached copy should serve it rather
   than 500 — so callers get an empty list or null and decide what that means.
   ───────────────────────────────────────────── */

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010";
const API = `${BASE}/api/v1/public/content`;

/** Short on purpose: the ISR cache is per-instance, so revalidation only
 *  refreshes the instance that received it. The TTL covers the rest. */
const TTL_POST = 120;
const TTL_LIST = 300;

interface ApiPost {
  kind: ContentKind;
  slug: string;
  title: string;
  seo_title: string | null;
  subtitle: string | null;
  excerpt: string;
  category: string;
  persona: string | null;
  read_time_minutes: number;
  published_at: string | null;
  updated_at: string;
  body_html?: string;
  body_md?: string;
  blocks?: StoryBlock[] | null;
  keywords?: string | null;
  noindex?: boolean;
  canonical_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}

/** The API scales to zero, so a first request after an idle spell pays a cold
 *  start. Three seconds used to be the whole budget, which meant a cold start
 *  read as "no such post". */
const TIMEOUT_MS = 12000;

class ApiUnreachable extends Error {}

/** Fetch one endpoint.
 *
 *  `null` means the API answered and the thing is not there. An API that did
 *  NOT answer throws instead — the distinction matters more than it looks:
 *  collapsing both into `null` made a cold start indistinguishable from a
 *  deleted post, so a detail page would call notFound() and ISR would cache a
 *  404 over a live post until the TTL ran out.
 *
 *  `softFail` opts a caller back into `null` for both cases — right for a
 *  listing or the footer, where an empty section beats a 500. */
async function get<T>(
  path: string,
  tags: string[],
  ttl: number,
  softFail = false,
): Promise<T | null> {
  let lastError: unknown;
  /* One retry: a cold start usually loses only the first request. */
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${API}${path}`, {
        next: { revalidate: ttl, tags },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new ApiUnreachable(`${path} → ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
    }
  }
  if (softFail) return null;
  throw new ApiUnreachable(`content API unreachable: ${path} (${String(lastError)})`);
}

/** Map the API's snake_case row onto the shape the components already expect. */
function toPost(row: ApiPost): ContentPost {
  return {
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    seoTitle: row.seo_title ?? undefined,
    subtitle: row.subtitle ?? undefined,
    excerpt: row.excerpt,
    category: row.category,
    date: (row.published_at ?? row.updated_at).slice(0, 10),
    readTime: `${row.read_time_minutes} min`,
    persona: row.persona ?? undefined,
    blocks: row.blocks ?? undefined,
    noindex: row.noindex ?? undefined,
    canonicalUrl: row.canonical_url ?? undefined,
    metaTitle: row.meta_title ?? undefined,
    metaDescription: row.meta_description ?? undefined,
  };
}

export interface PostPage {
  posts: ContentPost[];
  hasMore: boolean;
}

/** One page of a listing. Asks for one row beyond the page so "is there a
 *  next page" costs nothing extra — no count endpoint, no second request. */
export async function getPostsPage(
  kind: ContentKind,
  page: number,
  perPage: number,
): Promise<PostPage> {
  const offset = (page - 1) * perPage;
  const rows = await get<ApiPost[]>(
    `/posts?kind=${kind}&limit=${perPage + 1}&offset=${offset}`,
    ["content", `content:${kind}`],
    TTL_LIST,
    true,
  );
  const all = (rows ?? []).map(toPost);
  return { posts: all.slice(0, perPage), hasMore: all.length > perPage };
}

/** The newest few — the footer's column, not a listing. */
export async function getRecentPosts(kind: ContentKind, n: number): Promise<ContentPost[]> {
  const rows = await get<ApiPost[]>(
    `/posts?kind=${kind}&limit=${n}`,
    ["content", `content:${kind}`],
    TTL_LIST,
    true,
  );
  return (rows ?? []).map(toPost);
}

export async function getAllSlugs(kind: ContentKind): Promise<string[]> {
  const rows = await get<{ kind: ContentKind; slug: string }[]>(
    "/sitemap",
    ["content"],
    TTL_LIST,
    true,
  );
  return (rows ?? []).filter((r) => r.kind === kind).map((r) => r.slug);
}

/** A post, or a redirect target when the slug has moved, or null when gone. */
export async function getPostWithHtml(
  kind: ContentKind,
  slug: string,
): Promise<ContentPostWithHtml | { redirectTo: string } | null> {
  const row = await get<ApiPost & { redirect_to?: string }>(
    `/posts/${kind}/${slug}`,
    ["content", `content:${kind}:${slug}`],
    TTL_POST,
  );
  if (!row) return null;
  if (row.redirect_to) return { redirectTo: row.redirect_to };
  return { ...toPost(row), contentHtml: row.body_html ?? "" };
}

export async function getRelatedPosts(
  kind: ContentKind,
  slug: string,
  limit = 3,
): Promise<ContentPost[]> {
  const rows = await get<ApiPost[]>(
    `/related/${kind}/${slug}?limit=${limit}`,
    ["content", `content:${kind}:${slug}`],
    TTL_POST,
    /* A missing "read next" strip is not worth 500-ing a post that rendered. */
    true,
  );
  return (rows ?? []).map(toPost);
}

/** Everything visible, for sitemap.xml. */
export async function getSitemapEntries(): Promise<
  { kind: ContentKind; slug: string; updatedAt: string }[]
> {
  const rows = await get<{ kind: ContentKind; slug: string; updated_at: string }[]>(
    "/sitemap",
    ["content"],
    TTL_LIST,
    true,
  );
  return (rows ?? []).map((r) => ({ kind: r.kind, slug: r.slug, updatedAt: r.updated_at }));
}
