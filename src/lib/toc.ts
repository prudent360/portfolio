export type TocItem = {
  id: string;
  label: string;
  level: number;
  sub?: boolean;
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "") // remove html tags if any
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, "-");
}

export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const hashes = match[1];
    const rawText = match[2].trim();
    // remove markdown formatting like links, bold, code ticks
    const cleanText = rawText
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`]/g, "");
    
    const id = slugify(cleanText);
    const level = hashes.length;

    items.push({
      id,
      label: cleanText,
      level,
      sub: level === 3,
    });
  }

  return items;
}
