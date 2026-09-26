import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ArrowLeft, MailIcon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { getPublishedPost, getSettings } from "@/lib/data";
import { absoluteUrl, jsonLd, RSS_ALTERNATE } from "@/lib/site";
import { extractToc } from "@/lib/toc";
import { formatDate, fullName, readingTime } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  if (!post) return {};
  // Use the cover image when there is one, otherwise a generated card.
  const image = post.coverUrl ?? `/blog/${post.slug}/social-card`;
  return {
    title: post.title,
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
  const [post, settings] = await Promise.all([getPublishedPost(slug), getSettings()]);
  if (!post) notFound();

  const author = fullName(settings.firstName, settings.lastName);
  const toc = extractToc(post.content);
  const showToc = toc.length >= 2;
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
    author: { "@type": "Person", name: author, url: absoluteUrl("/") },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 pb-12 pt-10 sm:px-8 md:pb-16 md:pt-14">
          <Link href="/blog" className="flex w-fit items-center gap-2 text-[15px] font-semibold text-accent hover:text-accent-dark">
            <ArrowLeft className="size-4" /> All posts
          </Link>
          {post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link href={`/blog?tag=${encodeURIComponent(tag)}`} className="rounded-full bg-accent-soft px-3 py-1 font-mono text-xs text-accent hover:bg-[#D9E0F8]">
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <h1 className="max-w-[900px] font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-[52px]">{post.title}</h1>
          {post.excerpt && <p className="max-w-[760px] text-xl leading-relaxed text-muted">{post.excerpt}</p>}
          <p className="font-mono text-sm text-muted">
            {author && <>{author}<span aria-hidden="true"> · </span></>}
            <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden="true"> · </span>
            {readingTime(post.content)}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 md:py-16">
        <div className={showToc ? "grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16" : "mx-auto max-w-[760px]"}>
          {showToc && <TableOfContents items={toc} />}
          <div className={`flex min-w-0 flex-col gap-10 ${showToc ? "lg:order-first" : ""}`}>
            {post.coverUrl && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-[14px] border border-edge bg-accent-soft">
                <Image src={post.coverUrl} alt="" fill priority sizes="(min-width: 1200px) 820px, 100vw" className="object-cover" />
              </div>
            )}
            <Markdown>{post.content}</Markdown>

            <aside className="flex flex-col gap-5 rounded-[14px] border border-edge bg-panel p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex flex-col gap-1.5">
                <h2 className="font-display text-xl font-semibold">Want to talk about this?</h2>
                <p className="text-[15px] leading-relaxed text-muted">{settings.contactText || "Questions, ideas or a project in mind are all welcome."}</p>
              </div>
              {settings.email ? (
                <a href={`mailto:${settings.email}?subject=${encodeURIComponent(`About: ${post.title}`)}`} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-6 font-semibold text-white hover:bg-accent-dark">
                  <MailIcon className="size-[18px]" /> Email me
                </a>
              ) : (
                <Link href="/#contact" className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-accent px-6 font-semibold text-white hover:bg-accent-dark">
                  Get in touch
                </Link>
              )}
            </aside>

            <Link href="/blog" className="flex w-fit items-center gap-2 text-[15px] font-semibold text-accent hover:text-accent-dark">
              <ArrowLeft className="size-4" /> More posts
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
