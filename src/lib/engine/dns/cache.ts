// In-session DNS cache. Lives for the duration of the browser tab.

interface CacheEntry {
  records: string[];
  ts: number;
}

const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export function cacheGet(key: string): string[] | undefined {
  const e = CACHE.get(key);
  if (!e) return undefined;
  if (Date.now() - e.ts > TTL_MS) { CACHE.delete(key); return undefined; }
  return e.records;
}

export function cacheSet(key: string, records: string[]) {
  CACHE.set(key, { records, ts: Date.now() });
}
