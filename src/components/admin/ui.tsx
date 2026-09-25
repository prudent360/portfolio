import Link from "next/link";
import { PlusIcon } from "@/components/icons";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="max-w-[640px] text-[15px] text-muted">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-[15px] font-semibold text-white hover:bg-accent-dark">
          <PlusIcon className="size-[18px]" /> {action.label}
        </Link>
      )}
    </div>
  );
}

export function Panel({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-[14px] border border-edge bg-white p-5 sm:p-7">
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && <h2 className="font-display text-xl font-semibold">{title}</h2>}
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Badge({ tone, children }: { tone: "green" | "grey"; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-xs ${tone === "green" ? "bg-emerald-50 text-emerald-800" : "bg-page text-muted"}`}>
      {children}
    </span>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[14px] border border-dashed border-edge-strong bg-white p-10 text-center text-muted">{children}</p>;
}
