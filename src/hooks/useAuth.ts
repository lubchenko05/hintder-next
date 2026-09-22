"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailLink,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import type { AuthError } from "firebase/auth";
import { auth as fbAuth } from "@/lib/firebase";
import { authApi, meApi } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/auth-token";
import { analytics, identifyUser, initAnalytics, resetUser } from "@/lib/analytics";
import type { AuthState } from "@/types";

/* ─────────────────────────────────────────────
   useAuth — anonymous-first, backend-controlled.

   On first load (no user) we sign in ANONYMOUSLY: Firebase mints an anon uid,
   the backend creates a real User row for it with the free-hint grant, and the
   whole balance/spend is server-controlled. Signing in with Google/email LINKS
   that anonymous account → the Firebase uid stays the same → the backend row
   (and its balance + history) is preserved, no merge needed.

   Google sign-in uses a POPUP (``linkWithPopup`` / ``signInWithPopup``). The
   popup loads ``hintder-ai.firebaseapp.com/__/auth/handler`` in its own window —
   that window is first-party, so it works on localhost (unlike redirect, where
   the handler runs in a partitioned third-party context and never returns a
   result). To dodge popup blockers, ``signInWithGoogle`` opens the popup
   SYNCHRONOUSLY inside the click handler (no awaits before it). Email uses
   passwordless links.

   ONE listener for the whole app. This used to be a plain hook holding its own
   useState and its own onAuthStateChanged, and nine components call it — so a
   single page mounted four or five copies, each racing to exchange the same
   Firebase token for a backend JWT. Production logs showed one uid arriving
   three times inside 31ms; the losers collided on the users primary key and
   the endpoint answered 500 for a fifth of all sign-ins. The server no longer
   breaks when that happens, but the duplicates were never meant to exist:
   every extra copy also re-ran signInAnonymously, initAnalytics and the
   anonymous-asset claim. The state now lives once, on the module, and the
   hook is a subscription to it.
   ───────────────────────────────────────────── */

const EMAIL_FOR_SIGNIN = "hintder.emailForSignIn";

function loadingState(): AuthState {
  return { uid: "loading", isAnonymous: true };
}

/* Firebase's providerId ("google.com", "password", "emailLink") is not the
   vocabulary the rest of the app uses; translate once here so AuthState says
   what it means. */
function providerOf(fbUser: {
  isAnonymous: boolean;
  providerData: { providerId: string }[];
}): AuthState["provider"] {
  if (fbUser.isAnonymous) return "anonymous";
  return fbUser.providerData[0]?.providerId === "google.com" ? "google" : "email-link";
}

/* Message for when an email already has an account via a different sign-in
   method — tells the user which one to use instead of failing silently. */
function accountExistsNotice(methods: string[]): string {
  if (methods.includes("google.com")) {
    return "This email already has a Google account. Use “Continue with Google”.";
  }
  if (methods.includes("emailLink") || methods.includes("password") || methods.includes("emaillink")) {
    return "This email already has an account. Use “Continue with email” to sign in.";
  }
  return "This email already has an account — please sign in with the method you used originally.";
}

/* ── the single shared store ──────────────────────────────────────────── */

type Snapshot = {
  auth: AuthState;
  ready: boolean;
  /* "backend" = Firebase is fine but our backend didn't authorize. */
  error: "backend" | null;
  /* User-facing sign-in notice, e.g. "this email is registered via another method". */
  notice: string | null;
};

const INITIAL: Snapshot = {
  auth: loadingState(),
  ready: false,
  error: null,
  notice: null,
};

let snapshot: Snapshot = INITIAL;
/* Frozen and separate from `snapshot`: useSyncExternalStore compares by
   reference, and handing it a value that later mutates would tear the render. */
const SERVER_SNAPSHOT: Snapshot = INITIAL;

const listeners = new Set<() => void>();

function update(patch: Partial<Snapshot>): void {
  snapshot = { ...snapshot, ...patch };
  for (const listener of listeners) listener();
}

function getSnapshot(): Snapshot {
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

/* Tracks the previous user's anonymity so we can detect an anon→permanent
   transition and claim the anon's assets (post-payment sign-in). */
let wasAnonymous: boolean | null = null;
let started = false;

function start(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  onAuthStateChanged(fbAuth, async (fbUser) => {
    if (!fbUser) {
      clearToken();
      /* Bootstrap a real anonymous account — re-fires with the anon user. */
      try {
        await signInAnonymously(fbAuth);
      } catch (err) {
        /* Firebase could not create or persist a session — private browsing,
           blocked site data, Safari's storage rules, a full disk. Whatever
           the cause, this visitor is now in a dead state: no anonymous user
           means no backend JWT, so nothing in the product works for them.

           This used to be a bare `catch {}`. The page simply sat there
           showing zero hints with a clean console, so we had no way of
           knowing it was happening — to anyone, at any volume. Paid traffic
           can die here without leaving a trace. */
        const code = (err as AuthError)?.code ?? "unknown";
        console.error("[auth] anonymous bootstrap failed:", code, err);
        /* Amplitude has not been initialised yet — that only happens once
           auth resolves, which is exactly what just failed. Without this the
           event would sit in the SDK's pre-init queue and never be sent, so
           the report we came here for would be lost. */
        initAnalytics();
        analytics.errorOccurred("auth_bootstrap_failed", code);
        update({ auth: { uid: "anon", isAnonymous: true }, ready: true });
      }
      return;
    }

    /* Arrived via an email sign-in link → upgrade the anon account (keep
       uid + balance) or, if that email already owns an account, sign in. */
    if (
      typeof window !== "undefined" &&
      isSignInWithEmailLink(fbAuth, window.location.href)
    ) {
      const pendingEmail = window.localStorage.getItem(EMAIL_FOR_SIGNIN);
      if (pendingEmail) {
        window.localStorage.removeItem(EMAIL_FOR_SIGNIN);
        const cred = EmailAuthProvider.credentialWithLink(
          pendingEmail,
          window.location.href,
        );
        try {
          if (fbUser.isAnonymous) {
            await linkWithCredential(fbUser, cred);
          } else {
            await signInWithEmailLink(fbAuth, pendingEmail, window.location.href);
          }
          return; // re-fires with the now-permanent user
        } catch {
          await signInWithEmailLink(fbAuth, pendingEmail, window.location.href).catch(
            () => undefined,
          );
          return;
        }
      }
    }

    /* Exchange this user (anon OR permanent) for a backend JWT. */
    const wasAnon = wasAnonymous;
    const prevToken = getToken(); // current (maybe anon) JWT, before we overwrite it
    wasAnonymous = fbUser.isAnonymous;
    /* Initialise Amplitude WITH this uid the first time auth resolves (anon or
       permanent). The uid is stable across the anon→permanent link, so events
       carry one identity from the start — no device-only user that later splits
       from the identified one. Idempotent after the first call. */
    initAnalytics(fbUser.uid);
    try {
      const idToken = await fbUser.getIdToken();
      const login = await authApi.firebaseLogin(idToken);
      setToken(login.access_token);
      /* Anon → permanent transition: bring the anonymous account's subscription
         + hints to the now-permanent account. Server no-ops if the uid was
         preserved (linking); transfers if the user signed into an existing
         account (uid changed). Authed as the NEW user; proof = the anon JWT. */
      if (wasAnon === true && !fbUser.isAnonymous && prevToken) {
        void meApi.claim(prevToken).catch(() => undefined);
      }
      /* Analytics: identify permanent users, and report the sign-up — the
         conversion the ad spend is optimised against.

         The server decides whether this was a registration, not us. We used
         to infer it from an in-memory "was anonymous a moment ago" flag,
         which is only ever true when the upgrade happens inside one page
         session. A magic-link sign-in arrives on a cold load from the mail
         app, so the flag was null and the event was silently skipped — which
         is why real registrations never showed up in Meta. */
      if (!fbUser.isAnonymous) {
        identifyUser(fbUser.uid, { email: fbUser.email ?? undefined });
        if (login.registered) {
          const method =
            fbUser.providerData[0]?.providerId === "google.com" ? "google" : "email";
          analytics.signUp(method, login.registration_event_id ?? undefined);
        }
      }
      update({
        auth: {
          uid: fbUser.uid,
          isAnonymous: fbUser.isAnonymous,
          email: fbUser.email ?? undefined,
          provider: providerOf(fbUser),
        },
        error: null,
        ready: true,
      });
    } catch {
      clearToken();
      update({
        auth: {
          uid: fbUser.uid,
          isAnonymous: fbUser.isAnonymous,
          email: fbUser.email ?? undefined,
        },
        error: "backend",
        ready: true,
      });
    }
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  /* Only ever attaches one Firebase listener, however many components mount. */
  start();
  return () => {
    listeners.delete(listener);
  };
}

/* ── actions ──────────────────────────────────────────────────────────── */

/* Google sign-in via popup. If the current user is anonymous we LINK
   (upgrade, preserving uid + balance); otherwise a plain popup sign-in. If the
   Google account already owns an account, the link fails with
   ``credential-already-in-use`` — we then sign into that existing account with
   the credential Firebase handed back (no second popup). Popup cancellations
   are swallowed.

   IMPORTANT: this opens the popup synchronously (the first ``await`` is the
   popup call itself) so the browser treats it as user-initiated. Don't add an
   ``await`` before ``linkWithPopup`` / ``signInWithPopup``. */
async function signInWithGoogle(): Promise<void> {
  update({ notice: null });
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cur = fbAuth.currentUser;
  try {
    if (cur && cur.isAnonymous) {
      await linkWithPopup(cur, provider);
    } else {
      await signInWithPopup(fbAuth, provider);
    }
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === "auth/credential-already-in-use") {
      /* Same email already has a Google account — sign into it. */
      const cred = GoogleAuthProvider.credentialFromError(err as AuthError);
      if (cred) await signInWithCredential(fbAuth, cred);
    } else if (
      code === "auth/email-already-in-use" ||
      code === "auth/account-exists-with-different-credential"
    ) {
      /* The email already has an account via a DIFFERENT method — we can't
         silently merge; tell the user which method to use. */
      const email = (err as { customData?: { email?: string } })?.customData?.email;
      let methods: string[] = [];
      if (email) {
        try {
          methods = await fetchSignInMethodsForEmail(fbAuth, email);
        } catch {
          /* ignore — fall back to the generic message */
        }
      }
      update({ notice: accountExistsNotice(methods) });
    } else if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request" ||
      code === "auth/user-cancelled"
    ) {
      /* User dismissed the popup — not an error. */
    } else {
      update({ notice: "Couldn't sign in with Google. Please try again." });
    }
  }
}

async function signOut(): Promise<void> {
  analytics.logout();
  resetUser();
  await fbSignOut(fbAuth);
  clearToken();
  /* Hard-navigate home so the workspace unmounts and the URL + in-memory state
     reset — otherwise /app keeps showing the previous user's match. A fresh
     anonymous account is bootstrapped by onAuthStateChanged on the new page. */
  if (typeof window !== "undefined") window.location.assign("/");
}

/* Passwordless email sign-in. Sends a one-time link; on return the listener
   above links it to the anon account (or signs in). */
async function sendEmailLink(email: string, next: string): Promise<void> {
  const origin = window.location.origin;
  const url = `${origin}/signin?next=${encodeURIComponent(next)}`;
  /* Our backend mints the Firebase magic link and emails it via Brevo (branded,
     from noreply@hintder.ai) instead of Firebase's default sender. */
  await authApi.sendEmailLink(email, url);
  window.localStorage.setItem(EMAIL_FOR_SIGNIN, email);
}

/* ── the hook ─────────────────────────────────────────────────────────── */

export function useAuth() {
  const { auth, ready, error, notice } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const clearNotice = useCallback(() => update({ notice: null }), []);

  return { auth, ready, error, notice, clearNotice, signInWithGoogle, sendEmailLink, signOut };
}
