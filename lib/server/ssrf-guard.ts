/**
 * MOBILITY Geospatial Platform — Upstream Host Security & SSRF Guard
 *
 * Enforces a strict allowlist of sanctioned external geospatial APIs to prevent
 * Server-Side Request Forgery (SSRF) and malicious redirect loops.
 */

const ALLOWED_GEOSPATIAL_HOSTS = new Set([
  "api.openrouteservice.org",
  "router.project-osrm.org",
  "nominatim.openstreetmap.org",
  "api.opencagedata.com",
  "api.open-meteo.com",
  "basemaps.cartocdn.com",
  "tile.openstreetmap.org",
]);

/**
 * Validates that a target URL belongs to an approved geospatial API domain.
 * Throws an error if the URL is invalid or targets an unapproved host.
 */
export function validateUpstreamUrl(targetUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    throw new Error(`Invalid URL format: "${targetUrl}"`);
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`Disallowed protocol "${parsed.protocol}" in URL: "${targetUrl}"`);
  }

  // Normalize and check against allowed hosts
  const hostname = parsed.hostname.toLowerCase();
  const isAllowed =
    ALLOWED_GEOSPATIAL_HOSTS.has(hostname) ||
    hostname.endsWith(".basemaps.cartocdn.com") ||
    hostname.endsWith(".openstreetmap.org");

  if (!isAllowed) {
    throw new Error(`SSRF Guard: Upstream host "${hostname}" is not in the approved geospatial API allowlist.`);
  }

  return parsed;
}

/**
 * Creates a fetch request to a verified upstream host with an enforced timeout.
 */
export async function secureUpstreamFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 6000
): Promise<Response> {
  validateUpstreamUrl(url);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}
