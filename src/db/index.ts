import "server-only";
import { createDb, type Db } from "./client";

const globalForDb = globalThis as unknown as { __db?: Promise<Db> };

/**
 * Shared database handle. Uses Postgres when DATABASE_URL is set (Vercel/Neon),
 * otherwise an embedded PGlite database under .data/ for local development.
 */
export function getDb(): Promise<Db> {
  globalForDb.__db ??= createDb();
  return globalForDb.__db;
}
