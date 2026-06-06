"use client";

/* ─────────────────────────────────────────────
   Amplitude product analytics. Initialised once at app start (Providers), then
   used to identify users and track funnel events. The API key is public by
   design (it's a client SDK key, like the Firebase web config).

   Events flow through ``/amp`` (rewritten to api2.amplitude.com in
   next.config.ts) so ad-blockers that block the Amplitude domain don't drop
   them. Google Analytics is wired separately via gtag in app/layout.tsx.
   ───────────────────────────────────────────── */

import * as amplitude from "@amplitude/analytics-browser";

const AMPLITUDE_API_KEY = "95e9508e3914abfa276b3731d6780117";

let initialized = false;

export const initAnalytics = (): void => {
  if (initialized || typeof window === "undefined") return;
  amplitude.init(AMPLITUDE_API_KEY, {
    defaultTracking: {
      sessions: true,
      pageViews: true,
      formInteractions: false,
      fileDownloads: false,
    },
    serverUrl: `${window.location.origin}/amp/2/httpapi`,
    identityStorage: "localStorage",
    flushIntervalMillis: 1000,
  });
  initialized = true;
};

export const identifyUser = (
  userId: string,
  properties?: Record<string, unknown>,
): void => {
  amplitude.setUserId(userId);
  if (properties) {
    const identify = new amplitude.Identify();
    Object.entries(properties).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        identify.set(key, value as string | number | boolean);
      }
    });
    amplitude.identify(identify);
  }
};

export const resetUser = (): void => {
  amplitude.reset();
};

export const track = (
  eventName: string,
  properties?: Record<string, unknown>,
): void => {
  amplitude.track(eventName, properties);
};

/* Pre-defined events — keep names stable so dashboards don't drift. */
export const analytics = {
  // Auth / conversion
  signUp: (method: string) => track("Sign Up", { method }),
  login: (method: string) => track("Login", { method }),
  logout: () => track("Logout"),

  // Purchase funnel (what we optimise ad spend against)
  pricingViewed: () => track("Pricing Page Viewed"),
  subscribeClicked: (planId: string) => track("Subscribe Clicked", { planId }),
  checkoutOpened: (planId: string) => track("Checkout Opened", { planId }),
  purchaseCompleted: (props?: { hints?: number }) =>
    track("Purchase Completed", props),

  // Core product
  readCreated: (tone?: string) => track("Read Created", { tone }),
  paywallHit: () => track("Paywall Hit"),

  // Generic
  pageViewed: (pageName: string) => track("Page Viewed", { pageName }),
  errorOccurred: (errorType: string, message: string) =>
    track("Error Occurred", { errorType, message }),
};

export default analytics;
