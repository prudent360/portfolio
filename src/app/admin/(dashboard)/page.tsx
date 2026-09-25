import Link from "next/link";
import { Panel } from "@/components/admin/ui";
import { getAllPosts, getEducation, getExperiences, getProjects, getSettings, getSkillGroups } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [settings, skills, projects, experiences, education, posts] = await Promise.all([
    getSettings(), getSkillGroups(), getProjects({ publishedOnly: false }), getExperiences(), getEducation(), getAllPosts(),
  ]);

  const stats = [
    { label: "Projects", value: projects.length, detail: `${projects.filter((p) => p.published).length} visible`, href: "/admin/projects" },
    { label: "Blog posts", value: posts.length, detail: `${posts.filter((p) => p.published).length} published`, href: "/admin/posts" },
    { label: "Skill groups", value: skills.length, detail: `${skills.reduce((n, g) => n + g.items.length, 0)} skills`, href: "/admin/skills" },
    { label: "Experience", value: experiences.length, detail: `${education.length} education`, href: "/admin/experience" },
  ];

  const todo = [
    !settings.lastName && "Add your surname",
    !settings.photoUrl && "Upload a profile photo",
    !settings.email && "Add a contact email",
    !settings.linkedinUrl && "Add your LinkedIn link",
    !settings.githubUrl && "Add your GitHub link",
    experiences.some((e) => !e.startDate) && "Add start dates to your experience",
    education.some((e) => !e.institution || (!e.startYear && !e.endYear)) && "Complete your education details",
    projects.some((p) => !p.liveUrl && !p.githubUrl) && "Add demo or GitHub links to your projects",
  ].filter(Boolean) as string[];

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back{settings.firstName ? `, ${settings.firstName}` : ""}</h1>
        <p className="text-[15px] text-muted">Everything on your public site is managed from here.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="flex flex-col gap-1 rounded-[14px] border border-edge bg-white p-5 hover:border-accent">
            <span className="text-sm font-semibold text-muted">{s.label}</span>
            <span className="font-display text-4xl font-semibold">{s.value}</span>
            <span className="text-sm text-muted">{s.detail}</span>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Still to fill in" description="Placeholders from the design that are hidden on the site until you add them.">
          {todo.length ? (
            <ul className="flex flex-col gap-2.5">
              {todo.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px] text-body">
                  <span className="size-2 shrink-0 rounded-full bg-orange" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[15px] text-body">Your profile is complete.</p>
          )}
        </Panel>
        <Panel title="Recent posts">
          {posts.length ? (
            <ul className="flex flex-col divide-y divide-line">
              {posts.slice(0, 5).map((post) => (
                <li key={post.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <Link href={`/admin/posts/${post.id}`} className="truncate text-[15px] font-semibold hover:text-accent">{post.title}</Link>
                  <span className="shrink-0 text-sm text-muted">{post.published ? formatDate(post.publishedAt) : "Draft"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[15px] text-muted">No posts yet.</p>
          )}
          <Link href="/admin/posts/new" className="w-fit text-[15px] font-semibold text-accent hover:text-accent-dark">Write a new post</Link>
        </Panel>
      </div>
    </>
  );
}
