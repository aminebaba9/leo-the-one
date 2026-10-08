import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  size: string;
  color: string;
  qty: number;
  image: string;
}

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  category: varchar("category", { length: 50 }).notNull().default("tshirt"), // tshirt | hoodie
  price: integer("price").notNull(),
  compareAtPrice: integer("compare_at_price"),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  colors: jsonb("colors").$type<string[]>().notNull().default([]),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  isCombo: boolean("is_combo").notNull().default(false),
  comboProductIds: jsonb("combo_product_ids").$type<number[]>().notNull().default([]),
  comboPrice: integer("combo_price"),
  upsellProductId: integer("upsell_product_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 40 }).notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  wilaya: varchar("wilaya", { length: 120 }).notNull(),
  address: text("address").notNull(),
  items: jsonb("items").$type<OrderItem[]>().notNull().default([]),
  subtotal: integer("subtotal").notNull().default(0),
  shippingFee: integer("shipping_fee").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  couponCode: varchar("coupon_code", { length: 60 }),
  total: integer("total").notNull().default(0),
  status: varchar("status", { length: 30 }).notNull().default("pending"), // pending | confirmed | shipped | delivered | cancelled
  paymentMethod: varchar("payment_method", { length: 30 }).notNull().default("cod"),
  whatsappSent: boolean("whatsapp_sent").notNull().default(false),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 60 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull().default("percent"), // percent | amount
  value: integer("value").notNull(),
  minOrder: integer("min_order").notNull().default(0),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey(), // singleton row, always id = 1
  storeName: text("store_name").notNull().default("Leo's"),
  storeTagline: text("store_tagline").notNull().default("Oversized fits. Delivered all over Algeria."),
  whatsappNumber: varchar("whatsapp_number", { length: 40 }).notNull().default("213770000000"),
  deliveryCompany: text("delivery_company").notNull().default("Leo's Delivery"),
  deliveryBaseFee: integer("delivery_base_fee").notNull().default(800),
  freeShippingThreshold: integer("free_shipping_threshold").notNull().default(12000),
  wilayaFees: jsonb("wilaya_fees").$type<Record<string, number>>().notNull().default({}),
  currency: varchar("currency", { length: 10 }).notNull().default("DZD"),
  facebookPixelId: varchar("facebook_pixel_id", { length: 40 }).notNull().default(""),
  tiktokPixelId: varchar("tiktok_pixel_id", { length: 40 }).notNull().default(""),
  announcement: text("announcement").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type StoreSettings = typeof settings.$inferSelect;
