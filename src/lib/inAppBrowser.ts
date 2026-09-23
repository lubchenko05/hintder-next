/* ─────────────────────────────────────────────
   In-app browser detection.

   Nearly all of our paid traffic arrives inside Facebook's or Instagram's
   built-in browser: in the Amplitude export, 156 of 157 visitors to /app were
   in one. Two things break there that work everywhere else:

   - Google refuses to run its sign-in page inside an embedded webview
     (error 403 disallowed_useragent — policy since 2021). Our Google button
     cannot succeed, however the popup is opened.
   - A passwordless email link opens from the mail app in the SYSTEM browser,
     not back in the webview it was requested from — so whatever the webview
     stored locally is not there when the link lands.

   Detection is by user agent, which is exactly what Google keys its block on.
   ───────────────────────────────────────────── */

export type InAppBrowser = "facebook" | "instagram" | "tiktok" | "other";

export function detectInAppBrowser(
  ua: string = typeof navigator === "undefined" ? "" : navigator.userAgent,
): InAppBrowser | null {
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i.test(ua)) return "facebook";
  if (/BytedanceWebview|musical_ly|TikTok/i.test(ua)) return "tiktok";
  /* Other embedded browsers Google blocks the same way. */
  if (/LinkedInApp|Snapchat|\bLine\/|Twitter for/i.test(ua)) return "other";
  return null;
}

export function inAppBrowserName(kind: InAppBrowser): string {
  switch (kind) {
    case "instagram":
      return "Instagram";
    case "facebook":
      return "Facebook";
    case "tiktok":
      return "TikTok";
    default:
      return "this app";
  }
}

/** A URL that asks the OS to reopen `url` in the real browser, or null when
 *  the platform offers no such hand-off.
 *
 *  Android: an intent:// URL naming Chrome — honoured by the Facebook and
 *  Instagram webviews. iOS: the x-safari-https scheme, which recent iOS
 *  versions route to Safari; older ones ignore it, which is why the sign-in
 *  page also tells people where the in-app "open in browser" menu is. */
export function systemBrowserUrl(
  url: string,
  ua: string = typeof navigator === "undefined" ? "" : navigator.userAgent,
): string | null {
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return null;
  }
  if (/Android/i.test(ua)) {
    const rest = `${target.host}${target.pathname}${target.search}${target.hash}`;
    return `intent://${rest}#Intent;scheme=https;package=com.android.chrome;end`;
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return `x-safari-${target.href}`;
  }
  return null;
}

export function isAndroid(
  ua: string = typeof navigator === "undefined" ? "" : navigator.userAgent,
): boolean {
  return /Android/i.test(ua);
}
