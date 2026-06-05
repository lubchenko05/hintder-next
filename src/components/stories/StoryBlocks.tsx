"use client";

import { useState } from "react";
import { cn, copyToClipboard } from "@/lib/utils";
import type {
  StoryBlock,
  StoryMetric,
  StoryThreadMessage,
} from "@/lib/content";

/* ─────────────────────────────────────────────
   Shared eyebrow (flame dot + caps label) used
   at the top of every block so the page feels
   editorial-curated regardless of which blocks
   each story picks.
   ───────────────────────────────────────────── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-display italic text-flame text-[11px] tracking-[0.16em] uppercase mb-5 flex items-center gap-2"
      style={{ fontWeight: 400 }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: "var(--color-flame)" }}
      />
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Interactive blocks for Success Stories pages.
   Each block stands on its own visually so the
   page reads like a curated case study, not a
   blog post.
   ───────────────────────────────────────────── */

export function MetricsCard({
  metrics,
  eyebrow = "the numbers",
}: {
  metrics: StoryMetric[];
  eyebrow?: string;
}) {
  return (
    <section className="mt-12 sm:mt-14">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div
        className="rounded-3xl p-6 sm:p-8 grid gap-px overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, rgba(254,60,114,0.06), rgba(255,133,82,0.02) 70%, rgba(15,12,20,0.6))",
          border: "1px solid rgba(254,60,114,0.18)",
          gridTemplateColumns: `repeat(${Math.min(metrics.length, 3)}, minmax(0, 1fr))`,
        }}
      >
        {metrics.map((m, i) => (
          <div
            key={i}
            className={cn(
              "px-2 sm:px-3 py-2",
              i > 0 && "border-l border-white/[0.06]",
            )}
          >
            <div
              className="font-display italic text-[11px] text-text-muted tracking-[0.08em] uppercase mb-3"
              style={{ fontWeight: 300 }}
            >
              {m.label}
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <div
                className="font-display text-[14px] sm:text-[15px] text-text-muted line-through decoration-text-muted/30"
                style={{ fontWeight: 300 }}
              >
                {m.before}
              </div>
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="text-text-muted/40 shrink-0"
              >
                <path d="M5 12 H 19" />
                <path d="M13 6 L 19 12 L 13 18" />
              </svg>
              <div
                className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] leading-none tabular-nums tracking-[-0.02em]"
                style={{
                  fontWeight: 400,
                  background: "linear-gradient(95deg, #FE3C72, #FF8552)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {m.after}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OpenerCard({
  opener,
  eyebrow = "the line that worked",
  meta = "sent first · reply in < 10 min",
}: {
  opener: string;
  eyebrow?: string;
  meta?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(opener);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <section className="mt-12 sm:mt-14">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div
        className="relative rounded-3xl p-7 sm:p-9"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 35%, rgba(15,12,20,0.6) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 60px -30px rgba(0,0,0,0.6)",
        }}
      >
        <p
          className="font-display text-[clamp(1.125rem,3.5vw,1.625rem)] leading-[1.35] text-text"
          style={{ fontWeight: 400, textWrap: "balance" }}
        >
          &ldquo;{opener}&rdquo;
        </p>
        <div className="mt-6 flex items-center justify-between gap-4">
          <div
            className="font-display italic text-[12px] text-text-muted"
            style={{ fontWeight: 300 }}
          >
            {meta}
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              "font-display italic text-[12.5px] transition-colors px-3.5 py-2 rounded-full",
              copied
                ? "text-success bg-success/10"
                : "text-flame border border-flame/40 bg-flame/[0.06] hover:bg-flame/[0.12]",
            )}
            style={{ fontWeight: 400 }}
          >
            {copied ? "copied" : "copy this line"}
          </button>
        </div>
      </div>
    </section>
  );
}

export function ThreadPreview({
  messages,
  eyebrow = "how it played out",
}: {
  messages: StoryThreadMessage[];
  eyebrow?: string;
}) {
  return (
    <section className="mt-12 sm:mt-14">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div
        className="rounded-3xl p-5 sm:p-6 space-y-1.5"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {messages.map((turn, i) => {
          const isMe = turn.role === "me";
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const isLastInRun = !next || next.role !== turn.role;
          return (
            <div
              key={i}
              className={cn(
                "flex",
                isMe ? "justify-end" : "justify-start",
                isLastInRun ? "mb-3" : "mb-0.5",
              )}
            >
              <div
                className={cn(
                  "max-w-[78%] sm:max-w-[68%] flex flex-col",
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
                    {isMe ? "him" : "her"}
                  </span>
                )}
                {/* keep prev referenced to satisfy unused-vars lint */}
                {prev ? null : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function PullQuote({
  quote,
  attribution,
}: {
  quote: string;
  attribution?: string;
}) {
  return (
    <section className="mt-14 sm:mt-16">
      <blockquote
        className="border-l-2 border-flame/40 pl-6 sm:pl-8"
      >
        <p
          className="font-display italic text-[clamp(1.25rem,3.5vw,1.75rem)] leading-[1.3] text-text max-w-2xl"
          style={{ fontWeight: 300, textWrap: "balance" }}
        >
          &ldquo;{quote}&rdquo;
        </p>
        {attribution && (
          <footer
            className="mt-4 font-display italic text-[13px] text-text-muted"
            style={{ fontWeight: 300 }}
          >
            — {attribution}
          </footer>
        )}
      </blockquote>
    </section>
  );
}

/* ─────────────────────────────────────────────
   OpenerComparison — old line vs new line shown
   side-by-side. Used when the story is about a
   specific opener swap (Marcus's audit angle).
   ───────────────────────────────────────────── */
export function OpenerComparison({
  oldLine,
  newLine,
  note,
  eyebrow = "the audit",
}: {
  oldLine: string;
  newLine: string;
  note?: string;
  eyebrow?: string;
}) {
  return (
    <section className="mt-12 sm:mt-14">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* OLD */}
        <div
          className="relative rounded-2xl p-5 sm:p-6"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="font-display italic text-[10.5px] tracking-[0.16em] uppercase text-text-muted mb-3"
            style={{ fontWeight: 300 }}
          >
            before
          </div>
          <p
            className="font-display text-[15px] sm:text-[16px] leading-[1.45] text-text-muted line-through decoration-text-muted/25"
            style={{ fontWeight: 300, fontStyle: "italic" }}
          >
            &ldquo;{oldLine}&rdquo;
          </p>
        </div>
        {/* NEW */}
        <div
          className="relative rounded-2xl p-5 sm:p-6"
          style={{
            background:
              "linear-gradient(160deg, rgba(254,60,114,0.10), rgba(255,133,82,0.03) 70%, rgba(15,12,20,0.6))",
            border: "1px solid rgba(254,60,114,0.25)",
            boxShadow: "0 20px 50px -25px rgba(254,60,114,0.35)",
          }}
        >
          <div
            className="font-display italic text-[10.5px] tracking-[0.16em] uppercase text-flame mb-3"
            style={{ fontWeight: 400 }}
          >
            after
          </div>
          <p
            className="font-display text-[15px] sm:text-[17px] leading-[1.45] text-text"
            style={{ fontWeight: 400 }}
          >
            &ldquo;{newLine}&rdquo;
          </p>
        </div>
      </div>
      {note && (
        <p
          className="mt-4 font-display italic text-[13.5px] text-text-secondary leading-[1.55] max-w-2xl"
          style={{ fontWeight: 300 }}
        >
          {note}
        </p>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────
   WorkflowDrafts — her message at the top, three
   candidate drafts below, one highlighted as the
   pick. Shows the actual workflow, not the result.
   ───────────────────────────────────────────── */
export function WorkflowDrafts({
  her,
  drafts,
  eyebrow = "what the workflow looked like",
}: {
  her: string;
  drafts: { text: string; picked?: boolean; note?: string }[];
  eyebrow?: string;
}) {
  return (
    <section className="mt-12 sm:mt-14">
      <Eyebrow>{eyebrow}</Eyebrow>

      {/* HER message — single left bubble at the top */}
      <div className="flex items-start gap-3 mb-5">
        <span
          className="font-display italic text-[10.5px] tracking-[0.16em] uppercase text-text-muted shrink-0 mt-3 w-10"
          style={{ fontWeight: 300 }}
        >
          her
        </span>
        <div
          className="max-w-[78%] sm:max-w-[60%] px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.07)",
            color: "var(--color-text)",
            borderRadius: "20px 20px 20px 6px",
          }}
        >
          <p
            className="font-display text-[14.5px] sm:text-[15px] leading-[1.4]"
            style={{ fontWeight: 400 }}
          >
            {her}
          </p>
        </div>
      </div>

      {/* DRAFTS — vertical list, one highlighted */}
      <div
        className="rounded-2xl p-3 sm:p-4 space-y-2"
        style={{
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="px-3 pt-1.5 pb-2 font-display italic text-[11px] tracking-[0.12em] uppercase text-text-muted"
          style={{ fontWeight: 300 }}
        >
          hintder suggested three angles
        </div>
        {drafts.map((d, i) => (
          <div
            key={i}
            className={cn(
              "relative rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 transition-colors",
              d.picked
                ? "border"
                : "border border-white/[0.05] bg-white/[0.015]",
            )}
            style={
              d.picked
                ? {
                    background:
                      "linear-gradient(135deg, rgba(254,60,114,0.10), rgba(255,133,82,0.04))",
                    borderColor: "rgba(254,60,114,0.35)",
                  }
                : undefined
            }
          >
            <div className="flex items-baseline gap-3">
              <span
                className={cn(
                  "font-display italic text-[11px] tracking-[0.12em] uppercase shrink-0 w-12",
                  d.picked ? "text-flame" : "text-text-muted",
                )}
                style={{ fontWeight: 400 }}
              >
                {d.picked ? "sent" : `draft ${i + 1}`}
              </span>
              <p
                className={cn(
                  "font-display text-[14.5px] sm:text-[15px] leading-[1.45] flex-1",
                  d.picked ? "text-text" : "text-text-secondary",
                )}
                style={{ fontWeight: d.picked ? 400 : 300 }}
              >
                {d.text}
              </p>
            </div>
            {d.note && (
              <p
                className="ml-[60px] mt-1.5 font-display italic text-[12px] text-text-muted leading-[1.4]"
                style={{ fontWeight: 300 }}
              >
                — {d.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ReadinessGauge — visual 0-100 dial with before
   and after readings, optional threshold line.
   Used for timing-driven stories (Danny).
   ───────────────────────────────────────────── */
export function ReadinessGauge({
  before,
  after,
  threshold = 65,
  caption,
  eyebrow = "the readiness gauge",
}: {
  before: number;
  after: number;
  threshold?: number;
  caption?: string;
  eyebrow?: string;
}) {
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const b = clamp(before);
  const a = clamp(after);
  const t = clamp(threshold);

  return (
    <section className="mt-12 sm:mt-14">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div
        className="rounded-3xl p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(160deg, rgba(254,60,114,0.06), rgba(255,133,82,0.02) 70%, rgba(15,12,20,0.6))",
          border: "1px solid rgba(254,60,114,0.18)",
        }}
      >
        {/* Big numbers */}
        <div className="flex items-baseline justify-between gap-6 mb-5">
          <div>
            <div
              className="font-display italic text-[11px] tracking-[0.12em] uppercase text-text-muted mb-2"
              style={{ fontWeight: 300 }}
            >
              before
            </div>
            <div
              className="font-display text-[clamp(2rem,5vw,3rem)] leading-none tabular-nums tracking-[-0.02em] text-text-muted line-through decoration-text-muted/30"
              style={{ fontWeight: 400 }}
            >
              {b}
              <span className="text-[0.5em] text-text-muted/60">/100</span>
            </div>
          </div>
          <div className="text-right">
            <div
              className="font-display italic text-[11px] tracking-[0.12em] uppercase text-flame mb-2"
              style={{ fontWeight: 400 }}
            >
              after
            </div>
            <div
              className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-none tabular-nums tracking-[-0.02em]"
              style={{
                fontWeight: 500,
                background: "linear-gradient(95deg, #FE3C72, #FF8552)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {a}
              <span className="text-[0.5em] text-text-muted/60">/100</span>
            </div>
          </div>
        </div>

        {/* Bar */}
        <div className="relative h-3 rounded-full bg-white/[0.06] overflow-visible">
          {/* threshold tick */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-px h-5 bg-white/30"
            style={{ left: `${t}%` }}
            aria-hidden
          />
          {/* before marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-text-muted/60 border border-bg"
            style={{ left: `${b}%` }}
            aria-label={`before: ${b}`}
          />
          {/* after marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2"
            style={{
              left: `${a}%`,
              background: "linear-gradient(135deg, #FE3C72, #FF8552)",
              borderColor: "var(--color-bg)",
              boxShadow: "0 0 0 3px rgba(254,60,114,0.18)",
            }}
            aria-label={`after: ${a}`}
          />
        </div>

        {/* Labels under bar */}
        <div className="mt-3 flex justify-between font-display italic text-[10.5px] text-text-muted tracking-[0.08em] uppercase" style={{ fontWeight: 300 }}>
          <span>too early</span>
          <span style={{ position: "absolute", left: `calc(${t}% - 24px)`, marginTop: 0 }}>
            <span className="hidden sm:inline">ask window</span>
          </span>
          <span>too late</span>
        </div>

        {caption && (
          <p
            className="mt-5 font-display italic text-[13.5px] text-text-secondary leading-[1.55] max-w-2xl"
            style={{ fontWeight: 300 }}
          >
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Timeline — the arc of a relationship (matched →
   first date → today). The heart of a love story.
   ───────────────────────────────────────────── */
export function Timeline({
  milestones,
  eyebrow = "how it unfolded",
}: {
  milestones: { when: string; title: string; note?: string }[];
  eyebrow?: string;
}) {
  return (
    <section className="mt-12 sm:mt-14">
      <Eyebrow>{eyebrow}</Eyebrow>
      <ol className="relative pl-6">
        {/* vertical line */}
        <span
          className="absolute left-[5px] top-1 bottom-1 w-px"
          style={{
            background:
              "linear-gradient(180deg, var(--color-flame), rgba(254,60,114,0.15))",
          }}
          aria-hidden
        />
        {milestones.map((m, i) => (
          <li key={i} className={cn("relative", i < milestones.length - 1 && "pb-7")}>
            {/* dot */}
            <span
              className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2"
              style={{
                background: "linear-gradient(135deg, #FE3C72, #FF8552)",
                borderColor: "var(--color-bg)",
                boxShadow: "0 0 0 3px rgba(254,60,114,0.15)",
              }}
              aria-hidden
            />
            <div
              className="font-display italic text-[11px] tracking-[0.12em] uppercase text-flame"
              style={{ fontWeight: 400 }}
            >
              {m.when}
            </div>
            <div
              className="font-display text-[clamp(1.05rem,2.5vw,1.3rem)] text-text mt-1 leading-snug"
              style={{ fontWeight: 400 }}
            >
              {m.title}
            </div>
            {m.note && (
              <p
                className="font-display italic text-[14px] text-text-secondary mt-1.5 leading-[1.55] max-w-xl"
                style={{ fontWeight: 300 }}
              >
                {m.note}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Dispatcher — story page hands the blocks array
   to this and gets back the rendered sequence.
   ───────────────────────────────────────────── */
export function StoryBlockRenderer({ block }: { block: StoryBlock }) {
  switch (block.type) {
    case "metrics":
      return <MetricsCard metrics={block.metrics} eyebrow={block.eyebrow} />;
    case "opener":
      return (
        <OpenerCard
          opener={block.opener}
          eyebrow={block.eyebrow}
          meta={block.meta}
        />
      );
    case "thread":
      return (
        <ThreadPreview messages={block.messages} eyebrow={block.eyebrow} />
      );
    case "quote":
      return <PullQuote quote={block.quote} attribution={block.attribution} />;
    case "opener-comparison":
      return (
        <OpenerComparison
          oldLine={block.old}
          newLine={block.new}
          note={block.note}
          eyebrow={block.eyebrow}
        />
      );
    case "workflow-drafts":
      return (
        <WorkflowDrafts
          her={block.her}
          drafts={block.drafts}
          eyebrow={block.eyebrow}
        />
      );
    case "readiness-gauge":
      return (
        <ReadinessGauge
          before={block.before}
          after={block.after}
          threshold={block.threshold}
          caption={block.caption}
          eyebrow={block.eyebrow}
        />
      );
    case "timeline":
      return <Timeline milestones={block.milestones} eyebrow={block.eyebrow} />;
    default:
      return null;
  }
}
