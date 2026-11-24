'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { NotebookEntry, INITIAL_NOTEBOOK_ENTRIES } from '@/lib/notebook-data';
import { AmountDisplay } from '@/components/ui/amount-display';
import { AppBreadcrumb } from '@/components/ui/app-breadcrumb';
import {
  DateFilterDropdown,
  DateFilterValue,
  matchesDateFilter,
} from '@/components/ui/date-filter-dropdown';

interface ExpenseNotebookViewProps {
  onOpenDayLedger: (dateKey: string) => void;
}

const QUICK_CATEGORIES = [
  { name: 'Dining', tag: 'Dining', icon: 'restaurant' },
  { name: 'Travel', tag: 'Travel', icon: 'directions_car' },
  { name: 'Hardware', tag: 'Hardware', icon: 'laptop_mac' },
  { name: 'Wellness', tag: 'Wellness', icon: 'fitness_center' },
];

export function ExpenseNotebookView({ onOpenDayLedger }: ExpenseNotebookViewProps) {
  const { privacyMode, openModal, addExpense, deleteExpense, expenses } = useFinance();
  const [quickInput, setQuickInput] = useState('');
  const [selectedQuickCategory, setSelectedQuickCategory] = useState<string | null>(null);
  const [showCategoryConfirmModal, setShowCategoryConfirmModal] = useState(false);
  const [categoryHighlight, setCategoryHighlight] = useState(false);
  const [parsedQuickEntry, setParsedQuickEntry] = useState<{ title: string; amount: string } | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ type: 'all' });
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search and Category filters
  const [topSearch, setTopSearch] = useState('');
  const [topCategory, setTopCategory] = useState('all');

  // User resets all filters
  const handleClearAllFilters = () => {
    setTopSearch('');
    setTopCategory('all');
    setDateFilter({ type: 'all' });
  };

  const isAnyFilterActive = Boolean(
    topSearch.trim() !== '' ||
    topCategory !== 'all' ||
    dateFilter.type !== 'all'
  );

  // Derive notebook entries directly from FinanceContext expenses
  const entries: NotebookEntry[] = React.useMemo(() => {
    return expenses.map((exp) => {
      const catLower = exp.category.toLowerCase();
      const icon = exp.icon || (catLower.includes('dining')
        ? 'restaurant'
        : catLower.includes('travel')
        ? 'directions_car'
        : catLower.includes('hardware') || catLower.includes('tech')
        ? 'laptop_mac'
        : catLower.includes('wellness')
        ? 'fitness_center'
        : catLower.includes('friend') || catLower.includes('advance')
        ? 'handshake'
        : 'receipt_long');

      return {
        id: exp.id,
        title: exp.title,
        subtitle: exp.subtitle || `Ledger entry • ${exp.dateTime || 'Oct 28'}`,
        tag: exp.tag || exp.category.split(' ')[0],
        category: exp.category,
        statusBadge: exp.statusBadge || 'Verified Receipt',
        paidWith: exp.paidWith || 'Direct Payment',
        dateTime: exp.dateTime || 'Today, Just now',
        amount: exp.amount,
        icon,
        dateGroup: exp.dateGroup || (exp.dateTime?.includes('Oct 27') || exp.dateTime?.includes('Yesterday') ? 'Sunday, October 27' : 'Today, October 28'),
        dateKey: exp.dateKey || (exp.dateTime?.includes('Oct 27') || exp.dateTime?.includes('Yesterday') ? '2026-10-27' : '2026-10-28'),
        time: exp.time || '12:00 PM',
        attachments: exp.receiptUrl ? [exp.receiptUrl] : undefined,
      };
    });
  }, [expenses]);

  const formatDateDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getCategoryPillClass = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('travel')) {
      return 'bg-[#fef9e7] text-[#9a761e] border border-[#d4af37]/40';
    }
    if (c.includes('tech') || c.includes('infra')) {
      return 'bg-[#f1f5f9] text-[#334155] border border-slate-200/80';
    }
    if (c.includes('client') || c.includes('hosting')) {
      return 'bg-[#eff6ff] text-[#1e40af] border border-blue-200/60';
    }
    if (c.includes('legal') || c.includes('retainer')) {
      return 'bg-[#eef2ff] text-[#4338ca] border border-indigo-200/60';
    }
    if (c.includes('real estate') || c.includes('maintenance')) {
      return 'bg-[#ecfdf5] text-[#047857] border border-emerald-200/70';
    }
    if (c.includes('dining')) {
      return 'bg-[#fff7ed] text-[#c2410c] border border-amber-200/60';
    }
    if (c.includes('hardware')) {
      return 'bg-[#f8fafc] text-[#334155] border border-slate-200';
    }
    if (c.includes('wellness')) {
      return 'bg-[#f0fdfa] text-[#0f766e] border border-teal-200/60';
    }
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  // Filter all entries into a single list (Table only, not individual days)
  const filteredEntries = entries.filter((item) => {
    const q = topSearch.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.paidWith.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q);

    const matchesCategory =
      topCategory === 'all' ||
      item.category.toLowerCase().includes(topCategory.toLowerCase()) ||
      item.tag.toLowerCase().includes(topCategory.toLowerCase());

    const matchesDate = matchesDateFilter(item.dateKey || item.dateTime, dateFilter);

    return matchesSearch && matchesCategory && matchesDate;
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortOrder === 'oldest') {
      return (a.dateKey || '').localeCompare(b.dateKey || '');
    } else {
      return (b.dateKey || '').localeCompare(a.dateKey || '');
    }
  });

  const totalSpentThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalNotebookEntriesCount = expenses.length;
  const dailyAverageSpend = totalSpentThisMonth > 0 ? totalSpentThisMonth / 31 : 0;

  const handleCategoryChipClick = (catName: string) => {
    if (selectedQuickCategory === catName) {
      setSelectedQuickCategory(null);
    } else {
      setSelectedQuickCategory(catName);
      setCategoryHighlight(false);
    }
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) {
      setNotification({
        message: 'Please enter expense details first.',
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const text = quickInput.trim();
    const amountMatch = text.match(/(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i);
    const amountStr = amountMatch ? amountMatch[1].replace(/,/g, '') : '';
    const amount = amountStr ? parseFloat(amountStr) : 0;

    // Check if category is selected or specified in text
    let category = selectedQuickCategory;
    const lower = text.toLowerCase();
    if (!category) {
      if (lower.includes('#dining')) category = 'Dining';
      else if (lower.includes('#travel')) category = 'Travel';
      else if (lower.includes('#hardware')) category = 'Hardware';
      else if (lower.includes('#wellness')) category = 'Wellness';
    }

    const title = text
      .replace(/(?:₹|rs\.?|inr)?\s*[0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?/gi, '')
      .replace(/via\s+[a-z]+/gi, '')
      .replace(/^[,\s\.\-—]+|[,\s\.\-—]+$/g, '')
      .replace(/^(?:for|at)\s+/i, '')
      .trim() || 'Quick Journal Expense';

    const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);

    // If NO category is selected: prompt user before saving!
    if (!category) {
      setParsedQuickEntry({
        title: formattedTitle,
        amount: amount > 0 ? String(amount) : '',
      });
      setShowCategoryConfirmModal(true);
      return;
    }

    // Category IS selected: proceed to save directly!
    saveExpenseDirectly(formattedTitle, amount > 0 ? amount : 420, category);
  };

  const saveExpenseDirectly = (title: string, amount: number, category: string) => {
    let tag = category;
    let icon = 'restaurant';
    if (category === 'Travel') icon = 'directions_car';
    else if (category === 'Hardware') icon = 'laptop_mac';
    else if (category === 'Wellness') icon = 'fitness_center';

    addExpense({
      id: `nb-${Date.now()}`,
      title,
      subtitle: `Instant ledger sync via AI Assist • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      category,
      categoryColor: '#d4af37',
      paidWith: 'UPI Transfer',
      amount,
      tag,
      statusBadge: 'Verified Receipt',
      icon,
      dateTime: 'Today, Just now',
      dateKey: '2026-10-28',
      dateGroup: 'Today, October 28',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setQuickInput('');
    setSelectedQuickCategory(null);
    setNotification({
      message: `Logged: ${title} (₹${amount})`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Category', 'Paid With', 'Date & Time', 'Status', 'Amount'];
    const rows = entries.map((e) => [
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
    link.download = `expense_notebook_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full gap-5 md:gap-6 animate-fade-in" id="expense-notebook-container">
      {/* Top Header Row with "New Entry" button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <AppBreadcrumb
            className="mb-1"
            segments={[
              { label: 'Overview', tab: 'overview' },
              { label: 'Expense Notebook' },
            ]}
          />
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Expense Journal
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Detailed daily log of expenditures, bills, and tax receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openModal('expense')}
          className="h-10 px-4 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>New Entry</span>
        </button>
      </div>

      {/* 3 Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 w-full">
        {/* Card 1: DAILY AVERAGE SPEND */}
        <div className="bg-white p-4 md:p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[155px] h-full relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#fed65b]" />
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-[10px] md:text-[11px] uppercase text-slate-500 font-bold tracking-wider">
              DAILY AVERAGE SPEND
            </span>
            <span className="material-symbols-outlined text-slate-400 text-lg">speed</span>
          </div>
          <div>
            <div className="flex items-baseline mt-1">
              <span className="font-headline-lg-mobile md:font-headline-lg font-serif text-slate-900 font-semibold tracking-tight">
                {privacyMode ? '••••••' : `₹${Math.floor(dailyAverageSpend).toLocaleString('en-IN')}`}
              </span>
              <span className="font-label-numeric text-xs text-slate-500 font-medium">
                {privacyMode ? '' : `.${(dailyAverageSpend % 1).toFixed(2).split('.')[1] || '00'}`}
              </span>
              <span className="text-xs text-slate-400 font-medium ml-0.5">/day</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs font-medium">
            {dailyAverageSpend > 0 ? (
              <>
                <span className="material-symbols-outlined text-sm text-emerald-700">check_circle</span>
                <span className="text-emerald-800">Calculated across active days</span>
              </>
            ) : (
              <span className="text-slate-400">No expenses logged today</span>
            )}
          </div>
        </div>

        {/* Card 2: TOTAL SPENT THIS MONTH */}
        <div className="bg-white p-4 md:p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[155px] h-full relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-[10px] md:text-[11px] uppercase text-slate-500 font-bold tracking-wider">
              TOTAL SPENT THIS MONTH
            </span>
            <span className="material-symbols-outlined text-slate-400 text-lg">receipt_long</span>
          </div>
          <div>
            <div className="flex items-baseline mt-1">
              <span className="font-headline-lg-mobile md:font-headline-lg font-serif text-red-700 font-semibold tracking-tight">
                {privacyMode ? '••••••' : `₹${Math.floor(totalSpentThisMonth).toLocaleString('en-IN')}`}
              </span>
              <span className="font-label-numeric text-xs text-red-500 font-medium">
                {privacyMode ? '' : `.${(totalSpentThisMonth % 1).toFixed(2).split('.')[1] || '00'}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs font-medium">
            {totalSpentThisMonth > 0 ? (
              <>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  <span>Active Cycle</span>
                </span>
                <span className="text-slate-500">current expenditures</span>
              </>
            ) : (
              <span className="text-slate-400">Zero spend this cycle</span>
            )}
          </div>
        </div>

        {/* Card 3: NOTEBOOK ENTRIES */}
        <div className="bg-white p-4 md:p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[155px] h-full relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-[10px] md:text-[11px] uppercase text-slate-500 font-bold tracking-wider">
              NOTEBOOK ENTRIES
            </span>
            <span className="material-symbols-outlined text-slate-400 text-lg">auto_stories</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-lg-mobile md:font-headline-lg font-serif text-slate-900 font-semibold tracking-tight">
                {totalNotebookEntriesCount}
              </span>
              <span className="text-sm font-semibold text-slate-500 font-label-numeric ml-1">Entries</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <span className="material-symbols-outlined text-sm text-slate-400">verified</span>
            <span>{totalNotebookEntriesCount > 0 ? `${totalNotebookEntriesCount} verified in ledger` : 'No entries recorded'}</span>
          </div>
        </div>
      </div>

      {/* Quick Add Expense Box */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs flex flex-col gap-3.5 relative">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base md:text-lg font-serif font-bold text-slate-900">
              Quick Add Expense
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef9e7] text-[#b48e28] border border-[#d4af37]/40 flex items-center gap-1">
              <span>✨</span>
              <span>AI ASSIST</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-amber-800 font-medium">
            <span>⚡</span>
            <span>Instant Ledger Sync</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 -mt-1">
          Natural language entry with automatic category detection
        </p>

        {/* Input Form */}
        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 flex items-center bg-slate-50/70 border border-slate-200/90 rounded-xl px-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#d4af37]/40 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-lg mr-2 shrink-0">
              edit_note
            </span>
            <input
              type="text"
              placeholder="e.g. ₹420 at Cafe with friends via UPI"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              className="w-full h-11 text-xs md:text-sm bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {/* Camera / Receipt Icon */}
            <button
              type="button"
              onClick={() => openModal('expense')}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Attach Receipt"
            >
              <span className="material-symbols-outlined text-lg">photo_camera</span>
            </button>
          </div>

          <button
            type="submit"
            className="h-11 px-5 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs md:text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Save Expense</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </form>

        {/* Category Selection Chips (Required for Quick Add) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100/80">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              SUGGESTED CATEGORIES:
            </span>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
              Required
            </span>
          </div>

          <div
            className={`flex flex-wrap items-center gap-1.5 p-0.5 rounded-xl transition-all duration-300 ${
              categoryHighlight ? 'ring-2 ring-amber-500 bg-amber-50/60 animate-pulse' : ''
            }`}
          >
            {QUICK_CATEGORIES.map((cat) => {
              const isSelected = selectedQuickCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategoryChipClick(cat.name)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#d4af37] text-slate-950 font-bold shadow-xs border border-[#b48e28]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">{cat.icon}</span>
                  <span>{cat.tag}</span>
                </button>
              );
            })}
          </div>

          {selectedQuickCategory && (
            <button
              type="button"
              onClick={() => setSelectedQuickCategory(null)}
              className="text-[11px] text-slate-400 hover:text-slate-600 ml-1 underline cursor-pointer"
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Toast notification */}
        {notification && (
          <div
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-medium shadow-md flex items-center gap-1.5 animate-fade-in ${
              notification.type === 'error'
                ? 'bg-red-900 text-white'
                : 'bg-emerald-900 text-white'
            }`}
          >
            <span
              className={`material-symbols-outlined text-sm ${
                notification.type === 'error' ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {notification.type === 'error' ? 'close' : 'check_circle'}
            </span>
            <span>{notification.message}</span>
          </div>
        )}
      </div>

      {/* Daily Expense Notebook Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 flex flex-col gap-5">
        {/* Section Header Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fef9e7] border border-[#d4af37]/30 flex items-center justify-center text-[#b48e28] shrink-0">
              <span className="material-symbols-outlined text-xl">menu_book</span>
            </div>
            <div>
              <h3 className="font-serif text-base md:text-lg font-bold text-slate-900">
                Expense Notebook
              </h3>
              <p className="text-xs text-slate-500">
                Personal Diary &amp; Verified Expenditures
              </p>
            </div>
          </div>

          {/* Right Controls: Date Filter, Sort, PDF Folio, CSV / Excel */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Universal Date Filter Dropdown with 7 Presets, Single Date, & Date Range */}
            <DateFilterDropdown value={dateFilter} onChange={setDateFilter} />

            {/* Sort Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="h-9 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-slate-500">swap_vert</span>
              <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>

            {/* PDF Folio */}
            <button
              type="button"
              onClick={() => window.print()}
              className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span className="text-amber-600 text-sm">📄</span>
              <span>PDF Folio</span>
            </button>

            {/* CSV / Excel */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span className="text-emerald-600 text-sm">📊</span>
              <span>CSV / Excel</span>
            </button>
          </div>
        </div>

        {/* Single Unified Expense Table (Table only, not individual day) */}
        <div className="rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs bg-white">
          {/* Table Header Filter Bar matching reference design */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border-b border-slate-100">
            {/* Search transactions input */}
            <div className="relative flex items-center w-full sm:w-auto">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-base pointer-events-none">
                search
              </span>
              <input
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                className="h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all w-full sm:w-64 shadow-2xs"
                placeholder="Search transactions..."
                type="text"
              />
            </div>

            {/* Category Filter and Clear Filters button */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2.5 text-slate-500 text-sm pointer-events-none">
                  filter_list
                </span>
                <select
                  value={topCategory}
                  onChange={(e) => setTopCategory(e.target.value)}
                  style={{ paddingLeft: '2rem' }}
                  className="h-9.5 pr-8 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 hover:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all shadow-2xs cursor-pointer appearance-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Travel">Travel &amp; Logistics</option>
                  <option value="Tech">Tech &amp; Infra</option>
                  <option value="Hosting">Client Hosting</option>
                  <option value="Legal">Legal &amp; Retainers</option>
                  <option value="Real Estate">Real Estate &amp; Maintenance</option>
                  <option value="Dining">Dining</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Wellness">Wellness</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 text-slate-400 text-sm pointer-events-none">
                  expand_more
                </span>
              </div>

              <button
                type="button"
                onClick={handleClearAllFilters}
                className="h-9.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                title="Clear filters"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[760px]">
              <colgroup>
                <col className="w-[32%]" />
                <col className="w-[20%]" />
                <col className="w-[18%]" />
                <col className="w-[13%]" />
                <col className="w-[12%]" />
                <col className="w-[5%]" />
              </colgroup>
              <thead>
                <tr className="text-slate-500 text-[11px] uppercase tracking-wider bg-slate-50 border-b border-slate-200/80 font-bold">
                  <th className="py-2.5 px-4 w-[32%] text-xs font-semibold text-left">EXPENSE ITEM</th>
                  <th className="py-2.5 px-4 w-[20%] text-xs font-semibold text-center">CATEGORY</th>
                  <th className="py-2.5 px-4 w-[18%] text-xs font-semibold text-left">PAID WITH</th>
                  <th className="py-2.5 px-4 w-[13%] text-xs font-semibold text-left">DATE &amp; TIME</th>
                  <th className="py-2.5 px-4 w-[12%] text-xs font-semibold text-right">AMOUNT</th>
                  <th className="py-2.5 px-2 w-[5%] text-xs font-semibold text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#b48e28]">
                          <span className="material-symbols-outlined text-xl">search_off</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">No transactions match your search or filters</span>
                        <p className="text-xs text-slate-500 max-w-sm">
                          Try adjusting your search query, selecting another category or date, or clear your filters.
                        </p>
                        <button
                          type="button"
                          onClick={handleClearAllFilters}
                          className="mt-2 px-3.5 py-1.5 rounded-lg bg-[#fef9e7] hover:bg-[#fdf3ce] border border-amber-300 text-xs font-bold text-[#9a761e] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">restart_alt</span>
                          <span>Clear Filters</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedEntries.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Expense Item */}
                      <td className="w-[32%] py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700 shrink-0">
                            <span className="material-symbols-outlined text-base">{item.icon}</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-slate-900 truncate">
                              {item.title}
                            </span>
                            <span className="text-xs text-slate-500 truncate">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category Pill - Standardized equal width and center aligned */}
                      <td className="w-[20%] py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center text-center px-2.5 h-7 rounded-full text-xs font-semibold whitespace-nowrap w-[185px] shadow-2xs ${getCategoryPillClass(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                      </td>

                      {/* Paid With */}
                      <td className="w-[18%] py-3.5 px-4 text-xs font-medium text-slate-600 truncate">
                        {item.paidWith}
                      </td>

                      {/* Date & Time */}
                      <td className="w-[13%] py-3.5 px-4 text-xs font-medium text-slate-600 truncate">
                        <button
                          type="button"
                          onClick={() => onOpenDayLedger(item.dateKey || '2026-10-28')}
                          className="hover:text-[#b48e28] hover:underline transition-colors text-left cursor-pointer"
                          title="Open Day Ledger"
                        >
                          {item.dateTime || `${item.dateGroup}, ${item.time}`}
                        </button>
                      </td>

                      {/* Amount */}
                      <td className="w-[12%] py-3.5 px-4 text-right whitespace-nowrap">
                        <AmountDisplay
                          amount={item.amount}
                          privacyMode={privacyMode}
                          prefix="-₹"
                          color="text-red-700"
                          decimalColor="text-red-500"
                          size="sm"
                        />
                      </td>

                      {/* Action */}
                      <td className="w-[5%] py-3.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            deleteExpense(item.id);
                            setNotification({ message: `Removed ${item.title}`, type: 'success' });
                            setTimeout(() => setNotification(null), 3000);
                          }}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete expense"
                        >
                          <span className="material-symbols-outlined text-sm">delete_outline</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notebook Bottom Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <span>Displaying {sortedEntries.length} of {entries.length} entries in October</span>
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Inspect Previous Pages</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Category Required Confirmation Dialog */}
      {showCategoryConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">category</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Category Selection Required
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Category is required to save your expense. Without selecting a category, would you like to choose one in Quick Add or finish the details in the New Entry form?
                </p>
              </div>
            </div>

            {/* Entry Preview */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800 truncate pr-2">
                {parsedQuickEntry?.title || quickInput}
              </span>
              <span className="font-bold text-slate-900 shrink-0 font-mono">
                {parsedQuickEntry?.amount ? `₹${parseFloat(parsedQuickEntry.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryConfirmModal(false);
                  setCategoryHighlight(true);
                  setTimeout(() => setCategoryHighlight(false), 3000);
                }}
                className="w-full sm:w-auto h-9 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Pick Category in Quick Add
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCategoryConfirmModal(false);
                  openModal('expense', {
                    title: parsedQuickEntry?.title || '',
                    amount: parsedQuickEntry?.amount || '',
                    source: 'quick-add',
                  });
                  setQuickInput('');
                  setSelectedQuickCategory(null);
                }}
                className="w-full sm:w-auto h-9 px-4 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Open New Entry Form</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
