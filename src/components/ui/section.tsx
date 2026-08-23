import type { ReactNode } from "react";
import { Reveal } from "./reveal";

export function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-28 py-20 sm:py-28 lg:py-36 ${className}`}>
      {children}
    </section>
  );
}

/**
 * Centred by default: the reference design is a symmetric editorial layout,
 * where every section announces itself the same way before the content breaks
 * the symmetry underneath.
 */
export function SectionHeading({
  title,
  body,
  align = "center",
  className = "",
}: {
  title: string;
  body?: string;
  align?: "center" | "start";
  className?: string;
}) {
  const centred = align === "center";
  return (
    <Reveal
      as="header"
      className={`${centred ? "mx-auto text-center" : "text-start"} max-w-[46ch] ${className}`}
    >
      <div
        aria-hidden="true"
        className={`gold-rule mb-6 h-px w-14 ${centred ? "mx-auto" : ""}`}
      />
      <h2 className="display text-[1.9rem] text-fg sm:text-[2.4rem] lg:text-[2.9rem]">
        {title}
      </h2>
      {body && (
        <p
          className={`mt-4 text-[0.98rem] leading-relaxed text-fg-muted ${
            centred ? "mx-auto max-w-[54ch]" : "max-w-[54ch]"
          }`}
        >
          {body}
        </p>
      )}
    </Reveal>
  );
}
