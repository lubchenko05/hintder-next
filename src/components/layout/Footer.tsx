import Link from "next/link";
import { Mark } from "@/components/brand/Mark";

const footerLinks = [
  { label: "Guides", href: "/guides" },
  { label: "Stories", href: "/stories" },
  { label: "Pricing", href: "/pricing" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund", href: "/refund" },
] as const;

const featuredBadges = [
  {
    href: "https://twelve.tools",
    src: "https://twelve.tools/badge0-dark.svg",
    alt: "Featured on Twelve Tools",
  },
  {
    href: "https://wired.business",
    src: "https://wired.business/badge0-dark.svg",
    alt: "Featured on Wired Business",
  },
  {
    href: "https://fazier.com",
    src: "https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=dark",
    alt: "Featured on Fazier",
  },
  {
    href: "https://startupfa.me/s/hintder?utm_source=hintder.ai",
    src: "https://startupfa.me/badges/featured/dark.webp",
    alt: "hintder - Featured on Startup Fame",
  },
  {
    href: "https://auraplusplus.com/projects/hintder-ai-dating-profile-opener-coach",
    src: "https://auraplusplus.com/images/badges/featured-on-dark.svg",
    alt: "Featured on Aura++",
  },
  {
    href: "https://saasfame.com/item/hintder",
    src: "https://saasfame.com/badge-dark.svg",
    alt: "Featured on SaaS Fame",
  },
  {
    href: "https://toolfame.com/item/hintder",
    src: "https://toolfame.com/badge-dark.svg",
    alt: "Featured on Tool Fame",
  },
  {
    href: "https://agentwork.tools",
    src: "https://agentwork.tools/badge/badge_transparent.svg",
    alt: "Featured on AgentWork.Tools",
  },
  {
    href: "https://findly.tools/hintder-ai?utm_source=hintder-ai",
    src: "https://findly.tools/badges/findly-tools-badge-dark.svg",
    alt: "Featured on Findly.tools",
  },
  {
    href: "https://turbo0.com/item/hintder",
    src: "https://img.turbo0.com/badge-listed-dark.svg",
    alt: "Listed on Turbo0",
  },
  {
    href: "https://sellwithboost.com",
    src: "https://sellwithboost.com/badge/listing-dark.svg",
    alt: "Listed on Sell With Boost",
  },
  {
    href: "https://startupfa.st",
    src: "https://startupfa.st/images/badges/powered-by-dark.svg",
    alt: "Powered by Startup Fast",
  },
  {
    href: "https://neeed.directory/products/hintder-ai?utm_source=hintder-ai",
    src: "https://neeed.directory/badges/neeed-badge-dark.svg",
    alt: "Featured on neeed.directory",
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Mark size={20} />
              <span className="text-[15px] font-black lowercase tracking-tight text-text">
                hintder
              </span>
            </div>
            <p className="font-display italic text-[14px] text-text-muted max-w-xs leading-[1.4]" style={{ fontWeight: 300 }}>
              built for the moment <span className="text-text-secondary not-italic">before</span> she replies.
            </p>
            <a
              href="mailto:support@hintder.ai"
              className="inline-block font-display italic text-[13px] text-text-muted hover:text-flame transition-colors"
              style={{ fontWeight: 300 }}
            >
              support@hintder.ai
            </a>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] font-display italic text-text-muted hover:text-flame transition-colors"
                style={{ fontWeight: 300 }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Featured-on badges — dim + grayscale, normalised to one height; they
            brighten to colour on hover. Third-party SVGs → plain img. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
          {featuredBadges.map((b) => (
            <a
              key={b.href}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={b.alt}
              className="inline-flex opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.src} alt={b.alt} className="h-9 w-auto" />
            </a>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/[0.04] flex items-center justify-between font-display italic text-[12px] text-text-muted" style={{ fontWeight: 300 }}>
          <span>© {new Date().getFullYear()} hintder</span>
          <span>made for the brave</span>
        </div>
      </div>
    </footer>
  );
}
