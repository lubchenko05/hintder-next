"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   DecodePlay — one message on stage at a time. It types itself in, the read
   builds under it in the order the tool produces it, then the whole thing
   clears and the next message types in.

   Deliberately NOT a list with one row lit: showing all four at once spoils
   every answer before its turn, and the point is the moment of decoding.
   ───────────────────────────────────────────── */

type Read = {
  said: string;
  meant: string;
  temp: number; /* 0 gone cold … 100 all in */
  mood: string;
  reply: string;
  when: string;
  never: string;
};

const READS: Read[] = [
  {
    said: "haha maybe, we'll see",
    meant:
      "She's in. “Maybe” is her asking you to pick a time — she's not going to do it for you.",
    temp: 72,
    mood: "playful, waiting",
    reply:
      "Thursday, 8pm, the wine place on 5th. I'll book it — say no if you hate wine.",
    when: "now, while she's still on her phone",
    never: "asking “so what do you want to do?” back",
  },
  {
    said: "sorry!! this week has been insane",
    meant:
      "Not a no. It's the lowest-effort way to keep the door open, and she's watching whether you fold or lead.",
    temp: 48,
    mood: "stretched, still interested",
    reply:
      "No stress. Ping me when the week lets go of you — I'll have a better plan than “drinks”.",
    when: "tomorrow afternoon, let today breathe",
    never: "a paragraph about how busy you are too",
  },
  {
    said: "k",
    meant:
      "Something landed dry two messages ago, or you asked for too much too early. She's seeing if you panic.",
    temp: 18,
    mood: "flat, testing",
    reply: "That “k” has a whole paragraph behind it. Out with it.",
    when: "wait an hour — answering instantly reads as nervous",
    never: "sending four more messages to fix it",
  },
  {
    said: "we should hang out sometime",
    meant:
      "That's an invitation with no date on it. She's handed you the plan and is waiting for you to make it real.",
    temp: 66,
    mood: "warm, unspecific",
    reply: "Sometime is a trap. Tuesday or Saturday?",
    when: "within the hour, while it's still her idea",
    never: "agreeing enthusiastically and naming nothing",
  },
];

export function DecodePlay() {
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState(0);
  const [step, setStep] = useState(-1); /* -1 nothing · 0 meaning · 1 temp · 2 line · 3 warning */
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const r = READS[i];

  useEffect(() => {
    const at = (ms: number, fn: () => void) => {
      timers.current.push(setTimeout(fn, ms));
    };
    setTyped(0);
    setStep(-1);
    setLeaving(false);

    /* she types it */
    let n = 0;
    const typing = setInterval(() => {
      n += 1;
      setTyped(n);
      if (n >= r.said.length) {
        clearInterval(typing);
        /* then it comes apart */
        at(620, () => setStep(0));
        at(1350, () => setStep(1));
        at(2050, () => setStep(2));
        at(2800, () => setStep(3));
        at(7400, () => setLeaving(true));
        at(8000, () => setI((v) => (v + 1) % READS.length));
      }
    }, 52);

    return () => {
      clearInterval(typing);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [i, r.said]);

  const shown = (at: number) => ({
    opacity: step >= at && !leaving ? 1 : 0,
    transform: step >= at && !leaving ? "none" : "translateY(10px)",
    transition: "opacity 0.55s ease-out, transform 0.55s cubic-bezier(0.2,0.7,0.3,1)",
  });

  return (
    <div className="w-full">
      <div
        className="font-display italic text-[11px] tracking-[0.2em] uppercase text-text-muted/60 mb-5"
        style={{ fontWeight: 400 }}
      >
        {step < 0 ? "she's typing…" : "what it actually said"}
      </div>

      {/* her message, typed out */}
      <div
        className="inline-block rounded-[22px] rounded-bl-md px-6 py-4 max-w-[92%]"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.09)",
          opacity: leaving ? 0 : 1,
          transition: "opacity 0.5s",
        }}
      >
        <span
          className="font-display text-[clamp(1.15rem,2vw,1.75rem)] leading-[1.3] text-white/90"
          style={{ fontWeight: 400 }}
        >
          {r.said.slice(0, typed)}
        </span>
        <span
          className="inline-block w-[2px] align-middle ml-1"
          style={{
            height: "0.95em",
            background: "#FE3C72",
            opacity: typed < r.said.length ? 1 : 0,
            animation: "dp-caret 1s steps(2) infinite",
          }}
        />
      </div>

      {/* the read */}
      <div className="mt-8 space-y-6 min-h-[clamp(300px,34vh,380px)]">
        <p
          className="font-display text-[clamp(1.15rem,1.9vw,1.7rem)] leading-[1.45] max-w-4xl"
          style={{ fontWeight: 300, color: "rgba(255,255,255,0.92)", ...shown(0) }}
        >
          {r.meant}
        </p>

        <div className="max-w-xl" style={shown(1)}>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: step >= 1 && !leaving ? `${r.temp}%` : "0%",
                background: "linear-gradient(95deg, #FE3C72, #FF8552)",
                transition: "width 0.9s cubic-bezier(0.2,0.7,0.3,1)",
              }}
            />
          </div>
          <div
            className="mt-2 font-display italic text-[13px] text-text-muted"
            style={{ fontWeight: 300 }}
          >
            {r.mood}
          </div>
        </div>

        <div
          className="pl-6"
          style={{ borderLeft: "2px solid var(--color-flame)", ...shown(2) }}
        >
          <p
            className="font-display text-[clamp(1.1rem,1.7vw,1.5rem)] text-text leading-[1.4] max-w-4xl"
            style={{ fontWeight: 400 }}
          >
            {r.reply}
          </p>
          <p
            className="mt-2.5 font-display italic text-[13.5px] text-text-muted"
            style={{ fontWeight: 300 }}
          >
            send it {r.when}
          </p>
        </div>

        <p
          className="font-display italic text-[15px] leading-[1.5] max-w-3xl"
          style={{ fontWeight: 300, color: "var(--color-danger)", ...shown(3) }}
        >
          don&apos;t: {r.never}
        </p>
      </div>

      <style jsx>{`
        @keyframes dp-caret {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
