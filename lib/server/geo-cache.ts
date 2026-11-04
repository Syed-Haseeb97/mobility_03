interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class GeoCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxItems = 500;

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    if (this.cache.size >= this.maxItems) {
      // Evict oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const geoCache = new GeoCache();

// Enforce a safe minimum interval between outgoing Nominatim geocoding requests (OpenStreetMap requirement: 1 request/sec max)
let lastNominatimRequestTime = 0;
const NOMINATIM_INTERVAL_MS = 1100;

export async function rateLimitedNominatimFetch(url: string, headers: Record<string, string>): Promise<Response> {
  const now = Date.now();
  const timeSinceLast = now - lastNominatimRequestTime;
  if (timeSinceLast < NOMINATIM_INTERVAL_MS) {
    const waitMs = NOMINATIM_INTERVAL_MS - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  lastNominatimRequestTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    return await fetch(url, {
      headers: {
        ...headers,
        "User-Agent": "MOBILITY-Campus-Rental/1.0 (dev@mobility-campus.edu; github.com/Syed-Haseeb97/mobility_03)",
        Accept: "application/json",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
