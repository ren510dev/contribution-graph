import { Hono } from "hono";
import {
  parseContributionDays,
  parseTotalContributions,
  buildWeeks,
  buildMonths,
  parseContributedSection,
} from "./parse";
import type { GitHubProfile, GitHubEvent } from "./types";
import {
  UA,
  GITHUB_BASE,
  GITHUB_API_BASE,
  USERNAME_REGEX,
  EVENTS_PER_PAGE,
  ACTIVITY_CUTOFF_DAYS,
} from "./constants";

function availableYears(createdAt: string) {
  const cur = new Date().getFullYear();
  const joinYear = new Date(createdAt).getFullYear();
  return Array.from({ length: cur - joinYear + 1 }, (_, i) => {
    const y = cur - i;
    return { label: `${y}`, from: `${y}-01-01`, to: `${y}-12-31` };
  });
}

interface ActivityRepo {
  name: string;
  url: string;
  date: string;
}

interface ActivityIssueRepo {
  name: string;
  url: string;
  openCount: number;
  closedCount: number;
}

interface FeaturedActivity {
  title: string;
  url: string;
  repo: string;
  repoUrl: string;
  body?: string;
  number?: number;
}

interface ActivityGroup {
  type: string;
  summary: string;
  summaryLink?: { text: string; url: string };
  date: string;
  count: number;
  repoCount: number;
  featured?: FeaturedActivity;
  repos?: ActivityRepo[];
  issueRepos?: ActivityIssueRepo[];
}

interface ActivityPeriod {
  period: string;
  groups: ActivityGroup[];
}

function pushToGroup(e: GitHubEvent): ActivityGroup {
  const commits = (e.payload.commits as { sha?: string }[]) ?? [];
  const ref = typeof e.payload.ref === "string" ? e.payload.ref : "";
  const branch = ref.replace("refs/heads/", "");
  const n = commits.length;
  const repoUrl = `${GITHUB_BASE}/${e.repo.name}`;
  let linkUrl = repoUrl;
  if (n > 1) {
    const before = typeof e.payload.before === "string" ? e.payload.before : "";
    const head = typeof e.payload.head === "string" ? e.payload.head : "";
    if (before && head) linkUrl = `${repoUrl}/compare/${before}...${head}`;
  } else if (n === 1 && commits[0]?.sha) {
    linkUrl = `${repoUrl}/commit/${commits[0].sha}`;
  }
  const label = branch ? `${e.repo.name}/${branch}` : e.repo.name;
  const count = n > 0 ? n : 1;
  const noun = count === 1 ? "commit" : "commits";
  const verb = n === 0 ? "Pushed to" : `Pushed ${count} ${noun} to`;
  return {
    type: "commits",
    summary: verb,
    summaryLink: { text: label, url: linkUrl },
    date: e.created_at,
    count,
    repoCount: 1,
  };
}

function prToGroup(e: GitHubEvent): ActivityGroup {
  const pr = e.payload.pull_request as
    | { number?: number; title?: string; merged?: boolean }
    | undefined;
  const num = (e.payload.number as number | undefined) ?? pr?.number;
  const merged = pr?.merged === true;
  const action = typeof e.payload.action === "string" ? e.payload.action : "";
  const repoUrl = `${GITHUB_BASE}/${e.repo.name}`;
  const url = num ? `${repoUrl}/pull/${num}` : repoUrl;
  const featured: FeaturedActivity = {
    title: pr?.title ?? `Pull request #${num}`,
    url,
    repo: e.repo.name,
    repoUrl,
    number: num,
  };
  if (action === "opened") {
    return {
      type: "featured-pr",
      summary: "Created a pull request in",
      summaryLink: { text: e.repo.name, url: repoUrl },
      date: e.created_at,
      count: 1,
      repoCount: 1,
      featured,
    };
  }
  if (action === "closed" && merged) {
    return {
      type: "merged-pr",
      summary: "Merged a pull request in",
      summaryLink: { text: e.repo.name, url: repoUrl },
      date: e.created_at,
      count: 1,
      repoCount: 1,
      featured,
    };
  }
  return {
    type: "closed-pr",
    summary: "Closed a pull request in",
    summaryLink: { text: e.repo.name, url: repoUrl },
    date: e.created_at,
    count: 1,
    repoCount: 1,
    featured,
  };
}

function reviewToGroup(e: GitHubEvent): ActivityGroup {
  const pr = e.payload.pull_request as { number?: number; title?: string } | undefined;
  const num = pr?.number;
  const repoUrl = `${GITHUB_BASE}/${e.repo.name}`;
  const url = num ? `${repoUrl}/pull/${num}` : repoUrl;
  const featured: FeaturedActivity = {
    title: pr?.title ?? `Pull request #${num}`,
    url,
    repo: e.repo.name,
    repoUrl,
    number: num,
  };
  return {
    type: "reviewed-prs",
    summary: "Reviewed a pull request in",
    summaryLink: { text: e.repo.name, url: repoUrl },
    date: e.created_at,
    count: 1,
    repoCount: 1,
    featured,
  };
}

function issueToGroup(e: GitHubEvent): ActivityGroup {
  const issue = e.payload.issue as
    | { number?: number; title?: string; body?: string; html_url?: string }
    | undefined;
  const num = issue?.number;
  const repoUrl = `${GITHUB_BASE}/${e.repo.name}`;
  const url = issue?.html_url ?? (num ? `${repoUrl}/issues/${num}` : repoUrl);
  const featured: FeaturedActivity = {
    title: issue?.title ?? `Issue #${num}`,
    url,
    repo: e.repo.name,
    repoUrl,
    body: (issue?.body ?? "").slice(0, 200),
    number: num,
  };
  const action = typeof e.payload.action === "string" ? e.payload.action : "";
  if (action === "opened") {
    return {
      type: "featured-issue",
      summary: "Created an issue in",
      summaryLink: { text: e.repo.name, url: repoUrl },
      date: e.created_at,
      count: 1,
      repoCount: 1,
      featured,
    };
  }
  return {
    type: "closed-issue",
    summary: "Closed an issue in",
    summaryLink: { text: e.repo.name, url: repoUrl },
    date: e.created_at,
    count: 1,
    repoCount: 1,
    featured,
  };
}

function createToGroup(e: GitHubEvent): ActivityGroup {
  const refType = typeof e.payload.ref_type === "string" ? e.payload.ref_type : "";
  const ref = typeof e.payload.ref === "string" ? e.payload.ref : "";
  const repoUrl = `${GITHUB_BASE}/${e.repo.name}`;
  if (refType === "repository") {
    return {
      type: "created-repos",
      summary: "Created repository",
      summaryLink: { text: e.repo.name, url: repoUrl },
      date: e.created_at,
      count: 1,
      repoCount: 1,
    };
  }
  const label = ref ? `${ref} in` : `${refType} in`;
  const type = refType === "tag" ? "created-tag" : "created-branch";
  return {
    type,
    summary: `Created ${label}`,
    summaryLink: { text: e.repo.name, url: repoUrl },
    date: e.created_at,
    count: 1,
    repoCount: 1,
  };
}

function simpleGroup(e: GitHubEvent, type: string, summary: string): ActivityGroup {
  const repoUrl = `${GITHUB_BASE}/${e.repo.name}`;
  return {
    type,
    summary,
    summaryLink: { text: e.repo.name, url: repoUrl },
    date: e.created_at,
    count: 1,
    repoCount: 1,
  };
}

function issueCommentToGroup(e: GitHubEvent): ActivityGroup {
  const issue = e.payload.issue as
    | { number?: number; title?: string; html_url?: string }
    | undefined;
  const comment = e.payload.comment as { html_url?: string } | undefined;
  const num = issue?.number;
  const repoUrl = `${GITHUB_BASE}/${e.repo.name}`;
  const issueUrl = issue?.html_url ?? (num ? `${repoUrl}/issues/${num}` : repoUrl);
  const featured: FeaturedActivity = {
    title: issue?.title ?? `Issue #${num}`,
    url: comment?.html_url ?? issueUrl,
    repo: e.repo.name,
    repoUrl,
    number: num,
  };
  return {
    type: "comment",
    summary: "Commented on an issue in",
    summaryLink: { text: e.repo.name, url: repoUrl },
    date: e.created_at,
    count: 1,
    repoCount: 1,
    featured,
  };
}

function commitCommentToGroup(e: GitHubEvent): ActivityGroup {
  const comment = e.payload.comment as { html_url?: string; commit_id?: string } | undefined;
  const repoUrl = `${GITHUB_BASE}/${e.repo.name}`;
  const commitId = comment?.commit_id ?? "";
  const commitUrl = commitId ? `${repoUrl}/commit/${commitId}` : repoUrl;
  const featured: FeaturedActivity = {
    title: commitId ? `Commit ${commitId.slice(0, 7)}` : "Commit comment",
    url: comment?.html_url ?? commitUrl,
    repo: e.repo.name,
    repoUrl,
  };
  return {
    type: "commit-comment",
    summary: "Commented on a commit in",
    summaryLink: { text: e.repo.name, url: repoUrl },
    date: e.created_at,
    count: 1,
    repoCount: 1,
    featured,
  };
}

function eventToActivityGroup(e: GitHubEvent): ActivityGroup | null {
  switch (e.type) {
    case "PushEvent":
      return pushToGroup(e);
    case "PullRequestEvent":
      return prToGroup(e);
    case "PullRequestReviewEvent":
      return reviewToGroup(e);
    case "IssuesEvent":
      return issueToGroup(e);
    case "IssueCommentEvent":
      return issueCommentToGroup(e);
    case "CommitCommentEvent":
      return commitCommentToGroup(e);
    case "CreateEvent":
      return createToGroup(e);
    case "DeleteEvent": {
      const refType = typeof e.payload.ref_type === "string" ? e.payload.ref_type : "branch";
      return simpleGroup(e, "delete", `Deleted a ${refType} in`);
    }
    case "ForkEvent":
      return simpleGroup(e, "fork", "Forked");
    case "ReleaseEvent": {
      const rel = e.payload.release as { tag_name?: string; html_url?: string } | undefined;
      const tag = rel?.tag_name ?? "";
      const url = rel?.html_url ?? `${GITHUB_BASE}/${e.repo.name}/releases`;
      const summary = tag ? `Released ${tag} in` : "Published a release in";
      return {
        type: "release",
        summary,
        summaryLink: { text: e.repo.name, url },
        date: e.created_at,
        count: 1,
        repoCount: 1,
      };
    }
    case "GollumEvent":
      return simpleGroup(e, "wiki", "Updated wiki in");
    case "MemberEvent":
      return simpleGroup(e, "member", "Added a member to");
    case "DiscussionEvent":
      return simpleGroup(e, "discussions", "Started a discussion in");
    default:
      return null;
  }
}

function buildActivityPeriods(events: GitHubEvent[]): ActivityPeriod[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ACTIVITY_CUTOFF_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const monthMap = new Map<string, ActivityGroup[]>();
  for (const e of events) {
    if (e.type === "WatchEvent" || e.created_at.slice(0, 10) < cutoffStr) continue;
    const group = eventToActivityGroup(e);
    if (!group) continue;
    const month = e.created_at.slice(0, 7);
    const arr = monthMap.get(month) ?? [];
    arr.push(group);
    monthMap.set(month, arr);
  }
  return [...monthMap.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, groups]) => ({
      period: new Date(key + "-01T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      groups,
    }));
}

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

export const githubRoute = new Hono().get("/:username", async (c) => {
  const username = c.req.param("username");
  const year = c.req.query("year");

  if (!USERNAME_REGEX.test(username)) {
    return c.json({ error: "Invalid username" }, 400);
  }

  try {
    const contribUrl = year
      ? `${GITHUB_BASE}/users/${username}/contributions?from=${year}-01-01&to=${year}-12-31`
      : `${GITHUB_BASE}/users/${username}/contributions`;

    const ghApiHeaders = { "User-Agent": UA, Accept: "application/vnd.github.v3+json" };
    const htmlHeaders = { "User-Agent": UA, Accept: "text/html" };

    const [contribRes, profileRes, eventsRes] = await Promise.all([
      fetch(contribUrl, { headers: htmlHeaders }),
      fetch(`${GITHUB_API_BASE}/users/${username}`, { headers: ghApiHeaders }),
      fetch(`${GITHUB_API_BASE}/users/${username}/events/public?per_page=${EVENTS_PER_PAGE}`, {
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

    const days = parseContributionDays(contribHtml);
    const contributed = parseContributedSection(contribHtml);
    const yearOverview = buildYearOverview(days);

    const contributedRepos = contributed.repos.map((full_name) => ({
      nameWithOwner: full_name,
      url: `${GITHUB_BASE}/${full_name}`,
      count: 1,
    }));

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
      contributedRepos,
      contributedOrgs: contributed.orgs,
      remainingRepoCount: contributed.othersCount,
      activityPeriods: buildActivityPeriods(events),
      availableYears: availableYears(profile.created_at),
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch GitHub data", detail: String(error) }, 500);
  }
});
