"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeShort, localeLabel, type Locale } from "@/i18n/config";

export function LocaleSwitch({ current }: { current: Locale }) {
  const pathname = usePathname() ?? `/${current}`;

  const swap = (target: Locale) => {
    const rest = pathname.replace(new RegExp(`^/(${locales.join("|")})`), "");
    return `/${target}${rest}` || `/${target}`;
  };

  return (
    <div className="flex items-center rounded-brand border border-line p-0.5">
      {locales.map((l) => {
        const active = l === current;
        return (
          <Link
            key={l}
            href={swap(l)}
            hrefLang={l}
            aria-label={localeLabel[l]}
            aria-current={active ? "true" : undefined}
            className={[
              "grid h-9 min-w-9 place-items-center rounded-[2px] px-2 font-display text-[0.72rem] tracking-[0.14em] transition-colors duration-300 ease-brand",
              active
                ? "bg-gold text-on-gold"
                : "text-fg-muted hover:text-gold",
            ].join(" ")}
          >
            {localeShort[l]}
          </Link>
        );
      })}
    </div>
  );
}
