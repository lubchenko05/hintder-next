"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "@/components/brand/Icons";

/* ─────────────────────────────────────────────
   TOOLS — one screen per tool: title + what the feature does on the left,
   the drawing on the right.

   01 · the decoder. She types the coded line, it hangs for a beat, then every
        letter flies across — morphing on the way — into what she actually
        meant. That gets wiped and the next one types itself. No clicks.
   02 · the profile card, marked up and then fixed: the dead photo is pulled,
        the lead photo is crowned, the bio is rewritten in place.
   ───────────────────────────────────────────── */

const FLAME_TEXT = {
  background: "linear-gradient(95deg, #FE3C72, #FF8552)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
} as const;

/* ══════════════════════════════════════════════════════════════
   01 · THE DECODER
   ══════════════════════════════════════════════════════════════ */

const PAIRS: [string, string][] = [
  ["haha maybe, we'll see", "she's in — she just wants you to pick the time"],
  ["sorry!! this week has been insane", "not a no — she's seeing if you fold or lead"],
  ["k", "you went dry two messages ago"],
  ["we should hang out sometime", "she's waiting for you to name the day"],
];

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#%&?!*/<>";

type Cell = { ch: string; disp: string };

/* Where each letter of the new line is flying in from: the index of a letter
   in the old line, or -1 when there is nothing left to reuse. */
function matchLetters(from: string, to: string): number[] {
  const used = new Array(from.length).fill(false);
  const src = new Array(to.length).fill(-1);

  /* Pass one — a letter keeps its identity and travels to its new slot,
     preferring the source that is already closest in relative position. */
  for (let i = 0; i < to.length; i++) {
    const want = to[i].toLowerCase();
    let best = -1;
    let bestGap = Infinity;
    for (let j = 0; j < from.length; j++) {
      if (used[j] || from[j].toLowerCase() !== want) continue;
      const gap = Math.abs(j / Math.max(1, from.length) - i / Math.max(1, to.length));
      if (gap < bestGap) {
        bestGap = gap;
        best = j;
      }
    }
    if (best >= 0) {
      used[best] = true;
      src[i] = best;
    }
  }

  /* Pass two — leftover letters are recycled: they fly over and morph into
     whatever the new line needs at that slot. */
  let j = 0;
  for (let i = 0; i < to.length; i++) {
    if (src[i] >= 0) continue;
    while (j < from.length && (used[j] || from[j] === " ")) j++;
    if (j >= from.length) break;
    used[j] = true;
    src[i] = j;
  }
  return src;
}

const TYPE_MS = 55; /* per character, as if she's typing it */
const MAGIC_MS = 760;
const FLIGHT = 1150;
const MORPH_AT = 520;
const HOLD_MS = 1900;
const ERASE_MS = 24;

type Mode = "typing" | "magic" | "flying" | "hold" | "erasing";

/* Split the line into words, carrying each letter's global index so it keeps
   its ref. Spaces become groups of their own — those are the only places the
   line is allowed to wrap. */
function groupWords(cells: Cell[]): { cell: Cell; index: number }[][] {
  const groups: { cell: Cell; index: number }[][] = [];
  let word: { cell: Cell; index: number }[] = [];
  cells.forEach((cell, index) => {
    if (cell.ch === " ") {
      if (word.length) groups.push(word);
      groups.push([{ cell, index }]);
      word = [];
    } else {
      word.push({ cell, index });
    }
  });
  if (word.length) groups.push(word);
  return groups;
}

function Decoder() {
  const [pair, setPair] = useState(0);
  const [mode, setMode] = useState<Mode>("typing");
  /* Starts empty on the server and on the first client render — everything
     here is timed, so nothing may be pre-drawn. */
  const [cells, setCells] = useState<Cell[]>([]);
  const [tick, setTick] = useState(0);

  const wrapRef = useRef<HTMLParagraphElement>(null);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const flight = useRef<{ from: { x: number; y: number }[]; src: number[] } | null>(null);
  /* Two buckets on purpose. The mode loop clears its own timers whenever the
     mode changes — and that cleanup runs AFTER the layout effect below has
     already scheduled the flight's timers. Sharing one bucket wipes them and
     the animation freezes halfway through the morph. */
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const flightTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const wait = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };
  const waitFlight = (ms: number, fn: () => void) => {
    flightTimers.current.push(setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const [said, meant] = PAIRS[pair];

  /* The loop: she types the coded line, it hangs for a beat, every letter
     flies into what she actually meant, that gets wiped, and the next one
     starts typing. */
  useEffect(() => {
    if (mode === "typing") {
      const step = (i: number) => {
        if (i > said.length) {
          wait(320, () => setMode("magic"));
          return;
        }
        setCells(said.slice(0, i).split("").map((ch) => ({ ch, disp: ch })));
        wait(TYPE_MS, () => step(i + 1));
      };
      step(1);
    }

    if (mode === "magic") {
      wait(MAGIC_MS, () => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const base = wrap.getBoundingClientRect();
        const from = spanRefs.current.slice(0, cells.length).map((el) => {
          const r = el?.getBoundingClientRect();
          return r ? { x: r.left - base.left, y: r.top - base.top } : { x: 0, y: 0 };
        });
        const src = matchLetters(cells.map((c) => c.ch).join(""), meant);
        flight.current = { from, src };
        /* the new line's slots, still wearing the letters that flew in */
        setCells(
          meant.split("").map((ch, i) => ({
            ch,
            disp: src[i] >= 0 ? cells[src[i]]?.ch ?? ch : ch,
          })),
        );
        setMode("flying");
        setTick((t) => t + 1);
      });
    }

    if (mode === "hold") {
      wait(HOLD_MS, () => setMode("erasing"));
    }

    if (mode === "erasing") {
      /* The countdown lives here, not inside the setState updater: updaters
         must stay pure, and React may run them twice — which scheduled the
         next phrase twice and made the sequence repeat or skip. */
      let left = cells.length;
      const step = () => {
        left -= 1;
        setCells((cs) => cs.slice(0, Math.max(0, left)));
        if (left <= 0) {
          wait(260, () => {
            setPair((p) => (p + 1) % PAIRS.length);
            setMode("typing");
          });
          return;
        }
        wait(ERASE_MS, step);
      };
      wait(ERASE_MS, step);
    }

    return clearTimers;
  }, [mode, pair]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Runs once the new slots exist but before paint: send every letter back to
     where it was standing and let it fly across on its own arc. */
  useLayoutEffect(() => {
    const plan = flight.current;
    const wrap = wrapRef.current;
    if (!plan || !wrap) return;
    flight.current = null;

    const base = wrap.getBoundingClientRect();

    spanRefs.current.slice(0, cells.length).forEach((el, i) => {
      if (!el) return;
      const j = plan.src[i];
      /* Nothing to recycle — "k" has one letter to hand over and the meaning
         needs thirty. Those fly out of the letter that WAS there instead of
         fading in where they land, which looked like the line broke apart. */
      const p = j >= 0 ? plan.from[j] : (plan.from[0] ?? null);
      const born = j < 0;
      const r = el.getBoundingClientRect();
      const now = { x: r.left - base.left, y: r.top - base.top };
      const sx = p ? p.x - now.x + (born ? (Math.random() - 0.5) * 26 : 0) : 0;
      const sy = p ? p.y - now.y + (born ? (Math.random() - 0.5) * 26 : 0) : 12;
      /* Alternate which way letters bow. On a straight line two letters
         swapping places pass through each other, which reads as a glitch. */
      const lift = (i % 2 ? -1 : 1) * (34 + Math.random() * 78);
      const drift = (Math.random() - 0.5) * 46;

      el.style.transition = "none";
      el.animate(
        [
          { transform: `translate(${sx}px, ${sy}px)`, opacity: born ? 0 : 1 },
          {
            transform: `translate(${sx * 0.45 + drift}px, ${sy * 0.45 + lift}px)`,
            opacity: 1,
            offset: 0.5,
          },
          { transform: "translate(0px, 0px)", opacity: 1 },
        ],
        {
          duration: FLIGHT,
          delay: i * 14,
          easing: "cubic-bezier(0.36,0.06,0.24,1)",
          fill: "backwards" /* hold the start pose through the stagger */,
        },
      );
      el.style.transform = "translate(0px, 0px)";
      el.style.opacity = "1";
    });

    /* mid-flight each letter becomes the one it's turning into */
    waitFlight(MORPH_AT, () =>
      setCells((cs) => cs.map((c) => (c.disp === c.ch ? c : { ...c, disp: c.ch }))),
    );
    waitFlight(FLIGHT + cells.length * 14 + 200, () => setMode("hold"));

    return () => {
      flightTimers.current.forEach(clearTimeout);
      flightTimers.current = [];
    };
  }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const isRead = mode === "flying" || mode === "hold" || mode === "erasing";
  const casting = mode === "magic";

  return (
    <div className="relative w-full h-full min-h-[280px] flex items-center select-none overflow-hidden">
      {/* the rain of glyphs behind the type */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {Array.from({ length: 16 }).map((_, c) => (
          <span
            key={c}
            className="absolute top-0 font-mono whitespace-pre text-[11px] leading-[1.35]"
            style={{
              left: `${(c * 100) / 16 + 1}%`,
              color: "rgba(254,60,114,0.5)",
              opacity: casting ? 0.3 : mode === "flying" ? 0.16 : 0.05,
              transition: "opacity 0.5s",
              animation: `glyph-fall ${7 + (c % 5) * 2.5}s linear ${c * -1.7}s infinite`,
            }}
          >
            {/* Deterministic on purpose: random glyphs picked during render
                differ between server and client and blow up hydration. */}
            {Array.from({ length: 22 }, (_, r) => GLYPHS[(c * 13 + r * 29) % GLYPHS.length]).join("\n")}
          </span>
        ))}
      </div>

      {/* the moment it cracks */}
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden
        style={{
          height: 260,
          background:
            "radial-gradient(ellipse 60% 50% at 30% 50%, rgba(254,60,114,0.22), transparent 70%)",
          opacity: casting ? 1 : 0,
          transition: casting ? "opacity 0.45s ease-out" : "opacity 0.8s ease-out",
        }}
      />

      <div className="relative w-full">
        <div className="h-5 mb-4">
          <span
            className="font-display italic text-[11px] tracking-[0.22em] uppercase"
            style={{
              fontWeight: 400,
              color: isRead ? "#FE3C72" : "rgba(255,255,255,0.35)",
              transition: "color 0.5s",
            }}
          >
            {isRead ? "what she meant" : "what she sent"}
          </span>
        </div>

        <p
          ref={wrapRef}
          className="font-display tracking-[-0.02em] leading-[1.25] text-[clamp(1.5rem,3vw,2.9rem)]"
          style={{
            fontWeight: 400,
            minHeight: "2.5em",
            filter: casting ? "brightness(1.5)" : "none",
            transition: "filter 0.4s",
          }}
        >
          {/* Letters are grouped into words before they're drawn. Every letter
              is its own inline-block so it can fly, and a run of inline-blocks
              may break anywhere — which is how "time" came out as "ti / me". */}
          {groupWords(cells).map((group, g) => (
            <span
              key={g}
              style={{ display: "inline-block", whiteSpace: "nowrap" }}
            >
              {group.map(({ cell, index }) => (
                <span
                  key={index}
                  ref={(el) => {
                    spanRefs.current[index] = el;
                  }}
                  style={{
                    display: "inline-block",
                    whiteSpace: "pre",
                    ...(isRead
                      ? { ...FLAME_TEXT, fontStyle: "italic", fontWeight: 300 }
                      : { color: "rgba(255,255,255,0.6)" }),
                  }}
                >
                  {cell.disp}
                </span>
              ))}
            </span>
          ))}
          <span
            className="inline-block w-[2px] align-middle"
            style={{
              height: "0.9em",
              background: "#FE3C72",
              marginLeft: 4,
              opacity: mode === "typing" || mode === "erasing" ? 1 : 0.25,
              animation: "glyph-caret 1s steps(2) infinite",
            }}
          />
        </p>
      </div>

      <style jsx>{`
        @keyframes glyph-fall {
          0% {
            transform: translateY(-60%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        @keyframes glyph-caret {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   02 · THE PROFILE CARD
   ══════════════════════════════════════════════════════════════ */

const BIO_BEFORE = "6'2 since it matters. Fluent in sarcasm. Just ask.";
const BIO_AFTER =
  "Sunday cook, weekday overthinker. I'll take you to the tiny place on Grand that ruined pasta everywhere else for me.";

type Thumb = { kind: "solo" | "group" | "gym" | "trip"; g1: string; g2: string };
const THUMBS: Thumb[] = [
  { kind: "solo", g1: "#FE3C72", g2: "#FF8552" },
  { kind: "group", g1: "#5B8DEF", g2: "#8B5CF6" },
  { kind: "gym", g1: "#5BE3A9", g2: "#5B8DEF" },
  { kind: "trip", g1: "#FBBF24", g2: "#FE3C72" },
];
const DEAD_THUMB = 1;

function ThumbArt({ kind }: { kind: Thumb["kind"] }) {
  const w = "#fff";
  if (kind === "solo")
    return (
      <>
        <circle cx="30" cy="24" r="10" fill={w} opacity="0.9" />
        <path d="M10 56c0-12 9-20 20-20s20 8 20 20z" fill={w} opacity="0.75" />
      </>
    );
  if (kind === "group")
    return (
      <>
        <circle cx="17" cy="24" r="7" fill={w} opacity="0.6" />
        <circle cx="43" cy="24" r="7" fill={w} opacity="0.6" />
        <circle cx="30" cy="21" r="8" fill={w} opacity="0.85" />
        <path d="M4 56c0-10 6-16 13-16s13 6 13 16z" fill={w} opacity="0.5" />
        <path d="M30 56c0-10 6-16 13-16s13 6 13 16z" fill={w} opacity="0.5" />
        <path d="M15 56c0-11 7-18 15-18s15 7 15 18z" fill={w} opacity="0.8" />
      </>
    );
  if (kind === "gym")
    return (
      <>
        <rect x="12" y="10" width="36" height="42" rx="5" fill="none" stroke={w} strokeWidth="2" opacity="0.5" />
        <circle cx="30" cy="26" r="8" fill={w} opacity="0.85" />
        <path d="M18 52c0-8 5-13 12-13s12 5 12 13z" fill={w} opacity="0.8" />
      </>
    );
  return (
    <>
      <path d="M4 48l14-20 11 14 8-9 19 15z" fill={w} opacity="0.8" />
      <circle cx="45" cy="16" r="7" fill={w} opacity="0.9" />
    </>
  );
}

function ProfileCard() {
  const [fixed, setFixed] = useState(false);
  const shown = THUMBS.map((t, i) => ({ t, i })).filter(
    ({ i }) => !(fixed && i === DEAD_THUMB),
  );

  return (
    /* Left-aligned on desktop so the block spans the same width as the one
       above it — centred, the card floats inland and the section reads narrow. */
    <div className="w-full h-full flex justify-center lg:justify-start items-center select-none">
      <div
        /* Fills the shared height envelope instead of dictating its own —
           the photo takes whatever is left after the bio and the roll. */
        className="relative w-full max-w-[340px] h-full max-h-[500px] flex flex-col rounded-[30px] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #131017, #0A090C)",
          border: `1px solid ${fixed ? "rgba(254,60,114,0.4)" : "rgba(255,255,255,0.08)"}`,
          boxShadow: fixed
            ? "0 40px 90px -30px rgba(254,60,114,0.5)"
            : "0 40px 80px -30px rgba(0,0,0,0.8)",
          transition: "border-color 0.5s, box-shadow 0.5s",
        }}
      >
        {/* the main photo */}
        <div className="relative flex-1 min-h-0">
          <svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="pc-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FE3C72" />
                <stop offset="100%" stopColor="#FF8552" />
              </linearGradient>
              <radialGradient id="pc-sun" cx="0.74" cy="0.2" r="0.5">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100" height="120" fill="url(#pc-bg)" />
            <rect width="100" height="120" fill="url(#pc-sun)" />
            {/* horizon + figure, so it reads as a photo and not a swatch */}
            <path d="M0 92h100v28H0z" fill="#000" opacity="0.16" />
            <circle cx="50" cy="52" r="15" fill="#fff" opacity="0.92" />
            <path d="M20 120c0-19 13-31 30-31s30 12 30 31z" fill="#fff" opacity="0.85" />
            <path d="M0 96l22-16 16 11 14-9 20 15 28-11v34H0z" fill="#000" opacity="0.12" />
          </svg>

          {/* gradient scrim + identity, like every dating card he's ever seen */}
          <div
            className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-16"
            style={{ background: "linear-gradient(0deg, rgba(6,5,8,0.92), transparent)" }}
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[26px] text-white leading-none" style={{ fontWeight: 500 }}>
                Alex
              </span>
              <span className="font-display text-[19px] text-white/70 leading-none" style={{ fontWeight: 300 }}>
                27
              </span>
              <span
                className="ml-auto font-display italic text-[11px] text-white/60 px-2 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.12)", fontWeight: 300 }}
              >
                5 km away
              </span>
            </div>
          </div>

          {/* crowned once it's fixed: this is the one that leads */}
          <div
            className="absolute top-4 left-4 font-display italic text-[10.5px] tracking-[0.16em] uppercase px-2.5 py-1 rounded-full"
            style={{
              color: "#fff",
              background: "linear-gradient(95deg, #FE3C72, #FF8552)",
              opacity: fixed ? 1 : 0,
              transform: fixed ? "translateY(0)" : "translateY(-6px)",
              transition: "opacity 0.45s 0.25s, transform 0.45s 0.25s",
            }}
          >
            leads
          </div>
        </div>

        {/* the bio — rewritten in place */}
        <div className="relative px-5 pt-3 pb-1 h-[86px] shrink-0">
          <p
            className="font-display text-[14px] leading-[1.5]"
            style={{
              fontWeight: 400,
              color: "rgba(255,255,255,0.45)",
              textDecoration: "line-through",
              textDecorationColor: "rgba(254,60,114,0.9)",
              textDecorationThickness: 2,
              opacity: fixed ? 0 : 1,
              position: fixed ? "absolute" : "static",
              transition: "opacity 0.35s",
            }}
          >
            {BIO_BEFORE}
          </p>
          <p
            className="font-display italic text-[14px] leading-[1.5]"
            style={{
              ...FLAME_TEXT,
              fontWeight: 300,
              opacity: fixed ? 1 : 0,
              transform: fixed ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s 0.2s, transform 0.5s 0.2s",
              position: fixed ? "static" : "absolute",
            }}
          >
            {BIO_AFTER}
          </p>
        </div>

        {/* the rest of his roll */}
        <div className="px-5 pb-5 flex gap-2.5">
          {THUMBS.map((t, i) => {
            const dead = i === DEAD_THUMB;
            const gone = dead && fixed;
            const lead = i === 0;
            return (
              <div
                key={i}
                className="relative rounded-xl overflow-hidden"
                style={{
                  flex: gone ? "0 0 0%" : "1 1 0",
                  aspectRatio: gone ? undefined : "3 / 4",
                  opacity: gone ? 0 : 1,
                  marginRight: gone ? -10 : 0,
                  border: `1px solid ${
                    lead && fixed
                      ? "rgba(254,60,114,0.85)"
                      : dead && !fixed
                        ? "rgba(254,60,114,0.85)"
                        : "rgba(255,255,255,0.08)"
                  }`,
                  transition:
                    "flex 0.55s cubic-bezier(0.3,0.8,0.4,1), opacity 0.4s, margin 0.55s, border-color 0.4s",
                }}
              >
                <svg viewBox="0 0 60 60" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id={`th-${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={t.g1} />
                      <stop offset="100%" stopColor={t.g2} />
                    </linearGradient>
                  </defs>
                  <rect width="60" height="60" fill={`url(#th-${i})`} />
                  <ThumbArt kind={t.kind} />
                </svg>

                {/* the one that's costing him, crossed out before the fix */}
                <svg
                  viewBox="0 0 60 60"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full"
                  style={{ opacity: dead && !fixed ? 1 : 0, transition: "opacity 0.3s" }}
                >
                  <rect width="60" height="60" fill="#0B0A0D" opacity="0.55" />
                  <path
                    d="M14 14 L46 46 M46 14 L14 46"
                    stroke="#FE3C72"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            );
          })}
          {/* the gap he should refill, once the dead one is gone */}
          <div
            className="rounded-xl border border-dashed"
            style={{
              flex: fixed ? "1 1 0" : "0 0 0%",
              aspectRatio: fixed ? "3 / 4" : undefined,
              borderColor: "rgba(255,255,255,0.16)",
              opacity: fixed ? 1 : 0,
              transition: "flex 0.55s cubic-bezier(0.3,0.8,0.4,1) 0.1s, opacity 0.4s 0.25s",
            }}
          />
        </div>

        {/* the only control */}
        <button
          onClick={() => setFixed((f) => !f)}
          aria-label={fixed ? "show the original profile" : "fix this profile"}
          className="absolute right-5 rounded-full flex items-center justify-center"
          style={{
            top: "calc(83.33% - 26px)",
            width: 52,
            height: 52,
            background: "linear-gradient(135deg, #FE3C72, #FF8552)",
            boxShadow: "0 14px 34px -8px rgba(254,60,114,0.8)",
          }}
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid rgba(254,60,114,0.6)",
              animation: fixed ? "none" : "pc-ring 2.2s ease-out infinite",
            }}
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {fixed ? (
              <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
            ) : (
              <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
            )}
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes pc-ring {
          0% {
            opacity: 0.9;
            transform: scale(1);
          }
          70%,
          100% {
            opacity: 0;
            transform: scale(1.7);
          }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Scene
   ══════════════════════════════════════════════════════════════ */
function Scene({
  title,
  accent,
  sub,
  href,
  cta,
  flip,
  children,
}: {
  title: string;
  accent: string;
  sub: string;
  href: string;
  cta: string;
  /* Zigzag: the second scene puts the drawing on the left. On phones the
     title always comes first — reading order beats symmetry. */
  flip?: boolean;
  children: React.ReactNode;
}) {
  return (
    /* Same frame as the LiveDemo section — one container width across the page,
       otherwise the landing reads as three different sites. */
    <section className="relative py-20 sm:py-28 lg:py-32 px-5 sm:px-8 overflow-hidden flex items-center">
      <div
        className={cn(
          "relative z-10 max-w-7xl mx-auto w-full grid gap-8 lg:gap-16 items-center",
          flip ? "lg:grid-cols-[1.25fr_1fr]" : "lg:grid-cols-[1fr_1.25fr]",
        )}
      >
        <div className={cn("order-1 max-w-xl", flip && "lg:order-2 lg:ml-auto")}>
          <h2
            className="font-display tracking-[-0.035em] leading-[0.95] text-[clamp(2.25rem,5vw,4rem)] mb-5"
            style={{ fontWeight: 400, textWrap: "balance" }}
          >
            {title}{" "}
            <span className="italic" style={{ ...FLAME_TEXT, fontWeight: 300 }}>
              {accent}
            </span>
          </h2>

          <p
            className="font-display text-[clamp(1rem,1.35vw,1.2rem)] text-text-secondary leading-[1.55] max-w-lg mb-9"
            style={{ fontWeight: 300 }}
          >
            {sub}
          </p>

          <Link
            href={href}
            className="group inline-flex items-center gap-3 rounded-full px-9 py-[18px] text-white font-display italic text-[17px] transition-transform hover:scale-[1.02] active:scale-[0.99]"
            style={{
              background: "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
              boxShadow: "0 16px 40px -12px rgba(254,60,114,0.55)",
              fontWeight: 400,
            }}
          >
            {cta}
            <ArrowRight
              size={16}
              className="text-white group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </div>

        {/* One height envelope for both scenes, so neither visual outgrows
            the other or the sections around them. */}
        <div
          className={cn(
            /* The height envelope has to exist on phones too — the card is
               h-full, so without it the photo has nothing to fill and
               collapses to a sliver. */
            "w-full order-2 h-[min(440px,62vh)] lg:h-[clamp(360px,50vh,500px)]",
            flip && "lg:order-1",
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export function Tools() {
  return (
    <div id="tools" className="scroll-mt-20">
      <Scene
        title="Five words."
        accent="A whole paragraph underneath."
        sub="Paste her message or a screenshot of the chat. We tell you what she actually meant, how warm she still is, and the exact line to send back."
        href="/decode"
        cta="decode her reply"
      >
        <Decoder />
      </Scene>

      <Scene
        title="You're not unlucky."
        accent="You're leading with the wrong photo."
        sub="Upload your own profile. We tell you which photo to lead with and which one to cut — and rewrite your bio so it sounds like you, not like everyone."
        href="/optimize"
        cta="rate my profile"
        flip
      >
        <ProfileCard />
      </Scene>
    </div>
  );
}
