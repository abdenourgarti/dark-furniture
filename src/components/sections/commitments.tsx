import { Ruler, Receipt, Tag, UsersThree } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

import type { Dictionary } from "@/i18n";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { WordReveal } from "@/components/ui/word-reveal";
import { TiltCard } from "@/components/ui/tilt-card";
import { Medallion } from "@/components/ui/card-media";
import { artworkSet } from "@/data/artwork";

type Key = keyof Dictionary["commitments"]["items"];

const KEYS = ["visit", "detail", "price", "team"] as const;

const ITEMS: { key: Key; icon: Icon }[] = [
  { key: "visit", icon: Ruler },
  { key: "detail", icon: Receipt },
  { key: "price", icon: Tag },
  { key: "team", icon: UsersThree },
];

export function Commitments({ t }: { t: Dictionary }) {
  const photos = artworkSet("engagements", KEYS);

  return (
    <Section className="border-t border-line bg-surface">
      <div className="shell">
        {/* Manifesto block: one statement, given the room to land. */}
        <Reveal className="max-w-[24ch]">
          <div className="gold-rule mb-7 h-px w-16" aria-hidden="true" />
          <h2 className="display text-[1.6rem] text-fg-muted sm:text-[1.9rem]">
            {t.commitments.title}
          </h2>
        </Reveal>

        {/* The one sentence on the page that is the argument itself, so it is
            the one sentence that arrives at speaking pace. */}
        <WordReveal
          text={t.commitments.lead}
          className="display mt-8 max-w-[26ch] text-[1.9rem] text-fg sm:max-w-[30ch] sm:text-[2.5rem] lg:max-w-[34ch] lg:text-[3rem]"
        />

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, i) => {
            const copy = t.commitments.items[item.key];

            return (
              <Reveal key={item.key} delay={i * 0.08} className="h-full">
                <TiltCard className="group h-full" intensity={5}>
                  <article className="flex h-full flex-col rounded-brand border border-line bg-bg p-7 transition-[border-color,box-shadow] duration-500 ease-brand group-hover:border-gold/45 group-hover:shadow-[0_18px_46px_-28px_rgb(var(--shadow-color)/0.55)]">
                    <Medallion
                      src={photos[item.key]}
                      alt={copy.name}
                      icon={item.icon}
                      size="lg"
                      className="transition-[transform,border-color] duration-700 ease-brand group-hover:-translate-y-1 group-hover:border-gold/60"
                    />
                    <h3 className="mt-6 font-display text-base font-medium tracking-wide text-fg">
                      {copy.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-fg-muted">{copy.body}</p>
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
