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

        {/* Featured-on badges */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="https://twelve.tools"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Featured on Twelve Tools"
            className="inline-flex opacity-80 hover:opacity-100 transition-opacity"
          >
            {/* third-party badge — plain img (external SVG, not next/image) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://twelve.tools/badge0-dark.svg"
              alt="Featured on Twelve Tools"
              width={200}
              height={54}
            />
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-white/[0.04] flex items-center justify-between font-display italic text-[12px] text-text-muted" style={{ fontWeight: 300 }}>
          <span>© {new Date().getFullYear()} hintder</span>
          <span>made for the brave</span>
        </div>
      </div>
    </footer>
  );
}
