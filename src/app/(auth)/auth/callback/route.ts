import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Security: Validate redirect URL to prevent open redirect attacks
function isValidRedirectUrl(url: string): boolean {
  // Only allow relative paths (starting with /)
  // Reject absolute URLs (http://, https://, //)
  if (!url.startsWith('/')) {
    return false;
  }

  // Reject protocol-relative URLs (//example.com)
  if (url.startsWith('//')) {
    return false;
  }

  // Only allow specific safe paths
  const allowedPaths = ['/dashboard', '/admin', '/profile'];
  const path = url.split('?')[0]; // Remove query params for checking

  return allowedPaths.some(allowed => path.startsWith(allowed));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Security: Validate the redirect URL
  const safeNext = isValidRedirectUrl(next) ? next : "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Use x-forwarded-host for proper redirect on Vercel
      const forwardedHost = request.headers.get("x-forwarded-host");
      const protocol = request.headers.get("x-forwarded-proto") || "https";

      if (forwardedHost) {
        return NextResponse.redirect(`${protocol}://${forwardedHost}${safeNext}`);
      }

      // Fallback for local development
      return NextResponse.redirect(new URL(safeNext, request.url));
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/login?error=Could not authenticate user", request.url));
}
