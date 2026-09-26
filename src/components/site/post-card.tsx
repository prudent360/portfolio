import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/db/schema";
import { formatDate, readingTime } from "@/lib/utils";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[14px] border border-edge bg-white transition-colors hover:border-accent">
      {post.coverUrl && (
        <div className="relative aspect-[16/9] bg-accent-soft">
          <Image src={post.coverUrl} alt="" fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
        </div>
      )}
      <div className="flex grow flex-col gap-3 p-6">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true"> · </span>
          {readingTime(post.content)}
        </p>
        <h3 className="font-display text-[22px] font-semibold leading-snug text-ink group-hover:text-accent">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">{post.title}</Link>
        </h3>
        {post.excerpt && <p className="line-clamp-3 text-base leading-relaxed text-muted">{post.excerpt}</p>}
        {post.tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-2 pt-2" aria-label="Tags">
            {post.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-accent-soft px-3 py-1 font-mono text-xs text-accent">{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
