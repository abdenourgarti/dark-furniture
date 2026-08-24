import type { Dictionary } from "@/i18n";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Plate } from "@/components/ui/plate";

type Key = keyof Dictionary["craft"]["items"];

const STEPS: { key: Key; file: string }[] = [
  { key: "design", file: "mesure" },
  { key: "cut", file: "decoupe" },
  { key: "assemble", file: "assemblage" },
];

export function Craft({ t }: { t: Dictionary }) {
  return (
    <Section className="border-t border-line bg-surface">
      <div className="shell">
        <SectionHeading title={t.craft.title} body={t.craft.body} />

        <div className="mt-14 grid gap-x-5 gap-y-10 sm:grid-cols-3">
          {STEPS.map((step, i) => {
            const item = t.craft.items[step.key];
            return (
              <Reveal
                key={step.key}
                delay={i * 0.08}
                as="article"
                className="group"
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-brand border border-line bg-surface-2">
                  <Plate
                    src={`/images/savoir-faire/${step.file}.jpg`}
                    alt={`${item.name}, ${item.tag}`}
                    sizes="(max-width: 640px) 100vw, 32vw"
                    placeholderLabel={t.craft.placeholder}
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4 border-b border-line pb-3">
                  <h3 className="font-display text-lg font-normal tracking-wide text-fg">
                    {item.name}
                  </h3>
                  <span className="shrink-0 font-display text-[0.68rem] uppercase tracking-[0.16em] text-gold">
                    {item.tag}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {item.body}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
