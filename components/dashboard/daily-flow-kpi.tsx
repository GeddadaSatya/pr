'use client';

import React from 'react';
import { useFinance } from '@/components/context/finance-context';
import { formatCurrency } from '@/lib/utils';

interface DailyFlowKpiProps {
  onOpenDayLedger?: () => void;
}

export function DailyFlowKpi({ onOpenDayLedger }: DailyFlowKpiProps = {}) {
  const { expenses, privacyMode } = useFinance();

  // Dynamic calculations based on active expenses
  const todayExpenses = expenses.filter(
    (e) =>
      e.dateTime.toLowerCase().includes('today') ||
      e.dateTime.toLowerCase().includes('just now')
  );
  const todayOutflow = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const yesterdayExpenses = expenses.filter((e) =>
    e.dateTime.toLowerCase().includes('yesterday')
  );
  const yesterdayOutflow = yesterdayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Inflow baseline (mocked credits + investment yield collected)
  const isZeroData = expenses.length === 0;
  const todayInflow = isZeroData ? 0 : 5200.0;
  const yesterdayInflow = isZeroData ? 0 : 3800.0;

  // Delta calculations
  const outflowDiff = todayOutflow - yesterdayOutflow;
  const outflowPercent =
    yesterdayOutflow > 0
      ? Math.round(((todayOutflow - yesterdayOutflow) / yesterdayOutflow) * 100)
      : 0;

  const inflowDiff = todayInflow - yesterdayInflow;
  const inflowPercent =
    yesterdayInflow > 0
      ? Math.round(((todayInflow - yesterdayInflow) / yesterdayInflow) * 100)
      : 0;

  const netDaily = todayInflow - todayOutflow;
  const dailyTarget = 4000;
  const budgetUsedPercent = Math.min(Math.round((todayOutflow / dailyTarget) * 100), 100);

  return (
    <div className="w-full flex flex-col gap-2.5" id="daily-cash-pulse-section">
      {/* Section Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-label-caps text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Daily Cash Pulse (Today vs Yesterday)
          </span>
        </div>

        {!isZeroData && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                Net 24h Velocity:
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight shadow-xs transition-colors ${
                  netDaily >= 0
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                    : 'bg-red-50 text-red-700 border border-red-200/80'
                }`}
              >
                <span className="material-symbols-outlined text-xs">
                  {netDaily >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                {privacyMode
                  ? '••••••'
                  : `${netDaily >= 0 ? '+' : '-'}₹${Math.abs(netDaily).toLocaleString('en-IN')}.00 Net ${
                      netDaily >= 0 ? 'Surplus' : 'Deficit'
                    }`}
              </span>
            </div>

            {onOpenDayLedger && (
              <button
                type="button"
                onClick={onOpenDayLedger}
                className="text-xs font-semibold text-[#b48e28] hover:text-[#8c6b12] flex items-center gap-0.5 transition-colors cursor-pointer ml-1"
                title="Open Day Ledger"
              >
                <span className="hidden sm:inline">View Day Ledger</span>
                <span className="sm:hidden">Day Ledger</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2-Card Grid: Desktop (gap-6) & Mobile (gap-3) */}
      <div className="grid grid-cols-2 gap-3 md:gap-6 w-full">
        {/* CARD 1: TODAY'S CASH INFLOW */}
        <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between gap-3 relative overflow-hidden">
          {/* Emerald Top Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

          {/* Top Label & Icon */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-[10px] md:text-[11px] uppercase text-slate-500 font-bold tracking-wider truncate">
                Today&apos;s Inflow
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline-lg-mobile md:font-headline-lg text-slate-900 font-semibold tracking-tight text-base sm:text-2xl md:text-3xl">
                  {privacyMode
                    ? '••••••'
                    : `₹${todayInflow.toLocaleString('en-IN')}`}
                </span>
                <span className="font-label-numeric text-xs text-slate-400">
                  {privacyMode ? '' : '.00'}
                </span>
              </div>
            </div>

            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-lg">
                arrow_downward
              </span>
            </div>
          </div>

          {/* Bottom Comparison vs Yesterday */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
            {isZeroData ? (
              <span className="text-[11px] text-slate-400 font-medium">
                No inflows recorded today
              </span>
            ) : (
              <>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {inflowDiff >= 0 ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] md:text-[11px] font-bold">
                      <span className="material-symbols-outlined text-xs">trending_up</span>
                      +{privacyMode ? '•••' : `₹${inflowDiff.toLocaleString('en-IN')}`} (+{inflowPercent}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200/60 text-[10px] md:text-[11px] font-bold">
                      <span className="material-symbols-outlined text-xs">trending_down</span>
                      -{privacyMode ? '•••' : `₹${Math.abs(inflowDiff).toLocaleString('en-IN')}`} ({inflowPercent}%)
                    </span>
                  )}
                  <span className="text-[10px] md:text-[11px] text-slate-500 font-medium">
                    vs yesterday
                  </span>
                </div>
                <span className="text-[10px] md:text-[11px] text-slate-500 truncate hidden sm:inline">
                  Yesterday: {privacyMode ? '••••' : `₹${yesterdayInflow.toLocaleString('en-IN')}.00`} • Consulting tranche &amp; Yield
                </span>
              </>
            )}
          </div>
        </div>

        {/* CARD 2: TODAY'S CASH OUTFLOW (WITH DAY-OVER-DAY SUBTRACTION) */}
        <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between gap-3 relative overflow-hidden">
          {/* Gold / Amber Top Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#fed65b]" />

          {/* Top Label & Icon */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-[10px] md:text-[11px] uppercase text-slate-500 font-bold tracking-wider truncate">
                Today&apos;s Outflow
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline-lg-mobile md:font-headline-lg text-slate-900 font-semibold tracking-tight text-base sm:text-2xl md:text-3xl">
                  {privacyMode
                    ? '••••••'
                    : `₹${todayOutflow.toLocaleString('en-IN')}`}
                </span>
                <span className="font-label-numeric text-xs text-slate-400">
                  {privacyMode ? '' : '.00'}
                </span>
              </div>
            </div>

            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#fef9e7] text-[#b48e28] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-lg">
                arrow_upward
              </span>
            </div>
          </div>

          {/* Bottom Comparison vs Yesterday (Minus calculation) */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
            {isZeroData ? (
              <span className="text-[11px] text-slate-400 font-medium">
                0 outflows logged today
              </span>
            ) : (
              <>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {outflowDiff < 0 ? (
                    /* Favorable: Spent less today than yesterday (Down -> trending_down in red) */
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200/60 text-[10px] md:text-[11px] font-bold">
                      <span className="material-symbols-outlined text-xs">trending_down</span>
                      -{privacyMode ? '•••' : `₹${Math.abs(outflowDiff).toLocaleString('en-IN')}`} ({outflowPercent}%)
                    </span>
                  ) : outflowDiff > 0 ? (
                    /* Higher spend today than yesterday (Up -> trending_up in green) */
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] md:text-[11px] font-bold">
                      <span className="material-symbols-outlined text-xs">trending_up</span>
                      +{privacyMode ? '•••' : `₹${outflowDiff.toLocaleString('en-IN')}`} (+{outflowPercent}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] md:text-[11px] font-semibold">
                      Equal to yesterday
                    </span>
                  )}
                  <span className="text-[10px] md:text-[11px] text-slate-500 font-medium">
                    vs yesterday
                  </span>
                </div>

                {/* Progress bar vs daily budget limit */}
                <div className="flex flex-col gap-1 mt-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Target: {privacyMode ? '••••' : `₹${dailyTarget.toLocaleString('en-IN')}`}</span>
                    <span className="font-semibold text-slate-700">{budgetUsedPercent}% used</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        budgetUsedPercent > 90 ? 'bg-red-500' : 'bg-[#fed65b]'
                      }`}
                      style={{ width: `${budgetUsedPercent}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
