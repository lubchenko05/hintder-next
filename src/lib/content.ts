import fs from "fs";
import path from "path";
import matter from "gray-matter";
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

export type ContentKind = "guides" | "stories";

export interface StoryMetric {
  label: string;
  before: string;
  after: string;
}

export interface StoryThreadMessage {
  role: "me" | "her";
  text: string;
}

/* ─────────────────────────────────────────────
   Story blocks — a story is a free-form sequence
   of these. Each story picks which blocks it wants,
   in what order. That's how we avoid the "every
   story looks identical" problem.
   ───────────────────────────────────────────── */
export type StoryBlock =
  | { type: "metrics"; metrics: StoryMetric[]; eyebrow?: string }
  | { type: "opener"; opener: string; eyebrow?: string; meta?: string }
  | { type: "thread"; messages: StoryThreadMessage[]; eyebrow?: string }
  | { type: "quote"; quote: string; attribution?: string }
  | {
      type: "opener-comparison";
      old: string;
      new: string;
      note?: string;
      eyebrow?: string;
    }
  | {
      type: "workflow-drafts";
      her: string;
      drafts: { text: string; picked?: boolean; note?: string }[];
      eyebrow?: string;
    }
  | {
      type: "readiness-gauge";
      before: number;
      after: number;
      threshold?: number;
      caption?: string;
      eyebrow?: string;
    }
  | {
      type: "timeline";
      eyebrow?: string;
      milestones: { when: string; title: string; note?: string }[];
    };

export interface ContentPost {
  slug: string;
  kind: ContentKind;
  title: string;
  subtitle?: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  /** Optional: for stories — the "person" the story is about. */
  persona?: string;
  /** Ordered story blocks rendered above the markdown body. */
  blocks?: StoryBlock[];
  /* ─── Legacy story fields — still supported as fallback when
     no `blocks` array is present. New stories should use `blocks`. */
  metrics?: StoryMetric[];
  opener?: string;
  thread?: StoryThreadMessage[];
  /** Pull-quote rendered editorially in the body. */
  quote?: string;
  /** Attribution for the quote, defaults to persona. */
  quoteBy?: string;
}

export interface ContentPostWithHtml extends ContentPost {
  contentHtml: string;
}

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
