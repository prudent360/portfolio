import type { Metadata } from "next";
import { saveProfile } from "@/app/admin/actions/profile";
import { ActionForm, FileField, Input, SubmitButton, Textarea } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Profile" description="Your name, hero copy, about text and contact details." />
      <ActionForm action={saveProfile} className="flex flex-col gap-6">
        <Panel title="Identity">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="First name" name="firstName" defaultValue={s.firstName} required />
            <Input label="Surname" name="lastName" defaultValue={s.lastName} />
            <Input label="Logo text" name="brand" defaultValue={s.brand} hint="Shown top left, for example “Ifiok.”" />
            <Input label="Role" name="role" defaultValue={s.role} />
            <Input label="Location" name="location" defaultValue={s.location} className="sm:col-span-2" />
          </div>
          <FileField label="Profile photo" name="photo" current={s.photoUrl} removeName="removePhoto" />
        </Panel>
        <Panel title="Hero">
          <Input label="Eyebrow" name="eyebrow" defaultValue={s.eyebrow} hint="Small line above the headline." />
          <Input label="Headline" name="headline" defaultValue={s.headline} required />
          <Textarea label="Intro" name="intro" defaultValue={s.intro} rows={3} />
          <Textarea
            label="Proof points"
            name="highlights"
            defaultValue={s.highlights.map((h) => `${h.value} | ${h.label}`).join("\n")}
            rows={4}
            placeholder={"5+ | years in data\n30+ | pipelines shipped"}
            hint="Up to 4 lines, each as “number | label”. Shown under the hero buttons. Use real figures only; leave empty to hide."
          />
        </Panel>
        <Panel title="About">
          <Textarea label="About me" name="about" defaultValue={s.about} rows={8} hint="Leave a blank line between paragraphs." />
          <FileField label="CV / résumé" name="resume" accept="application/pdf" current={s.resumeUrl} removeName="removeResume" hint="PDF, up to 4 MB. Adds a Download CV button to the contact section." />
        </Panel>
        <Panel title="Contact">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Email" name="email" type="email" defaultValue={s.email} />
            <Input label="LinkedIn URL" name="linkedinUrl" type="url" defaultValue={s.linkedinUrl} placeholder="https://www.linkedin.com/in/…" />
            <Input label="GitHub URL" name="githubUrl" type="url" defaultValue={s.githubUrl} placeholder="https://github.com/…" />
            <Input label="Contact eyebrow" name="contactEyebrow" defaultValue={s.contactEyebrow} />
          </div>
          <Input label="Contact heading" name="contactHeading" defaultValue={s.contactHeading} />
          <Textarea label="Contact text" name="contactText" defaultValue={s.contactText} rows={2} />
        </Panel>
        <Panel title="Footer and SEO">
          <Input label="Footer tagline" name="footerTagline" defaultValue={s.footerTagline} />
          <Textarea label="Search description" name="seoDescription" defaultValue={s.seoDescription} rows={2} hint="Shown in search results and link previews." />
        </Panel>
        <SubmitButton>Save profile</SubmitButton>
      </ActionForm>
    </>
  );
}
