"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/* ─────────────────────────────────────────────
   PWA install state. Captures the browser's `beforeinstallprompt` event so we
   can trigger the native install dialog from our own UI (a one-time post-auth
   banner + a permanent entry in the account menu). Registers a minimal service
   worker so the event fires on Chrome/Edge/Android.

   iOS Safari does NOT support `beforeinstallprompt`, so `canInstall` simply
   stays false there and nothing is shown (install is manual via the Share menu).
   ───────────────────────────────────────────── */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type InstallOutcome = "accepted" | "dismissed" | "unavailable";

interface InstallContextValue {
  canInstall: boolean;
  installed: boolean;
  promptInstall: () => Promise<InstallOutcome>;
}

const InstallContext = createContext<InstallContextValue>({
  canInstall: false,
  installed: false,
  promptInstall: async () => "unavailable",
});

export const useInstall = (): InstallContextValue => useContext(InstallContext);

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    /* Already running as an installed app → nothing to offer. */
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);

    const w = window as unknown as { __hintderBIP?: BeforeInstallPromptEvent | null };

    /* The inline capture script (app/layout) may have stashed the event before
       React mounted — pick it up now. */
    if (w.__hintderBIP) setDeferred(w.__hintderBIP);

    const onBipReady = () => {
      if (w.__hintderBIP) setDeferred(w.__hintderBIP);
    };
    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); // stash it; we'll trigger the dialog from our UI
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      w.__hintderBIP = null;
    };
    window.addEventListener("hintder:bip", onBipReady);
    window.addEventListener("hintder:installed", onInstalled);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("hintder:bip", onBipReady);
      window.removeEventListener("hintder:installed", onInstalled);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    if (!deferred) return "unavailable";
    const clear = () => {
      setDeferred(null); // the event is single-use
      (window as unknown as { __hintderBIP?: unknown }).__hintderBIP = null;
    };
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      clear();
      return choice.outcome;
    } catch {
      clear();
      return "unavailable";
    }
  }, [deferred]);

  return (
    <InstallContext.Provider
      value={{ canInstall: deferred !== null && !installed, installed, promptInstall }}
    >
      {children}
    </InstallContext.Provider>
  );
}
