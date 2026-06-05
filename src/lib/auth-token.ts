"use client";

/* ─────────────────────────────────────────────
   Backend JWT storage.

   After Firebase auth we exchange the Firebase ID token for a backend-issued
   JWT (see api.ts authApi.firebaseLogin) and cache it here. apiFetch reads it
   to set the Authorization header. A custom event lets hooks resync on change.
   ───────────────────────────────────────────── */

const KEY = "hintder.backend_jwt";
export const AUTH_TOKEN_EVENT = "hintder:auth-token";

/* Stable per-browser id, persisted across logout (clearToken never touches it).
   Sent on every Firebase login so the backend grants free hints once per device,
   not once per re-creatable anonymous account. */
const DEVICE_KEY = "hintder.device_id";

export function getDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

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
