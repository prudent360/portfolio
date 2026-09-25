export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats a "YYYY-MM" string as "Jun 2025". */
export function formatMonth(value: string | null | undefined): string {
  if (!value) return "";
  const [year, month] = value.split("-");
  const index = Number(month) - 1;
  return MONTHS[index] ? `${MONTHS[index]} ${year}` : year ?? "";
}

export function formatRange(start: string | null, end: string | null, format: (v: string | null) => string = (v) => v ?? ""): string {
  const from = format(start);
  const to = end ? format(end) : start ? "Present" : "";
  if (from && to) return `${from} – ${to}`;
  return from || to;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Splits a comma or newline separated list into trimmed, non-empty entries. */
export function parseList(value: FormDataEntryValue | null, separator: RegExp = /[,\n]/): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function readingTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

export function fullName(first: string, last: string): string {
  return [first, last].filter(Boolean).join(" ");
}
