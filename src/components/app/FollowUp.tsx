"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MessageCard } from "./MessageCard";
import type {
  ConversationTurn,
  DateAngle,
  FollowUpAnalysis,
  GeneratedMessage,
} from "@/types";

/* ─────────────────────────────────────────────
   FollowUp — multi-turn dialogue continuation.
   User pastes/uploads her reply (up to 5 screens
   of dialogue), gets a read + 3 picks. Picking
   one commits it as a sent message and resets the
   input so they can paste her NEXT reply.
   No emoji. Editorial.
   ───────────────────────────────────────────── */

interface FollowUpProps {
  analysis: FollowUpAnalysis | null;
  conversation: ConversationTurn[];
  onSubmitReply: (reply: string, screenshots: string[]) => void;
  /** Analyse the conversation as-is (her reply is already the last turn). */
  onReadReply: () => void;
  onPickReply: (message: GeneratedMessage) => void;
  onAcceptDateInvite: (message: GeneratedMessage) => void;
  onClearConversation: () => void;
  onTweak: (message: GeneratedMessage, instruction: string) => void;
  onBack: () => void;
  isAnalyzing: boolean;
}

const INTEREST_DESCRIPTOR: Record<string, string> = {
  high: "she's in",
  medium: "warming up — careful",
  low: "low interest, salvageable",
  unclear: "not enough to read",
};

const INTEREST_COLOR: Record<string, string> = {
  high: "var(--color-success)",
  medium: "var(--color-warning)",
  low: "var(--color-flame)",
  unclear: "var(--color-text-muted)",
};

const MAX_SCREENSHOTS = 5;

export function FollowUp({
  analysis,
  conversation,
  onSubmitReply,
  onReadReply,
  onPickReply,
  onAcceptDateInvite,
  onClearConversation,
  onTweak,
  onBack,
  isAnalyzing,
}: FollowUpProps) {
  const [reply, setReply] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasContent = reply.trim().length > 0 || screenshots.length > 0;
  /* Her reply is already the last turn (no read yet) — it's the user's move,
     so we let them read it directly without re-typing what she said. */
  const lastTurn = conversation[conversation.length - 1];
  const herAwaitingRead = !analysis && lastTurn?.role === "her";
  const canSubmit = !isAnalyzing && (hasContent || herAwaitingRead);

  const handleSubmit = () => {
    if (!canSubmit) return;
    /* No new content + her reply already there → just read it. */
    if (!hasContent && herAwaitingRead) {
      onReadReply();
      return;
    }
    const textPayload =
      reply.trim() ||
      (screenshots.length > 1
        ? `[${screenshots.length} screenshots of the chat]`
        : "[screenshot of her reply]");
    onSubmitReply(textPayload, screenshots);
    setReply("");
    setScreenshots([]);
  };

  const addFiles = (files: FileList | File[]) => {
    const images = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!images.length) return;
    const slotsLeft = MAX_SCREENSHOTS - screenshots.length;
    const toRead = images.slice(0, slotsLeft);
    toRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        if (data) setScreenshots((prev) => [...prev, data].slice(0, MAX_SCREENSHOTS));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (i: number) => {
    setScreenshots((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const item = Array.from(e.clipboardData.items).find((it) =>
      it.type.startsWith("image/"),
    );
    if (item) {
      const file = item.getAsFile();
      if (file) {
        e.preventDefault();
        addFiles([file]);
      }
    }
  };

  /* When analysis is showing, we hide the input area. Once the user picks a
     follow-up, the parent clears the analysis and the input flips back. */
  const showInput = !analysis;

  return (
    <div className="w-full animate-fade-up space-y-8 sm:space-y-10">


      {/* Analysis result — top of the page when present */}
      {analysis && (
        <div className="space-y-8 animate-fade-up">
          {/* Interest level — premium editorial card */}
          <section
            className="relative rounded-[24px] p-7 sm:p-9 overflow-hidden"
            style={{
              background:
                "linear-gradient(155deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 35%, rgba(15,12,20,0.6) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 30px 60px -30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none opacity-[0.18]"
              style={{
                background: `radial-gradient(circle, ${INTEREST_COLOR[analysis.interestLevel]} 0%, transparent 65%)`,
                filter: "blur(20px)",
              }}
              aria-hidden
            />

            <div className="relative flex items-start justify-between gap-4">
              <div
                className="font-display italic text-[11px] tracking-[0.12em] uppercase inline-flex items-center gap-2"
                style={{
                  fontWeight: 400,
                  color: INTEREST_COLOR[analysis.interestLevel],
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: INTEREST_COLOR[analysis.interestLevel] }}
                />
                the read
              </div>
            </div>

            <p
              className="relative mt-5 font-display text-[clamp(1.5rem,4.5vw,1.875rem)] leading-[1.15] tracking-[-0.015em]"
              style={{ fontWeight: 400, textWrap: "balance" }}
            >
              {INTEREST_DESCRIPTOR[analysis.interestLevel]}
            </p>
            <p
              className="relative mt-5 font-display italic text-[14.5px] sm:text-[15px] text-text-secondary leading-[1.6] max-w-xl"
              style={{ fontWeight: 300 }}
            >
              {analysis.suggestion}
            </p>
          </section>

          <DateReadiness
            score={analysis.dateReadiness}
            note={analysis.dateReadinessNote}
            recommendations={analysis.dateRecommendations}
            invites={analysis.dateInvites}
            urgencyWarning={analysis.urgencyWarning}
            onPick={onAcceptDateInvite}
            onTweak={onTweak}
          />

          <section>
            <div className="flex items-baseline gap-3 mb-3">
              <span
                className="font-display italic text-danger/80 text-[13px]"
                style={{ fontWeight: 400 }}
              >
                don&apos;t send this
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-danger/30 to-transparent" />
            </div>
            <p
              className="font-display italic text-[14px] text-text-muted leading-[1.5]"
              style={{ fontWeight: 300 }}
            >
              {analysis.doNotSend}
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span
                className="font-display italic text-flame text-[13px]"
                style={{ fontWeight: 400 }}
              >
                pick one to send
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-flame/40 to-transparent" />
            </div>
            <div className="space-y-3">
              {analysis.nextMessages.map((msg, i) => (
                <MessageCard
                  key={msg.id}
                  message={msg}
                  index={i}
                  isBest={i === 0}
                  onTweak={onTweak}
                  onPick={onPickReply}
                />
              ))}
            </div>
            <CustomComposer onPick={onPickReply} />
          </section>
        </div>
      )}

      {/* Conversation timeline — Tinder-style bubble chat */}
      {conversation.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-flame text-[13px]"
              style={{ fontWeight: 400 }}
            >
              the thread
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-flame/40 to-transparent" />
          </div>
          {/* Chat surface — looks like a real chat window */}
          <div
            className="rounded-3xl p-4 sm:p-5 space-y-1.5"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0.005))",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {conversation.map((turn, i) => {
              const isMe = turn.role === "me";
              const prev = conversation[i - 1];
              const next = conversation[i + 1];
              const isFirstInRun = !prev || prev.role !== turn.role;
              const isLastInRun = !next || next.role !== turn.role;
              return (
                <div
                  key={turn.id}
                  className={cn(
                    "flex",
                    isMe ? "justify-end" : "justify-start",
                    isLastInRun ? "mb-2.5" : "mb-0.5",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[78%] sm:max-w-[72%] flex flex-col",
                      isMe ? "items-end" : "items-start",
                    )}
                  >
                    {/* Bubble */}
                    <div
                      className={cn(
                        "px-3.5 py-2.5 sm:px-4 sm:py-3 transition-colors",
                        isMe ? "text-white" : "text-text",
                      )}
                      style={{
                        background: isMe
                          ? "linear-gradient(135deg, #FE3C72, #FF6B6B 60%, #FF8552)"
                          : "rgba(255,255,255,0.07)",
                        boxShadow: isMe
                          ? "0 8px 20px -10px rgba(254,60,114,0.45)"
                          : "none",
                        /* Tinder-style corner radii: 18px round, the corner
                           on the "tail side" gets sharper on the last bubble
                           in a run, rounded otherwise. */
                        borderRadius: isMe
                          ? `20px 20px ${isLastInRun ? "6px" : "20px"} 20px`
                          : `20px 20px 20px ${isLastInRun ? "6px" : "20px"}`,
                      }}
                    >
                      <p
                        className="font-display text-[14.5px] sm:text-[15px] leading-[1.4]"
                        style={{ fontWeight: 400 }}
                      >
                        {turn.text}
                      </p>
                    </div>
                    {/* Screenshots — small thumbs aligned with the bubble */}
                    {turn.screenshots && turn.screenshots.length > 0 && (
                      <div
                        className={cn(
                          "flex gap-1.5 mt-1.5 flex-wrap",
                          isMe ? "justify-end" : "justify-start",
                        )}
                      >
                        {turn.screenshots.map((src, idx) => (
                          <img
                            key={idx}
                            src={src}
                            alt={`screenshot ${idx + 1}`}
                            className="w-12 h-12 object-cover rounded-lg border border-white/10"
                          />
                        ))}
                      </div>
                    )}
                    {/* Sender label — small, only on last bubble in run */}
                    {isLastInRun && (
                      <span
                        className={cn(
                          "font-display italic text-[10.5px] text-text-muted mt-1 px-1",
                          isMe ? "text-right" : "text-left",
                        )}
                        style={{ fontWeight: 300 }}
                      >
                        {isMe ? "you" : "her"}
                      </span>
                    )}
                    {void isFirstInRun}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Input area — hidden while analysis is on screen */}
      {showInput && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "relative rounded-2xl border transition-colors",
            isDragging
              ? "border-flame bg-flame/[0.06]"
              : screenshots.length > 0
                ? "border-flame/30 bg-flame/[0.03]"
                : "border-white/10 bg-white/[0.03] focus-within:border-flame/40",
          )}
        >
          {/* Screenshot strip */}
          {screenshots.length > 0 && (
            <div className="p-4 border-b border-white/[0.06]">
              <div className="flex items-baseline justify-between mb-2.5">
                <div
                  className="font-display italic text-[12px] text-text"
                  style={{ fontWeight: 400 }}
                >
                  {screenshots.length} of {MAX_SCREENSHOTS} attached
                </div>
                <div
                  className="font-display italic text-[11px] text-text-muted"
                  style={{ fontWeight: 300 }}
                >
                  drop in order — top to bottom of the chat
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {screenshots.map((src, i) => (
                  <div
                    key={i}
                    className="relative group w-[68px] h-[88px] rounded-lg overflow-hidden border border-white/10"
                  >
                    <img
                      src={src}
                      alt={`screenshot ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm font-mono text-[9px] text-white/85"
                    >
                      {i + 1}
                    </span>
                    <button
                      onClick={() => removeScreenshot(i)}
                      aria-label={`Remove screenshot ${i + 1}`}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 backdrop-blur-sm text-white/90 hover:bg-flame hover:text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                    >
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onPaste={handlePaste}
            placeholder={
              screenshots.length > 0
                ? "add context if you want (optional)…"
                : herAwaitingRead
                  ? "she already replied — hit read below, or paste more of the chat…"
                  : conversation.length > 0
                    ? "type her next reply, paste a screenshot, or drop one here…"
                    : "type what she wrote, paste a screenshot, or drop one here…"
            }
            rows={4}
            className="w-full p-5 bg-transparent outline-none text-text font-display text-[15px] leading-[1.5] resize-none placeholder:text-text-muted/60 rounded-2xl"
            style={{ fontWeight: 400 }}
          />

          {/* Bottom toolbar: prominent attach button + drag hint */}
          <div className="flex items-center justify-between px-3 pb-3 -mt-1 gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={screenshots.length >= MAX_SCREENSHOTS}
              className={cn(
                "group inline-flex items-center gap-2 px-3.5 py-2 rounded-full transition-all font-display italic text-[12.5px]",
                screenshots.length >= MAX_SCREENSHOTS
                  ? "opacity-40 cursor-not-allowed border border-white/10 text-text-muted"
                  : "border border-flame/40 bg-flame/[0.06] text-flame hover:bg-flame/[0.12] hover:border-flame/60 hover:scale-[1.02] active:scale-[0.98]",
              )}
              style={{ fontWeight: 400 }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="shrink-0"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              {screenshots.length === 0
                ? "attach a screenshot"
                : screenshots.length >= MAX_SCREENSHOTS
                  ? "max 5 attached"
                  : `attach more · ${MAX_SCREENSHOTS - screenshots.length} left`}
            </button>
            {isDragging && (
              <span
                className="font-display italic text-[12px] text-flame pr-2"
                style={{ fontWeight: 400 }}
              >
                drop it
              </span>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>
      )}

      {/* Submit */}
      {showInput && (
        <div className="space-y-2">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "group relative w-full py-4 rounded-full font-display italic text-white text-[15px] sm:text-[16px] transition-all",
            canSubmit
              ? "hover:scale-[1.01] active:scale-[0.99]"
              : "opacity-50 cursor-not-allowed",
          )}
          style={{
            background:
              "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
            boxShadow: canSubmit
              ? "0 18px 40px -12px rgba(254,60,114,0.55)"
              : "none",
            fontWeight: 400,
          }}
        >
          {isAnalyzing ? (
            <span className="inline-flex items-center gap-2.5">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              reading the room…
            </span>
          ) : (
            <span className="inline-flex items-center gap-3">
              {herAwaitingRead && !hasContent
                ? "read her reply"
                : conversation.length === 0
                  ? "read her reply"
                  : "read her next move"}
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
        <p
          className="text-center font-display italic text-[11.5px] text-text-muted/70"
          style={{ fontWeight: 300 }}
        >
          uses 1 hint · picking what to send is free
        </p>
        </div>
      )}

    </div>
  );
}

/* ─────────────────────────────────────────────
   CustomComposer — for when none of the picks fit.
   Type your own line, commit it as the sent
   message, conversation continues from there.
   ───────────────────────────────────────────── */

function CustomComposer({
  onPick,
}: {
  onPick: (message: GeneratedMessage) => void;
}) {
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    onPick({
      id: Math.random().toString(36).slice(2, 10),
      text: text.trim(),
      category: "best",
      label: "your own",
      cringeRisk: 0,
      tone: "your own",
    });
    setText("");
  };

  return (
    <article
      className={cn(
        "relative rounded-2xl p-5 sm:p-6 transition-all",
        "border border-white/[0.06] hover:border-white/15",
      )}
      style={{ background: "rgba(255,255,255,0.015)" }}
    >
      {/* Header */}
      <div className="flex items-baseline gap-3 mb-3">
        <span
          className="font-display italic text-flame text-[13px] tabular-nums shrink-0"
          style={{ fontWeight: 400 }}
        >
          ✎
        </span>
        <span
          className="font-display italic text-[12px] text-text-muted"
          style={{ fontWeight: 300 }}
        >
          write your own
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="type what you'd actually send her…"
        rows={3}
        className="w-full p-4 rounded-xl bg-white/[0.025] border border-white/[0.06] focus:border-flame/40 outline-none text-text font-display text-[15px] leading-[1.45] resize-none transition-colors placeholder:text-text-muted/60"
        style={{ fontWeight: 400 }}
      />

      <div className="pt-3 mt-3 border-t border-white/[0.05] flex items-center justify-end">
        <button
          onClick={send}
          disabled={!canSend}
          className={cn(
            "group inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full font-display italic text-[13px] transition-all shrink-0",
            canSend
              ? "hover:scale-[1.02] active:scale-[0.99]"
              : "opacity-50 cursor-not-allowed",
          )}
          style={{
            background: canSend
              ? "linear-gradient(95deg, rgba(254,60,114,0.18), rgba(255,133,82,0.18))"
              : "transparent",
            border: "1px solid rgba(254,60,114,0.45)",
            color: "var(--color-flame)",
            fontWeight: 400,
          }}
        >
          send this →
        </button>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────
   DateReadiness — gauge showing whether it's
   appropriate to ask her out. Recommendations
   surface only once the bar clears the warm zone.
   ───────────────────────────────────────────── */

function DateReadiness({
  score,
  note,
  recommendations,
  invites,
  urgencyWarning,
  onPick,
  onTweak,
}: {
  score: number;
  note: string;
  recommendations?: DateAngle[];
  invites?: GeneratedMessage[];
  urgencyWarning?: string;
  onPick: (message: GeneratedMessage) => void;
  onTweak: (message: GeneratedMessage, instruction: string) => void;
}) {
  const phase: "cold" | "warming" | "warm" | "go" | "urgent" =
    score < 35
      ? "cold"
      : score < 60
        ? "warming"
        : score < 80
          ? "warm"
          : score < 90
            ? "go"
            : "urgent";

  const colorMap: Record<typeof phase, string> = {
    cold: "var(--color-text-muted)",
    warming: "var(--color-warning)",
    warm: "var(--color-flame)",
    go: "var(--color-success)",
    urgent: "var(--color-flame)",
  };
  const labelMap: Record<typeof phase, string> = {
    cold: "too early",
    warming: "warming up",
    warm: "in the window",
    go: "ask her now",
    urgent: "window closing",
  };
  const ready = phase === "warm" || phase === "go" || phase === "urgent";
  const isUrgent = phase === "urgent";
  const color = colorMap[phase];

  return (
    <section className="relative space-y-7">
      {/* Soft accent glow — decorative, no frame */}
      <div
        className="absolute -top-24 -right-12 w-72 h-72 rounded-full pointer-events-none opacity-[0.14] -z-10"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
          filter: "blur(40px)",
        }}
        aria-hidden
      />

      {/* Eyebrow */}
      <div className="relative flex items-baseline justify-between gap-3">
        <div
          className="font-display italic text-[11px] tracking-[0.12em] uppercase inline-flex items-center gap-2"
          style={{ fontWeight: 400, color }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: color }}
          />
          date readiness
        </div>
        <div
          className="font-display italic text-[11.5px] text-text-muted"
          style={{ fontWeight: 300 }}
        >
          {labelMap[phase]}
        </div>
      </div>

      {/* Big score + question stacked */}
      <div className="relative flex items-end justify-between gap-6">
        <p
          className="font-display text-[clamp(1.5rem,4.5vw,1.875rem)] leading-[1.15] tracking-[-0.015em] max-w-md"
          style={{ fontWeight: 400, textWrap: "balance" }}
        >
          ready to{" "}
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
            ask her out?
          </span>
        </p>
        <div className="flex items-baseline gap-1 shrink-0">
          <span
            className="font-display text-[clamp(2.25rem,6vw,3rem)] leading-none tabular-nums tracking-[-0.04em]"
            style={{ fontWeight: 400, color }}
          >
            {score}
          </span>
          <span
            className="font-display italic text-[14px] text-text-muted"
            style={{ fontWeight: 300 }}
          >
            /100
          </span>
        </div>
      </div>

      {/* Bar — taller, with glow on the head + threshold tick */}
      <div
        className="relative h-2 rounded-full bg-white/[0.05] overflow-hidden"
        aria-label="date readiness"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${score}%`,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.25), rgba(254,60,114,0.6) 45%, rgba(16,185,129,0.75))",
            boxShadow: ready
              ? `0 0 18px 0 ${color}`
              : "none",
          }}
        />
        {/* Threshold tick — the "window opens" mark */}
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{
            left: "65%",
            background: "rgba(255,255,255,0.25)",
          }}
          aria-hidden
        />
        <div
          className="absolute top-full mt-1 font-display italic text-[10px] text-text-muted/70"
          style={{ left: "65%", transform: "translateX(-50%)", fontWeight: 300 }}
        >
          window
        </div>
      </div>

      {/* Urgency — at 90+ becomes a live ticking countdown */}
      {isUrgent && <UrgencyCountdown />}

      {/* Recommendations — only once the bar passes the threshold */}
      {ready && recommendations && recommendations.length > 0 && (
        <div className="space-y-3 animate-fade-up">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-flame text-[12px]"
              style={{ fontWeight: 400 }}
            >
              where to ask her
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-flame/30 to-transparent" />
          </div>
          <ul className="space-y-2.5">
            {recommendations.map((rec, i) => (
              <li
                key={i}
                className="grid grid-cols-[24px_1fr] gap-3 items-baseline"
              >
                <span
                  className="font-display italic text-flame text-[12px] tabular-nums"
                  style={{ fontWeight: 300 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div
                    className="font-display text-[14.5px] text-text"
                    style={{ fontWeight: 400 }}
                  >
                    {rec.title}
                  </div>
                  <div
                    className="font-display italic text-[12.5px] text-text-muted leading-[1.5] mt-0.5"
                    style={{ fontWeight: 300 }}
                  >
                    {rec.why}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ready-to-send invitations — only at 90+ */}
      {isUrgent && invites && invites.length > 0 && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-flame text-[12px]"
              style={{ fontWeight: 400 }}
            >
              send the ask · pick one
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-flame/30 to-transparent" />
          </div>
          <div className="space-y-3">
            {invites.map((msg, i) => (
              <MessageCard
                key={msg.id}
                message={msg}
                index={i}
                isBest={i === 0}
                onTweak={onTweak}
                onPick={onPick}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────
   UrgencyCountdown — live ticking timer that
   makes the closing window visible. No alert
   box, no "ACT NOW" label. Just typography +
   moving digits.
   ───────────────────────────────────────────── */

function UrgencyCountdown() {
  /* Deadline = now + 8h. Mock: in real impl this would come from the
     analysis (estimated time-to-cooling based on her reply cadence). */
  const deadlineRef = useRef<number>(Date.now() + 24 * 60 * 60 * 1000);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, deadlineRef.current - now);
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-8 pt-2">
      {/* Editorial copy */}
      <div className="space-y-1.5">
        <div
          className="font-display italic text-[11px] tracking-[0.16em] uppercase text-flame"
          style={{ fontWeight: 400 }}
        >
          window closes in
        </div>
        <p
          className="font-display italic text-[14px] text-text-muted leading-[1.5] max-w-md"
          style={{ fontWeight: 300 }}
        >
          send the ask before the digits hit zero — every quiet hour after
          cools the room.
        </p>
      </div>

      {/* Live ticking digits */}
      <div
        className="font-display tabular-nums leading-none tracking-[-0.04em] flex items-baseline gap-1 shrink-0"
        style={{ fontWeight: 400 }}
        aria-live="polite"
      >
        <CountSegment value={pad(h)} unit="h" />
        <span
          className="text-text-muted/40 text-[clamp(2rem,5vw,3rem)] mx-0.5"
          aria-hidden
        >
          :
        </span>
        <CountSegment value={pad(m)} unit="m" />
        <span
          className="text-text-muted/40 text-[clamp(2rem,5vw,3rem)] mx-0.5"
          aria-hidden
        >
          :
        </span>
        <CountSegment value={pad(s)} unit="s" pulse />
      </div>
    </div>
  );
}

function CountSegment({
  value,
  unit,
  pulse,
}: {
  value: string;
  unit: string;
  pulse?: boolean;
}) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span
        className={cn(
          "text-[clamp(2.25rem,6vw,3rem)]",
          pulse && "animate-pulse-soft",
        )}
        style={{
          background: "linear-gradient(180deg, #FE3C72, #FF8552)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
      </span>
      <span
        className="font-display italic text-[12px] text-text-muted"
        style={{ fontWeight: 300 }}
      >
        {unit}
      </span>
    </span>
  );
}
