import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { closeDb, createDb, runMigrations } from "../src/db/client";
import { users } from "../src/db/schema";
import { passwordProblem } from "../src/lib/password";

/**
 * Sets the admin login to ADMIN_EMAIL / ADMIN_PASSWORD, creating the user or replacing its password.
 * Locally, stop `npm run dev` first (the embedded database allows one process at a time).
 */
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local first.");
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);

  const db = await createDb();
  await runMigrations(db);
  const passwordHash = await bcrypt.hash(password, 12);
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) await db.update(users).set({ passwordHash }).where(eq(users.id, existing.id));
  else await db.insert(users).values({ email, passwordHash });
  await closeDb(db);
  console.log(`Admin login set for ${email}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
