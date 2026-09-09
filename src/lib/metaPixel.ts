/* ─────────────────────────────────────────────
   Meta pixel bridge.

   The pixel ID is public by design — it ships in the page source of every site
   that runs one, exactly like the Amplitude key next door.

   Nothing here calls fbq directly from feature code. The funnel already flows
   through analytics.track(), so the mapping lives in one place: add an event
   there and it reaches Amplitude, GA and Meta together, instead of drifting
   apart the first time someone forgets one of the three.
   ───────────────────────────────────────────── */

export const META_PIXEL_ID = "1042798338759311";

/** Our event names → Meta's standard events.
 *
 *  Standard events are what campaign optimisation can bid on; anything not
 *  listed here is sent as a custom event, which still shows up in Events
 *  Manager but is a weaker optimisation target. */
const STANDARD: Record<string, string> = {
  "Sign Up": "CompleteRegistration",
  "Read Created": "Lead",
  "Pricing Page Viewed": "ViewContent",
  "Checkout Opened": "InitiateCheckout",
  "Purchase Completed": "Purchase",
};

/** Events that say nothing about intent and would only add noise. */
const IGNORED = new Set(["Page Viewed", "Login", "Logout", "Error Occurred"]);

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[] };

function fbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { fbq?: Fbq }).fbq ?? null;
}

/** Mirror one funnel event into the pixel. Never throws: an ad-blocked or
 *  not-yet-loaded pixel must not break the product action that triggered it. */
export function metaTrack(eventName: string, properties?: Record<string, unknown>): void {
  const f = fbq();
  if (!f || IGNORED.has(eventName)) return;
  try {
    const standard = STANDARD[eventName];
    if (standard) {
      f("track", standard, properties ?? {});
    } else {
      f("trackCustom", eventName.replace(/\s+/g, ""), properties ?? {});
    }
  } catch {
    /* Reporting is never worth a broken page. */
  }
}
