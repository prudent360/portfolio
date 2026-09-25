"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderIcon, HomeIcon, KeyIcon, LayersIcon, PenIcon, UserIcon, BriefcaseIcon } from "@/components/icons";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon, exact: true },
  { href: "/admin/profile", label: "Profile", icon: UserIcon },
  { href: "/admin/skills", label: "Skills", icon: LayersIcon },
  { href: "/admin/projects", label: "Projects", icon: FolderIcon },
  { href: "/admin/experience", label: "Experience", icon: BriefcaseIcon },
  { href: "/admin/posts", label: "Blog posts", icon: PenIcon },
  { href: "/admin/account", label: "Account", icon: KeyIcon },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex h-11 shrink-0 items-center gap-3 rounded-lg px-3.5 text-[15px] font-semibold ${active ? "bg-accent-soft text-accent" : "text-body hover:bg-page hover:text-ink"}`}
          >
            <Icon className="size-[18px]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
