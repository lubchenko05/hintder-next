"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Mark } from "@/components/brand/Mark";
import { useAppFlow } from "@/hooks/useAppFlow";
import { useMatches } from "@/hooks/useMatches";
import { useAuth } from "@/hooks/useAuth";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { UploadZone } from "@/components/app/UploadZone";
import { ProfileAnalysis } from "@/components/app/ProfileAnalysis";
import { StylePicker } from "@/components/app/StylePicker";
import { MessageList } from "@/components/app/MessageList";
import { FollowUp } from "@/components/app/FollowUp";
import { DatePrep } from "@/components/app/DatePrep";
import { MatchSidebar } from "@/components/app/MatchSidebar";
import { PastMatchView } from "@/components/app/PastMatchView";
import { MatchSettings } from "@/components/app/MatchSettings";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Upload", "Analysis", "Style", "Messages"];

function StepIndicator({ currentStep }: { currentStep: string }) {
  const stepIndex =
    currentStep === "upload" || currentStep === "analyzing"
      ? 0
      : currentStep === "analysis"
        ? 1
        : currentStep === "style"
          ? 2
          : 3;

  return (
    <div className="flex items-center gap-1.5">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5">
          <div
            className={`h-1 rounded-full transition-all duration-500 ${
              i <= stepIndex ? "w-8 bg-accent" : "w-4 bg-border"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

function AnalyzingSkeleton() {
  return (
    <div className="w-full max-w-lg mx-auto space-y-4 animate-fade-up">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-xl gradient-accent flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text">
            Reading her profile...
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Finding hooks, analyzing vibe, preparing suggestions
          </p>
        </div>
      </div>

      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-bg-card border border-border space-y-3"
        >
          <div className="h-3 w-24 rounded bg-bg-elevated animate-pulse-soft" />
          <div className="space-y-2">
            <div
              className="h-3 w-full rounded bg-bg-elevated animate-pulse-soft"
              style={{ animationDelay: `${i * 200}ms` }}
            />
            <div
              className="h-3 w-3/4 rounded bg-bg-elevated animate-pulse-soft"
              style={{ animationDelay: `${i * 300}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AppPage() {
  const {
    step,
    analysis,
    messages,
    followUp,
    conversation,
    isLoading,
    uploadedImages,
    handleUpload,
    handleContinueToStyle,
    handleGenerate,
    handleRegenerate,
    handleTweak,
    handleFollowUp,
    handlePickOpener,
    handleSubmitReply,
    handleReadReply,
    handlePickReply,
    handleAcceptDateInvite,
    handleClearConversation,
    handleBackToMessages,
    handleReset,
    handleResumeMatch,
    currentStyle,
    currentTone,
    updateActiveMatchSettings,
    updateMatchSettingsById,
    activeMatchId,
    credits,
    paywallOpen,
    startDemo,
    isDemo,
    demoGateOpen,
    closeDemoGate,
  } = useAppFlow();
  const router = useRouter();

  const { matches, getMatch, removeMatch } = useMatches();
  const { auth } = useAuth();

  /* Delete a match from the archive. If it's the one currently open in the
     live workspace or the read-only viewer, reset back to a clean upload. */
  const handleDeleteMatch = (id: string) => {
    removeMatch(id);
    if (id === selectedMatchId) setSelectedMatchId(null);
    if (id === activeMatchId) handleReset();
  };

  /* selectedMatchId: null = live workspace, otherwise read-only viewer. */
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  /* Mobile: when null → show list, otherwise show workspace/viewer. */
  const [mobileView, setMobileView] = useState<"list" | "detail">("detail");

  const selectedMatch = selectedMatchId ? getMatch(selectedMatchId) : null;
  const isAuthed = !auth.isAnonymous;

  const selectMatch = (id: string) => {
    const m = getMatch(id);
    if (!m) return;
    if (m.status === "asked_out") {
      /* Closed thread → open read-only viewer. */
      setSelectedMatchId(id);
    } else {
      /* In-progress → resume the live flow. */
      setSelectedMatchId(null);
      handleResumeMatch(m);
    }
    setMobileView("detail");
  };

  const startNewMatch = () => {
    setSelectedMatchId(null);
    handleReset();
    setMobileView("detail");
  };

  const openListMobile = () => setMobileView("list");
  const backToListMobile = () => setMobileView("list");

  /* After a payment round-trip (/checkout/success → /app?resumed=1), restore the
     match the user was working on so they land back where they left off — not on
     a blank upload. Runs once, after the match list has loaded. */
  /* Track 3 — "try a sample" demo. /app?demo=1 seeds a bundled read with no
     upload, no signup, no hint, no paywall. Runs once at mount. */
  const demoRef = useRef(false);
  useEffect(() => {
    if (demoRef.current || typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("demo") !== "1") return;
    demoRef.current = true;
    startDemo();
    setSelectedMatchId(null);
    setMobileView("detail");
    window.history.replaceState(null, "", "/app");
  }, [startDemo]);

  const resumedRef = useRef(false);
  useEffect(() => {
    if (resumedRef.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("resumed") !== "1") return;
    const id = window.localStorage.getItem("hintder.resumeMatchId");
    if (!id) {
      resumedRef.current = true;
      return;
    }
    const m = getMatch(id);
    if (!m) return; // matches still loading — effect re-runs when they arrive
    resumedRef.current = true;
    if (m.status === "asked_out") {
      setSelectedMatchId(id);
    } else {
      setSelectedMatchId(null);
      handleResumeMatch(m);
    }
    setMobileView("detail");
    window.history.replaceState(null, "", "/app");
  }, [matches, getMatch, handleResumeMatch]);

  /* Deep-link / reload support: the open match's id lives in the URL as
     /app?id=<id>, so a full page reload restores that match — and its photo,
     via handleResumeMatch's signed-URL resolver — instead of dropping the user
     on a blank upload. The id is read ONCE at mount (before the sync effect
     below can rewrite the URL), then resumed as soon as the match list loads. */
  const urlMatchId = useRef<string | null>(
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("id")
      : null,
  );
  const bootstrappedRef = useRef(false);
  useEffect(() => {
    if (bootstrappedRef.current || typeof window === "undefined") return;
    /* Payment round-trip is owned by the resumed effect above — just unblock
       the URL-sync effect below so it can stamp ?id= once that resume lands. */
    if (new URLSearchParams(window.location.search).get("resumed") === "1") {
      bootstrappedRef.current = true;
      return;
    }
    const id = urlMatchId.current;
    if (!id) {
      bootstrappedRef.current = true;
      return;
    }
    const m = getMatch(id);
    if (m) {
      bootstrappedRef.current = true;
      if (m.status === "asked_out") {
        setSelectedMatchId(id);
      } else {
        setSelectedMatchId(null);
        handleResumeMatch(m);
      }
      setMobileView("detail");
    } else if (matches.length > 0) {
      /* List loaded but this id is gone (deleted/foreign) — give up cleanly. */
      bootstrappedRef.current = true;
    }
    /* else: matches still loading — effect re-runs when they arrive. */
  }, [matches, getMatch, handleResumeMatch]);

  /* Keep the URL in sync with whichever match is open, so a reload restores it.
     Runs only AFTER bootstrap so it can't wipe the incoming ?id= before it's
     consumed; skips while a payment ?resumed=1 is still being processed. */
  useEffect(() => {
    if (!bootstrappedRef.current || typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("resumed") === "1") return;
    const openId = selectedMatchId ?? activeMatchId;
    const target = openId ? `/app?id=${openId}` : "/app";
    if (window.location.pathname + window.location.search !== target) {
      window.history.replaceState(null, "", target);
    }
  }, [selectedMatchId, activeMatchId]);

  /* Out of hints → straight to the full plans page (the paywall). No
     intermediate one-price teaser modal. The active match is already persisted
     (RESUME_MATCH_KEY), so the user lands back on it after checkout. */
  useEffect(() => {
    if (paywallOpen) router.push("/pricing");
  }, [paywallOpen, router]);

  return (
    <div className="h-dvh flex flex-col bg-bg relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="aurora w-[500px] h-[500px] -top-40 -left-40 opacity-30"
          style={{ background: "var(--color-flame)" }}
        />
        <div
          className="aurora w-[400px] h-[400px] bottom-0 -right-20 opacity-25"
          style={{ background: "var(--color-ember)", animationDelay: "-5s" }}
        />
      </div>

      {/* App header */}
      <header className="sticky top-0 z-50 px-5 sm:px-8 py-4 backdrop-blur-xl bg-bg/70 border-b border-white/[0.04] select-none">
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile: hamburger to open list (only when authed) */}
            {isAuthed && (
              <button
                onClick={openListMobile}
                className="lg:hidden p-1.5 rounded-md hover:bg-white/5 text-text-muted hover:text-text transition-colors"
                aria-label="Open match list"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
            )}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <Mark size={20} />
              <span className="font-black text-text text-[13px] lowercase tracking-tight">
                hintder
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {selectedMatch === null && !isAuthed && (
              <StepIndicator currentStep={step} />
            )}

            {/* Hints indicator — permanent users get the balance pill from
                AccountMenu (same on every page); standalone only for the
                anonymous (not-yet-linked) account. */}
            {!isAuthed && (
            <div className="inline-flex items-center gap-1.5">
              <span
                className="inline-flex items-baseline gap-1 sm:gap-1.5 font-display italic text-[11px] sm:text-[12px]"
                style={{ fontWeight: 300 }}
              >
                <span
                  className="tabular-nums"
                  style={{
                    color:
                      credits > 0
                        ? "var(--color-flame)"
                        : "var(--color-text-muted)",
                    fontWeight: 400,
                  }}
                >
                  {credits}
                </span>
                <span className="text-text-muted">
                  {credits === 1 ? "hint" : "hints"}
                </span>
                {credits > 0 && (
                  <span className="text-text-muted hidden sm:inline">
                    · free
                  </span>
                )}
              </span>
              {isAuthed && (
                <Link
                  href="/pricing"
                  aria-label="Top up hints"
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-flame/40 bg-flame/[0.06] text-flame hover:bg-flame/[0.15] hover:border-flame/70 transition-colors"
                >
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </Link>
              )}
            </div>
            )}

            {/* Sign-in / account dropdown */}
            {auth.isAnonymous ? (
              <Link
                href="/signin"
                className="font-display italic text-[12px] text-text-muted hover:text-text transition-colors"
                style={{ fontWeight: 300 }}
              >
                sign in
              </Link>
            ) : (
              <AccountMenu
                inlineHints
                navItems={[
                  { label: "Home", href: "/" },
                  { label: "Guides", href: "/guides" },
                  { label: "Stories", href: "/stories" },
                  { label: "Pricing", href: "/pricing" },
                ]}
              />
            )}

            {/* "Start over" — only for anonymous users. Authed users start a
                new read from the sidebar "+", so this would just duplicate it. */}
            {step !== "upload" && selectedMatch === null && !isAuthed && (
              <button
                onClick={handleReset}
                className="p-1.5 rounded-md hover:bg-white/5 text-text-muted hover:text-text transition-colors"
                title="Start over"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Body — sidebar (lg+ if authed) + workspace. Each pane scrolls
          on its own; the page itself never scrolls. */}
      <div
        className={cn(
          "flex-1 min-h-0 flex",
          isAuthed && "lg:grid lg:grid-cols-[300px_1fr]",
        )}
      >
        {/* Desktop sidebar (only when authed) */}
        {isAuthed && (
          <aside className="hidden lg:flex flex-col border-r border-white/[0.05] min-h-0 min-w-0 overflow-y-auto overflow-x-hidden custom-scroll">
            <MatchSidebar
              matches={matches}
              activeId={selectedMatchId ?? activeMatchId}
              onUpdateMatchSettings={updateMatchSettingsById}
              onDeleteMatch={handleDeleteMatch}
              onSelectMatch={selectMatch}
              onNewMatch={startNewMatch}
            />
          </aside>
        )}

        {/* Mobile full-screen list (when in list mode) */}
        {isAuthed && mobileView === "list" && (
          <div className="lg:hidden flex-1 flex flex-col">
            <MatchSidebar
              matches={matches}
              activeId={selectedMatchId ?? activeMatchId}
              onUpdateMatchSettings={updateMatchSettingsById}
              onDeleteMatch={handleDeleteMatch}
              onSelectMatch={(id) => {
                selectMatch(id);
                setMobileView("detail");
              }}
              onNewMatch={() => {
                startNewMatch();
                setMobileView("detail");
              }}
              isMobile
            />
          </div>
        )}

        {/* Workspace / detail — hidden on mobile when in list mode */}
        <main
          className={cn(
            "flex-1 px-5 sm:px-8 py-6 sm:py-10 flex flex-col min-w-0 min-h-0 overflow-y-auto overflow-x-hidden custom-scroll",
            isAuthed && mobileView === "list" && "hidden lg:flex",
          )}
        >
          {/* Read-only past-match view */}
          {selectedMatch ? (
            <PastMatchView
              match={selectedMatch}
              onBackToList={backToListMobile}
            />
          ) : (
            <>
              {step === "upload" && (
                <div
                  key="upload"
                  className="w-full flex-1 flex flex-col animate-fade-up"
                >
                  <UploadZone
                    onFilesSelected={handleUpload}
                    isAnalyzing={isLoading}
                  />
                  {/* Track 4 tools — decode a reply / rate your own profile. */}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                    <Link
                      href="/decode"
                      className="font-display italic text-[13px] text-text-muted hover:text-flame transition-colors"
                      style={{ fontWeight: 300 }}
                    >
                      decode her reply →
                    </Link>
                    <Link
                      href="/optimize"
                      className="font-display italic text-[13px] text-text-muted hover:text-flame transition-colors"
                      style={{ fontWeight: 300 }}
                    >
                      rate my profile →
                    </Link>
                  </div>
                </div>
              )}

              {step === "analyzing" && (
                <div key="analyzing" className="w-full animate-fade-up">
                  <AnalyzingSkeleton />
                </div>
              )}

              {step === "analysis" && analysis && (
                <div key="analysis" className="w-full animate-fade-up">
                  <ProfileAnalysis
                    analysis={analysis}
                    onContinue={handleContinueToStyle}
                    images={uploadedImages}
                  />
                </div>
              )}

              {step === "style" && (
                <div key="style" className="w-full animate-fade-up">
                  <StylePicker
                    onGenerate={handleGenerate}
                    onPickOpener={handlePickOpener}
                    isGenerating={isLoading}
                    previews={analysis?.previews}
                  />
                </div>
              )}

              {step === "messages" && (
                <div key="messages" className="w-full animate-fade-up">
                  <MessageList
                    messages={messages}
                    onTweak={handleTweak}
                    onRegenerate={handleRegenerate}
                    onFollowUp={handleFollowUp}
                    onPickOpener={handlePickOpener}
                    isRegenerating={isLoading}
                  />
                </div>
              )}

              {step === "followup" && (
                <div key="followup" className="w-full animate-fade-up">
                  <FollowUp
                    analysis={followUp}
                    conversation={conversation}
                    onSubmitReply={handleSubmitReply}
                    onReadReply={handleReadReply}
                    onPickReply={handlePickReply}
                    onAcceptDateInvite={handleAcceptDateInvite}
                    onClearConversation={handleClearConversation}
                    onTweak={handleTweak}
                    onBack={handleBackToMessages}
                    isAnalyzing={isLoading}
                  />
                </div>
              )}

              {step === "datePrep" && analysis && (
                <div key="datePrep" className="w-full animate-fade-up">
                  <DatePrep
                    analysis={analysis}
                    conversation={conversation}
                    onReset={handleReset}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Silence unused-var warning for ArrowLeft (used by past view variants) */}
      {false && <ArrowLeft />}

      {/* Demo (Track 3): a subtle ribbon while viewing the sample profile. */}
      {isDemo && !demoGateOpen && (
        <div className="fixed inset-x-0 bottom-0 z-[55] flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
          <div
            className="pointer-events-auto flex items-center gap-3 rounded-full pl-4 pr-2 py-2"
            style={{
              background: "linear-gradient(180deg, rgba(25,20,30,0.98), rgba(15,12,20,0.98))",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 16px 40px -18px rgba(0,0,0,0.7)",
            }}
          >
            <span
              className="font-display italic text-[12.5px] text-text-secondary"
              style={{ fontWeight: 300 }}
            >
              you&apos;re viewing a sample profile
            </span>
            <button
              onClick={() => router.push("/signin?next=/app")}
              className="rounded-full px-3.5 py-1.5 font-display italic text-white text-[12.5px] transition-transform hover:scale-[1.03] active:scale-95"
              style={{
                background: "linear-gradient(95deg, #FE3C72, #FF8552)",
                fontWeight: 400,
              }}
            >
              run it on yours →
            </button>
          </div>
        </div>
      )}

      {/* Demo gate — any hint-costing action asks for a free sign-up. */}
      {demoGateOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center px-5 bg-black/70 backdrop-blur-sm"
          onClick={closeDemoGate}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 text-center animate-fade-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, rgba(25,20,30,0.98), rgba(15,12,20,0.98))",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 30px 60px -20px rgba(0,0,0,0.8)",
            }}
          >
            <div className="font-display text-[18px] text-text mb-2" style={{ fontWeight: 500 }}>
              Like what you see?
            </div>
            <p
              className="font-display italic text-[13.5px] text-text-secondary leading-[1.5] mb-5"
              style={{ fontWeight: 300 }}
            >
              Sign up free and run it on YOUR match — the first 3 reads are on us.
            </p>
            <button
              onClick={() => router.push("/signin?next=/app")}
              className="w-full py-3 rounded-xl font-display italic text-white text-[14px] transition-transform hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: "linear-gradient(95deg, #FE3C72, #FF8552)", fontWeight: 400 }}
            >
              start free
            </button>
            <button
              onClick={closeDemoGate}
              className="mt-2 w-full py-2 font-display italic text-[12.5px] text-text-muted hover:text-text transition-colors"
              style={{ fontWeight: 300 }}
            >
              keep looking at the demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
