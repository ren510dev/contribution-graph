import { useCallback, useEffect, useRef, useState } from "react";
import type { Contributions } from "../types";

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

interface Props {
  data: Contributions;
  loading?: boolean;
}

export default function ContributionGraph({ data, loading }: Readonly<Props>) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = svgContainerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleCellHover = useCallback(
    (e: React.MouseEvent, day: { date: string; count: number }) => {
      const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
      const parentRect =
        (e.currentTarget as SVGElement).closest(".contrib-graph")?.getBoundingClientRect() ?? rect;
      setTooltip({
        text: `${day.count} contribution${day.count === 1 ? "" : "s"} on ${new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 8,
      });
    },
    [],
  );

  const cellSize = 13;
  const cellGap = 3;
  const step = cellSize + cellGap;
  const svgFont = 11;
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const visibleDays = new Set([1, 3, 5]);
  const labelWidth = 36;
  const monthLabelY = 12;
  const gridTopY = monthLabelY + 14;
  const totalWidth = labelWidth + data.weeks.length * step + 8;
  const totalHeight = gridTopY + step * 7 + 4;

  const scale = containerWidth === null ? 1 : containerWidth / totalWidth;
  const MIN_LABEL_PX = 26;
  const minGapSvg = MIN_LABEL_PX / scale;

  let lastMonthX = -minGapSvg;
  const monthLabelNodes = data.months.map((month) => {
    const weekIndex = data.weeks.findIndex((w) =>
      w.contributionDays.some((d) => d.date === month.firstDay),
    );
    if (weekIndex < 0) return null;
    const x = labelWidth + weekIndex * step;
    if (x - lastMonthX < minGapSvg) return null;
    lastMonthX = x;
    return (
      <text
        key={month.firstDay}
        x={x}
        y={monthLabelY}
        fill="#7a1b3d"
        fontSize={svgFont}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="500"
      >
        {month.name}
      </text>
    );
  });

  return (
    <div
      className={`contrib-graph relative transition-opacity duration-300 ${loading ? "opacity-40" : ""}`}
    >
      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-stretch" style={{ minWidth: totalWidth }}>
          <div className="w-2 shrink-0" />
          <div className="flex-1" ref={svgContainerRef}>
            <svg viewBox={`0 0 ${totalWidth} ${totalHeight}`} className="block w-full">
              {monthLabelNodes}

              {dayLabels.map((label, i) =>
                visibleDays.has(i) ? (
                  <text
                    key={label}
                    x={0}
                    y={gridTopY + i * step + cellSize / 2}
                    fill="#7a1b3d"
                    fontSize={svgFont}
                    fontFamily="Inter, system-ui, sans-serif"
                    dominantBaseline="central"
                    opacity="0.7"
                  >
                    {label}
                  </text>
                ) : null,
              )}

              {data.weeks.map((week, wi) =>
                week.contributionDays.map((day) => {
                  const weekday = day.weekday ?? new Date(day.date + "T00:00:00").getDay();
                  const level = day.level ?? getLevel(day.count);
                  return (
                    <rect
                      key={day.date}
                      x={labelWidth + wi * step}
                      y={gridTopY + weekday * step}
                      width={cellSize}
                      height={cellSize}
                      rx={3}
                      ry={3}
                      fill={`var(--contrib-${level})`}
                      className="contrib-cell"
                      onMouseEnter={(e) => handleCellHover(e, day)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                }),
              )}
            </svg>
          </div>
          <div className="w-2 shrink-0" />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5 px-1 text-xs text-bordeaux-700">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className="inline-block rounded-sm"
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: `var(--contrib-${level})`,
            }}
          />
        ))}
        <span>More</span>
      </div>

      {tooltip && (
        <div className="contrib-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
