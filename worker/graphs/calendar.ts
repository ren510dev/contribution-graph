import type { GraphTheme } from "./themes";
import type { ContributionWeek } from "./types";
import { MONTH_NAMES } from "../constants";

export function renderCalendarSvg(
  weeks: ContributionWeek[],
  totalContributions: number,
  theme: GraphTheme,
  username: string,
): string {
  const cellSize = 11;
  const cellGap = 3;
  const step = cellSize + cellGap;
  const padL = 28;
  const labelWidth = 40;
  const padR = 32;
  const headerH = 42;
  const gridTopY = headerH + 22;
  const graphW = labelWidth + weeks.length * step;
  const w = padL + graphW + padR;
  const footerH = 28;
  const h = gridTopY + step * 7 + footerH;

  const dayLabels = ["Mon", "Wed", "Fri"];
  const dayRows = [1, 3, 5];

  const months: { name: string; weekIdx: number }[] = [];
  const seen = new Set<string>();
  weeks.forEach((week, wi) => {
    for (const day of week.contributionDays) {
      const d = new Date(day.date + "T00:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!seen.has(key)) {
        seen.add(key);
        months.push({ name: MONTH_NAMES[d.getMonth()], weekIdx: wi });
      }
    }
  });

  const ox = padL;

  const cells = weeks
    .map((week, wi) =>
      week.contributionDays
        .map((day) => {
          const wd = day.weekday ?? new Date(day.date + "T00:00:00").getDay();
          return `<rect x="${ox + labelWidth + wi * step}" y="${gridTopY + wd * step}" width="${cellSize}" height="${cellSize}" rx="2" fill="${theme.levels[day.level] || theme.levels[0]}"><title>${day.count} contributions on ${day.date}</title></rect>`;
        })
        .join(""),
    )
    .join("");

  const MIN_LABEL_GAP = 28;
  let lastMonthLabelX = -(MIN_LABEL_GAP * 2);
  const monthLabels = months
    .map((m) => {
      const x = ox + labelWidth + m.weekIdx * step;
      if (x - lastMonthLabelX < MIN_LABEL_GAP) return "";
      lastMonthLabelX = x;
      return `<text x="${x}" y="${gridTopY - 8}" fill="${theme.subtext}" font-size="10" font-family="Inter,system-ui,sans-serif">${m.name}</text>`;
    })
    .join("");

  const dayLabelsSvg = dayLabels
    .map(
      (label, i) =>
        `<text x="${ox}" y="${gridTopY + dayRows[i] * step + cellSize / 2}" fill="${theme.subtext}" font-size="10" font-family="Inter,system-ui,sans-serif" dominant-baseline="central">${label}</text>`,
    )
    .join("");

  const legendY = h - 16;
  const moreTextW = 28;
  const legendBlockW = 5 * (cellSize + 2) + moreTextW + 30;
  const legendStartX = w - padR - legendBlockW;
  const legend = theme.levels
    .map(
      (color, i) =>
        `<rect x="${legendStartX + 30 + i * (cellSize + 2)}" y="${legendY - cellSize}" width="${cellSize}" height="${cellSize}" rx="2" fill="${color}"/>`,
    )
    .join("");
  const lessX = legendStartX;
  const moreX = legendStartX + 30 + 5 * (cellSize + 2) + 4;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" rx="10" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1"/>
  <text x="${padL}" y="28" fill="${theme.text}" font-size="14" font-weight="600" font-family="Inter,system-ui,sans-serif">${totalContributions.toLocaleString()} contributions</text>
  <text x="${w - padR}" y="28" fill="${theme.subtext}" font-size="11" font-family="Inter,system-ui,sans-serif" text-anchor="end">@${username}</text>
  ${monthLabels}
  ${dayLabelsSvg}
  ${cells}
  <text x="${lessX}" y="${legendY}" fill="${theme.subtext}" font-size="9" font-family="Inter,system-ui,sans-serif">Less</text>
  ${legend}
  <text x="${moreX}" y="${legendY}" fill="${theme.subtext}" font-size="9" font-family="Inter,system-ui,sans-serif">More</text>
</svg>`;
}
