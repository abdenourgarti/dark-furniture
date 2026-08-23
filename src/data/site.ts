/**
 * Single source of truth for the workshop's real-world details.
 * Edit this file (and nothing else) when the address, phone or map pin changes.
 */
export const site = {
  name: "Dark Furniture",
  email: "dark.furnitures@gmail.com",

  // TODO: replace with the real showroom details before going live.
  phone: "+213 000 00 00 00",
  phoneHref: "+21300000000",
  whatsapp: "21300000000",

  address: {
    fr: "Adresse du showroom, Alger, Algérie",
    ar: "عنوان المعرض، الجزائر العاصمة، الجزائر",
  },

  hours: {
    fr: "Samedi au jeudi, 09h00 - 18h00",
    ar: "من السبت إلى الخميس، 09:00 - 18:00",
  },

  /** Showroom coordinates. Replace with the exact pin, then the embed follows automatically. */
  geo: { lat: 36.7538, lng: 3.0588 },

  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
  },
} as const;

/** Google Maps embed that needs no API key. */
export function mapEmbedUrl(locale: string) {
  const { lat, lng } = site.geo;
  const q = encodeURIComponent(`${lat},${lng}`);
  return `https://www.google.com/maps?q=${q}&z=15&hl=${locale}&output=embed`;
}

export function mapDirectionsUrl() {
  const { lat, lng } = site.geo;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
