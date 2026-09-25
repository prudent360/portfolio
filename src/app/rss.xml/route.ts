import { getPublishedPosts, getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/site";
import { fullName } from "@/lib/utils";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
}

/** RSS 2.0 feed of published blog posts. */
export async function GET() {
  const base = siteUrl();
  const [settings, posts] = await Promise.all([getSettings(), getPublishedPosts(50)]);
  const author = fullName(settings.firstName, settings.lastName) || "Blog";

  const items = posts
    .map((post) => {
      const url = `${base}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${post.publishedAt ? `<pubDate>${post.publishedAt.toUTCString()}</pubDate>` : ""}
      <description>${escapeXml(post.excerpt)}</description>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${author} — Blog`)}</title>
    <link>${base}/blog</link>
    <description>${escapeXml(settings.seoDescription || settings.intro)}</description>
    <language>en-gb</language>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=600" },
  });
}
