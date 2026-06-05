"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EmailAuthProvider,
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
import { authApi } from "@/lib/api";
import { clearToken, setToken } from "@/lib/auth-token";
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
   ───────────────────────────────────────────── */

const EMAIL_FOR_SIGNIN = "hintder.emailForSignIn";

function loadingState(): AuthState {
  return { uid: "loading", isAnonymous: true };
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(loadingState);
  const [ready, setReady] = useState(false);
  /* "backend" = Firebase is fine but our backend didn't authorize. */
  const [error, setError] = useState<"backend" | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(fbAuth, async (fbUser) => {
      if (!fbUser) {
        clearToken();
        /* Bootstrap a real anonymous account — re-fires with the anon user. */
        try {
          await signInAnonymously(fbAuth);
        } catch {
          setAuth({ uid: "anon", isAnonymous: true });
          setReady(true);
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
      try {
        const idToken = await fbUser.getIdToken();
        const { access_token } = await authApi.firebaseLogin(idToken);
        setToken(access_token);
        setAuth({
          uid: fbUser.uid,
          isAnonymous: fbUser.isAnonymous,
          email: fbUser.email ?? undefined,
          provider:
            fbUser.providerData[0]?.providerId ??
            (fbUser.isAnonymous ? "anonymous" : "firebase"),
        });
        setError(null);
      } catch {
        clearToken();
        setAuth({
          uid: fbUser.uid,
          isAnonymous: fbUser.isAnonymous,
          email: fbUser.email ?? undefined,
        });
        setError("backend");
      } finally {
        setReady(true);
      }
    });
    return () => unsub();
  }, []);

  /* Google sign-in via popup. If the current user is anonymous we LINK
     (upgrade, preserving uid + balance); otherwise a plain popup sign-in. If the
     Google account already owns an account, the link fails with
     ``credential-already-in-use`` — we then sign into that existing account with
     the credential Firebase handed back (no second popup). Popup cancellations
     are swallowed.

     IMPORTANT: this opens the popup synchronously (the first ``await`` is the
     popup call itself) so the browser treats it as user-initiated. Don't add an
     ``await`` before ``linkWithPopup`` / ``signInWithPopup``. */
  const signInWithGoogle = useCallback(async () => {
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
        const cred = GoogleAuthProvider.credentialFromError(err as AuthError);
        if (cred) await signInWithCredential(fbAuth, cred);
      } else if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request" ||
        code === "auth/user-cancelled"
      ) {
        /* User dismissed the popup — not an error. */
      } else {
        throw err;
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(fbAuth);
    clearToken();
    /* Hard-navigate home so the workspace unmounts and the URL + in-memory state
       reset — otherwise /app keeps showing the previous user's match. A fresh
       anonymous account is bootstrapped by onAuthStateChanged on the new page. */
    if (typeof window !== "undefined") window.location.assign("/");
  }, []);

  /* Passwordless email sign-in. Sends a one-time link; on return the effect
     above links it to the anon account (or signs in). */
  const sendEmailLink = useCallback(async (email: string, next: string) => {
    const origin = window.location.origin;
    const url = `${origin}/signin?next=${encodeURIComponent(next)}`;
    /* Our backend mints the Firebase magic link and emails it via Brevo (branded,
       from noreply@hintder.ai) instead of Firebase's default sender. */
    await authApi.sendEmailLink(email, url);
    window.localStorage.setItem(EMAIL_FOR_SIGNIN, email);
  }, []);

  return { auth, ready, error, signInWithGoogle, sendEmailLink, signOut };
}
