/* ─────────────────────────────────────────────
   PhotoMock — a stand-in photo that reads as a photograph rather than an icon.

   No silhouettes: a white figure on a gradient is clip art, and clip art is
   what made the profile mocks look cheap. These are out-of-focus frames —
   a warm light where a face would be, bokeh behind it, a vignette on top —
   so the eye files them as "photo" without pretending to be a real person.
   ───────────────────────────────────────────── */

export type MockKind = "portrait" | "group" | "landscape" | "indoor";

const LAYERS: Record<MockKind, string[]> = {
  /* one subject, warm, lit from the upper left */
  portrait: [
    "radial-gradient(30% 22% at 50% 33%, rgba(255,218,200,0.95), rgba(255,190,170,0.28) 55%, transparent 78%)",
    "radial-gradient(54% 34% at 50% 100%, rgba(255,236,226,0.45), transparent 66%)",
    "radial-gradient(120% 90% at 22% 8%, rgba(255,168,140,0.35), transparent 60%)",
    "linear-gradient(170deg, #3B2A31, #1A1419)",
  ],
  /* three subjects, none of them clearly you */
  group: [
    "radial-gradient(13% 10% at 27% 37%, rgba(226,214,232,0.75), transparent 74%)",
    "radial-gradient(14% 11% at 50% 34%, rgba(234,224,240,0.85), transparent 74%)",
    "radial-gradient(13% 10% at 73% 37%, rgba(220,208,228,0.7), transparent 74%)",
    "radial-gradient(70% 30% at 50% 102%, rgba(210,200,220,0.32), transparent 64%)",
    "linear-gradient(170deg, #2C2B3A, #16151C)",
  ],
  /* a view — beautiful, and empty of you */
  landscape: [
    /* sun, then two ridges cut out of the haze — without them the frame
       reads as an empty rectangle with a dot in it */
    "radial-gradient(11% 8% at 75% 19%, rgba(255,230,196,0.95), transparent 76%)",
    "linear-gradient(28deg, transparent 46%, rgba(28,32,44,0.95) 47%)",
    "linear-gradient(-24deg, transparent 40%, rgba(38,44,60,0.9) 41%)",
    "linear-gradient(180deg, rgba(150,170,205,0.4) 0%, rgba(80,95,130,0.3) 42%, rgba(24,28,40,0.85) 72%)",
    "linear-gradient(170deg, #232838, #12141B)",
  ],
  /* cooler, harder light — the mirror shot */
  indoor: [
    "radial-gradient(24% 18% at 50% 31%, rgba(216,228,224,0.85), transparent 76%)",
    "linear-gradient(105deg, rgba(255,255,255,0.10) 0%, transparent 34%)",
    "radial-gradient(52% 30% at 50% 101%, rgba(190,206,200,0.3), transparent 66%)",
    "linear-gradient(170deg, #26302C, #141917)",
  ],
};

export function PhotoMock({
  kind,
  className,
  style,
}: {
  kind: MockKind;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background: LAYERS[kind].join(", "),
        /* the blur is what turns four gradients into a photograph */
        filter: "saturate(1.05)",
        ...style,
      }}
    >
      {/* vignette + a hair of grain, so it doesn't read as flat vector */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.055,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/></filter><rect width='60' height='60' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
    </div>
  );
}
