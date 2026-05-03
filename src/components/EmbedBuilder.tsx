import { useState, useCallback, useMemo, useEffect } from "react";

const PRODUCTION_DOMAIN = "contribution-graph.ren510.dev";

const GRAPH_TYPES = [
  { id: "activity-line", name: "Activity Line", icon: "M3 17l4-4 4 4 6-10 4 4" },
  {
    id: "calendar",
    name: "Calendar",
    icon: "M3 3h18v18H3V3zm4 7h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2z",
  },
  {
    id: "languages",
    name: "Languages",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  },
  {
    id: "profile-card",
    name: "Profile Card",
    icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  },
  {
    id: "streak",
    name: "Streak",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4.5-2.67V7z",
  },
  {
    id: "heatmap-ring",
    name: "Ring",
    icon: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 110 14 7 7 0 010-14zm0 2a5 5 0 100 10 5 5 0 000-10z",
  },
  { id: "compact-bar", name: "Compact", icon: "M4 18h4V6H4v12zm6 0h4V2h-4v16zm6 0h4v-8h-4v8z" },
  { id: "stats-bar", name: "Insights", icon: "M4 9h4v11H4V9zm6-6h4v17h-4V3zm6 3h4v14h-4V6z" },
] as const;

const THEMES = [
  { id: "bordeaux", name: "Bordeaux", bg: "#220000", accent: "#d43d60", fg: "#fdb8c0" },
  { id: "bordeaux-light", name: "Bordeaux Light", bg: "#ffffff", accent: "#d43d60", fg: "#220000" },
  { id: "github", name: "GitHub", bg: "#0d1117", accent: "#39d353", fg: "#c9d1d9" },
  { id: "github-light", name: "GitHub Light", bg: "#ffffff", accent: "#1a7f37", fg: "#1f2328" },
  { id: "dracula", name: "Dracula", bg: "#282a36", accent: "#ff79c6", fg: "#f8f8f2" },
  { id: "dracula-light", name: "Dracula Light", bg: "#ffffff", accent: "#ff79c6", fg: "#282a36" },
  { id: "nord", name: "Nord", bg: "#2e3440", accent: "#88c0d0", fg: "#eceff4" },
  { id: "nord-light", name: "Nord Light", bg: "#eceff4", accent: "#5e81ac", fg: "#2e3440" },
  { id: "ocean", name: "Ocean", bg: "#0b1929", accent: "#82aaff", fg: "#b2ccd6" },
  { id: "ocean-light", name: "Ocean Light", bg: "#ffffff", accent: "#4a90d9", fg: "#0b1929" },
  { id: "tokyo-night", name: "Tokyo Night", bg: "#1a1b27", accent: "#7aa2f7", fg: "#c0caf5" },
  { id: "rose-pine", name: "Rosé Pine", bg: "#191724", accent: "#ebbcba", fg: "#e0def4" },
  { id: "sunset", name: "Sunset", bg: "#1e1131", accent: "#ff6e96", fg: "#f5d0c0" },
  { id: "minimal", name: "Minimal", bg: "#ffffff", accent: "#333333", fg: "#1a1a1a" },
] as const;

interface Props {
  username: string;
}

export default function EmbedBuilder({ username }: Readonly<Props>) {
  const [graphType, setGraphType] = useState("activity-line");
  const [themeId, setThemeId] = useState("bordeaux");
  const [copied, setCopied] = useState<string | null>(null);
  const [imgKey, setImgKey] = useState(0);
  const [svgContent, setSvgContent] = useState<string>("");
  const [svgMaxWidth, setSvgMaxWidth] = useState(840);

  const baseUrl = useMemo(() => {
    if (globalThis.window !== undefined) return globalThis.location.origin;
    return "";
  }, []);

  const svgUrl = `${baseUrl}/graph/${username}/${graphType}.svg?theme=${themeId}`;

  useEffect(() => {
    setSvgContent("");
    setSvgMaxWidth(840);
    fetch(svgUrl)
      .then((r) => r.text())
      .then((svg) => {
        const originalWidth = Number(/<svg\b[^>]*?\swidth="(\d+)"/.exec(svg)?.[1] ?? 840);
        setSvgMaxWidth(originalWidth);
        const responsive = svg
          .replace(
            /(<svg\b[^>]*?)\s+width="[^"]*"/,
            '$1 width="100%" style="width:100%;height:auto;display:block;max-width:100%"',
          )
          .replace(/(<svg\b[^>]*?)\s+height="[^"]*"/, "$1");
        setSvgContent(responsive);
      })
      .catch(() => setSvgContent(""));
  }, [svgUrl, imgKey]);
  const markdownSnippet = `![Contribution Graph](${svgUrl})`;
  const htmlSnippet = `<img src="${svgUrl}" alt="Contribution Graph" />`;

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  const selectedTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-bordeaux-200/50 shadow-sm">
      <div
        className="relative px-6 py-5"
        style={{
          background: `linear-gradient(135deg, ${selectedTheme.bg} 0%, ${selectedTheme.bg}ee 60%, ${selectedTheme.accent}33 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${selectedTheme.fg} 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <h3 className="text-lg font-bold" style={{ color: selectedTheme.fg }}>
            Embed Graph
          </h3>
          <p className="mt-1 text-xs opacity-60" style={{ color: selectedTheme.fg }}>
            Choose a style and theme, then embed in your GitHub README or website.
          </p>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6">
        <div className="mb-6">
          <p className="mb-2.5 block text-xs font-semibold tracking-wide text-bordeaux-700/70 uppercase">
            Graph Style
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {GRAPH_TYPES.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setGraphType(g.id);
                  setImgKey((k) => k + 1);
                }}
                className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-3 text-center transition-all duration-200 ${
                  graphType === g.id
                    ? "border-bordeaux-600 bg-bordeaux-50 shadow-md shadow-bordeaux-950/10"
                    : "border-bordeaux-50 bg-white hover:border-bordeaux-200 hover:shadow-sm"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    graphType === g.id
                      ? "bg-bordeaux-950 text-white"
                      : "bg-bordeaux-50 text-bordeaux-700/60 group-hover:bg-bordeaux-100 group-hover:text-bordeaux-700"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={g.icon} />
                  </svg>
                </div>
                <span
                  className={`text-xs font-medium leading-tight ${graphType === g.id ? "text-bordeaux-950" : "text-bordeaux-700/70"}`}
                >
                  {g.name}
                </span>
                {graphType === g.id && (
                  <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-bordeaux-600 ring-2 ring-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2.5 block text-xs font-semibold tracking-wide text-bordeaux-700/70 uppercase">
            Color Theme
          </p>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setThemeId(t.id);
                  setImgKey((k) => k + 1);
                }}
                className={`group relative flex items-center gap-2 rounded-xl border-2 px-3 py-2 transition-all duration-200 ${
                  themeId === t.id
                    ? "border-bordeaux-600 shadow-md shadow-bordeaux-950/10"
                    : "border-bordeaux-50 hover:border-bordeaux-200"
                }`}
              >
                <div className="flex items-center gap-0.5">
                  <div
                    className="h-5 w-5 rounded-l-md border border-black/10"
                    style={{ backgroundColor: t.bg }}
                  />
                  <div
                    className="h-5 w-3 border-y border-black/10"
                    style={{ backgroundColor: t.accent }}
                  />
                  <div
                    className="h-5 w-2 rounded-r-md border border-black/10"
                    style={{ backgroundColor: t.fg }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${themeId === t.id ? "text-bordeaux-950" : "text-bordeaux-700/70"}`}
                >
                  {t.name}
                </span>
                {themeId === t.id && (
                  <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-bordeaux-600 ring-2 ring-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-xl border border-bordeaux-200/50 shadow-sm">
          <div className="flex items-center gap-2 border-b border-bordeaux-200/50 bg-bordeaux-50/50 px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-bordeaux-200" />
              <div className="h-2.5 w-2.5 rounded-full bg-bordeaux-200" />
              <div className="h-2.5 w-2.5 rounded-full bg-bordeaux-200" />
            </div>
            <div className="flex-1 rounded-md bg-white px-3 py-1 text-xs font-mono text-bordeaux-700/50 border border-bordeaux-200/50 truncate">
              {svgUrl.replace(baseUrl, PRODUCTION_DOMAIN)}
            </div>
            <a
              href={svgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-md bg-bordeaux-50 px-2.5 py-1 text-xs font-medium text-bordeaux-700/70 transition-colors hover:bg-bordeaux-100 hover:text-bordeaux-600"
            >
              Open SVG
            </a>
          </div>
          <div
            style={{ backgroundColor: selectedTheme.bg + "22" }}
            className="overflow-x-auto p-4 sm:p-6 sm:flex sm:items-center sm:justify-center sm:min-h-52"
          >
            {svgContent ? (
              <div
                dangerouslySetInnerHTML={{ __html: svgContent }}
                className="embed-svg-wrapper"
                style={{ "--svg-orig-width": `${svgMaxWidth}px` } as React.CSSProperties}
              />
            ) : (
              <div className="min-h-52" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          {[
            { label: "URL", value: svgUrl, key: "url" },
            { label: "Markdown", value: markdownSnippet, key: "md" },
            { label: "HTML", value: htmlSnippet, key: "html" },
          ].map((row) => (
            <div
              key={row.key}
              className="flex items-center gap-2 rounded-xl border border-bordeaux-200/50 bg-bordeaux-50/30 px-3 py-2 transition-colors hover:bg-bordeaux-50/60"
            >
              <span className="w-20 shrink-0 text-xs font-semibold tracking-wider text-bordeaux-700/60 uppercase">
                {row.label}
              </span>
              <div className="min-w-0 flex-1 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
                <code className="font-mono text-xs text-bordeaux-700 whitespace-nowrap">
                  {row.value}
                </code>
              </div>
              <button
                onClick={() => handleCopy(row.value, row.key)}
                className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  copied === row.key
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                    : "bg-bordeaux-950 text-white shadow-sm shadow-bordeaux-950/20 hover:bg-bordeaux-900 hover:shadow-md active:scale-95"
                }`}
              >
                {copied === row.key ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
