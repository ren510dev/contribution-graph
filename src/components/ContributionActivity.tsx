import { useState } from "react";
import type { ActivityGroup, ActivityPeriod, ActivityRepo, ActivityIssueRepo, FeaturedActivity } from "../types";

import commitsSvg from "../assets/icons/commits.svg?raw";
import bookSvg from "../assets/icons/book.svg?raw";
import branchSvg from "../assets/icons/branch.svg?raw";
import tagSvg from "../assets/icons/tag.svg?raw";
import prSvg from "../assets/icons/pr.svg?raw";
import reviewSvg from "../assets/icons/review.svg?raw";
import issueSvg from "../assets/icons/issue.svg?raw";
import commentSvg from "../assets/icons/comment.svg?raw";
import forkSvg from "../assets/icons/fork.svg?raw";
import trashSvg from "../assets/icons/trash.svg?raw";
import personSvg from "../assets/icons/person.svg?raw";
import discussionsSvg from "../assets/icons/discussions.svg?raw";
import chevronUpSvg from "../assets/icons/chevron-up.svg?raw";
import chevronDownSvg from "../assets/icons/chevron-down.svg?raw";

const GROUP_ICONS: Record<string, { svg: string; color: string }> = {
  commits:          { svg: commitsSvg,     color: "#57606a" },
  "created-repos":  { svg: bookSvg,        color: "#57606a" },
  "created-branch": { svg: branchSvg,      color: "#57606a" },
  "created-tag":    { svg: tagSvg,         color: "#57606a" },
  "featured-pr":    { svg: prSvg,          color: "#1a7f37" },
  "opened-prs":     { svg: prSvg,          color: "#1a7f37" },
  "merged-pr":      { svg: prSvg,          color: "#8957e5" },
  "closed-pr":      { svg: prSvg,          color: "#cf222e" },
  "reviewed-prs":   { svg: reviewSvg,      color: "#57606a" },
  "featured-issue": { svg: issueSvg,       color: "#1a7f37" },
  "opened-issues":  { svg: issueSvg,       color: "#57606a" },
  "closed-issue":   { svg: issueSvg,       color: "#8250df" },
  comment:          { svg: commentSvg,     color: "#57606a" },
  "commit-comment": { svg: commentSvg,     color: "#57606a" },
  fork:             { svg: forkSvg,        color: "#57606a" },
  delete:           { svg: trashSvg,       color: "#57606a" },
  release:          { svg: tagSvg,         color: "#0969da" },
  wiki:             { svg: bookSvg,        color: "#57606a" },
  member:           { svg: personSvg,      color: "#57606a" },
  discussions:      { svg: discussionsSvg, color: "#57606a" },
};

function getGroupIcon(type: string) {
  return GROUP_ICONS[type] ?? GROUP_ICONS.commits;
}

function SvgIcon({
  raw,
  color,
  className,
}: Readonly<{ raw: string; color: string; className: string }>) {
  return (
    <span
      className={className}
      style={{ color, display: "block" }}
      dangerouslySetInnerHTML={{ __html: raw }}
    />
  );
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
  const { svg, color } = getGroupIcon(type);

  return (
    <div className="mt-2 rounded-md border border-[#d0d7de] bg-white p-3">
      <div className="flex items-start gap-2">
        <SvgIcon raw={svg} color={color} className="mt-0.5 h-4 w-4 shrink-0" />
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
  const { svg, color } = getGroupIcon(group.type);

  return (
    <div className="relative flex gap-3 py-1.5">
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d0d7de] bg-white">
        <SvgIcon raw={svg} color={color} className="h-4 w-4" />
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
                <SvgIcon
                  raw={expanded ? chevronUpSvg : chevronDownSvg}
                  color="currentColor"
                  className="h-3.5 w-3.5"
                />
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
