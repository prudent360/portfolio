/** Stroke icons used across the site and admin. */
type IconProps = { className?: string };

function Svg({ className = "size-5", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

export const SKILL_ICONS = {
  ingest: { label: "Ingestion", paths: <><path d="M4 7h10" /><path d="M4 12h16" /><path d="M4 17h7" /><path d="M17 4l3 3-3 3" /><path d="M14 14l3 3-3 3" /></> },
  storage: { label: "Database", paths: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></> },
  transform: { label: "Filter", paths: <path d="M3 5h18l-7 8v6l-4 2v-8z" /> },
  analytics: { label: "Chart", paths: <><path d="M3 20h18" /><path d="M6 16l4-5 3 3 5-7" /><path d="M18 7h-3" /><path d="M18 7v3" /></> },
  code: { label: "Code", paths: <><path d="M8 8l-4 4 4 4" /><path d="M16 8l4 4-4 4" /><path d="M14 5l-4 14" /></> },
  cloud: { label: "Cloud", paths: <path d="M7 18h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.1 9.2 4.5 4.5 0 0 0 7 18z" /> },
  brain: { label: "Machine learning", paths: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3" /><path d="M12 18v3" /><path d="M3 12h3" /><path d="M18 12h3" /><path d="M5.6 5.6l2.1 2.1" /><path d="M16.3 16.3l2.1 2.1" /><path d="M5.6 18.4l2.1-2.1" /><path d="M16.3 7.7l2.1-2.1" /></> },
  tools: { label: "Tools", paths: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" /> },
} as const;

export type SkillIconKey = keyof typeof SKILL_ICONS;
export const WARM_ICONS: SkillIconKey[] = ["analytics", "brain"];

export function SkillIcon({ name, className }: IconProps & { name: string }) {
  const icon = SKILL_ICONS[name as SkillIconKey] ?? SKILL_ICONS.code;
  return <Svg className={className}>{icon.paths}</Svg>;
}

export const BriefcaseIcon = (p: IconProps) => <Svg {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Svg>;
export const CapIcon = (p: IconProps) => <Svg {...p}><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" /></Svg>;
export const MailIcon = (p: IconProps) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Svg>;
export const ChevronLeft = (p: IconProps) => <Svg {...p}><path d="M15 18l-6-6 6-6" /></Svg>;
export const ChevronRight = (p: IconProps) => <Svg {...p}><path d="M9 18l6-6-6-6" /></Svg>;
export const ArrowLeft = (p: IconProps) => <Svg {...p}><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></Svg>;
export const ArrowUpRight = (p: IconProps) => <Svg {...p}><path d="M7 17L17 7" /><path d="M8 7h9v9" /></Svg>;
export const MenuIcon = (p: IconProps) => <Svg {...p}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></Svg>;
export const DownloadIcon = (p: IconProps) => <Svg {...p}><path d="M12 4v11" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" /></Svg>;
export const HomeIcon = (p: IconProps) => <Svg {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></Svg>;
export const UserIcon = (p: IconProps) => <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Svg>;
export const LayersIcon = (p: IconProps) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></Svg>;
export const FolderIcon = (p: IconProps) => <Svg {...p}><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></Svg>;
export const PenIcon = (p: IconProps) => <Svg {...p}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13 7l4 4" /></Svg>;
export const KeyIcon = (p: IconProps) => <Svg {...p}><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9" /><path d="M16 7l3 3" /></Svg>;
export const LogoutIcon = (p: IconProps) => <Svg {...p}><path d="M15 4h4v16h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></Svg>;
export const ExternalIcon = (p: IconProps) => <Svg {...p}><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></Svg>;
export const PlusIcon = (p: IconProps) => <Svg {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>;
export const AwardIcon = (p: IconProps) => <Svg {...p}><circle cx="12" cy="9" r="6" /><path d="M8.5 14.2L7 22l5-3 5 3-1.5-7.8" /></Svg>;
export const ImageIcon = (p: IconProps) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></Svg>;
