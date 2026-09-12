import { cached, NotFoundError, type CacheResult } from "./kv-cache";
import { GH_API_HEADERS, GITHUB_API_BASE, EVENTS_PER_PAGE } from "./constants";
import type { GitHubProfile, GitHubEvent, GitHubRepo } from "./types";

async function loadJson<T>(url: string): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(url, { headers: GH_API_HEADERS });
  } catch {
    return null;
  }

  if (res.status === 404) throw new NotFoundError();
  if (!res.ok) return null;

  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function cachedProfile(
  kv: KVNamespace | undefined,
  username: string,
): Promise<CacheResult<GitHubProfile>> {
  return cached(kv, `gh:user:${username}`, () =>
    loadJson<GitHubProfile>(`${GITHUB_API_BASE}/users/${username}`),
  );
}

export function cachedEvents(
  kv: KVNamespace | undefined,
  username: string,
): Promise<CacheResult<GitHubEvent[]>> {
  return cached(kv, `gh:events:${username}`, () =>
    loadJson<GitHubEvent[]>(
      `${GITHUB_API_BASE}/users/${username}/events/public?per_page=${EVENTS_PER_PAGE}`,
    ),
  );
}

export function cachedRepos(
  kv: KVNamespace | undefined,
  username: string,
): Promise<CacheResult<GitHubRepo[]>> {
  return cached(kv, `gh:repos:${username}`, () =>
    loadJson<GitHubRepo[]>(
      `${GITHUB_API_BASE}/users/${username}/repos?per_page=${EVENTS_PER_PAGE}&sort=pushed`,
    ),
  );
}
