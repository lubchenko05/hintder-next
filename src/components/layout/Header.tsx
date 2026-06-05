"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mark } from "@/components/brand/Mark";
import { ArrowRight } from "@/components/brand/Icons";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { label: "Guides", href: "/guides" },
  { label: "Stories", href: "/stories" },
  { label: "Pricing", href: "/pricing" },
];

export function Header() {
  const { auth, ready } = useAuth();
  /* Until auth resolves, render the signed-out control (matches SSR — no flash). */
  const authed = ready && !auth.isAnonymous;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 sm:py-5 select-none"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3">
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
          <AccountMenu navItems={NAV} primary={{ label: "Open app", href: "/app" }} />
        ) : (
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="p-1.5 -mr-1 text-text-secondary hover:text-text transition-colors"
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
        )}
      </nav>

      {/* Anonymous menu panel — nav + sign in + try free, all in one place. */}
      {!authed && menuOpen && (
        <div
          className="mx-auto max-w-7xl mt-3 rounded-2xl overflow-hidden animate-fade-up"
          style={{
            background:
              "linear-gradient(180deg, rgba(25,20,30,0.98), rgba(15,12,20,0.98))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 50px -20px rgba(0,0,0,0.7)",
          }}
        >
          <ul className="flex flex-col">
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
    </motion.header>
  );
}
