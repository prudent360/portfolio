import { getPublishedPost, getSettings } from "@/lib/data";
import { ogCard } from "@/lib/og";
import { formatDate, fullName } from "@/lib/utils";

/** Generated link-preview image for posts without a cover image. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const [post, s] = await Promise.all([getPublishedPost((await params).slug), getSettings()]);
  if (!post) return new Response("Not found", { status: 404 });
  return ogCard({
    eyebrow: post.publishedAt ? `Blog · ${formatDate(post.publishedAt)}` : "Blog",
    title: post.title,
    footer: fullName(s.firstName, s.lastName),
  });
}
