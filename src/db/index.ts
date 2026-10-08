import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5432/postgres";

if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === "production") {
    console.error("DATABASE_URL is required in production");
  } else {
    console.warn("DATABASE_URL is not set — using local development placeholder");
  }
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool, { schema });
