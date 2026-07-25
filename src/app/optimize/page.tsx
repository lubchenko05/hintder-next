"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/brand/Mark";
import { UploadZone } from "@/components/app/UploadZone";
import { filesToDataUrls } from "@/lib/ai";
import { ApiError, readsApi } from "@/lib/api";
import { copyToClipboard } from "@/lib/utils";
import { refreshHints, useCredits } from "@/hooks/useCredits";
import type { ProfileOptimizeResult } from "@/types";

/* ─────────────────────────────────────────────
   Track 4 — "Rate my profile". Upload YOUR OWN dating profile and get a brutally
   honest score, bio rewrites, and per-photo feedback. Costs 1 hint.
   ───────────────────────────────────────────── */

const VERDICT_COLOR: Record<string, string> = {
  lead: "var(--color-success)",
  keep: "var(--color-text-secondary)",
  move: "var(--color-warning)",
  cut: "var(--color-flame)",
};

export default function OptimizePage() {
  const router = useRouter();
  const { hasCredits } = useCredits();
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProfileOptimizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const run = async (files: File[]) => {
    if (!files.length || loading) return;
    if (!hasCredits) {
      router.push("/pricing");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const images = await filesToDataUrls(files);
      const res = await readsApi.optimize(images, bio.trim() || null);
      refreshHints();
      setResult(res);
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) {
        router.push("/pricing");
        return;
      }
      setError("Couldn't review that — try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyBio = async (text: string, i: number) => {
    await copyToClipboard(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <main className="min-h-dvh bg-bg px-5 py-8 sm:py-12">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/app" className="inline-flex items-center gap-2">
            <Mark size={22} />
            <span className="font-black lowercase tracking-tight text-text text-[15px]">hintder</span>
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
          Rate my{" "}
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
            profile.
          </span>
        </h1>
        <p
          className="font-display italic text-[15px] text-text-secondary leading-[1.5] mb-6"
          style={{ fontWeight: 300 }}
        >
          Upload YOUR profile screenshots. Get an honest score, stronger bios, and which
          photos to lead with or cut.
        </p>

        {!result && (
          <>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="your current bio (optional)"
              rows={2}
              className="w-full mb-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-flame/50 outline-none px-4 py-3 font-display text-[14px] text-text placeholder:text-text-muted/60 transition-colors select-text resize-none"
            />
            <UploadZone onFilesSelected={run} isAnalyzing={loading} />
            {error && (
              <p className="mt-3 font-display italic text-[13px] text-danger" style={{ fontWeight: 300 }}>
                {error}
              </p>
            )}
          </>
        )}

        {result && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-end gap-4">
              <div
                className="font-display tabular-nums leading-none text-[64px]"
                style={{
                  fontWeight: 400,
                  background: "linear-gradient(95deg, #FE3C72, #FF8552)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {result.score}
              </div>
              <div
                className="font-display italic text-[14px] text-text-secondary leading-[1.4] pb-2"
                style={{ fontWeight: 300 }}
              >
                {result.firstImpression}
              </div>
            </div>

            <div>
              <SectionLabel>bio rewrites</SectionLabel>
              <div className="space-y-2.5">
                {result.bioRewrites.map((b, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-4 flex items-start justify-between gap-3"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="font-display text-[14.5px] text-text leading-[1.5]" style={{ fontWeight: 400 }}>
                      {b}
                    </p>
                    <button
                      onClick={() => copyBio(b, i)}
                      className="shrink-0 font-display italic text-[12px] text-text-muted hover:text-flame transition-colors"
                      style={{ fontWeight: 300 }}
                    >
                      {copied === i ? "copied" : "copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>your photos</SectionLabel>
              <div className="space-y-2">
                {result.photoFeedback.map((p) => (
                  <div
                    key={p.slot}
                    className="rounded-xl px-4 py-3 flex items-baseline gap-3"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span
                      className="font-display italic text-[12px] uppercase tracking-wide shrink-0"
                      style={{ fontWeight: 400, color: VERDICT_COLOR[p.verdict] ?? "var(--color-text)" }}
                    >
                      {p.verdict}
                    </span>
                    <span
                      className="font-display italic text-[13.5px] text-text-secondary leading-[1.45]"
                      style={{ fontWeight: 300 }}
                    >
                      photo {p.slot + 1} — {p.note}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>top fixes</SectionLabel>
              <ol className="space-y-1.5">
                {result.topFixes.map((f, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-display italic text-flame text-[13px] tabular-nums" style={{ fontWeight: 400 }}>
                      {i + 1}
                    </span>
                    <span className="font-display text-[14.5px] text-text leading-[1.5]" style={{ fontWeight: 400 }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="w-full py-3 rounded-xl font-display italic text-[13.5px] text-text-secondary border border-white/10 hover:border-flame/40 hover:text-text transition-all"
              style={{ fontWeight: 300 }}
            >
              review another
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-display italic text-[10.5px] tracking-[0.14em] uppercase text-text-muted/70 mb-2"
      style={{ fontWeight: 400 }}
    >
      {children}
    </div>
  );
}
