import { ActionForm, Checkbox, FileField, Input, SubmitButton, Textarea } from "@/components/admin/forms";
import { WysiwygEditor } from "@/components/admin/wysiwyg-editor";
import { Panel } from "@/components/admin/ui";
import type { Post } from "@/db/schema";
import type { FormState } from "@/lib/validation";

export function PostForm({ action, post }: { action: (s: FormState, f: FormData) => Promise<FormState>; post?: Post }) {
  return (
    <ActionForm action={action} className="flex flex-col gap-6">
      <Panel>
        <Input label="Title" name="title" defaultValue={post?.title} required />
        <WysiwygEditor name="content" defaultValue={post?.content} />
      </Panel>
      <Panel title="Listing">
        <Textarea label="Excerpt" name="excerpt" defaultValue={post?.excerpt} rows={2} hint="One or two sentences for the blog list and link previews." />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Tags" name="tags" defaultValue={post?.tags.join(", ")} hint="Comma separated." />
          <Input label="Slug" name="slug" defaultValue={post?.slug} hint="The web address. Leave empty to create one from the title." />
        </div>
        <FileField label="Cover image" name="cover" current={post?.coverUrl} removeName="removeCover" />
      </Panel>
      <Panel>
        <Checkbox label="Published" name="published" defaultChecked={post?.published ?? false} hint="Unticked posts stay as drafts and are hidden from the site." />
        <SubmitButton>{post ? "Save post" : "Create post"}</SubmitButton>
      </Panel>
    </ActionForm>
  );
}
