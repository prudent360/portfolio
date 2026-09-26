import type { Metadata } from "next";
import { createCertification, deleteCertification, updateCertification } from "@/app/admin/actions/experience";
import { ActionForm, DeleteButton, FileField, Input, SubmitButton } from "@/components/admin/forms";
import { EmptyState, PageHeader, Panel } from "@/components/admin/ui";
import type { Certification } from "@/db/schema";
import { getCertifications } from "@/lib/data";

export const metadata: Metadata = { title: "Certifications" };

function Fields({ cert }: { cert?: Certification }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Input label="Certification" name="name" defaultValue={cert?.name} required placeholder="Google Cloud Professional Data Engineer" className="sm:col-span-2" />
      <Input label="Issuer" name="issuer" defaultValue={cert?.issuer} placeholder="Google Cloud" />
      <Input label="Credential ID" name="credentialId" defaultValue={cert?.credentialId} hint="Optional." />
      <Input label="Issued" name="issueDate" type="month" defaultValue={cert?.issueDate ?? ""} />
      <Input label="Expires" name="expiryDate" type="month" defaultValue={cert?.expiryDate ?? ""} hint="Leave empty if it doesn't expire." />
      <Input label="Credential link" name="credentialUrl" type="url" defaultValue={cert?.credentialUrl ?? ""} placeholder="https://www.credly.com/badges/…" hint="Shown as “View credential”." className="sm:col-span-2" />
      <div className="sm:col-span-2">
        <FileField label="Badge or issuer logo" name="logo" current={cert?.logoUrl} removeName="removeLogo" hint="Optional. A square PNG or JPG works best." />
      </div>
      <Input label="Order" name="sortOrder" type="number" defaultValue={cert?.sortOrder ?? 0} hint="Sorted by issue date automatically; this breaks ties." />
    </div>
  );
}

export default async function CertificationsPage() {
  const certs = await getCertifications();
  return (
    <>
      <PageHeader title="Certifications" description="Shown after Education, newest first." />
      {certs.length === 0 && <EmptyState>No certifications yet. Add your first one below.</EmptyState>}
      {certs.map((cert) => (
        <Panel key={cert.id} title={cert.name}>
          <ActionForm action={updateCertification.bind(null, cert.id)}>
            <Fields cert={cert} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SubmitButton />
              <DeleteButton action={deleteCertification.bind(null, cert.id)} />
            </div>
          </ActionForm>
        </Panel>
      ))}
      <Panel title="Add a certification">
        <ActionForm action={createCertification} resetOnSuccess>
          <Fields />
          <SubmitButton pendingText="Adding…">Add certification</SubmitButton>
        </ActionForm>
      </Panel>
    </>
  );
}
