import type { Metadata } from "next";
import { ContactSection, SiteFooter } from "@/components/site/contact";
import { SiteHeader } from "@/components/site/header";
import { getSettings } from "@/lib/data";
import { RSS_ALTERNATE } from "@/lib/site";
import { fullName } from "@/lib/utils";

// Content is edited from the admin, so render on each request to always show the latest.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const name = fullName(settings.firstName, settings.lastName) || "Portfolio";
  const title = settings.role ? `${name} — ${settings.role}` : name;
  const description = settings.seoDescription || settings.intro;
  return {
    title: { default: title, template: `%s | ${name}` },
    description,
    alternates: { canonical: "/", types: RSS_ALTERNATE },
    openGraph: { title, description, type: "website", siteName: name, locale: "en_GB" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <SiteHeader brand={settings.brand} />
      <main id="main">{children}</main>
      <ContactSection settings={settings} />
      <SiteFooter settings={settings} />
    </>
  );
}
