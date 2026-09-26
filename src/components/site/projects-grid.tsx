"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ExternalIcon } from "@/components/icons";
import { ProjectThumbnail } from "./illustrations";

export type PublicProject = {
  id: number;
  title: string;
  category: string;
  description: string;
  outcome: string;
  tags: string[];
  thumbnail: string;
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  /** Set when the project has its own page. */
  href: string | null;
  hasCaseStudy: boolean;
  /** Tool name when the project has an interactive embed, e.g. "Power BI". */
  embedProvider: string | null;
};

const detailLabel = (p: PublicProject) => (p.hasCaseStudy ? "Read the case study" : p.embedProvider ? "Explore the dashboard" : "View project");

function Artwork({ project, sizes, className, badge = true }: { project: PublicProject; sizes: string; className: string; badge?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-navy ${className}`}>
      {project.imageUrl ? (
        <Image src={project.imageUrl} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        <ProjectThumbnail kind={project.thumbnail} />
      )}
      {badge && project.embedProvider && (
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1 font-mono text-[11px] font-medium text-ink">
          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" /> Interactive · {project.embedProvider}
        </span>
      )}
    </div>
  );
}

function Tags({ tags, small = false }: { tags: string[]; small?: boolean }) {
  if (!tags.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Tools used">
      {tags.map((tag) => (
        <li key={tag} className={`rounded-full bg-accent-soft font-mono text-accent ${small ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-[12.5px]"}`}>{tag}</li>
      ))}
    </ul>
  );
}

function FeaturedCard({ project, flip }: { project: PublicProject; flip: boolean }) {
  return (
    <article className="grid overflow-hidden rounded-[14px] border border-edge bg-white lg:grid-cols-2">
      <Artwork project={project} sizes="(min-width: 1024px) 600px, 100vw" className={`aspect-[16/10] lg:aspect-auto lg:min-h-[340px] ${flip ? "lg:order-last" : ""}`} />
      <div className="flex flex-col gap-4 p-6 sm:p-8 lg:p-10">
        {project.category && <p className="font-mono text-xs font-medium uppercase tracking-[2px] text-accent">{project.category}</p>}
        <h3 className="font-display text-[26px] font-semibold leading-tight tracking-tight md:text-3xl">
          {project.href ? <Link href={project.href} className="hover:text-accent">{project.title}</Link> : project.title}
        </h3>
        <p className="text-[17px] leading-relaxed text-muted">{project.description}</p>
        {project.outcome && (
          <div className="rounded-xl bg-panel px-5 py-4">
            <p className="font-mono text-[11px] uppercase tracking-[2px] text-muted">Result</p>
            <p className="mt-1 font-display text-lg font-semibold leading-snug text-ink">{project.outcome}</p>
          </div>
        )}
        <Tags tags={project.tags} />
        {(project.href || project.liveUrl || project.githubUrl) && (
          <div className="mt-auto flex flex-wrap gap-3 pt-3">
            {project.href && (
              <Link href={project.href} className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-6 font-semibold text-white hover:bg-accent-dark">
                {detailLabel(project)}<span className="sr-only">: {project.title}</span> <ArrowUpRight className="size-4" />
              </Link>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex h-12 items-center gap-2 rounded-lg px-6 font-semibold ${project.href ? "border-[1.5px] border-accent text-accent hover:bg-accent-soft" : "bg-accent text-white hover:bg-accent-dark"}`}>
                Live demo<span className="sr-only"> of {project.title}</span> <ExternalIcon className="size-4" />
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-lg border-[1.5px] border-accent px-6 font-semibold text-accent hover:bg-accent-soft">
                GitHub<span className="sr-only"> repository for {project.title}</span> <ExternalIcon className="size-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function ProjectRow({ project }: { project: PublicProject }) {
  return (
    <li className="grid gap-4 py-6 first:pt-0 last:pb-0 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6">
      <Artwork project={project} sizes="120px" className="hidden aspect-[3/2] rounded-lg sm:block" badge={false} />
      <div className="flex min-w-0 flex-col gap-2.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h4 className="font-display text-xl font-semibold leading-snug text-ink">
            {project.href ? <Link href={project.href} className="hover:text-accent">{project.title}</Link> : project.title}
          </h4>
          {project.category && <span className="font-mono text-xs uppercase tracking-[1.5px] text-muted">{project.category}</span>}
          {project.embedProvider && (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[1.5px] text-emerald-800">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" /> Interactive
            </span>
          )}
        </div>
        <p className="text-[15px] leading-relaxed text-muted">{project.description}</p>
        {project.outcome && <p className="text-[15px] font-semibold text-ink">{project.outcome}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tags tags={project.tags} small />
          {(project.href || project.liveUrl || project.githubUrl) && (
            <div className="flex flex-wrap gap-4 text-[15px] font-semibold text-accent">
              {project.href && <Link href={project.href} className="inline-flex items-center gap-1 hover:text-accent-dark">{project.hasCaseStudy ? "Case study" : project.embedProvider ? "Dashboard" : "Details"}<span className="sr-only">: {project.title}</span> <ArrowUpRight className="size-4" /></Link>}
              {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-accent-dark">Demo<span className="sr-only"> of {project.title}</span> <ExternalIcon className="size-3.5" /></a>}
              {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-accent-dark">GitHub<span className="sr-only"> for {project.title}</span> <ExternalIcon className="size-3.5" /></a>}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

/** Featured projects as large cards, followed by a filterable list of the rest. */
export function ProjectsGrid({ featured, others }: { featured: PublicProject[]; others: PublicProject[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(others.map((p) => p.category).filter(Boolean)))], [others]);
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? others : others.filter((p) => p.category === filter);

  return (
    <div className="flex flex-col gap-14">
      {featured.length > 0 && (
        <div className="flex flex-col gap-8">
          {featured.map((project, i) => <FeaturedCard key={project.id} project={project} flip={i % 2 === 1} />)}
        </div>
      )}

      {others.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-edge-strong pb-4">
            <h3 className="font-display text-2xl font-semibold tracking-tight">{featured.length ? "More projects" : "Projects"}</h3>
            {categories.length > 2 && (
              <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const on = category === filter;
                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setFilter(category)}
                      className={`h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors ${on ? "border-accent bg-accent text-white" : "border-edge-strong bg-white text-body hover:border-accent hover:text-accent"}`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <ul className="flex flex-col divide-y divide-line" aria-live="polite">
            {shown.map((project) => <ProjectRow key={project.id} project={project} />)}
          </ul>
        </div>
      )}
    </div>
  );
}
