"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CaretDown,
  CheckCircle,
  Clock,
  EnvelopeSimple,
  MapPin,
  NavigationArrow,
  Phone,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { wilayas } from "@/data/wilayas";
import { site, mapEmbedUrl, mapDirectionsUrl } from "@/data/site";
import { contactSchema, PROJECT_TYPES, type ContactInput } from "@/lib/contact-schema";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

const fieldBase =
  "w-full rounded-brand border bg-bg px-4 py-3 text-[0.95rem] text-fg placeholder:text-fg-muted " +
  "transition-colors duration-300 ease-brand focus:border-gold focus:outline-none";

export function Contact({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const f = t.contact.form;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      wilaya: "",
      project: "",
      message: "",
      website: "",
      locale,
    },
  });

  // The short footer form hands off here through the query string rather than
  // opening a second submission path that would skip the mandatory wilaya.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("nom");
    const email = params.get("email");
    if (name) setValue("name", name);
    if (email) setValue("email", email);
  }, [setValue]);

  /** Schema messages are dictionary keys, resolved here into the active language. */
  const msg = (key?: string) => {
    if (!key) return undefined;
    const table = f as unknown as Record<string, string>;
    return table[key] ?? f.required;
  };

  const onSubmit = handleSubmit(async (values) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      reset();
    } catch {
      setStatus("error");
    }
  });

  const border = (bad: boolean) => (bad ? "border-red-500/70" : "border-line");

  return (
    <Section id="contact" className="border-t border-line bg-surface">
      <div className="shell">
        <SectionHeading title={t.contact.title} body={t.contact.body} />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          {/* Form */}
          <Reveal>
            {status === "sent" ? (
              <div className="flex h-full min-h-[26rem] flex-col items-start justify-center rounded-brand border border-gold/40 bg-gold/5 p-10">
                <CheckCircle size={34} weight="light" className="text-gold" />
                <h3 className="mt-6 font-display text-2xl font-light tracking-wide text-fg">
                  {f.successTitle}
                </h3>
                <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-fg-muted">
                  {f.successBody}
                </p>
                <Button
                  variant="outline"
                  className="mt-8"
                  onClick={() => setStatus("idle")}
                >
                  {f.again}
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
                {/* Honeypot, hidden from people and assistive tech alike */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm text-fg">
                    {f.name}
                  </label>
                  <input
                    id="name"
                    autoComplete="name"
                    placeholder={f.namePlaceholder}
                    className={`${fieldBase} ${border(!!errors.name)}`}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{msg(errors.name.message)}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-sm text-fg">
                    {f.phone}
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={f.phonePlaceholder}
                    className={`${fieldBase} ${border(!!errors.phone)}`}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{msg(errors.phone.message)}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm text-fg">
                    {f.email}{" "}
                    <span className="text-fg-faint">({f.emailOptional})</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    placeholder={f.emailPlaceholder}
                    className={`${fieldBase} ${border(!!errors.email)}`}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{msg(errors.email.message)}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="wilaya" className="text-sm text-fg">
                    {f.wilaya}
                  </label>
                  <div className="relative">
                    <select
                      id="wilaya"
                      defaultValue=""
                      className={`${fieldBase} ${border(!!errors.wilaya)} appearance-none pe-11`}
                      {...register("wilaya")}
                    >
                      <option value="" disabled>
                        {f.wilayaPlaceholder}
                      </option>
                      {wilayas.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.code} - {locale === "ar" ? w.ar : w.fr}
                        </option>
                      ))}
                    </select>
                    <CaretDown
                      size={15}
                      weight="light"
                      className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-fg-muted"
                    />
                  </div>
                  {errors.wilaya && (
                    <p className="text-xs text-red-500">{msg(errors.wilaya.message)}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="project" className="text-sm text-fg">
                    {f.project}
                  </label>
                  <div className="relative">
                    <select
                      id="project"
                      defaultValue=""
                      className={`${fieldBase} ${border(!!errors.project)} appearance-none pe-11`}
                      {...register("project")}
                    >
                      <option value="" disabled>
                        {f.projectPlaceholder}
                      </option>
                      {PROJECT_TYPES.map((p) => (
                        <option key={p} value={p}>
                          {t.contact.projects[p]}
                        </option>
                      ))}
                    </select>
                    <CaretDown
                      size={15}
                      weight="light"
                      className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-fg-muted"
                    />
                  </div>
                  {errors.project && (
                    <p className="text-xs text-red-500">{msg(errors.project.message)}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="message" className="text-sm text-fg">
                    {f.message}
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder={f.messagePlaceholder}
                    className={`${fieldBase} ${border(!!errors.message)} resize-y`}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500">{msg(errors.message.message)}</p>
                  )}
                </div>

                {status === "error" && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-brand border border-red-500/40 bg-red-500/5 p-4 sm:col-span-2"
                  >
                    <WarningCircle size={19} weight="light" className="mt-0.5 shrink-0 text-red-500" />
                    <div>
                      <p className="text-sm text-fg">{f.errorTitle}</p>
                      <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                        {f.errorBody}
                      </p>
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? f.sending : f.submit}
                  </Button>
                </div>
              </form>
            )}
          </Reveal>

          {/* Showroom */}
          <Reveal delay={0.1} className="flex flex-col gap-6">
            <div className="rounded-brand border border-line bg-bg p-7">
              <h3 className="font-display text-lg font-normal tracking-wide text-fg">
                {t.contact.infoTitle}
              </h3>
              <dl className="mt-6 grid gap-5 text-sm">
                <div className="flex gap-3.5">
                  <MapPin size={18} weight="light" className="mt-0.5 shrink-0 text-gold" />
                  <div>
                    <dt className="text-fg-faint">{t.contact.addressLabel}</dt>
                    <dd className="mt-1 text-fg">{site.address[locale]}</dd>
                  </div>
                </div>
                <div className="flex gap-3.5">
                  <Clock size={18} weight="light" className="mt-0.5 shrink-0 text-gold" />
                  <div>
                    <dt className="text-fg-faint">{t.contact.hoursLabel}</dt>
                    <dd className="mt-1 text-fg">{site.hours[locale]}</dd>
                  </div>
                </div>
                <div className="flex gap-3.5">
                  <Phone size={18} weight="light" className="mt-0.5 shrink-0 text-gold" />
                  <div>
                    <dt className="text-fg-faint">{t.contact.phoneLabel}</dt>
                    <dd className="mt-1">
                      <a href={`tel:${site.phoneHref}`} dir="ltr" className="text-fg hover:text-gold">
                        {site.phone}
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3.5">
                  <EnvelopeSimple size={18} weight="light" className="mt-0.5 shrink-0 text-gold" />
                  <div className="min-w-0">
                    <dt className="text-fg-faint">{t.contact.emailLabel}</dt>
                    <dd className="mt-1">
                      <a
                        href={`mailto:${site.email}`}
                        dir="ltr"
                        className="break-all text-fg hover:text-gold"
                      >
                        {site.email}
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>

              <a
                href={mapDirectionsUrl()}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 border-b border-gold/40 pb-1 font-display text-[0.72rem] uppercase tracking-[0.16em] text-gold transition-colors duration-300 ease-brand hover:border-gold"
              >
                <NavigationArrow size={14} weight="light" />
                {t.actions.directions}
              </a>
            </div>

            <div className="relative min-h-[18rem] flex-1 overflow-hidden rounded-brand border border-line bg-bg">
              <iframe
                title={t.contact.mapTitle}
                src={mapEmbedUrl(locale)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full grayscale-[0.35] contrast-[1.05] dark:invert dark:grayscale dark:contrast-[0.85] dark:hue-rotate-180"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
