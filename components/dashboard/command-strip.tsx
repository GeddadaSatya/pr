'use client';

import React from 'react';
import { useFinance } from '@/components/context/finance-context';

export function CommandStrip() {
  const { userProfile, openModal } = useFinance();

  return (
    <div className="flex flex-col w-full">
      {/* Mobile View (< 780px) */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Header Welcome Greeting */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center justify-between">
            <h1 className="font-headline-lg-mobile text-2xl text-slate-900 font-semibold tracking-tight">
              Good morning, {userProfile.name.split(' ')[0]}
            </h1>
          </div>
          <p className="font-body-sm text-xs text-slate-500">
            Thursday, Oct 1 • Track Today. Stay Ahead Tomorrow.
          </p>
        </div>

        {/* Sovereign Quick Actions Bar */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
          {/* Golden Primary Action */}
          <button
            onClick={() => openModal('expense')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#fed65b] text-[#745c00] shadow-sm hover:brightness-105 active:scale-95 transition-all shrink-0 cursor-pointer"
            type="button"
          >
            <span
              className="material-symbols-outlined text-lg leading-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add_circle
            </span>
            <span className="font-title-md text-sm font-semibold tracking-tight">+ Add Transaction</span>
          </button>

          {/* Crisp Sub-actions */}
          <button
            onClick={() => openModal('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white text-slate-800 shadow-sm border border-slate-200/80 hover:bg-slate-50 active:scale-95 transition-all shrink-0 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-base text-slate-500">receipt</span>
            <span className="font-body-md text-xs font-medium">Add Expense</span>
          </button>

          <button
            onClick={() => openModal('due')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-50/60 text-red-800 shadow-sm border border-red-200/80 hover:bg-red-100 active:scale-95 transition-all shrink-0 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-base text-red-600">alarm_add</span>
            <span className="font-body-md text-xs font-semibold">- To Give (Bill)</span>
          </button>

          <button
            onClick={() => openModal('receive')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50/60 text-emerald-800 shadow-sm border border-emerald-200/80 hover:bg-emerald-100 active:scale-95 transition-all shrink-0 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-base text-emerald-600">call_received</span>
            <span className="font-body-md text-xs font-semibold">+ To Receive</span>
          </button>

          <button
            onClick={() => openModal('loan')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white text-slate-800 shadow-sm border border-slate-200/80 hover:bg-slate-50 active:scale-95 transition-all shrink-0 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-base text-[#735c00]">handshake</span>
            <span className="font-body-md text-xs font-medium">Lend Money</span>
          </button>
        </div>
      </div>

      {/* Desktop View (>= 780px) */}
      <div className="hidden md:flex flex-col w-full gap-6">
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

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => openModal('expense')}
              className="group relative px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center gap-1.5 shadow-xs cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg text-[#b48e28]">edit_note</span>
              <span className="text-xs font-semibold">+ Add Expense</span>
            </button>

            <button
              onClick={() => openModal('due')}
              className="group relative px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-red-300 hover:bg-red-50/60 hover:text-red-700 transition-all duration-200 flex items-center gap-1.5 shadow-xs cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg text-red-600">alarm_add</span>
              <span className="text-xs font-semibold">- To Give (Bill)</span>
            </button>

            <button
              onClick={() => openModal('receive')}
              className="group relative px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-700 transition-all duration-200 flex items-center gap-1.5 shadow-xs cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg text-emerald-600">call_received</span>
              <span className="text-xs font-semibold">+ To Receive</span>
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
    </div>
  );
}
