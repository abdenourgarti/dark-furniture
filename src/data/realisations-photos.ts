import fs from "node:fs";
import path from "node:path";

import { categories, type Category, type Realisation } from "./realisations";

/**
 * The gallery is the folder.
 *
 * Rather than keeping a hand-written list of filenames in sync with the disk,
 * the photographs are read straight out of public/images/realisations. Dropping
 * a new JPEG into public/images/realisations/cuisine puts it in the gallery;
 * there is nothing else to edit, and no such thing as a tile pointing at a file
 * that was never uploaded.
 *
 * Server side only. This module touches the filesystem, so it must never be
 * imported from a "use client" file: the section component reads it and hands
 * the result to the gallery as a prop.
 */

const ROOT = path.join(process.cwd(), "public", "images", "realisations");
const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

function readCategory(category: Category): Realisation[] {
  let files: string[];
  try {
    files = fs.readdirSync(path.join(ROOT, category));
  } catch {
    // A category whose folder has not been created yet is simply empty.
    return [];
  }

  return files
    .filter((file) => IMAGE.test(file))
    // Numeric collation, so 10.jpg lands after 9.jpg rather than after 1.jpg.
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .map((file) => ({
      category,
      src: `/images/realisations/${category}/${encodeURIComponent(file)}`,
    }));
}

/**
 * Every photograph, dealt round-robin across the categories.
 *
 * Concatenating the folders would open the gallery on three kitchens in a row;
 * interleaving them means the first screenful already shows the range of what
 * the workshop builds. Inside a category the file order is preserved.
 */
export function getRealisations(): Realisation[] {
  const byCategory = categories.map(readCategory);
  const deepest = Math.max(0, ...byCategory.map((list) => list.length));

  const mixed: Realisation[] = [];
  for (let i = 0; i < deepest; i++) {
    for (const list of byCategory) {
      if (list[i]) mixed.push(list[i]);
    }
  }
  return mixed;
}
