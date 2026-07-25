"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HeartShape, PassShape, ArrowRight, GeoMark } from "@/components/brand/Icons";

/* ─────────────────────────────────────────────
   HERO — Editorial Fraunces display.
   No mono captions. No badge labels.
   ───────────────────────────────────────────── */

type DeckCard = {
  id: string;
  name: string;
  age: number;
  distance: string;
  vibe: string;
  hooks: string[];
  opener: string;
  g1: string;
  g2: string;
  art: 0 | 1 | 2 | 3;
};

const DECK: DeckCard[] = [
  {
    id: "emma",
    name: "Emma",
    age: 24,
    distance: "2 km",
    vibe: "Ironic. Adventurous.",
    hooks: ["Bali escape", "Cooks better than grandma", "Cat in a sweater"],
    opener:
      "Does your grandma know what you're saying about her here? I'll snitch unless you feed me first",
    g1: "#FE3C72",
    g2: "#FF8552",
    art: 0,
  },
  {
    id: "madison",
    name: "Madison",
    age: 26,
    distance: "5 km",
    vibe: "Creative. Reads too much.",
    hooks: ["Murakami stan", "Vinyl collector", "Indie shows"],
    opener: "Norwegian Wood or Kafka on the Shore — which one ruined you more?",
    g1: "#8B5CF6",
    g2: "#5B8DEF",
    art: 1,
  },
  {
    id: "alex",
    name: "Alex",
    age: 23,
    distance: "1 km",
    vibe: "Outdoorsy. Sarcastic.",
    hooks: ["Climbs mountains", "Aggressive plant mom", "Dad jokes"],
    opener:
      "Your bio says 'aggressive plant mom' — should I be worried about my succulent?",
    g1: "#5BE3A9",
    g2: "#5B8DEF",
    art: 2,
  },
  {
    id: "layla",
    name: "Layla",
    age: 25,
    distance: "8 km",
    vibe: "Loud. Picky about coffee.",
    hooks: ["DJ on weekends", "Coffee snob", "Tattoos with meaning"],
    opener:
      "I'd ask what coffee place you'd never set foot in, but the list might be shorter the other way",
    g1: "#FBBF24",
    g2: "#FE3C72",
    art: 3,
  },
];

function CardArt({ variant, g1, g2, id }: { variant: 0 | 1 | 2 | 3; g1: string; g2: string; id: string }) {
  return (
    <svg viewBox="0 0 320 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={g1} />
          <stop offset="100%" stopColor={g2} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.7" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="60%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect width="320" height="400" fill={`url(#${id}-bg)`} />
      <rect width="320" height="400" fill={`url(#${id}-glow)`} />
      {variant === 0 && (
        <>
          <circle cx="160" cy="280" r="80" fill="white" opacity="0.18" />
          <circle cx="160" cy="280" r="120" fill="none" stroke="white" strokeWidth="2" opacity="0.12" />
          <circle cx="160" cy="280" r="170" fill="none" stroke="white" strokeWidth="2" opacity="0.08" />
        </>
      )}
      {variant === 1 && (
        <>
          <g opacity="0.18" stroke="white" strokeWidth="1.5" fill="none">
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1="0" y1={i * 50} x2="320" y2={i * 50} />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="400" />
            ))}
          </g>
          <circle cx="120" cy="180" r="50" fill="white" opacity="0.22" />
          <rect x="180" y="220" width="80" height="80" fill="black" opacity="0.18" transform="rotate(15 220 260)" />
        </>
      )}
      {variant === 2 && (
        <>
          <path d="M0 280 L 60 220 L 120 250 L 180 180 L 240 230 L 320 200 L 320 400 L 0 400 Z" fill="black" opacity="0.25" />
          <path d="M0 320 L 80 270 L 160 300 L 220 250 L 320 290 L 320 400 L 0 400 Z" fill="black" opacity="0.35" />
        </>
      )}
      {variant === 3 && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M0 ${120 + i * 50} Q 80 ${100 + i * 50}, 160 ${130 + i * 50} T 320 ${120 + i * 50}`}
              stroke="white"
              strokeWidth="2"
              fill="none"
              opacity={0.1 + i * 0.04}
            />
          ))}
        </>
      )}
      <rect x="0" y="240" width="320" height="160" fill={`url(#${id}-fade)`} />
    </svg>
  );
}

export function Hero() {
  const [deck, setDeck] = useState(DECK);
  const [swiping, setSwiping] = useState(false);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);
  const [stamp, setStamp] = useState<"like" | "nope" | null>(null);
  const [showOpener, setShowOpener] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [userSwipeCount, setUserSwipeCount] = useState(0);
  const [showStory, setShowStory] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const deltaRef = useRef({ x: 0, y: 0 });

  /* Wrap commitSwipe for any swipe that came from the user (button or drag).
     The auto-demo timer below uses raw commitSwipe and does NOT count. */
  const userCommit = (dir: "left" | "right") => {
    if (swiping || showStory) return;
    setHasInteracted(true);
    commitSwipe(dir);
    setUserSwipeCount((c) => {
      const next = c + 1;
      if (next >= 2) {
        /* Wait for the swipe-out animation to finish before the pop. */
        setTimeout(() => setShowStory(true), 650);
      }
      return next;
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (swiping) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    deltaRef.current = { x: 0, y: 0 };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current || swiping) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    deltaRef.current = { x: dx, y: dy };
    if (cardRef.current) {
      const rot = dx / 18;
      cardRef.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
    }
    if (dx > 60) setStamp("like");
    else if (dx < -60) setStamp("nope");
    else setStamp(null);
  };

  const onPointerUp = () => {
    if (!startRef.current || swiping) return;
    const { x } = deltaRef.current;
    startRef.current = null;
    if (Math.abs(x) > 120) userCommit(x > 0 ? "right" : "left");
    else {
      if (cardRef.current) cardRef.current.style.transform = "";
      setStamp(null);
    }
  };

  const commitSwipe = (dir: "left" | "right") => {
    setSwiping(true);
    setSwipeDir(dir);
    setStamp(dir === "right" ? "like" : "nope");
    if (cardRef.current) {
      const offset = dir === "right" ? 800 : -800;
      const rot = dir === "right" ? 30 : -30;
      cardRef.current.style.transition = "transform 0.5s cubic-bezier(0.21, 0.6, 0.35, 1), opacity 0.5s";
      cardRef.current.style.transform = `translate(${offset}px, -100px) rotate(${rot}deg)`;
      cardRef.current.style.opacity = "0";
    }
    if (dir === "right") {
      setTimeout(() => setShowOpener(true), 350);
      setTimeout(() => setShowOpener(false), 2400);
    }
    setTimeout(() => {
      setDeck((d) => {
        const [first, ...rest] = d;
        return [...rest, first];
      });
      setSwipeDir(null);
      setStamp(null);
      setSwiping(false);
      if (cardRef.current) {
        cardRef.current.style.transition = "";
        cardRef.current.style.transform = "";
        cardRef.current.style.opacity = "";
      }
    }, 500);
  };

  useEffect(() => {
    if (hasInteracted) return;
    const t = setTimeout(() => {
      commitSwipe("right");
      setHasInteracted(true);
    }, 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInteracted]);

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-0 left-0 right-0 h-[80vh]"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(254,60,114,0.18), transparent 60%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 lg:pt-36 pb-32 sm:pb-36 lg:pb-32 grid lg:grid-cols-[1.2fr_360px] gap-8 sm:gap-12 lg:gap-24 items-center">
        {/* LEFT — single voice editorial headline */}
        <div className="space-y-6 sm:space-y-10 lg:space-y-12 max-w-2xl">
          <h1
            className="font-display tracking-[-0.04em] leading-[0.92] text-[clamp(2.75rem,9vw,8rem)]"
            style={{ fontWeight: 400, textWrap: "balance" }}
          >
            <span className="block">The opener</span>
            <span
              className="block italic"
              style={{
                background: "linear-gradient(95deg, #FE3C72 10%, #FF8552 70%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontStyle: "italic",
                fontWeight: 300,
              }}
            >
              she answers.
            </span>
          </h1>

          <p className="text-[16px] sm:text-[19px] text-text-secondary max-w-md leading-[1.5] font-display font-light">
            Drop her profile. We catch the thread, write the line, you keep the hint. The first one&apos;s on us.
          </p>

          {/* Single huge CTA — solid red pill */}
          <Link
            href="/app"
            className="group inline-flex items-center justify-between gap-6 self-start px-8 sm:px-10 py-4 sm:py-5 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.99]"
            style={{
              background:
                "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
              boxShadow: "0 18px 40px -10px rgba(254,60,114,0.6)",
            }}
          >
            <span
              className="text-[20px] sm:text-[26px] font-display italic text-white"
              style={{ fontWeight: 400 }}
            >
              read a profile
            </span>
            <ArrowRight
              size={20}
              className="text-white transition-transform group-hover:translate-x-0.5 sm:hidden"
            />
            <ArrowRight
              size={24}
              className="text-white hidden sm:block transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          {/* Secondary — try a sample read, no upload / no signup (Track 3) */}
          <Link
            href="/app?demo=1"
            className="self-start font-display italic text-[14px] text-text-muted hover:text-flame transition-colors underline decoration-white/20 underline-offset-4"
            style={{ fontWeight: 300 }}
          >
            or see it on a sample profile first
          </Link>
        </div>

        {/* RIGHT — deck */}
        <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[340px] aspect-[3/4]">
          {deck.slice(0, 4).map((card, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={card.id + idx}
                ref={isTop ? cardRef : undefined}
                onPointerDown={isTop ? onPointerDown : undefined}
                onPointerMove={isTop ? onPointerMove : undefined}
                onPointerUp={isTop ? onPointerUp : undefined}
                onPointerCancel={isTop ? onPointerUp : undefined}
                onClick={() => setHasInteracted(true)}
                data-pos={idx}
                className={cn(
                  "swipe-card absolute inset-0 rounded-[26px] overflow-hidden shadow-2xl shadow-black/70",
                  isTop && "cursor-grab active:cursor-grabbing"
                )}
              >
                {isTop && (
                  <>
                    <div className="swipe-stamp-like" style={{ opacity: stamp === "like" ? 1 : 0 }}>LIKE</div>
                    <div className="swipe-stamp-nope" style={{ opacity: stamp === "nope" ? 1 : 0 }}>NOPE</div>
                  </>
                )}
                <div className="relative h-[62%]">
                  <CardArt variant={card.art} g1={card.g1} g2={card.g2} id={`${card.id}-${idx}`} />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-[28px] font-display tracking-tight" style={{ fontWeight: 500 }}>
                        {card.name}
                      </h3>
                      <span className="text-xl font-light opacity-90 font-display">
                        {card.age}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-display italic font-light">
                        <GeoMark size={8} className="text-white/80" />
                        {card.distance}
                      </span>
                    </div>
                    <p className="text-[12px] opacity-90 mt-1 font-display italic font-light">
                      {card.vibe}
                    </p>
                  </div>
                </div>
                <div className="relative h-[38%] bg-bg-card p-4 space-y-3">
                  <div className="text-[12px] font-display italic text-flame font-light">
                    What we noticed
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.hooks.map((hook) => (
                      <span
                        key={hook}
                        className="px-2 py-1 text-[11px] rounded-md text-text-secondary border border-white/[0.08] bg-white/[0.02] font-display font-light"
                      >
                        {hook}
                      </span>
                    ))}
                  </div>
                  <div
                    className={cn(
                      "px-3 py-2 rounded-lg text-[12px] italic text-text-secondary leading-snug border-l-2 transition-all duration-500 font-display font-light",
                      isTop && showOpener && swipeDir === "right"
                        ? "border-flame opacity-100 translate-y-0 bg-flame/[0.06]"
                        : "border-white/5 opacity-0 translate-y-2"
                    )}
                  >
                    &ldquo;{card.opener.slice(0, 80)}…&rdquo;
                  </div>
                </div>
              </div>
            );
          })}

          <div className="absolute -bottom-28 sm:-bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-4 pb-4">
            <button
              onClick={() => userCommit("left")}
              className="group w-12 h-12 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-md hover:border-danger/60 hover:bg-danger/10 active:scale-90 transition-all flex items-center justify-center text-white/70 hover:text-danger"
              aria-label="Pass"
            >
              <PassShape size={18} />
            </button>

            <button
              onClick={() => userCommit("right")}
              className="group relative w-16 h-16 rounded-full overflow-hidden active:scale-95 hover:scale-110 transition-transform"
              aria-label="Like"
              style={{
                background: "linear-gradient(135deg, #FE3C72 0%, #FF6B6B 50%, #FF8552 100%)",
                boxShadow: "0 12px 30px -8px rgba(254,60,114,0.7)",
              }}
            >
              <span className="relative flex items-center justify-center w-full h-full text-white">
                <HeartShape size={26} />
              </span>
            </button>

            <button
              onClick={() => userCommit("right")}
              className="w-12 h-12 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-md hover:border-flame/60 hover:bg-flame/10 active:scale-90 transition-all flex items-center justify-center text-white/70 hover:text-flame"
              aria-label="Next"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Story CTA modal lives below, rendered via fixed positioning
              so it covers the page header / everything. */}
        </div>
      </div>

      {/* Story CTA modal — full-viewport so it covers the page header */}
      {showStory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 sm:p-8">
          {/* Backdrop */}
          <div
            className="absolute inset-0 animate-fade-in"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(15,12,20,0.92) 0%, rgba(15,12,20,0.82) 60%, rgba(15,12,20,0.7) 100%)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
            onClick={() => setShowStory(false)}
          />

          {/* Card */}
          <div
            className="relative w-full max-w-[420px] rounded-[28px] p-7 sm:p-9 animate-story-pop"
            style={{
              background:
                "linear-gradient(160deg, rgba(254,60,114,0.14), rgba(20,15,25,0.94) 55%, rgba(15,12,20,1))",
              border: "1px solid rgba(254,60,114,0.35)",
            }}
          >
            {/* Animated glow */}
            <div
              className="absolute inset-0 rounded-[28px] pointer-events-none animate-story-glow"
              aria-hidden
            />

            {/* Close */}
            <button
              onClick={() => setShowStory(false)}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/15 bg-white/[0.04] hover:border-white/35 hover:bg-white/[0.08] transition-colors flex items-center justify-center text-white/60 hover:text-white z-10"
            >
              <PassShape size={12} />
            </button>

            <div className="relative space-y-6 sm:space-y-7">
              {/* Eyebrow */}
              <div
                className="font-display italic text-flame text-[11.5px] tracking-wide inline-flex items-center gap-2"
                style={{ fontWeight: 400 }}
              >
                <span className="relative inline-flex w-1.5 h-1.5">
                  <span
                    className="absolute inline-flex w-full h-full rounded-full"
                    style={{
                      background: "var(--color-flame)",
                      animation: "ping 1.8s cubic-bezier(0,0,0.2,1) infinite",
                    }}
                  />
                  <span
                    className="relative inline-flex w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--color-flame)" }}
                  />
                </span>
                your turn
              </div>

              {/* Headline */}
              <h3
                className="font-display tracking-[-0.02em] leading-[1.02] text-[clamp(1.85rem,5.2vw,2.4rem)]"
                style={{ fontWeight: 400, textWrap: "balance" }}
              >
                let&apos;s start{" "}
                <span
                  className="italic"
                  style={{
                    background: "linear-gradient(95deg, #FE3C72, #FF8552)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: 300,
                  }}
                >
                  your own story.
                </span>
              </h3>

              {/* Body */}
              <p
                className="font-display italic text-[14px] text-text-secondary leading-[1.55]"
                style={{ fontWeight: 300 }}
              >
                Drop a real profile, get five openers tuned to her voice and a read on every reply. First one&apos;s on us.
              </p>

              {/* What you get — numbered editorial list */}
              <ul className="space-y-2.5 border-t border-white/[0.06] pt-5">
                {[
                  { n: "01", t: "five openers", s: "tuned to her bio, photos, and tone" },
                  { n: "02", t: "a tone dial", s: "funny, sharp, flirty — you steer" },
                  { n: "03", t: "she replies?", s: "drop the screen, we read it back" },
                ].map((row) => (
                  <li
                    key={row.n}
                    className="grid grid-cols-[28px_1fr] gap-3 items-baseline"
                  >
                    <span
                      className="font-display italic text-flame text-[12px] tabular-nums"
                      style={{ fontWeight: 400 }}
                    >
                      {row.n}
                    </span>
                    <span className="space-x-2">
                      <span
                        className="font-display text-[14.5px] text-text"
                        style={{ fontWeight: 400 }}
                      >
                        {row.t}
                      </span>
                      <span
                        className="font-display italic text-[13px] text-text-muted"
                        style={{ fontWeight: 300 }}
                      >
                        — {row.s}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/app"
                className="group inline-flex w-full items-center justify-between gap-3 px-6 py-4 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.99]"
                style={{
                  background:
                    "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
                  boxShadow: "0 18px 40px -10px rgba(254,60,114,0.55)",
                }}
              >
                <span
                  className="text-[16px] sm:text-[17px] font-display italic text-white"
                  style={{ fontWeight: 400 }}
                >
                  read a real one
                </span>
                <ArrowRight
                  size={20}
                  className="text-white transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              {/* Fine print */}
              <p
                className="text-center font-display italic text-[11.5px] text-text-muted"
                style={{ fontWeight: 300 }}
              >
                no card. no signup. three free hints.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
