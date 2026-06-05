"use client";

import { MessageCard } from "./MessageCard";
import { cn } from "@/lib/utils";
import type { GeneratedMessage } from "@/types";

/* ─────────────────────────────────────────────
   MessageList — editorial readable list.
   No emoji. Best pick highlighted, others numbered.
   Bottom CTAs: regenerate full batch + "she replied"
   for going into the reply flow.
   ───────────────────────────────────────────── */

interface MessageListProps {
  messages: GeneratedMessage[];
  onTweak: (message: GeneratedMessage, instruction: string) => void;
  onRegenerate: () => void;
  onFollowUp: () => void;
  onPickOpener: (message: GeneratedMessage) => void;
  isRegenerating: boolean;
}

export function MessageList({
  messages,
  onTweak,
  onRegenerate,
  onFollowUp,
  onPickOpener,
  isRegenerating,
}: MessageListProps) {
  const bestMessage = messages.find((m) => m.category === "best");
  const otherMessages = messages.filter((m) => m.category !== "best");
  const ordered = bestMessage ? [bestMessage, ...otherMessages] : messages;

  return (
    <div className="w-full animate-fade-up space-y-8 sm:space-y-10">
      {/* Header */}
      <header>
        <h1
          className="font-display tracking-[-0.025em] leading-[1.05] text-[clamp(1.75rem,5.5vw,2.5rem)]"
          style={{ fontWeight: 400, textWrap: "balance" }}
        >
          {messages.length} openers,{" "}
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
            ready to send.
          </span>
        </h1>
        <p
          className="mt-2 font-display italic text-[13px] text-text-muted"
          style={{ fontWeight: 300 }}
        >
          pick the one you&apos;d send — we&apos;ll track her reply.
        </p>
      </header>

      {/* The list */}
      <div className="space-y-3">
        {ordered.map((msg, i) => (
          <MessageCard
            key={msg.id}
            message={msg}
            index={i}
            isBest={i === 0 && bestMessage !== undefined}
            onTweak={onTweak}
            onPick={onPickOpener}
            pickLabel="copy & track reply"
          />
        ))}
      </div>

      {/* Bottom actions */}
      <div className="pt-4 border-t border-white/[0.06] space-y-2">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-display italic text-[14px] transition-all",
            "border border-white/15 text-text-secondary hover:text-text hover:border-white/30",
            isRegenerating && "opacity-60 cursor-wait",
          )}
          style={{ fontWeight: 300 }}
        >
          {isRegenerating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              regenerating…
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              try 5 more
            </>
          )}
        </button>

        <button
          onClick={onFollowUp}
          className="flex-1 group relative py-3.5 rounded-full font-display italic text-text border border-flame/40 text-[14px] sm:text-[15px] transition-all hover:bg-flame/[0.06] hover:border-flame/60 active:scale-[0.99]"
          style={{ fontWeight: 400 }}
        >
          <span className="inline-flex items-center gap-2.5">
            sent something else — track it
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
      </div>
      <p
        className="text-center font-display italic text-[11.5px] text-text-muted/70"
        style={{ fontWeight: 300 }}
      >
        new batch uses 1 hint · tracking is free
      </p>
      </div>
    </div>
  );
}
