/**
 * Production safety boundary for the prototype.
 *
 * Local development and preview deployments may use the seeded demo store.
 * Production is fail-closed unless an operator explicitly opts into the
 * public demo with MOBILITY_DEMO_MODE=true.
 */
export function isProductionEnvironment() {
  return process.env.VERCEL_ENV === "production" && process.env.MOBILITY_DEMO_MODE !== "true";
}

export function blockUnconfiguredProductionAccess(capability: string) {
  if (!isProductionEnvironment()) return null;

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
