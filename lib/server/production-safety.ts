/**
 * Production safety boundary for the prototype.
 *
 * Local development and preview deployments may use the seeded demo store.
 * Sensitive production APIs are always fail-closed until real auth and
 * provider integrations exist. The demo flag only permits public inventory.
 */
export function isProductionEnvironment() {
  return isDeployedEnvironment() && !isPublicDemoMode();
}

export function isDeployedEnvironment() {
  return Boolean(process.env.VERCEL_ENV) || process.env.NODE_ENV === "production";
}

export function isPublicDemoMode() {
  return isDeployedEnvironment() && process.env.MOBILITY_DEMO_MODE === "true";
}

export function blockUnconfiguredProductionAccess(capability: string) {
  // MOBILITY_DEMO_MODE is a public inventory preview only. It must never
  // unlock APIs that expose accounts, bookings, financials, or mutations.
  if (!isDeployedEnvironment()) return null;

  return new Response(
    JSON.stringify({
      error: `${capability} is disabled until production authentication, authorization, and required provider integrations are configured.`,
    }),
    {
      status: 503,
      headers: { "content-type": "application/json" },
    }
  );
}
