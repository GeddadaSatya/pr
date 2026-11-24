import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/login?verified=true';
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');
  const errorParam = searchParams.get('error');

  // Handle case where Supabase reports otp_expired / access_denied:
  // In Supabase, if an email verification link is clicked more than once
  // or pre-fetched by email link scanners (Google/Outlook Safe Links), it returns otp_expired.
  // Because the single-use token was already verified on first access, we gracefully redirect
  // to login with the verified notification rather than displaying a false error.
  if (
    errorCode === 'otp_expired' ||
    errorDescription?.toLowerCase().includes('expired') ||
    errorDescription?.toLowerCase().includes('invalid')
  ) {
    // If it's a password reset / recovery link that expired, direct to forgot-password
    if (next.includes('reset-password') || type === 'recovery') {
      return NextResponse.redirect(`${origin}/forgot-password?error=link_expired`);
    }
    // For email confirmation, the email has already been verified
    return NextResponse.redirect(`${origin}/login?verified=true&note=already_confirmed`);
  }

  // Handle other explicit Supabase errors
  if (errorParam) {
    const encodedError = encodeURIComponent(errorDescription || 'Authentication failed. Please try again.');
    return NextResponse.redirect(`${origin}/login?error=custom&message=${encodedError}`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // 1. Verify via token_hash if present (recommended for server-side SSR email verification)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return response;
    }
    console.warn('verifyOtp in auth callback:', error.message);
    if (error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('already')) {
      if (next.includes('reset-password') || type === 'recovery') {
        return NextResponse.redirect(`${origin}/forgot-password?error=link_expired`);
      }
      return NextResponse.redirect(`${origin}/login?verified=true&note=already_confirmed`);
    }
  }

  // 2. Exchange PKCE code for session if present
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
    console.warn('exchangeCodeForSession in auth callback:', error.message);
    // If code was already exchanged, email confirmation already succeeded
    if (error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('already')) {
      if (next.includes('reset-password') || type === 'recovery') {
        return NextResponse.redirect(`${origin}/forgot-password?error=link_expired`);
      }
      return NextResponse.redirect(`${origin}/login?verified=true&note=already_confirmed`);
    }
  }

  // Fallback for password recovery: redirect to /reset-password so client-side SDK can parse hash fragment
  if (next.includes('reset-password') || type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  // Fallback for invitations: redirect to /accept-invite
  if (next.includes('accept-invite') || type === 'invite') {
    return NextResponse.redirect(`${origin}/accept-invite`);
  }

  // Fallback: If verification could not be completed
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
