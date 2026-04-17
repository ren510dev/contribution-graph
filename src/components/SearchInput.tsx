import { useState, useCallback } from "react";

interface Props {
  onSearch: (username: string) => void;
  loading?: boolean;
  compact?: boolean;
}

export default function SearchInput({ onSearch, loading, compact }: Readonly<Props>) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed) onSearch(trimmed);
    },
    [value, onSearch],
  );

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="relative">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-bordeaux-700/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="GitHub username"
          disabled={loading}
          className="w-full rounded-xl border border-bordeaux-200/50 bg-white py-2.5 pl-10 pr-4 text-sm text-bordeaux-950 placeholder-bordeaux-800/30 shadow-sm transition-all focus:border-bordeaux-300 focus:outline-none focus:ring-2 focus:ring-bordeaux-200/50 disabled:opacity-50"
        />
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-bordeaux-700/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a GitHub username..."
          disabled={loading}
          autoFocus
          className="search-shimmer w-full rounded-2xl border-2 border-bordeaux-200/50 bg-white py-4 pl-14 pr-32 text-lg text-bordeaux-950 placeholder-bordeaux-700/40 shadow-lg shadow-bordeaux-950/5 transition-all focus:border-bordeaux-300 focus:shadow-xl focus:shadow-bordeaux-950/8 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl bg-bordeaux-950 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-bordeaux-950/25 transition-all hover:bg-bordeaux-900 hover:shadow-lg hover:shadow-bordeaux-950/30 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-bordeaux-950"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Loading
            </span>
          ) : (
            "Explore"
          )}
        </button>
      </div>
    </form>
  );
}
