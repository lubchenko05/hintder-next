"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToolLinks } from "@/components/app/ToolLinks";
import { UploadZone } from "@/components/app/UploadZone";
import { filesToDataUrls } from "@/lib/ai";
import { ApiError, readsApi } from "@/lib/api";
import { copyToClipboard } from "@/lib/utils";
import { refreshHints, useCredits } from "@/hooks/useCredits";
import type { DecodeResult } from "@/types";

/* ─────────────────────────────────────────────
   Track 4 — "Decode her reply". Paste one message she sent and get what she's
   really saying, her interest level, and the one move to make. Costs 1 hint.
   ───────────────────────────────────────────── */

/* Where each level sits on the warmth bar, so the word has a position and
   not just a colour. */
const INTEREST_POS: Record<string, number> = {
  high: 88,
  medium: 55,
  low: 20,
  unclear: 48,
};

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
  const [shots, setShots] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  /* Landing hands the message over as /decode?m=… so the line he tapped on the
     home page is already in the box — he shouldn't have to retype it. Read once
     at mount, straight off the URL, then clean it out of the address bar. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = new URLSearchParams(window.location.search).get("m");
    if (!m) return;
    setText(m);
    window.history.replaceState(null, "", "/decode");
  }, []);

  const submit = async () => {
    if ((!text.trim() && shots.length === 0) || loading) return;
    if (!hasCredits) {
      router.push("/pricing");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await readsApi.decode(text.trim(), shots);
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
    <>
      {!result && (
        /* Same rhythm as the other two tools: headline, labelled fields,
           a drop zone that eats the leftover height, one CTA. */
        <div className="w-full flex-1 min-h-0 flex flex-col space-y-3 animate-fade-up">
        <div>
          <h1
            className="font-display tracking-[-0.03em] leading-[1] text-[clamp(1.6rem,4vw,2.25rem)] mb-2"
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
            className="font-display italic text-[15px] text-text-secondary leading-[1.5]"
            style={{ fontWeight: 300 }}
          >
            Paste the message that&apos;s got you overthinking. Get what she actually means
            — and the one move to make.{" "}
            <span className="text-text-muted/70">Uses 1 hint.</span>
          </p>
        </div>

        <div>
          <span
            className="block font-display italic text-[10.5px] tracking-[0.14em] uppercase text-text-muted/70 mb-2"
            style={{ fontWeight: 400 }}
          >
            paste her message
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. &ldquo;haha maybe, we&rsquo;ll see&rdquo;"
            rows={2}
            className="w-full rounded-2xl bg-white/[0.03] border border-white/10 focus:border-flame/50 outline-none px-4 py-3 font-display text-[14px] text-text placeholder:text-text-muted/60 transition-colors select-text resize-none"
          />
        </div>

        {(
          <div className="flex-1 min-h-0 flex flex-col">
            <span
              className="block font-display italic text-[10.5px] tracking-[0.14em] uppercase text-text-muted/70 mb-2"
              style={{ fontWeight: 400 }}
            >
              …or drop a screenshot of the chat
            </span>
            <UploadZone
              onFilesSelected={async (files) => setShots(await filesToDataUrls(files))}
              onFilesChange={async (files) =>
                setShots(files.length ? await filesToDataUrls(files) : [])
              }
              isAnalyzing={false}
              hideHeadline
              compact
              hideSubmit
            />
            {shots.length > 0 && (
              <p
                className="mt-2 font-display italic text-[12.5px] text-success"
                style={{ fontWeight: 300 }}
              >
                {shots.length} screenshot{shots.length > 1 ? "s" : ""} attached
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="font-display italic text-[13px] text-danger" style={{ fontWeight: 300 }}>
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={loading || (!text.trim() && shots.length === 0)}
          className="w-full py-3.5 rounded-full font-display italic text-white text-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-[1.01] enabled:active:scale-[0.99]"
          style={{ background: "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)", fontWeight: 400 }}
        >
          {loading
            ? "reading her…"
            : !text.trim() && shots.length === 0
              ? "paste her message first"
              : "decode it"}
        </button>
          <ToolLinks current="decode" />
        </div>
      )}
      {result && (
        /* The answer replaces the form — the question stays only as context,
           so you can see what this read was about without re-reading a field
           you already filled in. */
        <div className="w-full flex-1 min-h-0 flex flex-col space-y-4 animate-fade-up">
          <div>
            <span
              className="block font-display italic text-[10.5px] tracking-[0.14em] uppercase text-text-muted/70 mb-2"
              style={{ fontWeight: 400 }}
            >
              she said
            </span>
            <div className="flex items-start gap-3 flex-wrap">
              {text.trim() && (
                <div
                  className="max-w-[70%] px-4 py-3 rounded-[20px] rounded-bl-md"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p
                    className="font-display text-[15px] text-white/90 leading-[1.35]"
                    style={{ fontWeight: 400 }}
                  >
                    {text.trim()}
                  </p>
                </div>
              )}
              {shots.map((s, i) => (
                <img
                  key={i}
                  src={s}
                  alt={`Chat screenshot ${i + 1}`}
                  className="h-[70px] w-[52px] object-cover rounded-lg border border-white/10"
                />
              ))}
            </div>
          </div>

          {/* How warm she still is — a word alone doesn't say how far from
              the other end of the scale it sits. */}
          <div>
            <span
              className="block font-display italic text-[10.5px] tracking-[0.14em] uppercase text-text-muted/70 mb-2"
              style={{ fontWeight: 400 }}
            >
              temperature
            </span>
            <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${INTEREST_POS[result.interestLevel] ?? 50}%`,
                  background: "linear-gradient(95deg, #FE3C72, #FF8552)",
                  transition: "width 0.8s cubic-bezier(0.2,0.7,0.3,1)",
                }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between font-display italic text-[11px] text-text-muted/60">
              <span>gone cold</span>
              <span
                style={{ color: INTEREST_COLOR[result.interestLevel] ?? "var(--color-text)" }}
              >
                {result.interestLevel} · {result.mood}
              </span>
              <span>all in</span>
            </div>
            {result.losingInterest && (
              <div
                className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-display italic text-[12.5px] text-flame"
                style={{ fontWeight: 400, background: "rgba(254,60,114,0.10)" }}
              >
                cooling off — move now
              </div>
            )}
          </div>

          <Row label="what she means">{result.meaning}</Row>
          <Row label="your move" accent>
            {result.move}
          </Row>

          {/* The lines themselves — advice is the setup, this is the payload. */}
          {result.replies?.length > 0 && (
            <div>
              <span
                className="block font-display italic text-[10.5px] tracking-[0.14em] uppercase text-text-muted/70 mb-2"
                style={{ fontWeight: 400 }}
              >
                send one of these
              </span>
              <div className="space-y-2">
                {result.replies.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-4 flex items-start justify-between gap-3"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p
                      className="font-display text-[15px] text-text leading-[1.5]"
                      style={{ fontWeight: 400 }}
                    >
                      {r}
                    </p>
                    <button
                      onClick={async () => {
                        await copyToClipboard(r);
                        setCopied(i);
                        setTimeout(() => setCopied(null), 1600);
                      }}
                      className="shrink-0 font-display italic text-[14px] text-text-muted hover:text-flame transition-colors"
                      style={{ fontWeight: 300 }}
                    >
                      {copied === i ? "copied" : "copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.timing && (
            <div className="flex items-baseline gap-3">
              <span
                className="font-display italic text-[10.5px] tracking-[0.14em] uppercase text-text-muted/70 shrink-0"
                style={{ fontWeight: 400 }}
              >
                when
              </span>
              <span
                className="font-display italic text-[14.5px] text-text-secondary leading-[1.45]"
                style={{ fontWeight: 300 }}
              >
                {result.timing}
              </span>
            </div>
          )}

          {/* Deliberately not the same card as the rest: this one is the thing
              that costs you the match, and it should not read as more prose. */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,59,74,0.05)",
              border: "1px solid rgba(255,59,74,0.28)",
              borderLeft: "3px solid var(--color-danger)",
            }}
          >
            <div
              className="font-display italic text-[10.5px] tracking-[0.14em] uppercase mb-1.5"
              style={{ fontWeight: 400, color: "var(--color-danger)" }}
            >
              whatever you do, don't
            </div>
            <div
              className="font-display text-[15px] text-text leading-[1.5]"
              style={{ fontWeight: 400 }}
            >
              {result.avoid}
            </div>
          </div>

          {/* Padding, not margin: the parent's space-y wins over any mt-* here,
              and the answer was running straight into the buttons. */}
          <div className="pt-6">
            <button
              onClick={() => {
                setResult(null);
                setError(null);
                setText("");
                setShots([]);
              }}
              className="w-full py-3 rounded-full font-display italic text-[13.5px] text-text-secondary border border-white/10 hover:border-flame/40 hover:text-text transition-all"
              style={{ fontWeight: 300 }}
            >
              decode another
            </button>

            <ToolLinks current="decode" />
          </div>
        </div>
      )}
    </>
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
