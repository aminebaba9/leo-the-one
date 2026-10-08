import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings, type StoreSettings } from "@/db/schema";

export const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  storeName: "Leo's",
  storeTagline: "Fits oversized. Livraison dans toute l'Algérie.",
  whatsappNumber: "213770000000",
  deliveryCompany: "Leo's Delivery",
  deliveryBaseFee: 800,
  freeShippingThreshold: 12000,
  wilayaFees: {},
  currency: "DZD",
  facebookPixelId: "",
  tiktokPixelId: "",
  announcement: "",
  updatedAt: new Date(),
};

/**
 * Fetches the singleton store settings row. Falls back to defaults when the
 * table is empty or the database is unreachable (e.g. during build).
 */
export const getSettings = cache(async (): Promise<StoreSettings> => {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(eq(settings.id, 1))
      .limit(1);
    if (rows.length > 0) return rows[0];
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
});
