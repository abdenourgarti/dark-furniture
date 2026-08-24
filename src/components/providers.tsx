"use client";

import { ThemeProvider } from "next-themes";

/**
 * The site opens light and the toggle switches between light and dark. That is
 * the whole of it.
 *
 * `enableSystem` is off deliberately rather than left on: with an explicit
 * defaultTheme it never had any effect here — the toggle only ever sets "light"
 * or "dark", so "system" was a third state nothing could reach. Turning it off
 * says out loud that the workshop chose the opening theme, instead of leaving a
 * setting that reads as if the operating system had a vote.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
