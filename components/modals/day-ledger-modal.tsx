'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NotebookEntry, DayLedgerData, DAY_LEDGER_CONFIGS, INITIAL_NOTEBOOK_ENTRIES } from '@/lib/notebook-data';
import { useFinance } from '@/components/context/finance-context';

interface DayLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateKey?: string;
  onAddTransaction?: () => void;
}

export function DayLedgerModal({
  isOpen,
  onClose,
  selectedDateKey = '2026-10-28',
  onAddTransaction,
}: DayLedgerModalProps) {
  const { privacyMode, openModal } = useFinance();
  const [currentDateKey, setCurrentDateKey] = useState(selectedDateKey);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Sync date key when prop changes
  useEffect(() => {
    if (selectedDateKey) {
      setCurrentDateKey(selectedDateKey);
    }
  }, [selectedDateKey]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Retrieve configuration for selected date
  const dayConfig = DAY_LEDGER_CONFIGS[currentDateKey] || DAY_LEDGER_CONFIGS['2026-10-28'];

  // Retrieve entries for selected date
  const dayEntries = INITIAL_NOTEBOOK_ENTRIES.filter((e) => e.dateKey === currentDateKey);

  // Filter entries
  const filteredEntries = dayEntries.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.paidWith.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const availableDates = [
    { key: '2026-10-28', label: 'Oct 28, 2026 (Today)' },
    { key: '2026-10-27', label: 'Oct 27, 2026 (Sunday)' },
    { key: '2026-10-25', label: 'Oct 25, 2026 (Friday)' },
  ];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'Dining', label: 'Dining' },
    { id: 'Travel', label: 'Travel' },
    { id: 'Hardware', label: 'Hardware' },
    { id: 'Wellness', label: 'Wellness' },
  ];

  const handleExportCSV = () => {
    const headers = ['Title', 'Category', 'Paid With', 'Date & Time', 'Status', 'Amount'];
    const rows = filteredEntries.map((e) => [
      `"${e.title}"`,
      `"${e.category}"`,
      `"${e.paidWith}"`,
      `"${e.time}"`,
      `"${e.statusBadge}"`,
      e.amount,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `day_ledger_${currentDateKey}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-fade-in">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200/90 p-5 md:p-8 z-10 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* Top Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Left: Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search transactions in this day..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-xs md:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 text-slate-900 placeholder:text-slate-400 transition-all"
            />
          </div>

          {/* Center / Right: Filters & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>{categories.find((c) => c.id === selectedCategory)?.label || 'All Categories'}</span>
                <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-fade-in">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between cursor-pointer"
                    >
                      <span>{cat.label}</span>
                      {selectedCategory === cat.id && (
                        <span className="material-symbols-outlined text-sm text-[#b48e28]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Selector Pill */}
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="h-10 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-slate-500">calendar_today</span>
                <span>{dayConfig.formattedDate}</span>
                <span className="material-symbols-outlined text-sm text-slate-400">expand_more</span>
              </button>

              {isDatePickerOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-fade-in">
                  {availableDates.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => {
                        setCurrentDateKey(d.key);
                        setIsDatePickerOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between cursor-pointer ${currentDateKey === d.key
                        ? 'bg-[#fef9e7] text-[#b48e28] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <span>{d.label}</span>
                      {currentDateKey === d.key && (
                        <span className="material-symbols-outlined text-sm text-[#b48e28]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action: PDF Folio */}
            <button
              onClick={handlePrintPDF}
              type="button"
              className="h-10 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span className="text-amber-600 text-sm">📄</span>
              <span>PDF Folio</span>
            </button>

            {/* Action: CSV / Excel */}
            <button
              onClick={handleExportCSV}
              type="button"
              className="h-10 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span className="text-emerald-600 text-sm">📊</span>
              <span>CSV / Excel</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              type="button"
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer ml-1"
              title="Close Ledger"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* DAILY CASH PULSE (TODAY VS YESTERDAY) */}
        <div className="flex flex-col gap-2.5">
          {/* Pulse Header Row */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                DAILY CASH PULSE (TODAY VS YESTERDAY)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                Net 24h Velocity:
              </span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${dayConfig.netVelocity >= 0
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                  : 'bg-red-50 text-red-700 border border-red-200/80'
                  }`}
              >
                <span className="material-symbols-outlined text-xs">
                  {dayConfig.netVelocity >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                {privacyMode
                  ? '••••••'
                  : `${dayConfig.netVelocity >= 0 ? '+' : '-'}₹${Math.abs(dayConfig.netVelocity).toLocaleString('en-IN')}.00 Net ${dayConfig.netVelocity >= 0 ? 'Surplus' : 'Deficit'
                  }`}
              </span>
            </div>
          </div>

          {/* 2 Daily KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 w-full">
            {/* Card 1: TODAY'S INFLOW */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-xs border border-slate-200/90 flex flex-col justify-between gap-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-[11px] uppercase text-slate-400 font-bold tracking-wider">
                    TODAY&apos;S INFLOW
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-kpi-val text-slate-900 tracking-tight">
                      {privacyMode ? '••••••' : `₹${Math.floor(dayConfig.inflow).toLocaleString('en-IN')}`}
                    </span>
                    <span className="font-label-numeric text-xs text-slate-400 font-medium">
                      {privacyMode ? '' : '.00'}
                    </span>
                  </div>
                </div>

                {dayConfig.inflowDelta >= 0 ? (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    <span>+₹{dayConfig.inflowDelta.toLocaleString('en-IN')} (+{dayConfig.inflowPercent}%)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-xs">trending_down</span>
                    <span>-₹{Math.abs(dayConfig.inflowDelta).toLocaleString('en-IN')} ({dayConfig.inflowPercent}%)</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] text-slate-500 font-medium inline-flex items-center gap-1">
                  <span>vs yesterday:</span>
                  <span className="font-semibold text-slate-700 font-label-numeric">
                    {privacyMode ? '••••' : `₹${dayConfig.yesterdayInflow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  </span>
                </span>
              </div>
            </div>

            {/* Card 2: TODAY'S OUTFLOW */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-xs border border-slate-200/90 flex flex-col justify-between gap-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-[11px] uppercase text-slate-400 font-bold tracking-wider">
                    TODAY&apos;S OUTFLOW
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-kpi-val text-slate-900 tracking-tight">
                      {privacyMode ? '••••••' : `₹${Math.floor(dayConfig.outflow).toLocaleString('en-IN')}`}
                    </span>
                    <span className="font-label-numeric text-xs text-slate-500 font-medium">
                      {privacyMode ? '' : '.00'}
                    </span>
                  </div>
                </div>

                {/* Corner Indicator Badge */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${dayConfig.outflowDelta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                  }`}>
                  <span className="material-symbols-outlined text-base">
                    {dayConfig.outflowDelta >= 0 ? 'trending_up' : 'trending_down'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {dayConfig.outflowDelta >= 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    <span>+₹{dayConfig.outflowDelta.toLocaleString('en-IN')} (+{dayConfig.outflowPercent}%)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-xs">trending_down</span>
                    <span>-₹{Math.abs(dayConfig.outflowDelta).toLocaleString('en-IN')} ({dayConfig.outflowPercent}%)</span>
                  </span>
                )}
                <span className="text-[11px] text-slate-500 font-medium inline-flex items-center gap-1 whitespace-nowrap">
                  <span>vs yesterday:</span>
                  <span className="font-semibold text-slate-700 font-label-numeric">
                    {privacyMode ? '••••' : `₹${dayConfig.yesterdayOutflow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  </span>
                </span>
              </div>

              {/* Target Ceiling & Progress Bar */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Target: ₹{dayConfig.targetCeiling.toLocaleString('en-IN')}</span>
                  <span className="font-semibold text-slate-700">
                    {Math.round((dayConfig.outflow / dayConfig.targetCeiling) * 100)}% used
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#d4af37] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Math.round((dayConfig.outflow / dayConfig.targetCeiling) * 100),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TRANSACTION DETAILS SECTION */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              TRANSACTION DETAILS
            </span>
            <span className="text-xs text-slate-500">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} logged
            </span>
          </div>

          {/* List of Transaction Cards */}
          <div className="flex flex-col gap-2.5">
            {filteredEntries.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No transactions match the selected filter.
              </div>
            ) : (
              filteredEntries.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {/* Category Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.category === 'Dining'
                        ? 'bg-[#fef9e7] text-[#b48e28]'
                        : item.category === 'Travel'
                          ? 'bg-blue-50 text-blue-600'
                          : item.category === 'Hardware'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-purple-50 text-purple-600'
                        }`}
                    >
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      {/* Title & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {item.tag}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{item.statusBadge}</span>
                        </span>
                      </div>

                      {/* Subtitle details */}
                      <span className="text-xs text-slate-500 mt-1 truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Amount */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <span className="text-base font-bold text-slate-900 tracking-tight font-label-numeric">
                      {privacyMode ? '••••••' : `-₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              openModal('expense');
            }}
            className="w-full sm:w-auto h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Edit Day&apos;s Entries
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onAddTransaction) {
                onAddTransaction();
              } else {
                openModal('expense');
              }
            }}
            className="w-full sm:w-auto h-10 px-4 rounded-xl bg-[#111c2d] hover:bg-[#1a283e] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Add Transaction to Ledger</span>
          </button>
        </div>
      </div>

    </div>
  );
}
