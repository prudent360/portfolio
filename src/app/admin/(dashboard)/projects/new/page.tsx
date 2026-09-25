import type { Metadata } from "next";
import { createProject } from "@/app/admin/actions/projects";
import { ProjectForm } from "@/components/admin/project-form";
import { PageHeader } from "@/components/admin/ui";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const projects = await getProjects({ publishedOnly: false });
  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
  return (
    <>
      <PageHeader title="New project" />
      <ProjectForm action={createProject} categories={categories} />
    </>
  );
}
