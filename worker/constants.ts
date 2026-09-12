export const UA = "contribution-graph/1.0";

export const GITHUB_BASE = "https://github.com";
export const GITHUB_API_BASE = "https://api.github.com";

export const GH_API_HEADERS = { "User-Agent": UA, Accept: "application/vnd.github.v3+json" };
export const GH_HTML_HEADERS = { "User-Agent": UA, Accept: "text/html" };

export const USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export const EVENTS_PER_PAGE = 100;
export const ACTIVITY_CUTOFF_DAYS = 30;
export const RECENT_DAYS = 31;

export const API_CACHE_MAX_AGE = 3600;
export const SVG_CACHE_MAX_AGE = 3600;

export const KV_FRESH_TTL = 43200;
export const KV_STALE_TTL = 604800;

export const MONTH_NAMES = [
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
] as const;
