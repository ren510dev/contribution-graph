import type { GraphTheme } from "./themes";
import type { ContributionDay } from "./types";

interface WeekBucket {
  count: number;
  level: number;
}

function getWeekLevel(pct: number): number {
  if (pct === 0) return 0;
  if (pct < 0.25) return 1;
  if (pct < 0.5) return 2;
  if (pct < 0.75) return 3;
  return 4;
}

export function renderHeatmapRingSvg(
  days: ContributionDay[],
  totalContributions: number,
  theme: GraphTheme,
  username: string,
): string {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  const weeks: WeekBucket[] = [];
  let weekCount = 0;
  for (let i = 0; i < sorted.length; i++) {
    weekCount += sorted[i].count;
    const wd = new Date(sorted[i].date + "T00:00:00").getDay();
    if (wd === 6 || i === sorted.length - 1) {
      weeks.push({ count: weekCount, level: 0 });
      weekCount = 0;
    }
  }

  const maxWeek = Math.max(...weeks.map((w) => w.count), 1);
  for (const w of weeks) {
    w.level = getWeekLevel(w.count / maxWeek);
  }

  const w = 360;
  const h = 360;
  const cx = w / 2;
  const cy = h / 2;
  const outerR = 145;
  const ringWidth = 28;
  const innerR = outerR - ringWidth;
  const totalSegments = weeks.length;

  const arcs = weeks
    .map((week, i) => {
      const startAngle = (i / totalSegments) * 2 * Math.PI - Math.PI / 2;
      const endAngle = ((i + 1) / totalSegments) * 2 * Math.PI - Math.PI / 2;
      const gap = 0.015;

      const x1 = cx + outerR * Math.cos(startAngle + gap);
      const y1 = cy + outerR * Math.sin(startAngle + gap);
      const x2 = cx + outerR * Math.cos(endAngle - gap);
      const y2 = cy + outerR * Math.sin(endAngle - gap);
      const x3 = cx + innerR * Math.cos(endAngle - gap);
      const y3 = cy + innerR * Math.sin(endAngle - gap);
      const x4 = cx + innerR * Math.cos(startAngle + gap);
      const y4 = cy + innerR * Math.sin(startAngle + gap);

      const color = theme.levels[week.level] || theme.levels[0];

      return `<path d="M${x1},${y1} A${outerR},${outerR} 0 0,1 ${x2},${y2} L${x3},${y3} A${innerR},${innerR} 0 0,0 ${x4},${y4} Z" fill="${color}"><title>Week ${i + 1}: ${week.count} contributions</title></path>`;
    })
    .join("");

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
  const seenMonths = new Set<number>();
  let dayIdx = 0;
  const monthLabels = weeks
    .map((_, i) => {
      const weekDayCount = i < weeks.length - 1 ? 7 : sorted.length - dayIdx;
      const firstDay = sorted[dayIdx];
      dayIdx += weekDayCount;
      if (!firstDay) return "";
      const d = new Date(firstDay.date + "T00:00:00");
      const monthKey = d.getMonth();
      if (seenMonths.has(monthKey)) return "";
      seenMonths.add(monthKey);
      const angle = (i / totalSegments) * 2 * Math.PI - Math.PI / 2;
      const labelR = outerR + 18;
      const x = cx + labelR * Math.cos(angle);
      const y = cy + labelR * Math.sin(angle);
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="${theme.subtext}" font-size="9" font-family="Inter,system-ui,sans-serif">${monthNames[monthKey]}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" rx="10" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1"/>
  ${arcs}
  ${monthLabels}
  <text x="${cx}" y="${cy - 22}" text-anchor="middle" fill="${theme.text}" font-size="12" font-weight="500" font-family="Inter,system-ui,sans-serif">Weekly Activity</text>
  <text x="${cx}" y="${cy + 6}" text-anchor="middle" fill="${theme.text}" font-size="30" font-weight="700" font-family="Inter,system-ui,sans-serif">${totalContributions.toLocaleString()}</text>
  <text x="${cx}" y="${cy + 24}" text-anchor="middle" fill="${theme.subtext}" font-size="10" font-family="Inter,system-ui,sans-serif">@${username}</text>
</svg>`;
}
