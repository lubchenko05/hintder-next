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
};

export default nextConfig;
