import { Hono } from "hono";
import { getTheme, themes } from "./themes";
import { renderCalendarSvg } from "./calendar";
import { renderActivityLineSvg } from "./activity-line";
import { renderStatsBarSvg } from "./stats-bar";
import { renderCompactBarSvg } from "./compact-bar";
import { renderStreakSvg } from "./streak";
import { renderHeatmapRingSvg } from "./heatmap-ring";
import { renderLanguagesSvg, aggregateLanguages } from "./languages";
import { renderProfileCardSvg } from "./profile-card";
import { parseContributionDays, parseTotalContributions, buildWeeks } from "../parse";
import type { GitHubProfile, GitHubRepo } from "../types";
import {
  UA,
  GITHUB_BASE,
  GITHUB_API_BASE,
  USERNAME_REGEX,
  EVENTS_PER_PAGE,
  SVG_CACHE_MAX_AGE,
} from "../constants";

async function fetchContributions(username: string, year?: string) {
  const url = year
    ? `${GITHUB_BASE}/users/${username}/contributions?to=${year}-12-31`
    : `${GITHUB_BASE}/users/${username}/contributions`;

  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) return null;

  const html = await res.text();
  const days = parseContributionDays(html);
  const total = parseTotalContributions(html);
  const weeks = buildWeeks(days);
  return { days, total, weeks };
}

async function fetchProfile(username: string): Promise<GitHubProfile | null> {
  const res = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
    headers: { "User-Agent": UA, Accept: "application/vnd.github.v3+json" },
  });
  if (!res.ok) return null;
  return res.json() as Promise<GitHubProfile>;
}

async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    `${GITHUB_API_BASE}/users/${username}/repos?per_page=${EVENTS_PER_PAGE}&sort=pushed`,
    { headers: { "User-Agent": UA, Accept: "application/vnd.github.v3+json" } },
  );
  if (!res.ok) return [];
  return res.json() as Promise<GitHubRepo[]>;
}

const GRAPH_TYPES = [
  "calendar",
  "activity-line",
  "stats-bar",
  "compact-bar",
  "streak",
  "heatmap-ring",
  "languages",
  "profile-card",
] as const;
type GraphType = (typeof GRAPH_TYPES)[number];

function isGraphType(value: string): value is GraphType {
  return (GRAPH_TYPES as readonly string[]).includes(value);
}

const NEEDS_REPOS = new Set<GraphType>(["languages", "profile-card"]);
const NEEDS_PROFILE = new Set<GraphType>(["profile-card"]);

const SVG_HEADERS = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": `public, max-age=${SVG_CACHE_MAX_AGE}`,
};

export const graphRoute = new Hono()
  .get("/themes", (c) => {
    return c.json(
      Object.values(themes).map((t) => ({
        id: t.id,
        name: t.name,
        bg: t.bg,
        text: t.text,
        line: t.line,
        levels: t.levels,
      })),
    );
  })

  .get(String.raw`/:username/:type{.+\.svg}`, async (c) => {
    const username = c.req.param("username") ?? "";
    const rawType = (c.req.param("type") ?? "").replace(/\.svg$/, "");
    const themeId = c.req.query("theme") ?? "bordeaux";
    const year = c.req.query("year");

    if (!USERNAME_REGEX.test(username)) {
      return c.text("Invalid username", 400);
    }

    if (!isGraphType(rawType)) {
      return c.text(`Invalid graph type. Available: ${GRAPH_TYPES.join(", ")}`, 400);
    }

    const graphType: GraphType = rawType;
    const theme = getTheme(themeId);

    const [data, repos, profile] = await Promise.all([
      fetchContributions(username, year || undefined),
      NEEDS_REPOS.has(graphType) ? fetchRepos(username) : Promise.resolve([]),
      NEEDS_PROFILE.has(graphType) ? fetchProfile(username) : Promise.resolve(null),
    ]);

    if (!data && graphType !== "languages" && graphType !== "profile-card") {
      return new Response("Failed to fetch contribution data", {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const langs = repos.length > 0 ? aggregateLanguages(repos) : [];

    if (!data) {
      const svg =
        graphType === "languages"
          ? renderLanguagesSvg(langs, theme, username)
          : renderProfileCardSvg(
              {
                login: profile?.login ?? username,
                name: profile?.name ?? null,
                bio: profile?.bio ?? null,
                publicRepos: profile?.public_repos ?? 0,
                followers: profile?.followers ?? 0,
                following: profile?.following ?? 0,
                totalContributions: 0,
                topLanguages: langs.slice(0, 6),
              },
              theme,
            );
      return new Response(svg, { headers: SVG_HEADERS });
    }

    let svg: string;
    switch (graphType) {
      case "calendar":
        svg = renderCalendarSvg(data.weeks, data.total, theme, username);
        break;
      case "activity-line":
        svg = renderActivityLineSvg(data.days, theme, username);
        break;
      case "stats-bar":
        svg = renderStatsBarSvg(data.days, data.total, theme, username);
        break;
      case "compact-bar":
        svg = renderCompactBarSvg(data.days, data.total, theme, username);
        break;
      case "streak":
        svg = renderStreakSvg(data.days, theme, username);
        break;
      case "heatmap-ring":
        svg = renderHeatmapRingSvg(data.days, data.total, theme, username);
        break;
      case "languages":
        svg = renderLanguagesSvg(langs, theme, username);
        break;
      case "profile-card":
        svg = renderProfileCardSvg(
          {
            login: profile?.login ?? username,
            name: profile?.name ?? null,
            bio: profile?.bio ?? null,
            publicRepos: profile?.public_repos ?? 0,
            followers: profile?.followers ?? 0,
            following: profile?.following ?? 0,
            totalContributions: data.total,
            topLanguages: langs.slice(0, 6),
          },
          theme,
        );
        break;
    }

    return new Response(svg, { headers: SVG_HEADERS });
  });
