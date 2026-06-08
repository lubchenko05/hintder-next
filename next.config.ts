import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Proxy Amplitude through our own origin so ad-blockers that block the
  // amplitude.com domain don't silently drop analytics events.
  async rewrites() {
    return [
      {
        source: "/amp/:path*",
        destination: "https://api2.amplitude.com/:path*",
      },
    ];
  },
  // Canonical host: 301 www → apex. www.hintder.ai is mapped to the same App
  // Engine service and was serving a full duplicate of the site (HTTP 200), so
  // crawlers saw two hostnames and flagged the www pages as "non-indexable"
  // (they canonical to the apex). Redirecting collapses everything to one host.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.hintder.ai" }],
        destination: "https://hintder.ai/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
