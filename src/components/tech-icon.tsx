import type { ResolvedIcon } from "@/lib/tech-icons";
import { SkillIcon } from "./icons";

/** Relative luminance check so near-white brand colours stay visible on light backgrounds. */
function readable(hex: string): string {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6 ? "#15171C" : `#${hex}`;
}

/** Renders a resolved tech icon. Decorative: the skill name is always shown next to it. */
export function TechIcon({ icon, className = "size-4" }: { icon: ResolvedIcon; className?: string }) {
  if (icon.kind === "path") {
    return (
      <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill={readable(icon.hex)} aria-hidden="true">
        <path d={icon.path} />
      </svg>
    );
  }
  if (icon.kind === "img") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon.src} alt="" className={`shrink-0 object-contain ${className}`} />;
  }
  return <SkillIcon name={icon.key} className={`shrink-0 text-accent ${className}`} />;
}
