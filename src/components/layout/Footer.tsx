import Link from "next/link";
import { Mark } from "@/components/brand/Mark";
import BadgeRotator from "@/components/layout/BadgeRotator";
import { TOOLS } from "@/lib/tools";
import { getRecentPosts } from "@/lib/content";

/* Everything that isn't a tool or an article: the pages people look for by
   name rather than browse. */
const docLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund", href: "/refund" },
] as const;

/* Newest few per section — enough for a crawler to find the hub and for a
   reader to see what's in there, without turning the footer into a sitemap. */
const FOOTER_POSTS = 4;

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
  {
    href: "https://goodaitools.com/ai/hintder",
    src: "https://goodaitools.com/assets/images/badge-dark.png",
    alt: "Good AI Tools",
  },
  { href: "https://milliondothomepage.com/product/hintder", src: "https://milliondothomepage.com/assets/images/badge-dark.png", alt: "Million Dot Homepage" },
  { href: "https://launchclash.com/product/hintder", src: "https://launchclash.com/assets/images/badge-dark.png", alt: "LaunchClash" },
  { href: "https://shinylaunch.com/product/hintder", src: "https://shinylaunch.com/assets/images/badge-dark.png", alt: "ShinyLaunch" },
  { href: "https://acidtools.com/ai/hintder", src: "https://acidtools.com/assets/images/badge-dark.png", alt: "Acid Tools" },
  { href: "https://aigc160.com/ai/hintder", src: "https://aigc160.com/assets/images/badge-dark.png", alt: "AIGC 160" },
  { href: "https://aitechviral.com/ai/hintder", src: "https://aitechviral.com/assets/images/badge-dark.png", alt: "AI Tech Viral" },
  { href: "https://aitoolzs.com/ai/hintder", src: "https://aitoolzs.com/assets/images/badge-dark.png", alt: "AI Toolz" },
  { href: "https://aixcollection.com/ai/hintder", src: "https://aixcollection.com/assets/images/badge-dark.png", alt: "AI X Collection" },
  { href: "https://appalist.com/ai/hintder", src: "https://appalist.com/assets/images/badge-dark.png", alt: "Appa List" },
  { href: "https://appsytools.com/tool/hintder", src: "https://appsytools.com/assets/images/badge-dark.png", alt: "Appsy Tools" },
  { href: "https://beamtools.com/tool/hintder", src: "https://beamtools.com/assets/images/badge-dark.png", alt: "Beam Tools" },
  { href: "https://besttoolvault.com/tool/hintder", src: "https://besttoolvault.com/assets/images/badge-dark.png", alt: "Best Tool Vault" },
  { href: "https://huntfortools.com/tool/hintder", src: "https://huntfortools.com/assets/images/badge-dark.png", alt: "Hunt for Tools" },
  { href: "https://launchscroll.com/product/hintder", src: "https://launchscroll.com/assets/images/badge-dark.png", alt: "Launch Scroll" },
  { href: "https://mystarttools.com/tool/hintder", src: "https://mystarttools.com/assets/images/badge-dark.png", alt: "My Start Tools" },
  { href: "https://mylaunchstash.com/product/hintder", src: "https://mylaunchstash.com/assets/images/badge-dark.png", alt: "My Launch Stash" },
  { href: "https://poweruptools.com/ai/hintder", src: "https://poweruptools.com/assets/images/badge-dark.png", alt: "Power Up Tools" },
  { href: "https://productwing.com/product/hintder", src: "https://productwing.com/assets/images/badge-dark.png", alt: "Product Wing" },
  { href: "https://saasfield.com/ai/hintder", src: "https://saasfield.com/assets/images/badge-dark.png", alt: "SaaS Field" },
  { href: "https://saaswheel.com/product/hintder", src: "https://saaswheel.com/assets/images/badge-dark.png", alt: "SaaS Wheel" },
  { href: "https://softwarebolt.com/product/hintder", src: "https://softwarebolt.com/assets/images/badge-dark.png", alt: "Software Bolt" },
  { href: "https://startupbenchmarks.com/product/hintder", src: "https://startupbenchmarks.com/assets/images/badge-dark.png", alt: "Startup Benchmarks" },
  { href: "https://startupvessel.com/product/hintder", src: "https://startupvessel.com/assets/images/badge-dark.png", alt: "Startup Vessel" },
  { href: "https://thatappshow.com/product/hintder", src: "https://thatappshow.com/assets/images/badge-dark.png", alt: "That App Show" },
  { href: "https://toolfinddir.com/ai/hintder", src: "https://toolfinddir.com/assets/images/badge-dark.png", alt: "Tool Find Dir" },
  { href: "https://toshilist.com/product/hintder", src: "https://toshilist.com/assets/images/badge-dark.png", alt: "Toshi List" },
  { href: "https://trustiner.com/product/hintder", src: "https://trustiner.com/assets/images/badge-dark.png", alt: "Trustiner" },
  { href: "https://unitelist.com/product/hintder", src: "https://unitelist.com/assets/images/badge-dark.png", alt: "Unite List" },
  { href: "https://weliketools.com/tool/hintder", src: "https://weliketools.com/assets/images/badge-dark.png", alt: "We Like Tools" },
] as const;

export async function Footer() {
  /* Server component — the posts are markdown in the repo, so this costs a
     read at build time and nothing at runtime. */
  const [guides, stories] = await Promise.all([safePosts("guides"), safePosts("stories")]);

  return (
    <footer>
      <div className="w-full px-5 sm:px-10 lg:px-16 py-14">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-10 lg:gap-20">
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-10 xl:gap-x-20 gap-y-10 lg:flex-1">
            <FooterColumn title="Tools" allHref="/tools" allLabel="See all tools">
              {TOOLS.map((tool) => (
                <FooterLink key={tool.slug} href={`/tools/${tool.slug}`}>
                  {tool.name}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title="Guides" allHref="/guides" allLabel="See all guides">
              {guides.map((p) => (
                <FooterLink key={p.slug} href={`/guides/${p.slug}`}>
                  {p.title}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title="Stories" allHref="/stories" allLabel="See all stories">
              {stories.map((p) => (
                <FooterLink key={p.slug} href={`/stories/${p.slug}`}>
                  {p.title}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title="More">
              {docLinks.map((l) => (
                <FooterLink key={l.href} href={l.href}>
                  {l.label}
                </FooterLink>
              ))}
            </FooterColumn>
          </div>
        </div>

        {/* Featured-on backlink badges — rotated through one compact slot so
            they keep their crawlable links without dominating the footer. */}
        <BadgeRotator badges={featuredBadges} />

        <div className="mt-10 flex items-center justify-between font-display italic text-[12px] text-text-muted" style={{ fontWeight: 300 }}>
          <span>© {new Date().getFullYear()} hintder</span>
          <span>made for the brave</span>
        </div>
      </div>
    </footer>
  );
}

async function safePosts(kind: "guides" | "stories") {
  try {
    return await getRecentPosts(kind, FOOTER_POSTS);
  } catch (err) {
    /* An unreachable API must never take the whole footer — and with it every
       page that renders one — down. */
    console.error(`footer: failed to list ${kind}`, err);
    return [];
  }
}

function FooterColumn({
  title,
  allHref,
  allLabel,
  children,
}: {
  title: string;
  allHref?: string;
  allLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={title}>
      <div
        className="font-display italic text-[11px] tracking-[0.16em] uppercase text-flame mb-3"
        style={{ fontWeight: 400 }}
      >
        {title}
      </div>
      <ul className="space-y-2">{children}</ul>
      {allHref && (
        <Link
          href={allHref}
          className="mt-3 inline-block font-display italic text-[13.5px] text-text-secondary hover:text-flame transition-colors"
          style={{ fontWeight: 400 }}
        >
          {allLabel} →
        </Link>
      )}
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      {/* No speculative fetches from the footer: it sits on every page, so a
          default-prefetching link here multiplies by the whole site. */}
      <Link
        href={href}
        prefetch={false}
        className="font-display italic text-[13.5px] text-text-muted hover:text-flame transition-colors leading-[1.4] line-clamp-2"
        style={{ fontWeight: 300 }}
      >
        {children}
      </Link>
    </li>
  );
}
