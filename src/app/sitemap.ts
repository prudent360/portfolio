import type { MetadataRoute } from "next";
import { getPublishedPosts, getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/site";

// Built from the database on request so new posts appear without a redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [settings, posts] = await Promise.all([getSettings(), getPublishedPosts()]);
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
  ];
}
