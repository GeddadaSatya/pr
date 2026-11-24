'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

export type DateFilterType =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'last-month'
  | 'custom-single'
  | 'custom-range';

export interface DateFilterValue {
  type: DateFilterType;
  singleDate?: string; // YYYY-MM-DD
  rangeFrom?: string;   // YYYY-MM-DD
  rangeTo?: string;     // YYYY-MM-DD
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatDateToKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatKeyToDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates start and end YYYY-MM-DD keys for any preset.
 */
export function getPresetDateRange(type: DateFilterType): { from?: string; to?: string } {
  const now = new Date();

  switch (type) {
    case 'today': {
      const todayKey = formatDateToKey(now);
      return { from: todayKey, to: todayKey };
    }
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      const yKey = formatDateToKey(y);
      return { from: yKey, to: yKey };
    }
    case 'this-week': {
      const day = now.getDay();
      const diffToMon = (day + 6) % 7;
      const start = new Date(now);
      start.setDate(now.getDate() - diffToMon);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { from: formatDateToKey(start), to: formatDateToKey(end) };
    }
    case 'last-week': {
      const day = now.getDay();
      const diffToMon = (day + 6) % 7;
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - diffToMon);
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      return { from: formatDateToKey(lastWeekStart), to: formatDateToKey(lastWeekEnd) };
    }
    case 'this-month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: formatDateToKey(start), to: formatDateToKey(end) };
    }
    case 'last-month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: formatDateToKey(start), to: formatDateToKey(end) };
    }
    default:
      return {};
  }
}

/**
 * Checks whether an item's date string / key falls within the active filter.
 */
export function matchesDateFilter(itemDate: string | Date | undefined, filter: DateFilterValue): boolean {
  if (filter.type === 'all') return true;
  if (!itemDate) return true;

  // Extract YYYY-MM-DD from various possible formats
  let key = '';
  if (itemDate instanceof Date) {
    key = formatDateToKey(itemDate);
  } else if (typeof itemDate === 'string') {
    const match = itemDate.match(/\d{4}-\d{2}-\d{2}/);
    if (match) {
      key = match[0];
    } else {
      // If it's a relative label like 'Today'
      if (itemDate.toLowerCase().includes('today')) {
        key = formatDateToKey(new Date());
      } else if (itemDate.toLowerCase().includes('yesterday')) {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        key = formatDateToKey(y);
      } else {
        // Fallback: try parsing
        const parsed = new Date(itemDate);
        if (!isNaN(parsed.getTime())) {
          key = formatDateToKey(parsed);
        } else {
          key = itemDate;
        }
      }
    }
  }

  if (!key) return true;

  if (filter.type === 'custom-single') {
    return key === (filter.singleDate || formatDateToKey(new Date()));
  }

  if (filter.type === 'custom-range') {
    const from = filter.rangeFrom || '1970-01-01';
    const to = filter.rangeTo || '2099-12-31';
    const min = from <= to ? from : to;
    const max = from <= to ? to : from;
    return key >= min && key <= max;
  }

  const range = getPresetDateRange(filter.type);
  if (range.from && range.to) {
    return key >= range.from && key <= range.to;
  }

  return true;
}

export function getDateFilterLabel(filter: DateFilterValue): string {
  const now = new Date();
  switch (filter.type) {
    case 'all':
      return 'All Dates';
    case 'today':
      return `Today (${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return `Yesterday (${y.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    }
    case 'this-week':
      return 'This Week';
    case 'last-week':
      return 'Last Week';
    case 'this-month':
      return `This Month (${now.toLocaleDateString('en-US', { month: 'short' })})`;
    case 'last-month': {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `Last Month (${lm.toLocaleDateString('en-US', { month: 'short' })})`;
    }
    case 'custom-single':
      return `Date: ${formatKeyToDisplay(filter.singleDate)}`;
    case 'custom-range': {
      const from = filter.rangeFrom || '';
      const to = filter.rangeTo || '';
      const min = from <= to ? from : to;
      const max = from <= to ? to : from;
      return `${formatKeyToDisplay(min)} – ${formatKeyToDisplay(max)}`;
    }
    default:
      return 'All Dates';
  }
}

interface DateFilterDropdownProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
  align?: 'left' | 'right';
  className?: string;
  size?: 'sm' | 'md';
}

export function DateFilterDropdown({
  value,
  onChange,
  align = 'left',
  className = '',
  size = 'md',
}: DateFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customTab, setCustomTab] = useState<'single' | 'range'>(
    value.type === 'custom-range' ? 'range' : 'single'
  );

  const todayStr = useMemo(() => formatDateToKey(new Date()), []);
  const [singleDateInput, setSingleDateInput] = useState(value.singleDate || todayStr);
  const [rangeFromInput, setRangeFromInput] = useState(value.rangeFrom || todayStr);
  const [rangeToInput, setRangeToInput] = useState(value.rangeTo || todayStr);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const activeLabel = useMemo(() => getDateFilterLabel(value), [value]);

  // Compute preset dynamic preview labels
  const presets = useMemo(() => {
    const now = new Date();
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const twRange = getPresetDateRange('this-week');
    const lwRange = getPresetDateRange('last-week');

    return [
      {
        type: 'all' as DateFilterType,
        label: 'All Dates',
        sub: 'Full ledger history',
      },
      {
        type: 'today' as DateFilterType,
        label: `Today (${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        sub: 'Current day entries',
      },
      {
        type: 'yesterday' as DateFilterType,
        label: `Yesterday (${yest.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        sub: 'Previous calendar day',
      },
      {
        type: 'this-week' as DateFilterType,
        label: 'This Week',
        sub: `${formatKeyToDisplay(twRange.from)} – ${formatKeyToDisplay(twRange.to)}`,
      },
      {
        type: 'last-week' as DateFilterType,
        label: 'Last Week',
        sub: `${formatKeyToDisplay(lwRange.from)} – ${formatKeyToDisplay(lwRange.to)}`,
      },
      {
        type: 'this-month' as DateFilterType,
        label: `This Month (${now.toLocaleDateString('en-US', { month: 'long' })})`,
        sub: `1st to ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      },
      {
        type: 'last-month' as DateFilterType,
        label: `Last Month (${lastMonth.toLocaleDateString('en-US', { month: 'long' })})`,
        sub: 'Full previous calendar month',
      },
    ];
  }, []);

  const handleApplySingle = () => {
    onChange({
      type: 'custom-single',
      singleDate: singleDateInput,
    });
    setIsOpen(false);
  };

  const handleApplyRange = () => {
    const min = rangeFromInput <= rangeToInput ? rangeFromInput : rangeToInput;
    const max = rangeFromInput <= rangeToInput ? rangeToInput : rangeFromInput;
    onChange({
      type: 'custom-range',
      rangeFrom: min,
      rangeTo: max,
    });
    setIsOpen(false);
  };

  const isFiltered = value.type !== 'all';
  const heightClass = size === 'sm' ? 'h-8 px-2.5 text-[11px]' : 'h-9 px-3 text-xs';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${heightClass} rounded-xl border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
          isFiltered
            ? 'bg-[#fef9e7] border-[#fae3bf] text-amber-900 shadow-2xs'
            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
        }`}
        title="Filter by Date"
      >
        <span className="material-symbols-outlined text-sm text-[#b48e28]">calendar_today</span>
        <span className="truncate max-w-[150px] sm:max-w-[200px]">{activeLabel}</span>
        <span className="material-symbols-outlined text-sm text-slate-400">expand_more</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-40 animate-fade-in top-full`}
        >
          {/* Presets Header */}
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
            <span>Preset Dates</span>
            <span className="text-[9px] font-semibold text-[#b48e28] bg-amber-50 px-1.5 py-0.5 rounded">7 Options</span>
          </div>

          {/* 7 Preset Options */}
          <div className="space-y-0.5 max-h-56 overflow-y-auto no-scrollbar">
            {presets.map((p) => {
              const isSelected = value.type === p.type;
              return (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => {
                    onChange({ type: p.type });
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#fef9e7] text-amber-950 font-bold border border-[#fae3bf]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="leading-snug">{p.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{p.sub}</span>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-sm text-[#b48e28] shrink-0">check</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-2.5 border-t border-slate-100" />

          {/* Custom Date Selection */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
              Custom Date Selection
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold mb-2">
              <button
                type="button"
                onClick={() => setCustomTab('single')}
                className={`py-1 rounded-md text-center transition-all cursor-pointer ${
                  customTab === 'single'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Single Date
              </button>
              <button
                type="button"
                onClick={() => setCustomTab('range')}
                className={`py-1 rounded-md text-center transition-all cursor-pointer ${
                  customTab === 'range'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Date Range
              </button>
            </div>

            {customTab === 'single' ? (
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Select Specific Date
                  </label>
                  <input
                    type="date"
                    value={singleDateInput}
                    onChange={(e) => setSingleDateInput(e.target.value)}
                    className="w-full h-8.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplySingle}
                  className="w-full h-8.5 bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  <span>Apply Single Date</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={rangeFromInput}
                      onChange={(e) => setRangeFromInput(e.target.value)}
                      className="w-full h-8.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={rangeToInput}
                      onChange={(e) => setRangeToInput(e.target.value)}
                      className="w-full h-8.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyRange}
                  className="w-full h-8.5 bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-sm">date_range</span>
                  <span>Apply Date Range</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
