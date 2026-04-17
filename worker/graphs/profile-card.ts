import type { GraphTheme } from "./themes";
import type { LangStat } from "./languages";

interface ProfileData {
  login: string;
  name: string | null;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  totalContributions: number;
  topLanguages: LangStat[];
}

export function renderProfileCardSvg(profile: ProfileData, theme: GraphTheme): string {
  const w = 540;
  const h = 260;
  const pad = 28;

  const displayName = profile.name || profile.login;
  const bioText = profile.bio ?? "";
  const bio = bioText.length > 55 ? bioText.slice(0, 55) + "..." : bioText;

  const stats = [
    { label: "Repos", value: profile.publicRepos.toLocaleString() },
    { label: "Followers", value: profile.followers.toLocaleString() },
    { label: "Contributions", value: profile.totalContributions.toLocaleString() },
  ];

  const statColW = (w - pad * 2) / 3;
  const statsY = 110;
  const statItems = stats
    .map((s, i) => {
      const x = pad + i * statColW;
      const divider =
        i < stats.length - 1
          ? `<line x1="${pad + (i + 1) * statColW}" y1="${statsY - 20}" x2="${pad + (i + 1) * statColW}" y2="${statsY + 22}" stroke="${theme.border}" stroke-width="0.5"/>`
          : "";
      return `<text x="${x + statColW / 2}" y="${statsY}" text-anchor="middle" fill="${theme.text}" font-size="22" font-weight="700" font-family="Inter,system-ui,sans-serif">${s.value}</text>
      <text x="${x + statColW / 2}" y="${statsY + 18}" text-anchor="middle" fill="${theme.subtext}" font-size="10" font-family="Inter,system-ui,sans-serif">${s.label}</text>
      ${divider}`;
    })
    .join("");

  const topLangs = profile.topLanguages.slice(0, 4);
  const langColW = (w - pad * 2) / 4;
  const langY = 180;
  const langDots = topLangs
    .map((l, i) => {
      const x = pad + i * langColW;
      const name = l.name.length > 10 ? l.name.slice(0, 9) + "…" : l.name;
      return `<circle cx="${x + 5}" cy="${langY}" r="4" fill="${l.color}"/>
      <text x="${x + 14}" y="${langY + 1}" fill="${theme.subtext}" font-size="10" font-family="Inter,system-ui,sans-serif" dominant-baseline="central">${name}</text>`;
    })
    .join("");

  const accentLine = `<rect x="${pad}" y="82" width="40" height="3" rx="1.5" fill="${theme.line}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" rx="10" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1"/>
  <text x="${pad}" y="38" fill="${theme.text}" font-size="20" font-weight="700" font-family="Inter,system-ui,sans-serif">${displayName}</text>
  <text x="${pad}" y="58" fill="${theme.subtext}" font-size="12" font-family="Inter,system-ui,sans-serif">@${profile.login}</text>
  ${bio ? `<text x="${pad}" y="74" fill="${theme.subtext}" font-size="10" font-family="Inter,system-ui,sans-serif" opacity="0.7">${bio}</text>` : ""}
  ${accentLine}
  ${statItems}
  ${langDots.length > 0 ? `<text x="${pad}" y="${langY - 16}" fill="${theme.subtext}" font-size="9" font-weight="500" font-family="Inter,system-ui,sans-serif">TOP LANGUAGES</text>` : ""}
  ${langDots}
</svg>`;
}
