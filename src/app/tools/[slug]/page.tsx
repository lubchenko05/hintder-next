import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToolDemo } from "@/components/tools/ToolDemo";
import { SectionArt } from "@/components/tools/SectionArt";
import { TOOLS, getTool } from "@/lib/tools";
import { seo } from "@/lib/seo";
import { ArrowRight } from "@/components/brand/Icons";

/* Static params keep these pre-rendered and keep the sitemap honest: every
   slug in the catalogue has a page, and nothing else resolves. */
export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return seo({ path: `/tools/${slug}` });
  return seo({
    path: `/tools/${tool.slug}`,
    title: `${tool.name} — ${tool.blurb}`,
    description: tool.lede,
    ogTitle: `${tool.name} · hintder`,
    ogDescription: tool.blurb,
  });
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();


  return (
    <>
      <Header />
      <main className="flex-1 pt-32 pb-24">
        <section className="px-5 sm:px-8">
          <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-center">
            <div>
              <h1
                className="font-display tracking-[-0.035em] leading-[0.94] text-[clamp(2.4rem,5.5vw,4.5rem)]"
                style={{ fontWeight: 400, textWrap: "balance" }}
              >
                {tool.title}{" "}
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
                  {tool.titleAccent}
                </span>
              </h1>
              <p
                className="mt-6 font-display text-[clamp(1rem,1.4vw,1.2rem)] text-text-secondary leading-[1.6] max-w-lg"
                style={{ fontWeight: 300 }}
              >
                {tool.lede}
              </p>
              <Link
                href={tool.href}
                className="group mt-8 inline-flex items-center gap-3 rounded-full px-9 py-[18px] text-white font-display italic text-[17px] transition-transform hover:scale-[1.02] active:scale-[0.99]"
                style={{
                  background:
                    "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
                  boxShadow: "0 16px 40px -12px rgba(254,60,114,0.55)",
                  fontWeight: 400,
                }}
              >
                {tool.cta}
                <ArrowRight size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div>
              <ToolDemo slug={tool.slug} />
            </div>
          </div>
        </section>

        {tool.sections.map((sec, si) => (
          <section key={sec.heading} className="px-5 sm:px-8 pt-16 sm:pt-24">
            <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <div className={si % 2 === 1 ? "lg:order-2" : ""}>
                <h2
                  className="font-display tracking-[-0.03em] leading-[1.1] text-[clamp(1.5rem,2.6vw,2.15rem)] mb-5"
                  style={{ fontWeight: 400, textWrap: "balance" }}
                >
                  {sec.heading}
                </h2>
                {sec.body.map((para, i) => (
                  <p
                    key={i}
                    className="font-display text-[16px] text-text-secondary leading-[1.7] mb-4 max-w-xl"
                    style={{ fontWeight: 300 }}
                  >
                    {para}
                  </p>
                ))}
              </div>
              <div className={si % 2 === 1 ? "lg:order-1" : ""}>
                <SectionArt spec={sec.art} />
              </div>
            </div>
          </section>
        ))}

        <section className="px-5 sm:px-8 pt-14 sm:pt-20">
          <div className="w-full max-w-7xl mx-auto">
            <div className="w-full">
            <h2
              className="font-display tracking-[-0.03em] leading-[1.05] text-[clamp(1.7rem,3vw,2.5rem)] mb-8"
              style={{ fontWeight: 400 }}
            >
              Questions people ask first
            </h2>
            <dl className="grid md:grid-cols-2 gap-x-16 gap-y-9">
              {tool.faq.map((f) => (
                <div key={f.q}>
                  <dt
                    className="font-display text-[17px] text-text mb-2"
                    style={{ fontWeight: 500 }}
                  >
                    {f.q}
                  </dt>
                  <dd
                    className="font-display text-[15.5px] text-text-secondary leading-[1.65] max-w-2xl"
                    style={{ fontWeight: 300 }}
                  >
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
            </div>
          </div>
        </section>

        {/* Rich result for the questions above — same text, so the markup can
            never drift from what the page shows. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: tool.faq.map((f) => ({
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
