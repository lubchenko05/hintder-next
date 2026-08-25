/* ─────────────────────────────────────────────
   content-fs.ts — the markdown-file content source.

   The original loader, kept intact while the migration runs so the site can be
   switched back with an env var. Deleted in P3 once the API has served real
   traffic without regressions.
   ───────────────────────────────────────────── */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  ContentKind,
  ContentPost,
  ContentPostWithHtml,
  StoryBlock,
  StoryMetric,
  StoryThreadMessage,
} from "@/lib/content-types";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

/* ─────────────────────────────────────────────
   content.ts — generic markdown loader used by
   both Guides and Success Stories. Same pattern
   as the Seeto blog: gray-matter for frontmatter,
   remark/rehype to produce HTML.
   ───────────────────────────────────────────── */



function dirFor(kind: ContentKind): string {
  return path.join(process.cwd(), "content", kind);
}

function files(kind: ContentKind): string[] {
  const dir = dirFor(kind);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
}

function toPost(slug: string, kind: ContentKind, data: Record<string, unknown>): ContentPost {
  return {
    slug,
    kind,
    title: (data.title as string) ?? "",
    seoTitle: data.seoTitle as string | undefined,
    subtitle: data.subtitle as string | undefined,
    excerpt: (data.excerpt as string) ?? "",
    category: (data.category as string) ?? "",
    date: (data.date as string) ?? "",
    readTime: (data.readTime as string) ?? "",
    persona: data.persona as string | undefined,
    blocks: data.blocks as StoryBlock[] | undefined,
    metrics: data.metrics as StoryMetric[] | undefined,
    opener: data.opener as string | undefined,
    thread: data.thread as StoryThreadMessage[] | undefined,
    quote: data.quote as string | undefined,
    quoteBy: data.quoteBy as string | undefined,
  };
}

export function getAllPosts(kind: ContentKind): ContentPost[] {
  return files(kind)
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dirFor(kind), file), "utf-8");
      const { data } = matter(raw);
      return toPost(slug, kind, data);
    })
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
}

export function getAllSlugs(kind: ContentKind): string[] {
  return files(kind).map((f) => f.replace(/\.md$/, ""));
}

/** Convert a raw markdown string to sanitised-enough HTML (same pipeline as posts).
    Used for backend-served legal documents (terms / privacy / refund). */
export async function markdownToHtml(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(md);
  return String(result);
}

export async function getPostWithHtml(
  kind: ContentKind,
  slug: string,
): Promise<ContentPostWithHtml | null> {
  const filePath = path.join(dirFor(kind), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content);
  return {
    ...toPost(slug, kind, data),
    contentHtml: String(result),
  };
}

export function getRelatedPosts(
  kind: ContentKind,
  slug: string,
  category: string,
  limit = 3,
): ContentPost[] {
  const all = getAllPosts(kind).filter((p) => p.slug !== slug);
  const same = all.filter((p) => p.category === category);
  const other = all.filter((p) => p.category !== category);
  return [...same, ...other].slice(0, limit);
}
