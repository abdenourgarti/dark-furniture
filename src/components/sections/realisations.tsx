import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { Section, SectionHeading } from "@/components/ui/section";
import { getRealisations } from "@/data/realisations-photos";
import { RealisationsGallery } from "./realisations-gallery";

/**
 * Server component: it reads the photographs off disk and hands them to the
 * gallery, which is the client half. No names, no towns, no captions — a
 * finished kitchen argues for itself, and a caption under every tile only slows
 * the eye down.
 */
export function Realisations({ locale, t }: { locale: Locale; t: Dictionary }) {
  const photos = getRealisations();

  return (
    <Section id="projets">
      <div className="shell">
        <SectionHeading title={t.realisations.title} body={t.realisations.body} />
        <RealisationsGallery
          photos={photos}
          t={t.realisations}
          rtl={locale === "ar"}
        />
      </div>
    </Section>
  );
}
