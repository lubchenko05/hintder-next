"use client";

import { useEffect, useState } from "react";
import { billingApi, type Subscription } from "@/lib/api";
import { AUTH_TOKEN_EVENT, getToken } from "@/lib/auth-token";

/* ─────────────────────────────────────────────
   useSubscription — the user's live plan (GET /me/subscription), backend-only.

   Refetches on auth changes and after a checkout completes. ``isUnlimited``
   drives the "∞" balance display; ``tierLabel`` is the human plan name.
   ───────────────────────────────────────────── */

const SUBSCRIPTION_REFRESH_EVENT = "subscription:refresh";

export function refreshSubscription(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SUBSCRIPTION_REFRESH_EVENT));
  }
}

const TIER_LABELS: Record<string, string> = {
  lite: "Lite",
  plus: "Plus",
  pro: "Pro",
  ultimate: "Ultimate",
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      if (!getToken()) {
        if (!cancelled) {
          setSubscription(null);
          setReady(true);
        }
        return;
      }
      try {
        const s = await billingApi.subscription();
        if (!cancelled) setSubscription(s);
      } catch {
        if (!cancelled) setSubscription(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    void sync();
    window.addEventListener(AUTH_TOKEN_EVENT, sync);
    window.addEventListener(SUBSCRIPTION_REFRESH_EVENT, sync);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_TOKEN_EVENT, sync);
      window.removeEventListener(SUBSCRIPTION_REFRESH_EVENT, sync);
    };
  }, []);

  const tier = subscription?.tier ?? null;
  return {
    subscription,
    ready,
    isUnlimited: subscription?.is_unlimited ?? false,
    tier,
    tierLabel: tier ? TIER_LABELS[tier] ?? tier : null,
  };
}
