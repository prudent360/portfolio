import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalIcon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { ProjectThumbnail } from "@/components/site/illustrations";
import { getPublishedProject, getSettings } from "@/lib/data";
import { absoluteUrl, jsonLd } from "@/lib/site";
import { fullName } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

/** Only projects with a written case study get a page. */
async function load(slug: string) {
  const project = await getPublishedProject(slug);
  return project && project.body.trim() ? project : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await load((await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      images: project.imageUrl ? [{ url: project.imageUrl, alt: project.title }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const [project, settings] = await Promise.all([load((await params).slug), getSettings()]);
  if (!project) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    keywords: project.tags.join(", ") || undefined,
    genre: project.category || undefined,
    image: project.imageUrl ? absoluteUrl(project.imageUrl) : undefined,
    url: absoluteUrl(`/projects/${project.slug}`),
    creator: { "@type": "Person", name: fullName(settings.firstName, settings.lastName), url: absoluteUrl("/") },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <header className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-12 pt-10 sm:px-8 md:pb-16 md:pt-14 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div className="flex flex-col gap-5">
            <Link href="/#projects" className="flex w-fit items-center gap-2 text-[15px] font-semibold text-accent hover:text-accent-dark">
              <ArrowLeft className="size-4" /> All projects
            </Link>
            {project.category && <p className="font-mono text-sm uppercase tracking-[2px] text-accent">{project.category}</p>}
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-[52px]">{project.title}</h1>
            <p className="max-w-[680px] text-xl leading-relaxed text-muted">{project.description}</p>
            {project.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Tools used">
                {project.tags.map((tag) => <li key={tag} className="rounded-full bg-accent-soft px-3 py-1.5 font-mono text-[12.5px] text-accent">{tag}</li>)}
              </ul>
            )}
            {(project.liveUrl || project.githubUrl) && (
              <div className="mt-2 flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-6 font-semibold text-white hover:bg-accent-dark">
                    Live demo <ExternalIcon className="size-4" />
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-lg border-[1.5px] border-accent px-6 font-semibold text-accent hover:bg-accent-soft">
                    GitHub <ExternalIcon className="size-4" />
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="relative aspect-[378/240] overflow-hidden rounded-[14px] bg-navy">
            {project.imageUrl ? (
              <Image src={project.imageUrl} alt="" fill priority sizes="(min-width: 1024px) 440px, 100vw" className="object-cover" />
            ) : (
              <ProjectThumbnail kind={project.thumbnail} />
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[760px] flex-col gap-10 px-5 py-12 sm:px-8 md:py-16">
        <Markdown>{project.body}</Markdown>
        <Link href="/#projects" className="flex w-fit items-center gap-2 text-[15px] font-semibold text-accent hover:text-accent-dark">
          <ArrowLeft className="size-4" /> Back to projects
        </Link>
      </div>
    </article>
  );
}
