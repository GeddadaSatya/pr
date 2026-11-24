'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '@/components/context/finance-context';

type ModalStep = 'unlock' | 'verify-password' | 'set-pin';

export function PrivacyUnlockModal() {
  const {
    isPrivacyModalOpen,
    closePrivacyModal,
    setPrivacyMode,
    privacyPin,
    setPrivacyPin,
    verifyPrivacyPin,
    verifyAccountPassword,
  } = useFinance();

  const [step, setStep] = useState<ModalStep>('unlock');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState(false);

  const unlockInputRef = useRef<HTMLInputElement>(null);
  const authInputRef = useRef<HTMLInputElement>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isPrivacyModalOpen) {
      setStep('unlock');
      setPassword('');
      setShowPassword(false);
      setAccountPassword('');
      setShowAccountPassword(false);
      setNewPin('');
      setShowNewPin(false);
      setError(null);
      setIsVerifying(false);
      setChangeSuccess(false);
      setTimeout(() => {
        unlockInputRef.current?.focus();
      }, 100);
    }
  }, [isPrivacyModalOpen]);

  if (!isPrivacyModalOpen) return null;

  // 1. Unlock Handler
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(privacyPin ? 'Please enter your account password or PIN.' : 'Please enter your account password.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const valid = await verifyPrivacyPin(password.trim());
      if (valid) {
        setPrivacyMode(false);
        closePrivacyModal();
      } else {
        setError(privacyPin ? 'Incorrect credentials. Please enter your account password or custom PIN.' : 'Incorrect account password.');
        unlockInputRef.current?.select();
      }
    } catch {
      setError('Failed to verify credentials. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 2. Authorize PIN Setup with Account Password
  const handleAuthorizePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountPassword.trim()) {
      setError('Please enter your account password.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const valid = await verifyAccountPassword(accountPassword.trim());
      if (valid) {
        setStep('set-pin');
        setAccountPassword('');
        setError(null);
        setTimeout(() => {
          pinInputRef.current?.focus();
        }, 100);
      } else {
        setError('Incorrect account password. Please enter your default login password to proceed.');
        authInputRef.current?.select();
      }
    } catch {
      setError('Failed to verify account password. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 3. Save New Custom PIN
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = newPin.trim();
    if (!cleanPin || cleanPin.length < 4) {
      setError('PIN must be at least 4 characters/digits.');
      return;
    }

    setPrivacyPin(cleanPin);
    setChangeSuccess(true);
    setStep('unlock');
    setError(null);
    setPassword(cleanPin);
    setNewPin('');
    setTimeout(() => {
      unlockInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fef9e7] border border-[#d4af37]/40 flex items-center justify-center text-[#b48e28] shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-xl">
                {step === 'unlock' ? 'lock' : step === 'verify-password' ? 'shield_person' : 'dialpad'}
              </span>
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900 leading-tight">
                {step === 'unlock' && 'Unlock Privacy Mode'}
                {step === 'verify-password' && 'Confirm Account Password'}
                {step === 'set-pin' && (privacyPin ? 'Change Custom PIN' : 'Set Custom PIN')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {step === 'unlock' && (privacyPin ? 'Enter account password or custom PIN' : 'Enter account password to reveal values')}
                {step === 'verify-password' && 'Verify account password to authorize PIN setup'}
                {step === 'set-pin' && 'Create a 4+ digit PIN for quick unlocking'}
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

        {/* Error notification */}
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {changeSuccess && step === 'unlock' && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
            <span>Custom PIN configured successfully! You can unlock now.</span>
          </div>
        )}

        {/* STEP 1: Main Unlock Form */}
        {step === 'unlock' && (
          <form onSubmit={handleUnlock} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                {privacyPin ? 'Account Password or PIN' : 'Account Password'}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-lg pointer-events-none">
                  key
                </span>
                <input
                  ref={unlockInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={privacyPin ? 'Enter account password or PIN' : 'Enter account password'}
                  className="w-full h-11 pl-12 pr-11 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>{privacyPin ? 'Custom PIN: Active' : 'Default: Account Password'}</span>
              <button
                type="button"
                onClick={() => {
                  setStep('verify-password');
                  setError(null);
                  setAccountPassword('');
                  setTimeout(() => {
                    authInputRef.current?.focus();
                  }, 100);
                }}
                className="text-[#b48e28] hover:underline font-bold cursor-pointer"
              >
                {privacyPin ? 'Change PIN' : 'Set Custom PIN'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full h-11 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs md:text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1 disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">lock_open</span>
                  <span>Unlock &amp; Reveal Values</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Verify Account Password Before Setting/Changing PIN */}
        {step === 'verify-password' && (
          <form onSubmit={handleAuthorizePassword} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Current Account Password
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-lg pointer-events-none">
                  lock
                </span>
                <input
                  ref={authInputRef}
                  type={showAccountPassword ? 'text' : 'password'}
                  value={accountPassword}
                  onChange={(e) => {
                    setAccountPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter account login password"
                  className="w-full h-11 pl-12 pr-11 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowAccountPassword(!showAccountPassword)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showAccountPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-base">
                    {showAccountPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Authorize with your account password to {privacyPin ? 'change your custom PIN' : 'set a new custom PIN'}.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('unlock');
                  setError(null);
                  setAccountPassword('');
                }}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="flex-1 h-10 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isVerifying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Password</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Enter New Custom PIN */}
        {step === 'set-pin' && (
          <form onSubmit={handleSaveNewPin} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                {privacyPin ? 'New Custom PIN (min 4 digits)' : 'Set Custom PIN (min 4 digits)'}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-lg pointer-events-none">
                  dialpad
                </span>
                <input
                  ref={pinInputRef}
                  type={showNewPin ? 'text' : 'password'}
                  value={newPin}
                  onChange={(e) => {
                    setNewPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. 5678"
                  className="w-full h-11 pl-12 pr-11 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showNewPin ? 'Hide PIN' : 'Show PIN'}
                  aria-label="Toggle PIN visibility"
                >
                  <span className="material-symbols-outlined text-base">
                    {showNewPin ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                No need to enter any old PIN. You can update your PIN anytime with your account password.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('unlock');
                  setError(null);
                  setNewPin('');
                }}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>Save Custom PIN</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
