import Link from "next/link";

/* ─────────────────────────────────────────────
   Pager — newer/older navigation under a listing.

   Plain links on purpose: every page is a real URL a crawler can walk, which
   is the whole reason the listings are paginated routes rather than a
   load-more button holding the archive hostage to JavaScript.
   ───────────────────────────────────────────── */

export function Pager({
  base,
  page,
  hasMore,
}: {
  /** "/guides" — page 1 lives here, deeper pages at `${base}/page/N`. */
  base: string;
  page: number;
  hasMore: boolean;
}) {
  if (page === 1 && !hasMore) return null;
  const href = (n: number) => (n === 1 ? base : `${base}/page/${n}`);

  return (
    <nav
      aria-label="Pages"
      className="mt-14 flex items-center justify-center gap-8 font-display italic text-[14px]"
      style={{ fontWeight: 300 }}
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className="text-text-secondary hover:text-flame transition-colors">
          ← newer
        </Link>
      ) : (
        <span className="text-text-muted/30">← newer</span>
      )}
      <span className="text-text-muted text-[12.5px] tabular-nums">page {page}</span>
      {hasMore ? (
        <Link href={href(page + 1)} className="text-text-secondary hover:text-flame transition-colors">
          older →
        </Link>
      ) : (
        <span className="text-text-muted/30">older →</span>
      )}
    </nav>
  );
}
