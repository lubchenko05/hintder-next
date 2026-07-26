"use client";

import { useEffect, useRef, useState } from "react";
import { PhotoMock, type MockKind } from "@/components/tools/PhotoMock";

/* ─────────────────────────────────────────────
   PhotoOrder — the review arrives the way it does in the app: the profile
   sits there, each photo gets judged in turn, then the fix happens and the
   score climbs. Nothing is written under the photos before its verdict
   lands — showing every note up front spoils the whole read.
   ───────────────────────────────────────────── */

type Shot = {
  id: string;
  label: string;
  note: string;
  /* what this photo is worth in slot 1 vs buried further down */
  lead: number;
  buried: number;
  kind: "face" | "group" | "gym" | "view";
};

const SHOTS: Shot[] = [
  {
    id: "view",
    label: "the mountain",
    note: "nice photo, no face — a landscape can't open a profile",
    lead: 2,
    buried: 12,
    kind: "view",
  },
  {
    id: "face",
    label: "clear face",
    note: "this is your opener — one subject, good light, actually you",
    lead: 34,
    buried: 12,
    kind: "face",
  },
  {
    id: "group",
    label: "the group shot",
    note: "she can't tell which one is you, so she assumes the worst one",
    lead: 0,
    buried: 6,
    kind: "group",
  },
  {
    id: "gym",
    label: "gym mirror",
    note: "fine at the end, fatal at the front",
    lead: 1,
    buried: 9,
    kind: "gym",
  },
];

/* the shot type each slot stands in for */
const MOCK: Record<Shot["kind"], MockKind> = {
  face: "portrait",
  group: "group",
  gym: "indoor",
  view: "landscape",
};

const START = SHOTS.map((s) => s.id);

export function PhotoOrder() {
  const [order, setOrder] = useState<string[]>(START);
  /* Kept as a hook for a future manual mode; the demo plays itself. */
  const touched = false;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [cycle, setCycle] = useState(0);
  /* how many photos have been judged so far */
  const [judged, setJudged] = useState(0);

  /* Walk the lead photo to the front, hold on the fixed profile, reset, go
     again. Keyed on a cycle counter, NOT on `order` — depending on the thing
     the effect itself changes restarts every timer on every step, and the
     sequence never gets past its first move. */
  useEffect(() => {
    if (touched) return; /* the visitor took over — stop playing at them */
    const at = (ms: number, fn: () => void) => {
      timers.current.push(setTimeout(fn, ms));
    };

    setOrder(START);
    setJudged(0);
    /* one verdict at a time, left to right */
    [1, 2, 3, 4].forEach((n) => at(500 + n * 620, () => setJudged(n)));
    at(4000, () =>
      setOrder((cur) => {
        const next = [...cur];
        const f = next.indexOf("face");
        if (f > 0) [next[f], next[f - 1]] = [next[f - 1], next[f]];
        return next;
      }),
    );
    at(5100, () =>
      setOrder((cur) => [...cur.filter((id) => id !== "group"), "group"]),
    );
    at(10500, () => setCycle((c) => c + 1));

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [cycle, touched]);

  const shots = order.map((id) => SHOTS.find((s) => s.id === id)!);
  const score = shots.reduce(
    (sum, s, i) => sum + (i === 0 ? s.lead : s.buried),
    0,
  );

  return (
    <div className="w-full select-none">
      <div className="flex items-end gap-4 mb-6">
        <span
          className="font-display tabular-nums leading-[0.8] text-[clamp(3rem,7vw,5rem)]"
          style={{
            background: "linear-gradient(95deg, #FE3C72, #FF8552)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: 400,
            transition: "opacity 0.3s",
          }}
        >
          {score}
        </span>
        <span
          className="font-display italic text-[18px] text-text-muted pb-2"
          style={{ fontWeight: 300 }}
        >
          / 100
        </span>
        <span
          className="font-display italic text-[13.5px] text-text-muted pb-2.5 leading-[1.4]"
          style={{ fontWeight: 300 }}
        >
          {touched
            ? shots[0].id === "face"
              ? "that's the whole fix — same photos, different order"
              : "still leading with the wrong one"
            : judged < SHOTS.length
              ? "reading the profile…"
              : shots[0].id === "face"
                ? "same photos. one of them moved."
                : "this is the order most profiles are in"}
        </span>
      </div>

      <div className="flex gap-3 sm:gap-4">
        {shots.map((s, i) => (
          <div key={s.id} className="flex-1 min-w-0">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                aspectRatio: "3 / 4",
                border:
                  i === 0
                    ? "1px solid rgba(254,60,114,0.7)"
                    : "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  i === 0 ? "0 18px 46px -18px rgba(254,60,114,0.65)" : "none",
                filter: touched || judged > i ? "none" : "saturate(0.5) brightness(0.75)",
                transition: "border-color 0.35s, box-shadow 0.35s, filter 0.5s",
              }}
            >
              <PhotoMock kind={MOCK[s.kind]} />

              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-14 pointer-events-none"
                style={{ background: "linear-gradient(0deg, rgba(6,5,8,0.85), transparent)" }}
              />
              <span
                className="absolute left-3 bottom-3 font-display italic text-[12px] tracking-[0.12em] uppercase transition-all duration-500"
                style={{
                  color: i === 0 ? "#FF8552" : "rgba(255,255,255,0.55)",
                  opacity: judged > i ? 1 : 0,
                  transform: judged > i ? "none" : "translateY(6px)",
                }}
              >
                {i === 0 ? "lead" : s.id === "group" ? "cut" : "keep"}
              </span>
            </div>

            <p
              className="mt-1.5 font-display italic text-[12.5px] leading-[1.45] transition-all duration-500"
              style={{
                fontWeight: 300,
                color: i === 0 ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.42)",
                opacity: touched || judged > i ? 1 : 0,
                transform: touched || judged > i ? "none" : "translateY(6px)",
              }}
            >
              {s.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
