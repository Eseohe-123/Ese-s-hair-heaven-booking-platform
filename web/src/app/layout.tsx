import type { Metadata } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SwRegister } from "@/components/SwRegister";
import { InstallBanner } from "@/components/InstallBanner";
import { FloatingHome } from "@/components/FloatingHome";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hairven — Braids, Wigs, Natural Hair & Locs",
    template: "%s | Hairven",
  },
  description:
    "Explore hairstyles, tell Ese what you want, get a free consultation and book your appointment. Final price always agreed before any deposit.",
  keywords: [
    "braids",
    "knotless braids",
    "wig install",
    "frontal",
    "natural hair",
    "locs",
    "hair stylist Nigeria",
    "Hairven",
  ],
  openGraph: {
    type: "website",
    title: "Hairven",
    description:
      "The full hair experience — inspiration, free consultation, appointment and aftercare.",
  },
  manifest: "/manifest.webmanifest",
  themeColor: "#6b2148",
  appleWebApp: {
    capable: true,
    title: "Hairven",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col bg-cream font-body text-cocoa-900 antialiased">
        <SwRegister />
        <InstallBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <FloatingHome />
      </body>
    </html>
  );
}
