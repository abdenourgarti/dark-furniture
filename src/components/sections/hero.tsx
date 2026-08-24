import Link from "next/link";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { HeroVideo } from "./hero-video";

/**
 * The reel runs edge to edge and the promise is laid over it.
 *
 * Text on moving footage is the hard case in web typography: the background
 * changes brightness several times a second, so contrast cannot be checked
 * once and forgotten. Three scrims do that work — one anchoring the header,
 * one pooled behind the copy, one grounding the base — and the type is set in
 * the brand's cream rather than pure white, which keeps it legible without
 * making the footage look washed out underneath.
 *
 * Server component: the headline is the largest contentful paint, so it is
 * plain server-rendered HTML animated with CSS. Only the reel is a client
 * island.
 */

/*
  The two buttons are styled here rather than reusing <ButtonLink>. That
  component draws its colours from the theme, and the theme does not apply
  under a video: the footage is dark whichever mode the visitor chose, so these
  are pinned to the light-on-dark pair instead of flipping with the page.
*/
const PRIMARY =
  "inline-flex h-13 items-center justify-center rounded-brand border border-[#d8b969]/70 px-8 " +
  "font-display text-[0.76rem] uppercase tracking-[0.16em] text-[#f3e6c8] " +
  "transition-[background-color,border-color,color,transform] duration-300 ease-brand " +
  "hover:border-[#e7ce86] hover:bg-[#e7ce86] hover:text-[#141210] active:translate-y-px";

const SECONDARY =
  "inline-flex h-13 items-center justify-center rounded-brand px-6 " +
  "font-display text-[0.76rem] uppercase tracking-[0.16em] text-white/85 " +
  "underline decoration-white/30 underline-offset-8 " +
  "transition-colors duration-300 ease-brand hover:text-white hover:decoration-[#e7ce86]";

export function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section className="relative isolate w-full overflow-hidden bg-[#0a0a0a]">
      <div className="relative h-[88svh] max-h-[54rem] min-h-[34rem] w-full">
        <HeroVideo pauseLabel={t.hero.pause} playLabel={t.hero.play} />

        {/* Carries the header, which is transparent at the top of the page. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-56 bg-linear-to-b from-black/72 to-transparent"
        />
        {/* Pooled under the copy: enough contrast for the headline, without
            flattening the corners of the frame. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 [background:radial-gradient(58%_50%_at_50%_52%,rgba(0,0,0,0.62),rgba(0,0,0,0.2)_60%,transparent_78%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-48 bg-linear-to-t from-black/60 to-transparent"
        />

        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center pt-20 text-center">
          <div className="shell flex flex-col items-center">
            <p
              className="rise font-display text-[0.72rem] uppercase tracking-[0.28em] text-[#e7ce86]"
              style={{ "--d": "60ms" } as React.CSSProperties}
            >
              {t.brand.tagline}
            </p>

            <h1
              className="rise display mt-6 max-w-[18ch] text-[2.5rem] uppercase tracking-[0.03em] text-[#f3e6c8] sm:text-[3.4rem] lg:text-[4.4rem] xl:text-[5rem]"
              style={{ "--d": "150ms" } as React.CSSProperties}
            >
              {t.hero.title}
            </h1>

            <div
              aria-hidden="true"
              className="gold-rule rise mt-8 h-px w-20"
              style={{ "--d": "260ms" } as React.CSSProperties}
            />

            <p
              className="rise mt-8 max-w-[52ch] text-[1rem] leading-relaxed text-white/85 sm:text-[1.06rem]"
              style={{ "--d": "330ms" } as React.CSSProperties}
            >
              {t.hero.subtitle}
            </p>

            <div
              className="rise pointer-events-auto mt-11 flex flex-wrap items-center justify-center gap-4"
              style={{ "--d": "430ms" } as React.CSSProperties}
            >
              <Link href={`/${locale}#projets`} className={PRIMARY}>
                {t.actions.discover}
              </Link>
              <Link href={`/${locale}#contact`} className={SECONDARY}>
                {t.actions.quote}
              </Link>
            </div>
          </div>
        </div>

        {/* Says the page continues, which a full-height hero otherwise hides. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-7 z-30 flex justify-center"
        >
          <span className="hero-scroll block h-10 w-px bg-linear-to-b from-transparent via-[#e7ce86] to-transparent" />
        </div>
      </div>
    </section>
  );
}
