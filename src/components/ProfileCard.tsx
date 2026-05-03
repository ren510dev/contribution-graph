import type { Profile } from "../types";

interface Props {
  profile: Profile;
}

export default function ProfileCard({ profile }: Readonly<Props>) {
  const joinYear = new Date(profile.createdAt).getFullYear();

  return (
    <div className="flex items-start gap-6 sm:gap-8">
      <div className="shrink-0">
        <img
          src={profile.avatarUrl}
          alt={profile.login}
          width={96}
          height={96}
          className="h-20 w-20 rounded-2xl border-2 border-bordeaux-100 shadow-lg shadow-bordeaux-950/10 sm:h-24 sm:w-24"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <h2 className="text-xl font-bold tracking-tight text-bordeaux-950 sm:text-2xl">
            {profile.name ?? profile.login}
          </h2>
          <a
            href={`https://github.com/${profile.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-blue-500 transition-colors hover:text-blue-600"
          >
            @{profile.login}
          </a>
        </div>

        {profile.bio && (
          <p className="mt-1.5 text-sm leading-relaxed text-bordeaux-700 sm:text-base">
            {profile.bio}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-bordeaux-700/70 sm:text-sm">
          {profile.company && (
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.5 14.25c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM3.75 4h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 7.75A.75.75 0 0 1 3.75 7h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 7.75Zm4-3.75a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5ZM7 7.75A.75.75 0 0 1 7.75 7h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 7.75ZM.25 1.75C.25.784 1.034 0 2 0h8c.966 0 1.75.784 1.75 1.75v12.5A1.75 1.75 0 0 1 10 16H2A1.75 1.75 0 0 1 .25 14.25Zm12 0V16h1a1.75 1.75 0 0 0 1.75-1.75v-7.5a.75.75 0 0 0-.75-.75H12.25Z" />
              </svg>
              {profile.company}
            </span>
          )}
          {profile.location && (
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
                <path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192 0ZM8 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              </svg>
              {profile.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
            </svg>
            Joined {joinYear}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
          <div>
            <span className="font-semibold text-bordeaux-950">
              {profile.publicRepos.toLocaleString()}
            </span>
            <span className="ml-1 text-bordeaux-700/70">repos</span>
          </div>
          <div>
            <span className="font-semibold text-bordeaux-950">
              {profile.followers.toLocaleString()}
            </span>
            <span className="ml-1 text-bordeaux-700/70">followers</span>
          </div>
          <div>
            <span className="font-semibold text-bordeaux-950">
              {profile.following.toLocaleString()}
            </span>
            <span className="ml-1 text-bordeaux-700/70">following</span>
          </div>
        </div>
      </div>
    </div>
  );
}
