"use client";

/**
 * Client-side tracking helpers for the Facebook Pixel and TikTok Pixel.
 * Both pixels are injected in the root layout from the admin-controlled
 * settings (see PixelScripts). All calls are safe no-ops when the pixels
 * are not configured.
 */

export interface PixelContentItem {
  id: string | number;
  quantity: number;
  item_price: number;
}

export interface PixelParams {
  value?: number;
  currency?: string;
  contents?: PixelContentItem[];
  content_ids?: Array<string | number>;
  content_type?: string;
  content_name?: string;
  num_items?: number;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, params?: PixelParams) => void;
      page?: () => void;
    };
  }
}

export type PixelEventName = "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

const TIKTOK_EVENT_MAP: Record<PixelEventName, string> = {
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  Purchase: "CompletePayment",
};

export function trackPixelEvent(event: PixelEventName, params?: PixelParams): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", event, params);
  } catch {
    /* noop */
  }
  try {
    window.ttq?.track(TIKTOK_EVENT_MAP[event], params);
  } catch {
    /* noop */
  }
}

export const trackViewContent = (params: PixelParams) => trackPixelEvent("ViewContent", params);
export const trackAddToCart = (params: PixelParams) => trackPixelEvent("AddToCart", params);
export const trackInitiateCheckout = (params: PixelParams) =>
  trackPixelEvent("InitiateCheckout", params);
export const trackPurchase = (params: PixelParams) => trackPixelEvent("Purchase", params);
