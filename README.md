# Leo's — Oversized T-Shirts & Hoodies 🦁

Bilingual (Français + العربية) e-commerce store for **Leo's**, built with **Next.js 16 (App Router)**, **PostgreSQL**, **Drizzle ORM** and **Tailwind CSS v4**. Made for the Algerian market: cash on delivery, all 58 wilayas, WhatsApp-first ordering.

---

## 🚀 Deploy to Supabase + Vercel

### Step 1 — Create the Supabase database

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Choose a name (e.g. `leos`), a strong **database password** (save it!), and a region close to Algeria (e.g. `eu-west-3` Paris or `eu-central-1` Frankfurt).
3. When the project is ready, open **Project Settings → Database → Connection string → URI**.
4. Copy it. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the real password.

> **Important — IPv6 warning:** Supabase's *direct* connection (`db.xxx.supabase.co:5432`) is IPv6-only. Vercel serverless functions are IPv4, so **use the connection pooler** instead: in the same page choose the **"Connection pooling"** tab (port `6543`). Or upgrade to a Supabase paid plan / use the "Session pooler" URI which is IPv4-compatible.

### Step 2 — Push the code to GitHub

```bash
# inside the unzipped project folder
git init
git add .
git commit -m "Leo's store"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/leos.git
git push -u origin main
```

> A `.gitignore` is included, so `node_modules`, `.next` and your `.env` (with your admin password) are **not** uploaded. Only commit `.env.example` as a template.

### Step 3 — Import the project into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your `leos` repository.
2. Framework preset is detected automatically (**Next.js**) — leave build settings as default.
3. Open **Environment Variables** and add:

   | Name | Value | Notes |
   | --- | --- | --- |
   | `DATABASE_URL` | your Supabase **pooler** URI (port 6543) | required |
   | `ADMIN_PASSWORD` | a long private password | required — protects `/admin` |
   | `FB_CONVERSIONS_API_TOKEN` | *(optional)* | server-side Facebook events |
   | `TIKTOK_ACCESS_TOKEN` | *(optional)* | server-side TikTok events |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` | optional, used by sitemap/robots |

4. Click **Deploy**.

### Step 4 — Create the database tables

Run this **once** from your computer (it connects to Supabase and creates the tables):

```bash
# .env at the project root must contain your Supabase DATABASE_URL
npx drizzle-kit push
```

Then seed the demo catalogue:

```bash
curl https://your-app.vercel.app/api/seed
```

> `/api/seed` only works while the store is **empty**. After that it returns `401` so strangers can't rewrite your catalogue — manage products from the admin panel instead.

### Step 5 — Log in and configure

Open `https://your-app.vercel.app/admin` and enter `ADMIN_PASSWORD`.

In **Paramètres / الإعدادات**:
- **WhatsApp number** — international format, e.g. `213550000000`
- **Delivery company name**, **base fee**, **free-delivery threshold**
- **Per-wilaya fees** for all 58 wilayas (leave blank to use the base fee)
- **Facebook Pixel ID** and **TikTok Pixel Code**

In **Paramètres → Boutique**: your store name, tagline and announcement bar.

### Step 6 — Custom domain (optional)

Vercel → **Settings → Domains** → add your domain and point the DNS records it shows at your registrar. Then update `NEXT_PUBLIC_SITE_URL` and redeploy so the sitemap uses the right URLs.

---

## 🖥️ Run locally

```bash
npm install
cp .env.example .env          # then edit DATABASE_URL + ADMIN_PASSWORD
npx drizzle-kit push          # create tables
npm run dev                   # http://localhost:3000
curl http://localhost:3000/api/seed
```

| URL | Description |
| --- | --- |
| `/` | Home (3D hero, featured, combos) |
| `/shop` | Catalogue with filters |
| `/product/[slug]` | Product page + upsell + related |
| `/combos` | Bundle deals |
| `/product/[slug]` | Product details **+ order form on the same page** |
| `/order/[id]` | Order confirmation + WhatsApp hand-off |
| `/admin` | Admin panel |
| `/download` | Download the source as a ZIP |

---

## ✨ Features

### Storefront
- **Bilingual FR / AR** with a header switcher, full **RTL layout** and Arabic web fonts.
- **3D motion hero** — cursor-tracking perspective scene, floating product cards at different depths, spinning badge, animated gradient blobs.
- **Catalogue** with category / size / colour / search / sort filters (URL-driven, shareable).
- **Product pages** — gallery, colour & size pickers, quantity, live stock, add-to-cart and express WhatsApp order.
- **Upsell** below every product ("Complète la tenue") — if the product *and* its upsell are both in the order, **10% comes off server-side**.
- **Combos** — bundled products with their own discounted price.
- **No cart — direct ordering.** Every product page has the price, colour and size pickers with the **order form right below them** (name, phone, wilaya, address, notes). One page, one step, perfect for cash-on-delivery.
- **"Complete the fit" add-on** — an optional checkbox in the order form offers the matching product; checking it applies the **−10% bundle discount server-side**.
- **Coupon codes** accepted directly in the order form.
- **Live delivery fee** per wilaya and free-delivery threshold, calculated as the customer picks their wilaya.
- **WhatsApp ordering** as an express alternative (pre-filled, localised message) and on the confirmation page.

### Admin panel (`/admin`)
- **Dashboard** — revenue, order counts, low-stock alerts, recent orders.
- **Products** — full CRUD, images, sizes, colours, stock, featured/active toggles, **combo builder** and **upsell picker**.
- **Orders** — status pipeline (pending → confirmed → shipped → delivered / cancelled), expandable details, one-click WhatsApp message, delete.
- **Coupons** — percent or fixed amount, minimum order, usage limit, expiry.
- **Settings** — store identity, WhatsApp, delivery company, base fee, free-delivery threshold, **per-wilaya fees**, pixel IDs, announcement bar.

### Marketing & tracking
- **Facebook Pixel** and **TikTok Pixel** loaded from admin settings (no redeploy needed).
- Client events: `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`.
- **Server-side** events via `/api/track` → Facebook **Conversions API** + TikTok **Events API** (tokens from env vars, so they never reach the browser). Server events share the browser `eventId` so Meta can de-duplicate.

### Integrity & security
- All prices, discounts, delivery fees and totals are **recomputed on the server** from the database — client values are never trusted.
- Quantities are **capped at real stock** and hidden products can't be ordered.
- Admin routes are protected by `src/proxy.ts` (Next.js 16 proxy convention) with an HTTP-only session cookie; all admin API routes re-check it.
- Coupon validation (active, expiry, usage limit, minimum order) runs server-side.

---

## 🎨 Theme

Cold green + white palette, defined as CSS custom properties in `src/app/globals.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--color-paper` | `#f5fbf8` | page background |
| `--color-paper-2` | `#e6f2ec` | soft panels |
| `--color-ink` | `#062b23` | dark sections & text |
| `--color-accent` | `#0f9f6e` | primary buttons & highlights |
| `--color-lime` | `#4ee0b0` | accents on dark |
| `--color-frost` | `#0e9cba` | cold teal accent |

Edit those values to re-theme the whole site — every component reads from the tokens.

---

## 🌍 Adding / editing translations

All strings live in:
- `src/lib/i18n/dictionaries/fr.ts` — French (this file also defines the `Messages` type)
- `src/lib/i18n/dictionaries/ar.ts` — Arabic

If you add a key to `fr.ts`, TypeScript will require it in `ar.ts` too. Product **names/descriptions** and the **announcement bar** are stored in the database (one language), while all UI text is translated.

---

## 🗄️ Database schema (`src/db/schema.ts`)

| Table | Purpose |
| --- | --- |
| `products` | catalogue, sizes/colours/images, stock, `is_combo` + `combo_product_ids` + `combo_price`, `upsell_product_id` |
| `orders` | customer & delivery info, items snapshot, subtotal / discount / shipping / total, status, `whatsapp_sent` |
| `coupons` | discount codes |
| `settings` | singleton row (`id = 1`) with store, WhatsApp, delivery and pixel config |

Apply schema changes with `npx drizzle-kit push`.

---

## 🧩 Project structure

```
src/
  app/
    page.tsx                  home
    shop/  product/[slug]/  combos/
    cart/  checkout/  order/[id]/
    download/                 source download page
    admin/                    login + (panel) route group
    api/                      products, orders, coupons, settings, locale, track, seed, health
    error.tsx  not-found.tsx  robots.ts  sitemap.ts
  components/                 HeroScene, ProductCard, TiltCard, pixels, cart, arrows…
  db/                         Drizzle client + schema
  lib/
    i18n/                     config, dictionaries (fr/ar), server helpers, provider
    shipping.ts  whatsapp.ts  pixels.ts  server-pixels.ts  settings.ts  wilayas.ts
  proxy.ts                    admin route protection + locale defaulting
public/images/                product & hero imagery
```

---

## 📜 Available scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # run the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

---

## ✅ Pre-launch checklist

- [ ] `ADMIN_PASSWORD` changed to something long and private
- [ ] Real WhatsApp number set in Admin → Settings
- [ ] Delivery company name, base fee and per-wilaya fees reviewed
- [ ] Free-delivery threshold set (or `0` to disable free shipping)
- [ ] Facebook Pixel ID + TikTok Pixel Code added
- [ ] `.env` never committed (`.gitignore` already handles it)
- [ ] Demo products replaced with your real catalogue
- [ ] `NEXT_PUBLIC_SITE_URL` set so the sitemap is correct
