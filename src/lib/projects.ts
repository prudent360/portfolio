import type { Project } from "@/db/schema";

/** A project gets its own page when there is something to show beyond the card. */
export function hasProjectPage(project: Pick<Project, "body" | "embedUrl" | "gallery">): boolean {
  return Boolean(project.body.trim() || project.embedUrl || project.gallery.length);
}
