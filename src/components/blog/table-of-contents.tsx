"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, ArrowUp, Mail, ExternalLink } from "lucide-react";
import type { TocItem } from "@/lib/toc";

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;


    const handleScroll = () => {
      // Show/hide back to top button
      setShowScrollTop(window.scrollY > 350);

      // Scroll-spy to find active heading
      const headingElements = items
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);

      const scrollPosition = window.scrollY + 120;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el.offsetTop <= scrollPosition) {
          setActiveId(el.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <>
      {/* Mobile Table of Contents Accordion */}
      <div className="mb-8 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-xs"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="size-4 text-accent" />
            Table of Contents ({items.length} sections)
          </span>
          <ChevronDown
            className={`size-4 text-slate-500 transition-transform duration-200 ${
              mobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {mobileOpen && (
          <nav
            aria-label="Mobile Table of Contents"
            className="mt-2 flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                  item.sub ? "pl-6 text-xs text-slate-600" : "font-medium text-slate-800"
                } ${
                  activeId === item.id
                    ? "bg-accent-soft text-accent font-semibold"
                    : "hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <BookOpen className="size-4 text-accent" />
              On this page
            </h3>
            <nav aria-label="Table of contents" className="flex flex-col gap-1">
              {items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className={`group flex items-start gap-2.5 text-left text-sm py-1.5 transition-all ${
                      item.sub ? "pl-5 text-xs text-slate-500" : "text-slate-700"
                    } ${
                      isActive
                        ? "font-semibold text-accent"
                        : "hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full transition-all ${
                        isActive
                          ? "bg-accent scale-125"
                          : "bg-slate-300 group-hover:bg-slate-400"
                      }`}
                    />
                    <span className="leading-snug">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-500 leading-relaxed mb-2">
                Have questions or need data engineering advisory?
              </p>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-dark"
              >
                Start a conversation <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>

          {/* Quick contact / hiring callout card in sidebar */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Available for Projects
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Specialized in scalable ETL pipelines, BigQuery modelling, and business intelligence dashboards.
            </p>
            <a
              href="mailto:contact@ifiokobong.com"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-accent text-xs font-semibold text-white hover:bg-accent-dark transition-colors"
            >
              <Mail className="size-3.5" /> Reach Out
            </a>
          </div>
        </div>
      </aside>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-all hover:bg-slate-50 hover:text-accent hover:scale-105 active:scale-95"
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp className="size-5" />
        </button>
      )}
    </>
  );
}
