"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { parseList } from "@/lib/utils";
import { deleteIfReplaced } from "@/lib/storage";
import { resolveFileField, uploadErrorMessage } from "@/lib/upload-field";
import { firstError, formValues, optionalEmail, optionalUrl, required, text, type FormState } from "@/lib/validation";

const schema = z.object({
  firstName: required("First name", 80),
  lastName: text(80),
  brand: text(40),
  role: text(120),
  location: text(120),
  eyebrow: text(120),
  headline: required("Headline", 160),
  intro: text(600),
  about: text(5000),
  email: optionalEmail,
  linkedinUrl: optionalUrl,
  githubUrl: optionalUrl,
  contactEyebrow: text(120),
  contactHeading: text(160),
  contactText: text(400),
  footerTagline: text(160),
  seoDescription: text(300),
});

export async function saveProfile(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse(formValues(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  try {
    const current = await getSettings();
    const photoUrl = await resolveFileField(formData, { file: "photo", remove: "removePhoto", current: current.photoUrl, folder: "profile" });
    const resumeUrl = await resolveFileField(formData, { file: "resume", remove: "removeResume", current: current.resumeUrl, folder: "documents", kind: "document" });
    const highlights = parseList(formData.get("highlights"), /\n/)
      .slice(0, 4)
      .map((line) => {
        const [value, ...rest] = line.split("|");
        return { value: value.trim().slice(0, 16), label: rest.join("|").trim().slice(0, 60) };
      })
      .filter((item) => item.value && item.label);
    const values = { ...parsed.data, photoUrl, resumeUrl, highlights };

    const db = await getDb();
    await db.insert(settings).values({ id: 1, ...values }).onConflictDoUpdate({ target: settings.id, set: values });
    await deleteIfReplaced(current.photoUrl, photoUrl);
    await deleteIfReplaced(current.resumeUrl, resumeUrl);
  } catch (error) {
    const message = uploadErrorMessage(error);
    if (message) return { error: message };
    throw error;
  }

  revalidatePath("/", "layout");
  return { ok: "Profile saved." };
}
