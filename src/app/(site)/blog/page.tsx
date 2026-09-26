import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/site/post-card";
import { getPublishedPosts } from "@/lib/data";
import { RSS_ALTERNATE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: "Technical articles on data pipelines, analytics engineering, BigQuery modelling, and machine learning systems.",
  alternates: { canonical: "/blog", types: RSS_ALTERNATE },
};

type Props = { searchParams: Promise<{ tag?: string }> };

export default async function BlogPage({ searchParams }: Props) {
  const posts = await getPublishedPosts();
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const { tag } = await searchParams;
  const active = tag && tags.includes(tag) ? tag : null;
  const shown = active ? posts.filter((p) => p.tags.includes(active)) : posts;

  const chip = (on: boolean) =>
    `inline-flex h-9 items-center rounded-full border px-4 font-mono text-[13px] ${on ? "border-accent bg-accent text-white" : "border-edge-strong bg-white text-body hover:border-accent hover:text-accent"}`;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-5 py-16 sm:px-8 md:py-24">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[2px] text-accent">Blog</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-[52px]">Engineering &amp; analytics articles</h1>
        <p className="max-w-[640px] text-lg leading-relaxed text-muted">
          Breakdowns of event pipelines, BigQuery modelling, forecasting and the data platforms behind them.
        </p>
        {tags.length > 0 && (
          <nav aria-label="Filter by topic" className="mt-2 flex flex-wrap gap-2">
            <Link href="/blog" className={chip(!active)} aria-current={!active ? "page" : undefined} scroll={false}>
              All ({posts.length})
            </Link>
            {tags.map((t) => (
              <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className={chip(active === t)} aria-current={active === t ? "page" : undefined} scroll={false}>
                {t}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {shown.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <p className="rounded-[14px] border border-dashed border-edge-strong bg-white p-10 text-center text-muted">
          {active ? `No posts tagged “${active}” yet.` : "No posts published yet."}
        </p>
      )}
    </div>
  );
}
