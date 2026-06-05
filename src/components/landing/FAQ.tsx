"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   FAQ — editorial, no chrome.
   Roman numerals down the side, accordion lines,
   italic Fraunces answers. Click question to open.
   ───────────────────────────────────────────── */

type Item = {
  q: string;
  a: string;
};

const ITEMS: Item[] = [
  {
    q: "Does she know I used something?",
    a: "She doesn't. We don't write in the AI cadence — no em-dashes piled up, no 'as an opener…' phrasing, no perfect grammar where the cool version skips a word. The line sounds like a confident version of you, the one you'd land at 2am if you were funnier.",
  },
  {
    q: "What dating apps does it work with?",
    a: "All of them. Tinder, Hinge, Bumble, Coffee Meets Bagel, the new one you tried last week — if you can screenshot her profile, we can read it. We're not plugging into any app; you stay anonymous and in control.",
  },
  {
    q: "Are my screenshots saved anywhere?",
    a: "Only briefly. We keep them for up to 30 days so you can reopen a match and see the photo report — then they're automatically deleted. They're never used to train AI models, never sold, never archived past that window. Full details in our Privacy Policy.",
  },
  {
    q: "What if she doesn't reply?",
    a: "She might not. We get you the best shot at a real opener — but she has a life, a 9-to-5, and forty other Tinder messages from guys who all said 'cute cat.' If she does reply, we'll also help with the second move. That's the harder one anyway.",
  },
  {
    q: "How is this different from just asking ChatGPT?",
    a: "ChatGPT writes like ChatGPT. It optimizes for polite, helpful, balanced — exactly the tone that bombs in a dating app. We're tuned specifically on what actually gets replies in this medium: playful tension, specifics from her profile, lines that force a real answer.",
  },
  {
    q: "How do hints work?",
    a: "One hint reads one profile and drafts five openers in your chosen tone. Hints don't expire, don't auto-renew, don't roll into a subscription. First three are on the house — no card, no signup. Pay only when you want more.",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-5 sm:px-8 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-24 items-start">
        {/* LEFT — sticky heading column */}
        <div className="lg:sticky lg:top-32">
          <h2
            className="font-display tracking-[-0.035em] leading-[0.95] text-[clamp(2.25rem,4.5vw,3.75rem)]"
            style={{ fontWeight: 400, textWrap: "balance" }}
          >
            You probably want to know{" "}
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
              a few things.
            </span>
          </h2>
          <p
            className="mt-6 text-[15px] text-text-secondary font-display italic max-w-sm leading-[1.55]"
            style={{ fontWeight: 300 }}
          >
            The honest answers to the questions we get every week.
          </p>
        </div>

        {/* RIGHT — accordion list */}
        <ul className="divide-y divide-white/[0.06]">
          {ITEMS.map((item, i) => {
            const isOpen = i === openIdx;
            const numeral = ["i", "ii", "iii", "iv", "v", "vi"][i];
            return (
              <li key={i}>
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full text-left py-5 sm:py-7 grid grid-cols-[24px_1fr_auto] sm:grid-cols-[40px_1fr_auto] gap-3 sm:gap-6 items-baseline group"
                >
                  <span
                    className={cn(
                      "font-display italic text-[14px] transition-colors",
                      isOpen ? "text-flame" : "text-text-muted"
                    )}
                    style={{ fontWeight: 300 }}
                  >
                    {numeral}.
                  </span>

                  <span
                    className={cn(
                      "font-display text-[clamp(1.25rem,2.5vw,1.75rem)] transition-colors leading-[1.25]",
                      isOpen ? "text-text" : "text-text-secondary group-hover:text-text"
                    )}
                    style={{ fontWeight: 400 }}
                  >
                    {item.q}
                  </span>

                  {/* Open/close indicator — hand-drawn line, not a chevron */}
                  <span
                    className={cn(
                      "relative w-6 h-6 flex items-center justify-center transition-colors",
                      isOpen ? "text-flame" : "text-text-muted group-hover:text-text"
                    )}
                    aria-hidden
                  >
                    {/* horizontal bar always */}
                    <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-current" />
                    {/* vertical bar that rotates away when open */}
                    <span
                      className={cn(
                        "absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-current transition-transform duration-300",
                        isOpen ? "scale-y-0" : "scale-y-100"
                      )}
                    />
                  </span>
                </button>

                {/* Answer — collapsible */}
                <div
                  className={cn(
                    "grid grid-cols-[24px_1fr_24px] sm:grid-cols-[40px_1fr_24px] gap-3 sm:gap-6 transition-all duration-500 overflow-hidden",
                    isOpen ? "max-h-96 pb-8 opacity-100" : "max-h-0 pb-0 opacity-0"
                  )}
                >
                  <span />
                  <p
                    className="text-[17px] text-text-secondary leading-[1.55] font-display max-w-2xl"
                    style={{ fontWeight: 300, fontStyle: "italic" }}
                  >
                    {item.a}
                  </p>
                  <span />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
