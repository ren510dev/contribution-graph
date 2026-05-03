import { MONTH_NAMES } from "./constants";

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
  weekday?: number;
}

const LEVEL_COUNT: Record<number, number> = {
  0: 0,
  1: 2,
  2: 5,
  3: 8,
  4: 12,
};

export function parseContributionDays(html: string): ContributionDay[] {
  const days: ContributionDay[] = [];
  const cellRegex =
    /<td[^>]*?data-date="(\d{4}-\d{2}-\d{2})"[^>]*?data-level="(\d)"[^>]*?>[\s\S]*?<\/td>/g;
  const countRegex = /(\d+)\s+contribution/;

  let match;
  while ((match = cellRegex.exec(html)) !== null) {
    const date = match[1];
    const level = Number.parseInt(match[2], 10);
    const cellHtml = match[0];

    const countMatch = countRegex.exec(cellHtml);
    const count = countMatch ? Number.parseInt(countMatch[1], 10) : (LEVEL_COUNT[level] ?? 0);

    days.push({ date, count, level });
  }
  return days;
}

export function parseTotalContributions(html: string): number {
  const m = /([\d,]+)\s+contributions?\s+in\s+/.exec(html);
  return m ? Number.parseInt(m[1].replaceAll(",", ""), 10) : 0;
}

export function buildWeeks(days: ContributionDay[]): { contributionDays: ContributionDay[] }[] {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const weekMap = new Map<string, ContributionDay[]>();
  for (const day of sorted) {
    const d = new Date(day.date + "T00:00:00");
    const wd = d.getDay();
    const sun = new Date(d);
    sun.setDate(sun.getDate() - wd);
    const key = sun.toISOString().slice(0, 10);
    if (!weekMap.has(key)) weekMap.set(key, []);
    const week = weekMap.get(key);
    if (week) week.push({ ...day, weekday: wd });
  }
  return [...weekMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, contributionDays]) => ({ contributionDays }));
}

export function parseContributedSection(html: string): {
  repos: string[];
  orgs: string[];
  othersCount: number;
} {
  const orgs: string[] = [];
  const orgRegex = /org=([a-zA-Z0-9][a-zA-Z0-9._-]*)&/g;
  const seenOrgs = new Set<string>();
  let om;
  while ((om = orgRegex.exec(html)) !== null) {
    const org = om[1];
    if (!seenOrgs.has(org)) {
      seenOrgs.add(org);
      orgs.push(org);
    }
  }

  const repos: string[] = [];
  const idx = html.indexOf("Contributed to");
  if (idx === -1) return { repos, orgs, othersCount: 0 };
  const section = html.slice(idx, idx + 4000);

  const repoRegex = /data-hovercard-type="repository"[^>]*>([^<]+)<\/a>/g;
  let rm;
  while ((rm = repoRegex.exec(section)) !== null) {
    repos.push(rm[1].trim());
  }

  const othersMatch = /and (\d+) other/.exec(section);
  const othersCount = othersMatch ? Number.parseInt(othersMatch[1], 10) : 0;

  return { repos, orgs, othersCount };
}

export function buildMonths(days: ContributionDay[]): { name: string; firstDay: string }[] {
  const seen = new Set<string>();
  const months: { name: string; firstDay: string }[] = [];
  for (const day of days) {
    const d = new Date(day.date + "T00:00:00");
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) {
      seen.add(key);
      months.push({ name: MONTH_NAMES[d.getMonth()], firstDay: day.date });
    }
  }
  return months;
}
