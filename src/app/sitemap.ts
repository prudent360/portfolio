import type { MetadataRoute } from "next";
import { getProjects, getPublishedPosts, getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/site";

// Built from the database on request so new posts appear without a redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [settings, posts, projects] = await Promise.all([getSettings(), getPublishedPosts(), getProjects({ publishedOnly: true })]);
  const latestPost = posts[0]?.updatedAt;
  const siteUpdated = [settings.updatedAt, latestPost].filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0];

  return [
    { url: base, lastModified: siteUpdated, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/blog`, lastModified: latestPost, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...projects
      .filter((project) => project.body.trim())
      .map((project) => ({
        url: `${base}/projects/${project.slug}`,
        lastModified: project.updatedAt,
        changeFrequency: "yearly" as const,
        priority: 0.7,
      })),
  ];
}
