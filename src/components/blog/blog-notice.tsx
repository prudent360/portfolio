import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export function BlogNotice({
  text = "Data Engineering & Analytics Research — Written by Ifiokobong Akpan",
  linkHref = "/#about",
  linkLabel = "Learn about the author",
}: {
  text?: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="w-full border-b border-slate-200/80 bg-slate-50/70 py-2.5 px-4 text-xs font-medium text-slate-700">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2 px-2 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Sparkles className="size-3" />
          </span>
          <span className="truncate">{text}</span>
        </div>
        <Link
          href={linkHref}
          className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-dark transition-colors shrink-0"
        >
          {linkLabel} <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
