import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { site } from "@/data/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { title: `${t.legal.title} | ${site.name}`, robots: { index: false } };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const l = locale as Locale;
  const t = getDictionary(l);

  const blocks = [
    { id: "mentions", title: t.legal.noticeTitle, body: t.legal.noticeBody },
    { id: "donnees", title: t.legal.privacyTitle, body: t.legal.privacyBody },
    { id: "droits", title: t.legal.rightsTitle, body: t.legal.rightsBody },
    { id: "cookies", title: t.legal.cookiesTitle, body: t.legal.cookiesBody },
  ];

  return (
    <div className="shell py-40 sm:py-48">
      <div className="mx-auto max-w-[68ch]">
        <div className="gold-rule mb-7 h-px w-14" aria-hidden="true" />
        <h1 className="display text-[2rem] text-fg sm:text-[2.6rem]">{t.legal.title}</h1>
        <p className="mt-5 text-[0.98rem] leading-relaxed text-fg-muted">{t.legal.intro}</p>

        <div className="mt-14 border-t border-line">
          {blocks.map((block) => (
            <section key={block.id} id={block.id} className="scroll-mt-32 border-b border-line py-10">
              <h2 className="font-display text-xl font-normal tracking-wide text-fg">
                {block.title}
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-fg-muted">{block.body}</p>
            </section>
          ))}
        </div>

        <Link
          href={`/${l}`}
          className="mt-12 inline-flex items-center gap-2 font-display text-[0.72rem] uppercase tracking-[0.16em] text-gold transition-colors duration-300 ease-brand hover:text-gold-bright"
        >
          <ArrowLeft size={14} weight="light" className="rtl:rotate-180" />
          {t.legal.back}
        </Link>
      </div>
    </div>
  );
}
