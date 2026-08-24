"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { List, X } from "@phosphor-icons/react/dist/ssr";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitch } from "./locale-switch";

export function Header({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  // Only the home page puts a film behind the bar, and only until it scrolls.
  // Everywhere else the bar sits on the page background and keeps its own
  // colours, which is what makes this a class and not a theme.
  const onMedia = !scrolled && pathname === `/${locale}`;

  // Threshold crossing only, so this sets state a handful of times per session.
  useMotionValueEvent(scrollY, "change", (v) => {
    const next = v > 40;
    if (next !== scrolled) setScrolled(next);
  });

  const links = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}#projets`, label: t.nav.projects },
    { href: `/${locale}#services`, label: t.nav.services },
    { href: `/${locale}#contact`, label: t.nav.contact },
  ];

  const linkClass =
    "font-display text-[0.76rem] uppercase tracking-[0.19em] text-fg-muted transition-colors duration-300 ease-brand hover:text-gold";

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-brand",
        scrolled
          ? "border-b border-line bg-bg/88 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      {/*
        The reference layout stacks a slim nav row over a centred wordmark.
        Once the page scrolls, that collapses into one compact bar so it stops
        eating the viewport.
      */}
      <div
        className={[
          "shell relative flex items-center justify-between gap-4 transition-[padding] duration-500 ease-brand",
          scrolled ? "py-3" : "py-4 lg:py-5",
          onMedia ? "on-media" : "",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 lg:w-56">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t.nav.menu}
            className="grid h-10 w-10 place-items-center rounded-brand border border-line text-fg-muted transition-colors duration-300 ease-brand hover:border-gold hover:text-gold lg:hidden"
          >
            <List size={20} weight="light" />
          </button>
          <Link
            href={`/${locale}`}
            aria-label={t.brand.name}
            className={scrolled ? "hidden lg:block" : "hidden"}
          >
            <Logo compact priority />
          </Link>
        </div>

        <nav className="hidden items-center gap-9 lg:flex" aria-label={t.nav.menu}>
          {links.map((link) => (
            <Link key={link.label} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 lg:w-56">
          <div className="hidden sm:block">
            <LocaleSwitch current={locale} />
          </div>
          <ThemeToggle label={t.actions.theme} />
        </div>
      </div>

      {/* Centred wordmark, shown only at the top of the page */}
      <AnimatePresence initial={false}>
        {!scrolled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={onMedia ? "on-media overflow-hidden" : "overflow-hidden"}
          >
            <div className="shell flex justify-center pb-5">
              <Link href={`/${locale}`} aria-label={t.brand.name}>
                <Logo size="lg" priority />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-bg lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="shell flex h-18 items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.nav.close}
                className="grid h-10 w-10 place-items-center rounded-brand border border-line text-fg-muted hover:border-gold hover:text-gold"
              >
                <X size={20} weight="light" />
              </button>
            </div>

            <nav className="shell mt-8 flex flex-col" aria-label={t.nav.menu}>
              {links.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-line py-5 font-display text-2xl font-light tracking-wide text-fg transition-colors duration-300 hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className="mt-9 flex items-center justify-between gap-4">
                <LocaleSwitch current={locale} />
                <ButtonLink href={`/${locale}#contact`} size="lg" onClick={() => setOpen(false)}>
                  {t.actions.quote}
                </ButtonLink>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
