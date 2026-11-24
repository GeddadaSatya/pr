'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export type AuthMode = 'login' | 'forgot' | 'register' | 'invite' | 'reset';

export function UnifiedAuthContainer({ defaultMode = 'login' }: { defaultMode?: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode state: 'login' | 'forgot' | 'register' | 'invite' | 'reset'
  const [mode, setMode] = useState<AuthMode>(() => {
    const paramMode = searchParams.get('mode') as AuthMode | null;
    if (paramMode && ['login', 'forgot', 'register', 'invite', 'reset'].includes(paramMode)) {
      return paramMode;
    }
    return defaultMode;
  });

  // Inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    const err = searchParams.get('error');
    if (err === 'email_not_confirmed') {
      return 'Your email address is not verified yet. Please verify your email before accessing your account.';
    }
    if (err === 'auth_callback_failed') {
      return 'The verification or authentication link has expired or is invalid. Please request a new link.';
    }
    if (err === 'custom') {
      return searchParams.get('message') || 'Authentication failed. Please try again.';
    }
    return null;
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(() => {
    if (searchParams.get('verified') === 'true') {
      if (searchParams.get('note') === 'already_confirmed') {
        return 'Your email address is already verified! Please sign in using your registered Email & Password.';
      }
      return 'Email verified successfully! You can now log in with your email and password.';
    }
    if (searchParams.get('reset') === 'success') {
      return 'Your password was updated successfully. Please log in with your new password.';
    }
    if (searchParams.get('note') === 'invite_accepted') {
      return 'Your invitation was accepted and password set successfully! Please sign in.';
    }
    return null;
  });

  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [registerSubmitted, setRegisterSubmitted] = useState(false);

  // Sync mode with hash fragment (#forgot, #register, #invite, #reset, #login)
  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash.toLowerCase();
      if (defaultMode === 'reset') {
        setMode('reset');
        return;
      }
      if (hash.includes('type=recovery') || hash.includes('#reset')) {
        window.location.href = '/reset-password' + window.location.hash;
        return;
      }
      if (hash.includes('type=invite') || hash.includes('#invite')) {
        setMode('invite');
        return;
      }
      if (hash.includes('#forgot') || hash.includes('forgot-password')) {
        setMode('forgot');
        return;
      }
      if (hash.includes('#register') || hash.includes('create-account')) {
        setMode('register');
        return;
      }
      if (hash.includes('#login') || hash.includes('sign-in')) {
        setMode('login');
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  // Listen for Supabase recovery / session events
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/reset-password';
        return;
      }
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
          window.location.href = '/reset-password' + window.location.hash;
          return;
        }
        if (mode !== 'invite') {
          router.push('/');
          router.refresh();
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [router, mode]);

  // Mode Switcher that updates local state without page reload
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setForgotSubmitted(false);
    setRegisterSubmitted(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (typeof window !== 'undefined') {
      const newHash = newMode === 'login' ? '' : `#${newMode}`;
      window.history.replaceState(null, '', window.location.pathname + newHash);
    }
  };

  // 1. Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEmailUnconfirmed(false);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your registered email and password.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
          setIsEmailUnconfirmed(true);
          setErrorMessage('Your email address has not been verified yet. Please check your inbox and verify your email before logging in.');
        } else if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
          setErrorMessage('Invalid email or password. Please verify your credentials and try again.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.session) {
        document.cookie = 'sovereign_demo_session=; path=/; max-age=0; SameSite=Lax';
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setForgotSubmitted(true);
    } catch {
      setForgotSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  // 3. Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent('/login?verified=true')}`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: fullName.trim(),
            tier_label: 'Private Tier',
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          setErrorMessage('This email is already registered. Please sign in instead.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.session) {
        document.cookie = 'sovereign_demo_session=; path=/; max-age=0; SameSite=Lax';
        router.push('/');
        router.refresh();
        return;
      }

      setRegisterSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Accept Invitation Handler
  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      // If tokens are in hash fragment, initialize session
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage('Invitation accepted and password established successfully!');
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch {}
        switchMode('login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to accept invitation.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Reset Password Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      if (typeof window !== 'undefined') {
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage('Your security password was updated successfully! Please sign in with your new password.');
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch {}
        switchMode('login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update security password.');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResendVerification = async () => {
    if (!email.trim() || resending) return;
    setResending(true);
    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/login?verified=true`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage(`A fresh verification link has been sent to ${email.trim()}. Please check your email.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  // Demo Fallback Mode
  const handleDemoAccess = () => {
    document.cookie = 'sovereign_demo_session=true; path=/; max-age=604800; SameSite=Lax';
    window.location.href = '/';
  };

  return (
    <div className="font-sans antialiased text-slate-800 bg-[#fbfaf6] min-h-screen md:min-h-[125vh] flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      {/* Main Container */}
      <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden ambient-glow">
        {/* Center Layout Wrapper: Perfectly matched height and aligned baselines */}
        <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-stretch">
          
          {/* Left Branding Section (Col-span 7): Aligned top-to-bottom with right card */}
          <section className="lg:col-span-7 flex flex-col justify-between" data-purpose="branding-panel">
            {/* Top & Main Copy Block */}
            <div>
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdf9e7] border border-[#fae3bf] text-[#a36a14] text-xs font-bold tracking-wider uppercase mb-7 sm:mb-9">
                <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                <span>PERSONAL WEALTH &amp; EXPENSE TRACKER</span>
              </div>
              {/* Brand Title & Core Value Proposition */}
              <h1 className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
                PERSONAL TRACKER
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-[#b48e28] mb-5 tracking-tight">
                Track Today. Stay Ahead Tomorrow.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg font-sans">
                Your all-in-one personal notebook for daily expenses, upcoming bills &amp; payables, and money lent with interest. Built for absolute clarity in Indian Rupees (₹).
              </p>
            </div>

            {/* Three Bottom Pillars / Feature Cards: Perfectly aligned to the bottom boundary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-8 mt-auto">
              {/* Feature 1: Clarity */}
              <div className="p-3.5 rounded-xl bg-white/85 border border-[#ede7d8] shadow-xs backdrop-blur-xs flex flex-col justify-between h-full">
                <div className="flex items-center gap-1.5 text-[#b48e28] text-xs font-bold uppercase tracking-wider mb-1.5">
                  <svg aria-hidden="true" className="w-3.5 h-3.5 text-[#b48e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <span>EXPENSE NOTEBOOK</span>
                </div>
                <p className="text-[12px] text-slate-600 leading-snug">
                  Log daily spending, receipts, and notes in seconds.
                </p>
              </div>

              {/* Feature 2: Control */}
              <div className="p-3.5 rounded-xl bg-white/85 border border-[#ede7d8] shadow-xs backdrop-blur-xs flex flex-col justify-between h-full">
                <div className="flex items-center gap-1.5 text-[#b48e28] text-xs font-bold uppercase tracking-wider mb-1.5">
                  <svg aria-hidden="true" className="w-3.5 h-3.5 text-[#b48e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <span>PAYABLES &amp; DUES</span>
                </div>
                <p className="text-[12px] text-slate-600 leading-snug">
                  Never miss a bill, EMI, or payment due date.
                </p>
              </div>

              {/* Feature 3: Confidence */}
              <div className="p-3.5 rounded-xl bg-white/85 border border-[#ede7d8] shadow-xs backdrop-blur-xs flex flex-col justify-between h-full">
                <div className="flex items-center gap-1.5 text-[#b48e28] text-xs font-bold uppercase tracking-wider mb-1.5">
                  <svg aria-hidden="true" className="w-3.5 h-3.5 text-[#b48e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <span>LENDING &amp; INTEREST</span>
                </div>
                <p className="text-[12px] text-slate-600 leading-snug">
                  Track money lent to people, interest rates, and repayments.
                </p>
              </div>
            </div>
          </section>

          {/* Right Auth Section (Col-span 5): Matches height and alignment perfectly */}
          <section className="lg:col-span-5 flex flex-col justify-between" data-purpose="auth-form-panel">
            <div className="w-full bg-white rounded-2xl p-7 sm:p-9 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between">
              
              {/* Dynamic Header according to selected mode */}
              <div>
                <header className="mb-6">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-7 h-7 rounded-lg bg-[#fdf9e7] text-[#b48e28] flex items-center justify-center shrink-0 border border-[#fae3bf]">
                      {mode === 'login' && (
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      )}
                      {mode === 'forgot' && (
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      )}
                      {mode === 'register' && (
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      )}
                      {(mode === 'invite' || mode === 'reset') && (
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                      {mode === 'login' && 'Sign In'}
                      {mode === 'forgot' && 'Forgot Password'}
                      {mode === 'register' && (registerSubmitted ? 'Check Your Email' : 'Create Account')}
                      {mode === 'invite' && 'Accept Invitation'}
                      {mode === 'reset' && 'Set New Password'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 pl-9 leading-relaxed font-sans">
                    {mode === 'login' && 'Enter your email and password to access your personal tracker.'}
                    {mode === 'forgot' && 'Enter your email to receive password reset instructions.'}
                    {mode === 'register' && (registerSubmitted ? 'Verify your email address to access your tracker.' : 'Sign up with your email and password to start tracking.')}
                    {mode === 'invite' && 'Establish your security password to activate your access.'}
                    {mode === 'reset' && 'Establish a fresh security password for your personal tracker account.'}
                  </p>
                </header>

                {/* Success Notification Alert */}
                {successMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                    <svg aria-hidden="true" className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Error Alert */}
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-1.5 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <svg aria-hidden="true" className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{errorMessage}</span>
                    </div>
                    {isEmailUnconfirmed && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="mt-1 self-start text-xs font-bold text-[#b87d22] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <span>{resending ? 'Resending...' : 'Click here to resend verification email'}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* FORM 1: Sign In Mode */}
                {mode === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5" htmlFor="work-email">
                        Email Address <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative rounded-lg">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                          </svg>
                        </div>
                        <input
                          className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition duration-150 ease-in-out"
                          id="work-email"
                          name="email"
                          placeholder="you@example.com"
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase" htmlFor="password">
                          Password <span className="text-amber-600">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-[11px] font-bold text-[#b48e28] hover:text-[#94721c] transition cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative rounded-lg">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                          </svg>
                        </div>
                        <input
                          className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition duration-150 ease-in-out"
                          id="password"
                          name="password"
                          placeholder="••••••••••••"
                          required
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          aria-label="Toggle password visibility"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <svg className="h-4 w-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-1 flex flex-col gap-2.5">
                      <button
                        className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-xs text-sm font-bold text-slate-950 bg-[#d4af37] hover:bg-[#b48e28] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>Authenticating...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In to Tracker</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDemoAccess}
                        className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 rounded-xl border border-slate-200/90 bg-[#fafafa] hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-[#b48e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
                          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" strokeWidth="1.8" />
                        </svg>
                        <span>Explore Demo Mode (1-Click Preview)</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* FORM 2: Forgot Password Mode (In-place popup text change) */}
                {mode === 'forgot' && (
                  forgotSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-4 gap-3 text-center animate-in fade-in">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                        <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Reset Link Dispatched</h3>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        If an account matches <strong className="text-slate-800">{email}</strong>, a password reset link has been dispatched to your inbox.
                      </p>
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="mt-3 w-full py-2.5 px-4 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Return to Sign In</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4 animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5" htmlFor="forgot-email">
                          Registered Email <span className="text-amber-600">*</span>
                        </label>
                        <div className="relative rounded-lg">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                            </svg>
                          </div>
                          <input
                            className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition duration-150 ease-in-out"
                            id="forgot-email"
                            placeholder="you@example.com"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-xs text-sm font-bold text-slate-950 bg-[#d4af37] hover:bg-[#b48e28] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                              <span>Dispatching Instructions...</span>
                            </>
                          ) : (
                            <>
                              <span>Send Reset Instructions</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )
                )}

                {/* FORM 3: Account Creation Mode */}
                {mode === 'register' && (
                  registerSubmitted ? (
                    <div className="flex flex-col items-center text-center gap-3 py-2 animate-in fade-in">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-1">
                        <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Verification Link Sent</h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
                        We sent a verification link to <strong className="text-slate-900">{email}</strong>. Please check your inbox and verify before logging in.
                      </p>
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="mt-2 w-full py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
                      >
                        Proceed to Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-3 animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1" htmlFor="reg-name">
                          Full Name <span className="text-amber-600">*</span>
                        </label>
                        <input
                          className="block w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                          id="reg-name"
                          placeholder="Your Name"
                          required
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1" htmlFor="reg-email-input">
                          Email Address <span className="text-amber-600">*</span>
                        </label>
                        <input
                          className="block w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                          id="reg-email-input"
                          placeholder="you@example.com"
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1" htmlFor="reg-pass-input">
                            Password <span className="text-amber-600">*</span>
                          </label>
                          <div className="relative rounded-lg">
                            <input
                              className="block w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                              id="reg-pass-input"
                              placeholder="Min 6 chars"
                              required
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                              aria-label="Toggle password visibility"
                              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <svg className="h-4 w-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1" htmlFor="reg-confirm-input">
                            Confirm <span className="text-amber-600">*</span>
                          </label>
                          <div className="relative rounded-lg">
                            <input
                              className="block w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                              id="reg-confirm-input"
                              placeholder="Repeat"
                              required
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                              aria-label="Toggle confirm password visibility"
                              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <svg className="h-4 w-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-xs text-sm font-bold text-slate-950 bg-[#d4af37] hover:bg-[#b48e28] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                              <span>Creating Account...</span>
                            </>
                          ) : (
                            <>
                              <span>Create Personal Account</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )
                )}

                {/* FORM 4: Accept Invitation Mode */}
                {mode === 'invite' && (
                  <form onSubmit={handleAcceptInvite} className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5" htmlFor="invite-password">
                        New Security Password <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative rounded-lg">
                        <input
                          className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                          id="invite-password"
                          placeholder="Minimum 6 characters"
                          required
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          aria-label="Toggle password visibility"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <svg className="h-4 w-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5" htmlFor="invite-confirm">
                        Confirm New Password <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative rounded-lg">
                        <input
                          className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                          id="invite-confirm"
                          placeholder="Repeat password"
                          required
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          aria-label="Toggle confirm password visibility"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <svg className="h-4 w-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-xs text-sm font-bold text-slate-950 bg-[#d4af37] hover:bg-[#b48e28] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>Activating Account...</span>
                          </>
                        ) : (
                          <>
                            <span>Accept Invitation &amp; Set Password</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* FORM 5: Reset Password Mode */}
                {mode === 'reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5" htmlFor="reset-password">
                        New Security Password <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative rounded-lg">
                        <input
                          className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                          id="reset-password"
                          placeholder="Minimum 6 characters"
                          required
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          aria-label="Toggle password visibility"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <svg className="h-4 w-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5" htmlFor="reset-confirm">
                        Confirm New Password <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative rounded-lg">
                        <input
                          className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                          id="reset-confirm"
                          placeholder="Repeat new password"
                          required
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          aria-label="Toggle confirm password visibility"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <svg className="h-4 w-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-xs text-sm font-bold text-slate-950 bg-[#d4af37] hover:bg-[#b48e28] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <span>Save New Password &amp; Continue</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Bottom Switch Links (Aligned cleanly at the card's base) */}
              <div className="pt-4 mt-2 text-center border-t border-slate-50">
                {mode === 'login' && (
                  <p className="text-xs text-slate-500">
                    New to Personal Tracker?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-bold text-[#b48e28] hover:text-[#94721c] hover:underline ml-1 cursor-pointer"
                    >
                      Create Account here
                    </button>
                  </p>
                )}

                {mode === 'forgot' && (
                  <p className="text-xs text-slate-500">
                    Remembered your password?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#b48e28] hover:text-[#94721c] hover:underline ml-1 cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </p>
                )}

                {mode === 'register' && (
                  <p className="text-xs text-slate-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#b48e28] hover:text-[#94721c] hover:underline ml-1 cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </p>
                )}

                {mode === 'invite' && (
                  <p className="text-xs text-slate-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#b48e28] hover:text-[#94721c] hover:underline ml-1 cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </p>
                )}

                {mode === 'reset' && (
                  <p className="text-xs text-slate-500">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#b48e28] hover:text-[#94721c] hover:underline ml-1 cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </p>
                )}
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* Page Footer */}
      <footer className="w-full py-6 px-4 text-center border-t border-[#ede9dd]/70 bg-transparent" data-purpose="site-footer">
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center space-y-2">
          {/* Security Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <svg aria-hidden="true" className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
            </svg>
            <span>Private &amp; Secure Ledger</span>
          </div>
          {/* Copyright Notice */}
          <p className="text-xs text-slate-500 font-normal">© 2025 Personal Tracker. All rights reserved.</p>
          {/* Legal Links */}
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <a className="hover:text-slate-700 transition" href="#privacy">Privacy Policy</a>
            <span>•</span>
            <a className="hover:text-slate-700 transition" href="#terms">Terms of Service</a>
            <span>•</span>
            <a className="hover:text-slate-700 transition" href="#security">Security Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen md:min-h-[125vh] bg-[#fbfaf6] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <UnifiedAuthContainer defaultMode="login" />
    </Suspense>
  );
}
