import { useState, useCallback } from "react";
import type { GitHubData, YearOption } from "./types";
import logoSvg from "./assets/logo.svg";
import logoHeroSvg from "./assets/logo-hero.svg";
import SearchInput from "./components/SearchInput";
import ProfileCard from "./components/ProfileCard";
import ContributionGraph from "./components/ContributionGraph";
import ActivityOverview from "./components/ActivityOverview";
import ContributionActivity from "./components/ContributionActivity";
import EmbedBuilder from "./components/EmbedBuilder";
import LoadingSkeleton from "./components/LoadingSkeleton";

const year = new Date().getFullYear();

export default function App() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(false);
  const [yearLoading, setYearLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [availableYears, setAvailableYears] = useState<YearOption[]>([]);

  const fetchUser = useCallback(async (username: string, year?: string) => {
    const isYearChange = !!year;
    if (isYearChange) {
      setYearLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = year ? `?year=${year}` : "";
      const res = await fetch(`/api/github/${username}${params}`);
      const json: GitHubData & { error?: string } = await res.json();

      if (res.ok) {
        if (isYearChange) {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  contributions: json.contributions,
                  activityOverview: json.activityOverview,
                  contributedRepos: json.contributedRepos,
                  contributedOrgs: json.contributedOrgs,
                  remainingRepoCount: json.remainingRepoCount,
                  activityPeriods: json.activityPeriods,
                }
              : json,
          );
        } else {
          setData(json);
          setAvailableYears(json.availableYears || []);
          setSelectedYear("");
        }
        setCurrentUser(username);
      } else {
        setError(json.error || "Failed to fetch data");
        if (!isYearChange) setData(null);
      }
    } catch {
      setError("Network error. Please try again.");
      if (!isYearChange) setData(null);
    } finally {
      setLoading(false);
      setYearLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (username: string) => {
      fetchUser(username);
    },
    [fetchUser],
  );

  const handleYearChange = useCallback(
    (year: string) => {
      setSelectedYear(year);
      fetchUser(currentUser, year || undefined);
    },
    [currentUser, fetchUser],
  );

  const hasData = data && !loading;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header
        className={`shrink-0 border-b border-bordeaux-200/60 bg-bordeaux-50/40 transition-all duration-500 ${hasData ? "py-4" : "py-0 border-b-0"}`}
      >
        {hasData && (
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6">
            <a
              href="/"
              className="flex items-center gap-2.5 text-bordeaux-950 no-underline transition-opacity hover:opacity-70"
            >
              <img src={logoSvg} alt="Contribution Graph" className="h-6 w-6" />
              <span className="hidden text-sm font-semibold sm:inline">Contribution Graph</span>
            </a>
            <div className="w-full max-w-xs">
              <SearchInput onSearch={handleSearch} loading={loading} compact />
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {!hasData && !loading && (
          <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-20">
            <div className="animate-fade-in-up text-center">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-bordeaux-950 shadow-2xl shadow-bordeaux-950/20">
                <img src={logoHeroSvg} alt="Contribution Graph" className="h-10 w-10" />
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-[#6b0f2e] sm:text-5xl">
                Contribution Graph
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-[#a03055]">
                Explore any GitHub user&apos;s contribution activity
                <br />
                with a beautiful visualization.
              </p>
            </div>

            <div className="animate-fade-in-up animate-delay-100 mt-10 w-full">
              <SearchInput onSearch={handleSearch} loading={loading} />
            </div>

            {error && (
              <div className="animate-fade-in-up animate-delay-200 mt-6 rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {hasData && (
          <div className="mx-auto max-w-5xl px-6 py-8">
            <section className="animate-fade-in-up">
              <ProfileCard profile={data.profile} />
            </section>

            <section className="animate-fade-in-up animate-delay-100 mt-10">
              <div className="rounded-2xl border border-bordeaux-200/50 bg-white/80 shadow-sm">
                <div className="px-4 sm:px-5">
                  <div className="flex items-center justify-between px-1 pt-4 pb-3.5">
                    <p className="m-0 text-sm text-bordeaux-950">
                      <span className="font-semibold">
                        {data.contributions.totalContributions.toLocaleString()}
                      </span>{" "}
                      contributions in {selectedYear || "the last year"}
                    </p>
                    {availableYears.length > 0 && (
                      <select
                        value={selectedYear}
                        onChange={(e) => handleYearChange(e.target.value)}
                        className="ml-3 shrink-0 cursor-pointer rounded border border-bordeaux-200 bg-transparent py-0.5 pl-2 pr-8 text-sm text-bordeaux-700 outline-none"
                      >
                        <option value="">Last year</option>
                        {availableYears.map((year) => (
                          <option key={year.label} value={year.label}>
                            {year.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <ContributionGraph data={data.contributions} loading={yearLoading} />
                </div>

                <hr className="my-2 border-bordeaux-200/50" />

                <div className="px-4 py-3 sm:px-5">
                  <ActivityOverview
                    activityOverview={data.activityOverview}
                    contributedRepos={data.contributedRepos}
                    contributedOrgs={data.contributedOrgs}
                    remainingRepoCount={data.remainingRepoCount}
                  />
                </div>
              </div>
            </section>

            <section className="animate-fade-in-up animate-delay-200 mt-10">
              <div className="rounded-2xl border border-bordeaux-200/50 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="mb-4 text-sm font-semibold text-bordeaux-950">Contribution activity</h3>
                <ContributionActivity activityPeriods={data.activityPeriods} />
              </div>
            </section>

            <section className="animate-fade-in-up animate-delay-300 mt-10">
              <EmbedBuilder username={data.profile.login} />
            </section>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t border-bordeaux-950/10 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 text-sm text-bordeaux-900/50">
          <p className="flex gap-1">
            <span>Powered by</span>
            <a
              href="https://www.typescriptlang.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit underline hover:opacity-70"
            >
              TypeScript
            </a>
            <a
              href="https://hono.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit underline hover:opacity-70"
            >
              Hono
            </a>
          </p>
          <p>Copyright &copy; {year} Contribution Graph</p>
        </div>
      </footer>
    </div>
  );
}
