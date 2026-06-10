"use client";

import { useEffect, useState } from "react";
import { Mark } from "@/components/brand/Mark";
import { useAuth } from "@/hooks/useAuth";
import { useInstall } from "./InstallProvider";

/* One-time install nudge. Shows ONCE, only after the user has a real (signed-in,
   non-anonymous) account and the browser reports the app is installable. After
   it's shown once it never auto-appears again — the install option then lives
   permanently in the account menu (see AccountMenu). */

const SHOWN_KEY = "hintder.installPromptShown";

export function InstallBanner() {
  const { auth, ready } = useAuth();
  const { canInstall, promptInstall } = useInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready || auth.isAnonymous || !canInstall) return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(SHOWN_KEY)) return;
    /* Mark shown immediately so it's a true one-time nudge even if ignored. */
    window.localStorage.setItem(SHOWN_KEY, "1");
    setVisible(true);
  }, [ready, auth.isAnonymous, canInstall]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-sm rounded-2xl p-4 flex items-center gap-3.5 animate-fade-up"
        style={{
          background:
            "linear-gradient(180deg, rgba(25,20,30,0.98), rgba(15,12,20,0.98))",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 24px 50px -20px rgba(0,0,0,0.75)",
        }}
      >
        <span className="shrink-0">
          <Mark size={36} />
        </span>
        <div className="min-w-0 flex-1">
          <div
            className="font-display text-[14px] text-text"
            style={{ fontWeight: 500 }}
          >
            Install hintder
          </div>
          <div
            className="font-display italic text-[12.5px] text-text-secondary leading-snug"
            style={{ fontWeight: 300 }}
          >
            Add it to your home screen — one tap to your wingman.
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setVisible(false)}
            aria-label="Not now"
            className="px-2.5 py-2 rounded-lg font-display italic text-[12.5px] text-text-muted hover:text-text transition-colors"
            style={{ fontWeight: 300 }}
          >
            later
          </button>
          <button
            onClick={async () => {
              await promptInstall();
              setVisible(false);
            }}
            className="px-3.5 py-2 rounded-lg font-display italic text-[13px] text-white transition-transform hover:scale-[1.02] active:scale-95"
            style={{
              background: "linear-gradient(95deg, #FE3C72, #FF8552)",
              boxShadow: "0 10px 24px -10px rgba(254,60,114,0.55)",
              fontWeight: 400,
            }}
          >
            install
          </button>
        </div>
      </div>
    </div>
  );
}
