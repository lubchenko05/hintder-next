"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  type Auth,
} from "firebase/auth";

/* ─────────────────────────────────────────────
   Firebase client init (project: hintder-ai).

   Config comes from NEXT_PUBLIC_FIREBASE_* env vars (the web config is
   public by design). Initialised once and reused — Next.js Fast Refresh
   can re-run this module, so we guard with getApps().
   ───────────────────────────────────────────── */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/* Init is deliberately defensive: this module is imported by the layout tree,
   so ANY throw here (bad/missing config, an unauthorised host, a blocked
   storage API) would crash the client bundle before React hydrates — leaving a
   dead page where nothing is clickable. Failing soft keeps the UI interactive;
   only auth itself degrades. */
let _auth: Auth | null = null;
try {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  _auth = getAuth(app);
} catch (err) {
  console.error("Firebase init failed — auth disabled, app stays interactive", err);
}

export const auth = _auth as Auth;
export const googleProvider = new GoogleAuthProvider();
