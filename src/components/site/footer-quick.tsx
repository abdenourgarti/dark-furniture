"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

/**
 * The reference footer carries a short contact form. Rather than open a second
 * submission path that skips the mandatory wilaya, these two fields hand off to
 * the real form further up the page with the values already filled in.
 */
export function FooterQuick({ locale, t }: { locale: Locale; t: Dictionary }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const fieldClass =
    "w-full border-b border-line bg-transparent pb-2 text-sm text-fg placeholder:text-fg-muted " +
    "transition-colors duration-300 ease-brand focus:border-gold focus:outline-none";

  return (
    <form
      className="mt-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (name.trim()) params.set("nom", name.trim());
        if (email.trim()) params.set("email", email.trim());
        const query = params.toString();
        router.push(`/${locale}${query ? `?${query}` : ""}#contact`);
      }}
    >
      <div>
        <label htmlFor="footer-name" className="sr-only">
          {t.footer.quickName}
        </label>
        <input
          id="footer-name"
          value={name}
          autoComplete="name"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder={t.footer.quickName}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="footer-email" className="sr-only">
          {t.footer.quickEmail}
        </label>
        <input
          id="footer-email"
          type="email"
          dir="ltr"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder={t.footer.quickEmail}
          className={fieldClass}
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 font-display text-[0.7rem] uppercase tracking-[0.18em] text-gold transition-colors duration-300 ease-brand hover:text-gold-bright"
      >
        {t.footer.quickCta}
        <ArrowRight size={14} weight="light" className="rtl:rotate-180" />
      </button>
      <p className="text-xs leading-relaxed text-fg-faint">{t.footer.quickHint}</p>
    </form>
  );
}
