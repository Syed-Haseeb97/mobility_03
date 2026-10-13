/**
 * Demo mode is enabled for both local development and the public deployment
 * so the hosted site matches the seeded localhost prototype.
 */
export function blockUnconfiguredProductionAccess(_capability: string) {
  return null;
}
