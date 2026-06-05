"use client";

import { useEffect, useState } from "react";
import type {
  ProfileAnalysis as ProfileAnalysisType,
  PhotoSnapshot,
} from "@/types";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   ProfileAnalysis — editorial spread.
   No emoji, no card-list. Reads like an article
   about her: name & pull-quote, numbered hooks
   each tappable for the "why", a strikethrough
   don't-list, then the angle + CTA.
   ───────────────────────────────────────────── */

interface ProfileAnalysisProps {
  analysis: ProfileAnalysisType;
  onContinue: () => void;
  /** When true, the "tune the message" CTA is hidden (used by the
      read-only archived match viewer). */
  readOnly?: boolean;
  /** The actual uploaded screenshots (data-URLs) for the photo report. */
  images?: string[];
}

const ANGLE_DESCRIPTOR: Record<string, string> = {
  humor: "humor with a curiosity backbone",
  curiosity: "curiosity, leaning playful",
  calm: "calm directness, no posturing",
  flirty: "flirty with a self-aware edge",
};

export function ProfileAnalysis({
  analysis,
  onContinue,
  readOnly = false,
  images,
}: ProfileAnalysisProps) {
  const [expandedHook, setExpandedHook] = useState<number | null>(0);

  return (
    <div className="w-full animate-fade-up space-y-10 sm:space-y-12">
      {/* ── 1. Header — name + pull-quote ── */}
      <header className="space-y-3 sm:space-y-4">
        <h1
          className="font-display tracking-[-0.025em] leading-[0.95] text-[clamp(2.25rem,7vw,3.75rem)]"
          style={{ fontWeight: 400 }}
        >
          {analysis.name},{" "}
          <span
            className="italic font-light"
            style={{
              background: "linear-gradient(95deg, #FE3C72, #FF8552)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              /* background-clip:text + the tight 0.95 line-height clips the
                 italic descenders; give the glyph box room without shifting
                 layout. */
              display: "inline-block",
              paddingBottom: "0.12em",
              marginBottom: "-0.12em",
            }}
          >
            {analysis.age}
          </span>
          .
        </h1>

        <blockquote
          className="font-display italic text-[clamp(1rem,3.5vw,1.25rem)] text-text-secondary leading-[1.45] max-w-xl border-l border-flame/30 pl-4 sm:pl-5"
          style={{ fontWeight: 300 }}
        >
          &ldquo;{analysis.vibe}&rdquo;
        </blockquote>
      </header>

      {/* ── 2. Hooks — interactive numbered list ── */}
      <section className="space-y-3">
        <div className="flex items-baseline gap-3">
          <span
            className="font-display italic text-flame text-[14px]"
            style={{ fontWeight: 400 }}
          >
            what we noticed
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-flame/40 to-transparent" />
          <span
            className="font-display italic text-[11px] text-text-muted tabular-nums"
            style={{ fontWeight: 300 }}
          >
            {analysis.hooks.length} hooks
          </span>
        </div>

        <ul className="divide-y divide-white/[0.05]">
          {analysis.hooks.map((hook, i) => {
            const isOpen = expandedHook === i;
            const num = String(i + 1).padStart(2, "0");
            return (
              <li key={i}>
                <button
                  onClick={() => setExpandedHook(isOpen ? null : i)}
                  className="w-full text-left py-4 grid grid-cols-[28px_1fr_16px] gap-3 items-baseline group"
                >
                  <span
                    className={cn(
                      "font-display italic text-[13px] tabular-nums transition-colors",
                      isOpen ? "text-flame" : "text-text-muted",
                    )}
                    style={{ fontWeight: 300 }}
                  >
                    {num}
                  </span>
                  <span
                    className={cn(
                      "font-display text-[15px] sm:text-[16px] leading-[1.35] transition-colors",
                      isOpen
                        ? "text-text"
                        : "text-text-secondary group-hover:text-text",
                    )}
                    style={{ fontWeight: 400 }}
                  >
                    {hook.topic}
                  </span>
                  <span
                    className={cn(
                      "relative w-4 h-4 inline-flex items-center justify-center transition-colors mt-1",
                      isOpen ? "text-flame" : "text-text-muted",
                    )}
                    aria-hidden
                  >
                    <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-current" />
                    <span
                      className={cn(
                        "absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-current transition-transform duration-300",
                        isOpen ? "scale-y-0" : "scale-y-100",
                      )}
                    />
                  </span>
                </button>
                <div
                  className={cn(
                    "grid grid-cols-[28px_1fr_16px] gap-3 transition-all duration-500 overflow-hidden",
                    isOpen
                      ? "max-h-40 pb-5 opacity-100"
                      : "max-h-0 pb-0 opacity-0",
                  )}
                >
                  <span />
                  <p
                    className="font-display italic text-[13.5px] text-text-secondary leading-[1.55]"
                    style={{ fontWeight: 300 }}
                  >
                    {hook.why}
                  </p>
                  <span />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── 3. Photo report — interactive polaroid cards ── */}
      {analysis.photoContext.length > 0 && (
        <PhotoReport photos={analysis.photoContext} images={images} />
      )}

      {/* ── 4. Don't write — strikethrough list ── */}
      {analysis.avoid.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-danger/80 text-[14px]"
              style={{ fontWeight: 400 }}
            >
              don&apos;t write
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-danger/30 to-transparent" />
          </div>
          <ul className="space-y-2.5">
            {analysis.avoid.map((item, i) => (
              <li
                key={i}
                className="font-display text-[14px] text-text-muted leading-[1.4] flex items-baseline gap-3"
                style={{ fontWeight: 300 }}
              >
                <span className="text-danger/60 shrink-0 mt-0.5">—</span>
                <span className="line-through decoration-danger/40 decoration-[1.5px]">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── 5. Cosmic read — playful personality snapshot ── */}
      {analysis.cosmicRead && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-flame text-[14px]"
              style={{ fontWeight: 400 }}
            >
              the cosmic read
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-flame/40 to-transparent" />
            <span
              className="font-display italic text-[11px] text-text-muted tabular-nums"
              style={{ fontWeight: 300 }}
            >
              between the lines
            </span>
          </div>
          <p
            className="font-display italic text-[14.5px] sm:text-[15px] text-text-secondary leading-[1.6] max-w-2xl"
            style={{ fontWeight: 300 }}
          >
            {analysis.cosmicRead}
          </p>
        </section>
      )}

      {/* ── 6. Green-light topics — quick reference chips ── */}
      {analysis.greenLightTopics && analysis.greenLightTopics.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-success/90 text-[14px]"
              style={{ fontWeight: 400 }}
            >
              green-light topics
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-success/30 to-transparent" />
          </div>
          <ul className="space-y-1.5">
            {analysis.greenLightTopics.map((topic, i) => (
              <li
                key={i}
                className="font-display italic text-[14px] text-text-secondary leading-[1.5] flex items-baseline gap-3"
                style={{ fontWeight: 300 }}
              >
                <span className="text-success/60 shrink-0">+</span>
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── 7. First-date angles — three concepts ── */}
      {analysis.dateAngles && analysis.dateAngles.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-flame text-[14px]"
              style={{ fontWeight: 400 }}
            >
              if it works · first dates
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-flame/40 to-transparent" />
            <span
              className="font-display italic text-[11px] text-text-muted tabular-nums"
              style={{ fontWeight: 300 }}
            >
              {analysis.dateAngles.length} angles
            </span>
          </div>
          <ul className="space-y-3">
            {analysis.dateAngles.map((angle, i) => (
              <li
                key={i}
                className="grid grid-cols-[28px_1fr] gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
              >
                <span
                  className="font-display italic text-flame text-[13px] tabular-nums"
                  style={{ fontWeight: 300 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div
                    className="font-display text-[15px] sm:text-[16px] text-text"
                    style={{ fontWeight: 400 }}
                  >
                    {angle.title}
                  </div>
                  <div
                    className="font-display italic text-[13px] text-text-muted leading-[1.5] mt-1"
                    style={{ fontWeight: 300 }}
                  >
                    {angle.why}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── 8. Timing window — when to message ── */}
      {analysis.timingWindow && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-flame text-[14px]"
              style={{ fontWeight: 400 }}
            >
              when to message
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-flame/40 to-transparent" />
          </div>
          <p
            className="font-display italic text-[14px] text-text-secondary leading-[1.6] max-w-2xl"
            style={{ fontWeight: 300 }}
          >
            {analysis.timingWindow}
          </p>
        </section>
      )}

      {/* ── 9. Best angle — single line emphasis ── */}
      <section className="pt-4 border-t border-white/[0.06]">
        <div
          className="font-display italic text-[12px] text-text-muted mb-2"
          style={{ fontWeight: 300 }}
        >
          best angle for the opener
        </div>
        <p
          className="font-display text-[clamp(1.125rem,3.5vw,1.5rem)] leading-[1.3]"
          style={{ fontWeight: 400 }}
        >
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
            {ANGLE_DESCRIPTOR[analysis.angle] ?? analysis.angle}
          </span>
        </p>
      </section>

      {/* ── 6. CTA — hidden in read-only viewer ── */}
      {!readOnly && (
      <button
        onClick={onContinue}
        className="group relative w-full py-4 rounded-full font-display italic text-white text-[15px] sm:text-[16px] transition-transform hover:scale-[1.01] active:scale-[0.99]"
        style={{
          background: "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
          boxShadow: "0 18px 40px -12px rgba(254,60,114,0.55)",
          fontWeight: 400,
        }}
      >
        <span className="inline-flex items-center gap-3">
          tune the message
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path d="M5 12 H 19" />
            <path d="M13 6 L 19 12 L 13 18" />
          </svg>
        </span>
      </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PhotoReport — interactive polaroid grid.
   Each card has abstract gradient art (stand-in
   for the actual scanned photo), caption, tag
   chips, and an "unlocks" hook that previews on
   tap/hover.
   ───────────────────────────────────────────── */

function PhotoReport({
  photos,
  images,
}: {
  photos: PhotoSnapshot[];
  images?: string[];
}) {
  /* Tapped screenshot shown full-size in a lightbox (null = closed). */
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span
          className="font-display italic text-flame text-[14px]"
          style={{ fontWeight: 400 }}
        >
          the photo report
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-flame/40 to-transparent" />
        <span
          className="font-display italic text-[11px] text-text-muted tabular-nums"
          style={{ fontWeight: 300 }}
        >
          {photos.length} parsed
        </span>
      </div>

      {/* Editorial spread — everything visible, no toggles. */}
      <div className="space-y-6">
        {photos.map((p, i) => {
          const num = String(i + 1).padStart(2, "0");
          return (
            <div
              key={i}
              className="grid grid-cols-[110px_1fr] sm:grid-cols-[160px_1fr] gap-5 sm:gap-7 items-start py-4 border-t border-white/[0.05] first:border-t-0 first:pt-2"
            >
              {/* Photo — the real uploaded screenshot when we have it, else
                  the abstract placeholder. */}
              <div className="relative rounded-xl overflow-hidden aspect-[3/4] ring-1 ring-white/[0.06]">
                {images && images[i] ? (
                  <button
                    type="button"
                    onClick={() => setPreview(images[i])}
                    aria-label={`Open screenshot ${num}`}
                    className="group absolute inset-0 w-full h-full cursor-zoom-in"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={images[i]}
                      alt={`Uploaded screenshot ${num}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      draggable={false}
                    />
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                    <span className="absolute bottom-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/55 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExpandIcon />
                    </span>
                  </button>
                ) : (
                  <PhotoArt g1={p.g1} g2={p.g2} art={p.art} id={`ph-${i}`} />
                )}
                <span
                  className="absolute top-2 left-2 font-mono text-[9.5px] text-white/85 px-1 rounded bg-black/40 pointer-events-none"
                  style={{ letterSpacing: "0.05em" }}
                >
                  ph {num}
                </span>
              </div>

              {/* Editorial caption */}
              <div className="space-y-2.5 sm:space-y-3 min-w-0">
                <h4
                  className="font-display text-[18px] sm:text-[22px] leading-[1.1] text-text"
                  style={{ fontWeight: 400 }}
                >
                  {p.caption}
                </h4>

                <p
                  className="font-display italic text-[13.5px] sm:text-[14.5px] text-text-secondary leading-[1.55]"
                  style={{ fontWeight: 300 }}
                >
                  {p.vibe}. reads {p.tags.join(", ")}.
                </p>

                <p
                  className="font-display italic text-[13.5px] sm:text-[14.5px] text-text leading-[1.55]"
                  style={{ fontWeight: 300 }}
                >
                  <span className="text-flame">open with</span> — {p.unlocks}.
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {preview && (
        <Lightbox src={preview} onClose={() => setPreview(null)} />
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────
   Lightbox — full-screen preview of a tapped screenshot. Click the backdrop,
   press Escape, or hit ✕ to close. Body scroll is locked while open.
   ───────────────────────────────────────────── */
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot preview"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/85 backdrop-blur-sm animate-fade-up"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute top-4 right-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Screenshot preview"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
      />
    </div>
  );
}

/* Small expand/zoom glyph shown on photo hover. */
function ExpandIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

/* Faux photo art — abstract gradient + variant pattern. Stand-in for the
   actual scanned image so the report has visual weight in the mock. */
function PhotoArt({
  g1,
  g2,
  art,
  id,
}: {
  g1: string;
  g2: string;
  art: number;
  id: string;
}) {
  return (
    <svg
      viewBox="0 0 200 280"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={g1} />
          <stop offset="100%" stopColor={g2} />
        </linearGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </linearGradient>
      </defs>
      <rect width="200" height="280" fill={`url(#${id}-bg)`} />
      {art === 0 && (
        <>
          <circle cx="100" cy="170" r="60" fill="white" opacity="0.18" />
          <path
            d="M0 240 Q 50 200 100 230 T 200 220 L 200 280 L 0 280 Z"
            fill="white"
            opacity="0.14"
          />
        </>
      )}
      {art === 1 && (
        <>
          <rect
            x="55"
            y="100"
            width="90"
            height="120"
            rx="20"
            fill="white"
            opacity="0.2"
          />
          <circle cx="100" cy="140" r="22" fill="white" opacity="0.32" />
        </>
      )}
      {art === 2 && (
        <>
          <g opacity="0.22" fill="white">
            <circle cx="55" cy="160" r="22" />
            <circle cx="100" cy="155" r="26" />
            <circle cx="145" cy="160" r="22" />
          </g>
          <rect
            x="0"
            y="200"
            width="200"
            height="80"
            fill="black"
            opacity="0.18"
          />
        </>
      )}
      {art === 3 && (
        <>
          <path
            d="M0 180 L 50 120 L 100 160 L 150 100 L 200 150 L 200 280 L 0 280 Z"
            fill="black"
            opacity="0.28"
          />
          <circle cx="160" cy="60" r="22" fill="white" opacity="0.5" />
        </>
      )}
      <rect width="200" height="280" fill={`url(#${id}-fade)`} />
    </svg>
  );
}
