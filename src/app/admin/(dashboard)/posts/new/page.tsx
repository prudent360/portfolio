import type { Metadata } from "next";
import { createPost } from "@/app/admin/actions/posts";
import { PostForm } from "@/components/admin/post-form";
import { PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <>
      <PageHeader title="New post" />
      <PostForm action={createPost} />
    </>
  );
}
