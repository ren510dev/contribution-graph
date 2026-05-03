export interface GitHubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: Record<string, unknown>;
}

export interface GitHubRepo {
  language: string | null;
}
