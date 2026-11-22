'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { NotebookEntry, INITIAL_NOTEBOOK_ENTRIES } from '@/lib/notebook-data';

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
  const { privacyMode, openModal, addExpense, expenses } = useFinance();
  const [entries, setEntries] = useState<NotebookEntry[]>(INITIAL_NOTEBOOK_ENTRIES);
  const [quickInput, setQuickInput] = useState('');
  const [selectedQuickCategory, setSelectedQuickCategory] = useState<string | null>(null);
  const [showCategoryConfirmModal, setShowCategoryConfirmModal] = useState(false);
  const [categoryHighlight, setCategoryHighlight] = useState(false);
  const [parsedQuickEntry, setParsedQuickEntry] = useState<{ title: string; amount: string } | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [customDateTab, setCustomDateTab] = useState<'single' | 'range'>('single');
  const [customSingleDate, setCustomSingleDate] = useState('2026-10-28');
  const [customRangeFrom, setCustomRangeFrom] = useState('2026-10-25');
  const [customRangeTo, setCustomRangeTo] = useState('2026-10-28');
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Close date dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateFilterOpen(false);
      }
    };
    if (isDateFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDateFilterOpen]);

  // Top-level (all-level / global) filters
  const [topSearch, setTopSearch] = useState('');
  const [topCategory, setTopCategory] = useState('all');

  // Per-day search and category filters
  const [dayFilters, setDayFilters] = useState<Record<string, { search: string; category: string }>>({
    '2026-10-28': { search: '', category: 'all' },
    '2026-10-27': { search: '', category: 'all' },
    '2026-10-25': { search: '', category: 'all' },
  });

  // When user sets top search: reset individual and set that all level as individual also!
  const handleTopSearchChange = (val: string) => {
    setTopSearch(val);
    setDayFilters((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = {
          ...next[key],
          search: val,
        };
      });
      return next;
    });
  };

  // When user sets top category: reset individual and set that all level as individual also!
  const handleTopCategoryChange = (val: string) => {
    setTopCategory(val);
    setDayFilters((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = {
          ...next[key],
          category: val,
        };
      });
      return next;
    });
  };

  // When user sets individual search: individual only!
  const handleDaySearchChange = (dateKey: string, search: string) => {
    setDayFilters((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        search,
      },
    }));
  };

  // When user sets individual category: individual only!
  const handleDayCategoryChange = (dateKey: string, category: string) => {
    setDayFilters((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        category,
      },
    }));
  };

  // User resets individual day filters
  const handleClearDayFilters = (dateKey: string) => {
    setDayFilters((prev) => ({
      ...prev,
      [dateKey]: {
        search: '',
        category: 'all',
      },
    }));
  };

  // User resets all filters (top + all individual days)
  const handleClearAllFilters = () => {
    setTopSearch('');
    setTopCategory('all');
    setSelectedDateFilter('all');
    setDayFilters({
      '2026-10-28': { search: '', category: 'all' },
      '2026-10-27': { search: '', category: 'all' },
      '2026-10-25': { search: '', category: 'all' },
    });
  };

  const isAnyFilterActive = Boolean(
    topSearch ||
    topCategory !== 'all' ||
    selectedDateFilter !== 'all' ||
    Object.values(dayFilters).some((f) => f.search || f.category !== 'all')
  );

  // Sync any newly added expenses from FinanceContext into notebook entries
  useEffect(() => {
    if (expenses && expenses.length > 0) {
      const existingIds = new Set(entries.map((e) => e.id));
      const newItems: NotebookEntry[] = [];
      for (const exp of expenses) {
        if (!existingIds.has(exp.id)) {
          const catLower = exp.category.toLowerCase();
          const icon = catLower.includes('dining')
            ? 'restaurant'
            : catLower.includes('travel')
            ? 'directions_car'
            : catLower.includes('hardware') || catLower.includes('tech')
            ? 'laptop_mac'
            : catLower.includes('wellness')
            ? 'fitness_center'
            : catLower.includes('friend') || catLower.includes('advance')
            ? 'handshake'
            : 'receipt_long';
          newItems.push({
            id: exp.id,
            title: exp.title,
            subtitle: exp.subtitle || `Manual ledger entry • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            tag: exp.category.split(' ')[0],
            category: exp.category,
            statusBadge: 'Verified Receipt',
            paidWith: exp.paidWith || 'Direct Payment',
            dateTime: 'Today, Just now',
            amount: exp.amount,
            icon,
            dateGroup: 'Today, October 28',
            dateKey: '2026-10-28',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
      }
      if (newItems.length > 0) {
        setEntries((prev) => [...newItems, ...prev]);
      }
    }
  }, [expenses]);

  const filterDayItems = (dateKey: string, rawItems: NotebookEntry[]) => {
    const filter = dayFilters[dateKey] || { search: '', category: 'all' };
    return rawItems.filter((item) => {
      const matchesCategory =
        filter.category === 'all' ||
        item.category.toLowerCase().includes(filter.category.toLowerCase()) ||
        item.tag.toLowerCase().includes(filter.category.toLowerCase());
      const matchesSearch =
        filter.search.trim() === '' ||
        item.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(filter.search.toLowerCase()) ||
        item.paidWith.toLowerCase().includes(filter.search.toLowerCase()) ||
        item.category.toLowerCase().includes(filter.search.toLowerCase()) ||
        item.tag.toLowerCase().includes(filter.search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  const rawTodayItems = entries.filter((e) => e.dateGroup === 'Today, October 28' || e.dateKey === '2026-10-28');
  const rawSundayItems = entries.filter((e) => e.dateGroup === 'Sunday, October 27' || e.dateKey === '2026-10-27');
  const rawFridayItems = entries.filter((e) => e.dateGroup === 'Friday, October 25' || e.dateKey === '2026-10-25');

  const standardGroups = [
    {
      dateGroup: 'TODAY, OCTOBER 28',
      dateKey: '2026-10-28',
      rawItems: rawTodayItems,
    },
    {
      dateGroup: 'SUNDAY, OCTOBER 27',
      dateKey: '2026-10-27',
      rawItems: rawSundayItems,
    },
    {
      dateGroup: 'FRIDAY, OCTOBER 25',
      dateKey: '2026-10-25',
      rawItems: rawFridayItems,
    },
  ];

  const standardKeys = new Set(['2026-10-28', '2026-10-27', '2026-10-25']);
  const otherKeys = Array.from(new Set(entries.map((e) => e.dateKey).filter((k) => k && !standardKeys.has(k))));
  const otherGroups = otherKeys.map((key) => {
    const rawItems = entries.filter((e) => e.dateKey === key);
    let title = key;
    try {
      const [y, m, d] = key.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const month = date.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
      title = `${weekday}, ${month} ${d}`;
    } catch {
      title = key;
    }
    return {
      dateGroup: title,
      dateKey: key,
      rawItems,
    };
  });

  const dateGroups = [...standardGroups, ...otherGroups];

  const formatDateDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const selectedDateFilterLabel = (() => {
    if (selectedDateFilter === 'all') return 'All Dates';
    if (selectedDateFilter === '2026-10-28') return 'Today (Oct 28)';
    if (selectedDateFilter === '2026-10-27') return 'Sunday (Oct 27)';
    if (selectedDateFilter === '2026-10-25') return 'Friday (Oct 25)';
    if (selectedDateFilter === 'custom-single') {
      return `Date: ${formatDateDisplay(customSingleDate)}`;
    }
    if (selectedDateFilter === 'custom-range') {
      const from = customRangeFrom <= customRangeTo ? customRangeFrom : customRangeTo;
      const to = customRangeFrom <= customRangeTo ? customRangeTo : customRangeFrom;
      return `${formatDateDisplay(from)} – ${formatDateDisplay(to)}`;
    }
    return 'All Dates';
  })();

  const visibleDateGroups = (() => {
    if (selectedDateFilter === 'all') {
      return dateGroups;
    }
    if (selectedDateFilter === 'custom-single') {
      return dateGroups.filter((g) => g.dateKey === customSingleDate);
    }
    if (selectedDateFilter === 'custom-range') {
      const from = customRangeFrom <= customRangeTo ? customRangeFrom : customRangeTo;
      const to = customRangeFrom <= customRangeTo ? customRangeTo : customRangeFrom;
      return dateGroups.filter((g) => g.dateKey >= from && g.dateKey <= to);
    }
    return dateGroups.filter((g) => g.dateKey === selectedDateFilter);
  })();

  const sortedDateGroups =
    sortOrder === 'oldest' ? [...visibleDateGroups].reverse() : visibleDateGroups;

  const initialNotebookIds = new Set(INITIAL_NOTEBOOK_ENTRIES.map((e) => e.id));
  const dynamicExpensesAdded = entries.filter((e) => !initialNotebookIds.has(e.id));
  const dynamicTotalAdded = dynamicExpensesAdded.reduce((sum, e) => sum + e.amount, 0);
  const totalSpentThisMonth = 7068.4 + dynamicTotalAdded;
  const totalNotebookEntriesCount = 42 + dynamicExpensesAdded.length;

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

    const newEntry: NotebookEntry = {
      id: `nb-${Date.now()}`,
      title,
      subtitle: `Instant ledger sync via AI Assist • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      tag,
      category,
      statusBadge: 'Verified Receipt',
      paidWith: 'UPI Transfer',
      dateTime: 'Today, Just now',
      amount,
      icon,
      dateGroup: 'Today, October 28',
      dateKey: '2026-10-28',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setEntries((prev) => [newEntry, ...prev]);
    addExpense({
      id: newEntry.id,
      title: newEntry.title,
      subtitle: newEntry.subtitle,
      category: newEntry.category,
      categoryColor: '#d4af37',
      paidWith: newEntry.paidWith,
      amount: newEntry.amount,
      tag: newEntry.tag,
      statusBadge: newEntry.statusBadge,
      icon: newEntry.icon,
    });

    setQuickInput('');
    setSelectedQuickCategory(null);
    setNotification({
      message: `Logged: ${newEntry.title} (₹${amount})`,
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
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-lg-mobile md:font-headline-lg font-serif text-slate-900 font-semibold tracking-tight">
                {privacyMode ? '••••••' : '₹228'}
              </span>
              <span className="font-label-numeric text-xs text-slate-500 font-medium">
                {privacyMode ? '' : '.01'}
              </span>
              <span className="text-xs text-slate-400 font-medium ml-0.5">/day</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-emerald-800 font-medium">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>Well within ₹250 budget target</span>
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
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-lg-mobile md:font-headline-lg font-serif text-red-700 font-semibold tracking-tight">
                {privacyMode ? '••••••' : `₹${Math.floor(totalSpentThisMonth).toLocaleString('en-IN')}`}
              </span>
              <span className="font-label-numeric text-xs text-red-500 font-medium">
                {privacyMode ? '' : `.${(totalSpentThisMonth % 1).toFixed(2).split('.')[1] || '40'}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs font-medium">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200/60">
              <span className="material-symbols-outlined text-xs">trending_down</span>
              <span>-4.2%</span>
            </span>
            <span className="text-slate-500">vs previous month</span>
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
            <span>38 verified with tax receipts</span>
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
                      ? 'bg-[#fed65b] text-slate-950 shadow-xs border border-[#d4af37]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  {isSelected && (
                    <span className="material-symbols-outlined text-xs text-[#745c00]">check</span>
                  )}
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

          {/* Right Controls: Top/All-Level Search, Category, Date, Reset All, Sort, PDF, CSV */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Top/All-Level Search Input with comfortable icon gap */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-sm pointer-events-none">
                search
              </span>
              <input
                value={topSearch}
                onChange={(e) => handleTopSearchChange(e.target.value)}
                className="h-9 pr-3 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all w-36 sm:w-48 shadow-2xs"
                style={{ paddingLeft: '2.125rem' }}
                placeholder="Search all days..."
                type="text"
              />
            </div>

            {/* Top/All-Level Category Filter Dropdown with comfortable icon gap */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-slate-500 text-xs pointer-events-none">
                filter_list
              </span>
              <select
                value={topCategory}
                onChange={(e) => handleTopCategoryChange(e.target.value)}
                style={{ paddingLeft: '2.125rem' }}
                className={`h-9 pr-7 text-xs font-semibold rounded-xl border transition-all shadow-2xs cursor-pointer ${
                  topCategory !== 'all'
                    ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-[#d4af37]'
                }`}
              >
                <option value="all">All Categories</option>
                <option value="Dining">Dining</option>
                <option value="Travel">Travel &amp; Logistics</option>
                <option value="Hardware">Hardware &amp; Tech</option>
                <option value="Tech">Tech &amp; Infra</option>
                <option value="Hosting">Client Hosting</option>
                <option value="Legal">Legal &amp; Retainers</option>
                <option value="Real Estate">Real Estate &amp; Maintenance</option>
                <option value="Wellness">Wellness</option>
              </select>
            </div>

            {/* Date Filter Dropdown with Presets, Custom Single Date, & Custom Date Range */}
            <div className="relative flex items-center gap-1" ref={dateDropdownRef}>
              <button
                type="button"
                onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedDateFilter !== 'all'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-sm text-[#b48e28]">calendar_today</span>
                <span>{selectedDateFilterLabel}</span>
                <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
              </button>

              {isDateFilterOpen && (
                <div className="absolute left-0 mt-1 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-30 animate-fade-in top-full">
                  {/* Presets Header */}
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                    Preset Dates
                  </div>
                  <div className="space-y-0.5">
                    {[
                      { key: 'all', label: 'All Dates' },
                      { key: '2026-10-28', label: 'Today (Oct 28)' },
                      { key: '2026-10-27', label: 'Sunday (Oct 27)' },
                      { key: '2026-10-25', label: 'Friday (Oct 25)' },
                    ].map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => {
                          setSelectedDateFilter(d.key);
                          setIsDateFilterOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                          selectedDateFilter === d.key
                            ? 'bg-[#fef9e7] text-amber-950 font-bold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{d.label}</span>
                        {selectedDateFilter === d.key && (
                          <span className="material-symbols-outlined text-sm text-[#b48e28]">check</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="my-2.5 border-t border-slate-100" />

                  {/* Custom Filter Section */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                      Custom Date Selection
                    </div>

                    {/* Tab Switcher */}
                    <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold mb-2.5">
                      <button
                        type="button"
                        onClick={() => setCustomDateTab('single')}
                        className={`py-1 rounded-md text-center transition-all cursor-pointer ${
                          customDateTab === 'single'
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Single Date
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomDateTab('range')}
                        className={`py-1 rounded-md text-center transition-all cursor-pointer ${
                          customDateTab === 'range'
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Date Range
                      </button>
                    </div>

                    {customDateTab === 'single' ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Select Specific Date
                          </label>
                          <input
                            type="date"
                            value={customSingleDate}
                            onChange={(e) => setCustomSingleDate(e.target.value)}
                            className="w-full h-8.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDateFilter('custom-single');
                            setIsDateFilterOpen(false);
                          }}
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
                              value={customRangeFrom}
                              onChange={(e) => setCustomRangeFrom(e.target.value)}
                              className="w-full h-8.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              To
                            </label>
                            <input
                              type="date"
                              value={customRangeTo}
                              onChange={(e) => setCustomRangeTo(e.target.value)}
                              className="w-full h-8.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDateFilter('custom-range');
                            setIsDateFilterOpen(false);
                          }}
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

            {/* Top-Level Reset All Filters Button */}
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="h-9 px-3 rounded-xl border border-amber-300 bg-[#fef9e7] hover:bg-[#fdf3ce] text-[#9a761e] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Reset All</span>
              </button>
            )}

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

        {/* Date-Grouped Daywise Tables (Matching Reference Design: Each day has its own header with search & category filters) */}
        <div className="flex flex-col gap-6">
          {sortedDateGroups.length === 0 ? (
            <div className="py-12 px-4 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#b48e28] mb-3">
                <span className="material-symbols-outlined text-2xl">event_busy</span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                No Transactions Found
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                No ledger entries match the selected date filter ({selectedDateFilterLabel}). Select another date or reset your filter.
              </p>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="mt-4 px-4 py-1.5 rounded-xl bg-[#fef9e7] hover:bg-[#fdf3ce] border border-amber-300 text-xs font-bold text-[#9a761e] shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Reset Date Filter</span>
              </button>
            </div>
          ) : (
            sortedDateGroups.map((group) => {
            const dayFilter = dayFilters[group.dateKey] || { search: '', category: 'all' };
            const dayItems = filterDayItems(group.dateKey, group.rawItems);
            const displayedItems = dayItems.slice(0, 5);
            const dayTotal = dayItems.reduce((sum, item) => sum + item.amount, 0);
            const isDayFiltered = Boolean(dayFilter.search || dayFilter.category !== 'all');

            return (
              <div key={group.dateKey} className="flex flex-col rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs bg-white">
                {/* Day Header Bar: Date Title on left with search; Category & Clear Filters on right */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3 bg-white border-b border-slate-200/80">
                  {/* Left: Date Group Title & Search input */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {group.dateGroup} • {dayItems.length} {dayItems.length === 1 ? 'ENTRY' : 'ENTRIES'} • TOTAL:{' '}
                      {privacyMode ? (
                        '••••••'
                      ) : (
                        <span className="font-serif font-bold text-slate-900">
                          ₹{dayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </span>

                    {/* Search Box */}
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-sm pointer-events-none">
                        search
                      </span>
                      <input
                        value={dayFilter.search}
                        onChange={(e) => handleDaySearchChange(group.dateKey, e.target.value)}
                        className="h-7.5 pl-8.5 pr-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all w-36 sm:w-52 shadow-2xs"
                        style={{ paddingLeft: '2.125rem' }}
                        placeholder="Search transactions..."
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Right: Category Dropdown & Clear Filters */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-2.5 text-slate-500 text-xs pointer-events-none">
                        filter_list
                      </span>
                      <select
                        value={dayFilter.category}
                        onChange={(e) => handleDayCategoryChange(group.dateKey, e.target.value)}
                        style={{ paddingLeft: '2.125rem' }}
                        className={`h-7.5 pr-7 text-xs font-semibold rounded-lg border transition-all shadow-2xs cursor-pointer ${
                          dayFilter.category !== 'all'
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-[#d4af37]'
                        }`}
                      >
                        <option value="all">All Categories</option>
                        <option value="Dining">Dining</option>
                        <option value="Travel">Travel &amp; Logistics</option>
                        <option value="Hardware">Hardware &amp; Tech</option>
                        <option value="Tech">Tech &amp; Infra</option>
                        <option value="Hosting">Client Hosting</option>
                        <option value="Legal">Legal &amp; Retainers</option>
                        <option value="Real Estate">Real Estate &amp; Maintenance</option>
                        <option value="Wellness">Wellness</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleClearDayFilters(group.dateKey)}
                      className={`h-7.5 px-2.5 rounded-lg border text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-2xs shrink-0 cursor-pointer ${
                        isDayFiltered
                          ? 'border-amber-300 bg-[#fef9e7] hover:bg-[#fdf3ce] text-[#9a761e] font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                      }`}
                      title="Clear filters"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xs">restart_alt</span>
                      <span>Clear Filters</span>
                    </button>
                  </div>
                </div>

                {/* Day Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed min-w-[760px]">
                    <colgroup>
                      <col className="w-[38%]" />
                      <col className="w-[18%]" />
                      <col className="w-[18%]" />
                      <col className="w-[12%]" />
                      <col className="w-[14%]" />
                    </colgroup>
                    <thead>
                      <tr className="text-slate-500 text-[11px] uppercase tracking-wider bg-slate-50/70 border-b border-slate-200/80">
                        <th className="w-[38%] py-2.5 px-4 font-semibold text-xs text-left">
                          EXPENSE TITLE
                        </th>
                        <th className="w-[18%] py-2.5 px-4 text-center text-xs font-semibold">
                          CATEGORY
                        </th>
                        <th className="w-[18%] py-2.5 px-4 text-xs font-semibold text-left">
                          PAID WITH
                        </th>
                        <th className="w-[12%] py-2.5 px-4 text-xs font-semibold text-left">
                          DATE &amp; TIME
                        </th>
                        <th className="w-[14%] py-2.5 px-4 text-right text-xs font-semibold">
                          AMOUNT
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {displayedItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <span className="material-symbols-outlined text-slate-400 text-lg">search_off</span>
                              <span>No transactions match your search or filter criteria for this day.</span>
                              <button
                                type="button"
                                onClick={() => handleClearDayFilters(group.dateKey)}
                                className="text-[11px] text-[#b48e28] hover:underline font-semibold mt-0.5 cursor-pointer"
                              >
                                Reset day filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        displayedItems.map((item, idx) => (
                          <tr key={`${group.dateKey}-${item.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                            {/* Item details */}
                            <td className="w-[38%] py-3 px-4">
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

                            {/* Category pill */}
                            <td className="w-[18%] py-3 px-4 text-center">
                              <span
                                className={`inline-flex items-center justify-center text-center px-2.5 h-7 rounded-full text-xs font-medium whitespace-nowrap w-[185px] shadow-2xs ${
                                  item.category.includes('Travel')
                                    ? 'bg-amber-100/70 text-amber-900 border border-amber-200/60'
                                    : item.category.includes('Tech') || item.category.includes('Hardware')
                                    ? 'bg-slate-100 text-slate-800 border border-slate-200/60'
                                    : item.category.includes('Dining')
                                    ? 'bg-blue-50/70 text-blue-900 border border-blue-200/60'
                                    : item.category.includes('Hosting')
                                    ? 'bg-slate-100 text-slate-700 border border-slate-200/60'
                                    : item.category.includes('Legal')
                                    ? 'bg-indigo-50/70 text-indigo-900 border border-indigo-200/60'
                                    : item.category.includes('Real Estate')
                                    ? 'bg-emerald-50/70 text-emerald-900 border border-emerald-200/60'
                                    : 'bg-teal-50/70 text-teal-900 border border-teal-200/60'
                                }`}
                              >
                                {item.category}
                              </span>
                            </td>

                            {/* Paid With */}
                            <td className="w-[18%] py-3 px-4 text-xs text-slate-600 font-medium whitespace-nowrap truncate">
                              {item.paidWith}
                            </td>

                            {/* Date & Time */}
                            <td className="w-[12%] py-3 px-4 text-xs text-slate-500 whitespace-nowrap truncate">
                              {item.time || item.dateTime}
                            </td>

                            {/* Amount */}
                            <td className="w-[14%] py-3 px-4 text-right whitespace-nowrap">
                              {privacyMode ? (
                                <span className="text-sm font-bold text-slate-900 tracking-tight font-serif">••••••</span>
                              ) : (
                                <div className="inline-flex items-baseline justify-end gap-0.5">
                                  <span className="font-serif font-bold text-sm text-red-700 tracking-tight">
                                    -₹{Math.floor(item.amount).toLocaleString('en-IN')}
                                  </span>
                                  <span className="font-label-numeric text-xs text-red-500 font-medium">
                                    .{(item.amount % 1).toFixed(2).split('.')[1] || '00'}
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom of Day Group: View Day Ledger */}
                <div className="p-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onOpenDayLedger(group.dateKey)}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs group"
                  >
                    <span className="material-symbols-outlined text-sm text-[#b48e28] group-hover:translate-x-0.5 transition-transform">
                      menu_book
                    </span>
                    <span>View Day Ledger</span>
                    <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-slate-700 transition-colors">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

        {/* Notebook Bottom Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <span>Displaying 5 of 42 diary notes in October</span>
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
