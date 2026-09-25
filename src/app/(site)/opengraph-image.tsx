import { getSettings } from "@/lib/data";
import { OG_SIZE, ogCard } from "@/lib/og";
import { fullName } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Portfolio preview";

export default async function Image() {
  const s = await getSettings();
  const name = fullName(s.firstName, s.lastName);
  return ogCard({
    eyebrow: s.role || "Portfolio",
    title: s.headline || name,
    footer: [name, s.footerTagline].filter(Boolean).join("  ·  "),
  });
}
