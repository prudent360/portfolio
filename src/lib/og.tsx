import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const fontDir = path.join(process.cwd(), "src", "assets", "fonts");
let fonts: Promise<{ name: string; data: Buffer; weight: 500 | 600; style: "normal" }[]> | undefined;

function loadFonts() {
  fonts ??= Promise.all([
    readFile(path.join(fontDir, "SpaceGrotesk-SemiBold.ttf")).then((data) => ({ name: "Space Grotesk", data, weight: 600 as const, style: "normal" as const })),
    readFile(path.join(fontDir, "Manrope-Medium.ttf")).then((data) => ({ name: "Manrope", data, weight: 500 as const, style: "normal" as const })),
  ]);
  return fonts;
}

/** Branded 1200x630 link-preview card in the site's colours. */
export async function ogCard({ eyebrow, title, footer }: { eyebrow: string; title: string; footer: string }) {
  const titleSize = title.length > 70 ? 56 : title.length > 40 ? 68 : 80;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#F5F6F8", fontFamily: "Manrope", position: "relative" }}>
        <div style={{ position: "absolute", right: -150, top: -150, width: 420, height: 420, borderRadius: 9999, background: "#E8ECFB", display: "flex" }} />
        <div style={{ position: "absolute", right: 150, top: 72, width: 72, height: 72, background: "#F2A36B", display: "flex" }} />
        <div style={{ position: "absolute", right: 78, top: 144, width: 72, height: 72, background: "#2B4ACB", display: "flex" }} />
        <div style={{ position: "absolute", right: 238, top: 160, width: 16, height: 16, borderRadius: 9999, background: "#2B4ACB", display: "flex" }} />
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#2B4ACB", textTransform: "uppercase" }}>{eyebrow}</div>
        <div style={{ display: "flex", fontFamily: "Space Grotesk", fontSize: titleSize, lineHeight: 1.08, color: "#15171C", maxWidth: 820, letterSpacing: -1.5 }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: "#555B66" }}>
          <div style={{ width: 14, height: 14, borderRadius: 9999, background: "#2B4ACB", display: "flex" }} />
          {footer}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await loadFonts() },
  );
}
