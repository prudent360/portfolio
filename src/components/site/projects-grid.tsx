"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { ProjectThumbnail } from "./illustrations";

export type PublicProject = {
  id: number;
  title: string;
  category: string;
  description: string;
  tags: string[];
  thumbnail: string;
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
};

const PAGE_SIZE = 3;

export function ProjectsGrid({ projects }: { projects: PublicProject[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))],
    [projects],
  );
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(0);

  const list = filter === "All" ? projects : projects.filter((p) => p.category === filter);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = list.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-10">
      {categories.length > 2 && (
        <div role="group" aria-label="Filter projects" className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => {
            const on = category === filter;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={on}
                onClick={() => { setFilter(category); setPage(0); }}
                className={`h-11 cursor-pointer rounded-full border-[1.5px] px-5.5 text-[15px] font-semibold text-white transition-colors ${on ? "border-accent bg-accent" : "border-body bg-body hover:bg-ink"}`}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid items-start gap-8 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {shown.map((project) => (
          <article key={project.id} className="flex h-full flex-col overflow-hidden rounded-[14px] border border-edge bg-white">
            <div className="relative h-[200px] shrink-0 bg-navy">
              {project.imageUrl ? (
                <Image src={project.imageUrl} alt="" fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
              ) : (
                <ProjectThumbnail kind={project.thumbnail} />
              )}
              {project.category && (
                <span className="absolute left-4 top-4 rounded-md bg-white px-2.5 py-1.5 font-mono text-xs font-medium text-ink">
                  {project.category}
                </span>
              )}
            </div>
            <div className="flex grow flex-col gap-3.5 px-6 pb-7 pt-6">
              <h3 className="font-display text-[23px] font-semibold leading-snug text-accent">{project.title}</h3>
              <p className="grow text-base leading-relaxed text-muted">{project.description}</p>
              {project.tags.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label="Tools used">
                  {project.tags.map((tag) => (
                    <li key={tag} className="rounded-full bg-accent-soft px-3 py-1.5 font-mono text-[12.5px] text-accent">{tag}</li>
                  ))}
                </ul>
              )}
              {(project.liveUrl || project.githubUrl) && (
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex h-11.5 items-center justify-center rounded-lg bg-accent text-[15px] font-semibold text-white hover:bg-accent-dark">
                      Live Demo<span className="sr-only"> of {project.title}</span>
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex h-11.5 items-center justify-center rounded-lg border-[1.5px] border-accent text-[15px] font-semibold text-accent hover:bg-accent-soft">
                      GitHub<span className="sr-only"> repository for {project.title}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {pages > 1 && (
        <nav aria-label="Project pages" className="flex items-center justify-center gap-2">
          <button type="button" aria-label="Previous page" disabled={current === 0} onClick={() => setPage(current - 1)} className="flex size-11 cursor-pointer items-center justify-center rounded-full text-body hover:bg-edge-strong disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent">
            <ChevronLeft />
          </button>
          {Array.from({ length: pages }, (_, n) => (
            <button key={n} type="button" aria-current={n === current ? "page" : undefined} onClick={() => setPage(n)} className={`size-11 cursor-pointer rounded-full text-[15px] font-semibold ${n === current ? "bg-edge-strong text-ink" : "text-body hover:bg-page"}`}>
              {n + 1}
            </button>
          ))}
          <button type="button" aria-label="Next page" disabled={current === pages - 1} onClick={() => setPage(current + 1)} className="flex size-11 cursor-pointer items-center justify-center rounded-full text-body hover:bg-edge-strong disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent">
            <ChevronRight />
          </button>
        </nav>
      )}
    </div>
  );
}
