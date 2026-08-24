import type { Dictionary } from "@/i18n";
import { Section, SectionHeading } from "@/components/ui/section";
import { artworkSet } from "@/data/artwork";
import { ProcessTimeline, type StepKey } from "./process-timeline";

/**
 * Server half: it looks on disk for the optional step photographs and hands
 * the timeline plain data. The icons live in the client half, because a React
 * component cannot be serialised across that boundary as a prop.
 */
const KEYS: readonly StepKey[] = ["contact", "measure", "quote", "install"];

export function Process({ t }: { t: Dictionary }) {
  const photos = artworkSet("etapes", KEYS);

  return (
    <Section>
      <div className="shell">
        <SectionHeading title={t.process.title} body={t.process.body} />
        <ProcessTimeline copy={t.process.steps} photos={photos} />
      </div>
    </Section>
  );
}
