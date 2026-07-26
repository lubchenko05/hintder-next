import { ToolShell } from "@/components/layout/ToolShell";

/* ─────────────────────────────────────────────
   Shared chrome for the standalone tools. It lives in a layout — not inside
   each page — so moving between /decode and /optimize keeps the header and
   the sidebar mounted instead of tearing them down and rebuilding them, which
   is what made every click flash.

   The route group has no URL segment: the paths stay /decode and /optimize.
   ───────────────────────────────────────────── */
export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToolShell>{children}</ToolShell>;
}
