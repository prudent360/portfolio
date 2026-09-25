"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { education, experiences } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { firstError, formValues, monthValue, nullIfEmpty, required, sortValue, text, yearValue, type FormState } from "@/lib/validation";

const experienceSchema = z
  .object({
    role: required("Role", 120),
    company: required("Company", 120),
    startDate: monthValue,
    endDate: monthValue,
    description: text(1000),
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

export async function createExperience(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parseExperience(formData);
  if ("error" in result) return { error: result.error };
  await (await getDb()).insert(experiences).values(result.data);
  revalidatePath("/", "layout");
  return { ok: "Experience added." };
}

export async function updateExperience(id: number, _state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parseExperience(formData);
  if ("error" in result) return { error: result.error };
  await (await getDb()).update(experiences).set(result.data).where(eq(experiences.id, id));
  revalidatePath("/", "layout");
  return { ok: "Saved." };
}

export async function deleteExperience(id: number): Promise<void> {
  await requireAdmin();
  await (await getDb()).delete(experiences).where(eq(experiences.id, id));
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

export async function createEducation(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parseEducation(formData);
  if ("error" in result) return { error: result.error };
  await (await getDb()).insert(education).values(result.data);
  revalidatePath("/", "layout");
  return { ok: "Education added." };
}

export async function updateEducation(id: number, _state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parseEducation(formData);
  if ("error" in result) return { error: result.error };
  await (await getDb()).update(education).set(result.data).where(eq(education.id, id));
  revalidatePath("/", "layout");
  return { ok: "Saved." };
}

export async function deleteEducation(id: number): Promise<void> {
  await requireAdmin();
  await (await getDb()).delete(education).where(eq(education.id, id));
  revalidatePath("/", "layout");
}
