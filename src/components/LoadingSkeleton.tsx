const CELLS = Array.from({ length: 53 * 7 }, (_, i) => ({
  key: `cell-${i}`,
  delay: `${(i % 53) * 20}ms`,
}));

const EVENT_KEYS = ["event-a", "event-b", "event-c", "event-d"];

export default function LoadingSkeleton() {
  return (
    <div className="mx-auto mt-12 w-full max-w-5xl space-y-8 px-6">
      <div className="flex items-start gap-6">
        <div className="h-24 w-24 shrink-0 animate-pulse-bordeaux rounded-2xl bg-bordeaux-100" />
        <div className="flex-1 space-y-3">
          <div className="h-7 w-48 animate-pulse-bordeaux rounded-lg bg-bordeaux-100" />
          <div className="h-4 w-72 animate-pulse-bordeaux rounded bg-bordeaux-50" />
          <div className="flex gap-6">
            <div className="h-4 w-20 animate-pulse-bordeaux rounded bg-bordeaux-50" />
            <div className="h-4 w-20 animate-pulse-bordeaux rounded bg-bordeaux-50" />
            <div className="h-4 w-20 animate-pulse-bordeaux rounded bg-bordeaux-50" />
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-bordeaux-100 p-6">
        <div className="flex items-center justify-between">
          <div className="h-5 w-56 animate-pulse-bordeaux rounded bg-bordeaux-100" />
          <div className="h-8 w-28 animate-pulse-bordeaux rounded-lg bg-bordeaux-50" />
        </div>
        <div className="grid grid-cols-[repeat(53,1fr)] gap-0.75">
          {CELLS.map(({ key, delay }) => (
            <div
              key={key}
              className="aspect-square animate-pulse-bordeaux rounded-sm bg-bordeaux-50"
              style={{ animationDelay: delay }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {EVENT_KEYS.map((key) => (
          <div key={key} className="flex items-start gap-3">
            <div className="h-8 w-8 shrink-0 animate-pulse-bordeaux rounded-full bg-bordeaux-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-64 animate-pulse-bordeaux rounded bg-bordeaux-50" />
              <div className="h-3 w-40 animate-pulse-bordeaux rounded bg-bordeaux-50/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
