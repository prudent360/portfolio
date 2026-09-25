"use client";

import { useId, useRef, useState } from "react";
import { ImageIcon } from "@/components/icons";
import { Markdown } from "@/components/markdown";

/** Markdown textarea with a live preview and inline image uploads. */
export function MarkdownEditor({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [status, setStatus] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setStatus("Uploading image…");
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error ?? "Upload failed.");
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const snippet = `\n![${alt}](${data.url})\n`;
      const el = textareaRef.current;
      const start = el?.selectionStart ?? value.length;
      const end = el?.selectionEnd ?? value.length;
      setValue((v) => v.slice(0, start) + snippet + v.slice(end));
      setStatus("Image inserted. Edit the text in square brackets to describe it.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const tabClass = (active: boolean) =>
    `h-10 cursor-pointer rounded-lg px-4 text-sm font-semibold ${active ? "bg-accent-soft text-accent" : "text-muted hover:text-ink"}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">Content</label>
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" className={tabClass(tab === "write")} aria-pressed={tab === "write"} onClick={() => setTab("write")}>Write</button>
          <button type="button" className={tabClass(tab === "preview")} aria-pressed={tab === "preview"} onClick={() => setTab("preview")}>Preview</button>
          <button type="button" onClick={() => fileRef.current?.click()} className="ml-1 inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-edge-strong px-3.5 text-sm font-semibold text-body hover:border-accent hover:text-accent">
            <ImageIcon className="size-4" /> Insert image
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" aria-hidden="true" tabIndex={-1} onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
        </div>
      </div>
      <textarea
        id={id}
        ref={textareaRef}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={22}
        hidden={tab !== "write"}
        aria-describedby={`${id}-hint`}
        className="w-full rounded-lg border border-edge-strong bg-white px-4 py-3 font-mono text-sm leading-relaxed text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
      {tab === "preview" && (
        <div className="min-h-[300px] rounded-lg border border-edge-strong bg-white px-6 py-5">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-muted">Nothing to preview yet.</p>}
        </div>
      )}
      <p id={`${id}-hint`} className="text-[13px] text-muted" aria-live="polite">
        {status ?? "Markdown: # heading, **bold**, [link](https://…), - list, ``` code ```."}
      </p>
    </div>
  );
}
