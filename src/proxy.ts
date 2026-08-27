import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

/**
 * Pages that live outside the bilingual site and must keep their bare path.
 *
 * /liens is the card behind the QR code. Without this it would be redirected to
 * /fr/liens, which would still work but would silently lengthen the URL printed
 * on the code — and break any code already printed with the short one.
 */
const unlocalised = ["/liens"];

/** Sends every un-prefixed path to a locale, preferring the browser language. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (unlocalised.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const accept = request.headers.get("accept-language") ?? "";
  const preferred = accept.toLowerCase().startsWith("ar") ? "ar" : defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API routes, Next internals and anything with a file extension.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
