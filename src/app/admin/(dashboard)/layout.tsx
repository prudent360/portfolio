import Link from "next/link";
import { logout } from "@/app/admin/actions/auth";
import { AdminNav } from "@/components/admin/nav";
import { ExternalIcon, LogoutIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:gap-8 lg:py-8">
      <aside className="flex shrink-0 flex-col gap-4 rounded-[14px] border border-edge bg-white p-3 lg:sticky lg:top-8 lg:h-[calc(100dvh-4rem)] lg:w-64 lg:p-4">
        <div className="flex items-center justify-between px-2 lg:flex-col lg:items-start lg:gap-1 lg:pb-3">
          <Link href="/admin" className="font-display text-xl font-semibold text-accent">Portfolio admin</Link>
          <p className="truncate text-xs text-muted">{session.email}</p>
        </div>
        <AdminNav />
        <div className="flex gap-2 lg:mt-auto lg:flex-col">
          <Link href="/" target="_blank" className="flex h-11 items-center gap-3 rounded-lg px-3.5 text-[15px] font-semibold text-body hover:bg-page">
            <ExternalIcon className="size-[18px]" /> View site
          </Link>
          <form action={logout}>
            <button type="submit" className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3.5 text-[15px] font-semibold text-body hover:bg-page">
              <LogoutIcon className="size-[18px]" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex min-w-0 grow flex-col gap-6 pb-16">{children}</main>
    </div>
  );
}
