"use client";

import { motion } from "framer-motion";

/* ── Chat-thread timeline ──────────────────────── */

const steps = [
  {
    emoji: "📸",
    bubble: "Drop her screenshots here",
    detail: "Bio, photos, prompts — we see it all",
    side: "right" as const,
    accent: false,
  },
  {
    emoji: "🧠",
    bubble: "Reading her profile...",
    detail: "Hooks, vibe, angles — analyzed in seconds",
    side: "left" as const,
    accent: true,
  },
  {
    emoji: "🎨",
    bubble: "Pick how you wanna sound",
    detail: "Funny, confident, calm — 5-10 options, zero cringe",
    side: "right" as const,
    accent: false,
  },
  {
    emoji: "💬",
    bubble: "She replied? Paste it",
    detail: "Interest level + what to write next",
    side: "left" as const,
    accent: true,
  },
];

const fade = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.4, delay: i * 0.12 },
});

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-5">
      <div className="max-w-md mx-auto">
        {/* Section heading */}
        <motion.div className="text-center mb-14" {...fade(0)}>
          <p className="text-sm text-accent font-semibold tracking-wide uppercase mb-2">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Like texting a<br />
            <span className="gradient-text">wingman&nbsp;who&nbsp;gets&nbsp;it</span>
          </h2>
        </motion.div>

        {/* Chat-thread timeline */}
        <div className="relative">
          {/* Connecting gradient line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--color-accent) 15%, var(--color-violet) 85%, transparent)",
            }}
          />

          <div className="space-y-6">
            {steps.map((step, i) => {
              const isRight = step.side === "right";
              return (
                <motion.div
                  key={i}
                  className={`relative flex items-start gap-3 ${
                    isRight ? "flex-row" : "flex-row-reverse"
                  }`}
                  {...fade(i + 1)}
                >
                  {/* Bubble side */}
                  <div
                    className={`flex-1 ${isRight ? "text-right" : "text-left"}`}
                  >
                    <div
                      className={`inline-block max-w-[260px] px-4 py-3 rounded-2xl text-left ${
                        step.accent
                          ? "bg-violet/10 border border-violet/20 rounded-tl-md"
                          : "bg-bg-card border border-border rounded-tr-md"
                      }`}
                    >
                      <p className="text-sm font-medium text-text leading-snug">
                        {step.bubble}
                      </p>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </div>

                  {/* Center emoji node */}
                  <div className="relative z-10 shrink-0 w-10 h-10 rounded-full bg-bg-card border-2 border-border flex items-center justify-center text-lg shadow-lg shadow-black/20">
                    {step.emoji}
                  </div>

                  {/* Empty side for alignment */}
                  <div className="flex-1" />
                </motion.div>
              );
            })}
          </div>

          {/* Terminal node */}
          <motion.div
            className="relative z-10 w-8 h-8 mx-auto mt-6 rounded-full gradient-accent flex items-center justify-center shadow-lg shadow-accent/30"
            {...fade(5)}
          >
            <span className="text-white text-xs font-bold">✓</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
