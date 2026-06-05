"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/brand/Icons";

export function CTA() {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40 px-5 sm:px-8 overflow-hidden">
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-40 w-[800px] h-[400px] -z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(254,60,114,0.18), transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2
          className="font-display tracking-[-0.04em] leading-[0.92] text-[clamp(3rem,9vw,8rem)]"
          style={{ fontWeight: 400 }}
        >
          Drop the screenshot.
          <br />
          <span
            className="italic"
            style={{
              background: "linear-gradient(95deg, #FE3C72, #FF8552)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 300,
            }}
          >
            Take the line.
          </span>
        </h2>

        <p
          className="mt-10 text-[20px] text-text-secondary max-w-md mx-auto leading-[1.5] font-display font-light"
        >
          The first one&apos;s on us. No card, no signup. Just an opener you didn&apos;t have to think about.
        </p>

        <div className="mt-10 sm:mt-14 flex items-center justify-center">
          <Link
            href="/app"
            className="group inline-flex items-center justify-between gap-8 px-10 sm:px-12 py-5 sm:py-6 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.99]"
            style={{
              background:
                "linear-gradient(95deg, #FE3C72, #FF6B6B 50%, #FF8552)",
              boxShadow: "0 18px 40px -10px rgba(254,60,114,0.6)",
            }}
          >
            <span
              className="text-[22px] sm:text-[28px] lg:text-[32px] font-display italic text-white"
              style={{ fontWeight: 400 }}
            >
              read a profile
            </span>
            <ArrowRight
              size={22}
              className="text-white transition-transform group-hover:translate-x-0.5 sm:hidden"
            />
            <ArrowRight
              size={28}
              className="text-white hidden sm:block transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
