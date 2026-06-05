"use client";

/* ─────────────────────────────────────────────
   Hintder brand mark — custom geometric SVG.
   Two overlapping arcs (a flame silhouette built
   from two bezier curves, not the 🔥 emoji).
   ───────────────────────────────────────────── */

interface MarkProps {
  size?: number;
  className?: string;
}

export function Mark({ size = 24, className = "" }: MarkProps) {
  const id = "hintder-mark-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FE3C72" />
          <stop offset="60%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#FF8552" />
        </linearGradient>
      </defs>
      {/* Outer asymmetric drop */}
      <path
        d="M16 3
           C 22 9, 27 13, 27 20
           C 27 26, 22 30, 16 30
           C 10 30, 5 26, 5 20
           C 5 15, 9 13, 11 9
           C 12 7, 14 5, 16 3 Z"
        fill={`url(#${id})`}
      />
      {/* Inner negative-space curve */}
      <path
        d="M16 11
           C 19 14, 21 16, 21 20
           C 21 23, 19 25, 16 25
           C 13 25, 11 23, 11 20
           C 11 17, 13 14, 16 11 Z"
        fill="#08070A"
      />
      {/* Inner highlight dot */}
      <circle cx="16" cy="20" r="2" fill={`url(#${id})`} />
    </svg>
  );
}

/* Wordmark (for header) */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight text-text ${className}`}>
      hintder
    </span>
  );
}
