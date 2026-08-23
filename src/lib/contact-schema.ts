import { z } from "zod";
import { wilayaCodes } from "@/data/wilayas";

export const PROJECT_TYPES = [
  "kitchen",
  "dressing",
  "bedroom",
  "kids",
  "tv",
  "office",
  "other",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

/** Algerian numbers: 0X XX XX XX XX, or the +213 / 00213 international forms. */
export function normalizePhone(value: string) {
  return value.replace(/[\s.\-()]/g, "");
}

function isAlgerianPhone(value: string) {
  return /^(?:0|\+213|00213)\d{8,9}$/.test(normalizePhone(value));
}

/**
 * Messages are dictionary keys, not sentences: the same schema validates on
 * the client in two languages and again on the server.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "required").max(80, "required"),
  phone: z.string().trim().min(1, "required").refine(isAlgerianPhone, "invalidPhone"),
  email: z
    .union([z.literal(""), z.email("invalidEmail")])
    .optional()
    .transform((v) => v ?? ""),
  wilaya: z.string().refine((v) => wilayaCodes.includes(v), "required"),
  project: z
    .string()
    .refine((v) => (PROJECT_TYPES as readonly string[]).includes(v), "required"),
  message: z.string().trim().min(10, "tooShort").max(2000, "tooShort"),
  locale: z.string().optional(),
  /**
   * Honeypot. Real people never see this field. It is accepted by the schema on
   * purpose so the route can answer 200 to a bot instead of a validation error,
   * which would tell the bot exactly what to fix.
   */
  website: z.string().optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;
