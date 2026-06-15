import Link from "next/link";
import { Mark } from "@/components/brand/Mark";
import BadgeRotator from "@/components/layout/BadgeRotator";

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
    src: "https://agentwork.tools/badge/badge_dark.svg",
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
    href: "https://submitaitools.org",
    src: "https://submitaitools.org/static_submitaitools/images/submitaitools.png",
    alt: "Submit AI Tools",
  },
  {
    href: "https://dang.ai",
    src: "https://assets.dang.ai/badges/dang-verified-dark.png",
    alt: "Verified on DANG!",
  },
  {
    href: "https://ufind.best/products/hintder-YO1n?utm_source=ufind.best",
    src: "https://ufind.best/badges/ufind-best-badge-light.svg",
    alt: "Featured on ufind.best",
  },
  {
    href: "https://newtool.site/item/hintder",
    src: "https://newtool.site/badges/newtool-dark.svg",
    alt: "Featured on NewTool.site",
  },
  {
    href: "https://trylaunch.ai/launch/hintder-ai",
    src: "https://trylaunch.ai/badges/badge-white.png",
    alt: "Featured on Launch",
  },
  {
    href: "https://submitmysaas.com",
    src: "https://submitmysaas.com/featured-badge.png",
    alt: "Featured on SubmitMySaas",
  },
  {
    href: "https://www.freeai.run",
    src: "https://www.freeai.run/badge/badge_transparent.svg",
    alt: "Featured on FreeAI",
  },
  {
    href: "https://aidirs.best/item/hintder",
    src: "https://aidirs.best/dark.svg",
    alt: "Featured on Aidirs",
  },
  {
    href: "https://firstlook.tools",
    src: "https://firstlook.tools/badge/badge_dark.svg",
    alt: "Featured on First Look",
  },
  {
    href: "https://smollaunch.com",
    src: "https://smollaunch.com/badges/featured-dark.svg",
    alt: "Featured on Smol Launch",
  },
  {
    href: "https://www.scrolllaunch.com/products/hintder?utm_source=badge&utm_medium=embed&utm_campaign=hintder&ref=scrolllaunch",
    src: "https://www.scrolllaunch.com/api/badge/hintder",
    alt: "Featured on ScrollLaunch",
  },
  {
    href: "https://backlinkdirs.com/item/hintder",
    src: "https://backlinkdirs.com/badges/badge-listed-dark.svg",
    alt: "Listed on Backlink Dirs",
  },
  {
    href: "https://theonestartup.com",
    src: "https://theonestartup.com/badages-awards.svg",
    alt: "Featured on The One Startup",
  },
  {
    href: "https://dayslaunch.com",
    src: "https://dayslaunch.com/badages-awards.svg",
    alt: "Featured on Days Launch",
  },
  {
    href: "https://codetrendy.com",
    src: "https://codetrendy.com/api/badge?style=dark",
    alt: "Surfaced on CodeTrendy",
  },
  {
    href: "https://toolrain.com/item/hintder",
    src: "https://toolrain.com/badges/badge-listed-dark.svg",
    alt: "Listed on ToolRain",
  },
  {
    href: "https://showmebest.ai",
    src: "https://showmebest.ai/badge/feature-badge-dark.webp",
    alt: "Featured on ShowMeBestAI",
  },
  {
    href: "https://solvertools.com/tool/hintder",
    src: "https://solvertools.com/assets/images/badge-dark.png",
    alt: "Solver Tools",
  },
  {
    href: "https://similarlabs.com",
    src: "https://similarlabs.com/similarlabs-embed-badge-dark.svg",
    alt: "Listed on SimilarLabs",
  },
  {
    href: "https://domainrank.app",
    src: "https://domainrank.app/api/badge/hintder.ai?theme=dark",
    alt: "hintder.ai Domain Rating",
  },
  {
    href: "https://aibesttop.com",
    src: "https://aibesttop.com/badges/dark.svg",
    alt: "AIBestTop - AI Tools Directory",
  },
  // Badges that ship only as inline SVG / text (no hosted image) — rendered as a
  // uniform logo+label chip so they match the rest instead of their own styling.
  {
    href: "https://indie.deals?ref=https%3A%2F%2Fhintder.ai",
    alt: "Find us on Indie.Deals",
    logo: "https://indie.deals/logo_badge.png",
    label: "Indie.Deals",
  },
  {
    href: "https://www.tinystartups.com/startup/hintder-ai",
    alt: "Launched on Tiny Startups",
    label: "Tiny Startups",
  },
  {
    href: "https://allinai.tools",
    alt: "All in AI Tools",
    label: "All in AI Tools",
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

        {/* Featured-on backlink badges — rotated through one compact slot so
            they keep their crawlable links without dominating the footer. */}
        <BadgeRotator badges={featuredBadges} />

        <div className="mt-6 pt-6 border-t border-white/[0.04] flex items-center justify-between font-display italic text-[12px] text-text-muted" style={{ fontWeight: 300 }}>
          <span>© {new Date().getFullYear()} hintder</span>
          <span>made for the brave</span>
        </div>
      </div>
    </footer>
  );
}
