import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AggregateArt } from "@/components/tools/AggregateArt";
import { TOOLS, TOOLS_FAQ } from "@/lib/tools";
import { seo } from "@/lib/seo";
import { ArrowRight } from "@/components/brand/Icons";

export const metadata: Metadata = seo({
  path: "/tools",
  title: "Dating App Tools — Openers, Reply Decoder & Profile Review",
  description:
    "Three tools for the three moments that decide it: writing the opener, answering her reply, and fixing the profile she swipes on. One free hint each.",
});

export default function ToolsIndexPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-32 pb-24">
        <section className="px-5 sm:px-8 pt-4 pb-12 sm:pb-16">
          <div className="w-full max-w-7xl mx-auto">
            <h1
              className="font-display tracking-[-0.035em] leading-[0.92] text-[clamp(2.75rem,7vw,5.5rem)] max-w-5xl"
              style={{ fontWeight: 400, textWrap: "balance" }}
            >
              Stop guessing what to send.{" "}
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
                Send the thing she answers.
              </span>
            </h1>
          </div>
        </section>

        {TOOLS.map((tool, i) => {
          const flip = i % 2 === 1;
          return (
            <section
              key={tool.slug}
              className="px-5 sm:px-8 py-16 sm:py-24"
            >
              <div
                className="w-full max-w-7xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center"
              >
                <div className={flip ? "lg:order-2" : ""}>
                  <h2
                    className="font-display tracking-[-0.03em] leading-[1] text-[clamp(1.9rem,3.6vw,3rem)]"
                    style={{ fontWeight: 400, textWrap: "balance" }}
                  >
                    {tool.name}
                  </h2>
                  <p
                    className="mt-4 font-display text-[clamp(0.98rem,1.3vw,1.15rem)] text-text-secondary leading-[1.6] max-w-lg"
                    style={{ fontWeight: 300 }}
                  >
                    {tool.lede}
                  </p>

                  <ul className="mt-6 space-y-2">
                    {tool.gives.map((g) => (
                      <li
                        key={g}
                        className="flex items-baseline gap-3 font-display text-[14.5px] text-text-muted leading-[1.5]"
                        style={{ fontWeight: 300 }}
                      >
                        <span className="text-flame">·</span>
                        {g}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href={tool.href}
                      className="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-white font-display italic text-[16px] transition-transform hover:scale-[1.02] active:scale-[0.99]"
                      style={{
                        background:
                          "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
                        boxShadow: "0 16px 40px -12px rgba(254,60,114,0.55)",
                        fontWeight: 400,
                      }}
                    >
                      {tool.cta}
                      <ArrowRight size={15} className="text-white group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="font-display italic text-[14px] text-text-muted hover:text-text transition-colors"
                      style={{ fontWeight: 300 }}
                    >
                      how it works →
                    </Link>
                  </div>
                </div>

                <div className={`${flip ? "lg:order-1" : ""} w-full min-h-[clamp(240px,30vh,320px)] flex items-center`}>
                  <AggregateArt slug={tool.slug} />
                </div>
              </div>
            </section>
          );
        })}
        <section className="px-5 sm:px-8 pt-16 sm:pt-24">
          <div className="w-full max-w-7xl mx-auto">
            <h2
              className="font-display tracking-[-0.03em] leading-[1.05] text-[clamp(1.8rem,3.2vw,2.75rem)] mb-10 max-w-2xl"
              style={{ fontWeight: 400, textWrap: "balance" }}
            >
              Before you spend a hint
            </h2>
            <dl className="grid md:grid-cols-2 gap-x-16 gap-y-9">
              {TOOLS_FAQ.map((f) => (
                <div key={f.q}>
                  <dt
                    className="font-display text-[17.5px] text-text mb-2"
                    style={{ fontWeight: 500 }}
                  >
                    {f.q}
                  </dt>
                  <dd
                    className="font-display text-[15.5px] text-text-secondary leading-[1.65] max-w-lg"
                    style={{ fontWeight: 300 }}
                  >
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: TOOLS_FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </main>
      <Footer />
    </>
  );
}
