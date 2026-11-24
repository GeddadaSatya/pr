'use client';

import React from 'react';
import Link from 'next/link';
import { useFinance } from '@/components/context/finance-context';
import { createClient } from '@/utils/supabase/client';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, userProfile } = useFinance();

  if (!isAuthModalOpen) return null;

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    document.cookie = 'sovereign_demo_session=; path=/; max-age=0; SameSite=Lax';
    localStorage.removeItem('wt_expenses');
    localStorage.removeItem('wt_payables');
    localStorage.removeItem('wt_borrowers');
    localStorage.removeItem('wt_assets');
    localStorage.removeItem('wt_peer_receivables');
    localStorage.removeItem('wt_notifications');
    closeAuthModal();
    window.location.href = '/login';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fdf6ea] border border-[#f0dfbe] flex items-center justify-center text-[#b87d22]">
              <span className="material-symbols-outlined text-xl">manage_accounts</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Personal Tracker Account
              </h2>
              <p className="text-xs text-slate-500">Security &amp; Account Settings</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
            type="button"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Current User Identity Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <img
            alt={userProfile.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-2xs"
            src={userProfile.avatarUrl}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-slate-900 truncate">{userProfile.name}</span>
            <span className="text-xs text-slate-500 truncate">{userProfile.email || 'Free / Demo Session'}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#fdf6ea] border border-[#f0dfbe] text-[#a36a14] text-[10px] font-bold uppercase tracking-wider shrink-0">
            {userProfile.tier}
          </span>
        </div>

        {/* Account & Password Quick Actions */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Account Management
          </span>

          {/* Reset / Forgot Password Option */}
          <Link
            href="/forgot-password"
            onClick={closeAuthModal}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-[#b87d22]/50 hover:bg-[#fdf6ea]/30 transition group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-lg text-[#b87d22]">lock_reset</span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#b87d22] transition">
                  Forgot / Reset Password
                </span>
                <span className="text-[11px] text-slate-500">
                  Request a password reset link to your registered email
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-base text-slate-400 group-hover:text-[#b87d22] transition">
              chevron_right
            </span>
          </Link>

          {/* Create New Account Option */}
          <Link
            href="/register"
            onClick={closeAuthModal}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-[#b87d22]/50 hover:bg-[#fdf6ea]/30 transition group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-lg text-emerald-600">person_add</span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">
                  Account Creation
                </span>
                <span className="text-[11px] text-slate-500">
                  Create a new personal tracker account with email &amp; password
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-base text-slate-400 group-hover:text-emerald-700 transition">
              chevron_right
            </span>
          </Link>

          {/* Sign In to Another Account */}
          <Link
            href="/login"
            onClick={closeAuthModal}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-[#b87d22]/50 hover:bg-[#fdf6ea]/30 transition group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-lg text-slate-600">login</span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 transition">
                  Sign In Screen
                </span>
                <span className="text-[11px] text-slate-500">
                  Switch account or sign in with your email &amp; password
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-base text-slate-400 group-hover:text-slate-600 transition">
              chevron_right
            </span>
          </Link>
        </div>

        {/* Modal Footer & Sign Out */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Sign Out</span>
          </button>
          <span className="text-[11px] text-slate-400">Personal Tracker v2.4.1</span>
        </div>
      </div>
    </div>
  );
}
