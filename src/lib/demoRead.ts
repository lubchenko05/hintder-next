import type { ProfileAnalysis, GeneratedMessage } from "@/types";

/* ─────────────────────────────────────────────
   Bundled sample read for the "try it without uploading" demo (Track 3 —
   activation). Lets a visitor experience a full profile read + openers with NO
   upload, NO signup, NO hint spent and NO paywall — the "aha" up front. Any
   action that would cost a hint (tweak / pick / read her reply) is soft-gated to
   sign-up instead. Kept deliberately strong so the demo sells the real thing.
   ───────────────────────────────────────────── */

export const DEMO_ANALYSIS: ProfileAnalysis = {
  name: "Maya",
  age: 26,
  vibe: "Warm, a little sarcastic, into the outdoors — not trying too hard.",
  angle: "humor",
  interests: ["hiking", "specialty coffee", "live music", "her dog Juno"],
  avoid: [
    "Generic 'hey' or 'how's your day'",
    "Complimenting her looks first",
    "Long paragraphs — she writes short",
  ],
  hooks: [
    { topic: "The trail-summit photo", why: "She's clearly proud of it — an easy, genuine in." },
    { topic: "Her dog Juno in two photos", why: "Repeated = she cares. Low-risk warm opener." },
    { topic: "Bio line: 'will judge your coffee order'", why: "A built-in bit to play along with." },
  ],
  detailedRead:
    "Three photos: a summit selfie with a real view behind her (hiking is a genuine hobby, not a prop), " +
    "a candid laughing shot at what looks like a small live gig, and one on a couch with a scruffy dog " +
    "(Juno, named in the bio). Style is low-effort-cool: no heavy filters, no group-shot guessing games. " +
    "Bio is short and dry — 'will judge your coffee order, gently' and 'weekends = trails or a very slow " +
    "brunch'. She reads as someone who values wit over compliments and will mirror your energy: keep it " +
    "short, specific and a little playful. Several real threads to pull (hiking, the gig, Juno, coffee " +
    "snobbery) — no need to fixate on any one of them.",
  cosmicRead:
    "The type who's unimpressed by effort but disarmed by a good, specific line. Reward the wit.",
  greenLightTopics: ["Best local trail", "Her coffee snob takes", "Juno", "That gig / live music"],
  timingWindow: "Evenings — she's out or busy on weekend days.",
  photoContext: [
    {
      caption: "Summit selfie, real view",
      vibe: "Proud, outdoorsy, unposed",
      tags: ["hiking", "outdoors", "confident"],
      unlocks: "Ask which trail — or bet she can't name a harder one.",
      g1: "#FE3C72",
      g2: "#FF8552",
      art: 0,
    },
    {
      caption: "Laughing at a small gig",
      vibe: "Social, easy, fun",
      tags: ["live music", "candid", "warm"],
      unlocks: "Guess the genre; tease her taste.",
      g1: "#7C5CFF",
      g2: "#FE3C72",
      art: 1,
    },
    {
      caption: "Couch with Juno the dog",
      vibe: "Soft, homebody, genuine",
      tags: ["dog", "cozy", "real"],
      unlocks: "Juno is the safest, warmest way in.",
      g1: "#22B8F0",
      g2: "#7C5CFF",
      art: 2,
    },
  ],
};

export const DEMO_MESSAGES: GeneratedMessage[] = [
  {
    id: "demo-1",
    text: "Okay, the summit view is doing a lot of heavy lifting on this profile. Which trail — and be honest, did you actually make it up or is that a stock photo",
    category: "best",
    label: "playful challenge",
    cringeRisk: 8,
    tone: "funny",
    whyItWorks: "Teases her proudest photo — invites a fun defense, not a yes/no.",
  },
  {
    id: "demo-2",
    text: "I feel like Juno is the real one running this account. Does she approve dates or is that above her pay grade",
    category: "funny",
    label: "warm + safe",
    cringeRisk: 6,
    tone: "funny",
    whyItWorks: "Dog opener = low risk, high warmth. Everyone answers about their dog.",
  },
  {
    id: "demo-3",
    text: "'Will judge your coffee order' — bold words. What's the order that instantly loses your respect",
    category: "flirty",
    label: "plays her bit",
    cringeRisk: 12,
    tone: "smart",
    whyItWorks: "Runs with her own joke — she set the game, you're playing it.",
  },
];
