"use client";

import Script from "next/script";
import { META_PIXEL_ID } from "@/lib/metaPixel";

/* ─────────────────────────────────────────────
   Loads the Meta pixel and fires the one PageView it needs at startup.

   afterInteractive, not beforeInteractive: the pixel must not sit in front of
   the app's own JS on a first paint that already carries a video-heavy landing
   page. Later events are mirrored through analytics.track(), not from here.

   The <noscript> beacon is what Meta's own snippet ships; it keeps the
   PageView countable for the small slice of traffic with JS disabled.
   ───────────────────────────────────────────── */

export function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
