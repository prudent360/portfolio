import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getProjects({ publishedOnly: false });
  return (
    <>
      <PageHeader title="Projects" description="Shown in the Featured Projects section, lowest order first." action={{ href: "/admin/projects/new", label: "New project" }} />
      {projects.length ? (
        <div className="overflow-x-auto rounded-[14px] border border-edge bg-white">
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <thead className="border-b border-line text-sm text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Order</th>
                <th scope="col" className="px-5 py-3 font-semibold">Title</th>
                <th scope="col" className="px-5 py-3 font-semibold">Category</th>
                <th scope="col" className="px-5 py-3 font-semibold">Links</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-panel">
                  <td className="px-5 py-3.5 font-mono text-sm text-muted">{p.sortOrder}</td>
                  <td className="px-5 py-3.5"><Link href={`/admin/projects/${p.id}`} className="font-semibold hover:text-accent">{p.title}</Link></td>
                  <td className="px-5 py-3.5 text-body">{p.category}</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{[p.liveUrl && "Demo", p.githubUrl && "GitHub"].filter(Boolean).join(", ") || "None"}</td>
                  <td className="px-5 py-3.5"><Badge tone={p.published ? "green" : "grey"}>{p.published ? "Visible" : "Hidden"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>No projects yet.</EmptyState>
      )}
    </>
  );
}
