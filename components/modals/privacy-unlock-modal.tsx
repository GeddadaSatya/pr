'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '@/components/context/finance-context';

export function PrivacyUnlockModal() {
  const {
    isPrivacyModalOpen,
    closePrivacyModal,
    setPrivacyMode,
    privacyPin,
    setPrivacyPin,
    verifyPrivacyPin,
  } = useFinance();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isPrivacyModalOpen) {
      setPassword('');
      setError(null);
      setIsChangingPin(false);
      setNewPin('');
      setChangeSuccess(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isPrivacyModalOpen]);

  if (!isPrivacyModalOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your password or PIN.');
      return;
    }

    if (verifyPrivacyPin(password.trim())) {
      setPrivacyMode(false);
      closePrivacyModal();
    } else {
      setError('Incorrect password. Default PIN is 1234.');
      inputRef.current?.select();
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.trim().length < 4) {
      setError('PIN must be at least 4 characters/digits.');
      return;
    }
    setPrivacyPin(newPin.trim());
    setChangeSuccess(true);
    setIsChangingPin(false);
    setError(null);
    setPassword(newPin.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fef9e7] border border-[#d4af37]/40 flex items-center justify-center text-[#b48e28] shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900 leading-tight">
                Unlock Privacy Mode
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter password to reveal balances
              </p>
            </div>
          </div>

          <button
            onClick={closePrivacyModal}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            type="button"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Error or Success notification */}
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {changeSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
            <span>PIN updated successfully! You can now unlock.</span>
          </div>
        )}

        {/* Main Unlock Form */}
        {!isChangingPin ? (
          <form onSubmit={handleUnlock} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Vault Password / PIN
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-base pointer-events-none">
                  key
                </span>
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter PIN (Default: 1234)"
                  className="w-full h-11 pl-9 pr-10 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Default PIN: <strong className="text-slate-600 font-mono">1234</strong></span>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(true);
                  setError(null);
                }}
                className="text-[#b48e28] hover:underline font-semibold cursor-pointer"
              >
                Change PIN
              </button>
            </div>

            {/* Standardized Gold Unlock Button */}
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs md:text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <span className="material-symbols-outlined text-base">lock_open</span>
              <span>Unlock &amp; Reveal Values</span>
            </button>
          </form>
        ) : (
          /* Change PIN Sub-form */
          <form onSubmit={handleSaveNewPin} className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                New Custom PIN (min 4 digits)
              </label>
              <input
                type="text"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="e.g. 5678"
                autoFocus
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsChangingPin(false)}
                className="flex-1 h-9 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-9 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                Save PIN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
