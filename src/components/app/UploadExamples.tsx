/* ─────────────────────────────────────────────
   UploadExamples — a worked "this is what we mean" pair inside the empty
   drop zone. People were dropping cropped faces and single bubbles; a rule
   written in prose ("bio screenshot, photos, prompts") loses to one look at
   the right shape, marked right and wrong.

   Drawn as vector — flat gradients, a crisp figure, real words — the way
   ProfileRead draws the same profile on the tools pages. The earlier version
   reused PhotoMock, whose out-of-focus gradients read as a photograph at
   thumbnail size but as a smudge once the thumbnails grew.

   Nobody in here is real: the figure is a circle and a shoulder line, the
   name is invented. Nothing to license, nobody to be sued by.

   Sizing: the caller measures the drop zone and passes a pixel width, so the
   cards take whatever the zone can spare. Everything inside is expressed in
   `em` against a font size of width/10 — one number scales the whole
   drawing, so a 104px card is a real enlargement rather than the same
   hairlines with more space around them.
   ───────────────────────────────────────────── */

import { cn } from "@/lib/utils";

export type ExampleKind = "profile" | "chat" | "yours";

/* A dating-app photo: flat gradient, hard-edged figure. Vector, so it is
   exactly as sharp at 40px as at 110px. */
function Figure({
  from,
  to,
  zoom = false,
  className,
}: {
  from: string;
  to: string;
  /** Crop in on the head, for the "just a face" card. */
  zoom?: boolean;
  className?: string;
}) {
  const id = `ue-${from.slice(1)}${to.slice(1)}${zoom ? "z" : ""}`;
  return (
    <svg
      viewBox="0 0 100 125"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="100" height="125" fill={`url(#${id})`} />
      {zoom ? (
        /* cropped in tight on the head — the mistake, drawn */
        <>
          <circle cx="50" cy="55" r="34" fill="#fff" opacity="0.92" />
          <path d="M-8 125c0-40 26-64 58-64s58 24 58 64z" fill="#fff" opacity="0.82" />
        </>
      ) : (
        <>
          <circle cx="50" cy="40" r="15" fill="#fff" opacity="0.92" />
          <path d="M16 125c0-24 15-38 34-38s34 14 34 38z" fill="#fff" opacity="0.82" />
        </>
      )}
    </svg>
  );
}

/* ── the shapes a card can take ───────────────────────────────────────── */

/** Her profile as it actually looks on the phone: photo edge to edge, the
    segment bars that say "there are more photos", and her name over the
    bottom of the picture. Those three are what make the eye say "Tinder"
    before it has read a word. */
function ProfileCard({ detailed }: { detailed: boolean }) {
  return (
    <div className="absolute inset-0 bg-[#0F0C11]">
      <Figure from="#8B5CF6" to="#FE3C72" />

      {/* photo segment bars */}
      <div className="absolute inset-x-0 top-0 flex gap-[0.25em] px-[0.5em] pt-[0.45em]">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[0.22em] flex-1 rounded-full"
            style={{
              background:
                i === 0 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>

      {/* her name, and the words we are actually asking for */}
      <div
        className="absolute inset-x-0 bottom-0 space-y-[0.3em] px-[0.7em] pb-[0.55em] pt-[2em]"
        style={{
          background:
            "linear-gradient(0deg, rgba(5,4,7,0.96) 34%, rgba(5,4,7,0.55) 62%, transparent)",
        }}
      >
        <div className="flex items-baseline gap-[0.3em]">
          <span
            className="font-display leading-none text-white"
            style={{ fontWeight: 500, fontSize: "1.2em" }}
          >
            Madison
          </span>
          <span
            className="font-display leading-none text-white/70"
            style={{ fontWeight: 300, fontSize: "0.85em" }}
          >
            26
          </span>
        </div>
        {detailed && (
          <>
            <p
              className="truncate font-display leading-[1.3] text-white/75"
              style={{ fontWeight: 300, fontSize: "0.6em" }}
            >
              Vinyl over playlists.
            </p>
            <p
              className="truncate rounded-[0.4em] border border-white/25 px-[0.45em] py-[0.3em] font-display leading-[1.3] text-white/60"
              style={{ fontWeight: 300, fontSize: "0.55em" }}
            >
              I&rsquo;ll fall for you if&hellip;
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/** The same face cropped to nothing else — no name, no bio, no prompts. */
function FaceOnly() {
  return (
    <div className="absolute inset-0 bg-[#0F0C11]">
      <Figure from="#8B5CF6" to="#FE3C72" zoom />
    </div>
  );
}

/** The chat: her line, yours, her line — a thread, not a fragment. */
function ChatCard({ lonely = false }: { lonely?: boolean }) {
  const Bubble = ({ mine, w }: { mine?: boolean; w: string }) => (
    <div
      className={cn(
        "h-[1.5em] rounded-[0.75em]",
        mine ? "self-end bg-flame/70" : "self-start bg-white/20",
      )}
      style={{ width: w }}
    />
  );
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0F0C11]">
      <div className="flex items-center gap-[0.55em] border-b border-white/10 px-[0.7em] py-[0.6em]">
        <div className="relative h-[1.9em] w-[1.9em] shrink-0 overflow-hidden rounded-full">
          <Figure from="#8B5CF6" to="#FE3C72" />
        </div>
        <span
          className="font-display leading-none text-white/70"
          style={{ fontWeight: 400, fontSize: "0.72em" }}
        >
          Madison
        </span>
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col gap-[0.6em] px-[0.7em]",
          lonely ? "justify-center" : "pt-[0.8em]",
        )}
      >
        {lonely ? (
          <Bubble w="72%" />
        ) : (
          <>
            <Bubble w="64%" />
            <Bubble mine w="52%" />
            <Bubble w="76%" />
            <Bubble mine w="44%" />
          </>
        )}
      </div>
    </div>
  );
}

/** Your own profile — the photos in their running order AND the words
    under them, because the bio is half of what gets scored. */
function GridCard({
  single = false,
  detailed = false,
}: {
  single?: boolean;
  detailed?: boolean;
}) {
  const tiles: [string, string][] = [
    ["#8B5CF6", "#FE3C72"],
    ["#FE3C72", "#FF8552"],
    ["#3B82F6", "#8B5CF6"],
    ["#FF8552", "#FACC15"],
    ["#14B8A6", "#3B82F6"],
    ["#FE3C72", "#8B5CF6"],
  ];
  if (single) {
    return (
      <div className="absolute inset-0 bg-[#0F0C11]">
        <Figure from="#8B5CF6" to="#FE3C72" zoom />
      </div>
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col gap-[0.4em] bg-[#0F0C11] p-[0.5em]">
      <div
        className={cn("grid grid-cols-3 gap-[0.35em]", detailed ? "" : "flex-1")}
        style={detailed ? { height: "52%" } : undefined}
      >
        {tiles.map(([a, b], i) => (
          <div key={i} className="relative overflow-hidden rounded-[0.3em]">
            <Figure from={a} to={b} />
          </div>
        ))}
      </div>

      {detailed ? (
        <div className="flex flex-1 flex-col justify-center gap-[0.3em] px-[0.15em]">
          <div className="flex items-baseline gap-[0.3em]">
            <span
              className="font-display leading-none text-white"
              style={{ fontWeight: 500, fontSize: "0.95em" }}
            >
              Alex
            </span>
            <span
              className="font-display leading-none text-white/60"
              style={{ fontWeight: 300, fontSize: "0.72em" }}
            >
              29
            </span>
          </div>
          <p
            className="truncate font-display leading-[1.3] text-white/70"
            style={{ fontWeight: 300, fontSize: "0.58em" }}
          >
            Climbs badly, cooks well.
          </p>
          <p
            className="truncate rounded-[0.35em] border border-white/22 px-[0.4em] py-[0.25em] font-display leading-[1.3] text-white/55"
            style={{ fontWeight: 300, fontSize: "0.52em" }}
          >
            My simple pleasure&hellip;
          </p>
        </div>
      ) : (
        <div className="space-y-[0.3em] pb-[0.1em]">
          <div className="h-[0.42em] w-full rounded-full bg-white/25" />
          <div className="h-[0.42em] w-[70%] rounded-full bg-white/25" />
        </div>
      )}
    </div>
  );
}

/* ── one right answer and one wrong one per form ──────────────────────── */

type Item = { node: React.ReactNode; caption: string; good: boolean };

const sets = (detailed: boolean): Record<ExampleKind, Item[]> => ({
  profile: [
    { node: <ProfileCard detailed={detailed} />, caption: "her profile", good: true },
    { node: <FaceOnly />, caption: "just a face", good: false },
  ],
  chat: [
    { node: <ChatCard />, caption: "the thread", good: true },
    { node: <ChatCard lonely />, caption: "one message", good: false },
  ],
  yours: [
    { node: <GridCard detailed={detailed} />, caption: "photos + bio", good: true },
    { node: <GridCard single />, caption: "one selfie", good: false },
  ],
});

export const EXAMPLE_COUNT: Record<ExampleKind, number> = {
  profile: 2,
  chat: 2,
  yours: 2,
};

/** width / height. A 4:5 crop rather than a full 9:16 screen: the card can
 *  then be much wider for the same height budget, which is what lets real
 *  words fit inside it. */
export const EXAMPLE_ASPECT = 4 / 5;

/* ── the verdict badges ───────────────────────────────────────────────── */

function Badge({ good }: { good: boolean }) {
  return (
    <span
      className="absolute flex items-center justify-center rounded-full"
      style={{
        top: "0.4em",
        right: "0.4em",
        width: "1.9em",
        height: "1.9em",
        background: good ? "#22C55E" : "#EF4444",
        boxShadow: "0 0.15em 0.5em rgba(0,0,0,0.55)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[1.2em] w-[1.2em] text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {good ? <path d="M4 12.5l5.5 5.5L20 6.5" /> : <path d="M6 6l12 12M18 6L6 18" />}
      </svg>
    </span>
  );
}

export function UploadExamples({
  kind,
  width,
  showDivider,
  beside = false,
}: {
  kind: ExampleKind;
  /** Card width in px, already fitted to the zone by the caller. */
  width: number;
  /** Dropped on short zones, where the rule costs more height than it earns. */
  showDivider: boolean;
  /** Sitting to the right of the copy rather than under it, so the block
   *  must size to its contents instead of filling the copy's width. */
  beside?: boolean;
}) {
  /* Below this the bio and prompt lines stop being words and start being
     grey mush, so the card shows the photo and her name only. */
  const detailed = width >= 72;
  const items = sets(detailed)[kind];
  const gap = Math.round(width * 0.22);
  const captionSize = Math.min(14, Math.max(8.5, width * 0.2));

  return (
    /* aria-hidden + pointer-events-none: this is an illustration sitting on
       top of the file-picker label, and a tap anywhere must still open the
       picker rather than landing on a card. */
    <div
      aria-hidden
      className={cn(
        "pointer-events-none flex flex-col items-center select-none",
        beside ? "w-auto" : "w-full",
      )}
      style={{ gap: showDivider ? 7 : 5 }}
    >
      {showDivider && (
        <div
          className="flex w-full items-center gap-2"
          style={{ maxWidth: items.length * width + (items.length - 1) * gap + 60 }}
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <span
            className="font-display uppercase tracking-[0.16em] text-text-muted/60"
            style={{ fontWeight: 400, fontSize: Math.min(11.5, captionSize) }}
          >
            drop this
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>
      )}

      <div className="flex items-start justify-center" style={{ gap }}>
        {items.map((item, i) => (
          <div
            key={i}
            /* shrink-0: the strip is only as wide as the copy above it, and
               the cards are allowed to be wider than that — without this
               flex quietly squeezes them back. */
            className="flex shrink-0 flex-col items-center"
            style={{ width, gap: Math.max(3, width * 0.08) }}
          >
            <div
              className="relative w-full overflow-hidden border"
              /* fontSize is the single knob every inner `em` hangs off. */
              style={{
                height: Math.round(width / EXAMPLE_ASPECT),
                fontSize: width / 10,
                borderRadius: Math.max(4, width * 0.09),
                borderColor: item.good
                  ? "rgba(34,197,94,0.45)"
                  : "rgba(239,68,68,0.4)",
                opacity: item.good ? 1 : 0.72,
              }}
            >
              {item.node}
              <Badge good={item.good} />
            </div>
            <span
              className="whitespace-nowrap text-center font-display italic leading-[1.2]"
              style={{
                fontWeight: 300,
                fontSize: captionSize,
                color: item.good
                  ? "rgba(255,255,255,0.62)"
                  : "rgba(255,255,255,0.38)",
              }}
            >
              {item.caption}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
