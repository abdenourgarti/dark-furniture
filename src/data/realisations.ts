/**
 * Shape of the realisations gallery, shared by both halves of it.
 *
 * Deliberately free of any Node import: the client gallery needs the category
 * list and the types, and a stray `node:fs` in here would be dragged into the
 * browser bundle with it. The filesystem side lives in ./realisations-photos.
 */

/** Folder names under public/images/realisations, in the order they are shown. */
export const categories = ["bureau", "chambre", "cuisine", "meubletv"] as const;

export type Category = (typeof categories)[number];

export type Realisation = {
  src: string;
  category: Category;
};
