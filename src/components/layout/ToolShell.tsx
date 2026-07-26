"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mark } from "@/components/brand/Mark";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { MatchSidebar } from "@/components/app/MatchSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useMatches } from "@/hooks/useMatches";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   ToolShell — the workspace chrome shared by every tool page.

   /decode and /optimize used to render their own bare header, which is why
   opening them wiped the match list off the screen. They now sit in the same
   shell as /app: same aurora, same header, same sidebar. Picking a match from
   here hands you back to /app, which owns the live workspace.
   ───────────────────────────────────────────── */

const NAV = [
  { label: "Home", href: "/" },
  { label: "Guides", href: "/guides" },
  { label: "Stories", href: "/stories" },
  { label: "Pricing", href: "/pricing" },
];

export function ToolShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { auth } = useAuth();
  const { total: credits } = useCredits();
  const { matches, getMatch, removeMatch, updateSettings } = useMatchesSafe();

  const isAuthed = !auth.isAnonymous;
  /* Mobile: the sidebar takes over the screen when opened. */
  const [listOpen, setListOpen] = useState(false);

  /* The shell now survives navigation (that's what stopped the flashing), so
     the full-screen list would stay open on top of the page you just opened
     and the tool buttons would look dead. Close it whenever the route moves. */
  const pathname = usePathname();
  useEffect(() => {
    setListOpen(false);
  }, [pathname]);

  const openMatch = (id: string) => {
    const m = getMatch(id);
    if (!m) return;
    router.push(`/app?id=${id}`);
  };

  return (
    <div className="h-dvh flex flex-col bg-bg relative overflow-hidden">
      {/* Aurora background — same as the workspace */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="aurora w-[500px] h-[500px] -top-40 -left-40 opacity-30"
          style={{ background: "var(--color-flame)" }}
        />
        <div
          className="aurora w-[400px] h-[400px] bottom-0 -right-20 opacity-25"
          style={{ background: "var(--color-ember)", animationDelay: "-5s" }}
        />
      </div>

      <header className="sticky top-0 z-50 px-5 sm:px-8 py-4 backdrop-blur-xl bg-bg/70 border-b border-white/[0.04] select-none">
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isAuthed && (
              <button
                onClick={() => setListOpen(true)}
                className="lg:hidden p-1.5 rounded-md hover:bg-white/5 text-text-muted hover:text-text transition-colors"
                aria-label="Open match list"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
            )}
            <Link href="/app" className="flex items-center gap-2.5 group shrink-0">
              <Mark size={20} />
              <span className="font-black text-text text-[13px] lowercase tracking-tight">
                hintder
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {!isAuthed && (
              <span
                className="inline-flex items-baseline gap-1 sm:gap-1.5 font-display italic text-[11px] sm:text-[12px]"
                style={{ fontWeight: 300 }}
              >
                <span
                  className="tabular-nums"
                  style={{
                    color:
                      credits > 0
                        ? "var(--color-flame)"
                        : "var(--color-text-muted)",
                    fontWeight: 400,
                  }}
                >
                  {credits}
                </span>
                <span className="text-text-muted">
                  {credits === 1 ? "hint" : "hints"}
                </span>
                {credits > 0 && (
                  <span className="text-text-muted hidden sm:inline">· free</span>
                )}
              </span>
            )}

            {auth.isAnonymous ? (
              <Link
                href="/signin"
                className="font-display italic text-[12px] text-text-muted hover:text-text transition-colors"
                style={{ fontWeight: 300 }}
              >
                sign in
              </Link>
            ) : (
              <AccountMenu
                inlineHints
                navItems={NAV}
                primary={{ label: "Open app", href: "/app" }}
              />
            )}
          </div>
        </div>
      </header>

      <div
        className={cn(
          "flex-1 min-h-0 flex",
          isAuthed && "lg:grid lg:grid-cols-[300px_1fr]",
        )}
      >
        {isAuthed && (
          <aside className="hidden lg:flex flex-col border-r border-white/[0.05] min-h-0 min-w-0 overflow-y-auto overflow-x-hidden custom-scroll">
            <MatchSidebar
              matches={matches}
              activeId={null}
              onUpdateMatchSettings={updateSettings}
              onDeleteMatch={removeMatch}
              onSelectMatch={openMatch}
              onNewMatch={() => router.push("/app")}
            />
          </aside>
        )}

        {isAuthed && listOpen && (
          <div className="lg:hidden flex-1 flex flex-col">
            <MatchSidebar
              matches={matches}
              activeId={null}
              onUpdateMatchSettings={updateSettings}
              onDeleteMatch={removeMatch}
              onSelectMatch={(id) => {
                setListOpen(false);
                openMatch(id);
              }}
              onNewMatch={() => router.push("/app")}
              onNavigate={() => setListOpen(false)}
              isMobile
            />
          </div>
        )}

        <main
          className={cn(
            "flex-1 px-5 sm:px-8 py-5 flex flex-col min-w-0 min-h-0 overflow-y-auto overflow-x-hidden custom-scroll",
            listOpen && "hidden lg:flex",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/* useMatches exposes upsert/remove; the shell only needs a read-only view plus
   the two edits the sidebar itself offers. Wrapped so the shape stays obvious
   at the call site above. */
function useMatchesSafe() {
  const { matches, getMatch, removeMatch, upsertMatch } = useMatches();
  const updateSettings = (
    id: string,
    style?: Parameters<typeof upsertMatch>[0]["pickedStyle"],
    tone?: Parameters<typeof upsertMatch>[0]["pickedTone"],
  ) => {
    const m = getMatch(id);
    if (!m) return;
    upsertMatch({
      ...m,
      pickedStyle: style ?? m.pickedStyle,
      pickedTone: tone ?? m.pickedTone,
      updatedAt: Date.now(),
    });
  };
  return { matches, getMatch, removeMatch, updateSettings };
}
