import type { GraphTheme } from "./themes";
import type { ContributionDay } from "./types";

export function renderStatsBarSvg(
  days: ContributionDay[],
  totalContributions: number,
  theme: GraphTheme,
  username: string,
): string {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  const dowCounts = [0, 0, 0, 0, 0, 0, 0];
  const dowLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (const day of sorted) {
    const wd = new Date(day.date + "T00:00:00").getDay();
    dowCounts[wd] += day.count;
  }
  const maxDow = Math.max(...dowCounts, 1);
  const bestDowIdx = dowCounts.indexOf(Math.max(...dowCounts));

  const activeDays = sorted.filter((d) => d.count > 0).length;
  const totalDays = sorted.length;
  const activePct = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

  const avgPerDay =
    activeDays > 0 ? (sorted.reduce((s, d) => s + d.count, 0) / activeDays).toFixed(1) : "0";

  const busiestDay = sorted.reduce(
    (best, d) => (d.count > best.count ? d : best),
    sorted[0] || { date: "-", count: 0 },
  );

  const w = 840;
  const h = 240;
  const pad = 28;

  const metrics = [
    { label: "Total", value: totalContributions.toLocaleString() },
    { label: "Active Days", value: `${activeDays} (${activePct}%)` },
    { label: "Daily Avg", value: avgPerDay },
    { label: "Best Day", value: `${busiestDay.count}` },
    { label: "Most Active", value: dowLabels[bestDowIdx] },
  ];
  const metricW = (w - pad * 2) / metrics.length;
  const metricY = 70;
  const metricItems = metrics
    .map((m, i) => {
      const x = pad + i * metricW + metricW / 2;
      const divider =
        i < metrics.length - 1
          ? `<line x1="${pad + (i + 1) * metricW}" y1="${metricY - 22}" x2="${pad + (i + 1) * metricW}" y2="${metricY + 18}" stroke="${theme.border}" stroke-width="0.5"/>`
          : "";
      return `<text x="${x}" y="${metricY - 4}" text-anchor="middle" fill="${theme.text}" font-size="18" font-weight="700" font-family="Inter,system-ui,sans-serif">${m.value}</text>
      <text x="${x}" y="${metricY + 14}" text-anchor="middle" fill="${theme.subtext}" font-size="9" font-family="Inter,system-ui,sans-serif">${m.label}</text>
      ${divider}`;
    })
    .join("");

  const barY = 130;
  const barH = 60;
  const barAreaW = w - pad * 2;
  const cellW = barAreaW / 7;

  const dowBars = dowCounts
    .map((count, i) => {
      const intensity = count / maxDow;
      const bh = Math.max(intensity * barH, 2);
      const x = pad + i * cellW + cellW * 0.15;
      const bw = cellW * 0.7;
      const y = barY + barH - bh;
      const isBest = i === bestDowIdx;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="${isBest ? theme.line : theme.point}" opacity="${isBest ? 1 : 0.45}"/>
      <text x="${x + bw / 2}" y="${barY + barH + 16}" fill="${theme.subtext}" font-size="10" font-family="Inter,system-ui,sans-serif" text-anchor="middle">${dowLabels[i]}</text>
      ${isBest ? `<text x="${x + bw / 2}" y="${y - 6}" fill="${theme.line}" font-size="9" font-weight="600" font-family="Inter,system-ui,sans-serif" text-anchor="middle">${count}</text>` : ""}`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" rx="10" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1"/>
  <text x="${pad}" y="30" fill="${theme.text}" font-size="14" font-weight="600" font-family="Inter,system-ui,sans-serif">Contribution Insights</text>
  <text x="${w - pad}" y="30" fill="${theme.subtext}" font-size="11" font-family="Inter,system-ui,sans-serif" text-anchor="end">@${username}</text>
  <line x1="${pad}" y1="42" x2="${w - pad}" y2="42" stroke="${theme.border}" stroke-width="0.5"/>
  ${metricItems}
  <line x1="${pad}" y1="${barY - 10}" x2="${w - pad}" y2="${barY - 10}" stroke="${theme.border}" stroke-width="0.5"/>
  ${dowBars}
</svg>`;
}
