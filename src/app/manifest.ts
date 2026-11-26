import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sippy Paws",
    short_name: "Sippy Paws",
    description: "A cozy self-care buddy: hydration, journal and to-dos with Bao & Miso.",
    start_url: "/",
    display: "standalone",
    background_color: "#eaf6ee",
    theme_color: "#3fae78",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
