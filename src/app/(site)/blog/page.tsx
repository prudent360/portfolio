import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, BookOpen, Tag } from "lucide-react";
import { BlogNotice } from "@/components/blog/blog-notice";
import { getPublishedPosts } from "@/lib/data";
import { RSS_ALTERNATE } from "@/lib/site";
import { formatDate, readingTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Blog & Publications | Ifiokobong Akpan" },
  description: "Technical articles on data pipelines, analytics engineering, BigQuery modelling, and machine learning systems.",
  alternates: { canonical: "/blog", types: RSS_ALTERNATE },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  // Extract all unique tags
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags || []).filter(Boolean)));

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Top Notice Banner */}
      <BlogNotice
        text="Data Engineering & Analytics Research — Written by Ifiokobong Akpan"
        linkHref="/#about"
        linkLabel="About author"
      />

      {/* Hero Section */}
      <section className="border-b border-slate-100 bg-slate-50/50 py-16 sm:py-20 md:py-24">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 sm:px-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-xs">
              <BookOpen className="size-3 text-accent" />
              Technical Publications & Notes
            </span>
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl leading-[1.1]">
            Engineering &amp; Analytics{" "}
            <em className="italic font-serif font-normal text-accent">Articles</em>
          </h1>

          <p className="max-w-2xl text-lg text-slate-600 sm:text-xl leading-relaxed">
            In-depth breakdowns on designing scalable event pipelines, BigQuery modelling, statistical forecasting, and robust data platforms.
          </p>

          {allTags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">Topics:</span>
              <span className="rounded-full bg-accent text-white px-3 py-1 font-mono text-xs font-medium">All ({posts.length})</span>
              {allTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs font-medium text-slate-600 shadow-2xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Posts Section */}
      <section className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16">
        {posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const readTime = readingTime(post.content);
              return (
                <article
                  key={post.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-7 transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-slate-400" />
                        {formatDate(post.publishedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Clock className="size-3.5" />
                        ~{readTime}
                      </span>
                    </div>

                    <h2 className="font-display text-2xl font-bold leading-snug text-slate-900 group-hover:text-accent transition-colors">
                      <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                        {post.title}
                      </Link>
                    </h2>

                    {post.excerpt && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-4">
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5" aria-label="Tags">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600"
                          >
                            <Tag className="size-2.5 text-slate-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent group-hover:text-accent-dark">
                      Read article <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-16 text-center">
            <BookOpen className="size-10 text-slate-400 mb-3" />
            <h3 className="font-display text-lg font-semibold text-slate-800">No articles published yet</h3>
            <p className="max-w-md text-sm text-slate-500 mt-1">
              Check back soon for in-depth data engineering and analytics breakdowns, or publish an article from the admin panel.
            </p>
            <Link
              href="/admin/posts/new"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-dark"
            >
              Write First Post
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
