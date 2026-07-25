"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/brand/Mark";
import { ApiError, readsApi } from "@/lib/api";
import { refreshHints, useCredits } from "@/hooks/useCredits";
import type { DecodeResult } from "@/types";

/* ─────────────────────────────────────────────
   Track 4 — "Decode her reply". Paste one message she sent and get what she's
   really saying, her interest level, and the one move to make. Costs 1 hint.
   ───────────────────────────────────────────── */

const INTEREST_COLOR: Record<string, string> = {
  high: "var(--color-success)",
  medium: "var(--color-warning)",
  low: "var(--color-flame)",
  unclear: "var(--color-text-muted)",
};

export default function DecodePage() {
  const router = useRouter();
  const { hasCredits } = useCredits();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!text.trim() || loading) return;
    if (!hasCredits) {
      router.push("/pricing");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await readsApi.decode(text.trim());
      refreshHints();
      setResult(res);
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) {
        router.push("/pricing");
        return;
      }
      setError("Couldn't read that one — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-bg px-5 py-8 sm:py-12">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/app" className="inline-flex items-center gap-2">
            <Mark size={22} />
            <span className="font-black lowercase tracking-tight text-text text-[15px]">
              hintder
            </span>
          </Link>
          <Link
            href="/app"
            className="font-display italic text-[13px] text-text-muted hover:text-flame transition-colors"
            style={{ fontWeight: 300 }}
          >
            ← back
          </Link>
        </div>

        <h1
          className="font-display tracking-[-0.03em] leading-[1] text-[clamp(2rem,5vw,3rem)] mb-3"
          style={{ fontWeight: 400 }}
        >
          Decode her{" "}
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
            reply.
          </span>
        </h1>
        <p
          className="font-display italic text-[15px] text-text-secondary leading-[1.5] mb-6"
          style={{ fontWeight: 300 }}
        >
          Paste the message that&apos;s got you overthinking. Get what she actually means
          — and the one move to make.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. &ldquo;haha maybe, we&rsquo;ll see&rdquo;"
          rows={3}
          className="w-full rounded-2xl bg-white/[0.03] border border-white/10 focus:border-flame/50 outline-none px-4 py-3.5 font-display text-[15px] text-text placeholder:text-text-muted/60 transition-colors select-text resize-none"
        />

        {error && (
          <p className="mt-2 font-display italic text-[13px] text-danger" style={{ fontWeight: 300 }}>
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          className="mt-4 w-full py-3.5 rounded-xl font-display italic text-white text-[15px] transition-transform disabled:opacity-50 enabled:hover:scale-[1.01] enabled:active:scale-[0.99]"
          style={{ background: "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)", fontWeight: 400 }}
        >
          {loading ? "reading her…" : "decode it"}
        </button>

        {result && (
          <div className="mt-8 space-y-4 animate-fade-up">
            <Row label="what she means">{result.meaning}</Row>
            <div className="flex flex-wrap gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 border font-display italic text-[12.5px]"
                style={{
                  fontWeight: 400,
                  color: INTEREST_COLOR[result.interestLevel] ?? "var(--color-text)",
                  borderColor: "rgba(255,255,255,0.12)",
                }}
              >
                interest: {result.interestLevel}
              </span>
              <span
                className="inline-flex items-center rounded-full px-3 py-1.5 border border-white/10 font-display italic text-[12.5px] text-text-secondary"
                style={{ fontWeight: 300 }}
              >
                {result.mood}
              </span>
              {result.losingInterest && (
                <span
                  className="inline-flex items-center rounded-full px-3 py-1.5 font-display italic text-[12.5px] text-flame"
                  style={{ fontWeight: 400, background: "rgba(254,60,114,0.10)" }}
                >
                  cooling off — move now
                </span>
              )}
            </div>
            <Row label="your move" accent>
              {result.move}
            </Row>
            <Row label="don't">{result.avoid}</Row>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({
  label,
  children,
  accent,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: accent
          ? "linear-gradient(160deg, rgba(254,60,114,0.08), rgba(255,133,82,0.02))"
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${accent ? "rgba(254,60,114,0.25)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <div
        className="font-display italic text-[10.5px] tracking-[0.14em] uppercase text-text-muted/70 mb-1.5"
        style={{ fontWeight: 400 }}
      >
        {label}
      </div>
      <div className="font-display text-[15px] text-text leading-[1.5]" style={{ fontWeight: 400 }}>
        {children}
      </div>
    </div>
  );
}
