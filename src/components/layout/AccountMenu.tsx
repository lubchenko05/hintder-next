"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   AccountMenu — the SINGLE signed-in control. Everything lives under the user
   avatar: hint balance + top-up, navigation, an optional primary CTA (e.g.
   "Open app"), and sign out. Shared by the marketing header and the dashboard.

   - `navItems`     extra links shown in the dropdown (Guides / Stories / …).
   - `primary`      a highlighted CTA pinned near the top of the menu.
   - `inlineHints`  also show the hint COUNT next to the avatar (dashboard, where
                    the balance must stay glanceable). Top-up still lives in the
                    menu, so the avatar stays the only interactive menu.
   ───────────────────────────────────────────── */

interface NavItem {
  label: string;
  href: string;
}

interface AccountMenuProps {
  navItems?: NavItem[];
  primary?: NavItem;
  inlineHints?: boolean;
}

export function AccountMenu({
  navItems = [],
  primary,
  inlineHints = false,
}: AccountMenuProps) {
  const { auth, signOut } = useAuth();
  const { total } = useCredits();
  const { subscription, tierLabel, isUnlimited } = useSubscription();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initial = auth.email?.[0]?.toUpperCase() ?? "?";
  const hasPlan = subscription !== null && subscription.status === "active";

  /* Close on a click/tap anywhere outside the menu, or on Escape. A
     document-level listener (not a fixed overlay) is used because the sticky,
     backdrop-blurred header is a containing block for `position: fixed`, which
     would shrink an overlay catcher to the header's bounds. */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-2.5">
      {/* Hint balance — hidden for Ultimate (unlimited, nothing to count). */}
      {inlineHints && !isUnlimited && (
        <Link
          href="/pricing"
          aria-label="Hints — see plans"
          className="group inline-flex items-center gap-1.5"
        >
          <span
            className="inline-flex items-baseline gap-1 font-display italic text-[11px] sm:text-[12px]"
            style={{ fontWeight: 300 }}
          >
            <span
              className="tabular-nums"
              style={{
                color: total > 0 ? "var(--color-flame)" : "var(--color-text-muted)",
                fontWeight: 400,
              }}
            >
              {total}
            </span>
            <span className="text-text-muted group-hover:text-text transition-colors">
              {total === 1 ? "hint" : "hints"}
            </span>
          </span>
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-flame/40 bg-flame/[0.06] text-flame group-hover:bg-flame/[0.15] group-hover:border-flame/70 transition-colors"
          >
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </Link>
      )}

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Account menu"
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 group"
        >
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.06] group-hover:bg-white/[0.1] text-text not-italic font-display text-[12.5px] transition-colors"
            style={{ fontWeight: 500 }}
          >
            {initial}
          </span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={cn(
              "text-text-muted transition-transform",
              open && "rotate-180",
            )}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
            /* Dropdown — the one and only menu */
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded-2xl z-50 overflow-hidden animate-fade-up"
              style={{
                background:
                  "linear-gradient(180deg, rgba(25,20,30,0.98), rgba(15,12,20,0.98))",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 24px 50px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {/* Identity */}
              <div className="px-4 py-3 border-b border-white/[0.05]">
                <div
                  className="font-display italic text-[10.5px] tracking-[0.12em] uppercase text-text-muted/70 mb-1"
                  style={{ fontWeight: 400 }}
                >
                  signed in as
                </div>
                <div
                  className="font-display text-[13.5px] text-text truncate"
                  style={{ fontWeight: 400 }}
                >
                  {auth.email ?? "your account"}
                </div>
              </div>

              {/* Primary CTA (e.g. Open app) — FIRST item in the menu. */}
              {primary && (
                <Link
                  href={primary.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors group/cta"
                >
                  <span
                    className="font-display italic text-[14px] text-text"
                    style={{ fontWeight: 400 }}
                  >
                    {primary.label}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-flame transition-transform group-hover/cta:translate-x-0.5"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              )}

              {/* Hints + top up — hidden inline (dashboard) and for Ultimate. */}
              {!inlineHints && !isUnlimited && (
                <Link
                  href="/pricing"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                >
                  <span
                    className="font-display italic text-[13.5px] text-text-secondary"
                    style={{ fontWeight: 300 }}
                  >
                    <span
                      className="tabular-nums not-italic"
                      style={{
                        color: total > 0 ? "var(--color-flame)" : "var(--color-text-muted)",
                        fontWeight: 500,
                      }}
                    >
                      {total}
                    </span>{" "}
                    {total === 1 ? "hint" : "hints"} left
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 font-display italic text-[12.5px] text-flame"
                    style={{ fontWeight: 400 }}
                  >
                    plans
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-flame/40 bg-flame/[0.06]">
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </span>
                </Link>
              )}

              {/* Active subscription — shows the plan; manage on the pricing page. */}
              {hasPlan && (
                <Link
                  href="/pricing"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                >
                  <span
                    className="font-display italic text-[13.5px] text-text-secondary"
                    style={{ fontWeight: 300 }}
                  >
                    <span className="not-italic text-text" style={{ fontWeight: 500 }}>
                      {tierLabel}
                    </span>{" "}
                    plan · {subscription?.billing_interval === "year" ? "yearly" : "monthly"}
                  </span>
                  <span
                    className="font-display italic text-[12.5px] text-text-muted"
                    style={{ fontWeight: 300 }}
                  >
                    manage
                  </span>
                </Link>
              )}

              {/* Navigation */}
              {navItems.length > 0 && (
                <div className="border-t border-white/[0.05] py-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 font-display italic text-[13.5px] text-text-secondary hover:text-text hover:bg-white/[0.04] transition-colors"
                      style={{ fontWeight: 300 }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Sign out */}
              <button
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
                className="w-full text-left px-4 py-3 border-t border-white/[0.05] font-display italic text-[13.5px] text-text-secondary hover:text-text hover:bg-white/[0.04] transition-colors inline-flex items-center gap-2.5"
                style={{ fontWeight: 300 }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
                sign out
              </button>
            </div>
        )}
      </div>
    </div>
  );
}
