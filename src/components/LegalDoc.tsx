import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { markdownToHtml } from "@/lib/content";
import type { LegalSlug } from "@/lib/api";

/* ─────────────────────────────────────────────
   LegalDoc — server-renders a legal document. The markdown lives in the backend
   (dating-api/dating/static/*.md) and is served at /api/v1/legal/<slug>; we fetch
   it per request, convert to HTML with the same remark pipeline as the guides,
   and render it. SSR'd so it indexes cleanly.
   ───────────────────────────────────────────── */

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010";

export async function LegalDoc({ slug }: { slug: LegalSlug }) {
  let html = "";
  let failed = false;
  try {
    const res = await fetch(`${API}/api/v1/legal/${slug}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`legal ${slug} ${res.status}`);
    const { content } = (await res.json()) as { content: string };
    html = await markdownToHtml(content);
  } catch {
    failed = true;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-20 px-5 sm:px-8">
        <div className="mx-auto max-w-3xl">
          {failed ? (
            <p
              className="font-display italic text-[15px] text-text-secondary leading-relaxed"
              style={{ fontWeight: 300 }}
            >
              This document is temporarily unavailable. Please try again shortly, or
              email <span className="text-flame">support@hintder.ai</span>.
            </p>
          ) : (
            <article
              className="legal-doc prose prose-invert max-w-none font-display"
              style={{ fontWeight: 300 }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
