import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Mail, MessageSquare, Tag, Bookmark } from "lucide-react";
import { BlogNotice } from "@/components/blog/blog-notice";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { Markdown } from "@/components/markdown";
import { getPublishedPost, getSettings } from "@/lib/data";
import { extractToc } from "@/lib/toc";
import { absoluteUrl, jsonLd, RSS_ALTERNATE } from "@/lib/site";
import { formatDate, fullName, readingTime } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  if (!post) return {};
  // Use the cover image when there is one, otherwise a generated card.
  const image = post.coverUrl ?? `/blog/${post.slug}/social-card`;
  return {
    title: { absolute: `${post.title} | Ifiokobong Akpan` },
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}`, types: RSS_ALTERNATE },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      tags: post.tags,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images: [image] },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post, siteSettings] = await Promise.all([
    getPublishedPost(slug),
    getSettings(),
  ]);

  if (!post) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    keywords: post.tags.length ? post.tags.join(", ") : undefined,
    image: absoluteUrl(post.coverUrl ?? `/blog/${post.slug}/social-card`),
    url: absoluteUrl(`/blog/${post.slug}`),
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    author: { "@type": "Person", name: fullName(siteSettings.firstName, siteSettings.lastName), url: absoluteUrl("/") },
  };

  const tocItems = extractToc(post.content);
  const readTime = readingTime(post.content);

  // Extract first word(s) and last word to add stylized italic flair like Fulfilera's titles
  const titleWords = post.title.split(" ");
  const mainTitle = titleWords.length > 1 ? titleWords.slice(0, -1).join(" ") : post.title;
  const highlightWord = titleWords.length > 1 ? titleWords[titleWords.length - 1] : "";

  return (
    <div className="min-h-screen bg-white pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      {/* Top Fulfilera-style Notice Banner */}
      <BlogNotice
        text="Data Engineering & Analytics Research — Written by Ifiokobong Akpan"
        linkHref="/#about"
        linkLabel="About author"
      />

      {/* Hero Section */}
      <section className="border-b border-slate-100 bg-slate-50/50 py-12 sm:py-16 md:py-20">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 sm:px-8">
          <Link
            href="/blog"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 hover:text-accent transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to all articles
          </Link>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-xs">
                <Bookmark className="size-3 text-accent" />
                Technical Publication
              </span>
              {post.tags[0] && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 font-mono text-xs font-medium text-accent">
                  <Tag className="size-3" />
                  {post.tags[0]}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-[54px] leading-[1.12]">
              {mainTitle}{" "}
              {highlightWord && <em className="italic font-serif font-normal text-accent">{highlightWord}</em>}
            </h1>

            {post.excerpt && (
              <p className="max-w-3xl text-lg text-slate-600 sm:text-xl leading-relaxed">
                {post.excerpt}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-5 text-xs text-slate-500 font-medium border-t border-slate-200/60 pt-4">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 text-slate-400" />
                Published: <strong className="text-slate-700">{formatDate(post.publishedAt)}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-slate-400" />
                ~{readTime}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">
                Author: <strong className="text-slate-800">{siteSettings.firstName || "Ifiokobong"} {siteSettings.lastName || "Akpan"}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar Grid */}
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-12 lg:gap-16 items-start">
          {/* Main Article Content */}
          <main className="min-w-0 flex flex-col gap-8">
            {post.coverUrl && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                <Image
                  src={post.coverUrl}
                  alt={post.title}
                  fill
                  priority
                  sizes="(min-width: 1200px) 800px, 100vw"
                  className="object-cover"
                />
              </div>
            )}

            {/* Abstract Info Callout Box (Fulfilera style infoBox) */}
            {post.excerpt && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 text-sm sm:text-base text-slate-700 leading-relaxed">
                <p>
                  <strong>Executive Summary:</strong> {post.excerpt} This case note outlines real-world architecture patterns, trade-offs, and implementation details for scalable data systems.
                </p>
              </div>
            )}

            {/* Markdown Body */}
            <Markdown>{post.content}</Markdown>

            {/* Bottom Support / Discussion Callout Box */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-xs">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-accent shadow-xs">
                <MessageSquare className="size-6" />
              </div>
              <div className="flex grow flex-col gap-1.5">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Questions or ideas about this architecture?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  I enjoy discussing modern data pipelines, analytics engineering, and business intelligence strategy.
                </p>
              </div>
              <a
                href={`mailto:${siteSettings.email || "contact@ifiokobong.com"}?subject=${encodeURIComponent(`Regarding: ${post.title}`)}`}
                className="shrink-0 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-dark transition-colors"
              >
                <Mail className="size-4" /> Start Discussion →
              </a>
            </div>

            {/* Author Attribution Card */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-6 text-sm text-slate-500">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 font-semibold text-accent hover:text-accent-dark"
              >
                <ArrowLeft className="size-4" /> Explore more articles
              </Link>
              <Link
                href="/#contact"
                className="font-semibold text-slate-700 hover:text-accent"
              >
                Contact Ifiokobong →
              </Link>
            </div>
          </main>

          {/* Right Sticky Sidebar */}
          <TableOfContents items={tocItems} />
        </div>
      </div>
    </div>
  );
}
