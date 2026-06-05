/* ─────────────────────────────────────────────
   Custom SVG icons — replace lucide/emoji defaults.
   Hand-tuned for the Hintder visual language.
   ───────────────────────────────────────────── */

type IconProps = {
  size?: number;
  className?: string;
};

/* Asymmetric heart — slightly off-balance, not the symmetric default */
export function HeartShape({ size = 24, className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} fill="currentColor">
      <path d="M16 28 C 4 20, 4 8, 12 8 C 14 8, 15 9, 16 11 C 17 9, 18.5 8, 20.5 8 C 28 8, 29 20, 16 28 Z" />
    </svg>
  );
}

/* Pass — diagonal slash with a small dot end */
export function PassShape({ size = 24, className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M8 8 L24 24" />
      <path d="M24 8 L8 24" />
    </svg>
  );
}

/* Geo-mark — diamond (custom, not pin-shaped) */
export function GeoMark({ size = 12, className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} className={className} fill="currentColor">
      <path d="M6 0 L9 6 L6 12 L3 6 Z" />
    </svg>
  );
}

/* Arrow — chunky, not the thin lucide one */
export function ArrowRight({ size = 16, className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12 H 19" />
      <path d="M13 6 L 19 12 L 13 18" />
    </svg>
  );
}

/* Spark — 4-point starburst, replaces ⚡/✨ */
export function Spark({ size = 14, className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} className={className} fill="currentColor">
      <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" />
    </svg>
  );
}

/* Wedge — angular indicator, replaces > or ▾ */
export function Wedge({ size = 10, className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} className={className} fill="currentColor">
      <path d="M0 2 L5 8 L10 2 Z" />
    </svg>
  );
}

/* Custom check — diagonal stroke, no rounded corners */
export function CheckMark({ size = 14, className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
      <path d="M3 9 L 6.5 12.5 L 13 4" />
    </svg>
  );
}

/* Live pulse — three thin bars, oscillating heights */
export function LivePulse({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-end gap-[2px] h-3 ${className}`} aria-hidden>
      <span className="w-[2px] bg-current rounded-sm animate-pulse-bar" style={{ height: "30%", animationDelay: "0ms" }} />
      <span className="w-[2px] bg-current rounded-sm animate-pulse-bar" style={{ height: "70%", animationDelay: "150ms" }} />
      <span className="w-[2px] bg-current rounded-sm animate-pulse-bar" style={{ height: "50%", animationDelay: "300ms" }} />
    </span>
  );
}
