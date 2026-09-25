import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProject, updateProject } from "@/app/admin/actions/projects";
import { DeleteButton } from "@/components/admin/forms";
import { ProjectForm } from "@/components/admin/project-form";
import { PageHeader } from "@/components/admin/ui";
import { ArrowLeft } from "@/components/icons";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = { title: "Edit project" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function EditProjectPage({ params, searchParams }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [project] = await (await getDb()).select().from(projects).where(eq(projects.id, id));
  if (!project) notFound();
  const categories = Array.from(new Set((await getProjects({ publishedOnly: false })).map((p) => p.category).filter(Boolean)));
  const { created } = await searchParams;

  return (
    <>
      <Link href="/admin/projects" className="flex w-fit items-center gap-2 text-sm font-semibold text-accent"><ArrowLeft className="size-4" /> All projects</Link>
      <PageHeader title={project.title} />
      {created && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Project created.</p>}
      <ProjectForm action={updateProject.bind(null, id)} project={project} categories={categories} />
      <div className="flex justify-end"><DeleteButton action={deleteProject.bind(null, id)} label="Delete project" /></div>
    </>
  );
}
