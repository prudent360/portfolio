import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePost, updatePost } from "@/app/admin/actions/posts";
import { DeleteButton } from "@/components/admin/forms";
import { PostForm } from "@/components/admin/post-form";
import { PageHeader } from "@/components/admin/ui";
import { ArrowLeft, ExternalIcon } from "@/components/icons";
import { getDb } from "@/db";
import { posts } from "@/db/schema";

export const metadata: Metadata = { title: "Edit post" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function EditPostPage({ params, searchParams }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [post] = await (await getDb()).select().from(posts).where(eq(posts.id, id));
  if (!post) notFound();
  const { created } = await searchParams;

  return (
    <>
      <Link href="/admin/posts" className="flex w-fit items-center gap-2 text-sm font-semibold text-accent"><ArrowLeft className="size-4" /> All posts</Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader title={post.title} />
        {post.published && (
          <Link href={`/blog/${post.slug}`} target="_blank" className="flex items-center gap-2 text-sm font-semibold text-accent">
            View on site <ExternalIcon className="size-4" />
          </Link>
        )}
      </div>
      {created && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Post created.</p>}
      <PostForm action={updatePost.bind(null, id)} post={post} />
      <div className="flex justify-end"><DeleteButton action={deletePost.bind(null, id)} label="Delete post" /></div>
    </>
  );
}
