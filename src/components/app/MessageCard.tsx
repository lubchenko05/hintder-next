"use client";

import { useState } from "react";
import { cn, copyToClipboard } from "@/lib/utils";
import type { GeneratedMessage } from "@/types";

/* ─────────────────────────────────────────────
   MessageCard — editorial single-message card.
   No emoji, no cringe-face. Numbered, with
   the opener text dominant, cringe as a slim
   bar, tone label + copy button.
   ───────────────────────────────────────────── */

interface MessageCardProps {
  message: GeneratedMessage;
  index: number;
  isBest?: boolean;
  onTweak: (message: GeneratedMessage, instruction: string) => void | Promise<void>;
  /** When provided, shows a primary "i'm sending this" pill. The card
      becomes the commit point that seeds the dialogue. */
  onPick?: (message: GeneratedMessage) => void;
  /** Override the pick-button label (defaults to "i'm sending this"). */
  pickLabel?: string;
}

const TWEAK_OPTIONS = [
  "make it shorter",
  "make it sharper",
  "warmer",
  "less obvious",
  "more curious",
];

export function MessageCard({
  message,
  index,
  isBest,
  onTweak,
  onPick,
  pickLabel = "i'm sending this",
}: MessageCardProps) {
  const [copied, setCopied] = useState(false);
  const [tweakOpen, setTweakOpen] = useState(false);
  const [tweaking, setTweaking] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  const runTweak = async (opt: string) => {
    setTweakOpen(false);
    setTweaking(true);
    try {
      await onTweak(message, opt);
    } finally {
      setTweaking(false);
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(message.text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  /* Picking copies + commits in one shot. Most users want both. */
  const handlePick = async () => {
    if (!onPick) return;
    await copyToClipboard(message.text);
    onPick(message);
  };

  const cringeColor =
    message.cringeRisk < 20
      ? "var(--color-success)"
      : message.cringeRisk < 40
        ? "var(--color-warning)"
        : "var(--color-flame)";

  const num = String(index + 1).padStart(2, "0");

  return (
    <article
      className={cn(
        "relative rounded-2xl p-5 sm:p-6 transition-all",
        isBest
          ? "border border-flame/25"
          : "border border-white/[0.06] hover:border-white/15",
      )}
      style={
        isBest
          ? {
              background:
                "linear-gradient(160deg, rgba(254,60,114,0.06), rgba(255,133,82,0.02))",
              boxShadow: "0 12px 30px -15px rgba(254,60,114,0.3)",
            }
          : { background: "rgba(255,255,255,0.015)" }
      }
    >
      {/* Per-card loader while this opener regenerates */}
      {tweaking && (
        <div className="absolute inset-0 z-10 rounded-2xl flex items-center justify-center bg-bg/65 backdrop-blur-[2px]">
          <span
            className="inline-flex items-center gap-2 font-display italic text-[12.5px] text-text-secondary"
            style={{ fontWeight: 300 }}
          >
            <span className="w-3.5 h-3.5 border-2 border-flame/30 border-t-flame rounded-full animate-spin" />
            regenerating…
          </span>
        </div>
      )}

      {/* Header — numeral + tone + best mark */}
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div className="flex items-baseline gap-3 min-w-0">
          <span
            className="font-display italic text-flame text-[13px] tabular-nums shrink-0"
            style={{ fontWeight: 400 }}
          >
            {num}
          </span>
          <span
            className="font-display italic text-[12px] text-text-muted truncate"
            style={{ fontWeight: 300 }}
          >
            {message.tone}
          </span>
          {isBest && (
            <span
              className="font-display italic text-[11px] shrink-0"
              style={{
                fontWeight: 400,
                background: "linear-gradient(95deg, #FE3C72, #FF8552)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              · best pick
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className={cn(
            "font-display italic text-[12px] transition-colors px-2.5 py-1 rounded-md shrink-0",
            copied
              ? "text-success bg-success/10"
              : "text-text-muted hover:text-text hover:bg-white/[0.04]",
          )}
          style={{ fontWeight: 300 }}
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>

      {/* The opener text — dominant */}
      <p
        className="font-display text-[16px] sm:text-[17px] leading-[1.45] text-text mb-4"
        style={{ fontWeight: 400 }}
      >
        {message.text}
      </p>

      {/* Coach — "why this works", revealed on demand */}
      {message.whyItWorks && (
        <>
          <button
            onClick={() => setWhyOpen((v) => !v)}
            className="mb-3 inline-flex items-center gap-1 font-display italic text-[11.5px] text-text-muted hover:text-flame transition-colors"
            style={{ fontWeight: 300 }}
          >
            {whyOpen ? "hide why" : "why this works"}
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className={cn("transition-transform", whyOpen && "rotate-180")}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {whyOpen && (
            <p
              className="mb-4 font-display italic text-[12.5px] text-text-secondary leading-[1.5] border-l-2 border-flame/30 pl-3"
              style={{ fontWeight: 300 }}
            >
              {message.whyItWorks}
            </p>
          )}
        </>
      )}

      {/* Cringe meter */}
      <div className="flex items-center gap-3 mb-2">
        <span
          className="font-display italic text-[11px] text-text-muted shrink-0"
          style={{ fontWeight: 300 }}
        >
          cringe
        </span>
        <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${message.cringeRisk}%`,
              background: cringeColor,
            }}
          />
        </div>
        <span
          className="font-display italic text-[11px] tabular-nums shrink-0"
          style={{ fontWeight: 400, color: cringeColor }}
        >
          {message.cringeRisk}/100
        </span>
      </div>

      {/* Footer: tweak (secondary) + pick (primary, when provided) */}
      <div className="pt-3 mt-3 border-t border-white/[0.05] flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between">
        {!tweakOpen ? (
          <button
            onClick={() => setTweakOpen(true)}
            className="font-display italic text-[12px] text-text-muted hover:text-text transition-colors text-left order-2 sm:order-1"
            style={{ fontWeight: 300 }}
          >
            tweak it →
          </button>
        ) : (
          <div className="space-y-2 animate-fade-up order-2 sm:order-1">
            <div
              className="font-display italic text-[11px] text-text-muted"
              style={{ fontWeight: 300 }}
            >
              regenerate as
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TWEAK_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => void runTweak(opt)}
                  className="font-display italic text-[12px] text-text-secondary border border-white/10 hover:border-flame/40 hover:text-text px-2.5 py-1 rounded-full transition-all"
                  style={{ fontWeight: 300 }}
                >
                  {opt}
                </button>
              ))}
              <button
                onClick={() => setTweakOpen(false)}
                className="font-display italic text-[12px] text-text-muted hover:text-text px-2 py-1 transition-colors"
                style={{ fontWeight: 300 }}
              >
                cancel
              </button>
            </div>
            <p
              className="font-display italic text-[10.5px] text-text-muted/70 pt-0.5"
              style={{ fontWeight: 300 }}
            >
              each regeneration uses 1 hint
            </p>
          </div>
        )}

        {onPick && (
          <button
            onClick={handlePick}
            className={cn(
              "group inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full font-display italic text-[13px] transition-all order-1 sm:order-2 shrink-0",
              "hover:scale-[1.02] active:scale-[0.99]",
            )}
            style={{
              background: isBest
                ? "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)"
                : "linear-gradient(95deg, rgba(254,60,114,0.18), rgba(255,133,82,0.18))",
              border: isBest ? "none" : "1px solid rgba(254,60,114,0.45)",
              color: isBest ? "white" : "var(--color-flame)",
              boxShadow: isBest
                ? "0 10px 25px -8px rgba(254,60,114,0.5)"
                : "none",
              fontWeight: 400,
            }}
          >
            {pickLabel}
            <svg
              width="11"
              height="11"
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
          </button>
        )}
      </div>
    </article>
  );
}
