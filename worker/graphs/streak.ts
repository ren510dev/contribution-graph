import type { GraphTheme } from "./themes";
import type { ContributionDay } from "./types";

function computeStreaks(days: ContributionDay[]) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let longestStart = "";
  let longestEnd = "";
  let tempStart = "";

  const today = new Date().toISOString().slice(0, 10);
  const dayMap = new Map(sorted.map((d) => [d.date, d.count]));

  const d = new Date(today + "T00:00:00");
  while (true) {
    const key = d.toISOString().slice(0, 10);
    const count = dayMap.get(key);
    if ((count ?? 0) > 0) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  for (const day of sorted) {
    if (day.count > 0) {
      if (tempStreak === 0) tempStart = day.date;
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestStart = tempStart;
        longestEnd = day.date;
      }
    } else {
      tempStreak = 0;
    }
  }

  const totalDays = sorted.filter((dd) => dd.count > 0).length;
  const totalContributions = sorted.reduce((s, dd) => s + dd.count, 0);

  return {
    currentStreak,
    longestStreak,
    longestStart,
    longestEnd,
    totalDays,
    totalContributions,
  };
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  const months = [
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
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function renderStreakSvg(
  days: ContributionDay[],
  theme: GraphTheme,
  username: string,
): string {
  const stats = computeStreaks(days);
  const w = 840;
  const h = 200;
  const padL = 24;
  const padR = 24;

  const cols = [
    {
      label: "Total Contributions",
      value: stats.totalContributions.toLocaleString(),
      sub: `${stats.totalDays} active days`,
    },
    {
      label: "Current Streak",
      value: `${stats.currentStreak}`,
      sub: stats.currentStreak > 0 ? "days" : "Start contributing!",
    },
    {
      label: "Longest Streak",
      value: `${stats.longestStreak}`,
      sub:
        stats.longestStreak > 0
          ? `${formatDateShort(stats.longestStart)} – ${formatDateShort(stats.longestEnd)}`
          : "-",
    },
  ];

  const innerW = w - padL - padR;
  const colW = innerW / 3;
  const cy = 105;

  const sections = cols
    .map((col, i) => {
      const cx = padL + colW * i + colW / 2;
      const divider =
        i < cols.length - 1
          ? `<line x1="${padL + colW * (i + 1)}" y1="52" x2="${padL + colW * (i + 1)}" y2="${h - 36}" stroke="${theme.border}" stroke-width="0.5"/>`
          : "";
      return `
        <text x="${cx}" y="${cy - 20}" text-anchor="middle" fill="${theme.text}" font-size="36" font-weight="700" font-family="Inter,system-ui,sans-serif">${col.value}</text>
        <text x="${cx}" y="${cy + 8}" text-anchor="middle" fill="${theme.subtext}" font-size="11" font-weight="500" font-family="Inter,system-ui,sans-serif">${col.label}</text>
        <text x="${cx}" y="${cy + 26}" text-anchor="middle" fill="${theme.subtext}" font-size="10" font-family="Inter,system-ui,sans-serif" opacity="0.6">${col.sub}</text>
        ${divider}`;
    })
    .join("");

  const footer =
    stats.currentStreak > 0
      ? `<text x="${w / 2}" y="${h - 14}" text-anchor="middle" fill="${theme.line}" font-size="11" font-family="Inter,system-ui,sans-serif" font-weight="500">🔥 Keep it going, @${username}!</text>`
      : `<text x="${w / 2}" y="${h - 14}" text-anchor="middle" fill="${theme.subtext}" font-size="11" font-family="Inter,system-ui,sans-serif">@${username}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" rx="10" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1"/>
  <text x="${w / 2}" y="32" text-anchor="middle" fill="${theme.text}" font-size="13" font-weight="600" font-family="Inter,system-ui,sans-serif">Contribution Streak</text>
  ${sections}
  ${footer}
</svg>`;
}
