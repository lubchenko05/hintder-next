import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { LegalDoc } from "@/components/LegalDoc";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({
  path: "/privacy",
  title: "Privacy Policy",
  description:
    "How Hintder collects, uses, stores, and protects your data — what we keep, how long, who we share it with, and the controls you have over it.",
});

export default function PrivacyPage() {
  return <LegalDoc slug="privacy-policy" />;
}
