/* ─────────────────────────────────────────────
   content-types.ts — the shape of a guide or a story.

   Split out of content.ts so both content sources (the markdown files during
   the migration, the API afterwards) speak the same types without importing
   each other's implementation — content-api.ts must never pull in `fs`.
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
  /** Optional short SEO <title> override — the display title can run longer
   *  than the ~60-char limit search engines want. */
  seoTitle?: string;
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
