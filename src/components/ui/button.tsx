import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "gold" | "outline" | "ghost";
type Size = "md" | "lg";

// `inline-flex` lives here, so callers must never try to hide a button with a
// `hidden` class: two display utilities in the same layer fight and the winner
// depends on stylesheet order. Wrap the button in a container instead.
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-brand font-display font-medium tracking-[0.12em] uppercase " +
  "transition-[transform,background-color,border-color,color] duration-300 ease-brand " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-55";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-on-gold hover:bg-gold-bright hover:text-on-gold",
  outline:
    "border border-line-strong text-fg hover:border-gold hover:text-gold bg-transparent",
  ghost: "text-fg-muted hover:text-gold bg-transparent",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.72rem]",
  lg: "h-13 px-7 text-[0.78rem]",
};

function classes(variant: Variant, size: Size, className?: string) {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");
}

export function ButtonLink({
  href,
  variant = "gold",
  size = "md",
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const external = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");

  if (external) {
    return (
      <a href={href} className={classes(variant, size, className)} rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "gold",
  size = "md",
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
} & ComponentProps<"button">) {
  return (
    <button className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
