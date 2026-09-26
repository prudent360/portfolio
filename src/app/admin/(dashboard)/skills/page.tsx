import type { Metadata } from "next";
import { createSkillGroup, deleteSkillGroup, updateSkillGroup } from "@/app/admin/actions/skills";
import { ActionForm, DeleteButton, Input, Select, SubmitButton } from "@/components/admin/forms";
import { SkillItemsField, type SkillItemDraft } from "@/components/admin/skill-items-field";
import { PageHeader, Panel } from "@/components/admin/ui";
import { SKILL_ICONS } from "@/components/icons";
import { normalizeSkillItems, type SkillGroup } from "@/db/schema";
import { guessIconRef, resolveIconRef } from "@/lib/tech-icons";
import { getSkillGroups } from "@/lib/data";

export const metadata: Metadata = { title: "Skills" };

const iconOptions = Object.entries(SKILL_ICONS).map(([value, { label }]) => ({ value, label }));

function drafts(group?: SkillGroup): SkillItemDraft[] {
  return normalizeSkillItems(group?.items ?? []).map((item) => ({
    name: item.name,
    icon: item.icon ?? "",
    preview: item.icon && item.icon !== "none" ? resolveIconRef(item.icon, item.name) : null,
    auto: resolveIconRef(guessIconRef(item.name), item.name),
  }));
}

function Fields({ group }: { group?: SkillGroup }) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-[1fr_200px_120px]">
        <Input label="Title" name="title" defaultValue={group?.title} required />
        <Select label="Group icon" name="icon" options={iconOptions} defaultValue={group?.icon ?? "code"} />
        <Input label="Order" name="sortOrder" type="number" defaultValue={group?.sortOrder ?? 0} />
      </div>
      <SkillItemsField defaultValue={drafts(group)} />
    </>
  );
}

export default async function SkillsPage() {
  const groups = await getSkillGroups();
  return (
    <>
      <PageHeader title="Skills" description="Groups shown in the Technical skills section, lowest order first. Each skill can show a logo." />
      {groups.map((group) => (
        <Panel key={group.id} title={group.title}>
          <ActionForm action={updateSkillGroup.bind(null, group.id)}>
            <Fields group={group} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SubmitButton />
              <DeleteButton action={deleteSkillGroup.bind(null, group.id)} />
            </div>
          </ActionForm>
        </Panel>
      ))}
      <Panel title="Add a skill group">
        <ActionForm action={createSkillGroup} resetOnSuccess>
          <Fields />
          <SubmitButton pendingText="Adding…">Add group</SubmitButton>
        </ActionForm>
      </Panel>
    </>
  );
}
