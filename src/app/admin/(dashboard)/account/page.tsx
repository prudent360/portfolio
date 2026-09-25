import type { Metadata } from "next";
import { changePassword } from "@/app/admin/actions/auth";
import { ActionForm, Input, SubmitButton } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <>
      <PageHeader title="Account" />
      <Panel title="Change password">
        <ActionForm action={changePassword} resetOnSuccess className="flex max-w-[420px] flex-col gap-5">
          <Input label="Current password" name="current" type="password" autoComplete="current-password" required />
          <Input label="New password" name="next" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required hint={`At least ${MIN_PASSWORD_LENGTH} characters. A passphrase of several random words works well.`} />
          <Input label="Confirm new password" name="confirm" type="password" autoComplete="new-password" required />
          <SubmitButton pendingText="Updating…">Update password</SubmitButton>
        </ActionForm>
      </Panel>
    </>
  );
}
