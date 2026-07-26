"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "@/components/brand/Icons";

/* ─────────────────────────────────────────────
   COMPARISON — phone-shaped mockup on the LEFT,
   title + scenario meta on the RIGHT. 2-col grid,
   no narrow centered container.
   ───────────────────────────────────────────── */

type Pair = {
  scenario: string;
  bad: string;
  good: string;
  reply: string;
};

const PAIRS: Pair[] = [
  {
    scenario: "she has a cat in her photo",
    bad: "Cute cat!",
    good: "Real talk — is your cat the third wheel or are you?",
    reply: "lmao the third wheel for sure 😭",
  },
  {
    scenario: "Bali photo, caption 'escaped deadlines'",
    bad: "Bali looks amazing, have you been a lot?",
    good: "How long did 'escaped deadlines' last before the deadlines won?",
    reply: "honestly about three days before I got an email",
  },
  {
    scenario: "bio: 'cooks better than your grandma'",
    bad: "I'd love to try your cooking sometime",
    good: "Big claim. Does grandma know about this or are we keeping it quiet?",
    reply: "she'd whip me. it's our family secret",
  },
];

type Phase = "bad" | "morph" | "good" | "reply";

export function Comparison() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("bad");
  const pair = PAIRS[idx];

  useEffect(() => {
    setPhase("bad");
    const t1 = setTimeout(() => setPhase("morph"), 2400);
    const t2 = setTimeout(() => setPhase("good"), 3000);
    const t3 = setTimeout(() => setPhase("reply"), 4500);
    const t4 = setTimeout(() => setIdx((i) => (i + 1) % PAIRS.length), 8500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [idx]);

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-5 sm:px-8 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-20 items-center">
          {/* LEFT — phone mockup with the iMessage thread.
              On mobile we want the title first, so the phone goes order-2 there. */}
          {/* Left-aligned from lg up: centred in its column the phone floats
              inland and the whole section reads narrower than its neighbours. */}
          <div className="relative mx-auto lg:mx-0 w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[380px] order-2 lg:order-1">
            {/* Phone silhouette */}
            <div
              className="relative rounded-[44px] p-[3px]"
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.12))",
                boxShadow:
                  "0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="relative rounded-[42px] overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, #0F0C14, #08070A)",
                  aspectRatio: "9 / 17",
                }}
              >
                {/* Dynamic island */}
                <div
                  className="absolute top-2 left-1/2 -translate-x-1/2 w-[96px] h-[28px] rounded-full z-20"
                  style={{
                    background: "#000",
                    boxShadow:
                      "inset 0 0 0 0.5px rgba(255,255,255,0.06), 0 0 0 0.5px rgba(0,0,0,0.8)",
                  }}
                />

                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-2.5 pb-1.5 text-white/85 relative z-10">
                  <span
                    className="text-[13px] tabular-nums leading-none"
                    style={{
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    9:41
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* Signal */}
                    <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
                      <rect x="0" y="7" width="3" height="4" rx="0.5" />
                      <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
                      <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
                      <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
                    </svg>
                    {/* Wifi */}
                    <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor" aria-hidden>
                      <path d="M7.5 1.5c2.5 0 4.85 0.9 6.6 2.4l-1.05 1.2A8 8 0 0 0 7.5 3.1 8 8 0 0 0 1.95 5.1L0.9 3.9C2.65 2.4 5 1.5 7.5 1.5zm0 3c1.7 0 3.25 0.6 4.45 1.6l-1.05 1.2A5.05 5.05 0 0 0 7.5 6 5.05 5.05 0 0 0 4.1 7.3L3.05 6.1C4.25 5.1 5.8 4.5 7.5 4.5zm0 3c0.9 0 1.7 0.3 2.3 0.85L7.5 10.8 5.2 8.35A3.5 3.5 0 0 1 7.5 7.5z" />
                    </svg>
                    {/* Battery */}
                    <div className="relative flex items-center">
                      <div
                        className="w-[24px] h-[11px] rounded-[3px] relative"
                        style={{
                          border: "1px solid rgba(255,255,255,0.4)",
                          padding: "1px",
                        }}
                      >
                        <div
                          className="h-full rounded-[1.5px] bg-white"
                          style={{ width: "78%" }}
                        />
                      </div>
                      <div
                        className="w-[1.5px] h-[4px] rounded-r-sm ml-[1px]"
                        style={{ background: "rgba(255,255,255,0.4)" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact header */}
                <div className="pt-7 pb-4 px-5 flex flex-col items-center text-center relative z-10 border-b border-white/[0.04]">
                  <div className="w-14 h-14 rounded-full overflow-hidden mb-2">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <defs>
                        <linearGradient id={`her-avatar-${idx}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#FE3C72" />
                        </linearGradient>
                      </defs>
                      <rect width="36" height="36" fill={`url(#her-avatar-${idx})`} />
                      <circle cx="18" cy="22" r="14" fill="white" opacity="0.28" />
                    </svg>
                  </div>
                  <div className="font-display text-[15px] text-white" style={{ fontWeight: 500 }}>
                    her
                  </div>
                  <div className="font-display italic text-[11px] text-white/50 mt-0.5" style={{ fontWeight: 300 }}>
                    active now
                  </div>
                </div>

                {/* Message thread area */}
                <div className="px-4 pt-8 pb-6 space-y-2 min-h-[360px]">
                  {/* The outgoing message — morphs between bad and good */}
                  <div className="flex justify-end">
                    <div
                      className={cn(
                        "relative max-w-[78%] px-4 py-3 rounded-[20px] rounded-br-md transition-all duration-700",
                        phase === "morph" && "scale-95 opacity-30"
                      )}
                      style={
                        phase === "bad" || phase === "morph"
                          ? {
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }
                          : {
                              background:
                                "linear-gradient(135deg, #FE3C72, #FF6B6B 60%, #FF8552)",
                              boxShadow:
                                "0 10px 24px -8px rgba(254,60,114,0.4)",
                            }
                      }
                    >
                      <p
                        className={cn(
                          "text-[15px] leading-[1.35] transition-all duration-500",
                          phase === "bad" || phase === "morph"
                            ? "text-text-muted line-through decoration-2 decoration-text-muted/30"
                            : "text-white"
                        )}
                      >
                        {phase === "bad" || phase === "morph" ? pair.bad : pair.good}
                      </p>
                    </div>
                  </div>

                  {/* Status under outgoing */}
                  <div
                    className={cn(
                      "text-right pr-1 text-[10.5px] font-display italic transition-all duration-500",
                      phase === "bad" && "text-text-muted opacity-100",
                      phase === "morph" && "opacity-0",
                      phase === "good" && "text-text-muted opacity-100",
                      phase === "reply" && "text-success opacity-100"
                    )}
                    style={{ fontWeight: 300 }}
                  >
                    {phase === "bad" && "delivered · no reply"}
                    {phase === "morph" && "·"}
                    {phase === "good" && "delivered"}
                    {phase === "reply" && "read · she's typing…"}
                  </div>

                  {/* Her incoming reply */}
                  <div
                    className={cn(
                      "flex justify-start pt-3 transition-all duration-700",
                      phase === "reply"
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-3 pointer-events-none"
                    )}
                  >
                    <div className="max-w-[78%] px-4 py-3 rounded-[20px] rounded-bl-md bg-white/[0.05] border border-white/[0.06]">
                      <p className="text-[15px] text-white leading-[1.35]">
                        {pair.reply}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Send-style CTA — looks like the iMessage compose row
                    but the action button is the actual product CTA. */}
                <div className="absolute inset-x-0 bottom-0 px-4 pb-5 pt-3">
                  <Link
                    href="/app"
                    className="group flex items-center gap-2"
                    aria-label="Start with your free hint"
                  >
                    <span
                      className="flex-1 rounded-full bg-white/[0.04] border border-white/[0.06] h-9 px-4 inline-flex items-center font-display italic text-[12.5px] text-text-secondary"
                      style={{ fontWeight: 300 }}
                    >
                      try yours, free
                    </span>
                    <span
                      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full overflow-hidden transition-transform group-hover:scale-105 active:scale-95 shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #FE3C72, #FF8552)",
                        boxShadow:
                          "0 8px 24px -6px rgba(254,60,114,0.55)",
                      }}
                    >
                      <ArrowRight size={14} className="text-white" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — title + scenario. Order-1 on mobile so it shows first. */}
          <div className="order-1 lg:order-2">
            <h2
              className="font-display tracking-[-0.035em] leading-[0.95] text-[clamp(2.25rem,5vw,4.5rem)] mb-7"
              style={{ fontWeight: 400, textWrap: "balance" }}
            >
              One message lands.{" "}
              <span
                className="italic whitespace-nowrap"
                style={{
                  background: "linear-gradient(95deg, #FE3C72, #FF8552)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: 300,
                }}
              >
                The other dies.
              </span>
            </h2>

            <p
              className="text-[19px] font-display italic text-text-secondary mb-10 leading-[1.45] max-w-md"
              style={{ fontWeight: 300 }}
            >
              Same girl, same profile — <span className="text-text not-italic">{pair.scenario}</span>.
            </p>

          </div>
        </div>

      </div>
    </section>
  );
}
