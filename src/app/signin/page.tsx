"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mark } from "@/components/brand/Mark";
import { ArrowRight } from "@/components/brand/Icons";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   /signin — sign in with Google or a passwordless
   email link (both real Firebase, no mocks). Hints
   + matches live on the account, so signing in on
   any device restores everything.
   ───────────────────────────────────────────── */

function safeNext(raw: string | null): string {
  if (!raw) return "/app";
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;
  } catch {
    /* fallthrough */
  }
  return "/app";
}

type EmailStatus = "idle" | "sending" | "sent" | "error";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const { auth, ready, error, signInWithGoogle, sendEmailLink } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<EmailStatus>("idle");

  /* After redirect / email-link returns and auth resolves, continue to next. */
  useEffect(() => {
    if (ready && !auth.isAnonymous) router.replace(next);
  }, [ready, auth.isAnonymous, next, router]);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      /* On success the redirect effect navigates away once auth resolves; on
         cancel/close we land here and un-stick the button. */
      setGoogleLoading(false);
    }
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      await sendEmailLink(email, next);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center px-5 py-10 bg-bg">
      <div className="w-full max-w-md">
        {/* Centered logo */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <Mark size={56} />
          <span className="font-black tracking-tight text-text lowercase text-[28px] sm:text-[32px]">
            hintder
          </span>
        </div>

        <h1
          className="font-display tracking-[-0.035em] leading-[0.95] text-center text-[clamp(2.5rem,6vw,4rem)] mb-10"
          style={{ fontWeight: 400, textWrap: "balance" }}
        >
          Pick up where{" "}
          <span
            className="italic"
            style={{
              background: "linear-gradient(95deg, #FE3C72, #FF8552)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 300,
            }}
          >
            you left off.
          </span>
        </h1>

        {/* Backend couldn't authorize the (Firebase-)signed-in user. */}
        {error === "backend" && (
          <div
            className="mb-5 p-4 rounded-2xl text-center"
            style={{
              background: "linear-gradient(160deg, rgba(255,77,79,0.10), rgba(255,77,79,0.03))",
              border: "1px solid rgba(255,77,79,0.3)",
            }}
          >
            <p
              className="font-display italic text-[13.5px] text-text-secondary leading-[1.5]"
              style={{ fontWeight: 300 }}
            >
              Signed in, but we couldn&apos;t reach the hintder server. Check that
              it&apos;s running, then try again.
            </p>
          </div>
        )}

        {/* Google — primary auth path */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className={cn(
            "group w-full inline-flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl",
            "bg-white text-[#1f1f1f] font-display text-[15px] transition-transform",
            googleLoading
              ? "opacity-70 cursor-wait"
              : "hover:scale-[1.01] active:scale-[0.99]",
          )}
          style={{
            fontWeight: 500,
            boxShadow:
              "0 12px 30px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
        >
          {googleLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              opening Google…
            </>
          ) : (
            <>
              <GoogleLogo />
              Continue with Google
            </>
          )}
        </button>

        {/* OR divider */}
        <div className="flex items-center gap-3 my-7">
          <span className="h-px flex-1 bg-white/[0.08]" />
          <span
            className="font-display italic text-[11.5px] text-text-muted tracking-wide"
            style={{ fontWeight: 300 }}
          >
            or with email
          </span>
          <span className="h-px flex-1 bg-white/[0.08]" />
        </div>

        {status !== "sent" ? (
          <form onSubmit={submitEmail} className="space-y-3">
            <div className="flex gap-2 sm:gap-2.5 items-stretch">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="your email"
                required
                aria-label="your email"
                className="flex-1 min-w-0 px-4 sm:px-5 py-3.5 rounded-full bg-white/[0.03] border border-white/10 focus:border-flame/50 outline-none text-text font-display text-[14px] sm:text-[15px] transition-colors placeholder:text-text-muted/60 select-text"
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                aria-label="send the link"
                className={cn(
                  "group inline-flex items-center justify-center gap-2 shrink-0 px-5 sm:px-6 rounded-full font-display italic text-white text-[14px] sm:text-[15px] transition-transform",
                  status === "sending"
                    ? "opacity-80 cursor-wait"
                    : "hover:scale-[1.01] active:scale-[0.99]",
                )}
                style={{
                  background:
                    "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
                  boxShadow: "0 18px 40px -12px rgba(254,60,114,0.55)",
                  fontWeight: 400,
                }}
              >
                {status === "sending" ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline">send link</span>
                    <ArrowRight
                      size={16}
                      className="text-white transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </div>

            {status === "error" && (
              <p
                className="text-[12.5px] text-danger font-display italic"
                style={{ fontWeight: 300 }}
              >
                Couldn&apos;t send the link — check the email and try again.
              </p>
            )}
          </form>
        ) : (
          <div
            className="p-6 rounded-2xl"
            style={{
              background:
                "linear-gradient(160deg, rgba(91,227,169,0.08), rgba(91,227,169,0.02))",
              border: "1px solid rgba(91,227,169,0.25)",
            }}
          >
            <p
              className="font-display text-[16px] text-text mb-2"
              style={{ fontWeight: 500 }}
            >
              Check your inbox.
            </p>
            <p
              className="font-display italic text-[13.5px] text-text-secondary leading-[1.5]"
              style={{ fontWeight: 300 }}
            >
              We sent a one-time sign-in link to{" "}
              <span className="text-text not-italic">{email}</span>. Open it on
              this device to finish.
            </p>
          </div>
        )}

        <p
          className="mt-8 text-center font-display italic text-[12.5px] text-text-muted leading-relaxed"
          style={{ fontWeight: 300 }}
        >
          Your hints and matches live on your account — sign in on any device to
          pick them back up.
        </p>
      </div>
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
