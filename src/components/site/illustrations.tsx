/** SVG artwork from the portfolio design. Decorative unless labelled. */

export function PipelineDiagram({ className }: { className?: string }) {
  const mono = "var(--font-jetbrains-mono), monospace";
  return (
    <svg viewBox="0 0 560 460" className={className} role="img" aria-label="Diagram of a data pipeline: sources flow through ingestion into a warehouse, are transformed, and power dashboards">
      <circle cx="300" cy="230" r="200" fill="#E8ECFB" />
      <path d="M150 118 C 200 118, 200 230, 238 230" fill="none" stroke="#2B4ACB" strokeWidth="2" strokeDasharray="5 5" />
      <path d="M150 230 L 238 230" fill="none" stroke="#2B4ACB" strokeWidth="2" strokeDasharray="5 5" />
      <path d="M150 342 C 200 342, 200 230, 238 230" fill="none" stroke="#2B4ACB" strokeWidth="2" strokeDasharray="5 5" />
      <path d="M346 230 L 392 230" fill="none" stroke="#2B4ACB" strokeWidth="2.5" />
      <path d="M392 230 C 420 230, 420 128, 440 128" fill="none" stroke="#2B4ACB" strokeWidth="2.5" />
      <path d="M392 230 C 420 230, 420 332, 440 332" fill="none" stroke="#2B4ACB" strokeWidth="2.5" />
      {[["GA4 events", 92], ["App / CRM", 204], ["CSV / Excel", 316]].map(([label, y]) => (
        <g key={label}>
          <rect x="30" y={y} width="120" height="52" rx="10" fill="#FFFFFF" stroke="#D5DAE3" />
          <text x="90" y={Number(y) + 32} textAnchor="middle" fontFamily={mono} fontSize="14" fill="#15171C">{label}</text>
        </g>
      ))}
      <ellipse cx="292" cy="178" rx="54" ry="16" fill="#3B5BDB" />
      <rect x="238" y="178" width="108" height="104" fill="#2B4ACB" />
      <ellipse cx="292" cy="282" rx="54" ry="16" fill="#2B4ACB" />
      <ellipse cx="292" cy="178" rx="54" ry="16" fill="#5C78E6" />
      <path d="M238 214 C 238 230, 346 230, 346 214" fill="none" stroke="#8DA2F0" strokeWidth="1.5" />
      <path d="M238 248 C 238 264, 346 264, 346 248" fill="none" stroke="#8DA2F0" strokeWidth="1.5" />
      <text x="292" y="312" textAnchor="middle" fontFamily={mono} fontSize="13" fill="#15171C">BigQuery</text>
      <rect x="376" y="214" width="32" height="32" rx="8" fill="#D9772B" />
      <text x="392" y="236" textAnchor="middle" fontFamily={mono} fontSize="13" fontWeight="500" fill="#FFFFFF">SQL</text>
      <rect x="440" y="80" width="100" height="96" rx="12" fill="#FFFFFF" stroke="#D5DAE3" />
      <rect x="456" y="140" width="12" height="22" rx="2" fill="#8DA2F0" />
      <rect x="474" y="124" width="12" height="38" rx="2" fill="#5C78E6" />
      <rect x="492" y="108" width="12" height="54" rx="2" fill="#2B4ACB" />
      <rect x="510" y="118" width="12" height="44" rx="2" fill="#5C78E6" />
      <rect x="456" y="92" width="44" height="6" rx="3" fill="#D5DAE3" />
      <text x="490" y="198" textAnchor="middle" fontFamily={mono} fontSize="13" fill="#15171C">Power BI</text>
      <rect x="440" y="284" width="100" height="96" rx="12" fill="#FFFFFF" stroke="#D5DAE3" />
      <polyline points="454,356 474,340 492,346 510,318 526,326" fill="none" stroke="#2B4ACB" strokeWidth="2.5" strokeLinejoin="round" />
      <polyline points="510,318 526,300" fill="none" stroke="#D9772B" strokeWidth="2.5" strokeDasharray="4 4" />
      <rect x="456" y="296" width="44" height="6" rx="3" fill="#D5DAE3" />
      <text x="490" y="402" textAnchor="middle" fontFamily={mono} fontSize="13" fill="#15171C">Forecasts</text>
      <circle cx="120" cy="40" r="6" fill="#D9772B" />
      <circle cx="138" cy="40" r="6" fill="#2B4ACB" />
      <circle cx="520" cy="440" r="7" fill="#8DA2F0" />
      <path d="M470 30 l10 16 l-20 0 z" fill="none" stroke="#2B4ACB" strokeWidth="1.5" />
    </svg>
  );
}

export function CornerShapes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 180" className={className} aria-hidden="true">
      <circle cx="24" cy="44" r="34" fill="none" stroke="#5C78E6" strokeWidth="2" />
      <rect x="120" y="10" width="70" height="70" fill="#F2A36B" />
      <path d="M120 80 L 120 150 L 190 150 Z" fill="#2B4ACB" />
      <path d="M52 80 L 120 80 L 52 148 Z" fill="none" stroke="#D9772B" strokeWidth="2" />
      <circle cx="246" cy="66" r="8" fill="#2B4ACB" />
      <path d="M0 158 L 50 158 L 30 180 L 0 180 Z" fill="#5C78E6" />
    </svg>
  );
}

export const THUMBNAILS = ["flow", "chart", "grid"] as const;
export type Thumbnail = (typeof THUMBNAILS)[number];

export function ProjectThumbnail({ kind }: { kind: string }) {
  const common = { viewBox: "0 0 378 200", className: "h-full w-full", preserveAspectRatio: "xMidYMid meet", "aria-hidden": true } as const;
  if (kind === "chart") {
    return (
      <svg {...common}>
        {[160, 120, 80, 40].map((y) => <path key={y} d={`M30 ${y} H 348`} stroke="#2A3563" strokeWidth="1" />)}
        <polyline points="30,140 60,120 90,130 120,96 150,108 180,78 210,92 240,64" fill="none" stroke="#8DA2F0" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M240 64 L 270 76 L 300 50 L 330 60 L 348 40 L 348 88 L 330 100 L 300 92 L 270 112 L 240 64 Z" fill="#3B4A86" opacity="0.6" />
        <polyline points="240,64 270,94 300,70 330,80 348,64" fill="none" stroke="#F2A36B" strokeWidth="2.5" strokeDasharray="5 4" />
        <circle cx="240" cy="64" r="4.5" fill="#FFFFFF" />
      </svg>
    );
  }
  if (kind === "grid") {
    const bars: [number, number, number, string][] = [
      [50, 140, 24, "#5C78E6"], [84, 124, 40, "#5C78E6"], [118, 116, 48, "#8DA2F0"], [152, 132, 32, "#5C78E6"],
      [186, 108, 56, "#F2A36B"], [220, 128, 36, "#5C78E6"], [254, 120, 44, "#8DA2F0"], [288, 136, 28, "#5C78E6"],
    ];
    return (
      <svg {...common}>
        {[[30, 60, "#FFFFFF"], [141, 52, "#FFFFFF"], [252, 44, "#F2A36B"]].map(([x, w, fill]) => (
          <g key={x}>
            <rect x={x} y="28" width="96" height="52" rx="8" fill="#2A3563" />
            <rect x={Number(x) + 12} y="42" width="40" height="6" rx="3" fill="#8DA2F0" />
            <rect x={Number(x) + 12} y="56" width={w} height="12" rx="3" fill={String(fill)} />
          </g>
        ))}
        <rect x="30" y="96" width="318" height="80" rx="8" fill="#2A3563" />
        {bars.map(([x, y, h, fill]) => <rect key={x} x={x} y={y} width="22" height={h} rx="2" fill={fill} />)}
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="36" y="44" width="80" height="32" rx="6" fill="#2A3563" />
      <rect x="36" y="124" width="80" height="32" rx="6" fill="#2A3563" />
      <path d="M116 60 C 150 60, 150 100, 170 100" stroke="#8DA2F0" strokeWidth="2" fill="none" strokeDasharray="4 4" />
      <path d="M116 140 C 150 140, 150 100, 170 100" stroke="#8DA2F0" strokeWidth="2" fill="none" strokeDasharray="4 4" />
      <ellipse cx="200" cy="80" rx="30" ry="9" fill="#5C78E6" />
      <rect x="170" y="80" width="60" height="44" fill="#3B5BDB" />
      <ellipse cx="200" cy="124" rx="30" ry="9" fill="#3B5BDB" />
      <ellipse cx="200" cy="80" rx="30" ry="9" fill="#7C93EC" />
      <path d="M230 100 L 262 100" stroke="#F2A36B" strokeWidth="2.5" />
      <rect x="262" y="64" width="80" height="72" rx="8" fill="#2A3563" />
      <rect x="276" y="106" width="10" height="18" rx="2" fill="#8DA2F0" />
      <rect x="292" y="94" width="10" height="30" rx="2" fill="#5C78E6" />
      <rect x="308" y="82" width="10" height="42" rx="2" fill="#F2A36B" />
    </svg>
  );
}
