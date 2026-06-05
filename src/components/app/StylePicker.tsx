"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import type {
  GeneratedMessage,
  MessageStyle,
  MessageTone,
  PreviewOpener,
} from "@/types";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   StylePicker — editorial sentence-builder.
   No emoji. No "Pick your vibe" header. The user
   composes the line BY CHOOSING TRAITS that
   complete a sentence, then drags a single
   tactile dial for risk level.
   ───────────────────────────────────────────── */

interface StylePickerProps {
  onGenerate: (style: MessageStyle, tone: MessageTone) => void;
  /** When the user wants to commit the preview line directly (skip the 5-variant batch) */
  onPickOpener: (message: GeneratedMessage) => void;
  isGenerating: boolean;
  /** Backend-generated free preview openers — one per voice × risk. */
  previews?: PreviewOpener[];
}

const TRAITS: { value: MessageStyle; label: string; gloss: string }[] = [
  {
    value: "funny",
    label: "funny",
    gloss: "a self-effacing jab that earns the laugh",
  },
  {
    value: "smart",
    label: "sharp",
    gloss: "one clean observation that needs an answer",
  },
  {
    value: "flirty",
    label: "flirty",
    gloss: "subtext she'll feel, not read",
  },
  {
    value: "confident",
    label: "confident",
    gloss: "state a thing, let her bite",
  },
  {
    value: "calm",
    label: "calm",
    gloss: "no posturing, just attention",
  },
  {
    value: "short",
    label: "short",
    gloss: "one sentence, no follow-through baked in",
  },
  {
    value: "less-cringe",
    label: "low-key",
    gloss: "warm, dialled down, easy to reply to",
  },
];

const RISK_LEVELS: { value: MessageTone; label: string }[] = [
  { value: "safer", label: "safer" },
  { value: "natural", label: "natural" },
  { value: "bolder", label: "bolder" },
];

export function StylePicker({
  onGenerate,
  onPickOpener,
  isGenerating,
  previews,
}: StylePickerProps) {
  const [selected, setSelected] = useState<MessageStyle>("confident");
  const [risk, setRisk] = useState<MessageTone>("natural");

  const dialRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ startX: number; startRisk: number } | null>(null);

  const riskIndex = RISK_LEVELS.findIndex((r) => r.value === risk);

  const onDialPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = { startX: e.clientX, startRisk: riskIndex };
  };
  const onDialPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const slotWidth = rect.width / 3;
    const dx = e.clientX - rect.left;
    const newIdx = Math.max(0, Math.min(2, Math.floor(dx / slotWidth)));
    setRisk(RISK_LEVELS[newIdx].value);
  };
  const onDialPointerUp = () => {
    dragging.current = null;
  };

  const currentLabel = TRAITS.find((t) => t.value === selected)?.label ?? "";
  /* Real backend preview for the chosen voice × risk (free). Match
     case-insensitively (Gemini may not echo the exact casing) and fall back to
     the same voice at any risk only if that combo is genuinely missing. */
  const norm = (s: string) => s.trim().toLowerCase();
  const previewLine =
    previews?.find((p) => norm(p.voice) === selected && norm(p.risk) === risk)?.text ??
    previews?.find((p) => norm(p.voice) === selected)?.text ??
    "";

  return (
    <div className="w-full animate-fade-up space-y-9 sm:space-y-12">
      {/* ── 1. Editorial sentence header ── */}
      <header>
        <h1
          className="font-display tracking-[-0.025em] leading-[1.05] text-[clamp(1.75rem,5.5vw,2.5rem)]"
          style={{ fontWeight: 400, textWrap: "balance" }}
        >
          make it land as{" "}
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
            {currentLabel}.
          </span>
        </h1>
      </header>

      {/* ── 2. Voice picker — horizontal scroll wheel with center snap ── */}
      <VoicePicker
        traits={TRAITS}
        selected={selected}
        onSelect={setSelected}
      />

      {/* Gloss — describes the currently picked voice */}
      <p
        className="font-display italic text-[14px] sm:text-[15px] text-text-secondary leading-[1.55] max-w-xl"
        style={{ fontWeight: 300 }}
      >
        — {TRAITS.find((t) => t.value === selected)?.gloss}
      </p>

      {/* ── 3. Risk dial ── */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <span
            className="font-display italic text-flame text-[13px]"
            style={{ fontWeight: 400 }}
          >
            risk
          </span>
        </div>

        <div
          ref={dialRef}
          onPointerDown={onDialPointerDown}
          onPointerMove={onDialPointerMove}
          onPointerUp={onDialPointerUp}
          onPointerCancel={onDialPointerUp}
          className="relative h-12 rounded-full bg-white/[0.04] border border-white/10 cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: "none" }}
        >
          <div className="absolute inset-0 grid grid-cols-3 pointer-events-none">
            {RISK_LEVELS.map((r) => (
              <div
                key={r.value}
                className="flex items-center justify-center"
              >
                <span
                  className={cn(
                    "font-display italic text-[12px] transition-colors",
                    r.value === risk ? "text-text" : "text-text-muted",
                  )}
                  style={{ fontWeight: r.value === risk ? 400 : 300 }}
                >
                  {r.label}
                </span>
              </div>
            ))}
          </div>

          <div
            className="absolute top-1 bottom-1 rounded-full transition-all duration-300 pointer-events-none"
            style={{
              left: `calc(${(riskIndex / 3) * 100}% + 4px)`,
              width: "calc(33.333% - 8px)",
              background: "linear-gradient(95deg, #FE3C72, #FF8552)",
              boxShadow: "0 10px 25px -10px rgba(254,60,114,0.55)",
              opacity: 0.18,
            }}
          />
          <div
            className="absolute top-0 bottom-0 border-2 border-flame rounded-full transition-all duration-300 pointer-events-none"
            style={{
              left: `${(riskIndex / 3) * 100}%`,
              width: "33.333%",
            }}
          />
        </div>
      </div>

      {/* ── 4. Live preview ── */}
      <div
        className="rounded-2xl p-5 sm:p-6 border border-white/[0.06] relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, rgba(254,60,114,0.05), rgba(255,133,82,0.02))",
        }}
      >
        <div
          className="font-display italic text-[11.5px] text-flame mb-2"
          style={{ fontWeight: 400 }}
        >
          previewing the line
        </div>
        <p
          key={`${selected}-${risk}`}
          className="font-display text-[16px] sm:text-[17px] leading-[1.45] text-text animate-fade-up"
          style={{ fontWeight: 400 }}
        >
          {previewLine || "…"}
        </p>
        <div
          className="font-display italic text-[11px] text-text-muted mt-3"
          style={{ fontWeight: 300 }}
        >
          written for her profile · we&apos;ll generate 5 variants.
        </div>
      </div>

      {/* ── 5. CTAs — use this preview OR pull 5 variants ── */}
      <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Send the previewed line directly */}
        <button
          onClick={() =>
            onPickOpener({
              id: Math.random().toString(36).slice(2, 10),
              text: previewLine,
              category: "best",
              label: "the preview",
              cringeRisk: 0,
              tone: `${currentLabel}, ${risk}`,
            })
          }
          disabled={isGenerating || !previewLine}
          className={cn(
            "group flex-1 py-4 rounded-full font-display italic text-[15px] sm:text-[16px] transition-all border border-flame/45 bg-flame/[0.06] text-flame hover:bg-flame/[0.12] hover:border-flame/70",
            isGenerating || !previewLine
              ? "opacity-60 cursor-not-allowed"
              : "hover:scale-[1.01] active:scale-[0.99]",
          )}
          style={{ fontWeight: 400 }}
        >
          <span className="inline-flex items-center gap-3">
            send this one
            <svg
              width="13"
              height="13"
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

        {/* Or pull 5 variants */}
        <button
          onClick={() => onGenerate(selected, risk)}
          disabled={isGenerating}
          className={cn(
            "group relative flex-1 py-4 rounded-full font-display italic text-white text-[15px] sm:text-[16px] transition-transform",
            isGenerating
              ? "cursor-wait opacity-80"
              : "hover:scale-[1.01] active:scale-[0.99]",
          )}
          style={{
            background:
              "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
            boxShadow: "0 18px 40px -12px rgba(254,60,114,0.55)",
            fontWeight: 400,
          }}
        >
          {isGenerating ? (
            <span className="inline-flex items-center gap-2.5">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              drafting…
            </span>
          ) : (
            <span className="inline-flex items-center gap-3">
              pull 5 variants
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
          )}
        </button>
      </div>
      <p
        className="text-center font-display italic text-[11.5px] text-text-muted/70"
        style={{ fontWeight: 300 }}
      >
        sending the preview is free · pulling variants uses 1 hint
      </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VoicePicker — horizontal scroll-snap row.
   Drag/scroll left-right; the centered item is
   the selection. Neighbours fade at the edges.
   Click any visible voice to jump to it.
   ───────────────────────────────────────────── */

function VoicePicker({
  traits,
  selected,
  onSelect,
}: {
  traits: { value: MessageStyle; label: string; gloss: string }[];
  selected: MessageStyle;
  onSelect: (v: MessageStyle) => void;
}) {
  const selectedIdx = traits.findIndex((t) => t.value === selected);

  /* Embla — battle-tested carousel mechanics: drag (mouse + touch), wheel,
     snap, momentum, edge handling all baked in.
     skipSnaps: true → fast flick / wheel can travel past multiple slides
     instead of being clamped to the current one. */
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      /* false → first AND last items can scroll all the way to centre.
         "trimSnaps" would block first item from centering (snap target
         would require negative scroll). */
      containScroll: false,
      dragFree: false,
      skipSnaps: false,
      loop: false,
      duration: 22,
    },
    [WheelGesturesPlugin()],
  );

  /* Track which slide is currently centered so we can drive React state
     from the carousel's settle position. */
  const lastEmittedIdx = useRef<number>(selectedIdx);

  /* Embla's listener is registered once and never re-registered. Without
     a ref, the closure would freeze the initial `selected` value, causing
     the equality check inside to be stale (the "confident doesn't stick
     after picking calm first" bug). */
  const onEmblaSelect = useCallback(() => {
    if (!emblaApi) return;
    const i = emblaApi.selectedScrollSnap();
    if (i === lastEmittedIdx.current) return;
    lastEmittedIdx.current = i;
    const t = traits[i];
    if (t) onSelect(t.value);
  }, [emblaApi, traits, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    /* Initial centre on the active voice without animation. */
    emblaApi.scrollTo(selectedIdx, true);
    lastEmittedIdx.current = selectedIdx;
    emblaApi.on("select", onEmblaSelect);
    return () => {
      emblaApi.off("select", onEmblaSelect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emblaApi]);

  /* When `selected` changes from OUTSIDE (e.g. settings restored, parent
     state) — drive the carousel to match. */
  useEffect(() => {
    if (!emblaApi) return;
    if (selectedIdx === emblaApi.selectedScrollSnap()) return;
    lastEmittedIdx.current = selectedIdx;
    emblaApi.scrollTo(selectedIdx);
  }, [emblaApi, selectedIdx]);

  const goTo = (i: number) => {
    if (!emblaApi) return;
    emblaApi.scrollTo(i);
  };

  const goPrev = () => emblaApi?.scrollPrev();
  const goNext = () => emblaApi?.scrollNext();

  return (
    <div className="relative overflow-hidden min-w-0 w-full">
      {/* Chevrons */}
      <button
        onClick={goPrev}
        disabled={selectedIdx === 0}
        aria-label="previous voice"
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full",
          "flex items-center justify-center transition-all",
          selectedIdx === 0
            ? "opacity-30 cursor-not-allowed"
            : "text-text-muted hover:text-flame",
        )}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={goNext}
        disabled={selectedIdx === traits.length - 1}
        aria-label="next voice"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full",
          "flex items-center justify-center transition-all",
          selectedIdx === traits.length - 1
            ? "opacity-30 cursor-not-allowed"
            : "text-text-muted hover:text-flame",
        )}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      {/* Edge fade masks */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, var(--color-bg) 0%, transparent 100%)",
        }}
        aria-hidden
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(-90deg, var(--color-bg) 0%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden w-full select-none">
        <ul className="flex items-center gap-12 sm:gap-16 py-3 cursor-grab active:cursor-grabbing">
          {traits.map((t, i) => {
            const isActive = i === selectedIdx;
            return (
              <li
                key={t.value}
                className="flex-[0_0_auto]"
              >
                <button
                  onClick={() => goTo(i)}
                  className={cn(
                    "font-display whitespace-nowrap leading-none transition-opacity",
                    "text-[clamp(1.75rem,4vw,2.5rem)]",
                    isActive
                      ? "text-text opacity-100"
                      : "text-text/55 opacity-70 hover:opacity-90",
                  )}
                  style={{ fontWeight: 400, letterSpacing: "-0.02em" }}
                >
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Dot row — position indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {traits.map((t, i) => (
          <button
            key={t.value}
            onClick={() => goTo(i)}
            aria-label={`pick ${t.label}`}
            className={cn(
              "rounded-full transition-all",
              i === selectedIdx
                ? "w-6 h-1 bg-flame"
                : "w-1 h-1 bg-text-muted/40 hover:bg-text-muted/70",
            )}
          />
        ))}
      </div>
    </div>
  );
}
