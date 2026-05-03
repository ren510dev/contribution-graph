import type { GraphTheme } from "./themes";
import type { ContributionDay } from "./types";
import { RECENT_DAYS } from "../constants";

function splinePath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const d: string[] = [`M${pts[0].x.toFixed(3)},${pts[0].y.toFixed(3)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(
      `C${cp1x.toFixed(3)},${cp1y.toFixed(3)} ${cp2x.toFixed(3)},${cp2y.toFixed(3)} ${p2.x.toFixed(3)},${p2.y.toFixed(3)}`,
    );
  }
  return d.join("");
}

export function renderActivityLineSvg(
  days: ContributionDay[],
  theme: GraphTheme,
  username: string,
): string {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-RECENT_DAYS);

  if (recent.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="300" viewBox="0 0 840 300"><rect width="840" height="300" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1"/><text x="420" y="150" fill="${theme.text}" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="14">No data</text></svg>`;
  }

  const W = 840;
  const H = 300;
  const chartLeft = 54;
  const chartRight = 812;
  const chartTop = 46;
  const chartBottom = 252;
  const chartW = chartRight - chartLeft;
  const chartH = chartBottom - chartTop;

  const n = recent.length;
  const maxCount = Math.max(...recent.map((d) => d.count), 1);

  const rawStep = maxCount / 9;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const niceStep =
    [1, 2, 5, 10].map((f) => f * magnitude).find((s) => s >= rawStep) ?? magnitude * 10;
  const yMax = niceStep * Math.ceil(maxCount / niceStep);
  const ySteps = Math.round(yMax / niceStep);

  const pts = recent.map((d, i) => {
    const dateObj = new Date(d.date + "T00:00:00");
    return {
      x: chartLeft + (n > 1 ? i / (n - 1) : 0.5) * chartW,
      y: chartBottom - (d.count / yMax) * chartH,
      dayOfMonth: dateObj.getDate(),
      count: d.count,
    };
  });

  const step = n > 1 ? chartW / (n - 1) : chartW;
  const lineD = splinePath(pts);
  const splineBody = lineD.replace(/^M[\d.,]+/, "");
  const first = pts[0];
  const last = pts.at(-1)!;
  const areaD = `M${first.x.toFixed(3)},${chartBottom}L${first.x.toFixed(3)},${first.y.toFixed(3)}${splineBody}L${last.x.toFixed(3)},${chartBottom}Z`;

  const gridAttrs = `stroke="${theme.text}" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="2"`;

  const vGrid = pts
    .map(
      (p) =>
        `<line x1="${p.x.toFixed(3)}" x2="${p.x.toFixed(3)}" y1="${chartTop}" y2="${chartBottom}" ${gridAttrs}/>`,
    )
    .join("");

  const hGrid = Array.from({ length: ySteps + 1 }, (_, i) => {
    const val = i * niceStep;
    const y = (chartBottom - (val / yMax) * chartH).toFixed(3);
    return `<line y1="${y}" y2="${y}" x1="${chartLeft}" x2="${chartRight}" ${gridAttrs}/>`;
  }).join("");

  const labelFont = `font-family="Inter,system-ui,sans-serif" font-size="9" fill="${theme.text}"`;
  const axisTitleFont = `font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="600" fill="${theme.subtext}"`;

  let xInterval = 1;
  if (step < 14) xInterval = 4;
  else if (step < 30) xInterval = 2;
  const xLabels = pts
    .filter((_, i) => i % xInterval === 0)
    .map((p) => {
      const lx = (p.x - step / 8).toFixed(3);
      return `<text x="${lx}" y="${chartBottom + 16}" ${labelFont} text-anchor="start">${p.dayOfMonth}</text>`;
    })
    .join("");

  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    const val = i * niceStep;
    const y = (chartBottom - (val / yMax) * chartH + 3).toFixed(3);
    return `<text y="${y}" x="${chartLeft - 6}" ${labelFont} text-anchor="end">${val}</text>`;
  }).join("");

  const dots = pts
    .map(
      (p, i) =>
        `<line x1="${p.x.toFixed(3)}" y1="${p.y.toFixed(3)}" x2="${(p.x + 0.01).toFixed(3)}" y2="${p.y.toFixed(3)}" stroke="${theme.point}" stroke-width="7" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.6s" begin="${(i * 0.02).toFixed(2)}s" fill="freeze"/></line>`,
    )
    .join("");

  const lineAnim = `<animate attributeName="stroke-dashoffset" from="5000" to="0" dur="5s" begin="0s" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">
  <rect x="0" y="0" rx="10" width="100%" height="100%" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1"/>
  <text x="${W / 2}" y="28" font-family="Inter,system-ui,sans-serif" font-size="14" font-weight="600" fill="${theme.text}" text-anchor="middle">Contribution Activity — @${username}</text>
  <g>${vGrid}${hGrid}</g>
  <path d="${areaD}" fill="${theme.area}" fill-opacity="0.1" stroke="none"/>
  <path d="${lineD}" fill="none" stroke="${theme.line}" stroke-width="3" stroke-dasharray="5000" stroke-dashoffset="5000">${lineAnim}</path>
  <g>${dots}</g>
  <g>${xLabels}${yLabels}</g>
  <text ${axisTitleFont} x="${chartLeft + chartW / 2}" y="${H - 10}" dominant-baseline="text-after-edge" text-anchor="middle">Days</text>
  <text ${axisTitleFont} x="12" y="${chartTop + chartH / 2}" transform="rotate(-90,12,${chartTop + chartH / 2})" dominant-baseline="hanging" text-anchor="middle">Contributions</text>
</svg>`;
}
