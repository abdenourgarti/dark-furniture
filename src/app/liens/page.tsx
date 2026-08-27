import Image from "next/image";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowUpRight,
  EnvelopeSimple,
  FacebookLogo,
  Globe,
  InstagramLogo,
  NavigationArrow,
  Phone,
  TiktokLogo,
} from "@phosphor-icons/react/dist/ssr";

import { site, mapDirectionsUrl } from "@/data/site";
import logoMark from "../../../public/images/logo.png";

/**
 * The card behind the QR code.
 *
 * Everything it shows comes from src/data/site.ts, which is the one file to
 * edit. An entry whose value is an empty string is dropped rather than
 * rendered: the workshop can print the code before every account exists, and a
 * button that has not been filled in simply is not there — instead of landing
 * a scan on tiktok.com's home page.
 *
 * Server component with no interactive parts, so it ships no JavaScript at
 * all. On a phone at the far end of a showroom that is the difference between
 * a card that is up before the camera app closes and one that is not.
 */

type Entry = {
  label: string;
  /** The line under the label, when the value is worth reading on its own. */
  detail?: string;
  href: string;
  icon: Icon;
  /** Leaves the site: gets the little arrow and opens in a new tab. */
  external?: boolean;
};

function entries(): { social: Entry[]; contact: Entry[] } {
  const social: Entry[] = [
    { label: "Instagram", href: site.social.instagram, icon: InstagramLogo, external: true },
    { label: "Facebook", href: site.social.facebook, icon: FacebookLogo, external: true },
    { label: "TikTok", href: site.social.tiktok, icon: TiktokLogo, external: true },
    { label: "Notre site web", href: site.website, icon: Globe, external: true },
  ];

  const contact: Entry[] = [
    {
      label: "Appeler l'atelier",
      detail: site.phone,
      href: site.phoneHref ? `tel:${site.phoneHref}` : "",
      icon: Phone,
    },
    {
      label: "Nous écrire",
      detail: site.email,
      href: site.email ? `mailto:${site.email}` : "",
      icon: EnvelopeSimple,
    },
    {
      label: "Itinéraire",
      detail: site.address.fr,
      href: mapDirectionsUrl(),
      icon: NavigationArrow,
      external: true,
    },
  ];

  const filled = (list: Entry[]) => list.filter((e) => e.href !== "");
  return { social: filled(social), contact: filled(contact) };
}

export default function LinksPage() {
  const { social, contact } = entries();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col px-6 py-12 sm:py-16">
      <header className="flex flex-col items-center text-center">
        {/*
          The monogram is gold on nothing, and gold on cream is a weak pairing.
          Setting it in a near-black tile gives it the contrast it was drawn
          for, and reads as the avatar this kind of card is expected to open
          with.
        */}
        <span className="grid h-24 w-24 place-items-center rounded-brand bg-[#0a0a0a] p-5 shadow-[0_18px_40px_-24px_rgb(var(--shadow-color)/0.65)]">
          <Image
            src={logoMark}
            alt=""
            priority
            sizes="96px"
            className="h-full w-auto object-contain"
          />
        </span>

        <h1 className="mt-6 font-display text-[1.5rem] font-normal tracking-[0.3em] text-fg">
          DARK
        </h1>
        <p className="gold-text -mt-0.5 font-display text-[0.78rem] font-normal tracking-[0.38em]">
          FURNITURE
        </p>

        <div aria-hidden="true" className="gold-rule mt-6 h-px w-14" />

        <p className="mt-5 text-[0.92rem] leading-relaxed text-balance text-fg-muted">
          Atelier de meubles sur mesure.
          <br />
          Cuisines, dressings, chambres, meubles TV et bureaux.
        </p>
      </header>

      <nav className="mt-10 flex flex-col gap-3" aria-label="Nos liens">
        {social.map((entry) => (
          <LinkButton key={entry.label} entry={entry} />
        ))}

        {social.length > 0 && contact.length > 0 && (
          <hr className="my-3 border-0 border-t border-line" />
        )}

        {contact.map((entry) => (
          <LinkButton key={entry.label} entry={entry} />
        ))}
      </nav>

      <p className="mt-auto pt-12 text-center font-display text-[0.62rem] uppercase tracking-[0.22em] text-fg-faint">
        {new Date().getFullYear()} {site.name}
      </p>
    </main>
  );
}

function LinkButton({ entry }: { entry: Entry }) {
  const { label, detail, href, icon: Glyph, external } = entry;

  return (
    <a
      href={href}
      // tel: and mailto: hand off to another app; sending them through a new
      // tab leaves an empty one behind on most phones.
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group flex min-h-14 items-center gap-4 rounded-brand border border-line-strong bg-surface px-5 py-3 transition-[border-color,background-color,transform] duration-300 ease-brand hover:border-gold hover:bg-surface-2 active:translate-y-px"
    >
      <Glyph
        size={22}
        weight="light"
        className="shrink-0 text-gold transition-transform duration-300 ease-brand group-hover:scale-110"
      />

      <span className="min-w-0 flex-1">
        <span className="block font-display text-[0.82rem] font-medium tracking-[0.1em] uppercase text-fg">
          {label}
        </span>
        {detail && (
          <span className="mt-0.5 block truncate text-[0.78rem] text-fg-muted" dir="ltr">
            {detail}
          </span>
        )}
      </span>

      <ArrowUpRight
        size={15}
        weight="light"
        aria-hidden="true"
        className="shrink-0 text-fg-faint transition-[transform,color] duration-300 ease-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold"
      />
    </a>
  );
}
