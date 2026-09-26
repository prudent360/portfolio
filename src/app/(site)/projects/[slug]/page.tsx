import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalIcon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { ProjectThumbnail } from "@/components/site/illustrations";
import { getPublishedProject, getSettings } from "@/lib/data";
import { embedProvider } from "@/lib/embed";
import { hasProjectPage } from "@/lib/projects";
import { absoluteUrl, jsonLd } from "@/lib/site";
import { fullName } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

/** Only projects with a case study, embed or gallery get a page. */
async function load(slug: string) {
  const project = await getPublishedProject(slug);
  return project && hasProjectPage(project) ? project : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await load((await params).slug);
  if (!project) return {};
  const image = project.imageUrl ?? project.gallery[0];
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      images: image ? [{ url: image, alt: project.title }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const [project, settings] = await Promise.all([load((await params).slug), getSettings()]);
  if (!project) notFound();

  const provider = embedProvider(project.embedUrl);
  const cover = project.imageUrl ?? project.gallery[0] ?? null;
  const links = [
    ...(project.liveUrl ? [{ label: "Live demo", url: project.liveUrl, primary: true }] : []),
    ...(project.githubUrl ? [{ label: "GitHub", url: project.githubUrl, primary: false }] : []),
    ...project.links.map((link) => ({ ...link, primary: false })),
  ];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    keywords: project.tags.join(", ") || undefined,
    genre: project.category || undefined,
    image: cover ? absoluteUrl(cover) : undefined,
    url: absoluteUrl(`/projects/${project.slug}`),
    sameAs: links.map((link) => link.url),
    creator: { "@type": "Person", name: fullName(settings.firstName, settings.lastName), url: absoluteUrl("/") },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <header className="border-b border-line bg-white">
        <div className={`mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-12 pt-10 sm:px-8 md:pb-16 md:pt-14 ${provider ? "" : "lg:grid-cols-[minmax(0,1fr)_440px]"}`}>
          <div className="flex flex-col gap-5">
            <Link href="/#projects" className="flex w-fit items-center gap-2 text-[15px] font-semibold text-accent hover:text-accent-dark">
              <ArrowLeft className="size-4" /> All projects
            </Link>
            {project.category && <p className="font-mono text-sm uppercase tracking-[2px] text-accent">{project.category}</p>}
            <h1 className="max-w-[900px] font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-[52px]">{project.title}</h1>
            <p className="max-w-[720px] text-xl leading-relaxed text-muted">{project.description}</p>
            {project.outcome && (
              <p className="w-fit rounded-xl bg-panel px-5 py-3 font-display text-lg font-semibold text-ink">
                <span className="mr-2 font-mono text-[11px] font-normal uppercase tracking-[2px] text-muted">Result</span>
                {project.outcome}
              </p>
            )}
            {project.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Tools used">
                {project.tags.map((tag) => <li key={tag} className="rounded-full bg-accent-soft px-3 py-1.5 font-mono text-[12.5px] text-accent">{tag}</li>)}
              </ul>
            )}
            {links.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-3">
                {links.map((link) => (
                  <a
                    key={`${link.label}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex h-12 items-center gap-2 rounded-lg px-6 font-semibold ${link.primary ? "bg-accent text-white hover:bg-accent-dark" : "border-[1.5px] border-accent text-accent hover:bg-accent-soft"}`}
                  >
                    {link.label} <ExternalIcon className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
          {!provider && (
            <div className="relative aspect-[378/240] overflow-hidden rounded-[14px] bg-navy">
              {cover ? (
                <Image src={cover} alt="" fill priority sizes="(min-width: 1024px) 440px, 100vw" className="object-cover" />
              ) : (
                <ProjectThumbnail kind={project.thumbnail} />
              )}
            </div>
          )}
        </div>
      </header>

      {provider && project.embedUrl && (
        <section aria-labelledby="embed-heading" className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 pt-12 sm:px-8 md:pt-16">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="embed-heading" className="flex items-center gap-2 font-display text-2xl font-semibold">
              <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" /> Interactive {provider}
            </h2>
            <a href={project.embedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent hover:text-accent-dark">
              Open full screen <ExternalIcon className="size-4" />
            </a>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] border border-edge bg-white sm:aspect-[16/10] lg:aspect-[16/9]">
            <iframe
              src={project.embedUrl}
              title={`${project.title} (${provider})`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 size-full border-0"
            />
          </div>
          <p className="text-sm text-muted">If the dashboard doesn&apos;t load here, use Open full screen.</p>
        </section>
      )}

      <div className="mx-auto flex max-w-[1200px] flex-col gap-14 px-5 py-12 sm:px-8 md:py-16">
        {project.body.trim() && (
          <div className="mx-auto w-full max-w-[760px]">
            <Markdown>{project.body}</Markdown>
          </div>
        )}

        {project.gallery.length > 0 && (
          <section aria-labelledby="gallery-heading" className="flex flex-col gap-5">
            <h2 id="gallery-heading" className="font-display text-2xl font-semibold">Screenshots</h2>
            <ul className="grid gap-5 sm:grid-cols-2">
              {project.gallery.map((url, index) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-[14px] border border-edge bg-white">
                    <span className="relative block aspect-[16/10]">
                      <Image src={url} alt={`${project.title}, screenshot ${index + 1} (opens full size)`} fill sizes="(min-width: 640px) 580px, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link href="/#projects" className="flex w-fit items-center gap-2 text-[15px] font-semibold text-accent hover:text-accent-dark">
          <ArrowLeft className="size-4" /> Back to projects
        </Link>
      </div>
    </article>
  );
}
