import { ImageResponse } from "next/og";

/* ─────────────────────────────────────────────
   Branded social card (Open Graph + Twitter). Dark hintder canvas, the flame
   mark, the gradient phrase in Fraunces italic — the same editorial system as
   the site, generated at build. Fonts are pulled as Satori-friendly WOFF; if a
   fetch fails the card still renders (just with the default face).
   ───────────────────────────────────────────── */

export const alt = "Hintder — say the thing she'll actually reply to";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FLAME = "linear-gradient(115deg, #FE3C72, #FF6B6B 50%, #FF8552)";

async function loadFont(file: string) {
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/@fontsource/${file}.woff`,
  );
  if (!res.ok) throw new Error(`font ${file} failed`);
  return res.arrayBuffer();
}

export default async function Image() {
  const wanted = [
    { file: "inter/files/inter-latin-600-normal", name: "Inter", weight: 600 as const, style: "normal" as const },
    { file: "inter/files/inter-latin-800-normal", name: "Inter", weight: 800 as const, style: "normal" as const },
    { file: "fraunces/files/fraunces-latin-400-normal", name: "Fraunces", weight: 400 as const, style: "normal" as const },
    { file: "fraunces/files/fraunces-latin-400-italic", name: "Fraunces", weight: 400 as const, style: "italic" as const },
  ];

  const settled = await Promise.allSettled(wanted.map((w) => loadFont(w.file)));
  const fonts = settled
    .map((r, i) =>
      r.status === "fulfilled"
        ? { name: wanted[i].name, data: r.value, weight: wanted[i].weight, style: wanted[i].style }
        : null,
    )
    .filter((f): f is NonNullable<typeof f> => f !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08070A",
          padding: "72px 80px",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        {/* Flame glow */}
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -200,
            width: 760,
            height: 760,
            borderRadius: 760,
            background:
              "radial-gradient(circle, rgba(254,60,114,0.30), rgba(254,60,114,0) 60%)",
            display: "flex",
          }}
        />

        {/* Top: mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="og" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FE3C72" />
                <stop offset="60%" stopColor="#FF6B6B" />
                <stop offset="100%" stopColor="#FF8552" />
              </linearGradient>
            </defs>
            <path
              d="M16 3 C 22 9, 27 13, 27 20 C 27 26, 22 30, 16 30 C 10 30, 5 26, 5 20 C 5 15, 9 13, 11 9 C 12 7, 14 5, 16 3 Z"
              fill="url(#og)"
            />
            <path
              d="M16 11 C 19 14, 21 16, 21 20 C 21 23, 19 25, 16 25 C 13 25, 11 23, 11 20 C 11 17, 13 14, 16 11 Z"
              fill="#08070A"
            />
            <circle cx="16" cy="20" r="2" fill="url(#og)" />
          </svg>
          <span style={{ fontSize: 34, fontWeight: 800, color: "#FAFAFA", letterSpacing: -1 }}>
            hintder
          </span>
        </div>

        {/* Center: editorial headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: 82,
              lineHeight: 1.16,
              color: "#FAFAFA",
              letterSpacing: -2,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Say the thing she'll
          </div>
          <div
            style={{
              fontFamily: "Fraunces",
              fontStyle: "italic",
              fontSize: 82,
              lineHeight: 1.28,
              letterSpacing: -2,
              paddingBottom: 14,
              backgroundImage: FLAME,
              backgroundClip: "text",
              color: "transparent",
              display: "flex",
            }}
          >
            actually reply to.
          </div>
        </div>

        {/* Bottom: tagline */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 26, color: "#B8B5BF" }}>your dating wingman</span>
          <span style={{ fontSize: 26, color: "#6E6B78" }}>·</span>
          <span style={{ fontSize: 26, color: "#6E6B78" }}>upload a screenshot, get the line</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
