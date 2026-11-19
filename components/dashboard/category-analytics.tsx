'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { CATEGORIES_DATA } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

export function CategoryAnalytics() {
  const { expenses, privacyMode, openModal } = useFinance();
  const [selectedFilter, setSelectedFilter] = useState('Month (October)');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomCalendarOpen, setIsCustomCalendarOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const filterOptions = ['Last Day', 'Last Week', 'Month (October)'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsCustomCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);

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
                className="w-full h-11 rounded-xl bg-[#fed65b] hover:bg-[#eac446] active:scale-[0.99] text-[#735c00] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
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
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                type="button"
                title="Filter by Period"
              >
                <span className="material-symbols-outlined text-xl">filter_alt</span>
              </button>
            </div>

            {/* Dropdown Options for Mobile */}
            {isDropdownOpen && (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 flex flex-col gap-1">
                {filterOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedFilter(opt);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded text-xs font-semibold ${
                      selectedFilter === opt ? 'bg-[#fed65b]/40 text-[#745c00]' : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

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
                  <span className="font-label-numeric text-lg font-bold text-slate-900 mt-0.5">
                    {privacyMode ? '••••••' : `₹${totalSpent.toLocaleString('en-IN')}`}
                  </span>
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
                  <span className="font-label-numeric font-medium text-slate-900">
                    {privacyMode ? '••••' : '₹5,835.00'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#131b2e] shrink-0" />
                  <span className="font-body-md text-slate-800">Tech &amp; Infra</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label-numeric text-slate-400 text-xs">20%</span>
                  <span className="font-label-numeric font-medium text-slate-900">
                    {privacyMode ? '••••' : '₹3,890.00'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#735c00] shrink-0" />
                  <span className="font-body-md text-slate-800">Real Estate</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label-numeric text-slate-400 text-xs">9%</span>
                  <span className="font-label-numeric font-medium text-slate-900">
                    {privacyMode ? '••••' : '₹1,750.50'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#79849a] shrink-0" />
                  <span className="font-body-md text-slate-800">Client Hosting</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label-numeric text-slate-400 text-xs">6%</span>
                  <span className="font-label-numeric font-medium text-slate-900">
                    {privacyMode ? '••••' : '₹1,167.00'}
                  </span>
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
                className="h-10 px-6 rounded-xl bg-[#fed65b] hover:bg-[#eac446] active:scale-[0.99] text-[#735c00] text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
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

              <div className="flex flex-wrap items-center gap-2 relative" ref={filterRef}>
                <span className="px-2.5 py-1 rounded-full bg-[#fef9e7] text-[#b48e28] border border-[#d4af37]/30 text-xs font-semibold">
                  8 Active Categories
                </span>

                <div className="relative inline-block text-left">
                  <button
                    onClick={() => {
                      setIsCustomCalendarOpen(false);
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:border-[#d4af37] text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base text-slate-500">calendar_today</span>
                    <span>{selectedFilter}</span>
                    <span className="material-symbols-outlined text-sm text-slate-400">expand_more</span>
                  </button>

                  {/* Dropdown Options */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50">
                      {filterOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setSelectedFilter(opt);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-medium cursor-pointer ${
                            selectedFilter === opt
                              ? 'bg-[#fef9e7] text-[#b48e28] font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsCustomCalendarOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-blue-700 font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                      >
                        <span>Custom Range</span>
                        <span className="material-symbols-outlined text-sm">date_range</span>
                      </button>
                    </div>
                  )}

                  {/* Custom 2-Month Calendar Popover */}
                  {isCustomCalendarOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50 w-[340px] sm:w-[580px]">
                      <div className="flex flex-col sm:flex-row gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                        {/* Month 1: October */}
                        <div className="flex-1 sm:pr-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-xs text-slate-900">October 2026</span>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1">
                            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-700">
                            {[...Array(4)].map((_, i) => (
                              <div key={`empty-${i}`} className="py-1 text-slate-300">{27 + i}</div>
                            ))}
                            {[...Array(31)].map((_, i) => (
                              <button
                                key={`oct-${i + 1}`}
                                className={`py-1 rounded-full hover:bg-slate-100 transition-colors ${
                                  i + 1 >= 15 && i + 1 <= 28 ? 'bg-blue-50 text-blue-700 font-semibold' : ''
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Month 2: November */}
                        <div className="flex-1 pt-3 sm:pt-0 sm:pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-xs text-slate-900">November 2026</span>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1">
                            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-700">
                            {[...Array(30)].map((_, i) => (
                              <button
                                key={`nov-${i + 1}`}
                                className={`py-1 rounded-full hover:bg-slate-100 transition-colors ${
                                  i + 1 === 16 ? 'bg-blue-600 text-white font-bold' : ''
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
                        <button
                          onClick={() => setIsCustomCalendarOpen(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFilter('Oct 15 - Nov 16');
                            setIsCustomCalendarOpen(false);
                          }}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                        >
                          Apply Range
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chart & Category List Flex Container */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-4 bg-slate-50/50 rounded-xl border border-slate-200/60">
              {/* Left SVG Donut Chart */}
              <div className="w-full lg:w-72 shrink-0 flex flex-col items-center justify-center p-2 lg:border-r border-slate-200/80">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="60" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                    {CATEGORIES_DATA.map((cat, idx) => (
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
                    <span className="font-title-md text-base font-bold text-slate-900">
                      {formatCurrency(totalSpent, privacyMode)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 mt-0.5 rounded-full bg-slate-200/60 text-slate-600 font-medium">
                      8 Sectors
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 mt-2 font-medium">
                  Top Sector: <strong className="text-slate-800 font-semibold">Travel (30%)</strong>
                </span>
              </div>

              {/* Right Scrollable Category Grid */}
              <div className="flex-1 w-full lg:pl-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {CATEGORIES_DATA.map((cat) => (
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
                        <span className="text-slate-900 font-semibold">
                          {formatCurrency(cat.amount, privacyMode)}
                        </span>
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
