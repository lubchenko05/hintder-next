/* ─────────────────────────────────────────────
   The tool catalogue — one source of truth for the marketing pages, the
   footer, the header dropdown and the in-app cross-links, so a tool can't
   exist in one place and be missing from another.

   `href` is where the tool actually runs; `slug` is its marketing page.
   ───────────────────────────────────────────── */

import type { ArtSpec } from "@/components/tools/SectionArt";

export type ToolSlug =
  | "read-her-profile"
  | "decode-her-reply"
  | "rate-your-profile";

export interface Tool {
  slug: ToolSlug;
  /** Where the tool runs. */
  href: string;
  name: string;
  /** One line, used on cards and in menus. */
  blurb: string;
  /** Marketing page headline, split so the tail can carry the accent. */
  title: string;
  titleAccent: string;
  /** The promise, two sentences at most. */
  lede: string;
  /** What you put in. */
  input: string;
  /** What comes back — the actual deliverables, no adjectives. */
  gives: string[];
  /** The moment it's for. */
  useWhen: string;
  cta: string;
  /* ── the long-form body: this is what a search engine reads, and what a
        visitor who isn't ready to click yet actually needs ── */
  /** How it runs, in order. Three or four steps, no more. */
  steps: { title: string; body: string }[];
  /** Sections of real prose. Each is an h2 on the page, and each carries a
      small moving thing so the page isn't three columns of text. */
  sections: { heading: string; body: string[]; art: ArtSpec }[];
  /** Questions people actually type into Google before they trust a tool. */
  faq: { q: string; a: string }[];
}

export const TOOLS: Tool[] = [
  {
    slug: "read-her-profile",
    href: "/app",
    name: "Read her profile",
    blurb: "Openers written for that exact person, not for anyone.",
    title: "She gave you the hooks.",
    titleAccent: "We just use them.",
    lede: "Her profile is full of openings — you just can't see them at 1am. Drop the screenshots and get a first line she'd have to answer, in your voice, in about ten seconds.",
    input: "1–5 screenshots of her profile",
    gives: [
      "the hooks she planted, named out loud",
      "openers in the voice you pick — playful, warm, blunt",
      "why each line lands, so you can tell which one is you",
      "follow-ups once she answers, and the ask when it's time",
    ],
    useWhen: "You matched, the profile is open, and every line you draft sounds like every other guy.",
    cta: "read a profile",
    steps: [
      {
        title: "Screenshot her profile",
        body: "Photos, bio, prompts — whatever she filled in. One screenshot works; five work better, because half of what makes an opener specific is in the picture she didn't caption.",
      },
      {
        title: "We read what she planted",
        body: "Every profile is a set of invitations: a book she named instead of saying she reads, a caption that's really a dare, a prompt she answered with a date idea. We pull those out and tell you which ones are worth using.",
      },
      {
        title: "You get openers built on them",
        body: "Three to five lines in the voice you choose, each tied to something she wrote, plus a note on why it works so you can tell which one sounds like you and which one doesn't.",
      },
      {
        title: "Then the follow-ups",
        body: "When she answers, the same read carries into what to send next — and into the ask, once the thread has earned it.",
      },
    ],
    sections: [
      {
        heading: "Why \u201cHey, how's your week going?\u201d gets nothing",
        body: [
          "It isn't rude and it isn't cringe. It's answerable by anyone, which means it tells her nothing about whether you read a word she wrote. She has twenty of those in her inbox and no reason to pick yours.",
          "The openers that get answered do one thing: they prove you looked. A line about her third photo can't be copy-pasted to anyone else, and she can feel that in the first second.",
        ],
        art: { kind: "deadline" },
      },
      {
        heading: "What counts as a hook",
        body: [
          "A hook is anything she chose to put there that carries an opinion, a claim or a story. \u201cNorwegian Wood is in my top 5\u201d is a hook. \u201cLove to travel\u201d isn't — it's filler, and building on filler is how you end up sounding generic.",
          "The strongest hooks are the ones she's slightly proud of and the ones she's daring you to challenge. Both give her something to say back, which is the only job an opener has.",
        ],
        art: { kind: "hookmeter" },
      },
      {
        heading: "Written in your voice, not ours",
        body: [
          "Pick playful, warm, or blunt before we write, and change it per match. The tool matches her energy rather than overriding it: if her profile is dry and deadpan, a line full of exclamation marks reads as a different person showing up.",
          "You keep the openers you paid for. They stay on the match, so a thread you come back to next week still has them.",
        ],
        art: { kind: "voices" },
      },
    ],
    faq: [
      {
        q: "Do I need her whole profile?",
        a: "No. One screenshot of the bio is enough to start. More photos and prompts mean more specific lines, because there's more she actually said.",
      },
      {
        q: "Will it sound like AI wrote it?",
        a: "That's the thing we tune hardest against. No em-dash speeches, no compliments about her smile, no pretending a joke landed. If a line reads like a template, it failed.",
      },
      {
        q: "What does it cost?",
        a: "One hint per read, and the read includes the openers. The first hint is free, and you don't need a card to use it.",
      },
      {
        q: "Does it work on Hinge, Tinder and Bumble?",
        a: "Yes — it reads screenshots, so the app doesn't matter. Hinge prompts tend to give the richest hooks because she's answering questions rather than filling a box.",
      },
    ],
  },
  {
    slug: "decode-her-reply",
    href: "/decode",
    name: "Decode her reply",
    blurb: "What she actually meant, and the line to send back.",
    title: "Five words.",
    titleAccent: "A whole paragraph underneath.",
    lede: "Stop rereading the same four words. In one tap you get what she actually meant, whether she's still warm, and the exact line to send back — with the hour to send it.",
    input: "her message, or a screenshot of the thread",
    gives: [
      "what she meant, subtext included",
      "how interested she still is, and whether it's cooling",
      "two or three replies you can send as they are",
      "when to send them — and the one thing that would kill it",
    ],
    useWhen: "She replied something short, and you're rewriting your answer for the third time.",
    cta: "decode a reply",
    steps: [
      {
        title: "Paste what she sent",
        body: "Type the message, or screenshot the thread if the last few messages matter — and they usually do, because tone lives in the sequence, not the sentence.",
      },
      {
        title: "We read it against the thread",
        body: "The same four words mean opposite things depending on what came before them. \u201cMaybe\u201d after a plan is interest waiting for a time; \u201cmaybe\u201d after three questions in a row is a door closing.",
      },
      {
        title: "You get the read and the lines",
        body: "What she meant, how warm she still is, whether it's cooling — plus two or three replies you can send as they are, the timing to send them on, and the one move that would kill it.",
      },
    ],
    sections: [
      {
        heading: "Short replies aren't rejection — they're a question",
        body: [
          "A one-line answer usually means the thread has stopped giving her a reason to write more. That's a format problem, not a verdict on you, and it's fixable in a single message.",
          "The mistake is answering the words instead of the temperature. If she's warm and vague, she wants a plan. If she's cool and polite, another question is the worst thing you can send.",
        ],
        art: { kind: "context" },
      },
      {
        heading: "What \u201cI've been so busy\u201d actually does",
        body: [
          "It's the lowest-effort way to keep a door open. It isn't a no, and it isn't an invitation to chase — both of those readings lose the thread, one by folding and one by pushing.",
          "The move is to take the pressure off and leave one clear hook she can pick up when her week ends. We write that line for you, and tell you when to send it.",
        ],
        art: { kind: "fork" },
      },
      {
        heading: "Timing is half the reply",
        body: [
          "The right words at the wrong hour read as needy or as indifferent. A cooling thread needs distance before it needs charm; a warm one dies if you sit on it overnight.",
          "Every decode comes with when to send, not just what — because the two aren't separable in practice.",
        ],
        art: { kind: "clock" },
      },
    ],
    faq: [
      {
        q: "Can it tell if she's losing interest?",
        a: "It flags cooling explicitly, and it's blunt about it. That matters more than the wording: a warm thread and a fading one need opposite replies.",
      },
      {
        q: "Do I have to type her message out?",
        a: "No. A screenshot of the chat works, and it's usually better, because the read uses the messages around it.",
      },
      {
        q: "Are the replies ready to send?",
        a: "Yes — they're texts, not advice about texts. Copy one, change a word if you want it to sound more like you, send it.",
      },
      {
        q: "What if she said something I don't want to answer?",
        a: "You still get the read. Sometimes the honest answer is that the move is to stop, and the tool will say so instead of selling you a clever line.",
      },
    ],
  },
  {
    slug: "rate-your-profile",
    href: "/optimize",
    name: "Rate your profile",
    blurb: "An honest score, better bios, and which photo to cut.",
    title: "You're not unlucky.",
    titleAccent: "You're leading with the wrong photo.",
    lede: "Find out why she keeps swiping past. One honest score, the photo that's quietly costing you every match, and a bio that finally sounds like a person — yours.",
    input: "your photos in order, plus your bio if you have one",
    gives: [
      "a score out of 100 and the two-second first impression",
      "a verdict per photo — lead, keep, move or cut",
      "two or three bio rewrites in your own voice",
      "the three fixes that move the needle most",
    ],
    useWhen: "You're getting matches you don't want, or none at all, and can't tell which part is the problem.",
    cta: "rate my profile",
    steps: [
      {
        title: "Upload your photos in order",
        body: "Order matters more than the photos themselves — she sees the first one for about a second and decides from there. Send them the way they appear in the app.",
      },
      {
        title: "Add your bio if you have one",
        body: "Optional, but it's the part with the most upside: a bio takes two minutes to change and most men's bios are four clichés in a row.",
      },
      {
        title: "You get a score and a verdict per slot",
        body: "Out of 100, with the two-second first impression spelled out. Then every photo gets lead, keep, move or cut, with the reason — and the bio comes back rewritten two or three ways in your voice.",
      },
    ],
    sections: [
      {
        heading: "It's almost never all your photos",
        body: [
          "Usually one slot is doing the damage: a group shot where nobody can tell which one is you, sunglasses in every frame, or four pictures taken the same afternoon so she can't picture a life around you.",
          "Cutting that one photo changes more than adding three new ones, and it costs you nothing but a tap.",
        ],
        art: { kind: "funnel" },
      },
      {
        heading: "Your first photo is the whole funnel",
        body: [
          "Everything else only gets seen if the first one earns a second look. That's why the review names which of your existing photos should lead, instead of telling you to go get better ones.",
          "A clear face, one subject, decent light. That's the bar, and most profiles fail it in the first slot while having a perfectly good photo sitting in slot four.",
        ],
        art: { kind: "slots" },
      },
      {
        heading: "Bios that say something only you could say",
        body: [
          "\u201cFluent in sarcasm.\u201d \u201cPartner in crime.\u201d \u201cWork hard, play harder.\u201d She has read each of those a hundred times this week, and they describe no one.",
          "The rewrites keep your actual details — what you cook, where you disappear to on Sundays — and cut the parts that could belong to anybody. Same person, finally legible.",
        ],
        art: { kind: "redpen" },
      },
    ],
    faq: [
      {
        q: "Is the score real or just flattery?",
        a: "It's blunt on purpose. Most profiles land in the 40s and 50s on the first pass, and the number only matters as a reference point for the fixes underneath it.",
      },
      {
        q: "Do you rate how I look?",
        a: "No. It reviews choices you can change — which photo leads, what's in frame, what the bio says. Nothing about it is a verdict on your face.",
      },
      {
        q: "How many photos should I send?",
        a: "All the ones on your profile, in order. Four to six is typical, and the order is part of what gets reviewed.",
      },
      {
        q: "Can I run it again after I fix things?",
        a: "Yes, and it's worth it — the second pass reviews the new order and usually finds a smaller, sharper set of fixes.",
      },
    ],
  },
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

/* The questions people ask before they'll spend a hint. Lives here so the
   page and its rich-result markup can't drift apart. */
export const TOOLS_FAQ: { q: string; a: string }[] = [
  {
    q: "What do I actually get?",
    a: "Lines you can send. Not tips, not a framework — the opener, the reply, the rewritten bio, ready to copy. Everything else on the page exists to explain why that line is the one.",
  },
  {
    q: "Is the first one really free?",
    a: "Yes. Three hints, no card, no trial that quietly bills you. You'll know whether it's any good long before you're asked to pay.",
  },
  {
    q: "Will it sound like a bot wrote it?",
    a: "That's the whole game. No compliments about her smile, no “I couldn't help but notice”, no em-dash speeches. You pick the voice, and if a line reads like a template it didn't ship.",
  },
  {
    q: "Which apps does it work with?",
    a: "All of them — it reads screenshots, so Hinge, Tinder, Bumble and anything else are the same to it. Hinge prompts tend to give the sharpest openers because she's answering questions instead of filling a box.",
  },
  {
    q: "What happens to the screenshots I upload?",
    a: "They're used to produce your read and nothing else. We don't sell them, we don't train a public model on them, and you can delete a match and its images from the app whenever you want.",
  },
  {
    q: "Do I need all three tools?",
    a: "No. Most people start where it hurts — usually the reply they can't answer — and pick up the others when they hit that moment. One hint is one tool, one time.",
  },
];
