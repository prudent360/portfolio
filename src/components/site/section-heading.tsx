export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-3.5 text-center">
      <h2 className="font-display text-3xl font-semibold tracking-tight md:text-[44px]">{title}</h2>
      {subtitle && <p className="text-lg text-muted md:text-[19px]">{subtitle}</p>}
    </div>
  );
}
