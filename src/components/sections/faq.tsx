import { Plus } from "@phosphor-icons/react/dist/ssr";

import type { Dictionary } from "@/i18n";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

type Key = keyof Dictionary["faq"]["items"];
const KEYS: Key[] = ["delay", "travel", "appliances", "coverage", "difference"];

export function Faq({ t }: { t: Dictionary }) {
  return (
    <Section className="border-t border-line bg-surface">
      <div className="shell grid gap-12 lg:grid-cols-[22rem_1fr] lg:gap-20">
        <SectionHeading title={t.faq.title} align="start" className="lg:sticky lg:top-28 lg:self-start" />

        {/* Native disclosure: keyboard and screen-reader behaviour for free. */}
        <div className="border-t border-line">
          {KEYS.map((key, i) => {
            const item = t.faq.items[key];
            return (
              <Reveal key={key} delay={i * 0.05}>
                <details className="group border-b border-line">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-start [&::-webkit-details-marker]:hidden">
                    <span className="font-display text-[1.05rem] font-normal tracking-wide text-fg transition-colors duration-300 ease-brand group-hover:text-gold sm:text-[1.15rem]">
                      {item.q}
                    </span>
                    <Plus
                      size={18}
                      weight="light"
                      className="mt-1 shrink-0 text-gold transition-transform duration-400 ease-brand group-open:rotate-45"
                    />
                  </summary>
                  <p className="max-w-[62ch] pb-7 text-[0.95rem] leading-relaxed text-fg-muted">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
