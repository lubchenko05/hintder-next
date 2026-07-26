"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   ProfileRead — the actual job of /app, played out: her profile goes in, we
   mark the hooks she planted, and an opener that uses one of them writes
   itself. Runs on its own, loops through two profiles.

   This is the product, not a diagram of it: same order of events, same
   output shape the tool returns.
   ───────────────────────────────────────────── */

type Hook = { text: string; note: string };
type Sample = {
  name: string;
  age: number;
  g1: string;
  g2: string;
  bio: string;
  prompt: string;
  hooks: Hook[];
  opener: string;
};

const SAMPLES: Sample[] = [
  {
    name: "Madison",
    age: 26,
    g1: "#8B5CF6",
    g2: "#FE3C72",
    bio: "Norwegian Wood is in my top 5. Vinyl over playlists.",
    prompt: "I'll fall for you if… you know a decent record shop",
    hooks: [
      { text: "Norwegian Wood", note: "she named the book, not 'reading'" },
      { text: "Vinyl over playlists", note: "a stance — something to push on" },
      { text: "record shop", note: "she wrote the date idea herself" },
    ],
    opener:
      "Vinyl over playlists is a strong claim from someone whose top 5 has Murakami in it. What's the one record you'd never lend out?",
  },
  {
    name: "Emma",
    age: 24,
    g1: "#FE3C72",
    g2: "#FF8552",
    bio: "Cooks better than your grandma. Escaped deadlines in Bali.",
    prompt: "Two truths and a lie… I've never burnt rice",
    hooks: [
      { text: "better than your grandma", note: "a dare, and she knows it" },
      { text: "Escaped deadlines", note: "her words, not 'travel'" },
      { text: "never burnt rice", note: "the lie she wants called out" },
    ],
    opener:
      "Does your grandma know what you're saying about her out here? I'll keep quiet, but it's going to cost me dinner.",
  },
];

type Phase = "idle" | "reading" | "hooks" | "writing" | "hold";

export function ProfileRead() {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [found, setFound] = useState(0);
  const [typed, setTyped] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const s = SAMPLES[i];

  useEffect(() => {
    const wait = (ms: number, fn: () => void) => {
      timers.current.push(setTimeout(fn, ms));
    };

    if (phase === "idle") {
      setFound(0);
      setTyped(0);
      wait(700, () => setPhase("reading"));
    }

    if (phase === "reading") {
      wait(1100, () => setPhase("hooks"));
    }

    if (phase === "hooks") {
      /* one hook at a time — that's the order the read actually happens in */
      s.hooks.forEach((_, k) => wait(520 * (k + 1), () => setFound(k + 1)));
      wait(520 * s.hooks.length + 500, () => setPhase("writing"));
    }

    if (phase === "writing") {
      let n = 0;
      const id = setInterval(() => {
        n += 2;
        setTyped(n);
        if (n >= s.opener.length) {
          clearInterval(id);
          setPhase("hold");
        }
      }, 22);
      return () => {
        clearInterval(id);
        timers.current.forEach(clearTimeout);
        timers.current = [];
      };
    }

    if (phase === "hold") {
      wait(3200, () => {
        setI((v) => (v + 1) % SAMPLES.length);
        setPhase("idle");
      });
    }

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [phase, s]);

  /* Split the bio and the prompt so a hook can be lit inside the sentence it
     was found in, rather than repeated underneath as a tag. */
  const mark = (text: string, upTo: number) => {
    const parts: { t: string; hot: boolean }[] = [];
    let rest = text;
    for (let k = 0; k < s.hooks.length; k++) {
      const h = s.hooks[k];
      const at = rest.indexOf(h.text);
      if (at === -1) continue;
      if (at > 0) parts.push({ t: rest.slice(0, at), hot: false });
      parts.push({ t: h.text, hot: k < upTo });
      rest = rest.slice(at + h.text.length);
    }
    if (rest) parts.push({ t: rest, hot: false });
    return parts;
  };

  return (
    <div className="w-full flex justify-center lg:justify-start select-none">
      <div
        className="relative w-full max-w-[380px] rounded-[28px] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #141018, #0A090C)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 40px 80px -30px rgba(0,0,0,0.8)",
        }}
      >
        {/* her photo */}
        <div className="relative" style={{ aspectRatio: "4 / 3" }}>
          <svg viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id={`pr-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={s.g1} />
                <stop offset="100%" stopColor={s.g2} />
              </linearGradient>
            </defs>
            <rect width="100" height="75" fill={`url(#pr-${i})`} />
            <circle cx="50" cy="34" r="12" fill="#fff" opacity="0.9" />
            <path d="M22 75c0-16 12-26 28-26s28 10 28 26z" fill="#fff" opacity="0.8" />
          </svg>

          {/* the read passing over her profile */}
          {phase === "reading" && (
            <div
              className="absolute inset-x-0 h-[3px]"
              style={{
                background: "linear-gradient(90deg, transparent, #FE3C72, transparent)",
                boxShadow: "0 0 22px 5px rgba(254,60,114,0.6)",
                animation: "pr-scan 1.1s ease-in-out forwards",
              }}
            />
          )}

          <div
            className="absolute inset-x-0 bottom-0 px-5 pb-3 pt-12"
            style={{ background: "linear-gradient(0deg, rgba(6,5,8,0.95), transparent)" }}
          >
            <span className="font-display text-[22px] text-white" style={{ fontWeight: 500 }}>
              {s.name}
            </span>
            <span className="font-display text-[17px] text-white/60 ml-2" style={{ fontWeight: 300 }}>
              {s.age}
            </span>
          </div>
        </div>

        {/* her words, with the hooks lighting up where they were written */}
        <div className="px-5 pt-4 pb-3 space-y-2">
          {[s.bio, s.prompt].map((line, li) => (
            <p
              key={li}
              className="font-display text-[13.5px] leading-[1.55]"
              style={{ fontWeight: 300, color: "rgba(255,255,255,0.55)" }}
            >
              {mark(line, found).map((p, k) =>
                p.hot ? (
                  <span
                    key={k}
                    style={{
                      color: "#fff",
                      background:
                        "linear-gradient(180deg, transparent 62%, rgba(254,60,114,0.45) 62%)",
                      transition: "background 0.3s",
                    }}
                  >
                    {p.t}
                  </span>
                ) : (
                  <span key={k}>{p.t}</span>
                ),
              )}
            </p>
          ))}
        </div>

        {/* what we took from it */}
        <div className="px-5 pb-3 min-h-[74px]">
          {s.hooks.slice(0, found).map((h, k) => (
            <div
              key={k}
              className="flex items-baseline gap-2.5 py-0.5 animate-fade-up"
              style={{ animationDelay: `${k * 60}ms` }}
            >
              <span className="text-flame text-[11px] leading-none">▸</span>
              <span
                className="font-display italic text-[12.5px] leading-[1.4]"
                style={{ fontWeight: 300, color: "rgba(255,255,255,0.6)" }}
              >
                {h.note}
              </span>
            </div>
          ))}
        </div>

        {/* the opener it writes */}
        <div className="px-4 pb-5 min-h-[104px]">
          {(phase === "writing" || phase === "hold") && (
            <div className="flex justify-end">
              <div
                className="max-w-[92%] px-4 py-3 rounded-[20px] rounded-br-md"
                style={{
                  background: "linear-gradient(135deg, #FE3C72, #FF6B6B 55%, #FF8552)",
                  boxShadow: "0 16px 40px -14px rgba(254,60,114,0.6)",
                }}
              >
                <span
                  className="font-display text-[13.5px] text-white leading-[1.45]"
                  style={{ fontWeight: 400 }}
                >
                  {s.opener.slice(0, typed)}
                </span>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes pr-scan {
            0% {
              top: 0%;
              opacity: 0;
            }
            10%,
            90% {
              opacity: 1;
            }
            100% {
              top: 100%;
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
