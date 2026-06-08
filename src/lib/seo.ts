import type { Metadata } from "next";

/* ─────────────────────────────────────────────
   SEO helpers. The crawler flagged "Open Graph URL not matching canonical" —
   og:url was the apex root on every page while the canonical was per-page. Next
   REPLACES the whole openGraph object when a page overrides it, so we re-supply
   the shared fields here and keep og:url === canonical. (og:image comes from the
   opengraph-image file convention and is unaffected by this.)
   ───────────────────────────────────────────── */

export const SITE_NAME = "Hintder";

const OG_TITLE = "Hintder — Your Dating Wingman";
const OG_DESCRIPTION =
  "Upload a dating profile screenshot, get an opener that doesn't sound like everyone else — then a reply coach for the whole conversation. Your AI dating wingman.";

export function seo(opts: {
  path: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
}): Metadata {
  const { path, title, description, ogTitle, ogDescription } = opts;
  return {
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle ?? OG_TITLE,
      description: ogDescription ?? OG_DESCRIPTION,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      url: path,
    },
  };
}

/* Clamp a description to <= max chars on a word boundary. Search engines cut
   meta descriptions around 160 chars anyway, so long story excerpts (which the
   audit flagged as "too long") get a clean, sentence-aware trim. */
export function clampDescription(text: string, max = 160): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[.,;:\s]+$/, "")}…`;
}
