import {
  CookingPot,
  CoatHanger,
  Bed,
  Baby,
  Television,
  Desktop,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

import type { Dictionary } from "@/i18n";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { TiltCard } from "@/components/ui/tilt-card";
import { CardMedia } from "@/components/ui/card-media";
import { artworkSet } from "@/data/artwork";

type Key = keyof Dictionary["collections"]["items"];

/**
 * File names to drop in public/images/services/ — one per card, any of
 * .webp .avif .jpg .jpeg .png. Until a file is there the card shows its icon,
 * at the same size and in the same box, so adding photographs later moves
 * nothing on the page.
 */
const KEYS = ["kitchen", "dressing", "bedroom", "kids", "tv", "office"] as const;

const ITEMS: { key: Key; icon: Icon }[] = [
  { key: "kitchen", icon: CookingPot },
  { key: "dressing", icon: CoatHanger },
  { key: "bedroom", icon: Bed },
  { key: "kids", icon: Baby },
  { key: "tv", icon: Television },
  { key: "office", icon: Desktop },
];

export function Collections({ t }: { t: Dictionary }) {
  const photos = artworkSet("services", KEYS);

  return (
    <Section id="services" className="border-t border-line bg-surface">
      <div className="shell">
        <SectionHeading title={t.collections.title} body={t.collections.body} />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => {
            const copy = t.collections.items[item.key];

            return (
              <Reveal key={item.key} delay={(i % 3) * 0.08} className="h-full">
                <TiltCard className="group h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-brand border border-line bg-bg transition-[border-color,box-shadow] duration-500 ease-brand group-hover:border-gold/45 group-hover:shadow-[0_18px_46px_-28px_rgb(var(--shadow-color)/0.55)]">
                    <CardMedia
                      src={photos[item.key]}
                      alt={copy.name}
                      icon={item.icon}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="aspect-16/10 w-full"
                    />

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-xl font-normal tracking-wide text-fg">
                        {copy.name}
                      </h3>
                      {/* Draws itself across the card as the pointer arrives. */}
                      <span
                        aria-hidden="true"
                        className="gold-rule mt-4 block h-px w-8 origin-left transition-transform duration-700 ease-brand group-hover:scale-x-[4.5] rtl:origin-right"
                      />
                      <p className="mt-5 text-sm leading-relaxed text-fg-muted">{copy.body}</p>
                    </div>
                  </article>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
