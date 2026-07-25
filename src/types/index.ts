export type MessageStyle =
  | "funny"
  | "confident"
  | "calm"
  | "flirty"
  | "smart"
  | "short"
  | "less-cringe";

export type MessageTone = "natural" | "bolder" | "safer";

export type MessageCategory =
  | "best"
  | "safe"
  | "funny"
  | "flirty"
  | "short"
  | "risky";

export interface ProfileHook {
  topic: string;
  why: string;
}

export interface DateAngle {
  /** A 1-3 word date concept ("rooftop ramen", "vinyl crawl"). */
  title: string;
  /** Why it fits this specific profile. */
  why: string;
}

export interface PreviewOpener {
  /** Voice (MessageStyle) this preview is written in. */
  voice: string;
  /** Risk level (MessageTone) this preview is tuned to. */
  risk: string;
  /** The ready-to-send opener line. */
  text: string;
}

export interface PhotoSnapshot {
  /** Short caption ("Bali beach", "Cat on couch"). */
  caption: string;
  /** Vibe descriptors ("relaxed, natural, no filters"). */
  vibe: string;
  /** Tags pulled from the photo. */
  tags: string[];
  /** What this photo unlocks in a conversation. */
  unlocks: string;
  /** Visual palette for the placeholder card art. */
  g1: string;
  g2: string;
  /** Pattern variant 0-3 to vary the abstract art. */
  art: number;
}

export interface ProfileAnalysis {
  name: string;
  age: number;
  vibe: string;
  hooks: ProfileHook[];
  avoid: string[];
  angle: "humor" | "curiosity" | "calm" | "flirty";
  interests: string[];
  /** Rich, structured photo report — each photo becomes a card. */
  photoContext: PhotoSnapshot[];
  /** Inferred personality / "cosmic" read — a playful but specific snapshot. */
  cosmicRead?: string;
  /** Suggested first-date concepts tuned to her profile signals. */
  dateAngles?: DateAngle[];
  /** When she's likely most responsive, inferred from lifestyle cues. */
  timingWindow?: string;
  /** A short list of conversation topics that should land. */
  greenLightTopics?: string[];
  /** Dense free-text read of everything the model saw — carried forward as the
      context for openers/replies (so screenshots are never re-sent). */
  detailedRead?: string;
  /** One free opener per voice × risk — the StylePicker preview matrix. */
  previews?: PreviewOpener[];
  /** gs:// URIs of the uploaded screenshots (kept 30 days). Not directly
      displayable — exchange for signed view URLs via readsApi.signImages. */
  imageUrls?: string[];
}

export interface GeneratedMessage {
  id: string;
  text: string;
  category: MessageCategory;
  label: string;
  cringeRisk: number; // 0-100
  tone: string;
  /** Coach line — one short "why this lands", revealed on demand. */
  whyItWorks?: string;
}

export interface FollowUpAnalysis {
  interestLevel: "high" | "medium" | "low" | "unclear";
  tone: string;
  shouldPush: boolean;
  suggestion: string;
  nextMessages: GeneratedMessage[];
  doNotSend: string;
  /** 0-100 — how appropriate it is to ask her out RIGHT NOW. */
  dateReadiness: number;
  /** Short rationale matching the readiness score. */
  dateReadinessNote: string;
  /** Surfaced only when readiness clears the threshold (~65+). */
  dateRecommendations?: DateAngle[];
  /** When readiness >= 90, proactive ready-to-send date invitations,
      each tied to a specific date angle. */
  dateInvites?: GeneratedMessage[];
  /** When readiness >= 90, a short warning that the window is closing. */
  urgencyWarning?: string;
}

/** Track 4 — a decode of one message from her. */
export interface DecodeResult {
  meaning: string;
  interestLevel: "high" | "medium" | "low" | "unclear";
  mood: string;
  losingInterest: boolean;
  move: string;
  avoid: string;
}

/** Track 4 — feedback on one of the user's OWN profile photos. */
export interface PhotoFeedback {
  slot: number;
  verdict: "keep" | "lead" | "cut" | "move";
  note: string;
}

/** Track 4 — a review of the user's OWN dating profile. */
export interface ProfileOptimizeResult {
  score: number;
  firstImpression: string;
  bioRewrites: string[];
  photoFeedback: PhotoFeedback[];
  topFixes: string[];
}

export interface ConversationTurn {
  id: string;
  role: "me" | "her";
  text: string;
  /** Up to 5 image data-URLs (screenshots of the chat chunk). */
  screenshots?: string[];
  ts: number;
}

export type AppStep =
  | "upload"
  | "analyzing"
  | "analysis"
  | "style"
  | "messages"
  | "followup"
  | "datePrep";

export interface CreditBalance {
  credits: number;
  isPremium: boolean;
}

export type MatchStatus = "in_progress" | "asked_out";

export interface MatchHistoryEntry {
  /** Stable id for routing/storage. */
  id: string;
  createdAt: number;
  updatedAt: number;
  /** From the original profile analysis. */
  name: string;
  age: number;
  /** Status: still working on it vs. closed by sending the date ask. */
  status: MatchStatus;
  /** Snapshot of the parsed profile, used for read-only viewer. */
  analysis: ProfileAnalysis;
  /** Full conversation history at the time of saving. */
  conversation: ConversationTurn[];
  /** The generated openers the user paid for (persisted so a resumed match
      keeps them — they can't be regenerated for free). */
  messages?: GeneratedMessage[];
  /** The last read of her reply (interest, readiness, date invites, suggestions)
      — persisted so a resumed match shows what was already paid to generate. */
  followUp?: FollowUpAnalysis | null;
  /** The picked style + tone (if known) for context in the viewer. */
  pickedStyle?: MessageStyle;
  pickedTone?: MessageTone;
  /** Ready-to-display signed view URLs for the screenshots, computed by the
      backend on read. Display-only — never sent back on upsert. */
  imageUrls?: string[];
}

export interface AuthState {
  /** Stable per-device id (anonymous auth uid in real impl). */
  uid: string;
  /** True until the user links an email or OAuth. */
  isAnonymous: boolean;
  email?: string;
  provider?: "google" | "email-link";
}

export interface PricingTier {
  name: string;
  price: string;
  credits: number;
  popular?: boolean;
  description: string;
}
