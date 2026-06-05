"use client";

/* ─────────────────────────────────────────────
   Backend JWT storage.

   After Firebase auth we exchange the Firebase ID token for a backend-issued
   JWT (see api.ts authApi.firebaseLogin) and cache it here. apiFetch reads it
   to set the Authorization header. A custom event lets hooks resync on change.
   ───────────────────────────────────────────── */

const KEY = "hintder.backend_jwt";
export const AUTH_TOKEN_EVENT = "hintder:auth-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, token);
  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_EVENT));
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_EVENT));
}
