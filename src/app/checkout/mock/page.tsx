"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mark } from "@/components/brand/Mark";
import { billingApi } from "@/lib/api";
import { getToken } from "@/lib/auth-token";
import { refreshHints } from "@/hooks/useCredits";
import { refreshSubscription } from "@/hooks/useSubscription";

/* ─────────────────────────────────────────────
   /checkout/mock — transient processing splash that stands in for Paddle.

   The backend created a pending purchase tied to this transaction id. Here we
   simulate the webhook: call POST /billing/mock/complete to grant the hints,
   then redirect to the success page. If the JWT is missing (refresh / new
   device), bounce to /signin and come back to finish.
   ───────────────────────────────────────────── */

export default function MockCheckoutPage() {
  return (
    <Suspense fallback={<Splash text="loading checkout…" />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();

  const txn = params.get("txn") || "";
  const hints = Number(params.get("hints") || 0);
  const price = params.get("price") || "0";
  const kind = params.get("kind") || "";
  const isSub = kind === "sub";

  const [status, setStatus] = useState<"processing" | "redirecting" | "error">(
    "processing",
  );
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const selfUrl = `/checkout/mock?txn=${txn}&hints=${hints}&price=${price}&kind=${kind}`;
    if (!getToken()) {
      router.replace(`/signin?next=${encodeURIComponent(selfUrl)}`);
      return;
    }
    if (!txn) {
      setStatus("error");
      return;
    }

    (async () => {
      try {
        await billingApi.mockComplete(txn);
        refreshHints();
        refreshSubscription();
        setStatus("redirecting");
        const q = isSub ? `?kind=sub` : `?hints=${hints}`;
        router.replace(`/checkout/success${q}`);
      } catch {
        setStatus("error");
      }
    })();
  }, [txn, hints, price, kind, isSub, router]);

  if (status === "redirecting") return <Splash text="all set — taking you in…" />;

  return (
    <main className="min-h-dvh flex items-center justify-center px-5 py-10 bg-bg">
      <div className="w-full max-w-md">
        <div
          className="rounded-3xl p-8 sm:p-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-8">
            <Mark size={20} />
            <span className="font-black tracking-tight text-text lowercase text-[14px]">
              hintder
            </span>
            <span
              className="ml-auto font-display italic text-[11px] text-text-muted"
              style={{ fontWeight: 300 }}
            >
              secure checkout · paddle
            </span>
          </div>

          <div className="flex flex-col items-center text-center gap-5 py-6">
            {status === "error" ? (
              <div
                className="font-display italic text-[15px] text-text-secondary"
                style={{ fontWeight: 300 }}
              >
                Something went wrong completing this purchase. No charge was made.
              </div>
            ) : (
              <>
                <span
                  className="w-10 h-10 rounded-full border-2 border-flame/30 border-t-flame animate-spin"
                  aria-hidden
                />
                <div>
                  <div
                    className="font-display text-[20px] text-text"
                    style={{ fontWeight: 500 }}
                  >
                    opening Paddle…
                  </div>
                  <div
                    className="mt-1.5 font-display italic text-[13px] text-text-muted"
                    style={{ fontWeight: 300 }}
                  >
                    {isSub
                      ? hints > 0
                        ? `${hints} hints / cycle · $${price}`
                        : `unlimited · $${price}`
                      : `${hints} ${hints === 1 ? "hint" : "hints"} · $${price}`}
                  </div>
                </div>
              </>
            )}
          </div>

          <p
            className="mt-2 text-center font-display italic text-[11px] text-text-muted"
            style={{ fontWeight: 300 }}
          >
            {isSub
              ? "recurring · cancel anytime · refund within 14 days"
              : "no recurring · hints never expire · refund within 14 days"}
          </p>
        </div>
      </div>
    </main>
  );
}

function Splash({ text }: { text: string }) {
  return (
    <main className="min-h-dvh flex items-center justify-center px-5 py-10 bg-bg">
      <div
        className="font-display italic text-text-muted text-[14px]"
        style={{ fontWeight: 300 }}
      >
        {text}
      </div>
    </main>
  );
}
