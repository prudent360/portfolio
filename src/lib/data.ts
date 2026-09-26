import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/db";
import { certifications, education, experiences, posts, projects, settings, skillGroups, type Settings } from "@/db/schema";

const EMPTY_SETTINGS: Settings = {
  id: 1, firstName: "", lastName: "", brand: "", role: "", location: "", eyebrow: "", headline: "",
  intro: "", about: "", photoUrl: null, resumeUrl: null, email: "", linkedinUrl: "", githubUrl: "",
  contactEyebrow: "", contactHeading: "", contactText: "", footerTagline: "", seoDescription: "", highlights: [],
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

export const getPublishedProject = cache(async (slug: string) => {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.published, true)));
  return row ?? null;
});

/**
 * Newest first, as on a CV: current roles (start date, no end date), then by end date and start
 * date descending. Roles without dates go last. The manual order breaks ties.
 */
export function sortExperiences<T extends { startDate: string | null; endDate: string | null; sortOrder: number; id: number }>(rows: T[]): T[] {
  const rank = (row: T) => (row.startDate && !row.endDate ? 0 : row.startDate || row.endDate ? 1 : 2);
  return [...rows].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (b.endDate ?? "").localeCompare(a.endDate ?? "") ||
      (b.startDate ?? "").localeCompare(a.startDate ?? "") ||
      a.sortOrder - b.sortOrder ||
      a.id - b.id,
  );
}

export async function getExperiences() {
  const db = await getDb();
  return sortExperiences(await db.select().from(experiences));
}

export async function getEducation() {
  const db = await getDb();
  const rows = await db.select().from(education);
  // Newest first; entries without years go last, the manual order breaks ties.
  const year = (row: (typeof rows)[number]) => row.endYear || row.startYear || "";
  return rows.sort((a, b) => (year(a) ? 0 : 1) - (year(b) ? 0 : 1) || year(b).localeCompare(year(a)) || a.sortOrder - b.sortOrder || a.id - b.id);
}

/** Newest first by issue date; undated last, the manual order breaks ties. */
export async function getCertifications() {
  const db = await getDb();
  const rows = await db.select().from(certifications);
  return rows.sort((a, b) => (a.issueDate ? 0 : 1) - (b.issueDate ? 0 : 1) || (b.issueDate ?? "").localeCompare(a.issueDate ?? "") || a.sortOrder - b.sortOrder || a.id - b.id);
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
