export function SectionHeading({ title, subtitle, align = "center" }: { title: string; subtitle?: string; align?: "center" | "left" }) {
  return (
    <div className={`flex flex-col gap-3.5 ${align === "center" ? "items-center text-center" : ""}`}>
      <h2 className="font-display text-3xl font-semibold tracking-tight md:text-[44px]">{title}</h2>
      {subtitle && <p className="text-lg text-muted md:text-[19px]">{subtitle}</p>}
    </div>
  );
}
