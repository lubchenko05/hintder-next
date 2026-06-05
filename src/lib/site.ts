/* Canonical site URL — single source of truth for metadata, sitemap, and robots.
   Override per environment with NEXT_PUBLIC_APP_URL; defaults to production. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://hintder.ai"
).replace(/\/$/, "");
