"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { certifications, education, experiences } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { deleteIfReplaced, deleteUpload } from "@/lib/storage";
import { resolveFileField, uploadErrorMessage } from "@/lib/upload-field";
import { firstError, formValues, monthValue, nullIfEmpty, optionalUrl, required, sortValue, text, yearValue, type FormState } from "@/lib/validation";

const experienceSchema = z
  .object({
    role: required("Role", 120),
    company: required("Company", 120),
    startDate: monthValue,
    endDate: monthValue,
    location: text(80),
    description: text(2000),
    sortOrder: sortValue,
  })
  .refine((v) => !v.startDate || !v.endDate || v.startDate <= v.endDate, "The end date must be after the start date.");

function parseExperience(formData: FormData) {
  const parsed = experienceSchema.safeParse(formValues(formData));
  if (!parsed.success) return { error: firstError(parsed.error) } as const;
  const current = formData.get("current") === "on";
  return {
    data: {
      ...parsed.data,
      startDate: nullIfEmpty(parsed.data.startDate),
      endDate: current ? null : nullIfEmpty(parsed.data.endDate),
    },
  } as const;
}

/** Resolves the optional logo upload; returns the URL to store or an error message. */
async function logoField(formData: FormData, current: string | null): Promise<{ url: string | null } | { error: string }> {
  try {
    return { url: await resolveFileField(formData, { file: "logo", remove: "removeLogo", current, folder: "images" }) };
  } catch (error) {
    const message = uploadErrorMessage(error);
    if (message) return { error: message };
    throw error;
  }
}

function done(message: string): FormState {
  revalidatePath("/", "layout");
  return { ok: message };
}

export async function createExperience(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parseExperience(formData);
  if ("error" in result) return { error: result.error };
  const logo = await logoField(formData, null);
  if ("error" in logo) return logo;
  await (await getDb()).insert(experiences).values({ ...result.data, logoUrl: logo.url });
  return done("Experience added.");
}

export async function updateExperience(id: number, _state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parseExperience(formData);
  if ("error" in result) return { error: result.error };
  const db = await getDb();
  const [existing] = await db.select({ logoUrl: experiences.logoUrl }).from(experiences).where(eq(experiences.id, id));
  const logo = await logoField(formData, existing?.logoUrl ?? null);
  if ("error" in logo) return logo;
  await db.update(experiences).set({ ...result.data, logoUrl: logo.url }).where(eq(experiences.id, id));
  await deleteIfReplaced(existing?.logoUrl, logo.url);
  return done("Saved.");
}

export async function deleteExperience(id: number): Promise<void> {
  await requireAdmin();
  const [removed] = await (await getDb()).delete(experiences).where(eq(experiences.id, id)).returning({ logoUrl: experiences.logoUrl });
  await deleteUpload(removed?.logoUrl);
  revalidatePath("/", "layout");
}

const educationSchema = z.object({
  degree: required("Degree", 160),
  institution: text(160),
  startYear: yearValue,
  endYear: yearValue,
  sortOrder: sortValue,
});

function parseEducation(formData: FormData) {
  const parsed = educationSchema.safeParse(formValues(formData));
  if (!parsed.success) return { error: firstError(parsed.error) } as const;
  return { data: { ...parsed.data, startYear: nullIfEmpty(parsed.data.startYear), endYear: nullIfEmpty(parsed.data.endYear) } } as const;
}

const certificationSchema = z
  .object({
    name: required("Name", 160),
    issuer: text(120),
    issueDate: monthValue,
    expiryDate: monthValue,
    credentialId: text(120),
    credentialUrl: optionalUrl,
    sortOrder: sortValue,
  })
  .refine((v) => !v.issueDate || !v.expiryDate || v.issueDate <= v.expiryDate, "The expiry date must be after the issue date.");

function parseCertification(formData: FormData) {
  const parsed = certificationSchema.safeParse(formValues(formData));
  if (!parsed.success) return { error: firstError(parsed.error) } as const;
  const d = parsed.data;
  return {
    data: { ...d, issueDate: nullIfEmpty(d.issueDate), expiryDate: nullIfEmpty(d.expiryDate), credentialUrl: nullIfEmpty(d.credentialUrl) },
  } as const;
}

export async function createEducation(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parseEducation(formData);
  if ("error" in result) return { error: result.error };
  const logo = await logoField(formData, null);
  if ("error" in logo) return logo;
  await (await getDb()).insert(education).values({ ...result.data, logoUrl: logo.url });
  return done("Education added.");
}

export async function updateEducation(id: number, _state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parseEducation(formData);
  if ("error" in result) return { error: result.error };
  const db = await getDb();
  const [existing] = await db.select({ logoUrl: education.logoUrl }).from(education).where(eq(education.id, id));
  const logo = await logoField(formData, existing?.logoUrl ?? null);
  if ("error" in logo) return logo;
  await db.update(education).set({ ...result.data, logoUrl: logo.url }).where(eq(education.id, id));
  await deleteIfReplaced(existing?.logoUrl, logo.url);
  return done("Saved.");
}

export async function deleteEducation(id: number): Promise<void> {
  await requireAdmin();
  const [removed] = await (await getDb()).delete(education).where(eq(education.id, id)).returning({ logoUrl: education.logoUrl });
  await deleteUpload(removed?.logoUrl);
  revalidatePath("/", "layout");
}

export async function createCertification(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parseCertification(formData);
  if ("error" in result) return { error: result.error };
  const logo = await logoField(formData, null);
  if ("error" in logo) return logo;
  await (await getDb()).insert(certifications).values({ ...result.data, logoUrl: logo.url });
  return done("Certification added.");
}

export async function updateCertification(id: number, _state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parseCertification(formData);
  if ("error" in result) return { error: result.error };
  const db = await getDb();
  const [existing] = await db.select({ logoUrl: certifications.logoUrl }).from(certifications).where(eq(certifications.id, id));
  const logo = await logoField(formData, existing?.logoUrl ?? null);
  if ("error" in logo) return logo;
  await db.update(certifications).set({ ...result.data, logoUrl: logo.url }).where(eq(certifications.id, id));
  await deleteIfReplaced(existing?.logoUrl, logo.url);
  return done("Saved.");
}

export async function deleteCertification(id: number): Promise<void> {
  await requireAdmin();
  const [removed] = await (await getDb()).delete(certifications).where(eq(certifications.id, id)).returning({ logoUrl: certifications.logoUrl });
  await deleteUpload(removed?.logoUrl);
  revalidatePath("/", "layout");
}
