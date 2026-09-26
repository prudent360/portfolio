import Link from "next/link";
import { MenuIcon } from "@/components/icons";
import { NavLinks } from "./nav-links";

export function SiteHeader({ brand }: { brand: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8 md:h-20">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-accent hover:text-accent-dark md:text-[28px]">
          {brand || "Portfolio"}
        </Link>
        <nav aria-label="Main" className="hidden h-full items-center gap-1 md:flex">
          <NavLinks variant="desktop" />
        </nav>
        <details className="group relative md:hidden">
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-edge text-ink [&::-webkit-details-marker]:hidden" aria-label="Open menu">
            <MenuIcon />
          </summary>
          <nav aria-label="Mobile" className="absolute right-0 top-13 flex w-52 flex-col rounded-xl border border-edge bg-white p-2 shadow-lg">
            <NavLinks variant="mobile" />
          </nav>
        </details>
      </div>
    </header>
  );
}
