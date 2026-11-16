'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { CATEGORIES_DATA } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

export function CategoryAnalytics() {
  const { privacyMode } = useFinance();
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

  const totalSpent = CATEGORIES_DATA.reduce((acc, cat) => acc + cat.amount, 0);

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-xs mb-6">
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
    </div>
  );
}
