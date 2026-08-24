import Image from "next/image";

import type { Dictionary } from "@/i18n";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Swatch, type SwatchKind } from "@/components/ui/swatch";
import { TiltCard } from "@/components/ui/tilt-card";
import { artworkSet } from "@/data/artwork";

type Key = keyof Dictionary["materials"]["items"];

const KEYS = ["melamine", "gloss", "mdf", "hardware"] as const;

const TILES: { key: Key; kind: SwatchKind }[] = [
  { key: "melamine", kind: "melamine" },
  { key: "gloss", kind: "gloss" },
  { key: "mdf", kind: "mdf" },
  { key: "hardware", kind: "hardware" },
];

/*
  The description is folded away until the pointer arrives, which lets four
  panels sit side by side as four *samples* rather than four paragraphs. The
  name and the finish stay visible, because those are what a visitor scans for.

  Two rules keep that from becoming a trap. A device with no hover has nothing
  to hover with, so it gets the text unfolded from the start. And the copy is
  only clipped, never removed: it stays in the DOM and in the accessibility
  tree, so a screen reader reads all four cards in full.
*/
const FOLD =
  "grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-500 ease-brand " +
  "group-hover:grid-rows-[1fr] group-hover:opacity-100 " +
  "[@media(hover:none)]:grid-rows-[1fr] [@media(hover:none)]:opacity-100";

export function Materials({ t }: { t: Dictionary }) {
  // Optional: a real photograph of the board beats a drawn sample every time.
  const photos = artworkSet("materiaux", KEYS);

  return (
    <Section id="materiaux">
      <div className="shell">
        <SectionHeading title={t.materials.title} body={t.materials.body} />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((tile, i) => {
            const item = t.materials.items[tile.key];
            const photo = photos[tile.key];

            return (
              <Reveal key={tile.key} delay={i * 0.07} className="h-full">
                <TiltCard className="group h-full">
                  <article className="relative h-full overflow-hidden rounded-brand border border-line transition-colors duration-500 ease-brand group-hover:border-gold/45">
                    <div className="relative aspect-4/5 w-full overflow-hidden bg-surface-2">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-[1100ms] ease-brand group-hover:scale-[1.07]"
                        />
                      ) : (
                        <Swatch
                          kind={tile.kind}
                          className="transition-transform duration-[1100ms] ease-brand group-hover:scale-[1.07]"
                        />
                      )}

                      {/* Deepens on hover, so the unfolding paragraph always
                          lands on enough darkness to be read. */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-linear-to-t from-black/88 via-black/35 to-black/5 transition-opacity duration-500 ease-brand"
                      />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div className="flex items-baseline justify-between gap-3 border-b border-white/15 pb-3">
                        <h3 className="font-display text-lg font-normal tracking-wide text-[#f3e6c8]">
                          {item.name}
                        </h3>
                        <span className="shrink-0 font-display text-[0.64rem] uppercase tracking-[0.16em] text-[#e7ce86]">
                          {item.tag}
                        </span>
                      </div>

                      <div className={FOLD}>
                        <div className="overflow-hidden">
                          <p className="pt-3 text-[0.83rem] leading-relaxed text-white/80">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </TiltCard>
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
