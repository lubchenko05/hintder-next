import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { LegalDoc } from "@/components/LegalDoc";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({
  path: "/terms",
  title: "Terms of Service",
  description:
    "The terms governing your use of Hintder — your account, hints and subscriptions, acceptable use, refunds, and the legal basics. Read before you sign up.",
});

export default function TermsPage() {
  return <LegalDoc slug="terms-of-service" />;
}
