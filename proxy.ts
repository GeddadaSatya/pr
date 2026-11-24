import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow internal next files, public assets, and api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Initialize Supabase SSR Client
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  let user = null;
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      user = null;
    }
  }

  // Check demo cookie fallback for preview testing
  const hasDemoSession = request.cookies.get('sovereign_demo_session')?.value === 'true';

  // 3. Define guest-only auth pages where an authenticated user should be forwarded to dashboard
  const isGuestOnlyAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password');

  // Define all public/auth pages (exempt from redirect to /login)
  const isAuthPage =
    isGuestOnlyAuthPage ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/accept-invite') ||
    pathname.startsWith('/auth/callback');

  // Verify email confirmation status
  const isEmailVerified = user && Boolean(user.email_confirmed_at);

  // Requirement 12: Prevent unverified users from accessing protected pages
  if (user && !isEmailVerified && !hasDemoSession) {
    if (!isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'email_not_confirmed');
      return NextResponse.redirect(url);
    }
  }

  // If user is authenticated and verified (or in demo mode) and visits a guest-only auth page, redirect to dashboard
  // Note: /reset-password and /auth/callback must NOT be redirected so users can set their new password
  if ((isEmailVerified || hasDemoSession) && isGuestOnlyAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If user is NOT authenticated/verified and visits a protected route, redirect to /login
  if (!isEmailVerified && !hasDemoSession && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
