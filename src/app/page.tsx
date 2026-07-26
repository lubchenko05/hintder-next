import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { LiveTicker } from "@/components/landing/LiveTicker";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { Tools } from "@/components/landing/Tools";
import { Comparison } from "@/components/landing/Comparison";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  // Self-referencing canonical so http/https + trailing-slash variants don't
  // read as duplicate pages.
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="flex-1 select-none">
        <Hero />
        <LiveTicker />
        <Tools />
        <LiveDemo />
        <Comparison />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
