"use client";

import { motion } from "framer-motion";

/* ── Tiers as "match" cards ──────────────────── */

const tiers = [
  {
    emoji: "👋",
    name: "Free",
    price: "$0",
    credits: "3 hints",
    vibe: "On us. No card.",
    perks: ["3 hints", "5 openers each", "One tone"],
  },
  {
    emoji: "🍷",
    name: "Starter",
    price: "$2.99",
    credits: "5 hints",
    vibe: "Weekend swipe session",
    perks: ["5 hints", "Reply coach", "All styles"],
  },
  {
    emoji: "🔥",
    name: "Player",
    price: "$9.99",
    credits: "15 hints",
    vibe: "Serious about this",
    popular: true,
    perks: ["15 hints", "Reply coach", "Regenerate", "All tones"],
  },
  {
    emoji: "🚀",
    name: "Stash",
    price: "$29.99",
    credits: "50 hints",
    vibe: "All-in for the season",
    perks: ["50 hints", "Everything", "Priority", "Early features"],
  },
];

const fade = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.4, delay: i * 0.08 },
});

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-5">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <motion.div className="text-center mb-12" {...fade(0)}>
          <p className="text-sm text-violet font-semibold tracking-wide uppercase mb-2">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Credits, not subscriptions
          </h2>
          <p className="mt-3 text-text-muted text-sm">
            Pay once. Use when you need it. No recurring charges.
          </p>
        </motion.div>

        {/* Cards — 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className={`group relative rounded-2xl p-[1px] transition-all duration-300 ${
                tier.popular
                  ? "bg-gradient-to-b from-accent/60 to-violet/60 shadow-xl shadow-accent/10 hover:shadow-2xl hover:shadow-accent/20"
                  : "bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-white/[0.12] hover:to-white/[0.04]"
              }`}
              {...fade(i + 1)}
            >
              <div className="rounded-2xl bg-bg-card p-5 h-full flex flex-col">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{tier.emoji}</span>
                    <div>
                      <h3 className="font-bold text-text text-base">
                        {tier.name}
                      </h3>
                      <p className="text-[11px] text-text-muted italic">
                        {tier.vibe}
                      </p>
                    </div>
                  </div>
                  {tier.popular && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider gradient-accent text-white">
                      Hot
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-extrabold text-text">
                    {tier.price}
                  </span>
                  <span className="text-xs text-text-muted">
                    / {tier.credits}
                  </span>
                </div>

                {/* Perks as pills */}
                <div className="flex flex-wrap gap-1.5 mb-5 flex-1">
                  {tier.perks.map((perk) => (
                    <span
                      key={perk}
                      className="px-2.5 py-1 rounded-full text-[11px] bg-bg-elevated text-text-secondary border border-border"
                    >
                      {perk}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button
                  className={`w-full py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                    tier.popular
                      ? "gradient-accent text-white shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 active:scale-[0.97]"
                      : "bg-bg-elevated text-text-secondary border border-border hover:text-text hover:border-border-hover active:scale-[0.97]"
                  }`}
                >
                  Get {tier.credits}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
