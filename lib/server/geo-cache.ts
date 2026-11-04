import { secureUpstreamFetch } from "./ssrf-guard";

/**
 * MOBILITY Geospatial Platform — GeoCache & Rate Limiting Module
 *
 * Provides high-speed TTL caching and coordinated rate-limiting for external
 * geospatial endpoints (specifically OpenStreetMap Nominatim 1 req/sec policy).
 *
 * NOTE ON MULTI-INSTANCE / SERVERLESS DEPLOYMENTS:
 * This rate-limiter coordinates sequential requests within the current Node.js process.
 * In a distributed, multi-container, or multi-region serverless deployment, multiple
 * independent worker processes may make concurrent upstream requests. For high-scale
 * production with multiple instances, configure OPENCAGE_API_KEY (commercial tier) or
 * deploy a shared Redis/KeyDB token-bucket rate limiter.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class GeoCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxItems = 1000;

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

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const geoCache = new GeoCache();

// Sequential Request Queue for Nominatim to guarantee strict 1 req/sec compliance
let nominatimQueue: Promise<void> = Promise.resolve();
let lastNominatimTimestamp = 0;

/**
 * Rate-limited fetch for OpenStreetMap Nominatim API endpoints.
 * Serializes all outgoing requests in a FIFO promise queue and enforces an interval
 * of at least 1,100ms between calls to strictly comply with OpenStreetMap policy.
 */
export async function rateLimitedNominatimFetch(
  url: string,
  headers: Record<string, string> = {}
): Promise<Response> {
  const configuredInterval = Number(process.env.NOMINATIM_RATE_LIMIT_MS) || 1100;
  const contactEmail = process.env.NOMINATIM_EMAIL || "contact@mobility-campus.local";
  const userAgent =
    process.env.NOMINATIM_USER_AGENT ||
    `MOBILITY-Campus-Rental/1.0 (${contactEmail}; campus-vehicle-rental-marketplace)`;

  // Chain onto the sequential queue to prevent concurrency races
  return new Promise<Response>((resolve, reject) => {
    nominatimQueue = nominatimQueue
      .then(async () => {
        const now = Date.now();
        const elapsed = now - lastNominatimTimestamp;
        if (elapsed < configuredInterval) {
          const waitTime = configuredInterval - elapsed;
          await new Promise((r) => setTimeout(r, waitTime));
        }
        lastNominatimTimestamp = Date.now();

        const response = await secureUpstreamFetch(
          url,
          {
            headers: {
              ...headers,
              "User-Agent": userAgent,
              Accept: "application/json",
            },
          },
          6000 // 6s timeout
        );
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
