import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/* ─────────────────────────────────────────────
   /api/revalidate — the backend's way to say "this page changed".

   Publishing writes to the database; without this the site would keep serving
   the cached version until the ISR TTL expired. The backend calls here after
   every visible change so a new post is live in seconds.

   The ISR cache is per-instance, so this refreshes the instance that answers
   the call; the rest catch up within the TTL. That's why the TTLs stay short —
   this is an accelerator, not a guarantee.
   ───────────────────────────────────────────── */

export const dynamic = "force-dynamic";

interface Body {
  tags?: string[];
  paths?: string[];
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    /* Refuse rather than fall open: unset must never mean "anyone may call". */
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }
  if (request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const tags = (body.tags ?? []).slice(0, 20);
  /* Only our own content paths — the body is attacker-shaped input even with a
     valid secret, and nothing here should be able to purge the whole site. */
  const paths = (body.paths ?? [])
    .filter((p) => /^\/(guides|stories)(\/[a-z0-9-]+)?$|^\/sitemap\.xml$/.test(p))
    .slice(0, 20);

  /* Next 16 requires a cache-life profile. "max" marks the tag stale and lets
     the next visitor be served the old copy while the new one is fetched — the
     single-argument form is deprecated and blocks the next request instead. */
  for (const tag of tags) revalidateTag(tag, "max");
  /* Both scopes, deliberately. "page" refreshes the route's content; on its
     own it left a previously-cached 404 shell in place, so a slug that had
     been requested before it existed came back with the post's body under the
     not-found page's <head> — default title, no canonical — for the whole TTL,
     which is exactly the window in which we submit the URL for indexing.
     "layout" drops that shell too. */
  for (const path of paths) {
    revalidatePath(path, "page");
    revalidatePath(path, "layout");
  }

  return NextResponse.json({ revalidated: true, tags, paths });
}
