import { Resend } from "resend";

import { contactSchema, normalizePhone } from "@/lib/contact-schema";
import { wilayas } from "@/data/wilayas";
import fr from "@/i18n/dictionaries/fr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Very small in-process throttle. It resets whenever the serverless instance
 * recycles, so treat it as a speed bump against casual abuse rather than as a
 * real rate limiter. Put a proper one in front of the route if spam appears.
 */
const HITS = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function throttled(ip: string) {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (throttled(ip)) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const data = parsed.data;

  // A filled honeypot means a bot. Answer 200 so it does not learn anything.
  if (data.website) return Response.json({ ok: true });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set: the contact form cannot send mail.");
    return Response.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  const wilaya = wilayas.find((w) => w.code === data.wilaya);
  const wilayaText = wilaya ? `${wilaya.code} - ${wilaya.fr} (${wilaya.ar})` : data.wilaya;
  const projectText =
    fr.contact.projects[data.project as keyof typeof fr.contact.projects] ?? data.project;
  const phone = normalizePhone(data.phone);

  const rows: [string, string][] = [
    ["Nom", data.name],
    ["Téléphone", phone],
    ["E-mail", data.email || "non renseigné"],
    ["Wilaya", wilayaText],
    ["Type de projet", projectText],
    ["Langue du site", data.locale === "ar" ? "Arabe" : "Français"],
  ];

  const html = `
<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:600px;color:#15151a">
  <h2 style="font-weight:500;letter-spacing:.02em;margin:0 0 4px">Nouvelle demande de devis</h2>
  <p style="margin:0 0 24px;color:#56565e;font-size:14px">Envoyée depuis le site Dark Furniture.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    ${rows
      .map(
        ([label, value]) => `
    <tr>
      <td style="padding:9px 0;color:#86868d;width:150px;vertical-align:top">${label}</td>
      <td style="padding:9px 0;color:#15151a"><strong>${escapeHtml(value)}</strong></td>
    </tr>`,
      )
      .join("")}
  </table>
  <div style="margin-top:24px;padding-top:20px;border-top:1px solid #dededa">
    <p style="margin:0 0 8px;color:#86868d;font-size:13px">Message</p>
    <p style="margin:0;white-space:pre-wrap;line-height:1.7;font-size:14px">${escapeHtml(
      data.message,
    )}</p>
  </div>
</div>`;

  const text = [
    "Nouvelle demande de devis",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    data.message,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      // Until a domain is verified in Resend, keep the onboarding sender.
      from: process.env.CONTACT_FROM ?? "Dark Furniture <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO ?? "dark.furnitures@gmail.com"],
      replyTo: data.email || undefined,
      subject: `Devis ${projectText} - ${data.name} (${wilaya?.fr ?? data.wilaya})`,
      html,
      text,
    });

    if (error) {
      console.error("Resend rejected the message:", error);
      return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Contact route failed:", err);
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
}
