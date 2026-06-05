"use client";

import type { ConversationTurn, ProfileAnalysis } from "@/types";

/* ─────────────────────────────────────────────
   DatePrep — the closing screen.
   Shows when the user picks an urgent date invite.
   No more "pick a reply" loops. We summarise what
   they need for the date itself: what to talk
   about, what to skip, how to show up.
   ───────────────────────────────────────────── */

interface DatePrepProps {
  analysis: ProfileAnalysis;
  conversation: ConversationTurn[];
  onReset: () => void;
}

const ETIQUETTE = [
  {
    title: "Land 5 minutes early.",
    why: "Pick the seat she'll see when she walks in.",
  },
  {
    title: "Phone face-down.",
    why: "Eye contact more than your drink.",
  },
  {
    title: "Ask, don't pitch.",
    why: "Let her finish a sentence before you start one.",
  },
  {
    title: "Pay the first round without performance.",
    why: "No commentary, no card flash. Just close the tab.",
  },
  {
    title: "Walk her out — three blocks, no agenda.",
    why: "It's the part she'll remember.",
  },
];

export function DatePrep({ analysis, conversation, onReset }: DatePrepProps) {
  /* The last "me" turn in the conversation is the invite the user sent. */
  const lastSent = [...conversation].reverse().find((t) => t.role === "me");
  const cleanestHook = analysis.hooks[0];

  return (
    <div className="w-full animate-fade-up space-y-12 sm:space-y-16">
      {/* ── Closer headline ── */}
      <header className="space-y-4 max-w-3xl">
        <div
          className="font-display italic text-[11.5px] tracking-[0.16em] uppercase text-flame inline-flex items-center gap-2"
          style={{ fontWeight: 400 }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--color-flame)" }}
          />
          our work is done
        </div>
        <h1
          className="font-display tracking-[-0.025em] leading-[0.95] text-[clamp(2.5rem,7vw,4.5rem)]"
          style={{ fontWeight: 400, textWrap: "balance" }}
        >
          You sent it.{" "}
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
            now go win the day.
          </span>
        </h1>
        <p
          className="font-display italic text-[15px] sm:text-[16px] text-text-secondary leading-[1.55] max-w-xl"
          style={{ fontWeight: 300 }}
        >
          Below — your prep notes. Read them once, then forget us. The line
          you sent worked because it sounded like you. The line over coffee
          should too.
        </p>
      </header>

      {/* ── What you actually sent ── */}
      {lastSent && (
        <section className="space-y-3 max-w-3xl">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-flame text-[13px]"
              style={{ fontWeight: 400 }}
            >
              the ask you sent
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-flame/40 to-transparent" />
          </div>
          <blockquote
            className="font-display italic text-[clamp(1.125rem,3vw,1.4rem)] text-text leading-[1.4] border-l border-flame/40 pl-5"
            style={{ fontWeight: 300 }}
          >
            &ldquo;{lastSent.text}&rdquo;
          </blockquote>
        </section>
      )}

      {/* ── The vibe — how to show up ── */}
      {analysis.cosmicRead && (
        <section className="space-y-3 max-w-3xl">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-flame text-[13px]"
              style={{ fontWeight: 400 }}
            >
              the vibe
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-flame/40 to-transparent" />
          </div>
          <p
            className="font-display italic text-[15px] sm:text-[16px] text-text-secondary leading-[1.6]"
            style={{ fontWeight: 300 }}
          >
            {analysis.cosmicRead}
          </p>
        </section>
      )}

      {/* ── What lands — green-light topics ── */}
      {analysis.greenLightTopics && analysis.greenLightTopics.length > 0 && (
        <section className="space-y-4 max-w-3xl">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-success/90 text-[13px]"
              style={{ fontWeight: 400 }}
            >
              what lands
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-success/30 to-transparent" />
          </div>
          <ul className="space-y-2.5">
            {analysis.greenLightTopics.map((topic, i) => (
              <li
                key={i}
                className="font-display italic text-[14.5px] sm:text-[15px] text-text-secondary leading-[1.55] flex items-baseline gap-3"
                style={{ fontWeight: 300 }}
              >
                <span className="text-success/60 shrink-0">+</span>
                <span>{topic}</span>
              </li>
            ))}
          </ul>
          {cleanestHook && (
            <p
              className="font-display italic text-[13.5px] text-text-muted leading-[1.55] pl-6 pt-1"
              style={{ fontWeight: 300 }}
            >
              If there&apos;s a lull — bring up {cleanestHook.topic.toLowerCase()}.
              {" "}It&apos;s already in the room from her bio.
            </p>
          )}
        </section>
      )}

      {/* ── What kills it — avoid list ── */}
      {analysis.avoid.length > 0 && (
        <section className="space-y-4 max-w-3xl">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display italic text-danger/80 text-[13px]"
              style={{ fontWeight: 400 }}
            >
              what kills it
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-danger/30 to-transparent" />
          </div>
          <ul className="space-y-2.5">
            {analysis.avoid.map((item, i) => (
              <li
                key={i}
                className="font-display italic text-[14.5px] sm:text-[15px] text-text-muted leading-[1.5] flex items-baseline gap-3"
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

      {/* ── How to show up — etiquette ── */}
      <section className="space-y-4 max-w-3xl">
        <div className="flex items-baseline gap-3">
          <span
            className="font-display italic text-flame text-[13px]"
            style={{ fontWeight: 400 }}
          >
            how to show up
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-flame/40 to-transparent" />
        </div>
        <ul className="space-y-4">
          {ETIQUETTE.map((rule, i) => (
            <li
              key={i}
              className="grid grid-cols-[32px_1fr] gap-3 items-baseline"
            >
              <span
                className="font-display italic text-flame text-[13px] tabular-nums"
                style={{ fontWeight: 300 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div
                  className="font-display text-[15.5px] sm:text-[16.5px] text-text leading-[1.3]"
                  style={{ fontWeight: 400 }}
                >
                  {rule.title}
                </div>
                <div
                  className="font-display italic text-[13.5px] text-text-muted leading-[1.55] mt-1"
                  style={{ fontWeight: 300 }}
                >
                  {rule.why}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Send-off ── */}
      <section className="space-y-5 pt-4 max-w-3xl">
        <p
          className="font-display tracking-[-0.02em] leading-[1.1] text-[clamp(1.75rem,5vw,2.75rem)]"
          style={{ fontWeight: 400, textWrap: "balance" }}
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
            Good luck out there.
          </span>
        </p>
        <p
          className="font-display italic text-[14.5px] sm:text-[15px] text-text-secondary leading-[1.6] max-w-xl"
          style={{ fontWeight: 300 }}
        >
          {analysis.name} sounds like someone worth showing up for. Be five
          minutes early, finish the night before midnight, and walk her
          home if she lets you. Tell us how it went.
        </p>
      </section>

    </div>
  );
}
