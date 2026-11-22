'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/components/context/finance-context';

export function Header() {
  const { userProfile, openAuthModal, isCollapsed, privacyMode, requestRevealPrivacy } = useFinance();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/90 backdrop-blur-md z-40 border-b border-slate-200 hidden md:block transition-all duration-300 ease-in-out ${
        isCollapsed ? 'left-20' : 'left-60'
      }`}
    >
      <div className="w-[80%] mx-auto h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Left spacing/slot */}
        </div>

        <div className="flex items-center gap-6">
          {/* Search & Notifications */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>
            <button
              aria-label="Notifications"
              className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all relative cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#d4af37] ring-2 ring-white"></span>
            </button>
            {/* Privacy Mode Eye Toggle */}
            <button
              onClick={requestRevealPrivacy}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                privacyMode
                  ? 'bg-amber-50 border-amber-300 text-[#b48e28]'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={privacyMode ? "Privacy Mode: Values Hidden (Click to enter password and reveal)" : "Privacy Mode: Values Visible (Click to hide)"}
              aria-label="Toggle Privacy Mode"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">
                {privacyMode ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200"></div>

          {/* Profile Dropdown */}
          <div className="relative pl-1" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1 pr-2 rounded-full hover:bg-slate-100/70 border border-transparent hover:border-slate-200 transition-all text-left focus:outline-none cursor-pointer"
              type="button"
            >
              <div className="relative w-10 h-10 shrink-0">
                <img
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#d4af37] shadow-xs"
                  src={userProfile.avatarUrl}
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-sm text-slate-800 leading-tight">
                  {userProfile.name}
                </span>
                <div className="mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#fef9e7] text-[#b48e28] border border-[#d4af37]/30">
                    {userProfile.tier}
                  </span>
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-slate-400 hover:text-slate-700 transition-transform text-lg ml-0.5 duration-200 ${dropdownOpen ? 'rotate-180' : ''
                  }`}
              >
                expand_more
              </span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1">
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg flex flex-col gap-1 mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 font-bold text-sm">
                      {userProfile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {userProfile.code}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">Private Wealth Client</span>
                  <div className="flex items-center gap-1.5 pt-1.5 mt-1 border-t border-slate-200/60">
                    <span className="material-symbols-outlined text-sm text-[#b48e28]">
                      verified
                    </span>
                    <span className="text-[11px] font-bold text-[#b48e28] uppercase tracking-wide">
                      Verified Sovereign Tier
                    </span>
                  </div>
                </div>

                <div className="flex flex-col py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      openAuthModal();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-xs font-medium cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-lg text-slate-500">
                      manage_accounts
                    </span>
                    <span>Account &amp; Security Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      openAuthModal();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-xs font-medium cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-lg text-[#b48e28]">
                      key
                    </span>
                    <span>Email OTP / Cloud Sync</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      openAuthModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50/70 transition-colors text-xs font-semibold cursor-pointer text-left"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg text-red-600">
                      lock
                    </span>
                    <span>Switch User / Auth</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
