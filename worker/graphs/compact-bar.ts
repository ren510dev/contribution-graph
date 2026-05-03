import type { GraphTheme } from "./themes";
import type { ContributionDay } from "./types";
import { MONTH_NAMES } from "../constants";

export function renderCompactBarSvg(
  days: ContributionDay[],
  totalContributions: number,
  theme: GraphTheme,
  username: string,
): string {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  const weeklyData: { label: string; count: number }[] = [];
  let weekStart = "";
  let weekCount = 0;

  for (const day of sorted) {
    const d = new Date(day.date + "T00:00:00");
    if (d.getDay() === 0 && weekCount > 0) {
      weeklyData.push({ label: weekStart, count: weekCount });
      weekCount = 0;
    }
    if (weekCount === 0) weekStart = day.date;
    weekCount += day.count;
  }
  if (weekCount > 0) weeklyData.push({ label: weekStart, count: weekCount });

  const w = 840;
  const h = 200;
  const padL = 24;
  const padR = 24;
  const padT = 48;
  const padB = 40;
  const graphW = w - padL - padR;
  const graphH = h - padT - padB;

  const maxWeek = Math.max(...weeklyData.map((d) => d.count), 1);
  const barW = Math.max(Math.floor(graphW / weeklyData.length) - 2, 3);

  const seenMonths = new Set<string>();
  const MIN_LABEL_GAP = 28;
  let lastLabelX = -MIN_LABEL_GAP;
  const monthLabels = weeklyData
    .map((week, i) => {
      const d = new Date(week.label + "T00:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (seenMonths.has(key)) return "";
      seenMonths.add(key);
      const x = padL + i * (barW + 2);
      if (x - lastLabelX < MIN_LABEL_GAP) return "";
      lastLabelX = x;
      return `<text x="${x}" y="${h - 14}" fill="${theme.subtext}" font-size="9" font-family="Inter,system-ui,sans-serif">${MONTH_NAMES[d.getMonth()]}</text>`;
    })
    .join("");

  const bars = weeklyData
    .map((week, i) => {
      const bh = Math.max((week.count / maxWeek) * graphH, 1);
      const x = padL + i * (barW + 2);
      const y = padT + graphH - bh;
      const opacity = 0.35 + (week.count / maxWeek) * 0.65;
      return `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" rx="2" fill="${theme.line}" opacity="${opacity.toFixed(2)}"><title>Week of ${week.label}: ${week.count}</title></rect>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" rx="10" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1"/>
  <text x="${padL}" y="30" fill="${theme.text}" font-size="14" font-weight="600" font-family="Inter,system-ui,sans-serif">${totalContributions.toLocaleString()} contributions</text>
  <text x="${w - padR}" y="30" fill="${theme.subtext}" font-size="11" font-family="Inter,system-ui,sans-serif" text-anchor="end">@${username}</text>
  <line x1="${padL}" y1="${padT + graphH}" x2="${padL + graphW}" y2="${padT + graphH}" stroke="${theme.border}" stroke-width="0.5"/>
  ${bars}
  ${monthLabels}
</svg>`;
}
