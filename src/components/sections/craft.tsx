import type { Dictionary } from "@/i18n";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Plate } from "@/components/ui/plate";
import { TiltCard } from "@/components/ui/tilt-card";

type Key = keyof Dictionary["craft"]["items"];

const STEPS: { key: Key; file: string }[] = [
  { key: "design", file: "mesure" },
  { key: "cut", file: "decoupe" },
  { key: "assemble", file: "assemblage" },
];

/**
 * Three gestures, numbered.
 *
 * The number is the animation here: it sits oversized and half-faded behind the
 * title, and slides up into full strength as the pointer arrives. It reads as
 * an order of operations before a single word is read, which is exactly what
 * this section is trying to say.
 */
export function Craft({ t }: { t: Dictionary }) {
  return (
    <Section className="border-t border-line bg-surface">
      <div className="shell">
        <SectionHeading title={t.craft.title} body={t.craft.body} />

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, i) => {
            const item = t.craft.items[step.key];

            return (
              <Reveal key={step.key} delay={i * 0.1} as="article" className="h-full">
                <TiltCard className="group h-full">
                  <div className="flex h-full flex-col overflow-hidden rounded-brand border border-line bg-bg transition-[border-color,box-shadow] duration-500 ease-brand group-hover:border-gold/45 group-hover:shadow-[0_18px_46px_-28px_rgb(var(--shadow-color)/0.55)]">
                    <div className="relative aspect-4/3 overflow-hidden bg-surface-2">
                      <Plate
                        src={`/images/savoir-faire/${step.file}.jpg`}
                        alt={`${item.name}, ${item.tag}`}
                        sizes="(max-width: 640px) 100vw, 33vw"
                        placeholderLabel={t.craft.placeholder}
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent"
                      />

                      <span
                        aria-hidden="true"
                        className="absolute bottom-3 inset-s-5 font-display text-[3.2rem] leading-none font-light text-white/25 transition-[color,transform] duration-700 ease-brand group-hover:-translate-y-1 group-hover:text-[#e7ce86]/85"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                        <h3 className="font-display text-lg font-normal tracking-wide text-fg">
                          {item.name}
                        </h3>
                        <span className="shrink-0 font-display text-[0.66rem] uppercase tracking-[0.16em] text-gold">
                          {item.tag}
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-fg-muted">{item.body}</p>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
