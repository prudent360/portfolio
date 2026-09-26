"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { THUMBNAILS } from "@/components/site/illustrations";
import { requireAdmin } from "@/lib/auth";
import { deleteIfReplaced, deleteUpload } from "@/lib/storage";
import { resolveFileField, uploadErrorMessage } from "@/lib/upload-field";
import { parseList, slugify } from "@/lib/utils";
import { firstError, formValues, nullIfEmpty, optionalUrl, required, sortValue, text, type FormState } from "@/lib/validation";

const schema = z.object({
  title: required("Title", 140),
  slug: text(80),
  category: text(60),
  description: required("Description", 600),
  body: text(100_000),
  thumbnail: z.enum(THUMBNAILS).catch("flow"),
  liveUrl: optionalUrl,
  githubUrl: optionalUrl,
  sortOrder: sortValue,
});

async function save(id: number | null, formData: FormData): Promise<FormState | number> {
  await requireAdmin();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const slug = slugify(parsed.data.slug || parsed.data.title);
  if (!slug) return { error: "Add a title with letters or numbers." };

  const db = await getDb();
  const clash = await db
    .select({ id: projects.id })
    .from(projects)
    .where(id ? and(eq(projects.slug, slug), ne(projects.id, id)) : eq(projects.slug, slug));
  if (clash.length) return { error: `Another project already uses the slug "${slug}".` };

  const [existing] = id ? await db.select().from(projects).where(eq(projects.id, id)) : [];
  if (id && !existing) return { error: "This project no longer exists." };

  let imageUrl: string | null;
  try {
    imageUrl = await resolveFileField(formData, { file: "image", remove: "removeImage", current: existing?.imageUrl ?? null, folder: "projects" });
  } catch (error) {
    const message = uploadErrorMessage(error);
    if (message) return { error: message };
    throw error;
  }

  const values = {
    ...parsed.data,
    slug,
    liveUrl: nullIfEmpty(parsed.data.liveUrl),
    githubUrl: nullIfEmpty(parsed.data.githubUrl),
    tags: parseList(formData.get("tags")).slice(0, 12),
    published: formData.get("published") === "on",
    imageUrl,
  };

  if (id) {
    await db.update(projects).set(values).where(eq(projects.id, id));
    await deleteIfReplaced(existing?.imageUrl, imageUrl);
    revalidatePath("/", "layout");
    return id;
  }
  const [row] = await db.insert(projects).values(values).returning({ id: projects.id });
  revalidatePath("/", "layout");
  return row.id;
}

export async function createProject(_state: FormState, formData: FormData): Promise<FormState> {
  const result = await save(null, formData);
  if (typeof result !== "number") return result;
  redirect(`/admin/projects/${result}?created=1`);
}

export async function updateProject(id: number, _state: FormState, formData: FormData): Promise<FormState> {
  const result = await save(id, formData);
  return typeof result === "number" ? { ok: "Project saved." } : result;
}

export async function deleteProject(id: number): Promise<void> {
  await requireAdmin();
  const [removed] = await (await getDb()).delete(projects).where(eq(projects.id, id)).returning({ imageUrl: projects.imageUrl });
  await deleteUpload(removed?.imageUrl);
  revalidatePath("/", "layout");
  redirect("/admin/projects");
}
