'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { CATEGORIES_DATA } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import {
  DateFilterDropdown,
  DateFilterValue,
  matchesDateFilter,
} from '@/components/ui/date-filter-dropdown';

export function CategoryAnalytics() {
  const { expenses, privacyMode, openModal } = useFinance();
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ type: 'all' });

  // Filter expenses based on active date selection
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => matchesDateFilter(exp.dateKey || exp.dateTime, dateFilter));
  }, [expenses, dateFilter]);

  const totalSpent = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Dynamically calculate category stats from live filtered expenses
  const dynamicCategories = React.useMemo(() => {
    if (!filteredExpenses || filteredExpenses.length === 0) return [];
    const catMap: Record<string, number> = {};
    for (const exp of filteredExpenses) {
      const cat = exp.category || 'General';
      catMap[cat] = (catMap[cat] || 0) + exp.amount;
    }
    const total = Object.values(catMap).reduce((a, b) => a + b, 0) || 1;
    const colorPalette = ['#d4af37', '#0f172a', '#735c00', '#64748b', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6'];

    let cumulativePercent = 0;
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], index) => {
        const percent = Math.max(1, Math.round((amount / total) * 100));
        const color = colorPalette[index % colorPalette.length];
        const dashoffset = String(376.99 - (cumulativePercent / 100) * 376.99);
        cumulativePercent += percent;
        return {
          name,
          amount,
          percent,
          color,
          dasharray: '376.99',
          dashoffset,
        };
      });
  }, [expenses]);

  const topCategoryName = dynamicCategories[0]?.name || 'Travel';
  const topCategoryPercent = dynamicCategories[0]?.percent || 30;

  return (
    <div className="w-full">
      {/* Mobile View (< 780px) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col gap-4 md:hidden">
        {expenses.length === 0 ? (
          /* Empty State for Mobile Matching Reference Design */
          <>
            <div className="flex items-center justify-between">
              <span className="font-title-md text-base text-slate-900 font-semibold">
                Monthly Outflow Breakdown
              </span>
              <span className="text-xs font-medium text-slate-500">₹0 Spent</span>
            </div>

            {/* Circular Dotted Ring with Gold Pip */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    strokeDasharray="3 3.5"
                  />
                  {/* Gold pip at 12 o'clock */}
                  <circle cx="88" cy="50" r="3.5" fill="#735c00" />
                </svg>

                {/* Ring Inner Metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="font-label-caps text-[10px] text-slate-400 tracking-wider uppercase font-bold">
                    Month Total
                  </span>
                  <span className="font-label-numeric text-2xl font-bold text-slate-900 my-0.5">
                    ₹0.00
                  </span>
                  <span className="font-label-caps text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                    0 Outflows
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation & Action */}
            <div className="flex flex-col items-center text-center px-1">
              <h3 className="font-headline-sm text-base font-semibold text-slate-900 mb-1">
                No Expenses Recorded This Month
              </h3>
              <p className="font-body-sm text-xs text-slate-500 max-w-xs mb-4">
                Your spending breakdown and category insights will appear here once you record your first daily expense.
              </p>

              <button
                onClick={() => openModal('expense')}
                type="button"
                className="w-full h-11 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] active:scale-[0.99] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Record First Expense</span>
              </button>
            </div>
          </>
        ) : (
          /* Active Populated State for Mobile */
          <>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-caps text-[11px] uppercase text-slate-400 font-bold">Monthly Allocation</span>
                <span className="font-title-md text-base text-slate-900 font-semibold">Spending Breakdown</span>
              </div>
              <DateFilterDropdown value={dateFilter} onChange={setDateFilter} align="right" size="sm" />
            </div>

            {/* Donut Visualization & Center Metric */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#eceef0" strokeWidth="12" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke="#fed65b"
                    strokeDasharray="238.76"
                    strokeDashoffset="71.6"
                    strokeLinecap="round"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke="#131b2e"
                    strokeDasharray="238.76"
                    strokeDashoffset="191"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke="#735c00"
                    strokeDasharray="238.76"
                    strokeDashoffset="217"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke="#79849a"
                    strokeDasharray="238.76"
                    strokeDashoffset="224"
                    strokeWidth="12"
                  />
                </svg>
                {/* Donut Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="font-label-caps text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                    Total Spent
                  </span>
                  {privacyMode ? (
                    <span className="font-serif text-lg font-bold text-slate-900 mt-0.5">••••••</span>
                  ) : (
                    <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                      <span className="font-serif text-lg font-bold text-slate-900 tracking-tight">
                        ₹{Math.floor(totalSpent).toLocaleString('en-IN')}
                      </span>
                      <span className="font-label-numeric text-xs text-slate-400 font-medium">
                        .00
                      </span>
                    </div>
                  )}
                  <span className="font-label-caps text-[10px] text-[#735c00] font-bold mt-0.5">
                    8 Sectors
                  </span>
                </div>
              </div>
            </div>

            {/* Sector Breakdown List */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#fed65b] shrink-0" />
                  <span className="font-body-md text-slate-800">Travel &amp; Logistics</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label-numeric text-slate-400 text-xs">30%</span>
                  {privacyMode ? (
                    <span className="font-serif font-bold text-xs text-slate-900">••••</span>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="font-serif font-bold text-xs text-slate-900">₹5,835</span>
                      <span className="font-label-numeric text-[10px] text-slate-400 font-medium">.00</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#131b2e] shrink-0" />
                  <span className="font-body-md text-slate-800">Tech &amp; Infra</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label-numeric text-slate-400 text-xs">20%</span>
                  {privacyMode ? (
                    <span className="font-serif font-bold text-xs text-slate-900">••••</span>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="font-serif font-bold text-xs text-slate-900">₹3,890</span>
                      <span className="font-label-numeric text-[10px] text-slate-400 font-medium">.00</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#735c00] shrink-0" />
                  <span className="font-body-md text-slate-800">Real Estate</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label-numeric text-slate-400 text-xs">9%</span>
                  {privacyMode ? (
                    <span className="font-serif font-bold text-xs text-slate-900">••••</span>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="font-serif font-bold text-xs text-slate-900">₹1,750</span>
                      <span className="font-label-numeric text-[10px] text-slate-400 font-medium">.50</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#79849a] shrink-0" />
                  <span className="font-body-md text-slate-800">Client Hosting</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label-numeric text-slate-400 text-xs">6%</span>
                  {privacyMode ? (
                    <span className="font-serif font-bold text-xs text-slate-900">••••</span>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="font-serif font-bold text-xs text-slate-900">₹1,167</span>
                      <span className="font-label-numeric text-[10px] text-slate-400 font-medium">.00</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop View (>= 780px) */}
      <div className="hidden md:block rounded-xl bg-white border border-slate-200 p-6 shadow-xs">
        {expenses.length === 0 ? (
          /* Empty State for Desktop */
          <>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-widest">
                  Category Analytics
                </span>
                <div className="font-headline-md text-slate-900 font-semibold">
                  Monthly Outflow Breakdown
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500">₹0 Spent</span>
            </div>

            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    strokeDasharray="3 3.5"
                  />
                  <circle cx="88" cy="50" r="3.5" fill="#735c00" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="font-label-caps text-[10px] text-slate-400 tracking-wider uppercase font-bold">
                    Month Total
                  </span>
                  <span className="font-label-numeric text-2xl font-bold text-slate-900 my-0.5">
                    ₹0.00
                  </span>
                  <span className="font-label-caps text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                    0 Outflows
                  </span>
                </div>
              </div>

              <h3 className="font-headline-sm text-lg font-semibold text-slate-900 mb-1">
                No Expenses Recorded This Month
              </h3>
              <p className="font-body-sm text-xs text-slate-500 max-w-sm mb-6">
                Your spending breakdown and category insights will appear here once you record your first daily expense.
              </p>

              <button
                onClick={() => openModal('expense')}
                type="button"
                className="h-10 px-6 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] active:scale-[0.99] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Record First Expense</span>
              </button>
            </div>
          </>
        ) : (
          /* Populated State for Desktop */
          <>
            {/* Card Header & Time Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-widest">
                  Category Analytics
                </span>
                <div className="font-headline-md text-slate-900 font-semibold">
                  Spending Breakdown by Category
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 relative">
                <span className="px-2.5 py-1 rounded-full bg-[#fef9e7] text-[#b48e28] border border-[#d4af37]/30 text-xs font-semibold">
                  {dynamicCategories.length} Active {dynamicCategories.length === 1 ? 'Category' : 'Categories'}
                </span>

                {/* Universal Date Filter Dropdown with 7 Presets, Single Date, & Date Range */}
                <DateFilterDropdown value={dateFilter} onChange={setDateFilter} align="right" />
              </div>
            </div>

            {/* Chart & Category List Flex Container */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-4 bg-slate-50/50 rounded-xl border border-slate-200/60">
              {/* Left SVG Donut Chart */}
              <div className="w-full lg:w-72 shrink-0 flex flex-col items-center justify-center p-2 lg:border-r border-slate-200/80">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="60" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                    {dynamicCategories.map((cat, idx) => (
                      <circle
                        key={idx}
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="18"
                        strokeDasharray={cat.dasharray}
                        strokeDashoffset={cat.dashoffset}
                        className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                      />
                    ))}
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Total Spent
                    </span>
                    {privacyMode ? (
                      <span className="font-serif text-lg font-bold text-slate-900">••••••</span>
                    ) : (
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className="font-headline-sm font-serif font-bold text-slate-900">
                          ₹{Math.floor(totalSpent).toLocaleString('en-IN')}
                        </span>
                        <span className="font-label-numeric text-xs text-slate-500 font-medium">
                          .00
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] px-2 py-0.5 mt-0.5 rounded-full bg-slate-200/60 text-slate-600 font-medium">
                      {dynamicCategories.length} Sectors
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 mt-2 font-medium">
                  Top Sector: <strong className="text-slate-800 font-semibold">{topCategoryName} ({topCategoryPercent}%)</strong>
                </span>
              </div>

              {/* Right Scrollable Category Grid */}
              <div className="flex-1 w-full lg:pl-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {dynamicCategories.map((cat) => (
                    <div
                      key={cat.name}
                      className="flex flex-col justify-between p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          ></span>
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {cat.name}
                          </span>
                        </div>
                        <span
                          className="text-xs font-bold shrink-0"
                          style={{ color: cat.color === '#0f172a' ? '#334155' : cat.color }}
                        >
                          {cat.percent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-1.5">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Ledger Sum</span>
                        {privacyMode ? (
                          <span className="text-slate-900 font-bold font-serif text-xs">••••</span>
                        ) : (
                          <div className="flex items-baseline">
                            <span className="text-slate-900 font-bold font-serif text-xs">
                              ₹{Math.floor(cat.amount).toLocaleString('en-IN')}
                            </span>
                            <span className="font-label-numeric text-[10px] text-slate-400 font-medium">
                              .{(cat.amount % 1).toFixed(2).split('.')[1] || '00'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
