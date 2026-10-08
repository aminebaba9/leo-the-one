import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { sendServerEvent } from "@/lib/server-pixels";

export const dynamic = "force-dynamic";

/**
 * Public endpoint used after checkout to fire server-side conversion events
 * (Facebook Conversions API + TikTok Events API) using the tokens stored in
 * environment variables. Fails silently when not configured.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const event = String(body.event ?? "");
  if (!event) return NextResponse.json({ ok: true });

  const store = await getSettings();

  await sendServerEvent({
    event,
    pixelId: store.facebookPixelId || undefined,
    tiktokPixelId: store.tiktokPixelId || undefined,
    eventId: String(body.eventId ?? `${event}-${Date.now()}`),
    url: typeof body.url === "string" ? body.url : undefined,
    value: typeof body.value === "number" ? body.value : undefined,
    currency: typeof body.currency === "string" ? body.currency : "DZD",
    contents: Array.isArray(body.contents) ? body.contents : undefined,
    phone: typeof body.phone === "string" ? body.phone : undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
    ip:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined,
  });

  return NextResponse.json({ ok: true });
}
