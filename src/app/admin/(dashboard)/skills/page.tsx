import type { Metadata } from "next";
import { createSkillGroup, deleteSkillGroup, updateSkillGroup } from "@/app/admin/actions/skills";
import { ActionForm, DeleteButton, Input, Select, SubmitButton, Textarea } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { SKILL_ICONS } from "@/components/icons";
import type { SkillGroup } from "@/db/schema";
import { getSkillGroups } from "@/lib/data";

export const metadata: Metadata = { title: "Skills" };

const iconOptions = Object.entries(SKILL_ICONS).map(([value, { label }]) => ({ value, label }));

function Fields({ group }: { group?: SkillGroup }) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-[1fr_200px_120px]">
        <Input label="Title" name="title" defaultValue={group?.title} required />
        <Select label="Icon" name="icon" options={iconOptions} defaultValue={group?.icon ?? "code"} />
        <Input label="Order" name="sortOrder" type="number" defaultValue={group?.sortOrder ?? 0} />
      </div>
      <Textarea label="Skills" name="items" defaultValue={group?.items.join("\n")} rows={5} hint="One skill per line." />
    </>
  );
}

export default async function SkillsPage() {
  const groups = await getSkillGroups();
  return (
    <>
      <PageHeader title="Skills" description="Groups shown as cards in the Technical Skills section, lowest order first." />
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
