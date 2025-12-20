import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Allow public access to landing page and menu
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/menu"
  ) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (images)
     * - / (landing page - excluded)
     * - /menu (public menu page - excluded)
     * - /login, /register (auth pages - excluded)
     * - /auth (auth callback - excluded to prevent race conditions)
     * - /api (API routes - excluded)
     */
    "/((?!_next/static|_next/image|favicon.ico|menu|login|register|auth|api|mcot_pic|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
