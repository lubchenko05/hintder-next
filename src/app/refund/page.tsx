import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { LegalDoc } from "@/components/LegalDoc";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({
  path: "/refund",
  title: "Refund Policy",
  description:
    "Hintder's refund policy in plain language — a 14-day money-back guarantee on hint packs and subscriptions. Here's exactly how to request one.",
});

export default function RefundPage() {
  return <LegalDoc slug="refund-policy" />;
}
