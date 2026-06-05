"use client";

import { useCallback, useEffect, useState } from "react";
import { hintsApi, type HintBalance } from "@/lib/api";
import { AUTH_TOKEN_EVENT, getToken } from "@/lib/auth-token";

/* ─────────────────────────────────────────────
   useCredits — hint balance, backend-only (no localStorage, no mocks).

   Balance is server-authoritative (GET /me/hints). MULTIPLE components mount
   useCredits (dashboard + AccountMenu), and a single refreshHints() event wakes
   them all. To avoid N duplicate GET /me/hints requests, the fetch is shared:
   a module-level in-flight promise dedupes concurrent loads, and the result is
   cached so every hook instance reads the same balance.
   ───────────────────────────────────────────── */

const HINTS_REFRESH_EVENT = "hints:refresh";

let sharedCache: HintBalance | null = null;
let inFlight: Promise<HintBalance | null> | null = null;

function loadShared(): Promise<HintBalance | null> {
  if (!getToken()) {
    sharedCache = null;
    return Promise.resolve(null);
  }
  /* Reuse the in-flight request so simultaneous subscribers hit the network once. */
  if (!inFlight) {
    inFlight = hintsApi
      .balance()
      .then((b) => {
        sharedCache = b;
        return b;
      })
      .catch(() => {
        sharedCache = null;
        return null;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export function refreshHints(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(HINTS_REFRESH_EVENT));
  }
}

function optimisticSpend(b: HintBalance): HintBalance {
  const total = Math.max(0, b.total_hints - 1);
  if (b.free_hints > 0) return { ...b, free_hints: b.free_hints - 1, total_hints: total };
  if (b.sub_hints > 0) return { ...b, sub_hints: b.sub_hints - 1, total_hints: total };
  if (b.paid_hints > 0) return { ...b, paid_hints: b.paid_hints - 1, total_hints: total };
  return b;
}

export function useCredits() {
  const [balance, setBalance] = useState<HintBalance | null>(sharedCache);
  const [authed, setAuthed] = useState<boolean>(!!getToken());

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      setAuthed(!!getToken());
      const b = await loadShared();
      if (!cancelled) setBalance(b);
    };
    void sync();
    window.addEventListener(AUTH_TOKEN_EVENT, sync);
    window.addEventListener(HINTS_REFRESH_EVENT, sync);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_TOKEN_EVENT, sync);
      window.removeEventListener(HINTS_REFRESH_EVENT, sync);
    };
  }, []);

  const consume = useCallback(() => {
    setBalance((prev) => (prev ? optimisticSpend(prev) : prev));
    hintsApi
      .consume()
      .then((b) => {
        sharedCache = b;
        setBalance(b);
      })
      .catch(() => {
        void loadShared().then(setBalance);
      });
  }, []);

  const total = balance?.total_hints ?? 0;
  const hasCredits = total > 0;
  const isAnonymous = !authed;
  /* Has the user started using hints? (used to hide the free pricing tier) */
  const hasUsedHints = balance ? balance.free_hints < 3 || balance.paid_hints > 0 : false;

  return {
    total,
    hasCredits,
    isAnonymous,
    hasUsedHints,
    consume,
    refresh: refreshHints,
  };
}
