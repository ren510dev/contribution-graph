import { useState } from "react";
import type { ActivityGroup, ActivityPeriod, ActivityRepo, ActivityIssueRepo, FeaturedActivity } from "../types";

const PR_PATH = "M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z";
const ISSUE_PATH = "M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z";

const GROUP_ICONS: Record<string, { path: string; color: string }> = {
  commits: {
    path: "M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z",
    color: "#57606a",
  },
  "created-repos": {
    path: "M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z",
    color: "#57606a",
  },
  "created-branch": {
    path: "M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z",
    color: "#57606a",
  },
  "created-tag": {
    path: "M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.752 1.752 0 0 1 1 7.775Zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 0 0 .354 0l5.025-5.025a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25ZM6 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z",
    color: "#57606a",
  },
  "featured-pr": { path: PR_PATH, color: "#1a7f37" },
  "opened-prs": { path: PR_PATH, color: "#1a7f37" },
  "merged-pr": { path: PR_PATH, color: "#8957e5" },
  "closed-pr": { path: PR_PATH, color: "#cf222e" },
  "reviewed-prs": {
    path: "M1.75 1h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 13H8.061l-2.574 2.573A1.457 1.457 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25v-8.5C0 1.784.784 1 1.75 1ZM1.5 2.75v8.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25Zm9.03 3.47-3.25 3.25a.749.749 0 0 1-1.06 0L4.97 8.22a.749.749 0 1 1 1.06-1.06l1.72 1.72 2.72-2.72a.749.749 0 1 1 1.06 1.06Z",
    color: "#57606a",
  },
  "featured-issue": { path: ISSUE_PATH, color: "#1a7f37" },
  "opened-issues": { path: ISSUE_PATH, color: "#57606a" },
  "closed-issue": { path: ISSUE_PATH, color: "#8250df" },
  comment: {
    path: "M1.75 1h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 13H8.061l-2.574 2.573A1.457 1.457 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25v-8.5C0 1.784.784 1 1.75 1ZM1.5 2.75v8.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25Z",
    color: "#57606a",
  },
  "commit-comment": {
    path: "M1.75 1h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 13H8.061l-2.574 2.573A1.457 1.457 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25v-8.5C0 1.784.784 1 1.75 1ZM1.5 2.75v8.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25Z",
    color: "#57606a",
  },
  fork: {
    path: "M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z",
    color: "#57606a",
  },
  delete: {
    path: "M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.149ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z",
    color: "#57606a",
  },
  release: {
    path: "M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.752 1.752 0 0 1 1 7.775Zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 0 0 .354 0l5.025-5.025a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25ZM6 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z",
    color: "#0969da",
  },
  wiki: {
    path: "M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z",
    color: "#57606a",
  },
  member: {
    path: "M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z",
    color: "#57606a",
  },
  discussions: {
    path: "M1.75 1h8.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 10.25 10H7.061l-2.574 2.573A1.457 1.457 0 0 1 2 11.543V10h-.25A1.75 1.75 0 0 1 0 8.25v-5.5C0 1.784.784 1 1.75 1ZM1.5 2.75v5.5c0 .138.112.25.25.25h1a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h3.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25Zm13 2a.25.25 0 0 0-.25-.25h-.5a.75.75 0 0 1 0-1.5h.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 14.25 12H14v1.543a1.457 1.457 0 0 1-2.487 1.03L9.22 12.28a.749.749 0 0 1 .53-1.28h.5l1.72 1.72V11.25a.75.75 0 0 1 .75-.75h.53a.25.25 0 0 0 .25-.25Z",
    color: "#57606a",
  },
};

function getGroupIcon(type: string) {
  return GROUP_ICONS[type] ?? GROUP_ICONS.commits;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + (dateStr.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SummaryText({ group }: Readonly<{ group: ActivityGroup }>) {
  const link = group.summaryLink;
  if (link) {
    return (
      <span>
        {group.summary}{" "}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#0969da] hover:underline"
        >
          {link.text}
        </a>
      </span>
    );
  }
  return <span>{group.summary}</span>;
}

function FeaturedCard({ featured, type }: Readonly<{ featured: FeaturedActivity; type: string }>) {
  const { path: iconPath, color: iconColor } = getGroupIcon(type);

  return (
    <div className="mt-2 rounded-md border border-[#d0d7de] bg-white p-3">
      <div className="flex items-start gap-2">
        <svg className="mt-0.5 h-4 w-4 shrink-0" fill={iconColor} viewBox="0 0 16 16">
          <path d={iconPath} />
        </svg>
        <div className="min-w-0 flex-1">
          <a
            href={featured.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#0969da] hover:underline"
          >
            {featured.title}
          </a>
          {featured.body && (
            <p className="mt-1 line-clamp-2 text-xs text-[#57606a]">{featured.body}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RepoList({ repos }: Readonly<{ repos: ActivityRepo[] }>) {
  return (
    <div className="mt-2 space-y-1.5">
      {repos.map((repo) => (
        <div key={repo.name} className="flex items-center justify-between">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-mono text-xs text-[#0969da] hover:underline"
          >
            {repo.name}
          </a>
          <span className="ml-4 shrink-0 text-xs text-[#57606a]">{formatShortDate(repo.date)}</span>
        </div>
      ))}
    </div>
  );
}

function IssueRepoList({ repos }: Readonly<{ repos: ActivityIssueRepo[] }>) {
  return (
    <div className="mt-2 space-y-1.5">
      {repos.map((repo) => (
        <div key={repo.name} className="flex items-center justify-between">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-mono text-xs text-[#0969da] hover:underline"
          >
            {repo.name}
          </a>
          <div className="ml-4 flex shrink-0 items-center gap-3 text-xs">
            {repo.openCount > 0 && (
              <span className="font-semibold text-[#1a7f37]">{repo.openCount} open</span>
            )}
            {repo.closedCount > 0 && (
              <span className="font-semibold text-[#8957e5]">{repo.closedCount} closed</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupRow({ group }: Readonly<{ group: ActivityGroup }>) {
  const [expanded, setExpanded] = useState(true);
  const canExpand = !!(group.repos ?? group.issueRepos);
  const { path, color } = getGroupIcon(group.type);

  return (
    <div className="relative flex gap-3 py-1.5">
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d0d7de] bg-white">
        <svg className="h-4 w-4" fill={color} viewBox="0 0 16 16">
          <path d={path} />
        </svg>
      </div>

      <div className="min-w-0 flex-1 pt-1">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm text-[#24292f]">
            <SummaryText group={group} />
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-[#57606a]">{formatShortDate(group.date)}</span>
            {canExpand && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex h-5 w-5 items-center justify-center rounded text-[#57606a] hover:bg-gray-100 hover:text-[#24292f]"
                aria-label={expanded ? "Collapse" : "Expand"}
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
                  {expanded
                    ? <path d="M3.22 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1-1.06 1.06L8 4.81 4.28 8.53a.75.75 0 0 1-1.06 0Zm0 4.44a.75.75 0 0 1 0-1.06L6.94 8.19a.75.75 0 1 1 1.06 1.06L4.28 13.0a.75.75 0 0 1-1.06 0Z" />
                    : <path d="M12.78 7.47a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 8.53a.75.75 0 0 1 1.06-1.06L8 11.19l3.72-3.72a.75.75 0 0 1 1.06 0Zm0-4.44a.75.75 0 0 1 0 1.06l-3.72 3.72 3.72 3.72a.75.75 0 0 1-1.06 1.06L7.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" />
                  }
                </svg>
              </button>
            )}
          </div>
        </div>

        {group.featured && <FeaturedCard featured={group.featured} type={group.type} />}
        {canExpand && expanded && group.repos && <RepoList repos={group.repos} />}
        {canExpand && expanded && group.issueRepos && <IssueRepoList repos={group.issueRepos} />}
      </div>
    </div>
  );
}

function PeriodSection({ period }: Readonly<{ period: ActivityPeriod }>) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <span className="shrink-0 text-xs font-semibold text-[#24292f]">{period.period}</span>
        <div className="h-px flex-1 bg-[#d0d7de]" />
      </div>
      <div className="relative">
        <div className="absolute bottom-0 left-3.75 top-0 w-px bg-[#d0d7de]" />
        <div className="space-y-0.5">
          {period.groups.map((group, i) => (
            <GroupRow key={`${group.type}-${group.date}-${i}`} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface Props {
  activityPeriods: ActivityPeriod[];
}

export default function ContributionActivity({ activityPeriods }: Readonly<Props>) {
  if (activityPeriods.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-bordeaux-700/60">No recent public activity</p>
    );
  }
  return (
    <div className="space-y-6">
      {activityPeriods.map((period) => (
        <PeriodSection key={period.period} period={period} />
      ))}
    </div>
  );
}
