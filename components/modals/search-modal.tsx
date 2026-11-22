'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { AmountDisplay } from '@/components/ui/amount-display';

export function SearchModal() {
  const {
    isSearchModalOpen,
    closeSearchModal,
    expenses,
    payables,
    borrowers,
    assets,
    setActiveTab,
    privacyMode,
  } = useFinance();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchModalOpen]);

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isSearchModalOpen) {
          closeSearchModal();
        } else {
          // Open
          useFinance;
        }
      }
      if (e.key === 'Escape' && isSearchModalOpen) {
        closeSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, closeSearchModal]);

  if (!isSearchModalOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedExpenses = q
    ? expenses
        .filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            (e.subtitle && e.subtitle.toLowerCase().includes(q))
        )
        .slice(0, 4)
    : [];

  const matchedPayables = q
    ? payables
        .filter(
          (p) =>
            p.creditorName.toLowerCase().includes(q) ||
            (p.category && p.category.toLowerCase().includes(q)) ||
            p.invoiceNote.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const matchedBorrowers = q
    ? borrowers
        .filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            (b.phone && b.phone.toLowerCase().includes(q)) ||
            (b.contractType && b.contractType.toLowerCase().includes(q))
        )
        .slice(0, 3)
    : [];

  const matchedAssets = q
    ? assets
        .filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q) ||
            a.institution.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const totalMatches =
    matchedExpenses.length + matchedPayables.length + matchedBorrowers.length + matchedAssets.length;

  const handleSelect = (tab: string) => {
    closeSearchModal();
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center pt-16 md:pt-24 p-4 animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={closeSearchModal}
      />
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search transactions, bills, loans, borrowers, assets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-3">
          {!q ? (
            <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-1.5">
              <span className="material-symbols-outlined text-3xl text-slate-300">manage_search</span>
              <p className="text-xs font-medium text-slate-500">Type any query to search across the entire application</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600">Expenses</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600">Payables</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600">Loans</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600">Assets</span>
              </div>
            </div>
          ) : totalMatches === 0 ? (
            <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-2xl text-slate-300">search_off</span>
              <p className="text-xs font-semibold text-slate-600">No results found for &ldquo;{query}&rdquo;</p>
              <span className="text-[11px] text-slate-400">Try searching for &quot;Flight&quot;, &quot;Priya&quot;, &quot;Marcus&quot;, or &quot;HDFC&quot;</span>
            </div>
          ) : (
            <>
              {/* Expenses */}
              {matchedExpenses.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 block mb-1">
                    Expenses ({matchedExpenses.length})
                  </span>
                  <div className="flex flex-col gap-1">
                    {matchedExpenses.map((exp) => (
                      <div
                        key={exp.id}
                        onClick={() => handleSelect('expenses')}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                            <span className="material-symbols-outlined text-sm">receipt</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-900">{exp.title}</span>
                            <span className="text-[10px] text-slate-500">{exp.category} • {exp.paidWith}</span>
                          </div>
                        </div>
                        <AmountDisplay amount={exp.amount} privacyMode={privacyMode} size="sm" weight="semibold" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payables */}
              {matchedPayables.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 block mb-1">
                    Payables &amp; Dues ({matchedPayables.length})
                  </span>
                  <div className="flex flex-col gap-1">
                    {matchedPayables.map((pay) => (
                      <div
                        key={pay.id}
                        onClick={() => handleSelect('payables')}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">alarm_add</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-900">{pay.creditorName}</span>
                            <span className="text-[10px] text-slate-500">{pay.invoiceNote} • Due {pay.dueDate}</span>
                          </div>
                        </div>
                        <AmountDisplay amount={pay.amount} privacyMode={privacyMode} size="sm" weight="semibold" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Borrowers & Loans */}
              {matchedBorrowers.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 block mb-1">
                    Loans &amp; Borrowers ({matchedBorrowers.length})
                  </span>
                  <div className="flex flex-col gap-1">
                    {matchedBorrowers.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleSelect('lending')}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#fdf8ea] text-[#9a761e] border border-[#d4af37]/30 flex items-center justify-center font-bold text-xs">
                            {b.initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-900">{b.name}</span>
                            <span className="text-[10px] text-slate-500">{b.contractType} • {b.phone}</span>
                          </div>
                        </div>
                        <AmountDisplay amount={b.principalAmount} privacyMode={privacyMode} size="sm" weight="semibold" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assets & Holdings */}
              {matchedAssets.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 block mb-1">
                    Assets &amp; Holdings ({matchedAssets.length})
                  </span>
                  <div className="flex flex-col gap-1">
                    {matchedAssets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => handleSelect('assets')}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-900">{asset.name}</span>
                            <span className="text-[10px] text-slate-500">{asset.institution} • {asset.category}</span>
                          </div>
                        </div>
                        <AmountDisplay amount={asset.valuation} privacyMode={privacyMode} size="sm" weight="semibold" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Click on any result to jump to that screen</span>
          <div className="flex items-center gap-2">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">Ctrl+K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
