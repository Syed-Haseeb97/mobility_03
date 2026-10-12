import { NextRequest, NextResponse } from "next/server";

const protectedPages = [
  "/admin",
  "/host/dashboard",
  "/host/listings",
  "/host/add-vehicle",
  "/rent/bookings",
];

const sensitiveApiPrefixes = [
  "/api/bookings",
  "/api/auth/session",
  "/api/payouts",
  "/api/admin",
  "/api/reviews",
  "/api/disputes",
  "/api/handover",
];

function matchesPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export function middleware(request: NextRequest) {
  // The current identity selector is a demo persona switcher, not authentication.
  // Fail closed on public production deployments until a real auth provider and
  // authorization checks are configured. This flag is only for isolated demos.
  const unsafeDemoEnabled = process.env.MOBILITY_ENABLE_UNSAFE_DEMO_MODE === "true";
  if (process.env.NODE_ENV !== "production" || unsafeDemoEnabled) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isProtectedPage = protectedPages.some((path) => matchesPath(pathname, path));
  if (isProtectedPage) {
    return new NextResponse(
      "This demo-only area is disabled on public production deployments until real authentication and authorization are configured.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const isApi = pathname.startsWith("/api/");
  if (!isApi) return NextResponse.next();

  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  const isSensitiveRead = sensitiveApiPrefixes.some((path) => matchesPath(pathname, path));
  if (isMutation || isSensitiveRead) {
    return NextResponse.json(
      {
        error:
          "This demo backend is not enabled for public production use. Configure real authentication, authorization, and payment processing before enabling mutations.",
      },
      { status: 503 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
