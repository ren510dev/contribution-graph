export interface ContributionDay {
  date: string;
  count: number;
  level: number;
  weekday?: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionMonth {
  name: string;
  firstDay: string;
}

export interface Contributions {
  totalContributions: number;
  weeks: ContributionWeek[];
  months: ContributionMonth[];
  days: ContributionDay[];
}

export interface Profile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
}

export interface YearOption {
  label: string;
  from: string;
  to: string;
}

export interface ActivityOverview {
  commits: number;
  pullRequests: number;
  issues: number;
  codeReviews: number;
}

export interface ContributedRepo {
  nameWithOwner: string;
  url: string;
  count: number;
}

export interface ActivityRepo {
  name: string;
  url: string;
  date: string;
}

export interface ActivityIssueRepo {
  name: string;
  url: string;
  openCount: number;
  closedCount: number;
}

export interface FeaturedActivity {
  title: string;
  url: string;
  repo: string;
  repoUrl: string;
  body?: string;
  number?: number;
}

export interface ActivityGroup {
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

export interface ActivityPeriod {
  period: string;
  groups: ActivityGroup[];
}

export interface GitHubData {
  profile: Profile;
  contributions: Contributions;
  activityOverview: ActivityOverview;
  contributedRepos: ContributedRepo[];
  contributedOrgs: string[];
  remainingRepoCount: number;
  activityPeriods: ActivityPeriod[];
  availableYears: YearOption[];
}
