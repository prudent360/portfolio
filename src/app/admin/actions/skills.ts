"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { skillGroups, type SkillItem } from "@/db/schema";
import { SKILL_ICONS } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { resolveIconRef } from "@/lib/tech-icons";
import { firstError, formValues, required, sortValue, type FormState } from "@/lib/validation";

const schema = z.object({
  title: required("Title", 80),
  icon: z.enum(Object.keys(SKILL_ICONS) as [string, ...string[]]).catch("code"),
  sortOrder: sortValue,
});

function parse(formData: FormData) {
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return { error: firstError(parsed.error) } as const;
  const names = formData.getAll("itemName").map((v) => String(v).trim().slice(0, 60));
  const icons = formData.getAll("itemIcon").map((v) => String(v).trim());
  const items: SkillItem[] = [];
  names.forEach((name, i) => {
    if (!name) return;
    const icon = icons[i] ?? "";
    // Keep only references the site can render: "none", a known icon, or an uploaded image.
    const valid = icon === "none" || (icon !== "" && resolveIconRef(icon) !== null);
    items.push(valid ? { name, icon } : { name });
  });
  return { data: { ...parsed.data, items: items.slice(0, 30) } } as const;
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
