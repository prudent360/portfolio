import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, DownloadIcon, SkillIcon, WARM_ICONS, type SkillIconKey } from "@/components/icons";
import { CornerShapes, PipelineDiagram } from "@/components/site/illustrations";
import { PostCard } from "@/components/site/post-card";
import { ProjectsGrid, type PublicProject } from "@/components/site/projects-grid";
import type { Project } from "@/db/schema";
import { embedProvider } from "@/lib/embed";
import { hasProjectPage } from "@/lib/projects";
import { SectionHeading } from "@/components/site/section-heading";
import { getEducation, getExperiences, getProjects, getPublishedPosts, getSettings, getSkillGroups } from "@/lib/data";
import { absoluteUrl, jsonLd } from "@/lib/site";
import { formatMonth, formatRange, fullName } from "@/lib/utils";

function toPublicProject(p: Project): PublicProject {
  return {
    id: p.id, title: p.title, category: p.category, description: p.description, outcome: p.outcome, tags: p.tags,
    thumbnail: p.thumbnail, imageUrl: p.imageUrl ?? p.gallery[0] ?? null, liveUrl: p.liveUrl, githubUrl: p.githubUrl,
    href: hasProjectPage(p) ? `/projects/${p.slug}` : null,
    hasCaseStudy: Boolean(p.body.trim()),
    embedProvider: embedProvider(p.embedUrl),
  };
}

export default async function HomePage() {
  const [settings, skills, projects, experiences, education, posts] = await Promise.all([
    getSettings(),
    getSkillGroups(),
    getProjects({ publishedOnly: true }),
    getExperiences(),
    getEducation(),
    getPublishedPosts(3),
  ]);
  const name = fullName(settings.firstName, settings.lastName);
  const initials = [settings.firstName, settings.lastName].map((n) => n.charAt(0)).join("").toUpperCase();
  // Projects marked "featured" in the admin; until any are, the first two by order.
  const flagged = projects.filter((p) => p.featured);
  const featuredProjects = flagged.length ? flagged : projects.slice(0, 2);
  const otherProjects = projects.filter((p) => !featuredProjects.includes(p));
  const aboutParagraphs = settings.about.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const currentJob = experiences.find((job) => job.startDate && !job.endDate);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": absoluteUrl("/#person"),
        name,
        jobTitle: settings.role || undefined,
        description: settings.seoDescription || settings.intro || undefined,
        url: absoluteUrl("/"),
        image: settings.photoUrl ? absoluteUrl(settings.photoUrl) : undefined,
        email: settings.email ? `mailto:${settings.email}` : undefined,
        sameAs: [settings.linkedinUrl, settings.githubUrl].filter(Boolean),
        worksFor: currentJob ? { "@type": "Organization", name: currentJob.company } : undefined,
        alumniOf: education.map((e) => e.institution).filter(Boolean).map((school) => ({ "@type": "CollegeOrUniversity", name: school })),
        knowsAbout: skills.flatMap((group) => group.items),
      },
      { "@type": "WebSite", "@id": absoluteUrl("/#website"), url: absoluteUrl("/"), name, author: { "@id": absoluteUrl("/#person") } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-20 pt-14 sm:px-8 md:pb-34 md:pt-28 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            {/* Identity: who this site belongs to */}
            <div className="flex items-center gap-4">
              {settings.photoUrl ? (
                <Image src={settings.photoUrl} alt="" width={64} height={64} priority className="size-14 shrink-0 rounded-full object-cover ring-4 ring-white md:size-16" />
              ) : (
                <div aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent font-display text-xl font-semibold text-white ring-4 ring-white md:size-16 md:text-2xl">
                  {initials}
                </div>
              )}
              <div className="flex min-w-0 flex-col gap-1">
                {name && (
                  <p className="font-display text-xl font-semibold leading-tight text-ink md:text-2xl">
                    <span className="sr-only">Hi, I&apos;m </span>{name}
                  </p>
                )}
                {(settings.eyebrow || settings.role) && (
                  <p className="font-mono text-xs font-medium uppercase tracking-[1px] text-accent sm:text-[13px] sm:tracking-[1.5px] md:text-sm">
                    {settings.eyebrow || settings.role}
                  </p>
                )}
              </div>
            </div>
            <h1 className="font-display text-[40px] font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[64px] lg:tracking-[-1.5px]">
              {settings.headline || name}
            </h1>
            {settings.intro && <p className="max-w-[540px] text-lg leading-[1.65] text-muted md:text-[19px]">{settings.intro}</p>}
            <div className="mt-4 flex flex-wrap gap-4">
              <a href="#projects" className="flex h-13 items-center rounded-lg bg-accent px-8 text-base font-semibold text-white hover:bg-accent-dark">View Projects</a>
              <a href="#contact" className="flex h-13 items-center rounded-lg border-[1.5px] border-accent bg-white px-8 text-base font-semibold text-accent hover:bg-accent-soft">Contact Me</a>
              {settings.resumeUrl && (
                <a href={settings.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex h-13 items-center gap-2 px-2 text-base font-semibold text-accent hover:text-accent-dark">
                  <DownloadIcon className="size-[18px]" /> Download CV
                </a>
              )}
            </div>
            {settings.highlights.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-edge-strong pt-7 sm:grid-cols-4">
                {settings.highlights.map((item) => (
                  <div key={`${item.value}-${item.label}`} className="flex flex-col-reverse justify-end gap-1">
                    <dt className="text-sm leading-snug text-muted">{item.label}</dt>
                    <dd className="font-display text-3xl font-semibold tracking-tight text-ink">{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="flex justify-center">
            <PipelineDiagram className="h-auto w-full max-w-[560px]" />
          </div>
        </div>
        {/* Decorative; only shown when the side margin is wide enough not to touch the content. */}
        <CornerShapes className="pointer-events-none absolute bottom-0 left-0 z-0 hidden w-[170px] min-[1560px]:block" />
      </section>

      {/* About */}
      <section id="about" className="border-t border-line bg-white">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 md:py-24">
          <div className="grid items-start gap-10 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
            <div className="flex flex-col gap-5">
              <div className="relative aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-[14px] bg-accent-soft">
                {settings.photoUrl ? (
                  <Image src={settings.photoUrl} alt={name ? `Portrait of ${name}` : ""} fill sizes="(min-width: 768px) 340px, 100vw" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-7xl font-semibold text-accent" aria-hidden="true">{initials}</div>
                )}
              </div>
              {(settings.contactEyebrow || settings.location) && (
                <div className="flex flex-col gap-2">
                  {settings.contactEyebrow && (
                    <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                      <span className="size-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                      {settings.contactEyebrow}
                    </p>
                  )}
                  {settings.location && <p className="text-[15px] text-muted">{settings.location}</p>}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-5">
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-[40px]">About me</h2>
              {aboutParagraphs.map((paragraph, i) => (
                <p key={i} className="text-lg leading-[1.75] text-body">{paragraph}</p>
              ))}
              <div className="mt-3 flex flex-wrap gap-3">
                <a href="#contact" className="inline-flex h-12 items-center rounded-lg bg-accent px-6 font-semibold text-white hover:bg-accent-dark">Get in touch</a>
                {settings.resumeUrl && (
                  <a href={settings.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-lg border-[1.5px] border-accent px-6 font-semibold text-accent hover:bg-accent-soft">
                    <DownloadIcon className="size-[18px]" /> Download CV
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience & education, laid out like a CV */}
      {(experiences.length > 0 || education.length > 0) && (
        <section id="experience" className="border-t border-line">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-14 px-5 py-20 sm:px-8 md:py-24">
            {experiences.length > 0 && (
              <div className="flex max-w-[880px] flex-col gap-6">
                <h2 className="font-display text-3xl font-semibold tracking-tight md:text-[36px]">Experience</h2>
                <ol className="flex flex-col divide-y divide-edge-strong border-t border-edge-strong">
                  {experiences.map((job) => {
                    const range = formatRange(job.startDate, job.endDate, formatMonth);
                    const current = Boolean(job.startDate && !job.endDate);
                    const achievements = job.description.split("\n").map((line) => line.replace(/^[\s•\-*]+/, "").trim()).filter(Boolean);
                    return (
                      <li key={job.id} className="flex flex-col gap-1.5 py-6">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h3 className="font-display text-xl font-semibold leading-snug text-ink">{job.role}</h3>
                          {current && <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-emerald-800">Current</span>}
                        </div>
                        <p className="flex flex-wrap items-center gap-x-2 text-[15px]">
                          <span className="font-semibold text-accent">{job.company}</span>
                          {range && <><span className="text-[#A3A9B6]" aria-hidden="true">·</span><span className="text-muted">{range}</span></>}
                          {job.location && <><span className="text-[#A3A9B6]" aria-hidden="true">·</span><span className="text-muted">{job.location}</span></>}
                        </p>
                        {achievements.length === 1 && <p className="mt-1.5 text-[16px] leading-relaxed text-body">{achievements[0]}</p>}
                        {achievements.length > 1 && (
                          <ul className="mt-1.5 flex flex-col gap-1.5 text-[16px] leading-relaxed text-body">
                            {achievements.map((line, i) => (
                              <li key={i} className="flex gap-3">
                                <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {education.length > 0 && (
              <div id="education" className="flex max-w-[880px] scroll-mt-24 flex-col gap-6">
                <h2 className="font-display text-3xl font-semibold tracking-tight md:text-[36px]">Education</h2>
                <ul className="flex flex-col divide-y divide-edge-strong border-t border-edge-strong">
                  {education.map((item) => {
                    const range = item.startYear && item.endYear ? `${item.startYear} – ${item.endYear}` : item.startYear || item.endYear || "";
                    return (
                      <li key={item.id} className="flex flex-col gap-1.5 py-6">
                        <h3 className="font-display text-xl font-semibold leading-snug text-ink">{item.degree}</h3>
                        {(item.institution || range) && (
                          <p className="flex flex-wrap items-center gap-x-2 text-[15px]">
                            {item.institution && <span className="font-semibold text-accent">{item.institution}</span>}
                            {item.institution && range && <span className="text-[#A3A9B6]" aria-hidden="true">·</span>}
                            {range && <span className="text-muted">{range}</span>}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section id="skills" className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 sm:px-8 md:py-24 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-16">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionHeading align="left" title="Technical skills" subtitle="The stack I use to move data from source to decision." />
            </div>
            <ul className="flex flex-col divide-y divide-line">
              {skills.map((group) => {
                const warm = WARM_ICONS.includes(group.icon as SkillIconKey);
                return (
                  <li key={group.id} className="grid gap-4 py-6 first:pt-0 last:pb-0 sm:grid-cols-[250px_minmax(0,1fr)] sm:gap-6">
                    <div className="flex items-center gap-3 sm:items-start">
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${warm ? "bg-orange-soft text-orange-ink" : "bg-accent-soft text-accent"}`}>
                        <SkillIcon name={group.icon} className="size-5" />
                      </span>
                      <h3 className="font-display text-lg font-semibold leading-snug text-ink sm:pt-2">{group.title}</h3>
                    </div>
                    <ul className="flex flex-wrap content-start gap-2 sm:pt-1" aria-label={group.title}>
                      {group.items.map((item) => (
                        <li key={item} className="rounded-full border border-edge bg-panel px-3.5 py-1.5 text-[15px] text-body">{item}</li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section id="projects" className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 py-20 sm:px-8 md:py-24">
          <SectionHeading title="Featured Projects" subtitle="Pipelines, models and reports I've built end to end" />
          <ProjectsGrid featured={featuredProjects.map(toPublicProject)} others={otherProjects.map(toPublicProject)} />
        </section>
      )}

      {/* Writing */}
      {posts.length > 0 && (
        <section id="writing" className="border-t border-line bg-white">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 py-20 sm:px-8 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading align="left" title="Latest writing" subtitle="Notes on pipelines, modelling and reporting." />
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-[16px] font-semibold text-accent hover:text-accent-dark">
                All posts <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          </div>
        </section>
      )}

    </>
  );
}
