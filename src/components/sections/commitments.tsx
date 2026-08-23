import {
  Ruler,
  Receipt,
  Tag,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

import type { Dictionary } from "@/i18n";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

type Key = keyof Dictionary["commitments"]["items"];
const ITEMS: { key: Key; icon: Icon }[] = [
  { key: "visit", icon: Ruler },
  { key: "detail", icon: Receipt },
  { key: "price", icon: Tag },
  { key: "team", icon: UsersThree },
];

export function Commitments({ t }: { t: Dictionary }) {
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

        <Reveal delay={0.08}>
          <p className="display mt-8 max-w-[26ch] text-[1.9rem] text-fg sm:max-w-[30ch] sm:text-[2.5rem] lg:max-w-[34ch] lg:text-[3rem]">
            {t.commitments.lead}
          </p>
        </Reveal>

        <div className="mt-20 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, i) => {
            const copy = t.commitments.items[item.key];
            const Glyph = item.icon;
            return (
              <Reveal
                key={item.key}
                delay={i * 0.07}
                className={`border-t border-line pt-7 ${i > 0 ? "lg:border-s lg:ps-8" : ""}`}
              >
                <Glyph size={22} weight="light" className="text-gold" />
                <h3 className="mt-5 font-display text-base font-medium tracking-wide text-fg">
                  {copy.name}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">{copy.body}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
