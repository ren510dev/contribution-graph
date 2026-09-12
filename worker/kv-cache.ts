import { KV_FRESH_TTL, KV_STALE_TTL } from "./constants";

export class NotFoundError extends Error {
  constructor() {
    super("Not found");
    this.name = "NotFoundError";
  }
}

interface CacheEntry<T> {
  v: T;
  at: number;
}

export interface CacheResult<T> {
  data: T | null;
  stale: boolean;
}

export async function cached<T>(
  kv: KVNamespace | undefined,
  key: string,
  load: () => Promise<T | null>,
): Promise<CacheResult<T>> {
  if (!kv) return { data: await load(), stale: false };

  let entry: CacheEntry<T> | null = null;
  try {
    entry = await kv.get<CacheEntry<T>>(key, "json");
  } catch {
    entry = null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (entry && now - entry.at < KV_FRESH_TTL) {
    return { data: entry.v, stale: false };
  }

  const fresh = await load();
  if (fresh === null) {
    return { data: entry?.v ?? null, stale: entry !== null };
  }

  await kv
    .put(key, JSON.stringify({ v: fresh, at: now } satisfies CacheEntry<T>), {
      expirationTtl: KV_STALE_TTL,
    })
    .catch(() => {});

  return { data: fresh, stale: false };
}
