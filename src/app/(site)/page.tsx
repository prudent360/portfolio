import Image from "next/image";
import Link from "next/link";
import { BriefcaseIcon, CapIcon, DownloadIcon, SkillIcon, WARM_ICONS, type SkillIconKey } from "@/components/icons";
import { CornerShapes, PipelineDiagram } from "@/components/site/illustrations";
import { PostCard } from "@/components/site/post-card";
import { ProjectsGrid } from "@/components/site/projects-grid";
import { SectionHeading } from "@/components/site/section-heading";
import { getEducation, getExperiences, getProjects, getPublishedPosts, getSettings, getSkillGroups } from "@/lib/data";
import { absoluteUrl, jsonLd } from "@/lib/site";
import { formatMonth, formatRange, fullName } from "@/lib/utils";

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
            {settings.eyebrow && (
              <p className="font-mono text-sm font-medium uppercase tracking-[2px] text-accent md:text-[15px]">{settings.eyebrow}</p>
            )}
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

      {/* Skills */}
      {skills.length > 0 && (
        <section id="skills" className="border-y border-line bg-white">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-14 px-5 py-20 sm:px-8 md:py-24">
            <SectionHeading title="Technical Skills" subtitle="The stack I use to move data from source to decision" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {skills.map((group) => {
                const warm = WARM_ICONS.includes(group.icon as SkillIconKey);
                return (
                  <div key={group.id} className="flex flex-col gap-5 rounded-[14px] border border-edge bg-panel px-7 py-8">
                    <div className={`flex size-14 items-center justify-center rounded-xl ${warm ? "bg-orange-soft text-orange-ink" : "bg-accent-soft text-accent"}`}>
                      <SkillIcon name={group.icon} className="size-7" />
                    </div>
                    <h3 className="font-display text-[22px] font-semibold text-accent">{group.title}</h3>
                    <ul className="flex flex-col gap-3 text-base text-body">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-center gap-2.5">
                          <span className="size-[7px] shrink-0 rounded-full bg-accent" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section id="projects" className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 py-20 sm:px-8 md:py-24">
          <SectionHeading title="Featured Projects" subtitle="Pipelines, models and reports I've built end to end" />
          <ProjectsGrid
            projects={projects.map((p) => ({
              id: p.id, title: p.title, category: p.category, description: p.description, tags: p.tags,
              thumbnail: p.thumbnail, imageUrl: p.imageUrl, liveUrl: p.liveUrl, githubUrl: p.githubUrl,
              href: p.body.trim() ? `/projects/${p.slug}` : null,
            }))}
          />
        </section>
      )}

      {/* Writing */}
      {posts.length > 0 && (
        <section id="writing" className="border-t border-line bg-white">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-5 py-20 sm:px-8 md:py-24">
            <SectionHeading title="Latest Writing" subtitle="Notes on pipelines, modelling and reporting" />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
            <div className="flex justify-center">
              <Link href="/blog" className="flex h-12 items-center rounded-lg border-[1.5px] border-accent px-7 font-semibold text-accent hover:bg-accent-soft">
                All posts
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section id="about" className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-5 py-20 sm:px-8 md:py-24">
          <div className="flex items-center gap-6">
            {settings.photoUrl ? (
              <Image src={settings.photoUrl} alt={name} width={96} height={96} className="size-24 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-3xl font-semibold text-accent" aria-hidden="true">
                {initials}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <p className="font-display text-[26px] font-semibold">{name}</p>
              {settings.role && <p className="text-[17px] text-body">{settings.role}</p>}
              {settings.location && <p className="text-base text-muted">{settings.location}</p>}
            </div>
          </div>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="flex flex-col gap-5 lg:col-span-7">
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-[34px]">About Me</h2>
              {aboutParagraphs.map((paragraph, i) => (
                <p key={i} className="text-lg leading-[1.75] text-body">{paragraph}</p>
              ))}
            </div>
            <div className="flex flex-col gap-10 lg:col-span-5">
              {experiences.length > 0 && (
                <div className="flex flex-col gap-5">
                  <h2 className="font-display text-[26px] font-semibold">Experience</h2>
                  <ol className="ml-[15px] flex flex-col gap-5.5 border-l-2 border-edge-strong">
                    {experiences.map((job) => {
                      const range = formatRange(job.startDate, job.endDate, formatMonth);
                      return (
                        <li key={job.id} className="-ml-4 flex gap-4">
                          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                            <BriefcaseIcon className="size-4" />
                          </span>
                          <div className="flex flex-col gap-1">
                            <p className="text-base font-semibold">{job.role} · {job.company}</p>
                            {range && <p className="font-mono text-[13px] text-muted">{range}</p>}
                            {job.description && <p className="text-[15px] leading-relaxed text-body">{job.description}</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
              {education.length > 0 && (
                <div className="flex flex-col gap-5">
                  <h2 className="font-display text-[26px] font-semibold">Education</h2>
                  <ul className="flex flex-col gap-4.5">
                    {education.map((item) => {
                      const range = item.startYear && item.endYear ? `${item.startYear} – ${item.endYear}` : item.startYear || item.endYear || "";
                      return (
                        <li key={item.id} className="flex gap-4">
                          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-orange-soft text-orange-ink">
                            <CapIcon className="size-4" />
                          </span>
                          <div className="flex flex-col gap-1">
                            <p className="text-base font-semibold">{[item.degree, item.institution].filter(Boolean).join(" · ")}</p>
                            {range && <p className="font-mono text-[13px] text-muted">{range}</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
