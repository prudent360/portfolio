"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import type { ResolvedIcon } from "@/lib/tech-icons";
import { IconPicker } from "./icon-picker";

export type SkillItemDraft = { name: string; icon: string; preview: ResolvedIcon | null; auto: ResolvedIcon | null };

const inputClass = "h-11 w-full rounded-lg border border-edge-strong bg-white px-3.5 text-[15px] text-ink placeholder:text-[#8A909B] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

/** Rows of [icon][skill name], submitted as parallel itemIcon / itemName fields. */
export function SkillItemsField({ defaultValue = [], max = 30 }: { defaultValue?: SkillItemDraft[]; max?: number }) {
  const [rows, setRows] = useState(defaultValue.map((item, key) => ({ ...item, key })));
  const [nextKey, setNextKey] = useState(defaultValue.length);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-ink">Skills</p>
      {rows.map((row, index) => (
        <div key={row.key} className="grid grid-cols-[minmax(0,170px)_minmax(0,1fr)_auto] items-center gap-2">
          <IconPicker name="itemIcon" defaultRef={row.icon} defaultIcon={row.preview} autoIcon={row.auto} label={row.name || `Skill ${index + 1}`} />
          <input name="itemName" defaultValue={row.name} aria-label={`Skill ${index + 1}`} placeholder="e.g. Python" maxLength={60} className={inputClass} />
          <button type="button" onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))} className="h-11 cursor-pointer rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50">
            Remove
          </button>
        </div>
      ))}
      {rows.length < max && (
        <button
          type="button"
          onClick={() => {
            setRows((current) => [...current, { name: "", icon: "", preview: null, auto: null, key: nextKey }]);
            setNextKey((k) => k + 1);
          }}
          className="inline-flex h-11 w-fit cursor-pointer items-center gap-2 rounded-lg border border-edge-strong bg-white px-4 text-sm font-semibold text-body hover:border-accent hover:text-accent"
        >
          <PlusIcon className="size-4" /> Add a skill
        </button>
      )}
      <p className="text-[13px] text-muted">“Automatic” picks a logo from the skill name when one exists. Pick an icon to override it, or choose “No icon”.</p>
    </div>
  );
}
