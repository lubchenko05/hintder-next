import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SITE_URL } from "@/lib/site";

/* Google Analytics 4 measurement id (public by design). GA4 "enhanced
   measurement" auto-tracks SPA route changes via history events, so the base
   gtag snippet is enough — no manual page_view wiring needed. */
const GA_MEASUREMENT_ID = "G-EV5E2RC9T9";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08070A",
};

const DESCRIPTION =
  "Upload a dating profile screenshot, get an opener that doesn't sound like everyone else — then a reply coach for the whole conversation. Your AI dating wingman.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hintder — Your Dating Wingman",
    template: "%s · Hintder",
  },
  description: DESCRIPTION,
  applicationName: "Hintder",
  keywords: [
    "dating wingman",
    "tinder openers",
    "hinge openers",
    "AI dating assistant",
    "what to message on a dating app",
    "reply coach",
  ],
  openGraph: {
    title: "Hintder — Your Dating Wingman",
    description: DESCRIPTION,
    siteName: "Hintder",
    type: "website",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hintder — Your Dating Wingman",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${mono.variable} dark`}
    >
      <body className="min-h-dvh flex flex-col font-sans antialiased">
        {/* Capture the PWA install event as early as possible — it can fire
            before React mounts, so stash it on window and notify the provider. */}
        <Script id="pwa-install-capture" strategy="beforeInteractive">
          {`(function(){window.__hintderBIP=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__hintderBIP=e;window.dispatchEvent(new Event('hintder:bip'));});window.addEventListener('appinstalled',function(){window.__hintderBIP=null;window.dispatchEvent(new Event('hintder:installed'));});})();`}
        </Script>
        <Providers>{children}</Providers>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
