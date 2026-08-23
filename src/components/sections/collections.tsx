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

type Key = keyof Dictionary["collections"]["items"];

const ITEMS: { key: Key; icon: Icon }[] = [
  { key: "kitchen", icon: CookingPot },
  { key: "dressing", icon: CoatHanger },
  { key: "bedroom", icon: Bed },
  { key: "kids", icon: Baby },
  { key: "tv", icon: Television },
  { key: "office", icon: Desktop },
];

export function Collections({ t }: { t: Dictionary }) {
  return (
    <Section id="services" className="border-t border-line bg-surface">
      <div className="shell">
        <SectionHeading title={t.collections.title} body={t.collections.body} />

        {/* Hairline rows rather than cards: the rules do the grouping, and the
            layout stays honest at every breakpoint without nth-child tricks. */}
        <div className="mt-14 grid gap-x-12 border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => {
            const copy = t.collections.items[item.key];
            const Glyph = item.icon;
            return (
              <Reveal
                key={item.key}
                delay={(i % 3) * 0.06}
                className="border-b border-line py-9"
              >
                <Glyph size={26} weight="light" className="text-gold" />
                <h3 className="mt-5 font-display text-xl font-normal tracking-wide text-fg">
                  {copy.name}
                </h3>
                <p className="mt-3 max-w-[44ch] text-sm leading-relaxed text-fg-muted">
                  {copy.body}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
