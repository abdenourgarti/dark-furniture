import fs from "node:fs";
import path from "node:path";

/**
 * Optional photography, resolved at build time.
 *
 * Several sections are designed to show a photograph when the workshop has one
 * and a drawn icon when it does not. Asking the browser to find that out — load
 * the image, catch the error, swap in the fallback — means every visitor sees
 * the fallback flash first. Looking on disk while the page is being built means
 * the HTML is right the first time.
 *
 * Drop `public/images/services/cuisine.jpg` and the kitchen card starts showing
 * it. Remove it and the card goes back to its icon. Nothing else to edit.
 *
 * Server side only: this module touches the filesystem, so it must never be
 * imported from a "use client" file.
 */

const PUBLIC = path.join(process.cwd(), "public");

/** Tried in order, so a WebP wins over a JPEG of the same name. */
const EXTENSIONS = ["webp", "avif", "jpg", "jpeg", "png"] as const;

/** The URL of `public/images/<folder>/<name>.<ext>`, or null if there is none. */
export function artwork(folder: string, name: string): string | null {
  for (const ext of EXTENSIONS) {
    const url = `/images/${folder}/${name}.${ext}`;
    if (fs.existsSync(path.join(PUBLIC, url))) return url;
  }
  return null;
}

/** The same lookup for a whole set of cards, keyed by card. */
export function artworkSet<K extends string>(
  folder: string,
  names: readonly K[],
): Record<K, string | null> {
  return Object.fromEntries(names.map((name) => [name, artwork(folder, name)])) as Record<
    K,
    string | null
  >;
}
