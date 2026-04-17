import type { GraphTheme } from "./themes";

export interface LangStat {
  name: string;
  count: number;
  color: string;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Lua: "#000080",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Scala: "#c22d40",
  Zig: "#ec915c",
  Nix: "#7e7eff",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  Jupyter: "#DA5B0B",
  MDX: "#fcb32c",
};

function getLangColor(name: string): string {
  return LANG_COLORS[name] ?? "#8b8b8b";
}

export function renderLanguagesSvg(langs: LangStat[], theme: GraphTheme, username: string): string {
  if (langs.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280"><rect width="480" height="280" rx="10" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1"/><text x="240" y="140" fill="${theme.text}" text-anchor="middle" font-family="Inter,system-ui,sans-serif">No language data</text></svg>`;
  }

  const w = 480;
  const h = 320;
  const cx = 140;
  const cy = 170;
  const outerR = 100;
  const innerR = 60;
  const total = langs.reduce((s, l) => s + l.count, 0);

  let angle = -Math.PI / 2;
  const segments = langs.map((lang) => {
    const pct = lang.count / total;
    const startAngle = angle;
    const sweep = pct * 2 * Math.PI;
    angle += sweep;
    const endAngle = angle;
    const largeArc = sweep > Math.PI ? 1 : 0;

    const x1o = cx + outerR * Math.cos(startAngle);
    const y1o = cy + outerR * Math.sin(startAngle);
    const x2o = cx + outerR * Math.cos(endAngle);
    const y2o = cy + outerR * Math.sin(endAngle);
    const x1i = cx + innerR * Math.cos(endAngle);
    const y1i = cy + innerR * Math.sin(endAngle);
    const x2i = cx + innerR * Math.cos(startAngle);
    const y2i = cy + innerR * Math.sin(startAngle);

    return `<path d="M${x1o},${y1o} A${outerR},${outerR} 0 ${largeArc},1 ${x2o},${y2o} L${x1i},${y1i} A${innerR},${innerR} 0 ${largeArc},0 ${x2i},${y2i} Z" fill="${lang.color}" opacity="0.85"><title>${lang.name}: ${lang.count} repos (${Math.round(pct * 100)}%)</title></path>`;
  });

  const legendX = 270;
  const legendY = 60;
  const legendItems = langs.slice(0, 10).map((lang, i) => {
    const pct = Math.round((lang.count / total) * 100);
    const y = legendY + i * 24;
    return `<circle cx="${legendX}" cy="${y}" r="5" fill="${lang.color}"/>
    <text x="${legendX + 14}" y="${y + 1}" fill="${theme.text}" font-size="12" font-family="Inter,system-ui,sans-serif" dominant-baseline="central">${lang.name}</text>
    <text x="${w - 20}" y="${y + 1}" fill="${theme.subtext}" font-size="11" font-family="Inter,system-ui,sans-serif" dominant-baseline="central" text-anchor="end">${pct}%</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" rx="10" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1"/>
  <text x="20" y="30" fill="${theme.text}" font-size="14" font-weight="600" font-family="Inter,system-ui,sans-serif">Languages</text>
  <text x="${w - 20}" y="30" fill="${theme.subtext}" font-size="11" font-family="Inter,system-ui,sans-serif" text-anchor="end">@${username}</text>
  ${segments.join("")}
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="${theme.text}" font-size="22" font-weight="700" font-family="Inter,system-ui,sans-serif">${langs.length}</text>
  <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="${theme.subtext}" font-size="10" font-family="Inter,system-ui,sans-serif">languages</text>
  ${legendItems.join("")}
</svg>`;
}

export function aggregateLanguages(repos: { language: string | null }[]): LangStat[] {
  const map = new Map<string, number>();
  for (const repo of repos) {
    if (repo.language) {
      map.set(repo.language, (map.get(repo.language) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count, color: getLangColor(name) }))
    .sort((a, b) => b.count - a.count);
}
