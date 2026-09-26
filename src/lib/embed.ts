/** Hosts whose public embed links can be shown in an iframe on project pages. */
export const EMBED_PROVIDERS: { name: string; match: (host: string) => boolean }[] = [
  { name: "Power BI", match: (h) => h === "app.powerbi.com" || h.endsWith(".powerbi.com") },
  { name: "Tableau Public", match: (h) => h === "public.tableau.com" },
  { name: "Looker Studio", match: (h) => h === "lookerstudio.google.com" || h === "datastudio.google.com" },
  { name: "Streamlit", match: (h) => h.endsWith(".streamlit.app") },
  { name: "Observable", match: (h) => h === "observablehq.com" || h.endsWith(".observablehq.cloud") },
  { name: "Hex", match: (h) => h === "app.hex.tech" },
  { name: "Datawrapper", match: (h) => h === "datawrapper.dwcdn.net" },
  { name: "Flourish", match: (h) => h === "flo.uri.sh" || h === "public.flourish.studio" },
  { name: "Google Sheets", match: (h) => h === "docs.google.com" },
];

export type ParsedEmbed = { url: string; provider: string };

/**
 * Accepts either a URL or pasted iframe code and returns a safe https embed URL,
 * or an error message when the host is not supported.
 */
export function parseEmbed(input: string): { embed: ParsedEmbed | null; error?: string } {
  const raw = input.trim();
  if (!raw) return { embed: null };
  const fromIframe = raw.match(/src\s*=\s*["']([^"']+)["']/i)?.[1];
  const candidate = (fromIframe ?? raw).replace(/&amp;/g, "&");

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { embed: null, error: "The embed link is not a valid URL. Paste the link or the whole iframe code." };
  }
  if (url.protocol !== "https:") return { embed: null, error: "Embed links must start with https://" };

  const provider = EMBED_PROVIDERS.find((p) => p.match(url.hostname.toLowerCase()));
  if (!provider) {
    return { embed: null, error: `Embeds from ${url.hostname} aren't supported. Use a public link from ${EMBED_PROVIDERS.map((p) => p.name).join(", ")}.` };
  }
  // Streamlit apps need ?embed=true to render without their own chrome.
  if (provider.name === "Streamlit" && !url.searchParams.has("embed")) url.searchParams.set("embed", "true");
  return { embed: { url: url.toString(), provider: provider.name } };
}

export function embedProvider(url: string | null | undefined): string | null {
  if (!url) return null;
  return parseEmbed(url).embed?.provider ?? null;
}
