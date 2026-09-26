import { ActionForm, Checkbox, FileField, Input, Select, SubmitButton, Textarea } from "@/components/admin/forms";
import { Panel } from "@/components/admin/ui";
import { WysiwygEditor } from "@/components/admin/wysiwyg-editor";
import type { Project } from "@/db/schema";
import type { FormState } from "@/lib/validation";

const thumbnails = [
  { value: "flow", label: "Pipeline diagram" },
  { value: "chart", label: "Forecast chart" },
  { value: "grid", label: "Dashboard grid" },
];

export function ProjectForm({ action, project, categories }: { action: (s: FormState, f: FormData) => Promise<FormState>; project?: Project; categories: string[] }) {
  return (
    <ActionForm action={action} className="flex flex-col gap-6">
      <Panel title="Details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Title" name="title" defaultValue={project?.title} required className="sm:col-span-2" />
          <Input label="Category" name="category" defaultValue={project?.category} list="project-categories" hint="Used for the filter buttons, for example Pipelines." />
          <datalist id="project-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          <Input label="Slug" name="slug" defaultValue={project?.slug} hint="Leave empty to create one from the title." />
        </div>
        <Textarea label="Summary" name="description" defaultValue={project?.description} rows={3} required hint="Shown on the project card." />
        <Input label="Key result" name="outcome" defaultValue={project?.outcome} placeholder="Cut weekly reporting from 6 hours to 20 minutes" hint="Optional one-line outcome, highlighted on the card. Use real figures only." />
        <Input label="Tags" name="tags" defaultValue={project?.tags.join(", ")} hint="Comma separated, for example Python, BigQuery, SQL." />
      </Panel>
      <Panel title="Case study" description="Optional. When you write one, the project gets its own page and the card links to it. Cover the problem, your approach, the stack and the results.">
        <WysiwygEditor name="body" label="Case study" defaultValue={project?.body} />
      </Panel>
      <Panel title="Links">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Live demo URL" name="liveUrl" type="url" defaultValue={project?.liveUrl ?? ""} placeholder="https://" />
          <Input label="GitHub URL" name="githubUrl" type="url" defaultValue={project?.githubUrl ?? ""} placeholder="https://github.com/…" />
        </div>
      </Panel>
      <Panel title="Card image" description="Upload a screenshot, or leave empty to use one of the built-in illustrations.">
        <FileField label="Screenshot" name="image" current={project?.imageUrl} removeName="removeImage" />
        <Select label="Illustration" name="thumbnail" options={thumbnails} defaultValue={project?.thumbnail ?? "flow"} />
      </Panel>
      <Panel title="Visibility">
        <div className="grid gap-5 sm:grid-cols-[1fr_160px] sm:items-end">
          <div className="flex flex-col gap-4">
            <Checkbox label="Show on the site" name="published" defaultChecked={project?.published ?? true} />
            <Checkbox label="Feature this project" name="featured" defaultChecked={project?.featured ?? false} hint="Featured projects appear as large cards at the top of the section. Pick your one or two strongest." />
          </div>
          <Input label="Order" name="sortOrder" type="number" defaultValue={project?.sortOrder ?? 0} hint="Lowest first." />
        </div>
      </Panel>
      <SubmitButton>{project ? "Save project" : "Create project"}</SubmitButton>
    </ActionForm>
  );
}
