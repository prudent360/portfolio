"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/#skills", label: "Skills" },
  { href: "/#projects", label: "Projects", match: (p: string) => p.startsWith("/projects") },
  { href: "/blog", label: "Blog", match: (p: string) => p.startsWith("/blog") },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

/** Main navigation with the current page marked. */
export function NavLinks({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();
  return LINKS.map(({ href, label, match }) => {
    const active = match?.(pathname) ?? false;
    const className =
      variant === "desktop"
        ? `flex h-full items-center border-b-2 px-4 text-[15px] ${active ? "border-accent font-semibold text-ink" : "border-transparent font-medium text-muted hover:text-ink"}`
        : `rounded-lg px-4 py-3 text-[15px] ${active ? "bg-accent-soft font-semibold text-accent" : "font-medium hover:bg-page"}`;
    return (
      <Link key={href} href={href} aria-current={active ? "page" : undefined} className={className}>
        {label}
      </Link>
    );
  });
}
