interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const TTL_MS = 60_000
const MAX_ENTRIES = 1000

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCache<T>(key: string, data: T): void {
  // Bound the cache to MAX_ENTRIES using Map's insertion-order iteration.
  // If the key is already present, deleting first moves it to the end
  // (touch semantics). Otherwise, evict the oldest entry to make room.
  if (cache.has(key)) {
    cache.delete(key)
  } else if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(key, { data, timestamp: Date.now() })
}
