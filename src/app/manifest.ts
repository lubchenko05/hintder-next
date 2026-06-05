import type { MetadataRoute } from "next";

/* Web app manifest — Android install + PWA standards. Next links it automatically. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hintder — Your Dating Wingman",
    short_name: "Hintder",
    description:
      "Upload a dating profile screenshot. Get a message that doesn't sound like everyone else.",
    start_url: "/",
    display: "standalone",
    background_color: "#08070A",
    theme_color: "#08070A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
