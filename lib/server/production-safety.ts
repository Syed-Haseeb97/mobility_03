import { NextResponse } from "next/server";

/**
 * This project currently has demo identity switching and no configured payment
 * gateway. Do not expose simulated mutations as real customer transactions in
 * a production deployment. Local development remains usable for the prototype.
 */
export function blockUnconfiguredProductionAccess(capability: string) {
  if (process.env.NODE_ENV !== "production") return null;

  return NextResponse.json(
    {
      error: `${capability} is temporarily unavailable in production. Server-side authentication/authorization and the required provider integration must be configured before this action can be enabled.`,
      code: "PRODUCTION_CONFIGURATION_REQUIRED",
    },
    { status: 503 }
  );
}
