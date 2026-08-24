"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ChatCircleDots, Ruler, FileText, Wrench } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

import { Medallion } from "@/components/ui/card-media";

/**
 * The four steps, drawn as the visitor scrolls through them.
 *
 * A list of four numbered paragraphs says the same thing, but says it all at
 * once. Tying the connecting line to scroll position makes the section *take
 * time*, which is the honest message: this is a process with an order and a
 * duration, not a menu.
 *
 * The line follows a spring on scroll progress rather than scroll progress
 * itself, so it keeps moving for a moment after the wheel stops instead of
 * freezing mid-stroke.
 *
 * When motion is unwelcome the same markup renders finished: every transform is
 * simply not applied, and CSS defaults leave the line at full length and every
 * marker lit. No second code path to keep correct.
 */

export type StepKey = "contact" | "measure" | "quote" | "install";

const ORDER: { key: StepKey; icon: Icon }[] = [
  { key: "contact", icon: ChatCircleDots },
  { key: "measure", icon: Ruler },
  { key: "quote", icon: FileText },
  { key: "install", icon: Wrench },
];

export function ProcessTimeline({
  copy,
  photos,
}: {
  copy: Record<StepKey, { name: string; body: string }>;
  photos: Record<StepKey, string | null>;
}) {
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);

  // Starts filling as the first step clears the fold and finishes before the
  // last one leaves, so the stroke completes while the section is still read.
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start 78%", "end 62%"],
  });
  const drawn = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const animate = !reduce;

  return (
    <div ref={track} className="relative mt-16">
      {/* Unlit track, the full length of the sequence. */}
      <div
        aria-hidden="true"
        className="absolute inset-s-7 top-2 bottom-2 w-px bg-line lg:inset-s-0 lg:inset-e-0 lg:top-7 lg:bottom-auto lg:h-px lg:w-auto"
      />

      {/*
        Two fills rather than one. A single element cannot grow downwards on a
        phone and rightwards on a laptop from the same transform, so each
        orientation gets its own and both read the one motion value.
      */}
      <motion.div
        aria-hidden="true"
        style={animate ? { scaleY: drawn } : undefined}
        className="gold-rule absolute inset-s-7 top-2 bottom-2 w-px origin-top lg:hidden"
      />
      <motion.div
        aria-hidden="true"
        style={animate ? { scaleX: drawn } : undefined}
        className="gold-rule absolute inset-s-0 inset-e-0 top-7 hidden h-px origin-left lg:block rtl:origin-right"
      />

      <ol className="relative grid gap-12 lg:grid-cols-4 lg:gap-8">
        {ORDER.map((step, i) => (
          <Step
            key={step.key}
            index={i}
            total={ORDER.length}
            icon={step.icon}
            photo={photos[step.key]}
            name={copy[step.key].name}
            body={copy[step.key].body}
            progress={drawn}
            animate={animate}
          />
        ))}
      </ol>
    </div>
  );
}

function Step({
  index,
  total,
  icon,
  photo,
  name,
  body,
  progress,
  animate,
}: {
  index: number;
  total: number;
  icon: Icon;
  photo: string | null;
  name: string;
  body: string;
  progress: MotionValue<number>;
  animate: boolean;
}) {
  // Lights as the stroke reaches this step and is fully lit shortly before it
  // reaches the next, so no two markers are ever mid-transition together.
  const lit = useTransform(progress, [index / total, (index + 0.55) / total], [0, 1]);
  const ring = useTransform(lit, [0, 1], [0.82, 1]);

  return (
    <motion.li
      className="flex gap-6 lg:block"
      initial={animate ? { opacity: 0, y: 22 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="relative block h-14 w-14 shrink-0">
        <Medallion src={photo} alt={name} icon={icon} />
        {/* The ring that fills in as the line arrives. */}
        <motion.span
          aria-hidden="true"
          style={animate ? { opacity: lit, scale: ring } : undefined}
          className="pointer-events-none absolute inset-0 rounded-brand border border-gold shadow-[0_0_0_4px_color-mix(in_oklab,var(--gold)_12%,transparent)]"
        />
      </span>

      <div className="lg:mt-8 lg:pe-6">
        <span className="font-display text-[0.68rem] tracking-[0.22em] text-gold">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="mt-2 font-display text-lg font-normal tracking-wide text-fg sm:text-xl">
          {name}
        </h3>
        <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-fg-muted">{body}</p>
      </div>
    </motion.li>
  );
}
