import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Hintder collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return <LegalDoc slug="privacy-policy" />;
}
