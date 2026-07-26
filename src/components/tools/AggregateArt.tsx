"use client";

import { useEffect, useRef, useState } from "react";
import { PhotoMock } from "@/components/tools/PhotoMock";

/* ─────────────────────────────────────────────
   AggregateArt — the three visuals on /tools. No dials, no bars, no dashboard
   furniture: each one is the product's own medium — her words, your line, her
   photos — playing the moment that tool exists for.

   The tool pages run the fuller interactives; these are the short version of
   the same truth, not a chart about it.
   ───────────────────────────────────────────── */

function useTyper(text: string, on: boolean, ms = 26) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) {
      setN(0);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, ms);
    return () => clearInterval(id);
  }, [text, on, ms]);
  return text.slice(0, n);
}

function useBeat(steps: number, ms: number) {
  const [i, setI] = useState(0);
  const t = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    t.current = setInterval(() => setI((v) => (v + 1) % steps), ms);
    return () => {
      if (t.current) clearInterval(t.current);
    };
  }, [steps, ms]);
  return i;
}

/* ── read: her own words, the hooks catching in them ── */
const PARTS = [
  { t: "Norwegian Wood", hook: "she named the book, not “reading”" },
  { t: " is in my top 5. ", hook: null },
  { t: "Vinyl over playlists", hook: "a stance — something to push on" },
  { t: ". Ask me about the ", hook: null },
  { t: "record shop on Grand", hook: "she wrote the date idea herself" },
  { t: ".", hook: null },
];

export function ArtRead() {
  const step = useBeat(5, 1150); /* three catches, then a rest */
  const caught = Math.min(step, 3);
  const notes = PARTS.filter((p) => p.hook).slice(0, caught);

  return (
    <div className="w-full">
      <p
        className="font-display text-[clamp(1.2rem,2vw,1.75rem)] leading-[1.6]"
        style={{ fontWeight: 300, color: "rgba(255,255,255,0.4)" }}
      >
        {PARTS.map((p, i) => {
          const rank = PARTS.slice(0, i + 1).filter((x) => x.hook).length;
          const lit = !!p.hook && rank <= caught;
          return (
            <span
              key={i}
              style={{
                color: lit ? "#fff" : undefined,
                background: lit
                  ? "linear-gradient(180deg, transparent 66%, rgba(254,60,114,0.5) 66%)"
                  : undefined,
                transition: "color 0.45s, background 0.45s",
              }}
            >
              {p.t}
            </span>
          );
        })}
      </p>

      <div className="mt-7 space-y-2.5">
        {notes.map((n, i) => (
          <div
            key={n.t}
            className="flex items-baseline gap-3 animate-fade-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="text-flame text-[11px] leading-none">▸</span>
            <span
              className="font-display italic text-[14px] leading-[1.45]"
              style={{ fontWeight: 300, color: "rgba(255,255,255,0.6)" }}
            >
              {n.hook}
            </span>
          </div>
        ))}
      </div>

      <div
        className="mt-6 font-display italic text-[12px] tracking-[0.16em] uppercase text-flame transition-opacity duration-500"
        style={{ fontWeight: 400, opacity: caught === 3 ? 1 : 0 }}
      >
        three openers, built on these
      </div>
    </div>
  );
}

/* ── decode: her four words, then what you send ── */
const SAID = "haha maybe, we'll see";
const SEND = "Thursday, 8pm, the wine place on 5th. I'll book it.";
const BACK = "ok NOW that's how you ask 😌 thursday works";

export function ArtDecode() {
  const beat = useBeat(3, 2600); /* 0 hers · 1 yours · 2 her answer */
  const typed = useTyper(SEND, beat >= 1);
  return (
    <div className="w-full space-y-3">
      <div
        className="rounded-[22px] rounded-bl-md px-5 py-4 inline-block"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span className="font-display text-[17px] text-white/90" style={{ fontWeight: 400 }}>
          {SAID}
        </span>
      </div>

      <div className="flex justify-end">
        <div
          className="rounded-[22px] rounded-br-md px-5 py-4 max-w-[92%] transition-opacity duration-400"
          style={{
            background: "linear-gradient(135deg, #FE3C72, #FF6B6B 55%, #FF8552)",
            boxShadow: "0 18px 44px -16px rgba(254,60,114,0.6)",
            opacity: beat >= 1 ? 1 : 0,
          }}
        >
          <span className="font-display text-[15.5px] text-white leading-[1.45]" style={{ fontWeight: 400 }}>
            {typed}
          </span>
        </div>
      </div>

      <div
        className="rounded-[22px] rounded-bl-md px-5 py-4 inline-block transition-all duration-500"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          opacity: beat === 2 ? 1 : 0,
          transform: beat === 2 ? "none" : "translateY(8px)",
        }}
      >
        <span className="font-display text-[15.5px] text-white/85" style={{ fontWeight: 400 }}>
          {BACK}
        </span>
      </div>
    </div>
  );
}

/* ── rate: one photo at a time, judged — the tool page shows the whole
      strip reordering, so this one is a reel, not a row ── */
const REEL = [
  { id: "mountain", mock: "landscape" as const, verdict: "not first", why: "no face — a landscape can't open a profile", fix: "keep it, but somewhere after the photo that shows you", ok: false },
  { id: "face", mock: "portrait" as const, verdict: "lead with this", why: "one subject, good light, actually you", fix: "she decides on this frame in about a second", ok: true },
  { id: "group", mock: "group" as const, verdict: "cut", why: "she can't tell which one is you", fix: "and when she can't tell, she assumes the worst one", ok: false },
];

export function ArtRate() {
  const i = useBeat(REEL.length, 2800);
  const r = REEL[i];
  return (
    <div className="w-full flex items-center gap-7">
      <div
        key={r.id}
        className="relative rounded-[22px] overflow-hidden shrink-0 animate-fade-up"
        style={{
          width: "min(38%, 168px)",
          aspectRatio: "3 / 4",
          border: `1px solid ${r.ok ? "rgba(254,60,114,0.7)" : "rgba(255,255,255,0.08)"}`,
          boxShadow: r.ok ? "0 22px 50px -18px rgba(254,60,114,0.6)" : "none",
        }}
      >
        <PhotoMock kind={r.mock} />
      </div>

      <div key={`t${i}`} className="min-w-0 animate-fade-up">
        <div
          className="font-display italic text-[13px] tracking-[0.16em] uppercase mb-2"
          style={{ fontWeight: 400, color: r.ok ? "#FF8552" : "rgba(255,255,255,0.45)" }}
        >
          {r.verdict}
        </div>
        <p
          className="font-display text-[clamp(1.05rem,1.6vw,1.4rem)] leading-[1.45]"
          style={{ fontWeight: 300, color: "rgba(255,255,255,0.85)" }}
        >
          {r.why}
        </p>
        <p
          className="mt-3 font-display italic text-[14.5px] leading-[1.55] max-w-md"
          style={{ fontWeight: 300, color: "rgba(255,255,255,0.5)" }}
        >
          {r.fix}
        </p>
        <div
          className="mt-6 font-display italic text-[12px] tracking-[0.16em] uppercase text-text-muted/50"
          style={{ fontWeight: 400 }}
        >
          photo {i + 1} of {REEL.length} · every slot gets one
        </div>
      </div>
    </div>
  );
}

export function AggregateArt({ slug }: { slug: string }) {
  if (slug === "decode-her-reply") return <ArtDecode />;
  if (slug === "rate-your-profile") return <ArtRate />;
  return <ArtRead />;
}
