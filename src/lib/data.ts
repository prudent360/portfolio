import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/db";
import { education, experiences, posts, projects, settings, skillGroups, type Settings } from "@/db/schema";

const EMPTY_SETTINGS: Settings = {
  id: 1, firstName: "", lastName: "", brand: "", role: "", location: "", eyebrow: "", headline: "",
  intro: "", about: "", photoUrl: null, resumeUrl: null, email: "", linkedinUrl: "", githubUrl: "",
  contactEyebrow: "", contactHeading: "", contactText: "", footerTagline: "", seoDescription: "",
  createdAt: new Date(0), updatedAt: new Date(0),
};

export const getSettings = cache(async (): Promise<Settings> => {
  const db = await getDb();
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  return row ?? EMPTY_SETTINGS;
});

export async function getSkillGroups() {
  const db = await getDb();
  return db.select().from(skillGroups).orderBy(asc(skillGroups.sortOrder), asc(skillGroups.id));
}

export async function getProjects({ publishedOnly }: { publishedOnly: boolean }) {
  const db = await getDb();
  return db
    .select()
    .from(projects)
    .where(publishedOnly ? eq(projects.published, true) : undefined)
    .orderBy(asc(projects.sortOrder), asc(projects.id));
}

export async function getExperiences() {
  const db = await getDb();
  return db.select().from(experiences).orderBy(asc(experiences.sortOrder), desc(experiences.startDate));
}

export async function getEducation() {
  const db = await getDb();
  return db.select().from(education).orderBy(asc(education.sortOrder), asc(education.id));
}

export async function getPublishedPosts(limit?: number) {
  const db = await getDb();
  const query = db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt), desc(posts.id));
  return limit ? query.limit(limit) : query;
}

export const getPublishedPost = cache(async (slug: string) => {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.published, true)));
  return row ?? null;
});

export async function getAllPosts() {
  const db = await getDb();
  return db.select().from(posts).orderBy(desc(posts.updatedAt));
}
