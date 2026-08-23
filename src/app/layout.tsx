/**
 * Pass-through root layout. <html> and <body> are rendered by
 * src/app/[locale]/layout.tsx, which is the only place that knows the
 * language and text direction.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
