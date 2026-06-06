"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@/components/brand/Icons";
import { billingApi, type Plan } from "@/lib/api";
import { getToken } from "@/lib/auth-token";
import { useAuth } from "@/hooks/useAuth";
import { openSubscriptionCheckout, paddleConfigured } from "@/lib/paddle";
import { refreshHints } from "@/hooks/useCredits";
import { refreshSubscription, useSubscription } from "@/hooks/useSubscription";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const TIER_RANK: Record<string, number> = { lite: 0, plus: 1, pro: 2, ultimate: 3 };

/* ─────────────────────────────────────────────
   Subscription pricing — 4 tiers (Lite / Plus / Pro / Ultimate) with a
   monthly ↔ yearly toggle, plus a one-time top-up row underneath. Plans come
   from the backend (/billing/plans); display copy lives here. Subscribing
   requires auth (the plan attaches to a user), so anonymous shoppers bounce to
   /signin and return to /pricing.
   ───────────────────────────────────────────── */

type Interval = "month" | "year";

const TIER_ORDER = ["lite", "plus", "pro", "ultimate"] as const;

interface TierMeta {
  /** Gradient-filled CTA — Ultimate only. Everyone else: white pill, black text. */
  gradientButton: boolean;
  /** Gradient title + price (premium feel) — Ultimate only. */
  gradient: boolean;
  hero: boolean;
  tagline: string;
  perks: string[];
}

const TIER_META: Record<string, TierMeta> = {
  lite: {
    gradientButton: false,
    gradient: false,
    hero: false,
    tagline: "testing the waters",
    perks: [
      "every voice & risk level",
      "openers + full reply coaching",
      "your pocket wingman, on demand",
    ],
  },
  plus: {
    gradientButton: false,
    gradient: false,
    hero: true,
    tagline: "where most guys land",
    perks: [
      "enough to never ration a good convo",
      "regenerate till the line lands",
      "everything in Lite",
    ],
  },
  pro: {
    gradientButton: false,
    gradient: false,
    hero: false,
    tagline: "serial-dater energy",
    perks: [
      "volume for nonstop swiping",
      "never pause mid-conversation",
      "everything in Plus",
    ],
  },
  ultimate: {
    gradientButton: true,
    gradient: true,
    hero: false,
    tagline: "never think about it again",
    perks: [
      "unlimited reads, openers & replies",
      "just send — zero counting",
      "everything in Pro",
    ],
  },
};

export function PricingPlans() {
  const router = useRouter();
  const { auth } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [interval, setIntervalState] = useState<Interval>("month");
  const { subscription } = useSubscription();
  const [pending, setPending] = useState<string | null>(null); // planId or "cancel"
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCancel, setPendingCancel] = useState(false);

  const currentTier = subscription?.status === "active" ? subscription.tier : null;
  const currentInterval = subscription?.status === "active" ? subscription.billing_interval : null;
  const hasSub = currentTier != null;

  const handleAction = async (planId: string, action: "subscribe" | "upgrade" | "downgrade" | "cancel") => {
    if (pending) return;
    /* No auth gate before checkout — even an anonymous user can pay (lower
       funnel friction). We require sign-in AFTER a successful purchase (in
       /checkout/mock) to secure it to a permanent account. We only need *some*
       session (token) so the purchase has a uid to attach to. */
    if (!getToken()) {
      router.push(`/signin?next=${encodeURIComponent("/pricing")}`);
      return;
    }
    setPending(action === "cancel" ? "cancel" : planId);
    try {
      if (action === "subscribe") {
        analytics.subscribeClicked(planId);
        const plan = plans.find((p) => p.id === planId);
        /* Real Paddle: open the overlay with the plan's price id; the webhook
           activates the subscription (customData ties it to this uid). Falls
           back to the mock checkout when Paddle isn't configured. */
        if (paddleConfigured() && plan?.paddle_price_id) {
          analytics.checkoutOpened(planId);
          await openSubscriptionCheckout({
            priceId: plan.paddle_price_id,
            uid: auth.uid,
            planId,
            email: auth.email,
          });
          setPending(null);
          return;
        }
        const session = await billingApi.subscribe(planId);
        router.push(session.checkout_url);
        return;
      }
      if (action === "cancel") {
        // show custom dialog — handled separately via confirmOpen state
        setConfirmOpen(true);
        setPending(null);
        return;
      } else {
        // upgrade or downgrade/switch → changePlan
        await billingApi.changePlan(planId);
      }
      refreshHints();
      refreshSubscription();
    } finally {
      setPending(null);
    }
  };

  useEffect(() => {
    billingApi
      .plans()
      .then(setPlans)
      .catch(() => setPlans([]));
    analytics.pricingViewed();
  }, []);

  /* Open on the interval the user already pays for (e.g. yearly subscribers
     land on the yearly tab). Runs once, after their subscription resolves —
     manual toggling afterwards is respected. */
  const autoSet = useRef(false);
  useEffect(() => {
    if (autoSet.current) return;
    if (subscription?.billing_interval) {
      setIntervalState(subscription.billing_interval);
      autoSet.current = true;
    }
  }, [subscription]);

  /* tier -> { month, year } */
  const byTier = useMemo(() => {
    const map: Record<string, Partial<Record<Interval, Plan>>> = {};
    for (const p of plans) {
      map[p.tier] = { ...map[p.tier], [p.billing_interval]: p };
    }
    return map;
  }, [plans]);

  const doCancel = async () => {
    setConfirmOpen(false);
    setPendingCancel(true);
    try {
      await billingApi.cancel();
      refreshHints();
      refreshSubscription();
    } finally {
      setPendingCancel(false);
    }
  };

  return (
    <>
    <ConfirmDialog
      open={confirmOpen}
      title="Cancel your subscription?"
      body="Your plan stays active until the end of this billing period. Your hints are yours to keep."
      confirmLabel="Yes, cancel"
      cancelLabel="Keep plan"
      danger
      onConfirm={doCancel}
      onCancel={() => setConfirmOpen(false)}
    />
    <div className="space-y-6">
      <IntervalToggle interval={interval} onChange={setIntervalState} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded-3xl overflow-hidden">
        {TIER_ORDER.map((tier) => {
          const plan = byTier[tier]?.[interval];
          if (!plan) return null;
          const rank = TIER_RANK[tier] ?? 0;
          const curRank = TIER_RANK[currentTier ?? ""] ?? -1;
          const action = !hasSub
            ? "subscribe"
            : currentTier === tier && currentInterval === interval
              ? "cancel"
              : rank > curRank
                ? "upgrade"
                : "downgrade";

          return (
            <PlanCard
              key={tier}
              plan={plan}
              interval={interval}
              currentTier={currentTier}
              currentInterval={currentInterval}
              subscription={subscription}
              action={action}
              busy={action === "cancel" ? pendingCancel : pending === plan.id}
              onAction={() => handleAction(plan.id, action)}
            />
          );
        })}
      </div>
    </div>
    </>
  );
}

function IntervalToggle({
  interval,
  onChange,
}: {
  interval: Interval;
  onChange: (i: Interval) => void;
}) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/[0.02]">
        {(["month", "year"] as Interval[]).map((i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={cn(
              "px-4 py-1.5 rounded-full font-display italic text-[13.5px] transition-colors",
              interval === i ? "text-white" : "text-text-secondary hover:text-text",
            )}
            style={
              interval === i
                ? { background: "linear-gradient(95deg, #FE3C72, #FF8552)", fontWeight: 400 }
                : { fontWeight: 300 }
            }
          >
            {i === "month" ? "monthly" : "yearly"}
            {i === "year" && (
              <span
                className="ml-1.5 text-[11px] font-semibold text-success"
              >
                −15%
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

const GRADIENT_TEXT = {
  background: "linear-gradient(135deg, #FE3C72, #FF8552)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
} as const;

/* Struck-through "list" prices per tier — the crossed-out anchor next to each
   real price (monthly + yearly). */
const ORIGINAL_PRICE: Record<string, { month: number; year: number }> = {
  lite: { month: 10, year: 100 },
  plus: { month: 20, year: 200 },
  pro: { month: 40, year: 400 },
  ultimate: { month: 100, year: 1000 },
};

function anchorPrice(tier: string, interval: Interval): number | null {
  return ORIGINAL_PRICE[tier]?.[interval] ?? null;
}

function PlanCard({
  plan,
  interval,
  currentTier,
  currentInterval,
  subscription,
  action,
  busy,
  onAction,
}: {
  plan: Plan;
  interval: Interval;
  currentTier: string | null;
  currentInterval: Interval | null;
  subscription: ReturnType<typeof useSubscription>["subscription"];
  action: "subscribe" | "upgrade" | "downgrade" | "cancel";
  busy: boolean;
  onAction: () => void;
}) {
  const meta =
    TIER_META[plan.tier] ??
    { gradientButton: false, gradient: false, hero: false, tagline: "", perks: [] };
  const perMonth = interval === "year" ? plan.price_usd / 12 : plan.price_usd;
  const original = anchorPrice(plan.tier, interval);

  const isCurrent = currentTier === plan.tier && currentInterval === interval;
  const isCancel = action === "cancel";
  const isDowngrade = action === "downgrade";

  /* Human-readable CTA label */
  const ctaLabel =
    action === "subscribe" ? "Subscribe"
      : action === "upgrade" ? "Upgrade"
        : action === "downgrade" ? "Downgrade"
          : subscription?.cancel_at_period_end ? "Canceling next cycle…" : "Cancel plan";

  const isCancelingScheduled = isCancel && !!subscription?.cancel_at_period_end;

  const clickable = !busy && !isCancelingScheduled;
  const clickAction = clickable ? onAction : undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={clickAction}
      onKeyDown={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onAction();
        }
      }}
      aria-disabled={!clickable}
      aria-label={`${ctaLabel} — ${plan.label}`}
      className={cn(
        "group relative bg-bg p-5 sm:p-6 flex flex-col gap-3 min-h-[340px] transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-flame/60",
        meta.hero && "ring-1 ring-flame/30",
        clickable && !meta.hero && "cursor-pointer hover:bg-white/[0.025] active:bg-white/[0.04]",
        clickable && meta.hero && "cursor-pointer",
        busy && "cursor-wait opacity-80",
      )}
      style={
        meta.hero
          ? {
              /* zооovсім трохи: a whisper of flame tint so Plus stands out */
              background:
                "linear-gradient(180deg, rgba(254,60,114,0.06), rgba(255,133,82,0.02) 60%), var(--color-bg)",
            }
          : undefined
      }
    >
      <div className="flex items-baseline justify-between">
        <span
          className="font-display text-[18px]"
          style={meta.gradient ? { ...GRADIENT_TEXT, fontWeight: 600 } : { color: "var(--color-text)", fontWeight: 500 }}
        >
          {plan.label}
        </span>
        {meta.hero && (
          <span className="font-display italic text-[12px] text-flame" style={{ fontWeight: 400 }}>
            popular
          </span>
        )}
      </div>

      <p
        className="font-display italic text-[13px] text-text-muted -mt-1.5"
        style={{ fontWeight: 300 }}
      >
        {meta.tagline}
      </p>

      <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 mt-1">
        <span className="font-display text-[18px] text-text-muted" style={{ fontWeight: 300 }}>
          $
        </span>
        <span
          className="text-[40px] sm:text-[46px] font-display leading-[0.85] tracking-[-0.05em] tabular-nums"
          style={
            meta.gradient
              ? { ...GRADIENT_TEXT, fontWeight: 500 }
              : { color: "var(--color-text)", fontWeight: 500 }
          }
        >
          {plan.price_usd}
        </span>
        {original != null && (
          <span
            className="font-display text-[16px] text-text-muted/45 line-through decoration-text-muted/30 tabular-nums ml-1.5"
            style={{ fontWeight: 300 }}
          >
            ${original}
          </span>
        )}
        <span
          className="font-display italic text-[13px] text-text-muted ml-1"
          style={{ fontWeight: 300 }}
        >
          /{interval === "year" ? "yr" : "mo"}
        </span>
        {interval === "year" && (
          <span
            className="font-display italic text-[12.5px] text-text-muted"
            style={{ fontWeight: 300 }}
          >
            · ${perMonth.toFixed(2)}/mo billed yearly
          </span>
        )}
      </div>

      <div
        className="mt-2 pl-0.5 font-display italic text-[13px] text-text-secondary"
        style={{ fontWeight: 300 }}
      >
        {plan.is_unlimited ? "unlimited hints" : `${plan.hints_per_cycle} hints / month`}
      </div>

      <div className="border-t border-white/[0.05] my-1" />

      <div className="space-y-2.5 text-[14.5px] text-text-secondary leading-snug flex-1 font-display font-light">
        {meta.perks.map((perk) => (
          <div key={perk} className="flex items-baseline gap-3">
            <span className={cn("shrink-0", meta.gradient ? "text-flame" : "text-text-muted")}>
              —
            </span>
            <span>{perk}</span>
          </div>
        ))}
      </div>

      {/* Decorative CTA — the whole card is the click target. */}
      <span
        className={cn(
          "mt-auto inline-flex items-center justify-center gap-2 w-full rounded-full px-4 py-3 font-display italic text-[14px]",
          isCancel
            ? "border border-white/15 text-text-muted group-hover:text-danger group-hover:border-danger/40 transition-colors"
            : isDowngrade
              ? "border border-white/10 text-text-muted/70 group-hover:text-text-secondary transition-colors"
              : meta.gradientButton
                ? "text-white"
                : "bg-white text-bg group-hover:bg-white/90 transition-colors",
        )}
        style={
          !isCancel && !isDowngrade && meta.gradientButton
            ? {
                background: "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
                fontWeight: 400,
              }
            : { fontWeight: 400 }
        }
      >
        {busy ? (isCancel ? "canceling…" : isDowngrade ? "scheduling…" : "opening checkout…") : ctaLabel}
        {!isCancel && !isCancelingScheduled && <ArrowRight size={13} />}
      </span>

      {/* Canceling state note */}
      {isCancelingScheduled && (
        <p
          className="text-center font-display italic text-[11.5px] text-text-muted -mt-1"
          style={{ fontWeight: 300 }}
        >
          cancels at end of billing period
        </p>
      )}
    </div>
  );
}

