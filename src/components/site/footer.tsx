import Link from "next/link";
import {
  MapPin,
  Phone,
  EnvelopeSimple,
  InstagramLogo,
  FacebookLogo,
  TiktokLogo,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { site } from "@/data/site";
import { Logo } from "@/components/ui/logo";
import { FooterQuick } from "./footer-quick";

/*
  `href: string`, annotated rather than inferred, and that annotation is load
  bearing. site.ts is `as const`, so left to itself each href would be typed as
  the exact URL written there today — and the moment all three accounts are
  filled in, TypeScript would rule that comparing them to "" can never be true
  and fail the build. The empty check has to outlive the values it guards.
*/
const networks: { href: string; label: string; icon: Icon }[] = [
  { href: site.social.instagram, label: "Instagram", icon: InstagramLogo },
  { href: site.social.facebook, label: "Facebook", icon: FacebookLogo },
  { href: site.social.tiktok, label: "TikTok", icon: TiktokLogo },
];

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const columnTitle =
    "font-display text-[0.7rem] uppercase tracking-[0.2em] text-fg-faint";
  const linkClass =
    "text-sm text-fg-muted transition-colors duration-300 ease-brand hover:text-gold";
  const socialClass =
    "grid h-10 w-10 place-items-center rounded-brand border border-gold/40 text-gold transition-colors duration-300 ease-brand hover:border-gold hover:bg-gold hover:text-on-gold";

  return (
    <footer className="border-t border-line bg-bg">
      <div className="shell py-16 lg:py-20">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>
        <p className="mx-auto mt-6 max-w-[56ch] text-center text-sm leading-relaxed text-fg-muted">
          {t.footer.blurb}
        </p>

        <div className="mt-14 grid gap-12 border-t border-line pt-12 md:grid-cols-3">
          <div>
            <h3 className={columnTitle}>{t.footer.legalTitle}</h3>
            <ul className="mt-6 space-y-3.5">
              <li>
                <Link href={`/${locale}/mentions-legales`} className={linkClass}>
                  {t.footer.mentions}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/mentions-legales#donnees`} className={linkClass}>
                  {t.footer.rgpd}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#contact`} className={linkClass}>
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={columnTitle}>{t.footer.mediaTitle}</h3>
            <div className="mt-6 flex items-center gap-3">
              {/* Same rule as the /liens card: an account that has not been
                  filled in yet is left out, rather than linked to the network's
                  own home page. */}
              {networks
                .filter((network) => network.href !== "")
                .map(({ href, label, icon: Glyph }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noreferrer"
                    className={socialClass}
                  >
                    <Glyph size={18} weight="light" />
                  </a>
                ))}
            </div>

            <ul className="mt-8 space-y-4 text-sm text-fg-muted">
              <li className="flex gap-3">
                <MapPin size={17} weight="light" className="mt-0.5 shrink-0 text-gold" />
                <span>{site.address[locale]}</span>
              </li>
              <li className="flex gap-3">
                <Phone size={17} weight="light" className="mt-0.5 shrink-0 text-gold" />
                <a href={`tel:${site.phoneHref}`} dir="ltr" className="hover:text-gold">
                  {site.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <EnvelopeSimple size={17} weight="light" className="mt-0.5 shrink-0 text-gold" />
                <a href={`mailto:${site.email}`} dir="ltr" className="break-all hover:text-gold">
                  {site.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={columnTitle}>{t.footer.contactTitle}</h3>
            <FooterQuick locale={locale} t={t} />
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col items-center justify-between gap-3 py-6 text-xs text-fg-faint sm:flex-row">
          <p>
            {new Date().getFullYear()} {site.name}. {t.footer.rights}
          </p>
          <p>{t.brand.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
