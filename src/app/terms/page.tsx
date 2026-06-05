import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Hintder.",
};

export default function TermsPage() {
  return <LegalDoc slug="terms-of-service" />;
}
