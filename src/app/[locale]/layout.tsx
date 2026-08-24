import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Jost, Manrope, Alexandria, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";

import { locales, isLocale, dir, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { Providers } from "@/components/providers";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

/*
  Two scripts, one voice. Each language gets a display face for the tracked
  uppercase brand furniture and a text face for paragraphs, and the two pairs
  are chosen to share a skeleton so the site does not change personality when
  it switches language.

    French : Jost (geometric display)  +  Manrope (humanist text)
    Arabic : Alexandria (geometric)    +  IBM Plex Sans Arabic (text)

  Alexandria is the Arabic counterpart to Jost: circular bowls, even stroke, so
  headings keep the same architectural feel in RTL. Plex Sans Arabic carries
  long paragraphs the way Manrope does in Latin. Nothing calligraphic on
  purpose: this is a workshop, not a wedding invitation.
*/

const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
  preload: false,
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
  preload: false,
});

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-alexandria",
  display: "swap",
  preload: false,
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plex-ar",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);

  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: "/fr", ar: "/ar" },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      locale: locale === "ar" ? "ar_DZ" : "fr_DZ",
      type: "website",
      siteName: "Dark Furniture",
    },
    // All four are the workshop's own monogram, cropped to its ink and
    // rendered at each size. The tab icons keep their transparent background so
    // they read on a light and a dark tab bar alike; the home screen icon does
    // not, because iOS paints transparency black regardless.
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      ],
      apple: { url: "/apple-icon.png", sizes: "180x180" },
    },
  };
}

/*
  One colour, not a pair keyed on prefers-color-scheme. The site no longer
  follows the operating system — it opens light and the visitor decides from
  there — so asking the browser to tint its chrome from the OS setting would
  paint a dark bar around a light page for anyone whose laptop is in dark mode.
  This is the page's own opening background.
*/
export const viewport = {
  themeColor: "#f7f4ee",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const l = locale as Locale;
  const t = getDictionary(l);

  return (
    <html
      lang={l}
      dir={dir(l)}
      suppressHydrationWarning
      className={`${jost.variable} ${manrope.variable} ${alexandria.variable} ${plexArabic.variable} h-full antialiased`}
    >
      <head>
        {/* Scroll reveals are JavaScript-driven; without it, show everything. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>
          <a
            href="#main"
            className="sr-only rounded-brand focus:not-sr-only focus:fixed focus:top-4 focus:inset-s-4 focus:z-80 focus:bg-gold focus:px-4 focus:py-2 focus:text-on-gold"
          >
            {t.nav.skip}
          </a>
          <div className="grain" aria-hidden="true" />
          <Header locale={l} t={t} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer locale={l} t={t} />
        </Providers>
      </body>
    </html>
  );
}
