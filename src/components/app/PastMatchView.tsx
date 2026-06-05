"use client";

import { ProfileAnalysis } from "./ProfileAnalysis";
import { DatePrep } from "./DatePrep";
import { cn } from "@/lib/utils";
import type { MatchHistoryEntry } from "@/types";

/* ─────────────────────────────────────────────
   PastMatchView — read-only viewer for an
   archived match. Shows initial analysis →
   transcript → final report (if asked-out).

   Critical: NO interactive controls. No pick,
   no tweak, no submit. Just history.
   ───────────────────────────────────────────── */

interface PastMatchViewProps {
  match: MatchHistoryEntry;
  /** Mobile: render a "back" button to return to the list. */
  onBackToList?: () => void;
}

export function PastMatchView({ match, onBackToList }: PastMatchViewProps) {
  return (
    <div className="w-full animate-fade-up space-y-12 sm:space-y-16">
      {/* Status eyebrow */}
      <div
        className="font-display italic text-[11px] tracking-[0.12em] uppercase inline-flex items-center gap-2"
        style={{
          fontWeight: 400,
          color:
            match.status === "asked_out"
              ? "var(--color-success)"
              : "var(--color-flame)",
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background:
              match.status === "asked_out"
                ? "var(--color-success)"
                : "var(--color-flame)",
          }}
        />
        {match.status === "asked_out" ? "archived · asked out" : "in progress"}
      </div>

      {/* Original analysis (read-only). The component itself only renders
          static content; the onContinue prop is a no-op here. */}
      <ProfileAnalysis
        analysis={match.analysis}
        onContinue={() => {}}
        readOnly
      />

      {/* Conversation transcript */}
      {match.conversation.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-flame text-[13px]"
              style={{ fontWeight: 400 }}
            >
              the thread
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-flame/40 to-transparent" />
            <span
              className="font-display italic text-[11.5px] text-text-muted"
              style={{ fontWeight: 300 }}
            >
              {match.conversation.length}{" "}
              {match.conversation.length === 1 ? "message" : "messages"}
            </span>
          </div>
          <div
            className="rounded-3xl p-4 sm:p-5 space-y-1.5"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0.005))",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {match.conversation.map((turn, i) => {
              const isMe = turn.role === "me";
              const prev = match.conversation[i - 1];
              const next = match.conversation[i + 1];
              const isFirstInRun = !prev || prev.role !== turn.role;
              const isLastInRun = !next || next.role !== turn.role;
              void isFirstInRun;
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
                    <div
                      className={cn(
                        "px-3.5 py-2.5 sm:px-4 sm:py-3",
                        isMe ? "text-white" : "text-text",
                      )}
                      style={{
                        background: isMe
                          ? "linear-gradient(135deg, #FE3C72, #FF6B6B 60%, #FF8552)"
                          : "rgba(255,255,255,0.07)",
                        boxShadow: isMe
                          ? "0 8px 20px -10px rgba(254,60,114,0.45)"
                          : "none",
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
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Final report (only when asked-out). Reuse DatePrep — the onReset
          is a no-op here since this is the archived view. */}
      {match.status === "asked_out" && (
        <DatePrep
          analysis={match.analysis}
          conversation={match.conversation}
          onReset={() => {}}
        />
      )}
    </div>
  );
}
