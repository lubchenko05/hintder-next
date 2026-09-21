"use client";

import { useState, useCallback, useRef, useId, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UploadExamples,
  EXAMPLE_COUNT,
  EXAMPLE_ASPECT,
  type ExampleKind,
} from "./UploadExamples";

/* ── fitting the examples to whatever the drop zone can spare ───────────
   The thumbnails are as large as the zone allows rather than a fixed small
   size — on a roomy zone that is close to double. Both helpers mirror the
   geometry in UploadExamples, so a change there wants a change here. */

/* A ceiling, not a target: the height budget almost always binds first. It
   only matters on a desktop zone with room to spare, where 110 left the
   cards looking like an afterthought. */
const EXAMPLE_MAX_W = 190;
const EXAMPLE_MIN_W = 28;
/* Below this the bio and the prompt stop being words and start being mush. */
const EXAMPLE_READABLE_W = 72;
/* What "tap to upload screenshots" is given when the cards sit beside it —
   the copy has to be capped, or it stays on one long line and shoves them
   off the edge of the zone. */
const EXAMPLE_COPY_W = 152;

function stripHeight(w: number, divider: boolean) {
  const caption = Math.min(14, Math.max(8.5, w * 0.2));
  return (
    (divider ? 20 : 0) +
    w / EXAMPLE_ASPECT +
    Math.max(3, w * 0.08) +
    caption * 1.2
  );
}

function fitExamples(zoneW: number, zoneH: number, count: number) {
  const spread = count + 0.22 * (count - 1);
  const captionH = (w: number) =>
    Math.min(14, Math.max(8.5, w * 0.2)) * 1.2 + Math.max(3, w * 0.08);

  /* ── stacked: cards under the copy, the roomy case ─────────────────── */
  const budget = zoneH - 62; /* two lines of copy, the gap, and some air */
  const stackCap = Math.min(EXAMPLE_MAX_W, (zoneW - 32) / spread);
  const widest = (divider: boolean) => {
    for (let w = Math.floor(stackCap); w >= EXAMPLE_MIN_W; w--) {
      if (stripHeight(w, divider) <= budget) return w;
    }
    return 0;
  };
  /* The "drop this" rule costs 20px — worth it while the cards stay big,
     but below that those pixels buy more as picture than as label. */
  const ruled = widest(true);
  const bare = widest(false);
  const stacked = ruled >= 44 ? ruled : bare;

  /* Anything at least this wide can carry her bio and her prompt as actual
     words, which is the whole reason the card is worth showing. */
  if (stacked >= EXAMPLE_READABLE_W) {
    const divider = ruled >= 44;
    return {
      orientation: "stacked" as const,
      width: stacked,
      showDivider: divider,
      height: stripHeight(stacked, divider),
    };
  }

  /* ── beside: a short but wide zone (a tool page packs a textarea under
     the drop zone) has no vertical room left, and plenty sideways. ───── */
  const sideW = Math.min(
    EXAMPLE_MAX_W,
    (zoneW - EXAMPLE_COPY_W - 14) / spread,
    /* height-bound too: the card plus its caption must clear the zone */
    ((zoneH - 8) * EXAMPLE_ASPECT) / (1 + 0.29 * EXAMPLE_ASPECT),
  );
  const side = Math.floor(sideW);
  if (side >= EXAMPLE_READABLE_W && side / EXAMPLE_ASPECT + captionH(side) <= zoneH - 8) {
    return {
      orientation: "beside" as const,
      width: side,
      showDivider: false,
      /* the horizontal offset the copy shifts by, not a height */
      height: side * spread,
    };
  }

  if (stacked >= EXAMPLE_MIN_W) {
    const divider = ruled >= 44;
    return {
      orientation: "stacked" as const,
      width: stacked,
      showDivider: divider,
      height: stripHeight(stacked, divider),
    };
  }
  return null;
}

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isAnalyzing: boolean;
  /** Headline override — the part before the gradient span. */
  title?: string;
  /** Headline override — the gradient-accented tail. */
  titleAccent?: string;
  /** Bullet hints under the headline. */
  hints?: string[];
  /** Hide the headline block entirely (when the page supplies its own). */
  hideHeadline?: boolean;
  /** Shorter drop area, so a tool page fits on one screen. */
  compact?: boolean;
  /** Hide the built-in submit button — the page renders its own (so it can sit
   *  below other fields and stay visible-but-disabled). */
  hideSubmit?: boolean;
  /** Fires whenever the picked files change, so the page can drive its own CTA. */
  onFilesChange?: (files: File[]) => void;
  /** Show worked examples of the right screenshot inside the empty state. */
  example?: ExampleKind;
}

/* Rotation presets for stacked-photo effect */
const PHOTO_TRANSFORMS = [
  { rotate: "-2deg", x: "0px", y: "0px" },
  { rotate: "3deg", x: "6px", y: "-4px" },
  { rotate: "-4deg", x: "-8px", y: "2px" },
  { rotate: "2deg", x: "4px", y: "-6px" },
  { rotate: "-1deg", x: "-3px", y: "4px" },
] as const;

const DEFAULT_HINTS = [
  "bio screenshot, photos, prompts — grab it all",
  "if you have her replies already, include those too",
  "the more she shows, the sharper the line",
];

export function UploadZone({
  onFilesSelected,
  isAnalyzing,
  title = "Drop her profile",
  titleAccent = "into the scanner.",
  hints = DEFAULT_HINTS,
  hideHeadline = false,
  compact = false,
  hideSubmit = false,
  onFilesChange,
  example,
}: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const zoneRef = useRef<HTMLLabelElement>(null);
  const [zoneBox, setZoneBox] = useState({ w: 0, h: 0 });

  /* The examples are absolutely positioned, so they add no height of their
     own — which is what keeps this measurement from oscillating. */
  useEffect(() => {
    const el = zoneRef.current;
    if (!el || !example) return;
    const ro = new ResizeObserver(([entry]) => {
      /* contentRect is the CONTENT box — the zone's own padding is already
         excluded, so this is the space the strip and the tap-to-upload copy
         actually have to share. */
      const { width, height } = entry.contentRect;
      setZoneBox((prev) =>
        Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1
          ? prev
          : { w: width, h: height },
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [example]);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (fileArray.length === 0) return;
      const updated = [...files, ...fileArray].slice(0, 5);
      setFiles(updated);
      onFilesChange?.(updated);
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) =>
            [...prev, e.target?.result as string].slice(0, 5),
          );
        };
        reader.readAsDataURL(file);
      });
    },
    [files, onFilesChange],
  );

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      onFilesChange?.(next);
      return next;
    });
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const hasFiles = files.length > 0;
  const fit =
    example && zoneBox.h > 0
      ? fitExamples(zoneBox.w, zoneBox.h, EXAMPLE_COUNT[example])
      : null;
  const showExamples = !!example && !hasFiles && !isDragging && !!fit;

  return (
    <div className="w-full flex-1 flex flex-col items-stretch gap-6 sm:gap-8">
      {/* ═══ Hints — ALWAYS at the top (unless the page owns the headline) ═══ */}
      {!hideHeadline && (
        <div className="text-left animate-fade-up">
          <h1
            className="font-display tracking-[-0.02em] leading-[1.05] text-[clamp(1.5rem,5vw,2.25rem)]"
            style={{ fontWeight: 400, textWrap: "balance" }}
          >
            {title}{" "}
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
              {titleAccent}
            </span>
          </h1>

          <ul
            className="mt-4 space-y-1.5 font-display italic text-[13px] text-text-muted leading-[1.5]"
            style={{ fontWeight: 300 }}
          >
            {hints.map((h) => (
              <li key={h}>
                <span className="text-flame not-italic mr-1.5">·</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ═══ Drop zone — tap to upload, NOT phone-shaped ═══ */}
      {/* A real <label for> — the browser opens the file picker natively, so it
          works even before React hydrates (a programmatic input.click() does
          not). */}
      <label
        ref={zoneRef}
        htmlFor={inputId}
        aria-disabled={isAnalyzing}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "cursor-pointer",
          "group relative w-full rounded-3xl overflow-hidden flex-1",
          "transition-all duration-300 ease-out",
          "border-2 border-dashed",
          "flex",
          hasFiles ? "items-start" : "items-center justify-center",
          isDragging
            ? "border-flame bg-flame/[0.06] scale-[1.005]"
            : "border-white/15 bg-white/[0.015] hover:border-white/30 hover:bg-white/[0.03]",
          isAnalyzing && "pointer-events-none opacity-70",
          /* Heights are viewport-relative so the whole page (headline + zone +
             tool links) always fits one screen, on any display. */
          /* Compact mode stretches: the page gives it a flex column and the
             zone eats whatever height is left over, down to a floor that
             still fits a short laptop. */
          compact
            ? "min-h-[150px] py-4"
            : "min-h-[clamp(200px,34vh,380px)] py-6",
        )}
        style={{
          boxShadow: isDragging
            ? "0 0 60px -10px rgba(254,60,114,0.45)"
            : "none",
        }}
      >
        {!hasFiles ? (
          /* Empty state — obvious tap-to-upload */
          <div
            className={cn(
              "relative flex flex-col items-center justify-center px-6",
              compact ? "gap-3" : "gap-5",
            )}
            /* The examples hang off the bottom of the zone; lift the centred
               copy by their height so the two never meet. */
            /* The copy moves by half the examples — up when they sit under
               it, left when they sit beside it — so the pair reads as
               centred instead of the copy holding dead centre while the
               cards drift off to one side. */
            style={
              fit && showExamples
                ? {
                    transform:
                      fit.orientation === "beside"
                        ? `translateX(-${Math.round((fit.height + 12) / 2)}px)`
                        : `translateY(-${Math.round((fit.height + 10) / 2)}px)`,
                    ...(fit.orientation === "beside"
                      ? { maxWidth: EXAMPLE_COPY_W }
                      : {}),
                  }
                : undefined
            }
          >
            {/* Big plus icon — dropped when the examples are up: they are the
                stronger affordance, and on a short zone this is the height
                that lets them fit at all. */}
            {!showExamples && (
            <div
              className={cn(
                "relative rounded-full flex items-center justify-center transition-all duration-300",
                compact ? "w-14 h-14" : "w-20 h-20",
                isDragging
                  ? "bg-flame/15 ring-2 ring-flame"
                  : "bg-white/[0.04] ring-1 ring-white/15 group-hover:ring-flame/40 group-hover:bg-flame/8",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className={cn(
                  "transition-colors",
                  compact ? "w-7 h-7" : "w-9 h-9",
                  isDragging ? "text-flame" : "text-text-muted group-hover:text-flame",
                )}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            )}

            {/* Tap to upload text */}
            <div className={cn("text-center", compact ? "space-y-1" : "space-y-2")}>
              <div
                className={cn(
                  "font-display tracking-tight transition-colors",
                  compact ? "text-[16px] sm:text-[17px]" : "text-[18px] sm:text-[20px]",
                  isDragging ? "text-flame" : "text-text",
                )}
                style={{ fontWeight: 500 }}
              >
                {isDragging ? "drop them here" : "tap to upload screenshots"}
              </div>
              <div
                className="font-display italic text-[12.5px] text-text-muted"
                style={{ fontWeight: 300 }}
              >
                <span className="hidden sm:inline">or drag &amp; drop · </span>
                1–5 images · png or jpg
              </div>
            </div>

            {/* Worked examples — the prose hints tell people what to grab;
                this shows them the shape, which is what actually stops the
                cropped-face uploads. Hung off the copy with top-full so it
                adds no height: a page whose column is already tight must not
                be pushed into overlapping itself. */}
            {showExamples && fit && (
              <div
                className={cn(
                  "absolute",
                  fit.orientation === "beside"
                    ? "left-full top-1/2 ml-3 -translate-y-1/2"
                    : "inset-x-0 top-full mt-2.5",
                )}
              >
                <UploadExamples
                  kind={example}
                  width={fit.width}
                  showDivider={fit.showDivider}
                  beside={fit.orientation === "beside"}
                />
              </div>
            )}

            {/* Subtle accent line at the bottom — suppressed under the
                examples, where it would read as a stray rule between the copy
                and the thumbnails rather than as a finishing touch. */}
            {!showExamples && (
              <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}
          </div>
        ) : (
          /* With files — clean grid of photo thumbs */
          <div className="relative w-full px-6 sm:px-8 py-2 self-start">
            <div className="flex items-baseline justify-between mb-4">
              <span
                className="font-display italic text-[13px] text-text-muted tabular-nums"
                style={{ fontWeight: 300 }}
              >
                <span className="text-flame">{files.length}</span> of 5 attached
              </span>
              {files.length < 5 && (
                <span
                  className="font-display italic text-[12px] text-text-muted"
                  style={{ fontWeight: 300 }}
                >
                  tap empty slots to add more
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 5 }).map((_, i) => {
                const src = previews[i];
                const filled = !!src;
                return (
                  <div
                    key={i}
                    className={cn(
                      "relative aspect-[3/4] rounded-xl overflow-hidden",
                      "border transition-colors",
                      filled
                        ? "border-white/10 bg-bg-elevated"
                        : "border-dashed border-white/10 bg-white/[0.015]",
                    )}
                  >
                    {filled ? (
                      <>
                        <img
                          src={src}
                          alt={`Screenshot ${i + 1}`}
                          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                          draggable={false}
                        />
                        <span
                          className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-black/55 backdrop-blur-md font-mono text-[9.5px] text-white/90"
                        >
                          {i + 1}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(i);
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/65 backdrop-blur-md hover:bg-danger flex items-center justify-center transition-colors z-10"
                          aria-label={`Remove screenshot ${i + 1}`}
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-text-muted/40">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={isAnalyzing}
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </label>

      {/* ═══ Analyze button — appears when files are added ═══ */}
      {hasFiles && !hideSubmit && (
        <button
          onClick={() => onFilesSelected(files)}
          disabled={isAnalyzing}
          className={cn(
            "relative w-full py-4 rounded-full font-display italic text-white text-[16px]",
            "transition-all duration-300",
            isAnalyzing
              ? "cursor-wait"
              : "hover:scale-[1.01] active:scale-[0.99]",
          )}
          style={{
            background:
              "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
            boxShadow: "0 18px 40px -12px rgba(254,60,114,0.55)",
            fontWeight: 400,
          }}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2.5">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              reading her profile…
            </span>
          ) : (
            "analyze profile →"
          )}
        </button>
      )}
    </div>
  );
}
