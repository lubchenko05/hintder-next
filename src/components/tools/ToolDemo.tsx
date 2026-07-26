"use client";

import { DecodePlay } from "@/components/tools/DecodePlay";
import { PhotoOrder } from "@/components/tools/PhotoOrder";
import { ProfileRead } from "@/components/tools/ProfileRead";

/* ─────────────────────────────────────────────
   ToolDemo — one interactive per tool, built for THESE pages. Nothing here is
   shared with the home page: the landing plays its demos at you, these are
   operated by the visitor.
   ───────────────────────────────────────────── */

export function ToolDemo({ slug }: { slug: string }) {
  if (slug === "decode-her-reply") return <DecodePlay />;
  if (slug === "rate-your-profile") return <PhotoOrder />;
  return <ProfileRead />;
}
