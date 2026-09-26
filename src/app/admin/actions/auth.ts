"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";
import { clearLoginFailures, loginBlockedFor, recordLoginFailure } from "@/lib/rate-limit";
import { sessionSecretProblem } from "@/lib/session";
import { firstError, type FormState } from "@/lib/validation";

// Compared against when the email is unknown so response time does not reveal which emails exist.
const DUMMY_HASH = "$2b$12$5VB7dnnjtjRUJ7XA3FtvMuH/4ycLw3wFUgRnowYDR9B0x55JAdpBu";

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const waitMinutes = await loginBlockedFor(email);
  if (waitMinutes) {
    return { error: `Too many failed attempts. Try again in ${waitMinutes} minute${waitMinutes === 1 ? "" : "s"}.` };
  }

  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  // Also accept the password without stray spaces from copy and paste.
  const trimmed = password.trim();
  const hash = user?.passwordHash ?? DUMMY_HASH;
  const valid = (await bcrypt.compare(password, hash)) || (trimmed !== password && (await bcrypt.compare(trimmed, hash)));
  if (!user || !valid) {
    await recordLoginFailure(email);
    return { error: "Incorrect email or password." };
  }

  await clearLoginFailures(email);
  const secretProblem = sessionSecretProblem();
  if (secretProblem) {
    console.error(`Admin sign-in blocked: ${secretProblem}`);
    return { error: "Sign-in isn't configured on the server: SESSION_SECRET is missing or too short. Set it in the hosting environment variables and redeploy." };
  }
  await createSession({ userId: user.id, email: user.email });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters for the new password.`).max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, "The new passwords do not match.");

export async function changePassword(_state: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.id, session.userId));
  if (!user || !(await bcrypt.compare(parsed.data.current, user.passwordHash))) {
    return { error: "Your current password is incorrect." };
  }
  await db.update(users).set({ passwordHash: await bcrypt.hash(parsed.data.next, 12) }).where(eq(users.id, user.id));
  return { ok: "Password updated." };
}
