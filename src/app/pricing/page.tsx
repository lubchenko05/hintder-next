import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingPlans } from "@/components/PricingCards";
import { PricingFAQ } from "@/components/PricingFAQ";

export const metadata: Metadata = seo({
  path: "/pricing",
  title: "Pricing",
  description:
    "Subscribe for AI dating hints every month — Lite, Plus, Pro, or unlimited Ultimate. Unused hints roll over, your first 3 are free. Cancel anytime.",
});

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20 pb-8 lg:pt-24 lg:pb-10">
        <section className="relative px-5 sm:px-8 pb-6 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            <h1
              className="font-display tracking-[-0.035em] leading-[0.95] text-[clamp(1.75rem,3.5vw,2.75rem)]"
              style={{ fontWeight: 400, textWrap: "balance" }}
            >
              Hints, every month —{" "}
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
                they roll over.
              </span>
            </h1>
          </div>
        </section>

        <section className="px-5 sm:px-8">
          <div className="mx-auto max-w-7xl space-y-12">
            <PricingPlans />
            <PricingFAQ />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
