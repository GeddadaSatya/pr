'use client';

import React, { useRef } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { formatCurrency } from '@/lib/utils';

export function KpiCarousel() {
  const { privacyMode, payables, loans, expenses } = useFinance();
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -(carouselRef.current.clientWidth / 2), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: carouselRef.current.clientWidth / 2, behavior: 'smooth' });
    }
  };

  // Calculate dynamic totals from state
  const totalPayables = payables
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalLoans = loans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.principalAmount, 0);

  const totalYield = loans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.monthlyInterest, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyBudget = 9500;
  const expensePercentage = Math.min(Math.round((totalExpenses / monthlyBudget) * 100), 100);
  const remainingBudget = Math.max(monthlyBudget - totalExpenses, 0);

  return (
    <div className="w-full">
      {/* Carousel Header Controls */}
      <div className="flex items-center justify-between mb-3 w-full">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#d4af37]"></span>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Key Wealth Indicators
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-[#d4af37] hover:bg-slate-50 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-[#d4af37] hover:bg-slate-50 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Cards Carousel */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto gap-4 pb-3 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Card 1: Total Property & Assets */}
        <div
          className="rounded-xl bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors shrink-0 snap-start"
          style={{ width: 'calc(50% - 0.5rem)', minWidth: '320px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Total Property &amp; Assets
            </span>
            <span className="material-symbols-outlined text-slate-400 text-xl">account_balance</span>
          </div>
          <div className="my-3">
            <div className="font-headline-lg text-slate-900 font-semibold tracking-tight">
              {formatCurrency(620000, privacyMode)}
            </div>
            <span className="text-xs text-slate-500">Bank accounts, gold, property &amp; investments</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex border border-slate-200/60">
            <div className="bg-slate-900 h-full" style={{ width: '48%' }} title="Investments: 48%"></div>
            <div className="bg-[#d4af37] h-full" style={{ width: '28%' }} title="Banks: 28%"></div>
            <div className="bg-amber-600 h-full" style={{ width: '16%' }} title="Bullion: 16%"></div>
            <div className="bg-slate-300 h-full" style={{ width: '8%' }} title="Cash: 8%"></div>
          </div>
        </div>

        {/* Card 2: Outstanding Payables */}
        <div
          className="rounded-xl bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors shrink-0 snap-start"
          style={{ width: 'calc(50% - 0.5rem)', minWidth: '320px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Money You Owe (Debts)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">notifications_active</span>{' '}
              {payables.length} Due Soon
            </span>
          </div>
          <div className="my-3">
            <div className="font-headline-lg text-red-700 font-semibold tracking-tight">
              {formatCurrency(totalPayables, privacyMode)}
            </div>
            <span className="text-xs text-slate-500">Pending bills, borrowed money &amp; payments</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Upcoming: {payables[0]?.creditorName || 'Marcus Vance'}</span>
            <span className="font-semibold text-red-700">
              {privacyMode ? '••••' : `₹${payables[0]?.amount?.toLocaleString('en-IN') || '2,500'} due soon`}
            </span>
          </div>
        </div>

        {/* Card 3: Money Lent to Others */}
        <div
          className="rounded-xl bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors shrink-0 snap-start"
          style={{ width: 'calc(50% - 0.5rem)', minWidth: '320px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Money Lent to Others
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
              +{privacyMode ? '••••' : `₹${Math.round(totalYield).toLocaleString('en-IN')}`}/mo Yield
            </span>
          </div>
          <div className="my-3">
            <div className="font-headline-lg text-slate-900 font-semibold tracking-tight">
              {formatCurrency(totalLoans, privacyMode)}
            </div>
            <span className="text-xs text-slate-500">Total money lent to friends and partners</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Average Interest Rate</span>
            <span className="font-semibold text-slate-900">18.0% p.a.</span>
          </div>
        </div>

        {/* Card 4: Expense Notebook Status */}
        <div
          className="rounded-xl bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors shrink-0 snap-start"
          style={{ width: 'calc(50% - 0.5rem)', minWidth: '320px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              This Month&apos;s Expenses
            </span>
            <span className="text-xs text-slate-500 font-medium">Budget: ₹9,500</span>
          </div>
          <div className="my-3">
            <div className="font-headline-lg text-slate-900 font-semibold tracking-tight">
              {formatCurrency(totalExpenses, privacyMode)}
            </div>
            <span className="text-xs text-slate-500">
              {expensePercentage}% of your monthly expense budget used
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className="bg-[#d4af37] h-full rounded-full transition-all"
                style={{ width: `${expensePercentage}%` }}
              ></div>
            </div>
            <span className="text-xs text-slate-700 font-bold">
              {privacyMode ? '••••' : `₹${remainingBudget.toLocaleString('en-IN')} rem`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
