import type { ActivityOverview, ContributedRepo } from "../types";

const LABEL_FONT = 15;

function ActivityChart({ data }: Readonly<{ data: ActivityOverview }>) {
  const w = 380;
  const h = 370;
  const cx = w / 2;
  const cy = h / 2;
  const maxR = 100;

  const values = [data.commits, data.codeReviews, data.issues, data.pullRequests];
  const peak = Math.max(...values, 1);
  const scale = (v: number) => Math.max(8, (v / peak) * maxR);

  const commitLen = scale(data.commits);
  const reviewLen = scale(data.codeReviews);
  const issueLen = scale(data.issues);
  const prLen = scale(data.pullRequests);

  const polyPoints: [number, number][] = [
    [cx - commitLen, cy],
    [cx, cy - reviewLen],
    [cx + issueLen, cy],
    [cx, cy + prLen],
  ];
  const pointsStr = polyPoints.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto block w-full max-w-95">
      <polygon points={pointsStr} fill="rgba(212,61,96,0.40)" stroke="none" />

      <line x1={cx} y1={cy - maxR} x2={cx} y2={cy + maxR} stroke="#d43d60" strokeWidth="2" />
      <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke="#d43d60" strokeWidth="2" />

      {polyPoints.map(([x, y]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="4"
          fill="#ffffff"
          stroke="#d43d60"
          strokeWidth="2"
        />
      ))}

      <circle cx={cx} cy={cy} r="2" fill="#d43d60" />

      <text
        x={cx}
        y={cy - maxR - 34}
        textAnchor="middle"
        fill="currentColor"
        className="text-bordeaux-700"
        fontSize={LABEL_FONT}
        fontWeight="400"
      >
        {data.codeReviews}%
      </text>
      <text
        x={cx}
        y={cy - maxR - 18}
        textAnchor="middle"
        fill="currentColor"
        className="text-bordeaux-700"
        fontSize={LABEL_FONT}
      >
        Code review
      </text>

      <text
        x={cx + maxR + 14}
        y={cy - 8}
        textAnchor="start"
        fill="currentColor"
        className="text-bordeaux-700"
        fontSize={LABEL_FONT}
        fontWeight="400"
      >
        {data.issues}%
      </text>
      <text
        x={cx + maxR + 14}
        y={cy + 10}
        textAnchor="start"
        fill="currentColor"
        className="text-bordeaux-700"
        fontSize={LABEL_FONT}
      >
        Issues
      </text>

      <text
        x={cx}
        y={cy + maxR + 28}
        textAnchor="middle"
        fill="currentColor"
        className="text-bordeaux-700"
        fontSize={LABEL_FONT}
        fontWeight="400"
      >
        {data.pullRequests}%
      </text>
      <text
        x={cx}
        y={cy + maxR + 44}
        textAnchor="middle"
        fill="currentColor"
        className="text-bordeaux-700"
        fontSize={LABEL_FONT}
      >
        Pull requests
      </text>

      <text
        x={cx - maxR - 14}
        y={cy - 8}
        textAnchor="end"
        fill="currentColor"
        className="text-bordeaux-700"
        fontSize={LABEL_FONT}
        fontWeight="400"
      >
        {data.commits}%
      </text>
      <text
        x={cx - maxR - 14}
        y={cy + 10}
        textAnchor="end"
        fill="currentColor"
        className="text-bordeaux-700"
        fontSize={LABEL_FONT}
      >
        Commits
      </text>
    </svg>
  );
}

interface Props {
  activityOverview: ActivityOverview;
  contributedRepos: ContributedRepo[];
  contributedOrgs: string[];
  remainingRepoCount: number;
}

export default function ActivityOverviewSection({
  activityOverview,
  contributedRepos,
  contributedOrgs,
  remainingRepoCount,
}: Readonly<Props>) {
  const hasActivity =
    activityOverview.commits +
      activityOverview.pullRequests +
      activityOverview.issues +
      activityOverview.codeReviews >
    0;

  return (
    <div style={{ padding: "0 1px" }}>
      {contributedOrgs.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {contributedOrgs.map((org) => (
            <a
              key={org}
              href={`https://github.com/${org}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-bordeaux-200 p-1 text-bordeaux-950 no-underline"
              style={{ fontSize: LABEL_FONT }}
            >
              <img
                src={`https://github.com/${org}.png?size=20`}
                alt={org}
                width={18}
                height={18}
                className="rounded-md border border-bordeaux-200 bg-bordeaux-100/30"
              />
              @{org}
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="min-w-0 flex-1 pb-4 pr-0 md:pr-5 md:pb-0">
          <p
            className="mb-3 font-semibold text-bordeaux-950"
            style={{ margin: 0, marginBottom: 12, fontSize: LABEL_FONT }}
          >
            Activity overview
          </p>
          <div className="flex items-start gap-2" style={{ fontSize: LABEL_FONT }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 16 16"
              className="mt-0.75 shrink-0 text-bordeaux-700/70"
              fill="currentColor"
            >
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8.5ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
            </svg>
            <div>
              <span className="text-bordeaux-950">Contributed to</span>
              <div className="mt-1 leading-snug">
                {contributedRepos.map((repo, i) => (
                  <span key={repo.nameWithOwner}>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-500 hover:text-blue-600"
                    >
                      {repo.nameWithOwner}
                    </a>
                    {i < contributedRepos.length - 1 && " , "}
                  </span>
                ))}
                {remainingRepoCount > 0 && (
                  <div className="mt-0.5 text-bordeaux-950" style={{ fontSize: LABEL_FONT }}>
                    and {remainingRepoCount} other repositories
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px w-full shrink-0 bg-bordeaux-200 md:h-auto md:w-px" />

        <div className="w-full pt-4 md:w-95 md:shrink-0 md:pt-0 md:pl-4">
          {hasActivity ? (
            <ActivityChart data={activityOverview} />
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-bordeaux-700/60">
              No activity data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
