import "server-only";
import * as simpleIcons from "simple-icons";
import { SKILL_ICONS } from "@/components/icons";

/**
 * Tech-stack icons. A stored icon reference is one of:
 *   "si:<slug>"  Simple Icons brand icon (CC0)
 *   "dev:<name>" bundled Devicon logo (MIT, public/icons/devicon)
 *   "gen:<key>"  generic stroke icon from components/icons
 *   "none"       explicitly no icon
 *   a URL        an image uploaded in the admin
 */
export type ResolvedIcon =
  | { kind: "path"; ref: string; title: string; path: string; hex: string }
  | { kind: "img"; ref: string; title: string; src: string }
  | { kind: "generic"; ref: string; title: string; key: string };

type SimpleIcon = { title: string; slug: string; hex: string; path: string };

const DEVICONS: Record<string, string> = {
  azure: "Microsoft Azure",
  amazonwebservices: "Amazon Web Services",
  microsoftsqlserver: "Microsoft SQL Server",
};

/** Names people commonly write that differ from the icon title. */
const ALIASES: Record<string, string> = {
  bigquery: "si:googlebigquery",
  ga4: "si:googleanalytics",
  "google analytics 4": "si:googleanalytics",
  gtm: "si:googletagmanager",
  "node.js": "si:nodedotjs",
  nodejs: "si:nodedotjs",
  postgres: "si:postgresql",
  aws: "dev:amazonwebservices",
  azure: "dev:azure",
  "sql server": "dev:microsoftsqlserver",
  mssql: "dev:microsoftsqlserver",
  gcp: "si:googlecloud",
  "scikit-learn": "si:scikitlearn",
  sklearn: "si:scikitlearn",
  airflow: "si:apacheairflow",
  spark: "si:apachespark",
  pyspark: "si:apachespark",
  kafka: "si:apachekafka",
  "looker studio": "si:looker",
  sheets: "si:googlesheets",
};

let cache: { list: SimpleIcon[]; bySlug: Map<string, SimpleIcon>; byTitle: Map<string, SimpleIcon> } | null = null;

function index() {
  if (!cache) {
    const list = Object.values(simpleIcons as unknown as Record<string, SimpleIcon>).filter((icon) => icon && typeof icon === "object" && "slug" in icon);
    cache = {
      list,
      bySlug: new Map(list.map((icon) => [icon.slug, icon])),
      byTitle: new Map(list.map((icon) => [normalize(icon.title), icon])),
    };
  }
  return cache;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function isUrl(ref: string): boolean {
  return ref.startsWith("/uploads/") || /^https:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(ref);
}

export function resolveIconRef(ref: string | null | undefined, title = ""): ResolvedIcon | null {
  if (!ref || ref === "none") return null;
  if (isUrl(ref)) return { kind: "img", ref, title: title || "Custom icon", src: ref };
  const [source, id] = ref.split(":", 2);
  if (source === "si") {
    const icon = index().bySlug.get(id);
    return icon ? { kind: "path", ref, title: icon.title, path: icon.path, hex: icon.hex } : null;
  }
  if (source === "dev" && DEVICONS[id]) return { kind: "img", ref, title: DEVICONS[id], src: `/icons/devicon/${id}.svg` };
  if (source === "gen" && id in SKILL_ICONS) return { kind: "generic", ref, title: SKILL_ICONS[id as keyof typeof SKILL_ICONS].label, key: id };
  return null;
}

/** Best-effort icon for a skill name such as "Python", "Google BigQuery" or "Streamlit apps". */
export function guessIconRef(name: string): string | null {
  const n = normalize(name);
  if (ALIASES[n]) return ALIASES[n];
  const { byTitle } = index();
  if (byTitle.has(n)) return `si:${byTitle.get(n)!.slug}`;
  // Try the parts of "GA4 & Google Tag Manager" or "ARIMA / SARIMA".
  for (const part of n.split(/\s*(?:&|,|\/|\band\b)\s*/)) {
    if (ALIASES[part]) return ALIASES[part];
    if (byTitle.has(part)) return `si:${byTitle.get(part)!.slug}`;
  }
  // "Streamlit apps" -> Streamlit: longest icon title the name starts with (3+ characters).
  const words = n.split(" ");
  for (let len = Math.min(words.length - 1, 4); len >= 1; len--) {
    const prefix = words.slice(0, len).join(" ");
    if (prefix.length < 3) continue;
    if (ALIASES[prefix]) return ALIASES[prefix];
    if (byTitle.has(prefix)) return `si:${byTitle.get(prefix)!.slug}`;
  }
  return null;
}

/** Icon to show for a skill: the chosen one, or a guess when none was chosen. */
export function iconForSkill(name: string, ref?: string | null): ResolvedIcon | null {
  if (ref === "none") return null;
  return resolveIconRef(ref || guessIconRef(name), name);
}

/** Search used by the admin icon picker. */
export function searchIcons(query: string, limit = 48): ResolvedIcon[] {
  const q = normalize(query);
  const generic = Object.entries(SKILL_ICONS)
    .filter(([key, { label }]) => !q || key.includes(q) || label.toLowerCase().includes(q))
    .map(([key]) => resolveIconRef(`gen:${key}`)!);
  const dev = Object.entries(DEVICONS)
    .filter(([id, title]) => !q || id.includes(q.replace(/\s/g, "")) || title.toLowerCase().includes(q))
    .map(([id]) => resolveIconRef(`dev:${id}`)!);
  if (!q) return [...generic, ...dev];
  const alias = ALIASES[q] ? resolveIconRef(ALIASES[q]) : null;
  const matches = index()
    .list.filter((icon) => icon.slug.includes(q.replace(/[\s.]/g, "")) || normalize(icon.title).includes(q))
    .sort((a, b) => Number(!normalize(b.title).startsWith(q)) - Number(!normalize(a.title).startsWith(q)) || a.title.length - b.title.length)
    .slice(0, limit)
    .map((icon) => resolveIconRef(`si:${icon.slug}`)!);
  const seen = new Set<string>();
  return [alias, ...dev, ...matches, ...generic].filter((icon): icon is ResolvedIcon => {
    if (!icon || seen.has(icon.ref)) return false;
    seen.add(icon.ref);
    return true;
  }).slice(0, limit);
}
