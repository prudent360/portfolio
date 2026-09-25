"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { skillGroups } from "@/db/schema";
import { SKILL_ICONS } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { parseList } from "@/lib/utils";
import { firstError, formValues, required, sortValue, type FormState } from "@/lib/validation";

const schema = z.object({
  title: required("Title", 80),
  icon: z.enum(Object.keys(SKILL_ICONS) as [string, ...string[]]).catch("code"),
  sortOrder: sortValue,
});

function parse(formData: FormData) {
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return { error: firstError(parsed.error) } as const;
  const items = parseList(formData.get("items"), /\n/).slice(0, 30);
  return { data: { ...parsed.data, items } } as const;
}

export async function createSkillGroup(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parse(formData);
  if ("error" in result) return { error: result.error };
  await (await getDb()).insert(skillGroups).values(result.data);
  revalidatePath("/", "layout");
  return { ok: "Skill group added." };
}

export async function updateSkillGroup(id: number, _state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parse(formData);
  if ("error" in result) return { error: result.error };
  await (await getDb()).update(skillGroups).set(result.data).where(eq(skillGroups.id, id));
  revalidatePath("/", "layout");
  return { ok: "Saved." };
}

export async function deleteSkillGroup(id: number): Promise<void> {
  await requireAdmin();
  await (await getDb()).delete(skillGroups).where(eq(skillGroups.id, id));
  revalidatePath("/", "layout");
}
