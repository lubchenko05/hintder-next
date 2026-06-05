import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Hintder's refund terms — 14-day money-back guarantee.",
};

export default function RefundPage() {
  return <LegalDoc slug="refund-policy" />;
}
