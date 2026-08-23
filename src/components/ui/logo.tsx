import Image from "next/image";

import logoMark from "../../../public/images/logo.png";

/**
 * Dark Furniture lock-up: the workshop's own gold monogram, plus a typeset
 * wordmark.
 *
 * The mark is the supplied artwork (transparent PNG, gold on nothing), so it
 * sits on the cream and the near-black theme without a variant. The wordmark
 * stays live text rather than being baked into the image: it inherits the
 * current foreground colour, stays crisp at any zoom, and remains selectable.
 *
 * Importing the file rather than pointing at "/images/logo.png" lets Next read
 * its intrinsic size at build time, so the header reserves the right box and
 * the logo never shifts the layout as it decodes.
 */

const SIZES = {
  sm: { mark: "h-8", dark: "text-[0.9rem]", sub: "text-[0.5rem]", gap: "gap-2.5" },
  md: { mark: "h-10", dark: "text-[1.1rem]", sub: "text-[0.6rem]", gap: "gap-3" },
  lg: {
    mark: "h-14 sm:h-16",
    dark: "text-[1.5rem] sm:text-[1.75rem]",
    sub: "text-[0.72rem] sm:text-[0.82rem]",
    gap: "gap-4",
  },
} as const;

export function Logo({
  compact = false,
  size = "md",
  priority = false,
  className = "",
}: {
  /** Monogram only, no wordmark. */
  compact?: boolean;
  size?: keyof typeof SIZES;
  /** Set on the header lock-up, which is above the fold. */
  priority?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={`flex items-center ${s.gap} ${className}`} dir="ltr">
      <Image
        src={logoMark}
        alt="Dark Furniture"
        priority={priority}
        // 96px covers the largest rendering (h-16) at 3x device pixel ratio.
        sizes="96px"
        className={`${s.mark} w-auto shrink-0 select-none object-contain`}
      />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={`font-display ${s.dark} font-normal tracking-[0.34em] text-fg`}>
            DARK
          </span>
          <span className={`gold-text mt-1 font-display ${s.sub} font-normal tracking-[0.42em]`}>
            FURNITURE
          </span>
        </span>
      )}
    </span>
  );
}
