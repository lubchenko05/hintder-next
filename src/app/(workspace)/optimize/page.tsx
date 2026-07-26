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
import type { ProfileOptimizeResult } from "@/types";

/* ─────────────────────────────────────────────
   Track 4 — "Rate my profile". Upload YOUR OWN dating profile and get an honest
   score, bio rewrites and per-photo feedback. Costs 1 hint (charged server-side
   in bl.reads.optimize_profile, like every other generation).
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
  const [files, setFiles] = useState<File[]>([]);
  /* The uploaded photos, kept as data URLs so the verdicts can sit next to the
     actual picture instead of a slot number. */
  const [previews, setPreviews] = useState<string[]>([]);

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
      setPreviews(images);
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
    <>
        <div className="w-full flex-1 flex flex-col">
          {!result && (
            <div className="space-y-3 flex-1 min-h-0 flex flex-col animate-fade-up">
              <div>
                <h1
                  className="font-display tracking-[-0.03em] leading-[1] text-[clamp(1.6rem,4vw,2.25rem)] mb-2"
                  style={{ fontWeight: 400 }}
                >
                  Rate your{" "}
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
                  className="font-display italic text-[15px] text-text-secondary leading-[1.5]"
                  style={{ fontWeight: 300 }}
                >
                  Upload your own profile. Honest score, stronger bios, and which photos
                  to lead with or cut. <span className="text-text-muted/70">Uses 1 hint.</span>
                </p>
                <ul
                  /* On a short phone these hints are the first thing to go —
                     the drop zone and the button have to stay on screen. */
                  className="mt-2 space-y-1 font-display italic text-[12.5px] text-text-muted leading-[1.4] [@media(max-height:720px)]:hidden"
                  style={{ fontWeight: 300 }}
                >
                  {[
                    "your photos in the order they appear",
                    "your bio / prompts — screenshot them too",
                  ].map((h) => (
                    <li key={h}>
                      <span className="text-flame not-italic mr-1.5">·</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required first: the screenshots — this is the block that
                  absorbs the leftover height so the form fills the screen. */}
              <div className="flex-1 min-h-0 flex flex-col">
                <span
                  className="block font-display italic text-[10.5px] tracking-[0.14em] uppercase text-text-muted/70 mb-2"
                  style={{ fontWeight: 400 }}
                >
                  your profile screenshots
                </span>
                <UploadZone
                  onFilesSelected={run}
                  onFilesChange={setFiles}
                  isAnalyzing={loading}
                  hideHeadline
                  compact
                  hideSubmit
                />
              </div>

              {/* Optional second: the bio */}
              <div>
                <label
                  htmlFor="bio"
                  className="block font-display italic text-[10.5px] tracking-[0.14em] uppercase text-text-muted/70 mb-2"
                  style={{ fontWeight: 400 }}
                >
                  your current bio · optional
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="paste it here — we'll rewrite it in your voice"
                  rows={2}
                  className="w-full rounded-2xl bg-white/[0.03] border border-white/10 focus:border-flame/50 outline-none px-4 py-3 font-display text-[14px] text-text placeholder:text-text-muted/60 transition-colors select-text resize-none"
                />
              </div>

              {/* Always visible — just disabled until there's something to send */}
              <button
                onClick={() => run(files)}
                disabled={loading || files.length === 0}
                className="w-full py-3.5 rounded-full font-display italic text-white text-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-[1.01] enabled:active:scale-[0.99]"
                style={{
                  background: "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
                  fontWeight: 400,
                }}
              >
                {loading
                  ? "reviewing your profile…"
                  : files.length === 0
                    ? "add your screenshots first"
                    : `rate my profile · ${files.length} photo${files.length > 1 ? "s" : ""}`}
              </button>

              {error && (
                <p className="font-display italic text-[13px] text-danger" style={{ fontWeight: 300 }}>
                  {error}
                </p>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fade-up">
              {/* Score — a bare number reads as a rating out of nothing, so it
                  carries its denominator and a bar you can see it against. */}
              <div>
                <div className="flex items-center gap-4">
                  <div
                    className="font-display tabular-nums leading-[0.85] text-[clamp(3.5rem,8vw,5.5rem)]"
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
                    className="font-display italic text-[22px] text-text-muted tabular-nums self-end pb-2"
                    style={{ fontWeight: 300 }}
                  >
                    / 100
                  </div>
                  <div
                    className="font-display italic text-[15px] sm:text-[16.5px] text-text-secondary leading-[1.5] flex-1 self-center"
                    style={{ fontWeight: 300 }}
                  >
                    {result.firstImpression}
                  </div>
                </div>

                <div
                  className="mt-4 h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, result.score))}%`,
                      background: "linear-gradient(95deg, #FE3C72, #FF8552)",
                      transition: "width 0.8s cubic-bezier(0.2,0.7,0.3,1)",
                    }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between font-display italic text-[11px] text-text-muted/60">
                  <span>swiped past</span>
                  <span>swiped right</span>
                </div>
              </div>

              <div>
                <SectionLabel>bio rewrites</SectionLabel>
                <div className="space-y-2.5">
                  {result.bioRewrites.map((b, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-4 flex items-start justify-between gap-3"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <p
                        className="font-display text-[14.5px] text-text leading-[1.5]"
                        style={{ fontWeight: 400 }}
                      >
                        {b}
                      </p>
                      <button
                        onClick={() => copyBio(b, i)}
                        className="shrink-0 font-display italic text-[14px] text-text-muted hover:text-flame transition-colors"
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

                {/* Rows, not thumbnails: we don't have the photo itself here,
                    and an empty coloured box explains nothing — it just looks
                    broken when the profile has one photo. */}
                <div className="space-y-2">
                  {result.photoFeedback.map((p) => {
                    const c = VERDICT_COLOR[p.verdict] ?? "var(--color-text)";
                    return (
                      <div
                        key={p.slot}
                        className="rounded-xl pl-4 pr-4 py-3 flex items-center gap-3"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderLeft: `2px solid ${c}`,
                        }}
                      >
                        {previews[p.slot] ? (
                          <img
                            src={previews[p.slot]}
                            alt={`Your photo ${p.slot + 1}`}
                            className="w-[46px] h-[60px] object-cover rounded-lg shrink-0 border border-white/10"
                          />
                        ) : (
                          <span
                            className="font-display italic text-[11px] tabular-nums text-text-muted shrink-0"
                            style={{ fontWeight: 300 }}
                          >
                            photo {p.slot + 1}
                          </span>
                        )}
                        <span
                          className="font-display italic text-[12px] uppercase tracking-[0.08em] shrink-0"
                          style={{ fontWeight: 400, color: c }}
                        >
                          {p.verdict}
                        </span>
                        <span
                          className="font-display italic text-[13.5px] text-text-secondary leading-[1.45]"
                          style={{ fontWeight: 300 }}
                        >
                          {p.note}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <SectionLabel>top fixes</SectionLabel>
                <ol className="space-y-1.5">
                  {result.topFixes.map((f, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="font-display italic text-flame text-[13px] tabular-nums"
                        style={{ fontWeight: 400 }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className="font-display text-[14.5px] text-text leading-[1.5]"
                        style={{ fontWeight: 400 }}
                      >
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
          <ToolLinks current="optimize" />
      </div>
    </>
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
