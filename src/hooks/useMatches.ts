"use client";

import { useCallback, useEffect, useState } from "react";
import { matchesApi } from "@/lib/api";
import { AUTH_TOKEN_EVENT, getToken } from "@/lib/auth-token";
import type { MatchHistoryEntry } from "@/types";

/* ─────────────────────────────────────────────
   useMatches — the match archive, backed by the backend (no localStorage).

   The list lives in the DB (GET /matches). Mutations PUT/DELETE and then fire
   a window event so every mounted instance (app page + useAppFlow) refetches
   and stays in sync. Optimistic local updates keep the UI snappy.
   ───────────────────────────────────────────── */

const MATCHES_EVENT = "matches:updated";

function broadcast(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MATCHES_EVENT));
  }
}

export function useMatches() {
  const [matches, setMatches] = useState<MatchHistoryEntry[]>([]);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setMatches([]);
      return;
    }
    try {
      setMatches(await matchesApi.list());
    } catch {
      setMatches([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener(MATCHES_EVENT, onChange);
    window.addEventListener(AUTH_TOKEN_EVENT, onChange);
    return () => {
      window.removeEventListener(MATCHES_EVENT, onChange);
      window.removeEventListener(AUTH_TOKEN_EVENT, onChange);
    };
  }, [refresh]);

  const upsertMatch = useCallback((entry: MatchHistoryEntry) => {
    /* Optimistic: reflect locally now, persist + broadcast in the background. */
    setMatches((prev) => [entry, ...prev.filter((m) => m.id !== entry.id)]);
    matchesApi
      .upsert(entry)
      .then(broadcast)
      .catch(broadcast);
  }, []);

  const removeMatch = useCallback((id: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== id));
    matchesApi.remove(id).then(broadcast).catch(broadcast);
  }, []);

  const getMatch = useCallback(
    (id: string) => matches.find((m) => m.id === id),
    [matches],
  );

  return { matches, upsertMatch, removeMatch, getMatch, refresh };
}
