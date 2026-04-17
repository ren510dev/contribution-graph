import { Hono } from "hono";
import { parseContributionDays, parseTotalContributions, buildWeeks, buildMonths } from "./parse";
import type { GitHubProfile, GitHubEvent } from "./types";

function availableYears(createdAt: string) {
  const cur = new Date().getFullYear();
  const joinYear = new Date(createdAt).getFullYear();
  return Array.from({ length: cur - joinYear + 1 }, (_, i) => {
    const y = cur - i;
    return { label: `${y}`, from: `${y}-01-01`, to: `${y}-12-31` };
  });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatEvent(e: GitHubEvent) {
  const repo = e.repo.name;
  const time = e.created_at;
  const p = e.payload;
  const repoUrl = `https://github.com/${repo}`;

  switch (e.type) {
    case "PushEvent": {
      const commits = (p.commits as { message: string }[]) || [];
      return {
        type: "push",
        repo,
        time,
        url: repoUrl,
        description: `Pushed ${commits.length} commit${commits.length === 1 ? "" : "s"}`,
        detail: commits[0]?.message || "",
      };
    }
    case "PullRequestEvent": {
      const pr = p.pull_request as { number: number; title: string; html_url: string } | undefined;
      return {
        type: "pr",
        repo,
        time,
        url: pr?.html_url || repoUrl,
        description: `${capitalize(String(p.action))} pull request #${pr?.number}`,
        detail: pr?.title || "",
      };
    }
    case "IssuesEvent": {
      const issue = p.issue as { number: number; title: string; html_url: string } | undefined;
      return {
        type: "issue",
        repo,
        time,
        url: issue?.html_url || repoUrl,
        description: `${capitalize(String(p.action))} issue #${issue?.number}`,
        detail: issue?.title || "",
      };
    }
    case "CreateEvent": {
      const refPart = p.ref ? " " + (p.ref as string) : "";
      return {
        type: "create",
        repo,
        time,
        url: repoUrl,
        description: `Created ${String(p.ref_type)}${refPart}`,
        detail: "",
      };
    }
    case "ForkEvent":
      return {
        type: "fork",
        repo,
        time,
        url: (p.forkee as { html_url: string })?.html_url || repoUrl,
        description: `Forked to ${(p.forkee as { full_name: string })?.full_name}`,
        detail: "",
      };
    case "IssueCommentEvent": {
      const issue = p.issue as { number: number; html_url: string } | undefined;
      return {
        type: "comment",
        repo,
        time,
        url: issue?.html_url || repoUrl,
        description: `Commented on #${issue?.number}`,
        detail: ((p.comment as { body: string })?.body || "").slice(0, 100),
      };
    }
    case "ReleaseEvent": {
      const release = p.release as { tag_name: string; html_url: string } | undefined;
      return {
        type: "release",
        repo,
        time,
        url: release?.html_url || repoUrl,
        description: `${capitalize(String(p.action))} release ${release?.tag_name}`,
        detail: "",
      };
    }
    case "DeleteEvent":
      return {
        type: "delete",
        repo,
        time,
        url: repoUrl,
        description: `Deleted ${String(p.ref_type)} ${p.ref as string}`,
        detail: "",
      };
    default:
      return {
        type: e.type.replace("Event", "").toLowerCase(),
        repo,
        time,
        url: repoUrl,
        description: e.type.replace("Event", ""),
        detail: "",
      };
  }
}

interface ActivityCounts {
  commits: number;
  pullRequests: number;
  issues: number;
  codeReviews: number;
}

function accumulateEventCounts(
  type: string,
  payload: GitHubEvent["payload"],
  counts: ActivityCounts,
) {
  switch (type) {
    case "PushEvent":
      counts.commits += (payload.commits as unknown[])?.length || 1;
      break;
    case "PullRequestEvent":
      counts.pullRequests++;
      break;
    case "PullRequestReviewEvent":
    case "PullRequestReviewCommentEvent":
    case "IssueCommentEvent":
      counts.codeReviews++;
      break;
    case "IssuesEvent":
      counts.issues++;
      break;
    default:
      break;
  }
}

function buildActivityOverview(events: GitHubEvent[], username: string) {
  const counts: ActivityCounts = { commits: 0, pullRequests: 0, issues: 0, codeReviews: 0 };
  const repoMap = new Map<string, number>();
  const orgSet = new Set<string>();

  for (const e of events) {
    const repo = e.repo.name;
    repoMap.set(repo, (repoMap.get(repo) ?? 0) + 1);

    const owner = repo.split("/")[0];
    if (owner && owner.toLowerCase() !== username.toLowerCase()) {
      orgSet.add(owner);
    }

    accumulateEventCounts(e.type, e.payload, counts);
  }

  const { commits, pullRequests, issues, codeReviews } = counts;

  const total = commits + pullRequests + issues + codeReviews;
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

  const contributedRepos = [...repoMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nameWithOwner, count]) => ({
      nameWithOwner,
      url: `https://github.com/${nameWithOwner}`,
      count,
    }));

  const remainingRepoCount = Math.max(0, repoMap.size - 5);

  return {
    activityOverview: {
      commits: pct(commits),
      pullRequests: pct(pullRequests),
      issues: pct(issues),
      codeReviews: pct(codeReviews),
    },
    contributedRepos,
    contributedOrgs: [...orgSet],
    remainingRepoCount,
  };
}

type UserRepo = { full_name: string; fork: boolean; owner: { login: string; type: string } };

function buildYearOverview(days: ReturnType<typeof parseContributionDays>) {
  const dowCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const day of days) {
    dowCounts[new Date(day.date + "T00:00:00").getDay()] += day.count;
  }
  const weekdayTotal = dowCounts[1] + dowCounts[2] + dowCounts[3] + dowCounts[4] + dowCounts[5];
  const total = weekdayTotal + dowCounts[0] + dowCounts[6] || 1;
  const commits = Math.round(((weekdayTotal * 0.7) / total) * 100);
  const pullRequests = Math.round(((weekdayTotal * 0.15) / total) * 100);
  const issues = Math.round(((weekdayTotal * 0.05) / total) * 100);
  return { commits, pullRequests, issues, codeReviews: 100 - commits - pullRequests - issues };
}

function mergeRepoData(
  activity: ReturnType<typeof buildActivityOverview>,
  userRepos: UserRepo[],
  username: string,
) {
  const lc = username.toLowerCase();
  const allOrgs = new Set(activity.contributedOrgs);
  for (const repo of userRepos) {
    if (repo.owner.type === "Organization" && repo.owner.login.toLowerCase() !== lc) {
      allOrgs.add(repo.owner.login);
    }
  }
  const repoMap = new Map(activity.contributedRepos.map((r) => [r.nameWithOwner, r]));
  for (const repo of userRepos) {
    if (!repoMap.has(repo.full_name) && repo.owner.login.toLowerCase() !== lc) {
      repoMap.set(repo.full_name, {
        nameWithOwner: repo.full_name,
        url: `https://github.com/${repo.full_name}`,
        count: 1,
      });
    }
  }
  const contributedRepos = [...repoMap.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  return {
    contributedOrgs: [...allOrgs],
    contributedRepos,
    remainingRepoCount: Math.max(0, repoMap.size - 5),
  };
}

const UA = "contribution-graph/1.0";

export const githubRoute = new Hono().get("/:username", async (c) => {
  const username = c.req.param("username");
  const year = c.req.query("year");

  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
    return c.json({ error: "Invalid username" }, 400);
  }

  try {
    const contribUrl = year
      ? `https://github.com/users/${username}/contributions?to=${year}-12-31`
      : `https://github.com/users/${username}/contributions`;

    const ghApiHeaders = { "User-Agent": UA, Accept: "application/vnd.github.v3+json" };

    const [contribRes, profileRes, eventsRes, reposRes] = await Promise.all([
      fetch(contribUrl, { headers: { "User-Agent": UA, Accept: "text/html" } }),
      fetch(`https://api.github.com/users/${username}`, { headers: ghApiHeaders }),
      fetch(`https://api.github.com/users/${username}/events/public?per_page=30`, {
        headers: ghApiHeaders,
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed&type=all`, {
        headers: ghApiHeaders,
      }),
    ]);

    if (!profileRes.ok) {
      let error = `GitHub API error: ${profileRes.status}`;
      if (profileRes.status === 404) error = "User not found";
      if (profileRes.status === 403)
        error = "GitHub API rate limit exceeded. Please wait a moment and try again.";
      const status = profileRes.status === 404 ? 404 : 502;
      return c.json({ error }, status);
    }

    const contribHtml = contribRes.ok ? await contribRes.text() : "";
    const profile: GitHubProfile = await profileRes.json();
    const events: GitHubEvent[] = eventsRes.ok ? await eventsRes.json() : [];
    const userRepos: {
      full_name: string;
      fork: boolean;
      owner: { login: string; type: string };
    }[] = reposRes.ok ? await reposRes.json() : [];

    const days = parseContributionDays(contribHtml);
    const activity = buildActivityOverview(events, username);
    const merged = mergeRepoData(activity, userRepos, username);
    const yearOverview = buildYearOverview(days);

    return c.json({
      profile: {
        login: profile.login,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        company: profile.company,
        blog: profile.blog,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        createdAt: profile.created_at,
      },
      contributions: {
        totalContributions: parseTotalContributions(contribHtml),
        weeks: buildWeeks(days),
        months: buildMonths(days),
        days,
      },
      activityOverview: yearOverview,
      contributedRepos: merged.contributedRepos,
      contributedOrgs: merged.contributedOrgs,
      remainingRepoCount: merged.remainingRepoCount,
      events: events
        .filter((ev) => ev.type !== "WatchEvent")
        .slice(0, 20)
        .map(formatEvent),
      availableYears: availableYears(profile.created_at),
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch GitHub data", detail: String(error) }, 500);
  }
});
