"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, HeartShape } from "@/components/brand/Icons";

/* ─────────────────────────────────────────────
   DROP-IT — full-viewport, more content on result.
   Result card: 3 opener variants, cringe meter,
   why-it-works note, big "Start free" CTA.
   ───────────────────────────────────────────── */

type Stage = "idle" | "scanning" | "analyzing" | "writing" | "done";

type OpenerVariant = {
  text: string;
  tone: string;
  cringe: number; /* 0-100, lower = better */
  why: string;
};

type Profile = {
  id: string;
  name: string;
  age: number;
  caption: string;
  g1: string;
  g2: string;
  hooks: { text: string; trait: string }[];
  openers: OpenerVariant[];
  startX: number;
  startY: number;
  rotation: number;
};

const PROFILES: Profile[] = [
  {
    id: "emma",
    name: "Emma",
    age: 24,
    caption: "cooks better than your grandma",
    g1: "#FE3C72",
    g2: "#FBBF24",
    hooks: [
      { text: "Bali escape", trait: "humor" },
      { text: "Cat in a sweater", trait: "warmth" },
      { text: "Arctic Monkeys", trait: "shared taste" },
    ],
    openers: [
      {
        text: "Does your grandma know what you're saying about her here? I'll snitch unless you feed me first",
        tone: "playful",
        cringe: 12,
        why: "Takes her bait, raises the stakes, gives her a clear lane to reply.",
      },
      {
        text: "Bali to a kitchen — bold career pivot. How's the rebrand going?",
        tone: "curious",
        cringe: 8,
        why: "Calls out the caption, opens a real story she can run with.",
      },
      {
        text: "Cat looks like he runs the place. Are you co-signing the lease at this point?",
        tone: "warm",
        cringe: 10,
        why: "Pulls the cat from the photo without saying 'cute', keeps it light.",
      },
    ],
    rotation: -8,
    startX: 2,
    startY: 2,
  },
  {
    id: "madison",
    name: "Madison",
    age: 26,
    caption: "Norwegian Wood is in my top 5",
    g1: "#8B5CF6",
    g2: "#5B8DEF",
    hooks: [
      { text: "Murakami stan", trait: "literary" },
      { text: "Vinyl shelf", trait: "taste" },
      { text: "Indie shows", trait: "local scene" },
    ],
    openers: [
      {
        text: "Norwegian Wood or Kafka on the Shore — which one ruined you more?",
        tone: "curious",
        cringe: 7,
        why: "Specific cultural reference, light stakes, asks a real question.",
      },
      {
        text: "Vinyl shelf in your second pic — what's the one record you'd never lend out?",
        tone: "warm",
        cringe: 9,
        why: "Pulls a detail she's proud of, lets her flex a little.",
      },
      {
        text: "Reading too much is a personality, sure. Which character do you secretly think you are?",
        tone: "playful",
        cringe: 14,
        why: "Roasts her self-description and invites her in on the joke.",
      },
    ],
    rotation: 11,
    startX: 80,
    startY: 2,
  },
  {
    id: "alex",
    name: "Alex",
    age: 23,
    caption: "aggressive plant mom",
    g1: "#5BE3A9",
    g2: "#5B8DEF",
    hooks: [
      { text: "Mountain photo", trait: "outdoorsy" },
      { text: "Bio tone", trait: "humor" },
      { text: "Climbing gear", trait: "specifics" },
    ],
    openers: [
      {
        text: "Your bio says 'aggressive plant mom' — should I be worried about my succulent?",
        tone: "playful",
        cringe: 10,
        why: "Pulls her exact words back, light tension, easy reply.",
      },
      {
        text: "Mountain pic looks staged. Be honest — did you climb it or just hike up for the photo?",
        tone: "cheeky",
        cringe: 16,
        why: "Light provocation, gives her something to defend, never insulting.",
      },
      {
        text: "What's the most dramatic thing one of your plants has done lately?",
        tone: "warm",
        cringe: 6,
        why: "Lets her tell a small story she's already told friends.",
      },
    ],
    rotation: -6,
    startX: 80,
    startY: 72,
  },
  {
    id: "layla",
    name: "Layla",
    age: 25,
    caption: "tattoos with meaning",
    g1: "#FBBF24",
    g2: "#FE3C72",
    hooks: [
      { text: "DJ on weekends", trait: "scene" },
      { text: "Coffee snob", trait: "specifics" },
      { text: "Tattoos w/ stories", trait: "depth" },
    ],
    openers: [
      {
        text: "I'd ask what coffee place you'd never set foot in, but the list might be shorter the other way",
        tone: "playful",
        cringe: 11,
        why: "Plays into the 'snob' angle she's already owning.",
      },
      {
        text: "Tattoos with meaning is a brave claim. What's the one with the best origin story?",
        tone: "curious",
        cringe: 8,
        why: "Specific, lets her tell the story she most wants to.",
      },
      {
        text: "DJ weekends — when's the next set and is it the kind people stay for?",
        tone: "warm",
        cringe: 9,
        why: "Real invitation, no pressure, anchors a follow-up.",
      },
    ],
    rotation: 7,
    startX: 2,
    startY: 72,
  },
  {
    id: "hannah",
    name: "Hannah",
    age: 27,
    caption: "writing a book nobody asked for",
    g1: "#FF6B6B",
    g2: "#8B5CF6",
    hooks: [
      { text: "Writer bio", trait: "creative" },
      { text: "Cafe corners", trait: "scene" },
      { text: "Coffee third date energy", trait: "warmth" },
    ],
    openers: [
      {
        text: "A book nobody asked for is still a book they'll read. What's it actually about?",
        tone: "curious",
        cringe: 9,
        why: "Takes her self-deprecation seriously, opens the real topic.",
      },
      {
        text: "Writing a book — is this the cafe-and-laptop kind or the 4am voice-memo kind?",
        tone: "playful",
        cringe: 12,
        why: "Specific picture, easy hook for her to claim a category.",
      },
      {
        text: "What's the working title and is it embarrassing yet?",
        tone: "cheeky",
        cringe: 14,
        why: "Forces an honest answer, sets up a back-and-forth.",
      },
    ],
    rotation: -10,
    startX: 82,
    startY: 38,
  },
  {
    id: "riley",
    name: "Riley",
    age: 22,
    caption: "ramen for breakfast kind of person",
    g1: "#5BE3A9",
    g2: "#FBBF24",
    hooks: [
      { text: "Ramen breakfast", trait: "specifics" },
      { text: "Late-shift energy", trait: "lifestyle" },
      { text: "Cooking confidence", trait: "playful" },
    ],
    openers: [
      {
        text: "Ramen for breakfast is a lifestyle, not a meal. What's the breakfast hill you'll die on?",
        tone: "playful",
        cringe: 10,
        why: "Calls out her line, invites her to defend it.",
      },
      {
        text: "Hot take: breakfast ramen is better than dinner ramen. Where do you stand?",
        tone: "warm",
        cringe: 8,
        why: "Frames a low-stakes debate she can win or lose easily.",
      },
      {
        text: "First red flag: someone who eats ramen for breakfast and someone who doesn't?",
        tone: "cheeky",
        cringe: 16,
        why: "Light provocation, gives her a clear lane to push back.",
      },
    ],
    rotation: 4,
    startX: 1,
    startY: 38,
  },
];

/* ─── OpenerStage — text with cycle-next button + ghost stack ─── */
function OpenerStage({
  opener,
  nextOpener,
  typedChars,
  isWriting,
  onNext,
  current,
  total,
}: {
  opener: OpenerVariant;
  nextOpener: OpenerVariant;
  typedChars: number;
  isWriting: boolean;
  onNext: () => void;
  current: number;
  total: number;
}) {
  /* Keyed wrapper around the text so React remounts when opener changes,
     triggering the CSS fade-in animation. No inline-style juggling. */
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* The opener — auto-flows to its content, the flex-1 parent gives room */}
      <p
        key={current}
        className={cn(
          "text-[14px] sm:text-[15px] lg:text-[16px] leading-[1.4] text-text font-display animate-fade-up",
          isWriting && "typewriter-caret"
        )}
        style={{ fontWeight: 400 }}
      >
        {opener.text.slice(0, typedChars)}
      </p>

      {/* Cycle row */}
      <button
        onClick={onNext}
        disabled={isWriting}
        className={cn(
          "group flex items-center justify-between gap-3 -mx-1 px-1 py-2 rounded-md",
          "transition-colors text-left",
          isWriting
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-white/[0.03]"
        )}
      >
        <span className="font-display italic text-[12px] text-text-muted" style={{ fontWeight: 300 }}>
          <span className="text-text">show me</span>{" "}
          <span className="text-flame">{nextOpener.tone}</span>
        </span>
        <span className="inline-flex items-center gap-2 font-display italic text-[11px] text-text-muted" style={{ fontWeight: 300 }}>
          <span className="tabular-nums">{current + 1}/{total}</span>
          <span
            className={cn(
              "inline-flex items-center justify-center w-6 h-6 rounded-full transition-transform",
              "border border-white/15 group-hover:border-flame/60 group-hover:translate-x-0.5"
            )}
            aria-hidden
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12 H 19" />
              <path d="M13 6 L 19 12 L 13 18" />
            </svg>
          </span>
        </span>
      </button>
    </div>
  );
}

function Photo({ g1, g2, id }: { g1: string; g2: string; id: string }) {
  return (
    <svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
      <defs>
        <linearGradient id={`p-${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={g1} />
          <stop offset="100%" stopColor={g2} />
        </linearGradient>
        <radialGradient id={`p-${id}-glow`} cx="0.7" cy="0.25" r="0.7">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="280" fill={`url(#p-${id}-bg)`} />
      <rect width="200" height="280" fill={`url(#p-${id}-glow)`} />
      <circle cx="100" cy="180" r="50" fill="white" opacity="0.22" />
      <circle cx="100" cy="180" r="80" fill="none" stroke="white" strokeWidth="1.5" opacity="0.14" />
    </svg>
  );
}

export function LiveDemo() {
  const [stage, setStage] = useState<Stage>("idle");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [scanLine, setScanLine] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [isOverScanner, setIsOverScanner] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [openerIdx, setOpenerIdx] = useState(0);
  /* Bumped on reset — used as part of polaroid keys to force remount */
  const [resetVersion, setResetVersion] = useState(0);

  const sceneRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const overScannerRef = useRef(false);
  const dragStateRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    el: HTMLElement;
  } | null>(null);

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    /* Allow drag in idle (first run) or done (replacing result).
       Block during scanning/analyzing/writing — animation is mid-flight. */
    if (stage !== "idle" && stage !== "done") return;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      el: target,
    };
    setDraggedId(id);
    target.style.zIndex = "50";
    target.style.transition = "none";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    drag.el.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 24}deg) scale(1.05)`;

    if (scannerRef.current) {
      const s = scannerRef.current.getBoundingClientRect();
      const cx = e.clientX;
      const cy = e.clientY;
      const over = cx > s.left && cx < s.right && cy > s.top && cy < s.bottom;
      overScannerRef.current = over;
      setIsOverScanner(over);
    }
  };

  const onPointerUp = (_e: React.PointerEvent, profile: Profile) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    dragStateRef.current = null;
    setDraggedId(null);

    if (overScannerRef.current && scannerRef.current && sceneRef.current) {
      const s = scannerRef.current.getBoundingClientRect();
      const sc = sceneRef.current.getBoundingClientRect();
      const targetX = s.left + s.width / 2 - sc.left;
      const targetY = s.top + s.height / 2 - sc.top;

      drag.el.style.transition =
        "left 0.4s cubic-bezier(0.21, 0.6, 0.35, 1), top 0.4s cubic-bezier(0.21, 0.6, 0.35, 1), width 0.4s, height 0.4s, transform 0.4s, opacity 0.4s";
      drag.el.style.left = `${targetX}px`;
      drag.el.style.top = `${targetY}px`;
      drag.el.style.transform = "translate(-50%, -50%) rotate(0deg) scale(1)";

      /* If replacing an existing result — flip back to front first,
         then re-prime the scanner with the new profile. */
      const replacing = activeProfile !== null;
      if (replacing) {
        setFlipped(false);
        setScanLine(0);
        setTypedChars(0);
        setOpenerIdx(0);
        /* Bump version so the previously-used polaroid returns. */
        setResetVersion((v) => v + 1);
      }

      setActiveProfile(profile);
      setOpenerIdx(0);
      overScannerRef.current = false;
      setIsOverScanner(false);
      setTimeout(
        () => {
          drag.el.style.opacity = "0";
          setStage("scanning");
        },
        replacing ? 750 : 400
      );
    } else {
      drag.el.style.transition = "transform 0.4s cubic-bezier(0.21, 0.6, 0.35, 1)";
      drag.el.style.transform = "";
      drag.el.style.zIndex = "";
      overScannerRef.current = false;
      setIsOverScanner(false);
    }
  };

  /* Choreography */
  useEffect(() => {
    if (!activeProfile) return;
    if (stage === "scanning") {
      let i = 0;
      const id = setInterval(() => {
        i += 1;
        setScanLine(i);
        if (i > 12) {
          clearInterval(id);
          setStage("analyzing");
        }
      }, 70);
      return () => clearInterval(id);
    }
    if (stage === "analyzing") {
      const t = setTimeout(() => {
        setFlipped(true);
        setStage("writing");
      }, 600);
      return () => clearTimeout(t);
    }
    if (stage === "writing") {
      const opener = activeProfile.openers[openerIdx].text;
      let i = 0;
      const id = setInterval(() => {
        i += 1;
        setTypedChars(i);
        if (i >= opener.length) {
          clearInterval(id);
          setStage("done");
        }
      }, 20);
      return () => clearInterval(id);
    }
  }, [stage, activeProfile, openerIdx]);

  /* Switch to a different opener variant — show full text instantly with
     a fade, no retype (that left the card visually empty during transition) */
  const switchOpener = (idx: number) => {
    if (stage !== "done" || !activeProfile) return;
    setOpenerIdx(idx);
    setTypedChars(activeProfile.openers[idx].text.length);
  };

  const reset = () => {
    setStage("idle");
    setActiveProfile(null);
    setScanLine(0);
    setTypedChars(0);
    setFlipped(false);
    setOpenerIdx(0);
    overScannerRef.current = false;
    setIsOverScanner(false);
    /* Bump version — forces all polaroids to remount with fresh styles */
    setResetVersion((v) => v + 1);
  };

  const currentOpener = activeProfile?.openers[openerIdx];

  return (
    <section
      id="how-it-works"
      className="relative lg:min-h-[100dvh] py-16 sm:py-20 px-5 sm:px-8 overflow-hidden flex items-center"
    >
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-16 items-center">
          {/* LEFT — copy */}
          <div className="max-w-md">
            <h2
              className="font-display tracking-[-0.035em] leading-[0.95] text-[clamp(2.25rem,5vw,4rem)] mb-6"
              style={{ fontWeight: 400, textWrap: "balance" }}
            >
              <span className="whitespace-nowrap">Pick one up.</span>{" "}
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
                Drop it in.
              </span>
            </h2>
            <p className="text-[16px] text-text-secondary font-display font-light leading-[1.55] mb-8">
              Grab a profile and drag it onto the scanner. We&apos;ll show you what we read, how we wrote it, and why it works.
            </p>

            {/* Small step list — kept minimal, no badges */}
            <ol className="space-y-3 font-display font-light text-[14px] text-text-muted">
              <li className="flex items-baseline gap-3">
                <span className="text-flame italic">i.</span>
                <span>drag any profile to the scanner</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-flame italic">ii.</span>
                <span>we extract the hooks she gave you</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-flame italic">iii.</span>
                <span>you copy the line, send it, watch her reply</span>
              </li>
            </ol>
          </div>

          {/* RIGHT — interactive scene */}
          <div
            ref={sceneRef}
            className="relative w-full h-[520px] sm:h-[600px] lg:h-[640px]"
            style={{ touchAction: "none" }}
          >
            {/* Central scanner / flip card */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[210px] h-[320px] sm:w-[260px] sm:h-[380px] lg:w-[320px] lg:h-[460px]"
              style={{ perspective: "1400px" }}
            >
              <div
                ref={scannerRef}
                className="relative w-full h-full transition-transform duration-700"
                style={{
                  transformStyle: "preserve-3d",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* FRONT — empty scanner / scan animation */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-[28px] transition-all duration-300",
                    isOverScanner && !activeProfile
                      ? "scale-[1.04] ring-2 ring-flame shadow-[0_0_60px_-10px_rgba(254,60,114,0.7)]"
                      : !activeProfile
                        ? "ring-1 ring-dashed ring-white/15"
                        : ""
                  )}
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    background:
                      isOverScanner && !activeProfile
                        ? "radial-gradient(circle at center, rgba(254,60,114,0.15), rgba(255,133,82,0.04))"
                        : !activeProfile
                          ? "rgba(255,255,255,0.015)"
                          : "transparent",
                    overflow: "hidden",
                  }}
                >
                  {!flipped && (
                    <>
                      {(["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"] as const).map((p, i) => (
                        <div
                          key={i}
                          className={cn(
                            "absolute w-5 h-5 transition-colors z-20",
                            isOverScanner || stage !== "idle" ? "border-flame" : "border-white/20",
                            p,
                            i === 0 && "border-t-2 border-l-2",
                            i === 1 && "border-t-2 border-r-2",
                            i === 2 && "border-b-2 border-l-2",
                            i === 3 && "border-b-2 border-r-2"
                          )}
                        />
                      ))}
                    </>
                  )}

                  {stage === "idle" && !draggedId && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
                      <div className="font-display italic text-[22px] text-text-muted leading-[1.3]" style={{ fontWeight: 300 }}>
                        drop a profile here
                      </div>
                      <div className="mt-3 font-display text-[13px] text-text-muted/60 italic font-light">
                        ↓ any of the floating ones
                      </div>
                    </div>
                  )}
                  {stage === "idle" && draggedId && (
                    <div className="absolute inset-0 flex items-center justify-center text-center px-6 pointer-events-none">
                      <div
                        className={cn(
                          "font-display italic text-[26px] transition-colors",
                          isOverScanner ? "text-flame" : "text-text-secondary"
                        )}
                        style={{ fontWeight: 400 }}
                      >
                        {isOverScanner ? "let go" : "drop it in"}
                      </div>
                    </div>
                  )}

                  {activeProfile && (stage === "scanning" || stage === "analyzing") && (
                    <div className="absolute inset-0 rounded-[28px] overflow-hidden">
                      <Photo g1={activeProfile.g1} g2={activeProfile.g2} id={`active-${activeProfile.id}`} />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <div className="font-display text-[24px]" style={{ fontWeight: 500 }}>
                          {activeProfile.name}, {activeProfile.age}
                        </div>
                        <div className="font-display italic text-[12px] opacity-80 mt-0.5 font-light">
                          &ldquo;{activeProfile.caption}&rdquo;
                        </div>
                      </div>
                      {stage === "scanning" && (
                        <>
                          <div
                            className="absolute inset-x-0 h-[3px]"
                            style={{
                              top: `${scanLine * 8}%`,
                              background: "linear-gradient(90deg, transparent, #FE3C72, transparent)",
                              boxShadow: "0 0 24px 6px rgba(254,60,114,0.7)",
                              transition: "top 0.07s linear",
                            }}
                          />
                          <div
                            className="absolute inset-x-0 top-0 transition-all duration-100"
                            style={{
                              height: `${scanLine * 8}%`,
                              background:
                                "linear-gradient(180deg, rgba(254,60,114,0.18), transparent)",
                            }}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* BACK — RESULT (more content, more interactive) */}
                <div
                  className="absolute inset-0 rounded-[28px] p-4 sm:p-5 lg:p-6 flex flex-col"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background:
                      "linear-gradient(160deg, rgba(254,60,114,0.10), rgba(255,133,82,0.04) 60%, rgba(0,0,0,0.5))",
                    border: "1px solid rgba(254,60,114,0.25)",
                    boxShadow: "0 24px 60px -20px rgba(254,60,114,0.45)",
                    overflow: "hidden",
                  }}
                >
                  {activeProfile && currentOpener && (
                    <>
                      {/* Header — compact single line on mobile, chip on lg */}
                      <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-white/[0.06]">
                        {/* Big chip — only on lg */}
                        <div className="hidden lg:block relative w-11 h-14 rounded-md overflow-hidden shrink-0">
                          <Photo g1={activeProfile.g1} g2={activeProfile.g2} id={`mini-${activeProfile.id}`} />
                        </div>
                        <div className="min-w-0 flex-1 flex items-baseline gap-2 flex-wrap">
                          <span
                            className="font-display text-[15px] sm:text-[16px] lg:text-[17px] text-text"
                            style={{ fontWeight: 500 }}
                          >
                            {activeProfile.name}, {activeProfile.age}
                          </span>
                          <span className="font-display italic text-[11px] text-flame" style={{ fontWeight: 400 }}>
                            · {currentOpener.tone}
                          </span>
                          <span className="hidden sm:inline font-display italic text-[10.5px] text-text-muted truncate" style={{ fontWeight: 300 }}>
                            {activeProfile.caption}
                          </span>
                        </div>
                      </div>

                      {/* Hooks list — tablet+ only, hidden on the smallest screens */}
                      <div className="hidden sm:flex pt-3 pb-3 flex-wrap gap-1.5">
                        {activeProfile.hooks.map((h) => (
                          <span
                            key={h.text}
                            className="px-2 py-0.5 text-[10.5px] rounded-md text-text-secondary border border-white/[0.08] bg-white/[0.02] font-display italic font-light"
                          >
                            {h.text}
                          </span>
                        ))}
                      </div>

                      {/* Opener — fills available space, pinned between header and CTA */}
                      <div className="flex-1 flex items-center min-h-0 py-2 sm:py-3">
                        <OpenerStage
                        opener={currentOpener}
                        nextOpener={
                          activeProfile.openers[
                            (openerIdx + 1) % activeProfile.openers.length
                          ]
                        }
                        typedChars={typedChars}
                        isWriting={stage === "writing"}
                        onNext={() =>
                          switchOpener(
                            (openerIdx + 1) % activeProfile.openers.length
                          )
                        }
                        current={openerIdx}
                        total={activeProfile.openers.length}
                      />
                      </div>

                      {/* Cringe meter + why-it-works.
                          Desktop only — the back card is too cramped on mobile/tablet
                          to fit cringe bar without colliding with the cycle button. */}
                      {stage === "done" && (
                        <div className="hidden lg:block pt-3 mt-3 border-t border-white/[0.06] space-y-2 lg:space-y-3">
                          {/* Cringe bar */}
                          <div className="flex items-center gap-3">
                            <span className="font-display italic text-[11px] text-text-muted shrink-0" style={{ fontWeight: 300 }}>
                              cringe
                            </span>
                            <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${currentOpener.cringe}%`,
                                  background:
                                    currentOpener.cringe < 20
                                      ? "var(--color-success)"
                                      : currentOpener.cringe < 40
                                        ? "var(--color-warning)"
                                        : "var(--color-flame)",
                                }}
                              />
                            </div>
                            <span className="font-display italic text-[11px] tabular-nums shrink-0"
                              style={{
                                fontWeight: 400,
                                color:
                                  currentOpener.cringe < 20
                                    ? "var(--color-success)"
                                    : currentOpener.cringe < 40
                                      ? "var(--color-warning)"
                                      : "var(--color-flame)",
                              }}
                            >
                              {currentOpener.cringe}/100
                            </span>
                          </div>

                          {/* Why it works — desktop only */}
                          <p className="hidden lg:block font-display italic text-[11.5px] text-text-secondary leading-[1.45]" style={{ fontWeight: 300 }}>
                            <span className="text-flame not-italic">why →</span> {currentOpener.why}
                          </p>
                        </div>
                      )}

                      {/* Footer — single CTA pill, ALWAYS pinned to the bottom */}
                      <div
                        className={cn(
                          "mt-auto pt-3 transition-opacity duration-500",
                          stage === "done" ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <Link
                          href="/app"
                          className="group relative flex items-center justify-center gap-2 w-full py-3 rounded-full text-white font-display italic text-[14px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background:
                              "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
                            boxShadow:
                              "0 12px 32px -8px rgba(254,60,114,0.55)",
                            fontWeight: 400,
                          }}
                        >
                          <span>run on your match</span>
                          <ArrowRight size={13} className="text-white group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Floating polaroids — keyed with resetVersion to force remount */}
            {PROFILES.map((p) => {
              const used = activeProfile?.id === p.id;
              /* Middle-row polaroids (hannah + riley) sit at the same vertical
                 band as the scanner. Hold them until xl so they never crash
                 into the central card. */
              const isMiddleRow = p.id === "hannah" || p.id === "riley";
              /* On lg the right column is half-viewport — push corner
                 polaroids outward so they don't touch the scanner. */
              const isRightSide = p.startX > 50;
              return (
                <div
                  key={`${p.id}-${resetVersion}`}
                  data-polaroid
                  onPointerDown={(e) => onPointerDown(e, p.id)}
                  onPointerMove={onPointerMove}
                  onPointerUp={(e) => onPointerUp(e, p)}
                  onPointerCancel={(e) => onPointerUp(e, p)}
                  className={cn(
                    "absolute w-[80px] h-[112px] sm:w-[110px] sm:h-[155px] lg:w-[140px] lg:h-[195px] cursor-grab active:cursor-grabbing select-none transition-shadow",
                    "shadow-2xl shadow-black/50 hover:shadow-[0_24px_60px_-15px_rgba(254,60,114,0.4)]",
                    used && "opacity-0 pointer-events-none",
                    isMiddleRow && "hidden xl:block",
                    isRightSide ? "lg:ml-6 xl:ml-0" : "lg:-ml-3 xl:ml-0"
                  )}
                  style={{
                    left: `${p.startX}%`,
                    top: `${p.startY}%`,
                    transform: `rotate(${p.rotation}deg)`,
                    touchAction: "none",
                    zIndex: draggedId === p.id ? 50 : 10,
                  }}
                >
                  <div className="relative w-full h-full rounded-[16px] overflow-hidden bg-bg-card border border-white/10">
                    <Photo g1={p.g1} g2={p.g2} id={`${p.id}-${resetVersion}`} />
                    <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
                      <div className="font-display text-[14px]" style={{ fontWeight: 500 }}>
                        {p.name}, {p.age}
                      </div>
                      <div className="font-display italic text-[9.5px] opacity-80 font-light leading-tight mt-0.5">
                        &ldquo;{p.caption}&rdquo;
                      </div>
                    </div>
                  </div>
                  <div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/10 backdrop-blur-sm rotate-[-3deg]"
                    aria-hidden
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
