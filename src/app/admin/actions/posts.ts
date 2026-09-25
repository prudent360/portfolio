"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { deleteIfReplaced, deleteUpload } from "@/lib/storage";
import { resolveFileField, uploadErrorMessage } from "@/lib/upload-field";
import { parseList, slugify } from "@/lib/utils";
import { firstError, formValues, required, text, type FormState } from "@/lib/validation";

const schema = z.object({
  title: required("Title", 160),
  slug: text(80),
  excerpt: text(400),
  content: text(100_000),
});

async function save(id: number | null, formData: FormData): Promise<FormState | number> {
  await requireAdmin();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const slug = slugify(parsed.data.slug || parsed.data.title);
  if (!slug) return { error: "Add a title with letters or numbers." };

  const db = await getDb();
  const clash = await db
    .select({ id: posts.id })
    .from(posts)
    .where(id ? and(eq(posts.slug, slug), ne(posts.id, id)) : eq(posts.slug, slug));
  if (clash.length) return { error: `Another post already uses the slug "${slug}".` };

  const [existing] = id ? await db.select().from(posts).where(eq(posts.id, id)) : [];
  if (id && !existing) return { error: "This post no longer exists." };

  let coverUrl: string | null;
  try {
    coverUrl = await resolveFileField(formData, { file: "cover", remove: "removeCover", current: existing?.coverUrl ?? null, folder: "posts" });
  } catch (error) {
    const message = uploadErrorMessage(error);
    if (message) return { error: message };
    throw error;
  }

  const published = formData.get("published") === "on";
  const values = {
    ...parsed.data,
    slug,
    coverUrl,
    tags: parseList(formData.get("tags")).slice(0, 10),
    published,
    // Keep the original publish date when re-saving; set it the first time a post goes live.
    publishedAt: published ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
  };

  if (id) {
    await db.update(posts).set(values).where(eq(posts.id, id));
    await deleteIfReplaced(existing?.coverUrl, coverUrl);
    revalidatePath("/", "layout");
    return id;
  }
  const [row] = await db.insert(posts).values(values).returning({ id: posts.id });
  revalidatePath("/", "layout");
  return row.id;
}

export async function createPost(_state: FormState, formData: FormData): Promise<FormState> {
  const result = await save(null, formData);
  if (typeof result !== "number") return result;
  redirect(`/admin/posts/${result}?created=1`);
}

export async function updatePost(id: number, _state: FormState, formData: FormData): Promise<FormState> {
  const result = await save(id, formData);
  if (typeof result !== "number") return result;
  return { ok: formData.get("published") === "on" ? "Post saved and published." : "Draft saved." };
}

export async function deletePost(id: number): Promise<void> {
  await requireAdmin();
  const [removed] = await (await getDb()).delete(posts).where(eq(posts.id, id)).returning({ coverUrl: posts.coverUrl });
  await deleteUpload(removed?.coverUrl);
  revalidatePath("/", "layout");
  redirect("/admin/posts");
}
