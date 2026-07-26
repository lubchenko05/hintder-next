"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mark } from "@/components/brand/Mark";
import { ArrowRight } from "@/components/brand/Icons";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { useAuth } from "@/hooks/useAuth";
import { TOOLS } from "@/lib/tools";

const NAV = [
  { label: "Guides", href: "/guides" },
  { label: "Stories", href: "/stories" },
  { label: "Pricing", href: "/pricing" },
];

/* The account menu is the ONLY nav a signed-in user gets on a phone — the
   burger renders for signed-out visitors only — so Tools has to live in it. */
const MOBILE_NAV = [{ label: "Tools", href: "/tools" }, ...NAV];

export function Header() {
  const { auth, ready } = useAuth();
  /* Until auth resolves, render the signed-out control (matches SSR — no flash). */
  const authed = ready && !auth.isAnonymous;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    /* Plain, always-visible header. It used to be a motion.header with
       initial={{opacity: 0}}, and later a CSS fade — either way, if the
       animation didn't run (hydration timing, reduced motion, a throttled tab)
       the header stayed invisible. Nav visibility must never depend on an
       animation firing. */
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3 sm:pt-4 select-none">
      {/* Liquid glass: the blur alone reads as a grey smear over a dark page —
          what sells it is the pair of speculars (a bright top edge, a faint
          bottom one) plus saturation, so the colours behind it bleed through
          instead of going flat. */}
      <nav
        className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full px-4 sm:px-6 py-2.5 sm:py-3"
        style={{
          /* Frosted: enough base to keep the nav readable over any hero, with
             the blur and the top specular doing the glass. */
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          background:
            "linear-gradient(180deg, rgba(24,19,28,0.72), rgba(13,11,17,0.78))",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow:
            "0 10px 34px -12px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* the sheen that slides across real glass */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(120% 180% at 15% -40%, rgba(255,255,255,0.16), transparent 60%)",
          }}
        />
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 group">
          <Mark size={20} className="transition-transform group-hover:rotate-[8deg]" />
          <span className="text-[14px] sm:text-[15px] font-black tracking-tight text-text lowercase leading-none">
            hintder
          </span>
        </Link>

        {/* Right side — ONE menu. Authed → account avatar (everything inside);
            anonymous → a single hamburger. No loose pills/links. */}
        {authed ? (
          /* Signed in: keep the nav visible on desktop (Tools/Guides/…) and put
             the account avatar next to it — not everything hidden behind it. */
          <div className="flex items-center gap-7">
            <div className="hidden md:flex items-center gap-7">
              <ToolsMenu />
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-display italic text-[14px] text-text-secondary hover:text-text transition-colors"
                  style={{ fontWeight: 300 }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <AccountMenu navItems={MOBILE_NAV} primary={{ label: "Open app", href: "/app" }} />
          </div>
        ) : (
          <>
            {/* Desktop: inline nav + sign in + CTA (no burger). */}
            <div className="hidden md:flex items-center gap-7">
              <ToolsMenu />
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-display italic text-[14px] text-text-secondary hover:text-text transition-colors"
                  style={{ fontWeight: 300 }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/signin"
                className="font-display italic text-[14px] text-text-secondary hover:text-text transition-colors"
                style={{ fontWeight: 300 }}
              >
                Sign in
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-display italic text-[14px] text-white"
                style={{
                  background: "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
                  fontWeight: 400,
                }}
              >
                Try free <ArrowRight size={13} className="text-white" />
              </Link>
            </div>

            {/* Mobile: a single hamburger. */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden p-1.5 -mr-1 text-text-secondary hover:text-text transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                {menuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h18" />
                )}
              </svg>
            </button>
          </>
        )}
      </nav>

      {/* Anonymous menu panel — nav + sign in + try free, all in one place. */}
      {!authed && menuOpen && (
        <div
          className="md:hidden mx-auto max-w-7xl mt-3 rounded-2xl overflow-hidden animate-fade-up"
          style={{
            background:
              "linear-gradient(180deg, rgba(25,20,30,0.98), rgba(15,12,20,0.98))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 50px -20px rgba(0,0,0,0.7)",
          }}
        >
          <ul className="flex flex-col">
            {/* Tools first on mobile: the dropdown doesn't exist here, so they
                would otherwise be reachable only through the footer. */}
            {TOOLS.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tools/${t.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3.5 font-display italic text-[15px] text-text-secondary hover:text-text hover:bg-white/[0.04] transition-colors border-b border-white/[0.05]"
                  style={{ fontWeight: 300 }}
                >
                  {t.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/tools"
                onClick={() => setMenuOpen(false)}
                className="block px-5 py-3 font-display italic text-[13.5px] text-flame hover:bg-white/[0.04] transition-colors border-b border-white/[0.05]"
                style={{ fontWeight: 400 }}
              >
                See all tools →
              </Link>
            </li>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3.5 font-display italic text-[15px] text-text-secondary hover:text-text hover:bg-white/[0.04] transition-colors"
                  style={{ fontWeight: 300 }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-white/[0.06] p-3 flex flex-col gap-2">
            <Link
              href="/signin"
              onClick={() => setMenuOpen(false)}
              className="text-center py-3 rounded-full font-display italic text-[14px] text-text-secondary border border-white/12 hover:text-text transition-colors"
              style={{ fontWeight: 300 }}
            >
              Sign in
            </Link>
            <Link
              href="/app"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 py-3 rounded-full font-display italic text-[14px] text-white"
              style={{
                background: "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
                fontWeight: 400,
              }}
            >
              Try free <ArrowRight size={13} className="text-white" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* Tools dropdown. Opens on hover for a mouse and on tap for a finger, and
   closes on outside click — a menu that can only be dismissed by picking
   something is a trap on touch. */
function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 font-display italic text-[14px] text-text-secondary hover:text-text transition-colors"
        style={{ fontWeight: 300 }}
      >
        Tools
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 -translate-x-1/2 top-full pt-[18px] w-[280px] z-50"
        >
          <div
            className="rounded-2xl p-2 overflow-hidden"
            style={{
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              background:
                "linear-gradient(180deg, rgba(24,19,28,0.86), rgba(13,11,17,0.90))",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow:
                "0 20px 48px -16px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.20)",
            }}
          >
            {TOOLS.map((t) => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 hover:bg-white/[0.06] transition-colors"
              >
                <div
                  className="font-display text-[14px] text-text"
                  style={{ fontWeight: 500 }}
                >
                  {t.name}
                </div>
                <div
                  className="font-display italic text-[12px] text-text-muted leading-[1.35] mt-0.5"
                  style={{ fontWeight: 300 }}
                >
                  {t.blurb}
                </div>
              </Link>
            ))}
            <Link
              href="/tools"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 mt-1 border-t border-white/[0.07] font-display italic text-[13px] text-text-secondary hover:text-flame transition-colors"
              style={{ fontWeight: 400 }}
            >
              See all tools →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
