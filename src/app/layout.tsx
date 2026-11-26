import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sippy Paws",
  description: "A cozy self-care buddy with Bao & Miso",
  appleWebApp: { capable: true, title: "Sippy Paws", statusBarStyle: "default" },
  icons: { apple: "/icons/icon-192.png" },
};
export const viewport: Viewport = {
  themeColor: "#3fae78",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
