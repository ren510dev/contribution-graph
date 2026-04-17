import type { GraphTheme } from "./themes";
import type { ContributionDay } from "./types";

export function renderActivityLineSvg(
  days: ContributionDay[],
  theme: GraphTheme,
  username: string,
): string {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="280"><rect width="840" height="280" rx="10" fill="${theme.bg}"/><text x="420" y="140" fill="${theme.text}" text-anchor="middle" font-family="Inter,system-ui,sans-serif">No data</text></svg>`;
  }

  const w = 840;
  const h = 280;
  const padL = 60;
  const padR = 24;
  const padT = 50;
  const padB = 44;
  const graphW = w - padL - padR;
  const graphH = h - padT - padB;

  const maxCount = Math.max(...sorted.map((d) => d.count), 1);
  const yStep = Math.ceil(maxCount / 4);
  const yMax = yStep * 4;

  const points = sorted.map((day, i) => {
    const x = padL + (i / (sorted.length - 1)) * graphW;
    const y = padT + graphH - (day.count / yMax) * graphH;
    return { x, y, day };
  });

  const pathD = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
  const lastPoint = points.at(-1) ?? points[0];
  const areaD = `${pathD} L${lastPoint.x},${padT + graphH} L${points[0].x},${padT + graphH} Z`;

  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const val = i * yStep;
    const y = padT + graphH - (val / yMax) * graphH;
    return `<text x="${padL - 12}" y="${y + 4}" fill="${theme.subtext}" font-size="10" font-family="Inter,system-ui,sans-serif" text-anchor="end">${val}</text>
    <line x1="${padL}" y1="${y}" x2="${padL + graphW}" y2="${y}" stroke="${theme.border}" stroke-width="0.5" stroke-dasharray="4,4"/>`;
  }).join("");

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const seenMonths = new Set<string>();
  const xLabels = sorted
    .map((day, i) => {
      const d = new Date(day.date + "T00:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (seenMonths.has(key)) return "";
      seenMonths.add(key);
      const x = padL + (i / (sorted.length - 1)) * graphW;
      return `<text x="${x}" y="${h - 14}" fill="${theme.subtext}" font-size="10" font-family="Inter,system-ui,sans-serif" text-anchor="middle">${monthNames[d.getMonth()]}</text>`;
    })
    .join("");

  const topDays = [...points].sort((a, b) => b.day.count - a.day.count).slice(0, 5);
  const dots = topDays
    .map(
      (p) =>
        `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${theme.point}" stroke="${theme.bg}" stroke-width="2"/>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" rx="10" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1"/>
  <text x="${padL}" y="32" fill="${theme.text}" font-size="14" font-weight="600" font-family="Inter,system-ui,sans-serif">Contribution Activity</text>
  <text x="${w - padR}" y="32" fill="${theme.subtext}" font-size="11" font-family="Inter,system-ui,sans-serif" text-anchor="end">@${username}</text>
  ${yLabels}
  <path d="${areaD}" fill="${theme.area}" opacity="0.4"/>
  <path d="${pathD}" fill="none" stroke="${theme.line}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  ${dots}
  ${xLabels}
</svg>`;
}
