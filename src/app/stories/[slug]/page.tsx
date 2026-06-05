import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  getAllSlugs,
  getPostWithHtml,
  getRelatedPosts,
} from "@/lib/content";
import {
  MetricsCard,
  OpenerCard,
  PullQuote,
  StoryBlockRenderer,
  ThreadPreview,
} from "@/components/stories/StoryBlocks";
import { ArrowRight } from "@/components/brand/Icons";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllSlugs("stories").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostWithHtml("stories", slug);
  if (!post) return { title: "Story — hintder" };
  return {
    title: `${post.title} — hintder`,
    description: post.excerpt,
  };
}

export default async function StoryPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostWithHtml("stories", slug);
  if (!post) return notFound();
  const related = getRelatedPosts("stories", post.slug, post.category, 3);

  return (
    <>
      <Header />
      <main className="flex-1 pt-32 pb-24">
        <article className="px-5 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 font-display italic text-[12.5px] text-text-muted hover:text-text transition-colors mb-8"
              style={{ fontWeight: 300 }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              all stories
            </Link>

            <div
              className="font-display italic text-[11px] tracking-[0.16em] uppercase text-flame flex items-center gap-2 mb-5 w-fit"
              style={{ fontWeight: 400 }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--color-flame)" }}
              />
              {post.category}
            </div>

            <h1
              className="font-display tracking-[-0.025em] leading-[1.05] text-[clamp(2rem,5vw,3.75rem)]"
              style={{ fontWeight: 400, textWrap: "balance" }}
            >
              {post.title}
            </h1>

            {post.subtitle && (
              <p
                className="mt-5 font-display italic text-[clamp(1.05rem,2.5vw,1.25rem)] text-text-secondary leading-[1.5]"
                style={{ fontWeight: 300 }}
              >
                {post.subtitle}
              </p>
            )}

            <div
              className="mt-6 flex items-center gap-3 font-display italic text-[12px] text-text-muted"
              style={{ fontWeight: 300 }}
            >
              {post.persona && (
                <>
                  <span>{post.persona}</span>
                  <span aria-hidden>·</span>
                </>
              )}
              <span>{post.readTime}</span>
            </div>

            {/* Interactive blocks — each story picks its own sequence.
                When `blocks` is defined we use it as the source of truth;
                otherwise fall back to the legacy metrics → opener → thread
                fixed shape so older stories still render. */}
            {post.blocks && post.blocks.length > 0 ? (
              post.blocks.map((block, i) => (
                <StoryBlockRenderer key={i} block={block} />
              ))
            ) : (
              <>
                {post.metrics && post.metrics.length > 0 && (
                  <MetricsCard metrics={post.metrics} />
                )}
                {post.opener && <OpenerCard opener={post.opener} />}
                {post.thread && post.thread.length > 0 && (
                  <ThreadPreview messages={post.thread} />
                )}
              </>
            )}

            {/* Narrative body — always rendered from markdown */}
            <div
              className="prose prose-invert mt-14 max-w-none font-display"
              style={{ fontWeight: 300 }}
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {/* Legacy fallback pull-quote (only when blocks array is absent) */}
            {!post.blocks && post.quote && (
              <PullQuote
                quote={post.quote}
                attribution={post.quoteBy ?? post.persona}
              />
            )}

            {/* Final inline CTA */}
            <div
              className="mt-16 sm:mt-20 p-7 sm:p-9 rounded-3xl"
              style={{
                background:
                  "linear-gradient(160deg, rgba(254,60,114,0.10), rgba(255,133,82,0.04) 70%, rgba(15,12,20,0.6))",
                border: "1px solid rgba(254,60,114,0.25)",
              }}
            >
              <p
                className="font-display tracking-[-0.015em] leading-[1.1] text-[clamp(1.4rem,3.5vw,1.875rem)] max-w-xl"
                style={{ fontWeight: 400, textWrap: "balance" }}
              >
                Your turn to{" "}
                <span
                  className="italic"
                  style={{
                    background:
                      "linear-gradient(95deg, #FE3C72, #FF8552)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: 300,
                  }}
                >
                  write the next one.
                </span>
              </p>
              <Link
                href="/app"
                className="group inline-flex items-center gap-3 mt-6 px-6 py-3.5 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.99]"
                style={{
                  background:
                    "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
                  boxShadow: "0 18px 40px -12px rgba(254,60,114,0.55)",
                }}
              >
                <span
                  className="text-[15px] sm:text-[16px] font-display italic text-white"
                  style={{ fontWeight: 400 }}
                >
                  read a profile
                </span>
                <ArrowRight size={16} className="text-white" />
              </Link>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="px-5 sm:px-8 mt-24">
            <div className="mx-auto max-w-7xl">
              <h2
                className="font-display italic text-flame text-[14px] mb-6"
                style={{ fontWeight: 400 }}
              >
                more stories
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] rounded-3xl overflow-hidden">
                {related.map((r) => (
                  <li key={r.slug} className="bg-bg">
                    <Link
                      href={`/stories/${r.slug}`}
                      className="block p-6 sm:p-7 hover:bg-white/[0.015] transition-colors"
                    >
                      <div
                        className="font-display italic text-[10.5px] tracking-[0.16em] uppercase text-flame mb-3"
                        style={{ fontWeight: 400 }}
                      >
                        {r.category}
                      </div>
                      <h3
                        className="font-display text-[17px] sm:text-[18px] leading-[1.2] text-text"
                        style={{ fontWeight: 400 }}
                      >
                        {r.title}
                      </h3>
                      <p
                        className="mt-3 font-display italic text-[13px] text-text-muted leading-[1.55]"
                        style={{ fontWeight: 300 }}
                      >
                        {r.excerpt}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
