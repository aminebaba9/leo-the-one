import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { coupons, products, settings } from "@/db/schema";
import { DEFAULT_SETTINGS } from "@/lib/settings";

export const dynamic = "force-dynamic";

const SIZES_ALL = ["S", "M", "L", "XL", "2XL"];

const WILAYA_FEES: Record<string, number> = {
  Alger: 600, Blida: 600, Boumerdès: 600, Tipaza: 650, "Tizi Ouzou": 650,
  Béjaïa: 700, Oran: 700, Constantine: 700, Sétif: 700, Médéa: 700, Chlef: 700,
  Bouira: 700, "Aïn Defla": 700, Tlemcen: 750, Annaba: 750, Batna: 750,
  Mostaganem: 750, Mascara: 750, Relizane: 750, Skikda: 750, Jijel: 750,
  "Aïn Témouchent": 750, Guelma: 800, "Souk Ahras": 800, Saïda: 800, Tiaret: 800,
  "M'Sila": 850, Mila: 800, Khenchela: 850, "Oum El Bouaghi": 850, "El Tarf": 800,
  "Sidi Bel Abbès": 800, Tissemsilt: 800, "Bordj Bou Arréridj": 800, Djelfa: 850,
  Tébessa: 850, Biskra: 850, Ouargla: 950, Ghardaïa: 950, Béchar: 950,
  "El Oued": 950, Laghouat: 900, Adrar: 1100, Tamanrasset: 1200, Illizi: 1300,
  Tindouf: 1300, Touggourt: 1000, Djanet: 1400, "El Meniaa": 1100, Timimoun: 1200,
  "Bordj Badji Mokhtar": 1400, "Ouled Djellal": 1000, "Béni Abbès": 1100,
  "In Salah": 1200, "In Guezzam": 1400, "El M'Ghair": 1000, Naâma: 1000, "El Bayadh": 1000,
};

const TEE_DESC =
  "Le tee oversized signature de Leo's. Coton lourd 240g, coupe boxy avec épaules tombantes, coutures renforcées. Porte-le ample, vis dedans.\n\nPaiement à la livraison dans les 58 wilayas.";

const HOODIE_DESC =
  "Le hoodie oversized épais de Leo's. Molleton brossé épais, capuche doublée, poche kangourou, coupe boxy jusqu'à mi-cuisse.\n\nPaiement à la livraison dans les 58 wilayas.";

/**
 * Idempotent seed: creates the singleton settings row and a demo catalogue
 * (tees, hoodies, combos with upsells) when the products table is empty.
 * Safe to call multiple times.
 */
async function seed() {
  // 1. Settings
  const [existingSettings] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  if (!existingSettings) {
    await db.insert(settings).values({
      ...DEFAULT_SETTINGS,
      whatsappNumber: "213550000000",
      wilayaFees: WILAYA_FEES,
      announcement: "🚚 Livraison offerte dès 12 000 DA — dans les 58 wilayas !",
      updatedAt: new Date(),
    });
  }

  // 2. Products (only when empty)
  const [productCount] = await db.select({ value: count() }).from(products);
  let created = 0;

  if (productCount.value === 0) {
    const [teeBlack] = await db
      .insert(products)
      .values({
        name: "Tee Classic Leo's — Noir",
        slug: "leos-classic-tee-black",
        description: TEE_DESC,
        category: "tshirt",
        price: 3200,
        compareAtPrice: 3800,
        images: ["/images/products/tee-black.png", "/images/hero.png"],
        sizes: SIZES_ALL,
        colors: ["Black"],
        stock: 40,
        featured: true,
      })
      .returning();

    const [teeSand] = await db
      .insert(products)
      .values({
        name: "Tee Classic Leo's — Sable",
        slug: "leos-classic-tee-sand",
        description: TEE_DESC,
        category: "tshirt",
        price: 3200,
        compareAtPrice: 3800,
        images: ["/images/products/tee-sand.png"],
        sizes: SIZES_ALL,
        colors: ["Sand"],
        stock: 35,
        featured: true,
      })
      .returning();

    const [teeWhite] = await db
      .insert(products)
      .values({
        name: "Tee Classic Leo's — Blanc",
        slug: "leos-classic-tee-white",
        description: TEE_DESC,
        category: "tshirt",
        price: 3200,
        compareAtPrice: 3800,
        images: ["/images/products/tee-white.png"],
        sizes: SIZES_ALL,
        colors: ["White"],
        stock: 35,
      })
      .returning();

    const [hoodieBlack] = await db
      .insert(products)
      .values({
        name: "Hoodie Heavy Leo's — Noir",
        slug: "leos-heavy-hoodie-black",
        description: HOODIE_DESC,
        category: "hoodie",
        price: 5900,
        compareAtPrice: 6900,
        images: ["/images/products/hoodie-black.png", "/images/hero.png"],
        sizes: SIZES_ALL,
        colors: ["Black"],
        stock: 30,
        featured: true,
      })
      .returning();

    const [hoodieGrey] = await db
      .insert(products)
      .values({
        name: "Hoodie Heavy Leo's — Gris",
        slug: "leos-heavy-hoodie-grey",
        description: HOODIE_DESC,
        category: "hoodie",
        price: 5900,
        compareAtPrice: 6900,
        images: ["/images/products/hoodie-grey.png"],
        sizes: SIZES_ALL,
        colors: ["Grey"],
        stock: 25,
        featured: true,
      })
      .returning();

    const [hoodieOlive] = await db
      .insert(products)
      .values({
        name: "Hoodie Heavy Leo's — Kaki",
        slug: "leos-heavy-hoodie-olive",
        description: HOODIE_DESC,
        category: "hoodie",
        price: 6200,
        compareAtPrice: 7200,
        images: ["/images/products/hoodie-olive.png"],
        sizes: SIZES_ALL,
        colors: ["Olive"],
        stock: 20,
      })
      .returning();

    await db.insert(products).values({
      name: "Le Full Fit — Tee + Hoodie",
      slug: "leos-combo-full-fit",
      description:
        "La tenue complète Leo's : Tee Classic + Hoodie Heavy en un seul bundle. Économise 900 DA et paye une seule livraison.\n\nInclus : 1× Tee Classic + 1× Hoodie Heavy (Noir).",
      category: "hoodie",
      price: 8200,
      compareAtPrice: 9100,
      images: ["/images/combo.png"],
      sizes: SIZES_ALL,
      colors: ["Black"],
      stock: 15,
      isCombo: true,
      comboProductIds: [teeBlack.id, hoodieBlack.id],
      comboPrice: 8200,
    });

    await db.insert(products).values({
      name: "Pack Twin Tee — Noir + Blanc",
      slug: "leos-combo-twin-tee",
      description:
        "Deux tees classic oversized (Noir + Blanc) pour le prix d'un et demi. Économise 600 DA.\n\nInclus : 1× Tee Classic Noir + 1× Tee Classic Blanc.",
      category: "tshirt",
      price: 5800,
      compareAtPrice: 6400,
      images: ["/images/products/tee-black.png", "/images/products/tee-white.png"],
      sizes: SIZES_ALL,
      colors: ["Black", "White"],
      stock: 20,
      isCombo: true,
      comboProductIds: [teeBlack.id, teeWhite.id],
      comboPrice: 5800,
    });

    // 3. Upsell links ("complète la tenue")
    const upsellPairs: Array<[number, number]> = [
      [teeBlack.id, hoodieBlack.id],
      [hoodieBlack.id, teeBlack.id],
      [teeSand.id, hoodieGrey.id],
      [hoodieGrey.id, teeSand.id],
      [teeWhite.id, hoodieOlive.id],
      [hoodieOlive.id, teeWhite.id],
    ];
    for (const [productId, upsellId] of upsellPairs) {
      await db.update(products).set({ upsellProductId: upsellId }).where(eq(products.id, productId));
    }

    created = 8;
  }

  // 4. Demo coupon
  const [couponCount] = await db.select({ value: count() }).from(coupons);
  let couponCreated = false;
  if (couponCount.value === 0) {
    await db.insert(coupons).values({
      code: "LEO10",
      type: "percent",
      value: 10,
      minOrder: 0,
      usageLimit: 200,
      active: true,
    });
    couponCreated = true;
  }

  return { settings: !existingSettings, products: created, coupon: couponCreated };
}

export async function GET() {
  try {
    const [productCount] = await db.select({ value: count() }).from(products);
    const isEmpty = productCount.value === 0;

    // On a public host this endpoint would let anyone rewrite the catalogue,
    // so once the store has products it requires the admin session.
    if (!isEmpty) {
      const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
      if (row) {
        return NextResponse.json(
          { ok: false, error: "Store already seeded. Log in to /admin and use the admin panel to manage products." },
          { status: 401 },
        );
      }
    }

    const result = await seed();
    return NextResponse.json({ ok: true, seeded: result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
