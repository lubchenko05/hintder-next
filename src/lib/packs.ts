/* Map a top-up pack's hint count to its backend pack id (see API bl/billing HINT_PACKS). */
export function packIdForHints(hints: number): string | null {
  switch (hints) {
    case 10:
      return "topup_10";
    case 30:
      return "topup_30";
    case 100:
      return "topup_100";
    default:
      return null;
  }
}
