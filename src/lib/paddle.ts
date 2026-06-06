"use client";

import { initializePaddle, type Paddle } from "@paddle/paddle-js";

/* ─────────────────────────────────────────────
   Paddle.js (Billing) overlay checkout.

   The client token + environment are public (NEXT_PUBLIC). When they're absent,
   paddleConfigured() is false and the app falls back to the mock checkout. The
   instance is initialised once and reused.
   ───────────────────────────────────────────── */

const TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const ENV = (process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox") as
  | "sandbox"
  | "production";

let paddlePromise: Promise<Paddle | undefined> | null = null;

export function paddleConfigured(): boolean {
  return !!TOKEN;
}

export function getPaddle(): Promise<Paddle | undefined> {
  if (typeof window === "undefined" || !TOKEN) return Promise.resolve(undefined);
  if (!paddlePromise) {
    paddlePromise = initializePaddle({ token: TOKEN, environment: ENV });
  }
  return paddlePromise;
}

/** Open the Paddle overlay for a subscription. customData ties the resulting
    Paddle subscription back to our user (the webhook reads uid + plan_id). */
export async function openSubscriptionCheckout(opts: {
  priceId: string;
  uid: string;
  planId: string;
  email?: string;
}): Promise<boolean> {
  const paddle = await getPaddle();
  if (!paddle) return false;
  paddle.Checkout.open({
    items: [{ priceId: opts.priceId, quantity: 1 }],
    ...(opts.email ? { customer: { email: opts.email } } : {}),
    customData: { uid: opts.uid, plan_id: opts.planId },
    settings: {
      successUrl: `${window.location.origin}/checkout/success?kind=sub`,
    },
  });
  return true;
}
