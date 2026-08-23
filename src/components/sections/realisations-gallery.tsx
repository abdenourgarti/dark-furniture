"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react/dist/ssr";

import type { Dictionary } from "@/i18n";
import { categories, type Category, type Realisation } from "@/data/realisations";
import { Button } from "@/components/ui/button";

type Filter = Category | "all";
type Copy = Dictionary["realisations"];

/** How many photographs the section shows before the visitor asks for more. */
const PREVIEW = 10;

const FILTERS: Filter[] = ["all", ...categories];

export function RealisationsGallery({
  photos,
  t,
  rtl,
}: {
  photos: Realisation[];
  t: Copy;
  /** Arabic reads right to left, which swaps what "previous" looks like. */
  rtl: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  // Index into the filtered list, or null while the lightbox is closed.
  const [open, setOpen] = useState<number | null>(null);

  const shown = filter === "all" ? photos : photos.filter((p) => p.category === filter);
  const preview = shown.slice(0, PREVIEW);

  const select = useCallback((next: Filter) => {
    setFilter(next);
    // The current index points into a list that is about to stop existing.
    setOpen((current) => (current === null ? null : 0));
  }, []);

  return (
    <>
      <FilterRow value={filter} onChange={select} t={t} className="mt-10 justify-center" />

      {preview.length === 0 ? (
        <p className="mt-14 text-center text-sm text-fg-muted">{t.empty}</p>
      ) : (
        // Five columns on wide screens, so the ten-photograph preview lands as
        // two complete rows rather than a ragged one.
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {preview.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={t.open}
              className="group relative aspect-4/5 overflow-hidden rounded-brand border border-line bg-surface-2"
            >
              <Image
                src={photo.src}
                alt={t.alt[photo.category]}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-[900ms] ease-brand group-hover:scale-[1.06]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 transition-colors duration-500 ease-brand group-hover:bg-black/15"
              />
            </button>
          ))}
        </div>
      )}

      {shown.length > 0 && (
        <div className="mt-12 flex justify-center">
          <Button variant="outline" size="lg" onClick={() => setOpen(0)}>
            {t.showAll}
          </Button>
        </div>
      )}

      {open !== null && shown.length > 0 && (
        <Lightbox
          photos={shown}
          index={Math.min(open, shown.length - 1)}
          onIndex={setOpen}
          filter={filter}
          onFilter={select}
          onClose={() => setOpen(null)}
          t={t}
          rtl={rtl}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */

/** The five buttons: every room, then one per category. */
function FilterRow({
  value,
  onChange,
  t,
  className = "",
}: {
  value: Filter;
  onChange: (next: Filter) => void;
  t: Copy;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {FILTERS.map((key) => {
        const active = key === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={active}
            className={[
              "h-10 rounded-brand border px-5 font-display text-[0.7rem] uppercase tracking-[0.16em]",
              "transition-colors duration-300 ease-brand",
              active
                ? "border-gold bg-gold text-on-gold"
                : "border-line-strong text-fg-muted hover:border-gold hover:text-gold",
            ].join(" ")}
          >
            {t.categories[key]}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Lightbox({
  photos,
  index,
  onIndex,
  filter,
  onFilter,
  onClose,
  t,
  rtl,
}: {
  photos: Realisation[];
  index: number;
  onIndex: (next: number) => void;
  filter: Filter;
  onFilter: (next: Filter) => void;
  onClose: () => void;
  t: Copy;
  rtl: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (step: number) => {
      // Wrap: the arrows never dead-end on the first or the last photograph.
      onIndex((index + step + photos.length) % photos.length);
    },
    [index, photos.length, onIndex],
  );

  // The page behind must not scroll away under the overlay.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Give the overlay the focus a dialog needs, and hand it back to whatever
  // opened it on the way out.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    return () => opener?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      // The left arrow always means "the photograph on the left", which is the
      // next one on a page that reads right to left.
      if (e.key === "ArrowLeft") return go(rtl ? 1 : -1);
      if (e.key === "ArrowRight") return go(rtl ? -1 : 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, rtl]);

  const photo = photos[index];

  // Portalled to the body on purpose: the overlay has to escape the section's
  // stacking context, which the scroll-reveal transforms would otherwise trap
  // it inside.
  return createPortal(
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      tabIndex={-1}
      className="fixed inset-0 z-90 flex flex-col bg-black/96 outline-none backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
        <FilterRow value={filter} onChange={onFilter} t={t} />
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-brand border border-white/25 text-white/80 transition-colors duration-300 ease-brand hover:border-[#e7ce86] hover:text-[#e7ce86]"
        >
          <X size={20} weight="light" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-6 sm:px-24">
        <div className="relative h-full w-full">
          <Image
            key={photo.src}
            src={photo.src}
            alt={t.alt[photo.category]}
            fill
            sizes="92vw"
            priority
            className="object-contain"
          />
        </div>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={t.previous}
          className="absolute start-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-brand border border-white/25 bg-black/45 text-white/85 transition-colors duration-300 ease-brand hover:border-[#e7ce86] hover:text-[#e7ce86] sm:start-6"
        >
          {rtl ? <CaretRight size={22} weight="light" /> : <CaretLeft size={22} weight="light" />}
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label={t.next}
          className="absolute end-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-brand border border-white/25 bg-black/45 text-white/85 transition-colors duration-300 ease-brand hover:border-[#e7ce86] hover:text-[#e7ce86] sm:end-6"
        >
          {rtl ? <CaretLeft size={22} weight="light" /> : <CaretRight size={22} weight="light" />}
        </button>
      </div>

      <p
        dir="ltr"
        className="pb-6 text-center font-display text-[0.72rem] tracking-[0.2em] text-white/55"
      >
        {index + 1} / {photos.length}
      </p>
    </div>,
    document.body,
  );
}
