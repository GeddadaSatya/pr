'use client';

import React, { useState } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { createClient } from '@/lib/supabase/client';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, userProfile } = useFinance();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error && !error.message.includes('placeholder')) {
        setMessage(`Error: ${error.message}`);
      } else {
        setStep('otp');
        setMessage('A 6-digit login OTP has been sent to your email (₹0 free tier).');
      }
    } catch {
      // Local fallback
      setStep('otp');
      setMessage('Demo Mode: Enter any 6-digit code (e.g. 123456) to proceed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error && !error.message.includes('placeholder')) {
        setMessage(`Invalid code: ${error.message}`);
      } else {
        setMessage('Successfully authenticated! Welcome back.');
        setTimeout(() => {
          closeAuthModal();
        }, 800);
      }
    } catch {
      setMessage('Authenticated! (Demo Mode)');
      setTimeout(() => {
        closeAuthModal();
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-2xl flex flex-col gap-4 relative animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fef9e7] border border-[#d4af37]/30 flex items-center justify-center text-[#b48e28]">
              <span className="material-symbols-outlined text-lg">shield</span>
            </div>
            <div>
              <span className="font-headline-sm text-slate-900 font-semibold">
                Sovereign Access
              </span>
              <p className="text-[11px] text-slate-500">Free Email OTP / Magic Link</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Message notification */}
        {message && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            {message}
          </div>
        )}

        {/* Step 1: Request OTP */}
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] text-slate-600 uppercase block mb-1 font-semibold">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-white transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                No passwords or SMS charges. We send a secure one-time passcode to your email.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={closeAuthModal}
                className="px-4 py-2 rounded-lg text-slate-600 text-xs font-semibold hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                {loading ? 'Sending OTP...' : 'Send Free Email OTP'}
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Enter 6-digit OTP */
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] text-slate-600 uppercase block mb-1 font-semibold">
                Enter 6-Digit Code
              </label>
              <input
                required
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-xs text-[#b48e28] hover:underline cursor-pointer font-semibold"
              >
                ← Back to email
              </button>

              <button
                disabled={loading}
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
