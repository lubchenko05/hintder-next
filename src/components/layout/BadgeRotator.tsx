"use client";

import { useEffect, useState } from "react";

type Badge = { href: string; src: string; alt: string };

/**
 * Rotates the "featured on" backlink badges through a single small slot, one
 * at a time. Every anchor stays mounted (only opacity/visibility changes) so
 * all the backlinks remain crawlable — only the visible one is interactive.
 */
export default function BadgeRotator({ badges }: { badges: Badge[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (badges.length <= 1) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % badges.length);
    }, 2200);
    return () => clearInterval(id);
  }, [badges.length]);

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted/60 font-display">
        featured on
      </span>
      <div className="relative h-10 w-56 max-w-[80vw]">
        {badges.map((b, i) => {
          const on = i === active;
          return (
            <a
              key={b.href}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={b.alt}
              aria-hidden={!on}
              tabIndex={on ? 0 : -1}
              className={`absolute inset-0 flex items-center justify-center grayscale transition-all duration-700 ease-out ${
                on
                  ? "opacity-50 translate-y-0 pointer-events-auto hover:opacity-100 hover:grayscale-0"
                  : "opacity-0 translate-y-1.5 pointer-events-none"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.src} alt={b.alt} className="h-8 w-auto max-w-full" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
