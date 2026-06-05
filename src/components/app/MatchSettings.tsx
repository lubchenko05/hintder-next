"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/mousewheel";
import { cn } from "@/lib/utils";
import type { MessageStyle, MessageTone } from "@/types";

const PICKER_HEIGHT = 168;
const ITEM_HEIGHT = 36;
const PICKER_PAD = PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2; // 66px

/* ─────────────────────────────────────────────
   MatchSettings — gear-icon popover for the
   active match. Lets the user adjust voice + risk
   on the fly so next-generated replies use them
   without going back to the style step.
   ───────────────────────────────────────────── */

const VOICES: { value: MessageStyle; label: string }[] = [
  { value: "funny", label: "funny" },
  { value: "smart", label: "sharp" },
  { value: "flirty", label: "flirty" },
  { value: "confident", label: "confident" },
  { value: "calm", label: "calm" },
  { value: "short", label: "short" },
  { value: "less-cringe", label: "low-key" },
];

const RISKS: { value: MessageTone; label: string }[] = [
  { value: "safer", label: "safer" },
  { value: "natural", label: "natural" },
  { value: "bolder", label: "bolder" },
];

interface MatchSettingsProps {
  matchName?: string;
  currentStyle: MessageStyle;
  currentTone: MessageTone;
  /** Whether voice/risk can be edited (false for closed matches). */
  editable?: boolean;
  /** Apply the chosen voice + risk to this match. */
  onSave: (style: MessageStyle, tone: MessageTone) => void;
  /** Permanently delete this match (shown only when provided). */
  onDelete?: () => void;
}

export function MatchSettings({
  matchName,
  currentStyle,
  currentTone,
  editable = true,
  onSave,
  onDelete,
}: MatchSettingsProps) {
  const [open, setOpen] = useState(false);
  /* Staged draft — changes only commit on Save, discard on Cancel/close. */
  const [draftStyle, setDraftStyle] = useState<MessageStyle>(currentStyle);
  const [draftTone, setDraftTone] = useState<MessageTone>(currentTone);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const openModal = () => {
    setDraftStyle(currentStyle);
    setDraftTone(currentTone);
    setConfirmDelete(false);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setConfirmDelete(false);
  };
  const save = () => {
    onSave(draftStyle, draftTone);
    close();
  };

  return (
    <div className="relative">
      <button
        onClick={() => (open ? close() : openModal())}
        aria-label="Match settings"
        className={cn(
          "p-1.5 rounded-md text-text-muted hover:text-text hover:bg-white/5 transition-colors",
          open && "text-flame bg-flame/[0.08]",
        )}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop — full viewport so the popover never gets clipped by
              the sidebar. */}
          <div
            onClick={close}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm animate-fade-in"
            aria-hidden
          />
          {/* Centred modal */}
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(360px,calc(100vw-2rem))] rounded-2xl z-[100] overflow-hidden animate-fade-up"
            style={{
              background:
                "linear-gradient(180deg, rgba(25,20,30,0.98), rgba(15,12,20,0.98))",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 30px 60px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Close X */}
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 w-7 h-7 rounded-full border border-white/15 bg-white/[0.04] hover:border-white/35 hover:bg-white/[0.08] transition-colors flex items-center justify-center text-text-muted hover:text-text z-10"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {confirmDelete ? (
              /* ── Delete confirmation ─────────────────────────────── */
              <div className="px-5 py-5">
                <div
                  className="font-display italic text-flame text-[11px] tracking-[0.12em] uppercase"
                  style={{ fontWeight: 400 }}
                >
                  delete match
                </div>
                <p
                  className="font-display text-[16px] text-text mt-3 leading-snug"
                  style={{ fontWeight: 400 }}
                >
                  Delete {matchName ? `“${matchName}”` : "this match"}?
                </p>
                <p
                  className="font-display italic text-[13px] text-text-muted mt-1.5 leading-[1.5]"
                  style={{ fontWeight: 300 }}
                >
                  This permanently removes the match and its thread. It can&apos;t
                  be undone.
                </p>
                <div className="flex items-center gap-2.5 mt-5">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 rounded-full font-display italic text-[13.5px] text-text-secondary border border-white/12 hover:border-white/25 hover:text-text transition-colors"
                    style={{ fontWeight: 300 }}
                  >
                    cancel
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.();
                      close();
                    }}
                    className="flex-1 py-2.5 rounded-full font-display italic text-[13.5px] text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      fontWeight: 400,
                      background: "linear-gradient(95deg, #FE3C72, #FF6B6B)",
                      boxShadow: "0 10px 24px -10px rgba(254,60,114,0.6)",
                    }}
                  >
                    delete forever
                  </button>
                </div>
              </div>
            ) : (
              /* ── Settings ─────────────────────────────────────────── */
              <>
                <div className="px-5 py-4 border-b border-white/[0.05]">
                  <div
                    className="font-display italic text-flame text-[11px] tracking-[0.12em] uppercase"
                    style={{ fontWeight: 400 }}
                  >
                    match settings
                  </div>
                  <p
                    className="font-display italic text-[12px] text-text-muted mt-0.5"
                    style={{ fontWeight: 300 }}
                  >
                    {editable
                      ? "applies to the next batch of openers + replies."
                      : "this match is closed — settings are locked."}
                  </p>
                </div>

                {editable && (
                  <>
                    {/* Voice — vertical scroll picker */}
                    <div className="px-5 pt-4 pb-3">
                      <div
                        className="font-display italic text-[11.5px] text-text-muted mb-2"
                        style={{ fontWeight: 300 }}
                      >
                        voice
                      </div>
                      <VoiceWheel
                        voices={VOICES}
                        current={draftStyle}
                        onChange={setDraftStyle}
                      />
                    </div>

                    {/* Risk */}
                    <div className="px-5 pt-3 pb-4 border-t border-white/[0.04]">
                      <div
                        className="font-display italic text-[11.5px] text-text-muted mb-2"
                        style={{ fontWeight: 300 }}
                      >
                        risk
                      </div>
                      <div
                        className="relative grid grid-cols-3 rounded-full overflow-hidden p-0.5"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {RISKS.map((r) => {
                          const isActive = r.value === draftTone;
                          return (
                            <button
                              key={r.value}
                              onClick={() => setDraftTone(r.value)}
                              className={cn(
                                "relative py-2 font-display italic text-[13px] rounded-full transition-colors",
                                isActive
                                  ? "text-white"
                                  : "text-text-muted hover:text-text",
                              )}
                              style={{
                                fontWeight: isActive ? 400 : 300,
                                background: isActive
                                  ? "linear-gradient(95deg, #FE3C72, #FF8552)"
                                  : "transparent",
                                boxShadow: isActive
                                  ? "0 6px 16px -8px rgba(254,60,114,0.5)"
                                  : "none",
                              }}
                            >
                              {r.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Footer — Save / Cancel */}
                <div className="px-5 pt-3 pb-4 border-t border-white/[0.05] flex items-center gap-2.5">
                  <button
                    onClick={close}
                    className="flex-1 py-2.5 rounded-full font-display italic text-[13.5px] text-text-secondary border border-white/12 hover:border-white/25 hover:text-text transition-colors"
                    style={{ fontWeight: 300 }}
                  >
                    cancel
                  </button>
                  {editable && (
                    <button
                      onClick={save}
                      className="flex-1 py-2.5 rounded-full font-display italic text-[13.5px] text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
                      style={{
                        fontWeight: 400,
                        background:
                          "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
                        boxShadow: "0 10px 24px -10px rgba(254,60,114,0.55)",
                      }}
                    >
                      save
                    </button>
                  )}
                </div>

                {/* Danger zone — delete */}
                {onDelete && (
                  <div className="px-5 pb-4">
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full py-2 rounded-full font-display italic text-[12.5px] text-text-muted hover:text-danger transition-colors"
                      style={{ fontWeight: 300 }}
                    >
                      delete this match
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   VoiceWheel — Swiper.js vertical picker.
   Swiper is the industry standard for sliders;
   full mouse drag, touch, mouse-wheel, snap,
   centered-slides support out of the box.
   ───────────────────────────────────────────── */

function VoiceWheel({
  voices,
  current,
  onChange,
}: {
  voices: { value: MessageStyle; label: string }[];
  current: MessageStyle;
  onChange: (v: MessageStyle) => void;
}) {
  const currentIdx = Math.max(
    0,
    voices.findIndex((v) => v.value === current),
  );
  const swiperRef = useRef<SwiperType | null>(null);
  const lastEmittedIdx = useRef<number>(currentIdx);
  const [activeIdx, setActiveIdx] = useState<number>(currentIdx);

  /* External prop change → drive swiper to that slide. */
  if (
    swiperRef.current &&
    swiperRef.current.activeIndex !== currentIdx &&
    activeIdx !== currentIdx
  ) {
    lastEmittedIdx.current = currentIdx;
    swiperRef.current.slideTo(currentIdx);
    setActiveIdx(currentIdx);
  }

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ height: PICKER_HEIGHT }}
    >
      {/* Centre highlight band */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none rounded-md"
        style={{
          height: ITEM_HEIGHT,
          background: "rgba(254,60,114,0.06)",
          border: "1px solid rgba(254,60,114,0.2)",
        }}
        aria-hidden
      />

      <Swiper
        modules={[Mousewheel]}
        direction="vertical"
        slidesPerView={Math.floor(PICKER_HEIGHT / ITEM_HEIGHT)}
        centeredSlides
        slideToClickedSlide
        mousewheel={{ forceToAxis: true, sensitivity: 1 }}
        initialSlide={currentIdx}
        onSwiper={(s) => {
          swiperRef.current = s;
        }}
        onSlideChange={(s) => {
          const i = s.activeIndex;
          if (i === lastEmittedIdx.current) return;
          lastEmittedIdx.current = i;
          setActiveIdx(i);
          const v = voices[i];
          if (v) onChange(v.value);
        }}
        className="h-full w-full relative z-10 cursor-grab active:cursor-grabbing"
        style={{ height: PICKER_HEIGHT }}
      >
        {voices.map((v, i) => {
          const isActive = i === activeIdx;
          return (
            <SwiperSlide
              key={v.value}
              style={{
                height: ITEM_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className={cn(
                  "font-display italic text-[15px] transition-colors leading-none whitespace-nowrap",
                  isActive ? "text-flame" : "text-text-secondary",
                )}
                style={{ fontWeight: isActive ? 400 : 300 }}
              >
                {v.label}
              </span>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Edge fades */}
      <div
        className="absolute inset-x-0 top-0 z-20 pointer-events-none"
        style={{
          height: PICKER_PAD,
          background:
            "linear-gradient(180deg, rgba(20,15,25,1) 0%, rgba(20,15,25,0) 100%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
        style={{
          height: PICKER_PAD,
          background:
            "linear-gradient(0deg, rgba(20,15,25,1) 0%, rgba(20,15,25,0) 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}
