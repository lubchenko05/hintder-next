"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AppStep,
  ProfileAnalysis,
  GeneratedMessage,
  FollowUpAnalysis,
  MessageStyle,
  MessageTone,
  ConversationTurn,
  MatchHistoryEntry,
  MatchStatus,
} from "@/types";

/* localStorage key holding the id of the match the user was last working on,
   so a payment round-trip (which unmounts /app) can resume it. */
const RESUME_MATCH_KEY = "hintder.resumeMatchId";
import {
  analyzeProfile,
  filesToDataUrls,
  generateMessages,
  analyzeReply,
  regenerateMessage,
} from "@/lib/ai";
import { useCredits } from "./useCredits";
import { useMatches } from "./useMatches";

const turnId = () => Math.random().toString(36).slice(2, 10);

export function useAppFlow() {
  const [step, setStep] = useState<AppStep>("upload");
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [messages, setMessages] = useState<GeneratedMessage[]>([]);
  const [followUp, setFollowUp] = useState<FollowUpAnalysis | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  /* The actual uploaded screenshots (data-URLs) for the live session — shown
     in the photo report. Past matches don't keep these (privacy). */
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Style & tone for regeneration
  const [currentStyle, setCurrentStyle] = useState<MessageStyle>("funny");
  const [currentTone, setCurrentTone] = useState<MessageTone>("natural");

  /* Credits — one analysis costs one credit */
  const credits = useCredits();

  /* Archive of past matches */
  const { upsertMatch, getMatch } = useMatches();
  /* Stable id per active session so repeated upserts target one row. */
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  /* Per-match working state the backend doesn't persist: the generated openers
     (the user PAID a hint for these) and the uploaded screenshot data-URLs
     (shown in the photo report — the backend only keeps non-displayable gs://
     URIs). Keyed by match id and kept for the page's lifetime, so switching to
     another match and back restores exactly what was paid for / uploaded. A
     full page reload clears it (durable opener persistence would need a backend
     column; the photo would need signed URLs). */
  const sessionCache = useRef<
    Map<
      string,
      {
        messages: GeneratedMessage[];
        images: string[];
        followUp: FollowUpAnalysis | null;
      }
    >
  >(new Map());

  const cacheMerge = useCallback(
    (
      id: string | null,
      patch: Partial<{
        messages: GeneratedMessage[];
        images: string[];
        followUp: FollowUpAnalysis | null;
      }>,
    ) => {
      if (!id) return;
      const prev =
        sessionCache.current.get(id) ?? { messages: [], images: [], followUp: null };
      sessionCache.current.set(id, { ...prev, ...patch });
    },
    [],
  );

  /* Mirror of activeMatchId readable inside async callbacks (state is stale in
     closures). Lets the signed-URL resolver below check it's still the open
     match before applying a late-arriving result. */
  const activeIdRef = useRef<string | null>(null);
  const setActiveMatch = useCallback((id: string | null) => {
    activeIdRef.current = id;
    setActiveMatchId(id);
  }, []);

  /* Persist the active match (analysis + conversation + paid openers + picked
     voice/risk) to the backend. Called on every meaningful state change so a
     resume — after switching matches OR a payment round-trip — lands the user
     exactly where they left off (e.g. "waiting for her reply" once they've
     picked an opener, not back on the opener list). No-op until a match exists. */
  const persistMatch = useCallback(
    (
      conversationNow: ConversationTurn[],
      status: MatchStatus = "in_progress",
      followUpValue: FollowUpAnalysis | null = followUp,
    ) => {
      if (!analysis || !activeMatchId) return;
      upsertMatch({
        id: activeMatchId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        name: analysis.name,
        age: analysis.age,
        status,
        analysis,
        conversation: conversationNow,
        messages,
        followUp: followUpValue,
        pickedStyle: currentStyle,
        pickedTone: currentTone,
      });
    },
    [analysis, activeMatchId, messages, followUp, currentStyle, currentTone, upsertMatch],
  );

  /* Remember the active match so a payment redirect (which unmounts /app) can
     resume it on return. Cleared by handleReset. */
  useEffect(() => {
    if (typeof window === "undefined" || !activeMatchId) return;
    window.localStorage.setItem(RESUME_MATCH_KEY, activeMatchId);
  }, [activeMatchId]);

  /* Update voice + risk for the currently-active match. Persists to the
     archive so each match remembers its own settings. */
  const updateActiveMatchSettings = useCallback(
    (style?: MessageStyle, tone?: MessageTone) => {
      if (style) setCurrentStyle(style);
      if (tone) setCurrentTone(tone);
      if (!activeMatchId) return;
      const existing = getMatch(activeMatchId);
      if (!existing) return;
      upsertMatch({
        ...existing,
        pickedStyle: style ?? existing.pickedStyle,
        pickedTone: tone ?? existing.pickedTone,
        updatedAt: Date.now(),
      });
    },
    [activeMatchId, getMatch, upsertMatch],
  );

  /* Update voice + risk for ANY match (sidebar gear on a non-active row).
     If the user is editing the currently-active match, also sync the live
     in-flow state so the next generation uses the new values. */
  const updateMatchSettingsById = useCallback(
    (id: string, style?: MessageStyle, tone?: MessageTone) => {
      const existing = getMatch(id);
      if (!existing) return;
      upsertMatch({
        ...existing,
        pickedStyle: style ?? existing.pickedStyle,
        pickedTone: tone ?? existing.pickedTone,
        updatedAt: Date.now(),
      });
      if (id === activeMatchId) {
        if (style) setCurrentStyle(style);
        if (tone) setCurrentTone(tone);
      }
    },
    [activeMatchId, getMatch, upsertMatch],
  );

  const handleUpload = useCallback(
    async (files: File[]) => {
      /* Gate: must have a credit to start an analysis */
      if (!credits.hasCredits) {
        setPaywallOpen(true);
        return;
      }
      setIsLoading(true);
      setStep("analyzing");
      try {
        /* Keep the uploaded images for the photo report (live session). */
        const images = await filesToDataUrls(files);
        setUploadedImages(images);
        const result = await analyzeProfile(files);
        /* Burn the credit only after a successful analysis */
        credits.refresh();
        setAnalysis(result);
        setStep("analysis");
        /* Open a new match row in the archive — gets upserted as the
           user moves through the flow. */
        const id = Math.random().toString(36).slice(2, 12);
        setActiveMatch(id);
        /* Cache the photos so revisiting this match restores them. */
        cacheMerge(id, { images, messages: [] });
        const entry: MatchHistoryEntry = {
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          name: result.name,
          age: result.age,
          status: "in_progress",
          analysis: result,
          conversation: [],
        };
        upsertMatch(entry);
      } catch {
        setStep("upload");
      } finally {
        setIsLoading(false);
      }
    },
    [credits, upsertMatch, cacheMerge, setActiveMatch],
  );

  const closePaywall = useCallback(() => setPaywallOpen(false), []);

  const handleContinueToStyle = useCallback(() => {
    setStep("style");
  }, []);

  /* Every generation/analysis op consumes 1 hint. Pure UI interactions
     (picking, copying, navigating, expanding sections) stay free. */
  const handleGenerate = useCallback(
    async (style: MessageStyle, tone: MessageTone) => {
      if (!analysis) return;
      if (!credits.hasCredits) {
        setPaywallOpen(true);
        return;
      }
      setIsLoading(true);
      setCurrentStyle(style);
      setCurrentTone(tone);
      try {
        const result = await generateMessages(analysis, style, tone);
        credits.refresh();
        setMessages(result);
        setStep("messages");
        /* Cache the paid openers so revisiting this match restores them. */
        cacheMerge(activeMatchId, { messages: result });
        /* Remember picked style/tone in the archive row. */
        if (activeMatchId) {
          upsertMatch({
            id: activeMatchId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            name: analysis.name,
            age: analysis.age,
            status: "in_progress",
            analysis,
            conversation,
            messages: result,
            followUp,
            pickedStyle: style,
            pickedTone: tone,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [analysis, credits, activeMatchId, conversation, followUp, upsertMatch, cacheMerge]
  );

  const handleRegenerate = useCallback(async () => {
    if (!analysis) return;
    if (!credits.hasCredits) {
      setPaywallOpen(true);
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateMessages(analysis, currentStyle, currentTone);
      credits.refresh();
      setMessages(result);
      cacheMerge(activeMatchId, { messages: result });
    } finally {
      setIsLoading(false);
    }
  }, [analysis, currentStyle, currentTone, credits, activeMatchId, cacheMerge]);

  const handleTweak = useCallback(
    async (message: GeneratedMessage, instruction: string) => {
      if (!credits.hasCredits) {
        setPaywallOpen(true);
        return;
      }
      /* No global isLoading — the MessageCard shows its own per-card loader so
         the batch "try 5 more" button doesn't flash "regenerating…". */
      const updated = await regenerateMessage(message, instruction);
      credits.refresh();

      /* The tweaked message can live in the openers list OR inside the current
         follow-up read (reply suggestions / date invites). Replace it wherever
         its id is found — keyed by the ORIGINAL id, since the new one differs. */
      setMessages((prev) => {
        if (!prev.some((m) => m.id === message.id)) return prev;
        const next = prev.map((m) => (m.id === message.id ? updated : m));
        cacheMerge(activeMatchId, { messages: next });
        return next;
      });
      setFollowUp((prev) => {
        if (!prev) return prev;
        const inReplies = prev.nextMessages.some((m) => m.id === message.id);
        const inInvites = prev.dateInvites?.some((m) => m.id === message.id) ?? false;
        if (!inReplies && !inInvites) return prev;
        return {
          ...prev,
          nextMessages: prev.nextMessages.map((m) => (m.id === message.id ? updated : m)),
          dateInvites: prev.dateInvites?.map((m) => (m.id === message.id ? updated : m)),
        };
      });
    },
    [credits, activeMatchId, cacheMerge]
  );

  const handleFollowUp = useCallback(() => {
    setStep("followup");
    setFollowUp(null);
    setConversation([]);
  }, []);

  /* User picked one of the FIRST openers (from MessageList). We seed the
     conversation with that as turn 0 (the user's first message) and jump
     into the follow-up step waiting for her reply. */
  const handlePickOpener = useCallback(
    (message: GeneratedMessage) => {
      const meTurn: ConversationTurn = {
        id: turnId(),
        role: "me",
        text: message.text,
        ts: Date.now(),
      };
      const next = [meTurn];
      setConversation(next);
      setFollowUp(null);
      setStep("followup");
      /* Persist the sent opener so resuming lands on "waiting for her reply". */
      persistMatch(next, "in_progress", null);
      cacheMerge(activeMatchId, { followUp: null });
    },
    [persistMatch, cacheMerge, activeMatchId],
  );

  const handleSubmitReply = useCallback(
    async (reply: string, screenshots: string[] = []) => {
      if (!analysis) return;
      /* Reading her reply costs a credit (it's a real analysis call). */
      if (!credits.hasCredits) {
        setPaywallOpen(true);
        return;
      }
      /* Push her turn into the conversation immediately so the UI can show
         it before the analysis lands. */
      const herTurn: ConversationTurn = {
        id: turnId(),
        role: "her",
        text: reply,
        screenshots: screenshots.length ? screenshots : undefined,
        ts: Date.now(),
      };
      const nextConvo = [...conversation, herTurn];
      setConversation(nextConvo);
      /* Persist her reply immediately (before the read) so it survives a
         payment redirect even if the analysis call itself trips the paywall. */
      persistMatch(nextConvo, "in_progress", null);

      setIsLoading(true);
      try {
        const result = await analyzeReply(nextConvo, analysis);
        credits.refresh();
        setFollowUp(result);
        /* Persist the read so a resume shows it without spending another hint. */
        persistMatch(nextConvo, "in_progress", result);
        cacheMerge(activeMatchId, { followUp: result });
      } finally {
        setIsLoading(false);
      }
    },
    [analysis, conversation, credits, persistMatch, cacheMerge, activeMatchId]
  );

  /* Her reply is ALREADY the last turn (e.g. after resuming a match) — analyse
     the existing conversation to get reply suggestions, without appending a new
     turn. It's the user's move; this hands them the read. Costs 1 hint. */
  const handleReadReply = useCallback(async () => {
    if (!analysis) return;
    const last = conversation[conversation.length - 1];
    if (!last || last.role !== "her") return;
    if (!credits.hasCredits) {
      setPaywallOpen(true);
      return;
    }
    setIsLoading(true);
    try {
      const result = await analyzeReply(conversation, analysis);
      credits.refresh();
      setFollowUp(result);
      /* Persist the read so resuming this match never re-charges for it. */
      persistMatch(conversation, "in_progress", result);
      cacheMerge(activeMatchId, { followUp: result });
    } finally {
      setIsLoading(false);
    }
  }, [analysis, conversation, credits, persistMatch, cacheMerge, activeMatchId]);

  /* User picked one of the "send instead" suggestions during a follow-up
     loop. Commit it as the user's turn, then clear the analysis so the
     input area comes back, ready for her next reply. */
  const handlePickReply = useCallback(
    (message: GeneratedMessage) => {
      const meTurn: ConversationTurn = {
        id: turnId(),
        role: "me",
        text: message.text,
        ts: Date.now(),
      };
      const next = [...conversation, meTurn];
      setConversation(next);
      setFollowUp(null);
      /* Persist the sent reply so resuming waits for her next reply (read cleared). */
      persistMatch(next, "in_progress", null);
      cacheMerge(activeMatchId, { followUp: null });
    },
    [conversation, persistMatch, cacheMerge, activeMatchId],
  );

  /* User picked one of the URGENT date-invitations — this finalises the
     flow. We commit it, then jump to the date-prep briefing instead of
     looping back to "read her next move". Our work is done. */
  const handleAcceptDateInvite = useCallback(
    (message: GeneratedMessage) => {
      if (!analysis || !activeMatchId) return;
      const meTurn: ConversationTurn = {
        id: turnId(),
        role: "me",
        text: message.text,
        ts: Date.now(),
      };
      const finalConvo = [...conversation, meTurn];
      setConversation(finalConvo);
      setFollowUp(null);
      setStep("datePrep");
      /* Archive: mark this match as closed. */
      upsertMatch({
        id: activeMatchId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        name: analysis.name,
        age: analysis.age,
        status: "asked_out",
        analysis,
        conversation: finalConvo,
        messages,
        followUp: null,
        pickedStyle: currentStyle,
        pickedTone: currentTone,
      });
    },
    [
      analysis,
      activeMatchId,
      conversation,
      messages,
      currentStyle,
      currentTone,
      upsertMatch,
    ],
  );

  const handleClearConversation = useCallback(() => {
    setConversation([]);
    setFollowUp(null);
  }, []);

  const handleBackToMessages = useCallback(() => {
    setStep("messages");
    setFollowUp(null);
    setConversation([]);
  }, []);

  const handleReset = useCallback(() => {
    setStep("upload");
    setAnalysis(null);
    setMessages([]);
    setFollowUp(null);
    setConversation([]);
    setActiveMatch(null);
    setUploadedImages([]);
    setIsLoading(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(RESUME_MATCH_KEY);
    }
  }, [setActiveMatch]);

  /* Resume a saved in-progress match. Restore everything the user left behind,
     pulling the paid openers + uploaded photos from the session cache so they
     land exactly where they were — not bounced back to the analysis recap. */
  const handleResumeMatch = useCallback(
    (match: MatchHistoryEntry) => {
      const cached = sessionCache.current.get(match.id);
      /* Openers: session cache first, then the backend-persisted copy (paid for,
         so they survive a reload). */
      const resumedMessages = cached?.messages?.length
        ? cached.messages
        : match.messages ?? [];
      /* Her-reply read (interest + readiness + date invites + suggestions):
         session cache first, then the backend copy — so a resumed match shows
         what was already paid to generate, no second hint spent. */
      const resumedFollowUp = cached?.followUp ?? match.followUp ?? null;
      setActiveMatch(match.id);
      setAnalysis(match.analysis);
      setConversation(match.conversation);
      setFollowUp(resumedFollowUp);
      setMessages(resumedMessages);
      if (match.pickedStyle) setCurrentStyle(match.pickedStyle);
      if (match.pickedTone) setCurrentTone(match.pickedTone);

      /* Photos: cached data-URLs from this session if we have them, otherwise the
         backend-signed view URLs that arrived with the match — ready right away,
         no extra round-trip, no placeholder flash. */
      const resumedImages = cached?.images?.length ? cached.images : match.imageUrls ?? [];
      setUploadedImages(resumedImages);
      if (resumedImages.length) cacheMerge(match.id, { images: resumedImages });

      /* Land on the furthest point reached: an active dialogue → the follow-up
         loop; already-generated (paid) openers → the messages list; otherwise
         the analysis recap to pick a style + generate. */
      if (match.conversation.length > 0) {
        setStep("followup");
      } else if (resumedMessages.length > 0) {
        setStep("messages");
      } else {
        setStep("analysis");
      }
    },
    [setActiveMatch, cacheMerge],
  );

  return {
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
    /* Live style + tone state for the active match (settings popover). */
    currentStyle,
    currentTone,
    updateActiveMatchSettings,
    updateMatchSettingsById,
    /* id of the match the user is currently working on (null = fresh session) */
    activeMatchId,
    /* Credits + paywall */
    credits: credits.total,
    isAnonymous: credits.isAnonymous,
    paywallOpen,
    closePaywall,
  };
}
