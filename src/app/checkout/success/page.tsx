"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mark } from "@/components/brand/Mark";
import { ArrowRight } from "@/components/brand/Icons";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center px-5 bg-bg">
          <div
            className="font-display italic text-text-muted text-[14px]"
            style={{ fontWeight: 300 }}
          >
            loading…
          </div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────
   Post-checkout landing. Hints are already credited to the account (granted
   server-side), so this just confirms and routes into the app. No magic link —
   the user is authenticated and the balance lives on their account.
   ───────────────────────────────────────────── */

function SuccessContent() {
  const params = useSearchParams();
  const hints = Number(params.get("hints") || 0);

  return (
    <main className="min-h-dvh flex items-center justify-center px-5 py-10 bg-bg">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2.5 mb-10">
          <Mark size={20} />
          <span className="font-black tracking-tight text-text lowercase text-[14px]">
            hintder
          </span>
        </div>

        <h1
          className="font-display tracking-[-0.035em] leading-[0.95] text-[clamp(2.25rem,5vw,3.5rem)] mb-6"
          style={{ fontWeight: 400, textWrap: "balance" }}
        >
          {hints > 0 ? `${hints} ${hints === 1 ? "hint" : "hints"} ` : "Hints "}
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
            in the bag.
          </span>
        </h1>

        <p
          className="font-display italic text-[16px] text-text-secondary leading-[1.5] max-w-sm mx-auto"
          style={{ fontWeight: 300 }}
        >
          They&apos;re on your account and ready to spend. Go read a profile.
        </p>

        <Link
          href="/app?resumed=1"
          className="group inline-flex items-center gap-3 mt-10"
        >
          <span
            className="relative inline-flex items-center justify-center w-14 h-14 rounded-full overflow-hidden transition-transform group-hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #FE3C72, #FF8552)",
              boxShadow: "0 14px 32px -10px rgba(254,60,114,0.55)",
            }}
          >
            <ArrowRight size={20} className="text-white" />
          </span>
          <span
            className="text-[20px] font-display italic text-text border-b border-text/20 group-hover:border-flame pb-1 transition-colors"
            style={{ fontWeight: 400 }}
          >
            read a profile
          </span>
        </Link>
      </div>
    </main>
  );
}
