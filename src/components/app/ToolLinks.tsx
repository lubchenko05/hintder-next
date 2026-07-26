import Link from "next/link";

/* ─────────────────────────────────────────────
   ToolLinks — cross-links to the OTHER tools, shown at the bottom of every
   tool page so you can jump between them without going home.
   ───────────────────────────────────────────── */

type ToolKey = "read" | "decode" | "optimize";

const TOOLS: Record<ToolKey, { href: string; title: string; blurb: string }> = {
  read: {
    href: "/app",
    title: "Read her profile",
    blurb: "Drop her screenshots — openers written for that exact person.",
  },
  decode: {
    href: "/decode",
    title: "Decode her reply",
    blurb: "Paste her message — get what she actually means and the move.",
  },
  optimize: {
    href: "/optimize",
    title: "Rate your profile",
    blurb: "Upload YOUR profile — score, better bios, which photos to cut.",
  },
};

export function ToolLinks({ current }: { current: ToolKey }) {
  const others = (Object.keys(TOOLS) as ToolKey[]).filter((k) => k !== current);
  return (
    /* Secondary navigation — dropped on short phones so the tool itself fits. */
    <div className="mt-3 [@media(max-height:720px)]:hidden">
      <div
        className="font-display italic text-[10px] tracking-[0.14em] uppercase text-text-muted/50 mb-2 text-center"
        style={{ fontWeight: 400 }}
      >
        or use a different tool
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {others.map((k) => {
          const t = TOOLS[k];
          return (
            <Link
              key={k}
              href={t.href}
              className="group rounded-2xl px-4 py-3 border border-white/[0.07] hover:border-flame/35 transition-colors"
              style={{ background: "rgba(255,255,255,0.015)" }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className="font-display text-[14px] text-text"
                  style={{ fontWeight: 500 }}
                >
                  {t.title}
                </span>
                <span className="font-display italic text-[12px] text-flame opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </div>
              <p
                className="mt-0.5 font-display italic text-[12px] text-text-muted leading-[1.4]"
                style={{ fontWeight: 300 }}
              >
                {t.blurb}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
