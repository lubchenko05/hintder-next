"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   ConfirmDialog — a reusable modal confirmation in the app's editorial style.
   Replaces window.confirm() with something that doesn't look like 1998.
   ───────────────────────────────────────────── */

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl p-7 sm:p-8 animate-fade-up"
        style={{
          background:
            "linear-gradient(180deg, rgba(25,20,30,0.99), rgba(15,12,20,0.99))",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="font-display tracking-[-0.025em] leading-[1.1] text-[22px] sm:text-[24px] text-text mb-3"
          style={{ fontWeight: 400 }}
        >
          {title}
        </h2>

        <p
          className="font-display italic text-[14.5px] text-text-secondary leading-[1.6] mb-7"
          style={{ fontWeight: 300 }}
        >
          {body}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-full font-display italic text-[14px] text-text-secondary border border-white/12 hover:text-text hover:border-white/25 transition-colors"
            style={{ fontWeight: 300 }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "flex-1 py-3 rounded-full font-display italic text-[14px] transition-all hover:scale-[1.02] active:scale-[0.98]",
              danger
                ? "bg-danger/90 text-white hover:bg-danger"
                : "text-bg",
            )}
            style={
              !danger
                ? { background: "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)", fontWeight: 400 }
                : { fontWeight: 400 }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
