import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Pager } from "@/components/content/Pager";
import type { ContentPost } from "@/lib/content";
import { ArrowRight } from "@/components/brand/Icons";

/* ─────────────────────────────────────────────
   StoryListPage — one page of the stories archive; /stories renders page 1,
   /stories/page/[n] the rest, both through this component.
   ───────────────────────────────────────────── */

export const STORIES_PER_PAGE = 12;

export function StoryListPage({
  posts,
  page,
  hasMore,
}: {
  posts: ContentPost[];
  page: number;
  hasMore: boolean;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 pt-32 pb-24">
        <section className="px-5 sm:px-8 pb-16 sm:pb-20">
          <div className="mx-auto max-w-7xl">
            <h1
              className="font-display tracking-[-0.035em] leading-[0.92] text-[clamp(2.75rem,7vw,5.5rem)] max-w-4xl"
              style={{ fontWeight: 400, textWrap: "balance" }}
            >
              It started with{" "}
              <span
                className="italic"
                style={{
                  background: "linear-gradient(95deg, #FE3C72, #FF8552)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: 300,
                }}
              >
                one message.
              </span>
            </h1>
            <p
              className="mt-6 font-display italic text-[16px] sm:text-[18px] text-text-secondary leading-[1.55] max-w-2xl"
              style={{ fontWeight: 300 }}
            >
              Real people who matched, found the right words, and ended up in
              something real — first dates, drawers at each other&apos;s places,
              whole relationships. Here&apos;s how a few of them began.
            </p>
          </div>
        </section>

        <section className="px-5 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.05] rounded-3xl overflow-hidden">
              {posts.map((post) => (
                <li key={post.slug} className="bg-bg">
                  <Link
                    href={`/stories/${post.slug}`}
                    className="group block h-full p-7 sm:p-9 transition-colors hover:bg-white/[0.015]"
                  >
                    <div
                      className="font-display italic text-[11px] tracking-[0.16em] uppercase text-flame mb-4"
                      style={{ fontWeight: 400 }}
                    >
                      {post.category}
                    </div>
                    <h2
                      className="font-display tracking-[-0.015em] leading-[1.1] text-[24px] sm:text-[30px] text-text"
                      style={{ fontWeight: 400, textWrap: "balance" }}
                    >
                      {post.title}
                    </h2>
                    <p
                      className="mt-5 font-display italic text-[15px] text-text-secondary leading-[1.55]"
                      style={{ fontWeight: 300 }}
                    >
                      {post.excerpt}
                    </p>
                    <div
                      className="mt-7 flex items-center justify-between font-display italic text-[12px] text-text-muted"
                      style={{ fontWeight: 300 }}
                    >
                      {post.persona && <span>{post.persona}</span>}
                      <span className="inline-flex items-center gap-1.5 text-flame group-hover:translate-x-0.5 transition-transform">
                        full story
                        <ArrowRight size={11} />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Pager base="/stories" page={page} hasMore={hasMore} />
          </div>
        </section>

        <section className="px-5 sm:px-8 mt-20 sm:mt-28">
          <div className="mx-auto max-w-4xl text-center">
            <p
              className="font-display italic text-[14px] text-text-muted mb-5"
              style={{ fontWeight: 300 }}
            >
              your turn to write one.
            </p>
            <Link
              href="/app"
              className="group inline-flex items-center gap-3 sm:gap-4 px-7 sm:px-9 py-4 sm:py-5 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.99]"
              style={{
                background:
                  "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
                boxShadow: "0 18px 40px -10px rgba(254,60,114,0.6)",
              }}
            >
              <span
                className="text-[18px] sm:text-[22px] font-display italic text-white"
                style={{ fontWeight: 400 }}
              >
                read a profile
              </span>
              <ArrowRight size={20} className="text-white" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
