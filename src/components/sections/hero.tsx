import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { ButtonLink } from "@/components/ui/button";
import { HeroVideo } from "./hero-video";

/**
 * Two panels side by side: the promise on one side, the workshop's own footage
 * on the other.
 *
 * The copy is deliberately *beside* the film rather than laid over it. Text on
 * moving video needs a heavy scrim to stay readable, which dulls the footage
 * and still fails whenever a clip cuts to a bright kitchen. Split in two, the
 * headline keeps full contrast on the page background and the video keeps its
 * full brightness.
 *
 * Server component: the headline is the largest contentful paint, so it is
 * plain server-rendered HTML animated with CSS. Only the reel is a client
 * island.
 */
export function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section className="pt-36 sm:pt-40 lg:pt-48">
      <div className="shell">
        <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-14">
          {/* Panel one: what we do, and the two things to do about it. */}
          <div className="flex flex-col justify-center py-4 text-center lg:py-10 lg:text-start">
            <p
              className="rise font-display text-[0.7rem] uppercase tracking-[0.24em] text-gold"
              style={{ "--d": "40ms" } as React.CSSProperties}
            >
              {t.brand.tagline}
            </p>

            <h1
              className="rise display mt-6 text-[2.35rem] text-fg sm:text-[3.1rem] lg:text-[3.6rem] xl:text-[4.1rem]"
              style={{ "--d": "120ms" } as React.CSSProperties}
            >
              {t.hero.title}
            </h1>

            <div
              aria-hidden="true"
              className="gold-rule rise mt-7 h-px w-16 self-center lg:self-start"
              style={{ "--d": "220ms" } as React.CSSProperties}
            />

            <p
              className="rise mt-7 max-w-[46ch] self-center text-[1.02rem] leading-relaxed text-fg-muted lg:self-start"
              style={{ "--d": "280ms" } as React.CSSProperties}
            >
              {t.hero.subtitle}
            </p>

            <div
              className="rise mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              style={{ "--d": "380ms" } as React.CSSProperties}
            >
              <ButtonLink href={`/${locale}#projets`} size="lg">
                {t.actions.discover}
              </ButtonLink>
              <ButtonLink href={`/${locale}#contact`} variant="outline" size="lg">
                {t.actions.quote}
              </ButtonLink>
            </div>
          </div>

          {/* Panel two: the reel, edge to edge inside its own frame. */}
          <div
            className="rise relative min-h-[26rem] overflow-hidden rounded-brand border border-line bg-surface-2 sm:min-h-[32rem] lg:min-h-[36rem]"
            style={{ "--d": "180ms" } as React.CSSProperties}
          >
            <HeroVideo pauseLabel={t.hero.pause} playLabel={t.hero.play} />
          </div>
        </div>
      </div>
    </section>
  );
}
