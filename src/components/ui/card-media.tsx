import Image from "next/image";
import type { Icon } from "@phosphor-icons/react";

/**
 * The top half of a card: the workshop's photograph if it has one, a drawn
 * medallion if it does not.
 *
 * Both states occupy exactly the same box, so a card does not change shape the
 * day a photograph is added — the page is laid out once and stays laid out.
 *
 * The fallback is deliberately designed rather than apologetic. A grey square
 * saying "image missing" makes a site look unfinished; a gold glyph on a lit
 * ground looks like a decision, and buys the workshop all the time it needs to
 * photograph six rooms properly.
 */
export function CardMedia({
  src,
  alt,
  icon: Glyph,
  sizes,
  className = "",
}: {
  src: string | null;
  alt: string;
  icon: Icon;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[1100ms] ease-brand group-hover:scale-[1.07]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center [background-image:radial-gradient(78%_70%_at_50%_18%,color-mix(in_oklab,var(--gold)_13%,transparent),transparent_72%)]">
          {/* A hairline frame, so the glyph reads as a mark and not as clip art. */}
          <span className="relative grid h-[4.6rem] w-[4.6rem] place-items-center rounded-brand border border-gold/35 text-gold transition-[transform,border-color] duration-700 ease-brand group-hover:scale-[1.08] group-hover:border-gold/70">
            <Glyph size={30} weight="light" />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-brand border border-gold/0 transition-all duration-700 ease-brand group-hover:inset-[-0.5rem] group-hover:border-gold/25"
            />
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * The round-cornered marker used on the timeline and the pledges: a photograph
 * if the workshop supplied one, the icon otherwise.
 *
 * Same reasoning as CardMedia, at a size where a photograph reads as a portrait
 * rather than as a scene — which is why the icon remains a perfectly good
 * answer here, and not a stand-in.
 */

/** The timeline needs a marker sitting on a line; a pledge card needs a figure. */
const MEDALLION = {
  md: { box: "h-14 w-14", glyph: 22, sizes: "56px" },
  lg: { box: "h-20 w-20", glyph: 34, sizes: "80px" },
} as const;

export function Medallion({
  src,
  alt,
  icon: Glyph,
  size = "md",
  className = "",
}: {
  src: string | null;
  alt: string;
  icon: Icon;
  size?: keyof typeof MEDALLION;
  className?: string;
}) {
  const s = MEDALLION[size];
  return (
    <span
      className={`relative grid ${s.box} shrink-0 place-items-center overflow-hidden rounded-brand border border-line bg-bg text-gold ${className}`}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes={s.sizes} className="object-cover" />
      ) : (
        <Glyph size={s.glyph} weight="light" />
      )}
    </span>
  );
}
