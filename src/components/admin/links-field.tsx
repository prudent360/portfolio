"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons";

type Link = { label: string; url: string };

const inputClass = "w-full rounded-lg border border-edge-strong bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-[#8A909B] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

/** Repeatable label + URL rows, submitted as parallel linkLabel / linkUrl fields. */
export function LinksField({ defaultValue = [], max = 8 }: { defaultValue?: Link[]; max?: number }) {
  const [rows, setRows] = useState<(Link & { key: number })[]>(defaultValue.map((link, i) => ({ ...link, key: i })));
  const [nextKey, setNextKey] = useState(defaultValue.length);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div key={row.key} className="grid gap-2 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto] sm:items-center">
          <input name="linkLabel" defaultValue={row.label} placeholder="Label, e.g. Power BI report" aria-label={`Link ${index + 1} label`} className={inputClass} maxLength={60} />
          <input name="linkUrl" type="url" defaultValue={row.url} placeholder="https://" aria-label={`Link ${index + 1} URL`} className={inputClass} />
          <button type="button" onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))} className="h-11 cursor-pointer rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50">
            Remove
          </button>
        </div>
      ))}
      {rows.length < max && (
        <button type="button" onClick={() => { setRows((current) => [...current, { label: "", url: "", key: nextKey }]); setNextKey((k) => k + 1); }} className="inline-flex h-11 w-fit cursor-pointer items-center gap-2 rounded-lg border border-edge-strong bg-white px-4 text-sm font-semibold text-body hover:border-accent hover:text-accent">
          <PlusIcon className="size-4" /> Add a link
        </button>
      )}
    </div>
  );
}
