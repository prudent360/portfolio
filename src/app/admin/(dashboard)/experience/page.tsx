import type { Metadata } from "next";
import {
  createEducation, createExperience, deleteEducation, deleteExperience, updateEducation, updateExperience,
} from "@/app/admin/actions/experience";
import { ActionForm, Checkbox, DeleteButton, FileField, Input, SubmitButton, Textarea } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import type { Education, Experience } from "@/db/schema";
import { getEducation, getExperiences } from "@/lib/data";

export const metadata: Metadata = { title: "Experience" };

function ExperienceFields({ job }: { job?: Experience }) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Role" name="role" defaultValue={job?.role} required />
        <Input label="Company" name="company" defaultValue={job?.company} required />
        <Input label="Start month" name="startDate" type="month" defaultValue={job?.startDate ?? ""} />
        <Input label="End month" name="endDate" type="month" defaultValue={job?.endDate ?? ""} hint="Ignored when “Current role” is ticked." />
      </div>
      <Checkbox label="Current role" name="current" defaultChecked={job ? !job.endDate : false} hint="Shows “Present” as the end date." />
      <FileField label="Company logo" name="logo" current={job?.logoUrl} removeName="removeLogo" hint="Optional. A square PNG or JPG works best. Without one, the company's first letter is shown." />
      <Input label="Location" name="location" defaultValue={job?.location} placeholder="Remote, or Hull, UK" hint="Optional. Shown next to the dates." />
      <Textarea
        label="Achievements"
        name="description"
        defaultValue={job?.description}
        rows={4}
        placeholder={"Built a GA4 to BigQuery pipeline used by 5 teams\nCut weekly reporting time from 6 hours to 20 minutes"}
        hint="One achievement per line; each line shows as a bullet point, like on a CV. Start with a verb and include a result where you can."
      />
      <Input label="Order" name="sortOrder" type="number" defaultValue={job?.sortOrder ?? 0} className="max-w-[220px]" hint="Roles sort by date automatically. This only orders roles with the same dates." />
    </>
  );
}

function EducationFields({ item }: { item?: Education }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Input label="Degree" name="degree" defaultValue={item?.degree} required className="sm:col-span-2" />
      <div className="sm:col-span-2"><FileField label="Institution logo" name="logo" current={item?.logoUrl} removeName="removeLogo" hint="Optional. A square PNG or JPG works best." /></div>
      <Input label="Institution" name="institution" defaultValue={item?.institution} className="sm:col-span-2" />
      <Input label="Start year" name="startYear" inputMode="numeric" pattern="\d{4}" defaultValue={item?.startYear ?? ""} />
      <Input label="End year" name="endYear" inputMode="numeric" pattern="\d{4}" defaultValue={item?.endYear ?? ""} />
      <Input label="Order" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} hint="Sorted by year automatically; this breaks ties." />
    </div>
  );
}

export default async function ExperiencePage() {
  const [jobs, education] = await Promise.all([getExperiences(), getEducation()]);
  return (
    <>
      <PageHeader title="Experience and education" description="Shown in the Experience section, newest first." />
      <h2 className="font-display text-2xl font-semibold">Experience</h2>
      {jobs.map((job) => (
        <Panel key={job.id} title={`${job.role} · ${job.company}`}>
          <ActionForm action={updateExperience.bind(null, job.id)}>
            <ExperienceFields job={job} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SubmitButton />
              <DeleteButton action={deleteExperience.bind(null, job.id)} />
            </div>
          </ActionForm>
        </Panel>
      ))}
      <Panel title="Add experience">
        <ActionForm action={createExperience} resetOnSuccess>
          <ExperienceFields />
          <SubmitButton pendingText="Adding…">Add experience</SubmitButton>
        </ActionForm>
      </Panel>

      <h2 className="mt-4 font-display text-2xl font-semibold">Education</h2>
      {education.map((item) => (
        <Panel key={item.id} title={item.degree}>
          <ActionForm action={updateEducation.bind(null, item.id)}>
            <EducationFields item={item} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SubmitButton />
              <DeleteButton action={deleteEducation.bind(null, item.id)} />
            </div>
          </ActionForm>
        </Panel>
      ))}
      <Panel title="Add education">
        <ActionForm action={createEducation} resetOnSuccess>
          <EducationFields />
          <SubmitButton pendingText="Adding…">Add education</SubmitButton>
        </ActionForm>
      </Panel>
    </>
  );
}
