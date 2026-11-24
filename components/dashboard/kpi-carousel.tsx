'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { formatCurrency } from '@/lib/utils';

export function KpiCarousel() {
  const { privacyMode, payables, loans, expenses, assets, setActiveTab } = useFinance();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    checkScrollPosition();
    el.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition);

    const timer = setTimeout(checkScrollPosition, 100);

    return () => {
      el.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
      clearTimeout(timer);
    };
  }, [checkScrollPosition]);

  const scrollLeft = () => {
    if (carouselRef.current && canScrollLeft) {
      carouselRef.current.scrollBy({ left: -(carouselRef.current.clientWidth / 2), behavior: 'smooth' });
      setTimeout(checkScrollPosition, 350);
    }
  };

  const scrollRight = () => {
    if (carouselRef.current && canScrollRight) {
      carouselRef.current.scrollBy({ left: carouselRef.current.clientWidth / 2, behavior: 'smooth' });
      setTimeout(checkScrollPosition, 350);
    }
  };

  // Dynamic calculations
  const totalPayables = payables
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalLoans = loans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.principalAmount, 0);

  const totalYield = loans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + (l.monthlyInterest || 0), 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPropertyAssets = assets.reduce((sum, a) => sum + a.valuation, 0);
  const monthlyBudget = 9500;
  const expensePercentage = Math.min(Math.round((totalExpenses / monthlyBudget) * 100), 100);
  const remainingBudget = Math.max(monthlyBudget - totalExpenses, 0);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Carousel Header Controls */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#d4af37]"></span>
          <span className="font-label-caps text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Key Wealth Indicators
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 shadow-xs ${
              canScrollLeft
                ? 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 hover:border-[#d4af37] hover:bg-slate-50 cursor-pointer active:scale-95'
                : 'bg-slate-100/70 border-slate-200/50 text-slate-300 opacity-40 cursor-not-allowed pointer-events-none'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 shadow-xs ${
              canScrollRight
                ? 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 hover:border-[#d4af37] hover:bg-slate-50 cursor-pointer active:scale-95'
                : 'bg-slate-100/70 border-slate-200/50 text-slate-300 opacity-40 cursor-not-allowed pointer-events-none'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Cards Carousel */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto gap-4 py-1 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth snap-x snap-mandatory scroll-pl-4 scroll-pr-4 md:scroll-pl-0 md:scroll-pr-0 no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Card 1: Total Property & Assets */}
        <div
          onClick={() => setActiveTab('assets')}
          className="min-w-[280px] w-[82vw] max-w-[340px] md:w-[calc(50%-0.5rem)] md:max-w-none md:min-w-[320px] shrink-0 snap-start bg-white p-4 md:p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between gap-4 relative overflow-hidden cursor-pointer hover:border-[#d4af37]/60 transition-colors"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#fed65b]"></div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="font-label-caps text-[11px] uppercase text-slate-500">Total Property &amp; Assets</span>
              <div className="flex items-baseline mt-1">
                <span className="font-headline-lg-mobile md:font-headline-lg font-serif text-slate-900 font-semibold tracking-tight">
                  {privacyMode ? '••••••' : `₹${Math.floor(totalPropertyAssets).toLocaleString('en-IN')}`}
                </span>
                <span className="font-label-numeric text-xs text-slate-500 font-medium">{privacyMode ? '' : '.00'}</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#735c00]">
              <span className="material-symbols-outlined text-lg">domain</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Liquidity Reserve</span>
              <span className="font-label-numeric font-semibold text-slate-800">74.2%</span>
            </div>
            {/* Fine Breakdown Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-100 flex overflow-hidden">
              <div className="h-full bg-[#fed65b]" style={{ width: '58%' }} title="Investments: 58%"></div>
              <div className="h-full bg-[#131b2e]" style={{ width: '24%' }} title="Banks: 24%"></div>
              <div className="h-full bg-[#735c00]" style={{ width: '18%' }} title="Bullion: 18%"></div>
            </div>
          </div>
        </div>

        {/* Card 2: Money You Owe (Debts) */}
        <div className="min-w-[280px] w-[82vw] max-w-[340px] md:w-[calc(50%-0.5rem)] md:max-w-none md:min-w-[320px] shrink-0 snap-start bg-white p-4 md:p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-[11px] uppercase text-slate-500">Money You Owe (Debts)</span>
                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-label-caps text-[10px] font-bold">
                  {payables.length} Due Soon
                </span>
              </div>
              <div className="flex items-baseline mt-1">
                <span className="font-headline-lg-mobile md:font-headline-lg font-serif text-red-700 font-semibold tracking-tight">
                  {privacyMode ? '••••••' : `₹${totalPayables.toLocaleString('en-IN')}`}
                </span>
                <span className="font-label-numeric text-xs text-red-500 font-medium">{privacyMode ? '' : '.00'}</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined text-lg">credit_card_off</span>
            </div>
          </div>
          {payables.length > 0 ? (
            <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-800 font-medium truncate">
                  Upcoming: {payables[0].creditorName}
                </span>
                <span className="font-label-numeric text-red-700 font-semibold">
                  {privacyMode ? '••••' : `₹${payables[0].amount.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="material-symbols-outlined text-xs text-red-600">schedule</span>
                <span>Due: {payables[0].dueDate || 'Upcoming'}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50/60 p-2.5 rounded-lg text-emerald-800 text-xs">
              <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
              <span className="font-medium">No pending payables • Dues clear</span>
            </div>
          )}
        </div>

        {/* Card 3: Money Lent to Others */}
        <div className="min-w-[280px] w-[82vw] max-w-[340px] md:w-[calc(50%-0.5rem)] md:max-w-none md:min-w-[320px] shrink-0 snap-start bg-white p-4 md:p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-[11px] uppercase text-slate-500">Money Lent to Others</span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-label-caps text-[10px] font-bold">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  +{privacyMode ? '••••' : `₹${Math.round(totalYield).toLocaleString('en-IN')}`}/mo
                </span>
              </div>
              <div className="flex items-baseline mt-1">
                <span className="font-headline-lg-mobile md:font-headline-lg font-serif text-slate-900 font-semibold tracking-tight">
                  {privacyMode ? '••••••' : `₹${totalLoans.toLocaleString('en-IN')}`}
                </span>
                <span className="font-label-numeric text-xs text-slate-500 font-medium">{privacyMode ? '' : '.00'}</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-lg">trending_up</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Average Interest Rate</span>
            <span className="font-semibold text-slate-900 font-label-numeric">
              {loans.length > 0
                ? `${(loans.reduce((acc, l) => acc + (l.interestRateAnnual || 0), 0) / loans.length).toFixed(1)}% p.a.`
                : '0.0% p.a.'}
            </span>
          </div>
        </div>

        {/* Card 4: Expense Budget Status */}
        <div className="min-w-[280px] w-[82vw] max-w-[340px] md:w-[calc(50%-0.5rem)] md:max-w-none md:min-w-[320px] shrink-0 snap-start bg-white p-4 md:p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#d4af37]"></div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="font-label-caps text-[11px] uppercase text-slate-500">This Month&apos;s Expenses</span>
              <div className="flex items-baseline mt-1">
                <span className="font-headline-lg-mobile md:font-headline-lg font-serif text-slate-900 font-semibold tracking-tight">
                  {privacyMode ? '••••••' : `₹${Math.floor(totalExpenses).toLocaleString('en-IN')}`}
                </span>
                <span className="font-label-numeric text-xs text-slate-500 font-medium">{privacyMode ? '' : '.00'}</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#fef9e7] flex items-center justify-center text-[#b48e28]">
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className="bg-[#d4af37] h-full rounded-full transition-all"
                style={{ width: `${expensePercentage}%` }}
              ></div>
            </div>
            <span className="text-xs text-slate-700 font-bold font-label-numeric">
              {privacyMode ? '••••' : `₹${remainingBudget.toLocaleString('en-IN')} rem`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
