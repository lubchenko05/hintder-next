"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   PricingFAQ — editorial accordion for the pricing page. Subscription-specific
   questions (rollover, switching, unlimited, cancel, refund). No rate-limit
   talk — the plans sell on benefits, not caveats.
   ───────────────────────────────────────────── */

type Item = { q: string; a: string };

const ITEMS: Item[] = [
  {
    q: "What's a hint?",
    a: "One AI move — reading a profile into openers, or coaching your next reply. A few hints carry a match from first message to date.",
  },
  {
    q: "Which dating apps does it work with?",
    a: "All of them. Tinder, Hinge, Bumble, the new one you tried last week — if you can screenshot it, we can read it.",
  },
  {
    q: "Can I switch plans later?",
    a: "Anytime. Move up when you're swiping more, drop down when you're not — it takes effect from your next cycle.",
  },
  {
    q: "What does Ultimate's “unlimited” mean?",
    a: "Read, draft, and coach as much as you want — no balance to track, no counting. The whole month, on tap.",
  },
  {
    q: "Monthly or yearly?",
    a: "Yearly runs about 15% cheaper — roughly two months free for the same plan.",
  },
  {
    q: "How do I cancel?",
    a: "One click in your account. You keep everything through the period you've already paid for, and there's a 14-day refund window.",
  },
];

export function PricingFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="pt-4">
      <div className="flex items-baseline gap-3 mb-2">
        <h2 className="font-display italic text-flame text-[14px]" style={{ fontWeight: 400 }}>
          questions
        </h2>
        <span className="h-px flex-1 bg-gradient-to-r from-flame/40 to-transparent" />
      </div>

      <div className="divide-y divide-white/[0.06]">
        {ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full text-left py-4 sm:py-5 flex items-center justify-between gap-4 group"
              >
                <span
                  className={cn(
                    "font-display text-[16px] sm:text-[18px] transition-colors",
                    isOpen ? "text-text" : "text-text-secondary group-hover:text-text",
                  )}
                  style={{ fontWeight: 400 }}
                >
                  {item.q}
                </span>
                <span
                  className={cn(
                    "shrink-0 inline-flex items-center justify-center w-6 h-6 text-text-muted transition-transform",
                    isOpen && "rotate-45 text-flame",
                  )}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
              {isOpen && (
                <p
                  className="pb-5 -mt-1 font-display italic text-[14.5px] sm:text-[15px] text-text-secondary leading-[1.6] max-w-2xl animate-fade-up"
                  style={{ fontWeight: 300 }}
                >
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
