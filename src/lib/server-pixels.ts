import { createHash } from "crypto";

/**
 * Server-side event forwarding:
 *  - Facebook Conversions API (requires FB_CONVERSIONS_API_TOKEN + pixel id)
 *  - TikTok Events API (requires TIKTOK_ACCESS_TOKEN + pixel code)
 *
 * Pixel IDs come from the admin settings; the access tokens are read from
 * environment variables so they never reach the browser. All calls are
 * best-effort and never throw.
 */

const FB_API_VERSION = "v21.0";
const TIKTOK_TRACK_URL = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const TIKTOK_EVENT_MAP: Record<string, string> = {
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  Purchase: "CompletePayment",
};

export interface ServerEventInput {
  event: string;
  pixelId?: string;
  tiktokPixelId?: string;
  eventId: string;
  url?: string;
  value?: number;
  currency?: string;
  contents?: Array<{ id: string | number; quantity: number; item_price: number }>;
  phone?: string;
  userAgent?: string;
  ip?: string;
}

async function sendFacebookEvent(
  pixelId: string,
  token: string,
  input: ServerEventInput,
): Promise<void> {
  const userData: Record<string, unknown> = {
    client_user_agent: input.userAgent ?? "leos-website",
  };
  if (input.ip) userData.client_ip_address = input.ip;
  if (input.phone) userData.ph = sha256(input.phone);

  const customData: Record<string, unknown> = {};
  if (typeof input.value === "number") customData.value = input.value;
  if (input.currency) customData.currency = input.currency;
  if (input.contents) customData.contents = input.contents;
  if (input.contents) customData.content_ids = input.contents.map((c) => String(c.id));

  const payload = {
    data: [
      {
        event_name: input.event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.url ?? "https://leos.store",
        user_data: userData,
        custom_data: customData,
      },
    ],
    access_token: token,
  };

  await fetch(`https://graph.facebook.com/${FB_API_VERSION}/${pixelId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });
}

async function sendTiktokEvent(
  pixelCode: string,
  token: string,
  input: ServerEventInput,
): Promise<void> {
  const payload = {
    pixel_code: pixelCode,
    event: TIKTOK_EVENT_MAP[input.event] ?? input.event,
    event_id: input.eventId,
    timestamp: new Date().toISOString(),
    context: {
      page: { url: input.url ?? "https://leos.store" },
      user: {
        phone_number: input.phone ? sha256(input.phone) : undefined,
        user_agent: input.userAgent ?? "leos-website",
        ip: input.ip ?? "",
      },
    },
    properties: {
      value: input.value ?? 0,
      currency: input.currency ?? "DZD",
      contents: input.contents ?? [],
    },
  };

  await fetch(TIKTOK_TRACK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Token": token,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });
}

export async function sendServerEvent(input: ServerEventInput): Promise<void> {
  const fbToken = process.env.FB_CONVERSIONS_API_TOKEN;
  const tiktokToken = process.env.TIKTOK_ACCESS_TOKEN;

  const tasks: Array<Promise<unknown>> = [];

  if (fbToken && input.pixelId) {
    tasks.push(sendFacebookEvent(input.pixelId, fbToken, input).catch(() => undefined));
  }
  if (tiktokToken && input.tiktokPixelId) {
    tasks.push(sendTiktokEvent(input.tiktokPixelId, tiktokToken, input).catch(() => undefined));
  }

  await Promise.allSettled(tasks);
}
