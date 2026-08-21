import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Display — headlines, product names (spec §1: "ink-trap detailing, set large and slightly tight")
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

// Body — UI copy, descriptions (spec §1: "neutral, legible workhorse")
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Data / figures — all prices, dates, percentages (spec §1: "tabular-nums, non-negotiable")
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrizeIncubator — Honest Price Intelligence",
  description:
    "A browser agent that verifies whether e-commerce deals are real. Tracks prices, detects inflated MRP tricks, and computes the true final price after coupons and bank offers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-body antialiased">
        {children}
      </body>
    </html>
  );
}
