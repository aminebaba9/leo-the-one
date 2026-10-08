import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Reads DATABASE_URL from .env (local) or from the environment (Vercel/CI).
 * There is deliberately no hardcoded fallback URL: a silent localhost default
 * would make `drizzle-kit push` hit the wrong database in production.
 *
 * Get the value from Supabase → Project Settings → Database → Connection
 * pooling (port 6543).
 */
const url = process.env.DATABASE_URL;

if (!url || url.trim().length === 0) {
  console.error(
    "\n✖ DATABASE_URL is not set.\n" +
      "  Create a .env file (copy .env.example) and paste your Supabase\n" +
      "  connection string into it:\n\n" +
      '  DATABASE_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"\n',
  );
  process.exit(1);
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url },
  verbose: true,
});
