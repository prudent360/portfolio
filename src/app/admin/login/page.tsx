import type { Metadata } from "next";
import { login } from "@/app/admin/actions/auth";
import { ActionForm, Input, SubmitButton } from "@/components/admin/forms";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="flex w-full max-w-[400px] flex-col gap-6 rounded-[14px] border border-edge bg-white p-8">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted">Manage your portfolio content.</p>
        </div>
        <ActionForm action={login}>
          <Input label="Email" name="email" type="email" autoComplete="username" required />
          <Input label="Password" name="password" type="password" autoComplete="current-password" required />
          <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
        </ActionForm>
      </div>
    </div>
  );
}
