"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   SectionArt — nine visuals, three per tool, none repeated anywhere on the
   site. Each one moves on its own and makes the point of the section it sits
   in, so no page is three columns of prose.
   ───────────────────────────────────────────── */

export type ArtKind =
  /* read her profile */
  | "deadline"   /* the line that dies vs the one that lands */
  | "hookmeter"  /* which of her lines are worth building on */
  | "voices"     /* one hook, three voices */
  /* decode her reply */
  | "context"    /* same four words, two threads, two meanings */
  | "fork"       /* chase vs lead, and where each ends */
  | "clock"      /* the hour to send it */
  /* rate your profile */
  | "slots"      /* the reorder */
  | "funnel"     /* what the first photo costs you */
  | "redpen";    /* the bio, marked and rewritten */

export type ArtSpec = { kind: ArtKind };

function useLoop(steps: number, ms: number) {
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

const FLAME = "linear-gradient(95deg, #FE3C72, #FF8552)";
const label = "font-display italic text-[11px] tracking-[0.16em] uppercase";

/* ══ 01 · read ══════════════════════════════════════════════════ */

function Deadline() {
  const on = useLoop(2, 3400);
  return (
    <div className="space-y-3">
      <div
        className="rounded-[20px] rounded-br-md px-5 py-3.5 ml-auto max-w-[88%] transition-all duration-700"
        style={{
          background: on ? FLAME : "rgba(255,255,255,0.05)",
          border: on ? "none" : "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span
          className="font-display text-[15px] leading-[1.4]"
          style={{
            fontWeight: 400,
            color: on ? "#fff" : "rgba(255,255,255,0.4)",
            textDecoration: on ? "none" : "line-through",
          }}
        >
          {on
            ? "Vinyl over playlists is a bold stance from someone with Murakami in their top 5."
            : "Hey, how's your week going?"}
        </span>
      </div>
      <div
        className="rounded-[20px] rounded-bl-md px-5 py-3.5 max-w-[76%] transition-all duration-700"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          opacity: on ? 1 : 0,
        }}
      >
        <span className="font-display text-[15px] text-white/85" style={{ fontWeight: 400 }}>
          ok that&apos;s a fair hit. what&apos;s your excuse for the algorithm then
        </span>
      </div>
      <div className={`${label} text-text-muted pt-1`} style={{ fontWeight: 400 }}>
        {on ? "answered in four minutes" : "delivered · no reply"}
      </div>
    </div>
  );
}

const HOOKS = [
  { t: "“Norwegian Wood is in my top 5”", v: 92, n: "a claim she'll defend" },
  { t: "“Cooks better than your grandma”", v: 84, n: "a dare" },
  { t: "“Love to travel”", v: 12, n: "nothing to answer" },
];

function HookMeter() {
  const [live, setLive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLive(true), {
      threshold: 0.4,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="space-y-5">
      {HOOKS.map((h, i) => (
        <div key={h.t}>
          <div className="flex items-baseline justify-between gap-4 mb-1.5">
            <span className="font-display text-[14.5px] text-text" style={{ fontWeight: 400 }}>
              {h.t}
            </span>
            <span className="font-display italic text-[12.5px] text-text-muted" style={{ fontWeight: 300 }}>
              {h.n}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: live ? `${h.v}%` : "0%",
                background: FLAME,
                transition: `width 1.1s cubic-bezier(0.2,0.7,0.3,1) ${i * 160}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const VOICES = [
  { v: "playful", line: "Should I be worried about my succulent?" },
  { v: "warm", line: "What's the most dramatic thing a plant of yours has pulled?" },
  { v: "blunt", line: "Aggressive plant mom. Explain." },
];

function Voices() {
  const i = useLoop(VOICES.length, 2600);
  return (
    <div>
      <div className={`${label} text-text-muted mb-4`} style={{ fontWeight: 400 }}>
        her bio: “aggressive plant mom”
      </div>
      <div className="flex gap-6 mb-5">
        {VOICES.map((v, k) => (
          <span
            key={v.v}
            className="font-display italic text-[14px] transition-colors duration-400"
            style={{ fontWeight: 400, color: k === i ? "#FF8552" : "rgba(255,255,255,0.28)" }}
          >
            {v.v}
          </span>
        ))}
      </div>
      <p
        key={i}
        className="font-display text-[clamp(1.05rem,1.6vw,1.4rem)] text-text leading-[1.45] animate-fade-up pl-5"
        style={{ fontWeight: 400, borderLeft: "2px solid var(--color-flame)" }}
      >
        {VOICES[i].line}
      </p>
    </div>
  );
}

/* ══ 02 · decode ════════════════════════════════════════════════ */

const CONTEXTS = [
  {
    before: "you: Thursday, 8pm, the wine place on 5th?",
    meant: "yes — she's leaving you to book it",
    warm: true,
  },
  {
    before: "you: hey / you: how was your day? / you: still there?",
    meant: "no — she's closing the door politely",
    warm: false,
  },
];

function Context() {
  const i = useLoop(2, 3600);
  const c = CONTEXTS[i];
  return (
    <div>
      <div className={`${label} text-text-muted mb-3`} style={{ fontWeight: 400 }}>
        what came before it
      </div>
      <p
        key={`b${i}`}
        className="font-display italic text-[13.5px] text-text-muted leading-[1.6] animate-fade-up mb-5"
        style={{ fontWeight: 300 }}
      >
        {c.before}
      </p>
      <div
        className="rounded-[20px] rounded-bl-md px-5 py-3.5 inline-block"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span className="font-display text-[17px] text-white/90" style={{ fontWeight: 400 }}>
          haha maybe, we&apos;ll see
        </span>
      </div>
      <p
        key={`m${i}`}
        className="mt-5 font-display text-[clamp(1.05rem,1.6vw,1.35rem)] leading-[1.4] animate-fade-up"
        style={{ fontWeight: 400, color: c.warm ? "#FF8552" : "var(--color-danger)" }}
      >
        {c.meant}
      </p>
    </div>
  );
}

const FORK = [
  { path: "chase", steps: ["send three more", "she reads, doesn't answer", "thread dies"], ok: false },
  { path: "lead", steps: ["one line, a real plan", "she picks the day", "you're out on Thursday"], ok: true },
];

function Fork() {
  const i = useLoop(2, 4200);
  const f = FORK[i];
  return (
    <div>
      <div className="flex gap-6 mb-5">
        {FORK.map((x, k) => (
          <span
            key={x.path}
            className="font-display italic text-[14px] transition-colors duration-400"
            style={{ fontWeight: 400, color: k === i ? "#FF8552" : "rgba(255,255,255,0.28)" }}
          >
            {x.path}
          </span>
        ))}
      </div>
      <div className="space-y-3">
        {f.steps.map((st, k) => (
          <div
            key={st}
            className="flex items-center gap-3 animate-fade-up"
            style={{ animationDelay: `${k * 120}ms` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                background:
                  k === f.steps.length - 1
                    ? f.ok
                      ? "#5BE3A9"
                      : "var(--color-danger)"
                    : "rgba(255,255,255,0.25)",
              }}
            />
            <span
              className="font-display text-[15.5px] leading-[1.4]"
              style={{
                fontWeight: 400,
                color:
                  k === f.steps.length - 1
                    ? f.ok
                      ? "#5BE3A9"
                      : "var(--color-danger)"
                    : "rgba(255,255,255,0.6)",
              }}
            >
              {st}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const HOURS = [
  { h: "now", note: "she's still on her phone", good: true },
  { h: "+1 hour", note: "after a dry “k”", good: true },
  { h: "3am", note: "nothing good happens here", good: false },
  { h: "tomorrow pm", note: "when the week let go of her", good: true },
];

function Clock() {
  const i = useLoop(HOURS.length, 2200);
  return (
    <div>
      <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
        {HOURS.map((x, k) => (
          <span
            key={x.h}
            className="font-display text-[15px] transition-all duration-400"
            style={{
              fontWeight: k === i ? 500 : 300,
              color:
                k === i
                  ? x.good
                    ? "#FF8552"
                    : "var(--color-danger)"
                  : "rgba(255,255,255,0.25)",
            }}
          >
            {x.h}
          </span>
        ))}
      </div>
      <p
        key={i}
        className="font-display italic text-[clamp(1.05rem,1.6vw,1.35rem)] leading-[1.45] animate-fade-up"
        style={{ fontWeight: 300, color: "rgba(255,255,255,0.85)" }}
      >
        {HOURS[i].note}
      </p>
    </div>
  );
}

/* ══ 03 · rate ══════════════════════════════════════════════════ */

const BEFORE = ["the mountain", "clear face", "group shot", "gym mirror"];
const AFTER = ["clear face", "the mountain", "gym mirror", "group shot"];

function Slots() {
  const on = useLoop(2, 3600);
  const rows = on ? AFTER : BEFORE;
  return (
    <div>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div
            key={r}
            className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-500"
            style={{
              background: i === 0 ? "rgba(254,60,114,0.10)" : "rgba(255,255,255,0.025)",
              border: `1px solid ${i === 0 ? "rgba(254,60,114,0.4)" : "rgba(255,255,255,0.06)"}`,
            }}
          >
            <span className="font-display italic text-[11px] tabular-nums text-text-muted w-4 shrink-0" style={{ fontWeight: 300 }}>
              {i + 1}
            </span>
            <span
              className="font-display text-[14.5px]"
              style={{ fontWeight: 400, color: i === 0 ? "#fff" : "rgba(255,255,255,0.55)" }}
            >
              {r}
            </span>
          </div>
        ))}
      </div>
      <div className={`${label} text-text-muted mt-3`} style={{ fontWeight: 400 }}>
        {on ? "same photos, reordered" : "before"}
      </div>
    </div>
  );
}

const FUNNEL = [
  { label: "see your first photo", a: 100, b: 100 },
  { label: "open the profile", a: 22, b: 61 },
  { label: "swipe right", a: 4, b: 19 },
];

function Funnel() {
  const on = useLoop(2, 3400);
  return (
    <div className="space-y-5">
      {FUNNEL.map((f) => {
        const v = on ? f.b : f.a;
        return (
          <div key={f.label}>
            <div className="flex items-baseline justify-between gap-4 mb-1.5">
              <span className="font-display text-[14.5px] text-text" style={{ fontWeight: 400 }}>
                {f.label}
              </span>
              <span className="font-display italic text-[12.5px] tabular-nums text-text-muted" style={{ fontWeight: 300 }}>
                {v}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${v}%`,
                  background: FLAME,
                  transition: "width 0.9s cubic-bezier(0.2,0.7,0.3,1)",
                }}
              />
            </div>
          </div>
        );
      })}
      <div className={`${label} text-text-muted`} style={{ fontWeight: 400 }}>
        {on ? "after the first photo changed" : "leading with the wrong photo"}
      </div>
    </div>
  );
}

const DEAD_BIO = "Fluent in sarcasm. Partner in crime. Work hard, play harder.";
const LIVE_BIO =
  "Sunday cook, weekday overthinker. I'll take you to the tiny place on Grand that ruined pasta everywhere else.";

function RedPen() {
  const on = useLoop(2, 3800);
  return (
    <div>
      <p
        className="font-display text-[clamp(1rem,1.5vw,1.3rem)] leading-[1.55] transition-all duration-500"
        style={{
          fontWeight: on ? 300 : 400,
          fontStyle: on ? "italic" : "normal",
          color: on ? "#fff" : "rgba(255,255,255,0.35)",
          textDecoration: on ? "none" : "line-through",
          textDecorationColor: "rgba(254,60,114,0.9)",
          textDecorationThickness: 2,
        }}
      >
        {on ? LIVE_BIO : DEAD_BIO}
      </p>
      <div className={`${label} text-text-muted mt-4`} style={{ fontWeight: 400 }}>
        {on ? "same guy, finally legible" : "three lines she's read a hundred times"}
      </div>
    </div>
  );
}

const ART: Record<ArtKind, () => React.ReactElement> = {
  deadline: Deadline,
  hookmeter: HookMeter,
  voices: Voices,
  context: Context,
  fork: Fork,
  clock: Clock,
  slots: Slots,
  funnel: Funnel,
  redpen: RedPen,
};

export function SectionArt({ spec }: { spec: ArtSpec }) {
  const C = ART[spec.kind];
  return <C />;
}
