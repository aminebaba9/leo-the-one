# 🚀 Leo's — Deployment checklist (Supabase + GitHub + Vercel)

Follow these in order. Total time: about 15 minutes.

---

## STEP 1 — Supabase (database)

1. Go to <https://supabase.com> → **New project**
   - Name: `leos`
   - **Database password**: create a strong one and **save it** (you'll need it twice)
   - Region: `West EU (Paris)` or `Central EU (Frankfurt)` — closest to Algeria
2. When it's ready, open **SQL Editor** (left sidebar) → **New query**
3. Open the file **`supabase-setup.sql`** from this folder, copy **all** of it, paste it in, click **Run**
   - ✅ This creates the 4 tables + a starter settings row + the `LEO10` coupon
4. Now get your connection string:
   - **Project Settings** ⚙️ → **Database** → **Connection string**
   - Choose the **Connection pooling** tab (port **6543**) ⚠️ not the direct one
   - Copy the URI and replace `[YOUR-PASSWORD]` with your real password

   ```
   postgresql://postgres.abcdefgh:YOUR-PASSWORD@aws-0-eu-west-3.pooler.supabase.com:6543/postgres
   ```

   > ⚠️ **Why the pooler?** The direct connection (`db.xxx.supabase.co:5432`) is IPv6-only.
   > Vercel serverless functions use IPv4, so the direct string will fail with a connection timeout.
   > If your pooler URI starts with `postgres.abcdefgh@` keep it exactly like that — that's correct.

**✅ Supabase done. Keep that URI for step 3.**

---

## STEP 2 — GitHub (code)

```bash
cd leos-website        # the unzipped folder
git init
git add .
git commit -m "Leo's store"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/leos.git
git push -u origin main
```

- Create the empty repo first on <https://github.com/new> (no README, no .gitignore — we already have one).
- `.gitignore` already excludes `node_modules`, `.next` and `.env`, so **your password will not be uploaded**.
- If `git push` asks for a password, use a **Personal Access Token** (<https://github.com/settings/tokens>), not your GitHub password.

**✅ Code on GitHub.**

---

## STEP 3 — Vercel (hosting)

1. Go to <https://vercel.com/new> → **Import** your `leos` repository
2. Framework preset: **Next.js** (auto-detected) — leave Build settings alone
3. Open **Environment Variables** and add these **before** clicking Deploy:

| Name | Value | Required |
| --- | --- | --- |
| `DATABASE_URL` | your Supabase **pooler** URI from step 1 | ✅ yes |
| `ADMIN_PASSWORD` | a long private password (this protects `/admin`) | ✅ yes |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` (or your domain) | recommended |
| `FB_CONVERSIONS_API_TOKEN` | Facebook Conversions API token | optional |
| `TIKTOK_ACCESS_TOKEN` | TikTok Events API token | optional |

4. Click **Deploy** and wait ~1 minute.

**✅ Your store is live.**

---

## STEP 4 — Fill the store

1. Open `https://your-app.vercel.app/admin`
2. Log in with your `ADMIN_PASSWORD`
3. **Paramètres** tab → set:
   - **Numéro WhatsApp** (international format, no `+`): `213XXXXXXXXX`
   - **Société de livraison**, **frais de base**, **seuil de livraison offerte**
   - **Frais par wilaya** for each of the 58 wilayas (blank = base fee)
   - **ID Pixel Facebook** + **Code Pixel TikTok**
4. **Produits** tab → add your real t-shirts and hoodies
   - For each product you can set sizes, colours, stock, and (optionally)
     an **upsell product** (the "complete the fit" add-on) and combos.

**✅ Done — share your Vercel link everywhere.**

---

## 🔧 Troubleshooting

| Problem | Fix |
| --- | --- |
| Vercel build fails on DB connection | You used the **direct** URI. Switch to the **pooler** one (port 6543). |
| Pages load but products are empty | Run `supabase-setup.sql` in Supabase, then add products in `/admin`. |
| Can't log in to `/admin` | `ADMIN_PASSWORD` isn't set in Vercel → add it, then **redeploy**. |
| "relation products does not exist" | The SQL script wasn't run. Run `supabase-setup.sql`. |
| Pixel events not showing | Check the ID in `/admin` → Paramètres, and test with Meta Pixel Helper. |
| Want to add tables later | Run `npx drizzle-kit push` locally with `DATABASE_URL` set to your Supabase URI. |

---

## 🔁 Later code changes

Just push to GitHub — Vercel redeploys automatically:

```bash
git add .
git commit -m "update"
git push
```

---

## 🧪 Run it on your computer first (optional)

```bash
npm install
cp .env.example .env      # put your Supabase URI + an ADMIN_PASSWORD inside
npm run dev               # http://localhost:3000
```
