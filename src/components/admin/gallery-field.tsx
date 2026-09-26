"use client";

import { useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "@/components/icons";

/**
 * Screenshot gallery editor. Each image uploads as soon as it is chosen (keeping every request
 * under the hosting upload limit); the list of URLs is submitted with the form as JSON.
 */
export function GalleryField({ name, defaultValue = [], max = 12 }: { name: string; defaultValue?: string[]; max?: number }) {
  const id = useId();
  const [images, setImages] = useState<string[]>(defaultValue);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList) {
    const room = max - images.length;
    const chosen = Array.from(files).slice(0, room);
    if (!chosen.length) return setStatus(`The gallery holds up to ${max} images.`);
    setBusy(true);
    const added: string[] = [];
    for (const [i, file] of chosen.entries()) {
      setStatus(`Uploading ${i + 1} of ${chosen.length}…`);
      const body = new FormData();
      body.append("file", file);
      try {
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !data.url) throw new Error(data.error ?? "Upload failed.");
        added.push(data.url);
      } catch (error) {
        setStatus(`${file.name}: ${error instanceof Error ? error.message : "Upload failed."}`);
        break;
      }
    }
    setImages((current) => [...current, ...added]);
    if (added.length === chosen.length) setStatus(`${added.length} image${added.length === 1 ? "" : "s"} added. Save the project to keep them.`);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, by: number) {
    setImages((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, index) => (
            <li key={url} className="flex flex-col gap-2 rounded-lg border border-edge bg-panel p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Screenshot ${index + 1}`} className="aspect-[16/10] w-full rounded-md object-cover" />
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move screenshot ${index + 1} earlier`} className="flex size-9 cursor-pointer items-center justify-center rounded-md text-body hover:bg-white disabled:cursor-default disabled:opacity-30">
                    <ChevronLeft className="size-4" />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === images.length - 1} aria-label={`Move screenshot ${index + 1} later`} className="flex size-9 cursor-pointer items-center justify-center rounded-md text-body hover:bg-white disabled:cursor-default disabled:opacity-30">
                    <ChevronRight className="size-4" />
                  </button>
                </div>
                <button type="button" onClick={() => setImages((current) => current.filter((u) => u !== url))} className="h-9 cursor-pointer rounded-md px-2.5 text-sm font-semibold text-red-700 hover:bg-red-50">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy || images.length >= max} onClick={() => inputRef.current?.click()} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-edge-strong bg-white px-4 text-sm font-semibold text-body hover:border-accent hover:text-accent disabled:cursor-default disabled:opacity-50">
          <ImageIcon className="size-4" /> {busy ? "Uploading…" : "Add screenshots"}
        </button>
        <input id={id} ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files?.length && void upload(e.target.files)} />
        <p className="text-[13px] text-muted" aria-live="polite">{status ?? `Up to ${max} images, 4 MB each. The first one is used on the project card if there's no card image.`}</p>
      </div>
    </div>
  );
}
