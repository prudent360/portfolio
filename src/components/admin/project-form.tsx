import { ActionForm, Checkbox, FileField, Input, Select, SubmitButton, Textarea } from "@/components/admin/forms";
import { Panel } from "@/components/admin/ui";
import { WysiwygEditor } from "@/components/admin/wysiwyg-editor";
import { GalleryField } from "@/components/admin/gallery-field";
import { LinksField } from "@/components/admin/links-field";
import { EMBED_PROVIDERS } from "@/lib/embed";
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
      <Panel title="Case study" description="Optional. A case study, embed or screenshots give the project its own page, linked from its card. Cover the problem, your approach, the stack and the results.">
        <WysiwygEditor name="body" label="Case study" defaultValue={project?.body} />
      </Panel>
      <Panel title="Links">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Live demo URL" name="liveUrl" type="url" defaultValue={project?.liveUrl ?? ""} placeholder="https://" />
          <Input label="GitHub URL" name="githubUrl" type="url" defaultValue={project?.githubUrl ?? ""} placeholder="https://github.com/…" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-ink">More links</p>
          <p className="text-[13px] text-muted">Optional extras shown next to Live demo and GitHub, such as a dataset, notebook, report or article.</p>
          <LinksField defaultValue={project?.links} />
        </div>
      </Panel>
      <Panel title="Interactive embed" description="Optional. Show a live dashboard or app on the project page that visitors can click through.">
        <Textarea
          label="Public embed link or iframe code"
          name="embedUrl"
          defaultValue={project?.embedUrl ?? ""}
          rows={2}
          placeholder="https://app.powerbi.com/view?r=…"
          hint={`Supported: ${EMBED_PROVIDERS.map((p) => p.name).join(", ")}.`}
        />
        <details className="rounded-lg border border-edge bg-panel px-4 py-3 text-[14px] text-body">
          <summary className="cursor-pointer font-semibold text-ink">Where do I get the link?</summary>
          <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5">
            <li><strong>Power BI:</strong> open the report in the Power BI service, then File, Embed report, Publish to web. Copy the link. This makes the report and its data public, so only use it for personal or anonymised data.</li>
            <li><strong>Tableau Public:</strong> Share, then copy the embed code.</li>
            <li><strong>Looker Studio:</strong> File, Embed report, turn on embedding, copy the embed URL.</li>
            <li><strong>Streamlit:</strong> paste your app&apos;s <code>.streamlit.app</code> address.</li>
            <li><strong>Others:</strong> use the tool&apos;s share or embed option and paste the link or the iframe code.</li>
          </ul>
        </details>
      </Panel>
      <Panel title="Screenshots" description="Optional gallery for the project page. Useful for dashboards that can't be made public.">
        <GalleryField name="gallery" defaultValue={project?.gallery} />
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
