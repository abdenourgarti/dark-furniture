"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Photo frame that degrades into a designed plate when the file is not there
 * yet, so the gallery never shows a broken image while the workshop's own
 * photography is still being collected.
 */
export function Plate({
  src,
  alt,
  sizes,
  placeholderLabel,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  placeholderLabel: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-surface-2 [background-image:radial-gradient(75%_65%_at_50%_0%,color-mix(in_oklab,var(--gold)_11%,transparent),transparent_70%)]">
        <span className="font-display text-[0.66rem] uppercase tracking-[0.24em] text-fg-faint">
          {placeholderLabel}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className="object-cover transition-transform duration-[900ms] ease-brand group-hover:scale-[1.035]"
    />
  );
}
