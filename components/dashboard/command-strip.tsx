'use client';

import React from 'react';
import { useFinance } from '@/components/context/finance-context';

export function CommandStrip() {
  const { userProfile, openModal } = useFinance();

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Command Strip & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-4 pt-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-slate-900 font-bold tracking-tight">
              Good morning, {userProfile.name.split(' ')[0]} 👋
            </h2>
          </div>
          <p className="text-xs text-slate-500">Track Today. Stay Ahead Tomorrow.</p>
        </div>
      </div>

      {/* Headline & Quick Action Launchpad */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex w-2 h-2 rounded-full bg-[#d4af37]"></span>
            <span className="text-[11px] text-[#b48e28] uppercase tracking-widest font-bold">
              Personal Wealth Overview
            </span>
            <span className="text-slate-300 text-xs">/</span>
            <span className="text-[11px] text-slate-600 font-semibold">
              Real-time Balance
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-slate-900 font-semibold tracking-tight">
              Your Total Wealth &amp; Overview
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => openModal('expense')}
            className="group relative px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center gap-1.5 shadow-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg text-[#b48e28]">edit_note</span>
            <span className="text-xs font-semibold">Add Expense</span>
          </button>

          <button
            onClick={() => openModal('due')}
            className="group relative px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-red-200 hover:bg-red-50/50 hover:text-red-700 transition-all duration-200 flex items-center gap-1.5 shadow-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg text-red-600">alarm_add</span>
            <span className="text-xs font-semibold">Add Debt/Bill</span>
          </button>

          <button
            onClick={() => openModal('loan')}
            className="group relative px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold shadow-xs hover:shadow transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">handshake</span>
            <span className="text-xs font-bold">Lend Money</span>
          </button>
        </div>
      </div>
    </div>
  );
}
