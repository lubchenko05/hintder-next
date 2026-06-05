"use client";

import Link from "next/link";
import { ArrowRight, PassShape } from "@/components/brand/Icons";
import { useSubscription } from "@/hooks/useSubscription";

/* ─────────────────────────────────────────────
   Paywall — shown when the user runs out of hints. Subscriptions only:
   no plan → pitch plans; on a token plan → pitch an upgrade to a bigger one.
   (One-time top-ups were removed.)
   ───────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Paywall({ open, onClose }: Props) {
  const { subscription, tierLabel } = useSubscription();
  const hasPlan = subscription !== null && subscription.status === "active";

  if (!open) return null;

  const heading = hasPlan ? "Out of hints" : "That was your";
  const headingAccent = hasPlan ? "this cycle." : "free one.";
  const body = hasPlan
    ? `You're on ${tierLabel ?? "your plan"}. Move up to a bigger plan for more hints every month — your unused ones still roll over.`
    : "Subscribe for hints every month — they roll over, so nothing's wasted. Upgrade or cancel anytime.";
  const cta = hasPlan ? "Upgrade your plan" : "See plans — from $4.99/mo";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-7 sm:p-9"
        style={{
          background:
            "linear-gradient(160deg, rgba(254,60,114,0.08), rgba(255,133,82,0.03) 60%, rgba(15,12,20,1))",
          border: "1px solid rgba(254,60,114,0.25)",
          boxShadow: "0 30px 80px -20px rgba(254,60,114,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/15 bg-white/[0.03] hover:border-white/30 transition-colors flex items-center justify-center text-text-secondary"
        >
          <PassShape size={14} />
        </button>

        <h2
          className="font-display tracking-[-0.03em] leading-[0.95] text-[clamp(1.75rem,4vw,2.5rem)] mb-4"
          style={{ fontWeight: 400, textWrap: "balance" }}
        >
          {heading}{" "}
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
            {headingAccent}
          </span>
        </h2>

        <p
          className="font-display italic text-[14.5px] text-text-secondary leading-[1.55] mb-7"
          style={{ fontWeight: 300 }}
        >
          {body}
        </p>

        <Link
          href="/pricing"
          onClick={onClose}
          className="group flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl font-display italic text-white text-[15px] transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
            boxShadow: "0 18px 40px -12px rgba(254,60,114,0.55)",
            fontWeight: 400,
          }}
        >
          {cta}
          <ArrowRight
            size={15}
            className="text-white transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
}
