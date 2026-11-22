'use client';

import React, { useState } from 'react';
import { useFinance } from '@/components/context/finance-context';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const { openModal, payables, borrowers, expenses, assets } = useFinance();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleAction = (type: 'expense' | 'loan' | 'due' | 'ai') => {
    setIsMenuOpen(false);
    if (type === 'ai') {
      setIsAiAdvisorOpen(true);
      return;
    }
    openModal(type);
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === 'dues' || tabId === 'payables') {
      setActiveTab('payables');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Interactive Popup Modal & Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300 ease-out md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[340px] transition-all duration-300 ease-out md:hidden ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto translate-y-0 scale-100'
            : 'opacity-0 pointer-events-none translate-y-3 scale-95'
        }`}
      >
        {/* Rounded White Card */}
        <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/80 p-2 overflow-hidden">
          <div className="flex flex-col divide-y divide-slate-100">
            {/* 1. Log Expense */}
            <button
              onClick={() => handleAction('expense')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#b48e28] flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg leading-none">bolt</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-sm font-semibold text-slate-900">Log Expense</span>
                  <span className="font-body-sm text-xs text-slate-500">Immediate outflow entry</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#d4af37]/20 text-[#b48e28] font-label-numeric text-[11px] font-bold">
                +3
              </span>
            </button>

            {/* 2. Disburse Loan / Credit */}
            <button
              onClick={() => handleAction('loan')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#745c00] flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg leading-none">trending_up</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-sm font-semibold text-slate-900">Disburse Loan / Credit</span>
                  <span className="font-body-sm text-xs text-slate-500">Extend capital receivable</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-label-numeric text-[11px] font-semibold">
                +2
              </span>
            </button>

            {/* 3. Ask AI Assistant / Advisor (Highlighted State) */}
            <button
              onClick={() => handleAction('ai')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37]/25 active:bg-[#d4af37]/35 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#d4af37] text-slate-950 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <span className="material-symbols-outlined text-lg leading-none">chat_bubble</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-title-md text-sm font-bold text-slate-900">Ask AI Advisor</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#d4af37] text-slate-950 text-[9px] font-bold uppercase tracking-wider">
                      Fast
                    </span>
                  </div>
                  <span className="font-body-sm text-xs text-slate-500">Portfolio stewardship query</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#d4af37] text-slate-950 font-label-numeric text-[11px] font-bold">
                PRO
              </span>
            </button>

            {/* 4. Add Payable / Due Reminder */}
            <button
              onClick={() => handleAction('due')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg leading-none">alarm_add</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-sm font-semibold text-slate-900">Add Payable / Due</span>
                  <span className="font-body-sm text-xs text-slate-500">Scheduled bill reminder</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-red-100/70 text-red-700 font-label-numeric text-[11px] font-semibold">
                Due
              </span>
            </button>

            {/* 5. Record Inflow / Asset Deposit */}
            <button
              onClick={() => handleAction('expense')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg leading-none">savings</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-sm font-semibold text-slate-900">Record Inflow / Asset</span>
                  <span className="font-body-sm text-xs text-slate-500">Capital deposit &amp; dividends</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-label-numeric text-[11px] font-semibold">
                +Inflow
              </span>
            </button>
          </div>
        </div>

        {/* Subtle Arrow Pointer pointing down to '+' button */}
        <div className="w-3 h-3 bg-white border-r border-b border-slate-200/80 rotate-45 mx-auto -mt-1.5 shadow-xs"></div>
      </div>

      {/* Scooped Center Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 w-full pointer-events-none pb-safe md:hidden">
        <div className="relative w-full h-[68px] pointer-events-auto">
          {/* SVG Scooped Cutout Dock Background */}
          <svg
            className="absolute bottom-0 left-0 w-full h-[68px] drop-shadow-[0_-3px_12px_rgba(0,0,0,0.06)]"
            preserveAspectRatio="none"
            viewBox="0 0 375 68"
          >
            <path
              d="M0,0 L145,0 C156,0 162,10 167,20 C173,32 179,35 187.5,35 C196,35 202,32 208,20 C213,10 219,0 230,0 L375,0 L375,68 L0,68 Z"
              fill="#ffffff"
            />
          </svg>

          {/* Elevated Floating Center '+' Button */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-50">
            <button
              aria-label="Quick Actions"
              onClick={toggleMenu}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-slate-900 shadow-lg active:scale-95 transition-all duration-200 cursor-pointer ${
                isMenuOpen ? 'brightness-95 scale-105' : ''
              }`}
              style={{
                background: 'linear-gradient(135deg, #FDE68A 0%, #D4AF37 50%, #B48811 100%)',
                boxShadow: '0 4px 18px rgba(212, 175, 55, 0.45), 0 2px 6px rgba(0,0,0,0.08)',
              }}
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[28px] font-bold leading-none select-none transition-transform duration-300 ${
                  isMenuOpen ? 'rotate-45' : ''
                }`}
              >
                add
              </span>
            </button>
          </div>

          {/* Navigation Items Grid Symmetrical around center */}
          <div className="relative w-full h-full flex items-center justify-between px-2 pt-1">
            {/* Left side: Overview & Expenses */}
            <div className="flex items-center justify-around w-[40%]">
              {/* Tab 1: Overview */}
              <button
                onClick={() => handleTabClick('overview')}
                className={`flex flex-col items-center justify-center min-w-[56px] h-13 group relative cursor-pointer ${
                  activeTab === 'overview' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
                type="button"
              >
                <span
                  className="material-symbols-outlined text-[22px] group-hover:scale-105 transition-transform"
                  style={{ fontVariationSettings: activeTab === 'overview' ? "'FILL' 1" : "'FILL' 0" }}
                >
                  dashboard
                </span>
                <span className="font-label-caps text-[10px] tracking-tight uppercase font-bold mt-0.5">
                  Overview
                </span>
                {/* Active Dot Accent */}
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-colors ${
                    activeTab === 'overview' ? 'bg-[#735c00]' : 'bg-transparent'
                  }`}
                />
              </button>

              {/* Tab 2: Expenses */}
              <button
                onClick={() => handleTabClick('expenses')}
                className={`flex flex-col items-center justify-center min-w-[56px] h-13 group relative cursor-pointer ${
                  activeTab === 'expenses' || activeTab === 'day-ledger' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
                type="button"
              >
                <span
                  className="material-symbols-outlined text-[22px] group-hover:scale-105 transition-transform"
                  style={{ fontVariationSettings: activeTab === 'expenses' || activeTab === 'day-ledger' ? "'FILL' 1" : "'FILL' 0" }}
                >
                  receipt_long
                </span>
                <span className="font-label-caps text-[10px] tracking-tight uppercase font-medium mt-0.5">
                  Expenses
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-colors ${
                    activeTab === 'expenses' || activeTab === 'day-ledger' ? 'bg-[#735c00]' : 'bg-transparent'
                  }`}
                />
              </button>
            </div>

            {/* Center Spacer for the scoop */}
            <div className="w-[20%] pointer-events-none" />

            {/* Right side: Dues & Lending */}
            <div className="flex items-center justify-around w-[40%]">
              {/* Tab 3: Dues */}
              <button
                onClick={() => handleTabClick('dues')}
                className={`flex flex-col items-center justify-center min-w-[56px] h-13 group relative cursor-pointer ${
                  activeTab === 'dues' || activeTab === 'payables' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
                type="button"
              >
                <span
                  className="material-symbols-outlined text-[22px] group-hover:scale-105 transition-transform"
                  style={{ fontVariationSettings: activeTab === 'dues' || activeTab === 'payables' ? "'FILL' 1" : "'FILL' 0" }}
                >
                  event_upcoming
                </span>
                <span className="font-label-caps text-[10px] tracking-tight uppercase font-medium mt-0.5">
                  Dues
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-colors ${
                    activeTab === 'dues' || activeTab === 'payables' ? 'bg-[#735c00]' : 'bg-transparent'
                  }`}
                />
              </button>

              {/* Tab 4: Lending */}
              <button
                onClick={() => handleTabClick('lending')}
                className={`flex flex-col items-center justify-center min-w-[56px] h-13 group relative cursor-pointer ${
                  activeTab === 'lending' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
                type="button"
              >
                <span
                  className="material-symbols-outlined text-[22px] group-hover:scale-105 transition-transform"
                  style={{ fontVariationSettings: activeTab === 'lending' ? "'FILL' 1" : "'FILL' 0" }}
                >
                  handshake
                </span>
                <span className="font-label-caps text-[10px] tracking-tight uppercase font-medium mt-0.5">
                  Lending
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-colors ${
                    activeTab === 'lending' ? 'bg-[#735c00]' : 'bg-transparent'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* AI Wealth Advisor Modal */}
      {isAiAdvisorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in md:hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#fef9e7] border border-[#d4af37]/40 text-[#b48e28] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">
                    AI Wealth Advisor
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Real-time liquidity &amp; portfolio intelligence
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiAdvisorOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Live Insights */}
            <div className="flex flex-col gap-2.5">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs flex flex-col gap-1">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>Healthy Inflow Trajectory</span>
                </span>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Active loan portfolio yield is performing at an average rate across {borrowers.filter(b => b.status === 'active').length} active agreements.
                </p>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs flex flex-col gap-1">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">priority_high</span>
                  <span>Upcoming Dues Action</span>
                </span>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  You have {payables.filter(p => p.status === 'pending').length} pending vendor payables totaling ₹{payables.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}. Settle via ACH or wire to avoid penalties.
                </p>
              </div>
            </div>

            {/* Quick Navigation Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAiAdvisorOpen(false);
                  setActiveTab('payables');
                }}
                className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                View Payables
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAiAdvisorOpen(false);
                  setActiveTab('lending');
                }}
                className="h-9 px-3 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Inspect Loans
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
