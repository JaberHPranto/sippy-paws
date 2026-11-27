import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  // Precache the app shell so opening the app never waits on the network (it hung on the splash screen).
  // A new deploy is picked up in the background and shows on the next open.
  additionalPrecacheEntries: [{ url: "/", revision: crypto.randomUUID() }],
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = { turbopack: {} };

export default withSerwist(nextConfig);
