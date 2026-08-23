import type { Dictionary } from "@/i18n";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Swatch, type SwatchKind } from "@/components/ui/swatch";

type Key = keyof Dictionary["materials"]["items"];

const TILES: { key: Key; kind: SwatchKind }[] = [
  { key: "melamine", kind: "melamine" },
  { key: "gloss", kind: "gloss" },
  { key: "mdf", kind: "mdf" },
  { key: "hardware", kind: "hardware" },
];

export function Materials({ t }: { t: Dictionary }) {
  return (
    <Section id="materiaux">
      <div className="shell">
        <SectionHeading title={t.materials.title} body={t.materials.body} />

        <div className="mt-14 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((tile, i) => {
            const item = t.materials.items[tile.key];
            return (
              <Reveal key={tile.key} delay={i * 0.06}>
                <div className="aspect-4/3 overflow-hidden rounded-brand border border-line">
                  <Swatch kind={tile.kind} />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4 border-b border-line pb-3">
                  <h3 className="font-display text-lg font-normal tracking-wide text-fg">
                    {item.name}
                  </h3>
                  <span className="shrink-0 font-display text-[0.68rem] uppercase tracking-[0.16em] text-gold">
                    {item.tag}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{item.body}</p>
              </Reveal>
            );
          })}
        </div>

        {/* The point of the section: the decision is the client's. */}
        <Reveal delay={0.1} className="mt-16">
          <div className="mx-auto max-w-[62ch] border-t border-line pt-10 text-center">
            <h3 className="display text-[1.5rem] text-fg sm:text-[1.8rem]">
              {t.materials.choiceTitle}
            </h3>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-fg-muted">
              {t.materials.choiceBody}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
