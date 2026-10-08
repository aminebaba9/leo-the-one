import type { StoreSettings } from "@/db/schema";

type ShippingConfig = Pick<
  StoreSettings,
  "deliveryBaseFee" | "freeShippingThreshold" | "wilayaFees"
>;

export function computeShippingFee(
  config: ShippingConfig,
  wilaya: string,
  subtotalAfterDiscount: number,
): number {
  if (config.freeShippingThreshold > 0 && subtotalAfterDiscount >= config.freeShippingThreshold) {
    return 0;
  }
  const fees = config.wilayaFees ?? {};
  const override = fees[wilaya];
  if (typeof override === "number" && override >= 0) return override;
  return config.deliveryBaseFee;
}
