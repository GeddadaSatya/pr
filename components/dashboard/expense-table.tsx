'use client';

import React, { useState, useRef } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { formatCurrency } from '@/lib/utils';
import { ExpenseItem } from '@/lib/types';

export function ExpenseTable() {
  const { expenses, privacyMode, openModal, importExpenses } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredExpenses = expenses.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.paidWith.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      item.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const exportToCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Title', 'Subtitle', 'Category', 'Paid With', 'Date', 'Amount'];
    const rows = (filteredExpenses.length > 0 ? filteredExpenses : expenses).map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      `"${(e.subtitle || '').replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.paidWith}"`,
      `"${e.dateTime}"`,
      e.amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expense_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
        if (lines.length <= 1) return;

        const newExpenses: ExpenseItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const values: string[] = [];
          let inQuotes = false;
          let currentValue = '';

          for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue.trim());
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue.trim());

          let title = 'Bank Transaction';
          let subtitle = 'Imported Statement';
          let category = 'Tech & Infra';
          let paidWith = 'Bank Transfer';
          let dateTime = 'Imported';
          let amount = 0;

          if (values.length >= 6) {
            title = values[0] || title;
            subtitle = values[1] || subtitle;
            category = values[2] || category;
            paidWith = values[3] || paidWith;
            dateTime = values[4] || dateTime;
            amount = Math.abs(parseFloat(values[5].replace(/[^0-9.-]/g, ''))) || 0;
          } else if (values.length >= 3) {
            title = values[0] || title;
            category = values[1] || category;
            amount = Math.abs(parseFloat(values[2].replace(/[^0-9.-]/g, ''))) || 0;
            if (values[3]) paidWith = values[3];
            if (values[4]) dateTime = values[4];
          }

          if (amount > 0 || title !== 'Bank Transaction') {
            newExpenses.push({
              id: `exp-import-${Date.now()}-${i}`,
              title,
              subtitle,
              category: category || 'Miscellaneous',
              categoryColor: '#d4af37',
              paidWith: paidWith || 'Bank Account',
              dateTime: dateTime || 'Imported today',
              amount: amount || 250,
            });
          }
        }

        if (newExpenses.length > 0) {
          importExpenses(newExpenses);
        }
      } catch (err) {
        console.error('Failed to parse CSV', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full flex flex-col gap-3" id="notebook-expenses-card">
      {/* Hidden File Input for CSV / Statement Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Mobile View (< 780px) */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Ledger Header Controls */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-title-md text-base font-semibold text-slate-900 whitespace-nowrap">
            Recent Ledger
          </span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-slate-700 text-xs font-medium shadow-xs cursor-pointer">
            <span>October 2025</span>
            <span className="material-symbols-outlined text-sm text-slate-400">expand_more</span>
          </div>
        </div>

        {/* Empty State vs Expense List */}
        {expenses.length === 0 ? (
          /* Empty State Card matching reference design */
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col items-center text-center">
            {/* Center Icon Container with Gold Pip */}
            <div className="relative w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl text-[#b48e28]">
                menu_book
              </span>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#fed65b] border-2 border-white shadow-xs" />
            </div>

            {/* Title & Subtitle */}
            <h3 className="font-title-md text-base font-semibold text-slate-900 mb-1">
              Your ledger is empty
            </h3>
            <p className="font-body-sm text-xs text-slate-500 max-w-xs mb-5">
              Tap the (+) button below or add your first transaction to start your financial journal.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <button
                onClick={() => openModal('expense')}
                type="button"
                className="w-full h-11 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] active:scale-[0.99] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">edit_note</span>
                <span>Add Journal Entry</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="w-full h-11 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 active:scale-[0.99] border border-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-slate-600">upload_file</span>
                <span>Import CSV / Bank Statement</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Transaction List Stack */}
            <div className="flex flex-col gap-2">
              {filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        exp.category.includes('Travel')
                          ? 'bg-[#fed65b]/20 text-[#735c00]'
                          : exp.category.includes('Tech')
                          ? 'bg-slate-100 text-slate-900'
                          : 'bg-amber-100/50 text-amber-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {exp.category.includes('Travel')
                          ? 'flight_takeoff'
                          : exp.category.includes('Tech')
                          ? 'cloud_done'
                          : 'restaurant'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-title-md text-sm font-semibold text-slate-900 truncate">
                        {exp.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium shrink-0">
                          {exp.category}
                        </span>
                        <span className="truncate">• {exp.paidWith}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 pl-2">
                    {privacyMode ? (
                      <span className="font-serif font-bold text-sm text-slate-900">••••••</span>
                    ) : (
                      <div className="inline-flex items-baseline justify-end gap-0.5">
                        <span className="font-serif font-bold text-sm text-red-700 tracking-tight">
                          -₹{Math.floor(exp.amount).toLocaleString('en-IN')}
                        </span>
                        <span className="font-label-numeric text-[11px] text-red-500 font-medium">
                          .{(exp.amount % 1).toFixed(2).split('.')[1] || '00'}
                        </span>
                      </div>
                    )}
                    <span className="font-label-numeric text-[11px] text-slate-400">
                      {exp.dateTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dual Action Strip: Import & Export Buttons (Mobile) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-10 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-base text-slate-600">upload_file</span>
                <span>Import CSV</span>
              </button>

              <button
                onClick={exportToCSV}
                className="h-10 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-base text-[#b48e28]">ios_share</span>
                <span>Export CSV</span>
              </button>
            </div>

            {/* Stewardship Confidence Marker */}
            <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#fed65b]/30 flex items-center justify-center text-[#735c00] shrink-0">
                <span className="material-symbols-outlined text-base">verified</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-title-md text-xs font-semibold text-slate-900">Audited by Vault Protocol</span>
                <span className="font-body-sm text-[11px] text-slate-500">All balances synced across sovereign nodal vaults</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop View (>= 780px) */}
      <div className="hidden md:block rounded-xl bg-white border border-slate-200 p-6 shadow-xs">
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fef9e7] border border-[#d4af37]/30 flex items-center justify-center text-[#b48e28]">
              <span className="material-symbols-outlined text-lg">menu_book</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase font-bold tracking-widest">
                Notebook Ledger Preview
              </span>
              <div className="font-headline-md text-slate-900 font-semibold">
                Recent Daily Expenses
              </div>
            </div>
          </div>

          {/* Action Buttons: Import Statement & Export Ledger */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="h-9 w-[150px] rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Import CSV or bank statement"
            >
              <span className="material-symbols-outlined text-base text-slate-600">upload_file</span>
              <span>Import Statement</span>
            </button>

            <button
              onClick={exportToCSV}
              disabled={expenses.length === 0}
              type="button"
              className={`h-9 w-[150px] rounded-xl border border-slate-200/80 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
                expenses.length === 0
                  ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
              }`}
              title="Export ledger as CSV"
            >
              <span className="material-symbols-outlined text-base text-slate-600">download</span>
              <span>Export Ledger</span>
            </button>
          </div>
        </div>

        {expenses.length === 0 ? (
          /* Empty State for Desktop */
          <div className="py-14 px-4 flex flex-col items-center justify-center text-center">
            <div className="relative w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl text-[#b48e28]">
                menu_book
              </span>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#fed65b] border-2 border-white shadow-xs" />
            </div>
            <h3 className="font-headline-sm text-lg font-semibold text-slate-900 mb-1">
              Your ledger is empty
            </h3>
            <p className="font-body-sm text-xs text-slate-500 max-w-sm mb-6">
              Add your first transaction manually or import a bank statement / CSV file to populate your financial journal.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => openModal('expense')}
                type="button"
                className="h-10 w-[200px] rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">edit_note</span>
                <span>Add Journal Entry</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="h-10 w-[200px] rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-slate-600">upload_file</span>
                <span>Import Statement</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search & Filter Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mb-2">
              <div className="relative flex items-center w-full sm:w-auto">
                <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-base pointer-events-none">
                  search
                </span>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all w-full sm:w-64 shadow-xs"
                  placeholder="Search transactions..."
                  type="text"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                <div className="relative flex items-center flex-1 sm:flex-initial">
                  <span className="material-symbols-outlined absolute left-2.5 text-slate-500 text-sm pointer-events-none">
                    filter_list
                  </span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-9 w-[145px] pl-8 pr-7 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 hover:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all shadow-xs cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="travel">Travel &amp; Logistics</option>
                    <option value="tech">Tech &amp; Infra</option>
                    <option value="hosting">Client Hosting</option>
                    <option value="legal">Legal &amp; Retainers</option>
                    <option value="dining">Executive Dining</option>
                  </select>
                </div>

                <button
                  onClick={clearFilters}
                  className="h-9 w-[145px] rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                  title="Clear filters"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>

            {/* Transaction Table */}
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 text-[11px] uppercase tracking-wider bg-slate-50 border-y border-slate-200/80">
                    <th className="py-2.5 px-4">Expense Item</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Paid With</th>
                    <th className="py-2.5 px-4">Date &amp; Time</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                            <span className="material-symbols-outlined text-base">
                              {exp.category.includes('Travel')
                                ? 'flight_takeoff'
                                : exp.category.includes('Tech')
                                ? 'hardware'
                                : exp.category.includes('Hosting') || exp.category.includes('Dining')
                                ? 'restaurant'
                                : 'receipt_long'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-slate-900">
                                {exp.title}
                              </span>
                              {exp.receiptUrl && (
                                <span
                                  title="Receipt attached"
                                  className="material-symbols-outlined text-xs text-[#b48e28]"
                                >
                                  attach_file
                                </span>
                              )}
                            </div>
                            {exp.subtitle && (
                              <span className="text-[11px] text-slate-500">{exp.subtitle}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center justify-center text-center px-3 h-7 rounded-lg text-[11px] font-semibold transition-colors shadow-xs w-[185px]"
                          style={{
                            backgroundColor: exp.category.includes('Travel') ? '#fef9e7' : '#f1f5f9',
                            color: exp.category.includes('Travel') ? '#b48e28' : '#334155',
                            border: exp.category.includes('Travel') ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid #e2e8f0',
                          }}
                        >
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                        {exp.paidWith}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-500">
                        {exp.dateTime}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {privacyMode ? (
                          <span className="font-serif font-bold text-sm text-slate-900">••••••</span>
                        ) : (
                          <div className="inline-flex items-baseline justify-end gap-0.5">
                            <span className="font-serif font-bold text-sm text-red-700 tracking-tight">
                              -₹{Math.floor(exp.amount).toLocaleString('en-IN')}
                            </span>
                            <span className="font-label-numeric text-xs text-red-500 font-medium">
                              .{(exp.amount % 1).toFixed(2).split('.')[1] || '00'}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredExpenses.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No expenses found matching your search.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
