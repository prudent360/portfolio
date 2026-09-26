"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ChevronDown, List } from "lucide-react";
import type { TocItem } from "@/lib/toc";

/** "On this page" navigation: an accordion on small screens, a sticky sidebar on large ones. */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
      const headings = items
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);
      const position = window.scrollY + 120;
      for (let i = headings.length - 1; i >= 0; i--) {
        if (headings[i].offsetTop <= position) {
          setActiveId(headings[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  if (items.length === 0) return null;

  const links = (onPick?: () => void) =>
    items.map((item) => {
      const active = activeId === item.id;
      return (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={onPick}
          aria-current={active ? "location" : undefined}
          className={`block border-l-2 py-1.5 text-[14px] leading-snug transition-colors ${item.sub ? "pl-6" : "pl-3.5"} ${
            active ? "border-accent font-semibold text-accent" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          {item.label}
        </a>
      );
    });

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="toc-mobile"
          className="flex h-12 w-full cursor-pointer items-center justify-between rounded-[14px] border border-edge bg-white px-4 text-[15px] font-semibold text-ink"
        >
          <span className="flex items-center gap-2">
            <List className="size-4 text-accent" aria-hidden="true" /> On this page
          </span>
          <ChevronDown className={`size-4 text-muted transition-transform ${mobileOpen ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
        {mobileOpen && (
          <nav id="toc-mobile" aria-label="On this page" className="mt-2 rounded-[14px] border border-edge bg-white p-3">
            {links(() => setMobileOpen(false))}
          </nav>
        )}
      </div>

      <aside className="hidden lg:block">
        <nav aria-label="On this page" className="sticky top-28 flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[2px] text-muted">On this page</p>
          <div className="border-l border-line">{links()}</div>
        </nav>
      </aside>

      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 flex size-11 cursor-pointer items-center justify-center rounded-full border border-edge bg-white text-body shadow-md hover:text-accent"
        >
          <ArrowUp className="size-5" aria-hidden="true" />
        </button>
      )}
    </>
  );
}
