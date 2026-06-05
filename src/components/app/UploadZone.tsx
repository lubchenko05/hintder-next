"use client";

import { useState, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isAnalyzing: boolean;
}

/* Rotation presets for stacked-photo effect */
const PHOTO_TRANSFORMS = [
  { rotate: "-2deg", x: "0px", y: "0px" },
  { rotate: "3deg", x: "6px", y: "-4px" },
  { rotate: "-4deg", x: "-8px", y: "2px" },
  { rotate: "2deg", x: "4px", y: "-6px" },
  { rotate: "-1deg", x: "-3px", y: "4px" },
] as const;

export function UploadZone({ onFilesSelected, isAnalyzing }: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (fileArray.length === 0) return;
      const updated = [...files, ...fileArray].slice(0, 5);
      setFiles(updated);
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
    [files],
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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

  return (
    <div className="w-full flex-1 flex flex-col items-stretch gap-6 sm:gap-8">
      {/* ═══ Hints — ALWAYS at the top ═══ */}
      <div className="text-left animate-fade-up">
        <h1
          className="font-display tracking-[-0.02em] leading-[1.05] text-[clamp(1.5rem,5vw,2.25rem)]"
          style={{ fontWeight: 400, textWrap: "balance" }}
        >
          Drop her profile{" "}
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
            into the scanner.
          </span>
        </h1>

        <ul
          className="mt-4 space-y-1.5 font-display italic text-[13px] text-text-muted leading-[1.5]"
          style={{ fontWeight: 300 }}
        >
          <li>
            <span className="text-flame not-italic mr-1.5">·</span>
            bio screenshot, photos, prompts — grab it all
          </li>
          <li>
            <span className="text-flame not-italic mr-1.5">·</span>
            if you have her replies already, include those too
          </li>
          <li>
            <span className="text-flame not-italic mr-1.5">·</span>
            the more she shows, the sharper the line
          </li>
        </ul>
      </div>

      {/* ═══ Drop zone — tap to upload, NOT phone-shaped ═══ */}
      <div
        role="button"
        tabIndex={isAnalyzing ? -1 : 0}
        aria-disabled={isAnalyzing}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isAnalyzing) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "group relative w-full rounded-3xl overflow-hidden flex-1",
          "transition-all duration-300 ease-out",
          "border-2 border-dashed",
          "flex",
          hasFiles ? "items-start" : "items-center justify-center",
          isDragging
            ? "border-flame bg-flame/[0.06] scale-[1.005]"
            : "border-white/15 bg-white/[0.015] hover:border-white/30 hover:bg-white/[0.03]",
          isAnalyzing && "pointer-events-none opacity-70",
          hasFiles
            ? "min-h-[360px] sm:min-h-[420px] py-6"
            : "min-h-[460px] sm:min-h-[560px] py-12",
        )}
        style={{
          boxShadow: isDragging
            ? "0 0 60px -10px rgba(254,60,114,0.45)"
            : "none",
        }}
      >
        {!hasFiles ? (
          /* Empty state — obvious tap-to-upload */
          <div className="relative flex flex-col items-center justify-center gap-5 px-6">
            {/* Big plus icon */}
            <div
              className={cn(
                "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                isDragging
                  ? "bg-flame/15 ring-2 ring-flame"
                  : "bg-white/[0.04] ring-1 ring-white/15 group-hover:ring-flame/40 group-hover:bg-flame/8",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className={cn(
                  "w-9 h-9 transition-colors",
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

            {/* Tap to upload text */}
            <div className="text-center space-y-2">
              <div
                className={cn(
                  "font-display text-[18px] sm:text-[20px] tracking-tight transition-colors",
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

            {/* Subtle accent line at the bottom */}
            <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* ═══ Analyze button — appears when files are added ═══ */}
      {hasFiles && (
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
