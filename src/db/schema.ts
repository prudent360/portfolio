import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  ...timestamps,
});

/** Failed admin sign-ins, used to rate-limit login attempts. */
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("login_attempts_key_created_idx").on(table.key, table.createdAt)],
);

/** Single-row table (id = 1) holding site-wide profile and copy. */
export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  firstName: text("first_name").notNull().default(""),
  lastName: text("last_name").notNull().default(""),
  brand: text("brand").notNull().default(""),
  role: text("role").notNull().default(""),
  location: text("location").notNull().default(""),
  eyebrow: text("eyebrow").notNull().default(""),
  headline: text("headline").notNull().default(""),
  intro: text("intro").notNull().default(""),
  about: text("about").notNull().default(""),
  photoUrl: text("photo_url"),
  resumeUrl: text("resume_url"),
  email: text("email").notNull().default(""),
  linkedinUrl: text("linkedin_url").notNull().default(""),
  githubUrl: text("github_url").notNull().default(""),
  contactEyebrow: text("contact_eyebrow").notNull().default(""),
  contactHeading: text("contact_heading").notNull().default(""),
  contactText: text("contact_text").notNull().default(""),
  footerTagline: text("footer_tagline").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  /** Proof points shown under the hero, for example { value: "40+", label: "pipelines shipped" }. */
  highlights: jsonb("highlights").$type<{ value: string; label: string }[]>().notNull().default([]),
  ...timestamps,
});

export const skillGroups = pgTable("skill_groups", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  icon: text("icon").notNull().default("code"),
  items: jsonb("items").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull().default(""),
  description: text("description").notNull().default(""),
  /** Optional Markdown case study. When present the project gets its own page. */
  body: text("body").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  thumbnail: text("thumbnail").notNull().default("flow"),
  imageUrl: text("image_url"),
  liveUrl: text("live_url"),
  githubUrl: text("github_url"),
  published: boolean("published").notNull().default(true),
  /** Shown as a large showcase card at the top of the projects section. */
  featured: boolean("featured").notNull().default(false),
  /** Optional one-line result, for example "Cut weekly reporting from 6 hours to 20 minutes". */
  outcome: text("outcome").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  /** "YYYY-MM" strings; a null end date means "Present". */
  startDate: text("start_date"),
  endDate: text("end_date"),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  degree: text("degree").notNull(),
  institution: text("institution").notNull().default(""),
  startYear: text("start_year"),
  endYear: text("end_year"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  coverUrl: text("cover_url"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export type Settings = typeof settings.$inferSelect;
export type SkillGroup = typeof skillGroups.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Experience = typeof experiences.$inferSelect;
export type Education = typeof education.$inferSelect;
export type Post = typeof posts.$inferSelect;
