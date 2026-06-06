"use client";

import { clearToken, getDeviceId, getToken } from "@/lib/auth-token";
import type {
  FollowUpAnalysis,
  GeneratedMessage,
  MatchHistoryEntry,
  ProfileAnalysis,
} from "@/types";

/* ─────────────────────────────────────────────
   Typed backend client.

   Every call goes through apiFetch(), which injects the backend JWT,
   serialises JSON, and maps non-2xx responses to ApiError. Endpoints are
   grouped into namespaces mirroring the FastAPI routers.
   ───────────────────────────────────────────── */

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010";
const API = `${BASE}/api/v1`;

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, detail: unknown) {
    super(typeof detail === "string" ? detail : `Request failed (${status})`);
    this.status = status;
    this.detail = detail;
  }
}

async function apiFetch<T>(
  path: string,
  opts: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Stale/expired backend JWT — drop it so the app re-authenticates.
    clearToken();
  }

  if (!res.ok) {
    let detail: unknown = null;
    try {
      detail = (await res.json())?.detail ?? null;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ── Response types (mirror the backend serializers) ──────────────────── */

export interface ApiUser {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  free_hints: number;
  paid_hints: number;
  total_hints: number;
  created_at: string;
}

export interface HintBalance {
  free_hints: number;
  sub_hints: number;
  paid_hints: number;
  total_hints: number;
}

export interface Plan {
  id: string;
  tier: string;
  label: string;
  billing_interval: "month" | "year";
  price_usd: number;
  hints_per_cycle: number;
  is_unlimited: boolean;
  /** Paddle price id to open checkout with (null until Paddle is configured). */
  paddle_price_id?: string | null;
}

export interface Subscription {
  id: string;
  tier: string;
  billing_interval: "month" | "year";
  status: string;
  is_unlimited: boolean;
  hints_per_cycle: number;
  cap: number;
  current_period_end: string | null;
  paid_until: string | null;
  cancel_at_period_end: boolean;
  scheduled_plan_id: string | null;
}

export interface HintPack {
  id: string;
  label: string;
  hints: number;
  price_usd: number;
  original_price_usd: number | null;
}

export interface CheckoutSession {
  transaction_id: string;
  checkout_url: string;
  hints: number;
  price_usd: number;
  is_mock: boolean;
}

export type LegalSlug = "terms-of-service" | "privacy-policy" | "refund-policy";

export interface LegalDocument {
  content: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/* ── Namespaces ───────────────────────────────────────────────────────── */

export const authApi = {
  /** Exchange a Firebase ID token for a backend JWT. */
  firebaseLogin: (idToken: string) =>
    apiFetch<{ access_token: string; token_type: string }>("/auth/firebase", {
      method: "POST",
      body: { token: idToken, device_id: getDeviceId() },
      auth: false,
    }),
  /** Send a branded passwordless sign-in link (backend mints it + emails via Brevo). */
  sendEmailLink: (email: string, continueUrl: string) =>
    apiFetch<void>("/auth/email-link", {
      method: "POST",
      body: { email, continue_url: continueUrl },
      auth: false,
    }),
};

export const meApi = {
  get: () => apiFetch<ApiUser>("/me"),
  /** Move a just-abandoned anonymous account's subscription + hints to this user
      (post-payment 'pay anon, sign in after' flow). prevToken = the anon's JWT. */
  claim: (prevToken: string) =>
    apiFetch<void>("/me/claim", { method: "POST", body: { prev_token: prevToken } }),
};

export const hintsApi = {
  balance: () => apiFetch<HintBalance>("/me/hints"),
  consume: (kind = "profile_read") =>
    apiFetch<HintBalance>("/hints/consume", { method: "POST", body: { kind } }),
  history: (limit = 20, offset = 0) =>
    apiFetch<Paginated<Record<string, unknown>>>(
      `/me/hints/history?limit=${limit}&offset=${offset}`,
    ),
};

export const readsApi = {
  /** Read profile screenshots (base64) into a structured analysis. */
  analyze: (images: string[], context?: string | null) =>
    apiFetch<ProfileAnalysis>("/reads/analyze", {
      method: "POST",
      body: { images, context: context ?? null },
    }),
  /** Draft five openers in a chosen voice/risk for an analysed profile. */
  messages: (analysis: ProfileAnalysis, style: string, tone: string) =>
    apiFetch<GeneratedMessage[]>("/reads/messages", {
      method: "POST",
      body: { analysis, style, tone },
    }),
  /** Read her latest reply and recommend the next move. */
  reply: (
    conversation: { role: string; text: string }[],
    analysis: ProfileAnalysis,
  ) =>
    apiFetch<FollowUpAnalysis>("/reads/reply", {
      method: "POST",
      body: { conversation, analysis },
    }),
  /** Rewrite one message per a freeform instruction. */
  tweak: (messageText: string, instruction: string, tone: string) =>
    apiFetch<GeneratedMessage>("/reads/tweak", {
      method: "POST",
      body: { message_text: messageText, instruction, tone },
    }),
  /** Exchange a saved match's gs:// screenshot URIs for short-lived view URLs. */
  signImages: (uris: string[]) =>
    apiFetch<string[]>("/reads/signed-urls", {
      method: "POST",
      body: { uris },
    }),
};

export const matchesApi = {
  /** The user's match archive, newest first. */
  list: () => apiFetch<MatchHistoryEntry[]>("/matches"),
  /** Create or replace a match. Conversation screenshots are stripped (transient). */
  upsert: (entry: MatchHistoryEntry) => {
    /* imageUrls are backend-computed signed view URLs (display-only); strip so
       they never round-trip into the PUT body (the validator forbids extras). */
    const { id, conversation, imageUrls: _imageUrls, ...rest } = entry;
    void _imageUrls;
    const body = {
      ...rest,
      conversation: conversation.map((t) => ({
        id: t.id,
        role: t.role,
        text: t.text,
        ts: t.ts,
      })),
    };
    return apiFetch<MatchHistoryEntry>(`/matches/${id}`, { method: "PUT", body });
  },
  /** Permanently delete a match. */
  remove: (id: string) =>
    apiFetch<void>(`/matches/${id}`, { method: "DELETE" }),
};

export const billingApi = {
  /** Subscription plan catalogue (4 tiers × month/year). */
  plans: () => apiFetch<Plan[]>("/billing/plans", { auth: false }),
  /** One-time top-up packs (overflow). */
  packs: () => apiFetch<HintPack[]>("/billing/packs", { auth: false }),
  /** Start a subscription checkout for a plan. */
  subscribe: (planId: string) =>
    apiFetch<CheckoutSession>("/billing/subscribe", {
      method: "POST",
      body: { plan_id: planId },
    }),
  /** Start a one-time top-up checkout. */
  checkout: (packId: string) =>
    apiFetch<CheckoutSession>("/billing/checkout", {
      method: "POST",
      body: { pack_id: packId },
    }),
  mockComplete: (transactionId: string) =>
    apiFetch<{ balance: HintBalance }>("/billing/mock/complete", {
      method: "POST",
      body: { transaction_id: transactionId },
    }),
  /** The user's live subscription, or null. */
  subscription: () => apiFetch<Subscription | null>("/me/subscription"),
  /** Upgrade (immediate) or downgrade/switch (scheduled next cycle). */
  changePlan: (planId: string) =>
    apiFetch<Subscription>("/billing/change-plan", {
      method: "POST",
      body: { plan_id: planId },
    }),
  /** Schedule cancellation at period end (keeps hints, plan stays active). */
  cancel: () => apiFetch<Subscription>("/billing/cancel", { method: "POST" }),
};

export const legalApi = {
  /** Fetch a legal document's markdown (terms / privacy / refund). */
  doc: (slug: LegalSlug) =>
    apiFetch<LegalDocument>(`/legal/${slug}`, { auth: false }),
};
