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

/** Events that happened before the pixel script finished loading.
 *
 *  The pixel loads afterInteractive, so it is NOT there during hydration. A
 *  Google sign-in comes back through a full page load and fires "Sign Up" from
 *  the auth listener — which can easily win that race. Dropping the event then
 *  loses the one conversion the ad campaign optimises against, silently, which
 *  is exactly what happened on the first campaign: zero CompleteRegistration
 *  events ever reached Meta. */
const pending: [string, Record<string, unknown> | undefined, string | undefined][] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function dispatch(
  f: Fbq,
  eventName: string,
  properties?: Record<string, unknown>,
  /* Matches the id the backend used when it reported the same event through
     the Conversions API, so Meta counts one conversion instead of two. */
  eventId?: string,
): void {
  const standard = STANDARD[eventName];
  const options = eventId ? { eventID: eventId } : undefined;
  if (standard) {
    f("track", standard, properties ?? {}, options);
  } else {
    f("trackCustom", eventName.replace(/\s+/g, ""), properties ?? {}, options);
  }
}

/** Poll briefly for the pixel, then give up — a blocked pixel never arrives and
 *  we must not keep a timer alive for the life of the tab. */
function startFlushing(): void {
  if (flushTimer !== null) return;
  let waited = 0;
  flushTimer = setInterval(() => {
    const f = fbq();
    waited += 300;
    if (f) {
      while (pending.length) {
        const next = pending.shift();
        if (next) {
          try {
            dispatch(f, next[0], next[1], next[2]);
          } catch {
            /* keep draining the rest */
          }
        }
      }
    }
    if (f || waited >= 15000) {
      if (flushTimer !== null) clearInterval(flushTimer);
      flushTimer = null;
      if (!f) pending.length = 0;
    }
  }, 300);
}

/** Mirror one funnel event into the pixel. Never throws: an ad-blocked or
 *  not-yet-loaded pixel must not break the product action that triggered it. */
export function metaTrack(
  eventName: string,
  properties?: Record<string, unknown>,
  eventId?: string,
): void {
  if (typeof window === "undefined" || IGNORED.has(eventName)) return;
  const f = fbq();
  if (!f) {
    pending.push([eventName, properties, eventId]);
    startFlushing();
    return;
  }
  try {
    dispatch(f, eventName, properties, eventId);
  } catch {
    /* Reporting is never worth a broken page. */
  }
}
