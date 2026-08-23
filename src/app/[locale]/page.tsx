import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { site } from "@/data/site";

import { Hero } from "@/components/sections/hero";
import { Materials } from "@/components/sections/materials";
import { Collections } from "@/components/sections/collections";
import { Craft } from "@/components/sections/craft";
import { Realisations } from "@/components/sections/realisations";
import { Process } from "@/components/sections/process";
import { Commitments } from "@/components/sections/commitments";
import { Faq } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const l = locale as Locale;
  const t = getDictionary(l);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    name: site.name,
    description: t.meta.description,
    email: site.email,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address[l],
      addressCountry: "DZ",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    areaServed: { "@type": "Country", name: "Algeria" },
    makesOffer: Object.values(t.collections.items).map((item) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Product", name: item.name },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Content is authored in this repository, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero locale={l} t={t} />
      <Materials t={t} />
      <Collections t={t} />
      <Craft t={t} />
      <Realisations locale={l} t={t} />
      <Process t={t} />
      <Commitments t={t} />
      <Faq t={t} />
      <Contact locale={l} t={t} />
    </>
  );
}
