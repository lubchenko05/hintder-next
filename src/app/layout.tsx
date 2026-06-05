import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SITE_URL } from "@/lib/site";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
