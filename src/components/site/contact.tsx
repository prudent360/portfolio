import type { Settings } from "@/db/schema";
import { DownloadIcon, MailIcon } from "@/components/icons";
import { fullName } from "@/lib/utils";

export function ContactSection({ settings }: { settings: Settings }) {
  const socials = [
    { href: settings.linkedinUrl, label: "LinkedIn" },
    { href: settings.githubUrl, label: "GitHub" },
  ].filter((s) => s.href);

  return (
    <section id="contact" className="bg-ink text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 py-16 sm:px-8 md:py-22 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-[640px] flex-col gap-3.5">
          {settings.contactEyebrow && (
            <p className="font-mono text-sm uppercase tracking-[2px] text-peach">{settings.contactEyebrow}</p>
          )}
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight md:text-[44px]">
            {settings.contactHeading}
          </h2>
          {settings.contactText && <p className="text-lg leading-relaxed text-[#C4C9D4]">{settings.contactText}</p>}
        </div>
        <div className="flex w-full flex-col gap-3.5 sm:max-w-[340px]">
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="flex h-14 items-center justify-center gap-2.5 rounded-lg bg-white px-4 text-base font-semibold text-ink hover:bg-accent-soft">
              <MailIcon className="size-[18px] shrink-0" />
              <span className="truncate">{settings.email}</span>
            </a>
          )}
          {socials.length > 0 && (
            <div className="grid grid-cols-2 gap-3.5">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center rounded-lg border-[1.5px] border-[#4A5060] text-[15px] font-semibold text-white hover:border-white">
                  {s.label}
                </a>
              ))}
            </div>
          )}
          {settings.resumeUrl && (
            <a href={settings.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-lg border-[1.5px] border-[#4A5060] text-[15px] font-semibold text-white hover:border-white">
              <DownloadIcon className="size-[18px]" /> Download CV
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter({ settings }: { settings: Settings }) {
  const name = fullName(settings.firstName, settings.lastName);
  return (
    <footer className="border-t border-[#2A2E37] bg-ink text-sm text-[#A3A9B6]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 md:h-20 md:py-0">
        <span>&copy; {new Date().getFullYear()} {name}</span>
        {settings.footerTagline && <span className="font-mono">{settings.footerTagline}</span>}
      </div>
    </footer>
  );
}
