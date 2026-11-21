'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { NotebookEntry, INITIAL_NOTEBOOK_ENTRIES } from '@/lib/notebook-data';

interface ExpenseNotebookViewProps {
  onOpenDayLedger: (dateKey: string) => void;
}

const QUICK_CATEGORIES = [
  { name: 'Dining', tag: '#Dining', icon: 'restaurant' },
  { name: 'Travel', tag: '#Travel', icon: 'directions_car' },
  { name: 'Hardware', tag: '#Hardware', icon: 'laptop_mac' },
  { name: 'Wellness', tag: '#Wellness', icon: 'fitness_center' },
];

export function ExpenseNotebookView({ onOpenDayLedger }: ExpenseNotebookViewProps) {
  const { privacyMode, openModal, addExpense, expenses } = useFinance();
  const [entries, setEntries] = useState<NotebookEntry[]>(INITIAL_NOTEBOOK_ENTRIES);
  const [quickInput, setQuickInput] = useState('');
  const [selectedQuickCategory, setSelectedQuickCategory] = useState<string | null>(null);
  const [showCategoryConfirmModal, setShowCategoryConfirmModal] = useState(false);
  const [categoryHighlight, setCategoryHighlight] = useState(false);
  const [parsedQuickEntry, setParsedQuickEntry] = useState<{ title: string; amount: string } | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [notification, setNotification] = useState<string | null>(null);

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
            tag: `#${exp.category.split(' ')[0]}`,
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

  // Group entries by date
  const filteredEntries = entries.filter((item) => {
    if (selectedCategoryFilter === 'all') return true;
    return item.category.toLowerCase() === selectedCategoryFilter.toLowerCase();
  });

  const todayItems = filteredEntries.filter((e) => e.dateGroup === 'Today, October 28');
  const todayTotal = todayItems.reduce((sum, item) => sum + item.amount, 0);

  const sundayItems = filteredEntries.filter((e) => e.dateGroup === 'Sunday, October 27');
  const sundayTotal = sundayItems.reduce((sum, item) => sum + item.amount, 0);

  const fridayItems = filteredEntries.filter((e) => e.dateGroup === 'Friday, October 25');
  const fridayTotal = fridayItems.reduce((sum, item) => sum + item.amount, 0);

  const dateGroups = [
    {
      dateGroup: 'Today, October 28',
      dateKey: '2026-10-28',
      badge: `${todayItems.length} ${todayItems.length === 1 ? 'ENTRY' : 'ENTRIES'}`,
      badgeColor: 'bg-amber-100/70 text-amber-900 border-amber-200/60',
      total: todayTotal,
      items: todayItems,
    },
    {
      dateGroup: 'Sunday, October 27',
      dateKey: '2026-10-27',
      badge: `${sundayItems.length} ${sundayItems.length === 1 ? 'ENTRY' : 'ENTRIES'}`,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      total: sundayTotal,
      items: sundayItems,
    },
    {
      dateGroup: 'Friday, October 25',
      dateKey: '2026-10-25',
      badge: `${fridayItems.length} ${fridayItems.length === 1 ? 'ENTRY' : 'ENTRIES'}`,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      total: fridayTotal,
      items: fridayItems,
    },
  ];

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
      setNotification('Please enter expense details first.');
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
    let tag = `#${category}`;
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
    setNotification(`Logged: ${newEntry.title} (₹${amount})`);
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
              <span className="font-kpi-val text-slate-900 tracking-tight">
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
              <span className="font-kpi-val text-slate-900 tracking-tight">
                {privacyMode ? '••••••' : `₹${Math.floor(totalSpentThisMonth).toLocaleString('en-IN')}`}
              </span>
              <span className="font-label-numeric text-xs text-slate-500 font-medium">
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
              <span className="font-kpi-val text-slate-900 tracking-tight">
                {totalNotebookEntriesCount}
              </span>
              <span className="text-sm font-semibold text-slate-600 ml-1">Entries</span>
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

        {/* Success toast notification */}
        {notification && (
          <div className="absolute top-3 right-3 bg-emerald-900 text-white px-3 py-1.5 rounded-xl text-xs font-medium shadow-md flex items-center gap-1.5 animate-fade-in">
            <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
            <span>{notification}</span>
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
                Daily Expense Notebook
              </h3>
              <p className="text-xs text-slate-500">
                Personal Diary & Verified Expenditures
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>
                  {selectedCategoryFilter === 'all'
                    ? 'All Categories'
                    : selectedCategoryFilter}
                </span>
                <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
              </button>

              {isCategoryOpen && (
                <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-fade-in">
                  {['all', 'Dining', 'Travel', 'Hardware', 'Wellness'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryFilter(cat);
                        setIsCategoryOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between cursor-pointer"
                    >
                      <span>{cat === 'all' ? 'All Categories' : cat}</span>
                      {selectedCategoryFilter === cat && (
                        <span className="material-symbols-outlined text-sm text-[#b48e28]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

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

        {/* Date-Grouped Timeline */}
        <div className="flex flex-col gap-6">
          {dateGroups.map((group) => {
            if (group.items.length === 0) return null;

            return (
              <div key={group.dateKey} className="flex flex-col gap-3">
                {/* Date Group Header */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      📅 {group.dateGroup}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${group.badgeColor}`}
                    >
                      {group.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 font-label-numeric flex items-baseline gap-1">
                      <span>Total:</span>
                      <span className="text-sm font-bold text-slate-900">
                        {privacyMode ? '••••••' : `₹${group.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenDayLedger(group.dateKey)}
                      className="text-xs font-semibold text-[#b48e28] hover:text-[#8c6b12] flex items-center gap-0.5 transition-colors cursor-pointer"
                    >
                      <span>View Day Ledger</span>
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>

                {/* Items in this date group */}
                <div className="flex flex-col gap-2.5">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        {/* Category Icon Container */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            item.category === 'Dining'
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
                  ))}
                </div>
              </div>
            );
          })}
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
