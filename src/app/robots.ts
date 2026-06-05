import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Everything is crawlable by default; only the private app surfaces
        // (auth, dashboard, checkout) are blocked.
        allow: "/",
        disallow: ["/app", "/app/", "/checkout/", "/signin"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
