"use client";

import { cn } from "@/lib/utils";
import type {
  MatchHistoryEntry,
  MessageStyle,
  MessageTone,
} from "@/types";
import { MatchSettings } from "./MatchSettings";

/* ─────────────────────────────────────────────
   MatchSidebar — list of past matches.
   Desktop: left rail. Mobile: full-screen list.
   ───────────────────────────────────────────── */

interface MatchSidebarProps {
  matches: MatchHistoryEntry[];
  activeId: string | null;
  onSelectMatch: (id: string) => void;
  onNewMatch: () => void;
  /** Mobile-only: back button when used as a full-screen list. */
  isMobile?: boolean;
  /** Per-match settings: changing voice/tone on a non-active match updates
      that match in the archive directly. */
  onUpdateMatchSettings?: (
    id: string,
    style?: MessageStyle,
    tone?: MessageTone,
  ) => void;
  /** Permanently delete a match from the archive. */
  onDeleteMatch?: (id: string) => void;
}

/* A match is "quiet" (worth a nudge) when it's still open, the thread has
   started, and it hasn't been touched in a couple of days — the retention moment
   (Track 2). Tapping the row resumes it straight into the reply coach. */
const QUIET_MS = 2 * 24 * 60 * 60 * 1000;
function isQuiet(m: MatchHistoryEntry): boolean {
  return (
    m.status === "in_progress" &&
    m.conversation.length > 0 &&
    Date.now() - m.updatedAt > QUIET_MS
  );
}

export function MatchSidebar({
  matches,
  activeId,
  onSelectMatch,
  onNewMatch,
  isMobile,
  onUpdateMatchSettings,
  onDeleteMatch,
}: MatchSidebarProps) {
  /* On mobile the sidebar IS the list view — user has to drill in to see
     a match, so highlighting one as "active" is confusing. */
  const effectiveActiveId = isMobile ? null : activeId;
  return (
    <div className="flex flex-col h-full">
      {/* Header — new match action */}
      <div className="px-5 sm:px-6 pt-5 pb-3">
        <button
          onClick={onNewMatch}
          className="w-full inline-flex items-center justify-between gap-3 px-4 py-3 rounded-full font-display italic text-white text-[14px] transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background:
              "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
            boxShadow: "0 12px 28px -12px rgba(254,60,114,0.5)",
            fontWeight: 400,
          }}
        >
          new match
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Eyebrow */}
      <div className="px-5 sm:px-6 pt-3 pb-2">
        <span
          className="font-display italic text-flame text-[11px] tracking-[0.12em] uppercase"
          style={{ fontWeight: 400 }}
        >
          your matches
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scroll px-2 sm:px-3 pb-6 min-h-0">
        {matches.length === 0 ? (
          <p
            className="px-3 py-4 font-display italic text-[12.5px] text-text-muted leading-[1.5]"
            style={{ fontWeight: 300 }}
          >
            no matches yet. drop a profile to spend your first hint.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {matches.map((m) => (
              <li key={m.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectMatch(m.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectMatch(m.id);
                    }
                  }}
                  className={cn(
                    "relative w-full text-left px-5 sm:px-6 py-3.5 rounded-xl transition-all cursor-pointer",
                    effectiveActiveId === m.id
                      ? "bg-flame/[0.08] border border-flame/25"
                      : "border border-transparent hover:bg-white/[0.025]",
                  )}
                  style={
                    effectiveActiveId === m.id
                      ? {
                          boxShadow:
                            "0 0 0 1px rgba(254,60,114,0.10), inset 2px 0 0 var(--color-flame)",
                        }
                      : undefined
                  }
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span
                      className="font-display text-[15px] text-text truncate"
                      style={{ fontWeight: 400 }}
                    >
                      {m.name}
                      <span className="text-text-muted font-light ml-1.5">
                        {m.age}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Per-match settings — gear shows on every
                          in-progress match so it's reachable on mobile
                          without first making it active. */}
                      {onUpdateMatchSettings && (
                        <span
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <MatchSettings
                            matchName={m.name}
                            currentStyle={m.pickedStyle ?? "confident"}
                            currentTone={m.pickedTone ?? "natural"}
                            editable={m.status === "in_progress"}
                            onSave={(s, t) => onUpdateMatchSettings(m.id, s, t)}
                            onDelete={
                              onDeleteMatch ? () => onDeleteMatch(m.id) : undefined
                            }
                          />
                        </span>
                      )}
                      <StatusDot status={m.status} />
                    </div>
                  </div>
                  <div
                    className="font-display italic text-[11.5px] text-text-muted mt-0.5 truncate"
                    style={{ fontWeight: 300 }}
                  >
                    {m.status === "asked_out"
                      ? "you asked her out"
                      : m.conversation.length > 0
                        ? `${m.conversation.length} ${m.conversation.length === 1 ? "message" : "messages"} in the thread`
                        : "thread not started"}
                  </div>
                  <div
                    className="font-display italic text-[10.5px] text-text-muted/60 mt-0.5"
                    style={{ fontWeight: 300 }}
                  >
                    {timeAgo(m.updatedAt)}
                  </div>
                  {isQuiet(m) && (
                    <div
                      className="mt-1.5 inline-flex items-center gap-1.5 font-display italic text-[10.5px] text-flame"
                      style={{ fontWeight: 400 }}
                    >
                      <span className="w-1 h-1 rounded-full bg-flame animate-pulse" />
                      gone quiet — tap to revive
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: "in_progress" | "asked_out" }) {
  const color =
    status === "asked_out"
      ? "var(--color-success)"
      : "var(--color-flame)";
  return (
    <span
      className="shrink-0 w-1.5 h-1.5 rounded-full"
      style={{ background: color }}
      aria-label={status}
    />
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
