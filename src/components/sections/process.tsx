import {
  ChatCircleDots,
  Ruler,
  FileText,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

import type { Dictionary } from "@/i18n";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

type Key = keyof Dictionary["process"]["steps"];
const STEPS: { key: Key; icon: Icon }[] = [
  { key: "contact", icon: ChatCircleDots },
  { key: "measure", icon: Ruler },
  { key: "quote", icon: FileText },
  { key: "install", icon: Wrench },
];

export function Process({ t }: { t: Dictionary }) {
  return (
    <Section>
      <div className="shell">
        <SectionHeading title={t.process.title} body={t.process.body} />

        <div className="relative mt-16">
          {/* Connective line: it carries the sequence, so it earns its place. */}
          <div
            aria-hidden="true"
            className="absolute start-[1.4rem] top-2 bottom-2 w-px bg-line lg:start-0 lg:end-0 lg:top-[1.4rem] lg:bottom-auto lg:h-px lg:w-auto"
          />

          <ol className="relative grid gap-12 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step, i) => {
              const item = t.process.steps[step.key];
              const Glyph = step.icon;
              return (
                <Reveal
                  as="li"
                  key={step.key}
                  delay={i * 0.09}
                  className="flex gap-6 lg:block"
                >
                  <span className="grid h-[2.8rem] w-[2.8rem] shrink-0 place-items-center rounded-brand border border-line bg-bg text-gold">
                    <Glyph size={20} weight="light" />
                  </span>
                  <div className="lg:mt-8 lg:pe-6">
                    <h3 className="font-display text-lg font-normal tracking-wide text-fg sm:text-xl">
                      {item.name}
                    </h3>
                    <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-fg-muted">
                      {item.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </Section>
  );
}
