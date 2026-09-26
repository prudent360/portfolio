"use client";

import { useEffect, useRef, useState } from "react";
import { TechIcon } from "@/components/tech-icon";
import type { ResolvedIcon } from "@/lib/tech-icons";

/**
 * Searchable icon picker. Submits an icon reference in a hidden input:
 * "" = automatic (matched from the skill name), "none" = no icon, otherwise the chosen icon.
 */
export function IconPicker({
  name,
  defaultRef = "",
  defaultIcon = null,
  autoIcon = null,
  label,
}: {
  name: string;
  defaultRef?: string;
  defaultIcon?: ResolvedIcon | null;
  autoIcon?: ResolvedIcon | null;
  label: string;
}) {
  const [ref, setRef] = useState(defaultRef);
  const [icon, setIcon] = useState<ResolvedIcon | null>(defaultIcon);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResolvedIcon[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/icons?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = (await response.json()) as { icons?: ResolvedIcon[] };
        setResults(data.icons ?? []);
      } catch {
        /* aborted or offline */
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: string, preview: ResolvedIcon | null) {
    setRef(next);
    setIcon(preview);
    setOpen(false);
  }

  async function upload(file: File) {
    setStatus("Uploading…");
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error ?? "Upload failed.");
      setStatus(null);
      choose(data.url, { kind: "img", ref: data.url, title: "Custom icon", src: data.url });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const shown = ref === "none" ? null : ref ? icon : autoIcon;
  const caption = ref === "none" ? "No icon" : ref ? icon?.title ?? "Icon" : autoIcon ? "Automatic" : "No match";

  return (
    <div ref={wrapper} className="relative">
      <input type="hidden" name={name} value={ref} />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${label}: ${caption}. Change icon`}
        className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-edge-strong bg-white px-3 text-sm text-body hover:border-accent"
      >
        <span className="flex size-6 items-center justify-center">
          {shown ? <TechIcon icon={shown} className="size-5" /> : <span className="size-4 rounded border border-dashed border-edge-strong" />}
        </span>
        <span className="truncate">{caption}</span>
      </button>

      {open && (
        <div role="dialog" aria-label={`Choose an icon for ${label}`} className="absolute left-0 top-12 z-20 flex w-[min(92vw,380px)] flex-col gap-3 rounded-xl border border-edge bg-white p-3 shadow-xl">
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: Python, BigQuery, Docker…"
            aria-label="Search icons"
            className="h-10 w-full rounded-lg border border-edge-strong px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <button type="button" onClick={() => choose("", null)} className={`h-8 cursor-pointer rounded-full border px-3 ${ref === "" ? "border-accent bg-accent-soft text-accent" : "border-edge-strong text-body hover:border-accent"}`}>
              Automatic{autoIcon ? ` (${autoIcon.title})` : ""}
            </button>
            <button type="button" onClick={() => choose("none", null)} className={`h-8 cursor-pointer rounded-full border px-3 ${ref === "none" ? "border-accent bg-accent-soft text-accent" : "border-edge-strong text-body hover:border-accent"}`}>
              No icon
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className="h-8 cursor-pointer rounded-full border border-edge-strong px-3 text-body hover:border-accent">
              Upload icon
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
          </div>
          {status && <p className="text-xs text-muted" aria-live="polite">{status}</p>}
          <ul className="grid max-h-64 grid-cols-6 gap-1.5 overflow-y-auto" aria-label="Icons">
            {results.map((result) => (
              <li key={result.ref}>
                <button
                  type="button"
                  title={result.title}
                  aria-label={result.title}
                  aria-pressed={ref === result.ref}
                  onClick={() => choose(result.ref, result)}
                  className={`flex aspect-square w-full cursor-pointer items-center justify-center rounded-lg border ${ref === result.ref ? "border-accent bg-accent-soft" : "border-transparent hover:border-edge-strong hover:bg-panel"}`}
                >
                  <TechIcon icon={result} className="size-6" />
                </button>
              </li>
            ))}
          </ul>
          {results.length === 0 && <p className="text-xs text-muted">No icons match. Try another name, or upload one.</p>}
          <p className="text-[11px] leading-snug text-muted">Brand icons from Simple Icons (CC0) and Devicon (MIT). Missing a logo, like Power BI or Tableau? Upload a PNG.</p>
        </div>
      )}
    </div>
  );
}
