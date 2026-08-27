import type { Metadata } from "next";
import { Jost, Manrope } from "next/font/google";
import "../globals.css";

/**
 * The card lives outside the bilingual site on purpose.
 *
 * It renders its own <html> and <body> rather than reusing
 * app/[locale]/layout.tsx, which is what buys it the thing that was asked for:
 * no header, no footer, no navigation, no theme toggle. A page reached by
 * pointing a phone camera at a sticker has one job, and every chrome element
 * around it is something between the scan and the tap.
 *
 * It also keeps the URL one segment long — /liens, not /fr/liens. That is
 * fewer characters in the QR code, which means a coarser and more forgiving
 * pattern, and a URL that can be read out loud.
 */

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dark Furniture — Nos liens",
  description:
    "Retrouvez Dark Furniture : Instagram, Facebook, TikTok, téléphone, e-mail et itinéraire vers le showroom.",
  // A QR code is scanned, not searched. Keeping the card out of the index also
  // keeps it from competing with the real site on the workshop's own name.
  robots: { index: false, follow: true },
};

export const viewport = {
  themeColor: "#f7f4ee",
};

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${jost.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-fg">{children}</body>
    </html>
  );
}
