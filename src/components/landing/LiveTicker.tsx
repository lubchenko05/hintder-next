"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────
   LiveActivity — ambient on-air feel.
   Mobile: stacked rows, max 2 visible, left-aligned,
   each item contained to viewport. Desktop: scattered
   notifications at random positions.
   ───────────────────────────────────────────── */

type Slot = {
  id: number;
  name: string;
  verb: string;
  age: string;
  /* Random placement (% of band width) */
  left: number;
  top: number;
  born: number;
  ttl: number;
};

const EVENTS: Array<{ name: string; verb: string }> = [
  { name: "Emma", verb: "opener sent" },
  { name: "Madison", verb: "scanning profile" },
  { name: "Alex", verb: "3 hooks found" },
  { name: "Layla", verb: "got a reply" },
  { name: "Hannah", verb: "drafting line" },
  { name: "Riley", verb: "matched" },
  { name: "Kate", verb: "opener sent" },
  { name: "Ava", verb: "scanning profile" },
  { name: "Julia", verb: "got a reply" },
  { name: "Dana", verb: "opener sent" },
  { name: "Paula", verb: "drafting" },
  { name: "Sara", verb: "scanning profile" },
];

let nextId = 1;

function pickEvent(): { name: string; verb: string } {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
}

function pickAge(): string {
  const r = Math.random();
  if (r < 0.3) return "just now";
  const s = Math.floor(2 + Math.random() * 18);
  return `${s}s ago`;
}

/* Mobile: 3 fixed vertical rows, all left-anchored.
   Desktop: random positions across the band. */
const MOBILE_ROWS = [15, 50, 80]; /* top % within the band */

function pickSlot(
  rowOrLeft: number,
  isMobile: boolean,
  takenRows?: Set<number>,
): Slot {
  const e = pickEvent();
  if (isMobile) {
    /* rowOrLeft is the row index (0/1/2). Find a free one. */
    const idx = rowOrLeft % MOBILE_ROWS.length;
    return {
      id: nextId++,
      name: e.name,
      verb: e.verb,
      age: pickAge(),
      left: 4, /* always pinned to the left edge */
      top: MOBILE_ROWS[idx],
      born: Date.now(),
      ttl: 4500 + Math.random() * 2500,
    };
  }
  /* Desktop: rowOrLeft is the actual % left position */
  return {
    id: nextId++,
    name: e.name,
    verb: e.verb,
    age: pickAge(),
    left: rowOrLeft,
    top: Math.floor(20 + Math.random() * 60),
    born: Date.now(),
    ttl: 4500 + Math.random() * 2500,
  };
}

/* Deterministic first paint: without this the strip is empty until hydration +
   a CSS animation run, so it silently disappears whenever JS is slow/blocked. */
const SSR_SEED: Slot[] = [8, 32, 56, 80].map((left, i) => ({
  id: -(i + 1), // negative ids mark the seeded (always-visible) rows
  left,
  top: [30, 60, 25, 65][i],
  ttl: 6000,
  born: 0,
  age: `${2 + i * 3}m`,
  ...EVENTS[i % EVENTS.length],
}));

export function LiveTicker() {
  const [slots, setSlots] = useState<Slot[]>(SSR_SEED);
  const [isMobile, setIsMobile] = useState(false);

  /* Track viewport — mobile = under sm breakpoint (640px) */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    /* Seed */
    const seed: Slot[] = [];
    const seedCount = isMobile ? 2 : 4;
    for (let i = 0; i < seedCount; i++) {
      const s = pickSlot(
        isMobile ? i : 10 + i * 22 + Math.random() * 8,
        isMobile,
      );
      s.born = Date.now() - Math.floor(Math.random() * 3000);
      seed.push(s);
    }
    setSlots(seed);

    let cancelled = false;
    const maxAlive = isMobile ? 2 : 5;
    const colsDesktop = [8, 24, 40, 56, 72, 88];

    const spawn = () => {
      if (cancelled) return;
      setSlots((prev) => {
        const now = Date.now();
        const alive = prev.filter((s) => now - s.born < s.ttl);
        if (alive.length >= maxAlive) return alive;

        if (isMobile) {
          /* Pick a row that isn't currently occupied */
          const takenTops = new Set(alive.map((s) => s.top));
          const freeRow = MOBILE_ROWS.findIndex((t) => !takenTops.has(t));
          if (freeRow === -1) return alive;
          return [...alive, pickSlot(freeRow, true)];
        }

        /* Desktop: pick a free column */
        const free = colsDesktop.filter(
          (c) => !alive.some((s) => Math.abs(s.left - c) < 10),
        );
        const left =
          free[Math.floor(Math.random() * free.length)] ??
          colsDesktop[Math.floor(Math.random() * colsDesktop.length)];
        return [...alive, pickSlot(left + (Math.random() * 6 - 3), false)];
      });
      const next = isMobile
        ? 1800 + Math.random() * 1500
        : 700 + Math.random() * 1500;
      setTimeout(spawn, next);
    };
    const t = setTimeout(spawn, 1500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isMobile]);

  useEffect(() => {
    /* Sweep expired slots out of state. Visual fade is CSS-driven, so this
       only needs to run as often as we want to free memory. */
    const id = setInterval(() => {
      setSlots((prev) => {
        const now = Date.now();
        return prev.filter((s) => now - s.born < s.ttl);
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative w-full h-[70px] sm:h-[110px] overflow-hidden pointer-events-none select-none"
      aria-hidden
    >
      <style jsx>{`
        @keyframes ticker-life {
          0% {
            opacity: 0;
            transform: translateY(calc(-50% + 4px));
          }
          12% {
            opacity: 0.85;
            transform: translateY(-50%);
          }
          82% {
            opacity: 0.85;
          }
          100% {
            opacity: 0;
            transform: translateY(calc(-50% - 4px));
          }
        }
      `}</style>
      {slots.map((s) => {
        return (
          <div
            key={s.id}
            className="absolute max-w-[calc(100vw-2rem)] sm:max-w-none"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              /* Seeded (SSR) rows start visible; live ones fade in via the
                 animation. Visibility must never depend on the animation. */
              opacity: s.id < 0 ? 0.85 : 0,
              transform: "translateY(-50%)",
              animation:
                s.id < 0 ? undefined : `ticker-life ${s.ttl}ms ease-out forwards`,
              willChange: "opacity, transform",
            }}
          >
            <div className="inline-flex items-baseline gap-2 sm:gap-2.5 whitespace-nowrap">
              <span
                className="relative inline-flex h-1 w-1 shrink-0 self-center"
              >
                <span
                  className="absolute inline-flex h-full w-full rounded-full"
                  style={{
                    background: "var(--color-flame)",
                    animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite",
                  }}
                />
                <span
                  className="relative inline-flex h-1 w-1 rounded-full"
                  style={{ background: "var(--color-flame)" }}
                />
              </span>
              <span
                className="font-display italic text-[11px] text-text-secondary"
                style={{ fontWeight: 400 }}
              >
                {s.name}
              </span>
              <span
                className="font-display italic text-[11px] text-text-muted"
                style={{ fontWeight: 300 }}
              >
                {s.verb}
              </span>
              {/* Age — desktop only, keeps mobile compact */}
              <span
                className="hidden sm:inline font-display italic text-[10px] text-text-muted/50"
                style={{ fontWeight: 300 }}
              >
                · {s.age}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
