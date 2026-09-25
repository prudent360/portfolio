import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { getAllPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Blog posts" };

export default async function PostsPage() {
  const posts = await getAllPosts();
  return (
    <>
      <PageHeader title="Blog posts" description="Published posts appear on /blog and in the Latest Writing section." action={{ href: "/admin/posts/new", label: "New post" }} />
      {posts.length ? (
        <div className="overflow-x-auto rounded-[14px] border border-edge bg-white">
          <table className="w-full min-w-[600px] text-left text-[15px]">
            <thead className="border-b border-line text-sm text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Title</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                <th scope="col" className="px-5 py-3 font-semibold">Published</th>
                <th scope="col" className="px-5 py-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-panel">
                  <td className="px-5 py-3.5"><Link href={`/admin/posts/${post.id}`} className="font-semibold hover:text-accent">{post.title}</Link></td>
                  <td className="px-5 py-3.5"><Badge tone={post.published ? "green" : "grey"}>{post.published ? "Published" : "Draft"}</Badge></td>
                  <td className="px-5 py-3.5 text-sm text-muted">{formatDate(post.publishedAt) || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{formatDate(post.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>No posts yet.</EmptyState>
      )}
    </>
  );
}
