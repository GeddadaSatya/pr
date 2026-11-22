'use client';

import React from 'react';
import { useFinance } from '@/components/context/finance-context';

export function MobileHeader() {
  const { userProfile, openAuthModal, privacyMode, requestRevealPrivacy } = useFinance();

  return (
    <header className="fixed top-0 w-full z-40 bg-[#f7f9fb]/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-b border-slate-200/40 md:hidden">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#020b1e] border border-slate-800 overflow-hidden flex items-center justify-center shadow-xs shrink-0">
            <img src="/brand-logo.png" alt="PR Logo" className="w-full h-full object-cover scale-105" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-caps text-xs text-[#735c00] tracking-widest uppercase font-bold">
              PERSONAL TRACKER
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Privacy Mode Eye Toggle Button for Mobile Navbar */}
          <button
            onClick={requestRevealPrivacy}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
              privacyMode
                ? 'bg-amber-50/80 border-amber-300/80 text-[#b48e28]'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950'
            }`}
            title={privacyMode ? "Privacy Mode: Values Hidden (Click to enter password and reveal)" : "Privacy Mode: Values Visible (Click to hide)"}
            aria-label="Toggle Privacy Mode"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">
              {privacyMode ? 'visibility_off' : 'visibility'}
            </span>
          </button>

          <button
            aria-label="Notifications"
            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
          </button>
          
          <button
            onClick={openAuthModal}
            className="p-0.5 rounded-full ring-1 ring-[#b48e28]/40 hover:ring-[#b48e28] transition-all cursor-pointer"
            type="button"
            title="Profile & Settings"
          >
            <img
              alt={userProfile.name}
              className="w-8 h-8 rounded-full object-cover"
              src={userProfile.avatarUrl}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
