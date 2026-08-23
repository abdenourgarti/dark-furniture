"use client";

import { useTheme } from "next-themes";
import { SunDim, MoonStars } from "@phosphor-icons/react/dist/ssr";

export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid h-10 w-10 place-items-center rounded-brand border border-line text-fg-muted transition-colors duration-300 ease-brand hover:border-gold hover:text-gold"
    >
      {/*
        Which icon shows is decided by CSS, not by React state. next-themes puts
        the .dark class on <html> before first paint, so this is correct on the
        server render too and needs no mounted guard.
      */}
      <SunDim size={19} weight="light" className="hidden dark:block" />
      <MoonStars size={19} weight="light" className="block dark:hidden" />
    </button>
  );
}
