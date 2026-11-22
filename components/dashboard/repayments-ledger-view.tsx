'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { BorrowerLoan } from './loans-interest-view';

interface RepaymentsLedgerViewProps {
  borrower: BorrowerLoan;
  onBackToProfile: () => void;
}

interface InstallmentRow {
  installmentNum: number;
  dueDate: string;
  amount: number;
  paymentDate: string;
  method: string;
  referenceId: string;
  status: 'Completed' | 'Overdue' | 'Upcoming';
}

interface AdvanceGroupData {
  advanceId: string;
  sanctionedAmount: number;
  statusTag: 'Active' | 'Completed / Closed';
  disbursedDate: string;
  agent: string;
  installmentSummary: string;
  collectedAmount: number;
  collectedRatio: string;
  remainingAmount: number;
  installments: InstallmentRow[];
}

export function RepaymentsLedgerView({ borrower, onBackToProfile }: RepaymentsLedgerViewProps) {
  const { privacyMode } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Completed' | 'Overdue' | 'Upcoming'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 3 Advance groups with complete 26 installments
  const advanceGroups: AdvanceGroupData[] = useMemo(
    () => [
      {
        advanceId: 'ADV-4091',
        sanctionedAmount: 25000,
        statusTag: 'Active',
        disbursedDate: '05 Jan 2025',
        agent: 'Arjun Sharma',
        installmentSummary: '10 Installments of ₹2,500',
        collectedAmount: 22500,
        collectedRatio: '9/10',
        remainingAmount: 2500,
        installments: [
          {
            installmentNum: 1,
            dueDate: '10 Feb 2025',
            amount: 2500,
            paymentDate: '09 Feb 2025',
            method: 'UPI',
            referenceId: 'AL247889151',
            status: 'Completed',
          },
          {
            installmentNum: 2,
            dueDate: '10 Mar 2025',
            amount: 2500,
            paymentDate: '10 Mar 2025',
            method: 'UPI',
            referenceId: 'AL247889282',
            status: 'Completed',
          },
          {
            installmentNum: 3,
            dueDate: '10 Apr 2025',
            amount: 2500,
            paymentDate: '09 Apr 2025',
            method: 'Cash',
            referenceId: 'AL247889387',
            status: 'Completed',
          },
          {
            installmentNum: 4,
            dueDate: '10 May 2025',
            amount: 2500,
            paymentDate: '09 May 2025',
            method: 'Net Banking',
            referenceId: 'AL247889501',
            status: 'Completed',
          },
          {
            installmentNum: 5,
            dueDate: '10 Jun 2025',
            amount: 2500,
            paymentDate: '10 Jun 2025',
            method: 'UPI',
            referenceId: 'AL247889720',
            status: 'Completed',
          },
          {
            installmentNum: 6,
            dueDate: '10 Jul 2025',
            amount: 2500,
            paymentDate: 'Overdue (15d)',
            method: 'UPI',
            referenceId: '—',
            status: 'Overdue',
          },
          {
            installmentNum: 7,
            dueDate: '10 Aug 2025',
            amount: 2500,
            paymentDate: '—',
            method: 'UPI',
            referenceId: '—',
            status: 'Upcoming',
          },
          {
            installmentNum: 8,
            dueDate: '10 Sep 2025',
            amount: 2500,
            paymentDate: '—',
            method: 'Cash',
            referenceId: '—',
            status: 'Upcoming',
          },
          {
            installmentNum: 9,
            dueDate: '10 Oct 2025',
            amount: 2500,
            paymentDate: '—',
            method: 'UPI',
            referenceId: '—',
            status: 'Upcoming',
          },
          {
            installmentNum: 10,
            dueDate: '10 Nov 2025',
            amount: 2500,
            paymentDate: '—',
            method: 'Net Banking',
            referenceId: '—',
            status: 'Upcoming',
          },
        ],
      },
      {
        advanceId: 'ADV-1021',
        sanctionedAmount: 20000,
        statusTag: 'Active',
        disbursedDate: '18 Aug 2024',
        agent: 'Suresh Varma',
        installmentSummary: '8 Installments of ₹2,500',
        collectedAmount: 15000,
        collectedRatio: '6/8',
        remainingAmount: 5000,
        installments: [
          {
            installmentNum: 1,
            dueDate: '18 Sep 2024',
            amount: 2500,
            paymentDate: '18 Sep 2024',
            method: 'UPI',
            referenceId: 'AL241889104',
            status: 'Completed',
          },
          {
            installmentNum: 2,
            dueDate: '18 Oct 2024',
            amount: 2500,
            paymentDate: '18 Oct 2024',
            method: 'Cash',
            referenceId: 'AL241889118',
            status: 'Completed',
          },
          {
            installmentNum: 3,
            dueDate: '18 Nov 2024',
            amount: 2500,
            paymentDate: '18 Nov 2024',
            method: 'Net Banking',
            referenceId: 'AL241889222',
            status: 'Completed',
          },
          {
            installmentNum: 4,
            dueDate: '18 Dec 2024',
            amount: 2500,
            paymentDate: '17 Dec 2024',
            method: 'UPI',
            referenceId: 'AL241889312',
            status: 'Completed',
          },
          {
            installmentNum: 5,
            dueDate: '18 Jan 2025',
            amount: 2500,
            paymentDate: '18 Jan 2025',
            method: 'UPI',
            referenceId: 'AL241889410',
            status: 'Completed',
          },
          {
            installmentNum: 6,
            dueDate: '18 Feb 2025',
            amount: 2500,
            paymentDate: '17 Feb 2025',
            method: 'Cash',
            referenceId: 'AL241889502',
            status: 'Completed',
          },
          {
            installmentNum: 7,
            dueDate: '18 Mar 2025',
            amount: 2500,
            paymentDate: '—',
            method: 'UPI',
            referenceId: '—',
            status: 'Upcoming',
          },
          {
            installmentNum: 8,
            dueDate: '18 Apr 2025',
            amount: 2500,
            paymentDate: '—',
            method: 'UPI',
            referenceId: '—',
            status: 'Upcoming',
          },
        ],
      },
      {
        advanceId: 'ADV-2010',
        sanctionedAmount: 20000,
        statusTag: 'Completed / Closed',
        disbursedDate: '14 May 2024',
        agent: 'Rahul Sharma',
        installmentSummary: '8 Installments of ₹2,500',
        collectedAmount: 20000,
        collectedRatio: '100% Cleared',
        remainingAmount: 0,
        installments: [
          {
            installmentNum: 1,
            dueDate: '14 Jun 2024',
            amount: 2500,
            paymentDate: '12 Jun 2024',
            method: 'UPI',
            referenceId: 'AL241589241',
            status: 'Completed',
          },
          {
            installmentNum: 2,
            dueDate: '14 Jul 2024',
            amount: 2500,
            paymentDate: '14 Jul 2024',
            method: 'UPI',
            referenceId: 'AL241589324',
            status: 'Completed',
          },
          {
            installmentNum: 3,
            dueDate: '14 Aug 2024',
            amount: 2500,
            paymentDate: '13 Aug 2024',
            method: 'Cash',
            referenceId: 'AL241589410',
            status: 'Completed',
          },
          {
            installmentNum: 4,
            dueDate: '14 Sep 2024',
            amount: 2500,
            paymentDate: '14 Sep 2024',
            method: 'Net Banking',
            referenceId: 'AL241589512',
            status: 'Completed',
          },
          {
            installmentNum: 5,
            dueDate: '14 Oct 2024',
            amount: 2500,
            paymentDate: '11 Oct 2024',
            method: 'UPI',
            referenceId: 'AL241589593',
            status: 'Completed',
          },
          {
            installmentNum: 6,
            dueDate: '14 Nov 2024',
            amount: 2500,
            paymentDate: '14 Nov 2024',
            method: 'UPI',
            referenceId: 'AL241589711',
            status: 'Completed',
          },
          {
            installmentNum: 7,
            dueDate: '14 Dec 2024',
            amount: 2500,
            paymentDate: '14 Dec 2024',
            method: 'Cash',
            referenceId: 'AL241589804',
            status: 'Completed',
          },
          {
            installmentNum: 8,
            dueDate: '14 Jan 2025',
            amount: 2500,
            paymentDate: '12 Jan 2025',
            method: 'Net Banking',
            referenceId: 'AL241589922',
            status: 'Completed',
          },
        ],
      },
    ],
    []
  );

  // Filtered Advances
  const filteredGroups = useMemo(() => {
    return advanceGroups
      .map((group) => {
        const matchingInstallments = group.installments.filter((inst) => {
          const matchesStatus = statusFilter === 'all' || inst.status === statusFilter;
          const q = searchQuery.toLowerCase().trim();
          const matchesQuery =
            !q ||
            inst.referenceId.toLowerCase().includes(q) ||
            inst.dueDate.toLowerCase().includes(q) ||
            inst.paymentDate.toLowerCase().includes(q) ||
            inst.method.toLowerCase().includes(q) ||
            inst.amount.toString().includes(q) ||
            group.advanceId.toLowerCase().includes(q);

          return matchesStatus && matchesQuery;
        });

        return {
          ...group,
          installments: matchingInstallments,
        };
      })
      .filter((g) => g.installments.length > 0);
  }, [advanceGroups, searchQuery, statusFilter]);

  const totalFilteredCount = filteredGroups.reduce((sum, g) => sum + g.installments.length, 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Advance ID',
      'Installment #',
      'Due Date',
      'Amount',
      'Payment Date',
      'Method',
      'Reference ID',
      'Status',
    ];

    const rows: (string | number)[][] = [];
    advanceGroups.forEach((g) => {
      g.installments.forEach((inst) => {
        rows.push([
          g.advanceId,
          inst.installmentNum,
          `"${inst.dueDate}"`,
          inst.amount,
          `"${inst.paymentDate}"`,
          `"${inst.method}"`,
          `"${inst.referenceId}"`,
          inst.status,
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `repayments_ledger_${borrower.name.replace(/\s+/g, '_')}_audit.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Downloaded Repayments Ledger Audit CSV for ${borrower.name}`);
  };

  return (
    <div className="flex flex-col w-full space-y-6 font-sans text-slate-800 antialiased animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0f172a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-[#d4af37]/40 animate-slideDown">
          <span className="material-symbols-outlined text-sm text-[#d4af37]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BREADCRUMB & CONTEXT BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Portfolio Outstanding Audit
            </span>
            <span className="text-slate-300">•</span>
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-800">
              <span className="text-xs font-semibold text-slate-800">{borrower.name}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-medium">
                {borrower.borrowerId || 'PD-90803'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="font-serif text-2xl md:text-3xl text-slate-900 tracking-tight font-semibold">
              Repayments Ledger &amp; Summary Breakdown
            </h1>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>2 Active Advances</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>1 Closed Advance</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 self-start md:self-center flex-wrap gap-y-2">
          <button
            type="button"
            onClick={onBackToProfile}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition shadow-2xs cursor-pointer"
            title="Return to Customer Profile"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Profile</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* PORTFOLIO SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Total Sanctioned */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-[#d4af37]/40 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Sanctioned (All Loans)
            </span>
            <div className="flex items-baseline space-x-2 pt-1">
              <span className="font-mono text-3xl font-bold tracking-tight text-slate-900">
                {privacyMode ? '••••••' : '₹65,000'}
              </span>
              <span className="text-xs text-slate-400 font-medium">INR</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
            <span className="flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-[16px] text-slate-400">account_balance_wallet</span>
              <span>3 Advances cumulative value</span>
            </span>
            <span className="font-mono text-xs text-slate-800 font-semibold">100% Capitalized</span>
          </div>
        </div>

        {/* Metric 2: Total Collected to Date */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-[#d4af37]/40 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Total Collected to Date
            </span>
            <div className="flex items-baseline space-x-2 pt-1">
              <span className="font-mono text-3xl font-bold tracking-tight text-emerald-600">
                {privacyMode ? '••••••' : '₹47,500'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                73.1% Recovery
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
            <span className="flex items-center space-x-1.5 text-emerald-700 font-medium">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>20 installments settled</span>
            </span>
            <span className="font-mono text-xs text-slate-500">Run-rate: Normal</span>
          </div>
        </div>

        {/* Metric 3: Total Outstanding to Collect */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              Total Outstanding to Collect
            </span>
            <div className="flex items-baseline space-x-2 pt-1">
              <span className="font-mono text-3xl font-bold tracking-tight text-slate-900">
                {privacyMode ? '••••••' : '₹17,500'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                Active Risk
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
            <span className="flex items-center space-x-1.5 text-rose-600 font-medium">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>Includes 1 overdue installment</span>
            </span>
            <span className="font-mono text-xs text-slate-500">₹2,500 pending claim</span>
          </div>
        </div>
      </div>

      {/* BREAKDOWN FORMULA BAR (Rich Warm Gold Pill matching screenshot!) */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-slate-900">
          <span className="material-symbols-outlined text-[20px] text-[#9a761e]">functions</span>
          <span className="text-xs uppercase text-slate-900 font-bold tracking-wider">
            To Collect Breakdown Formula:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs font-medium">
            <span className="text-slate-500">ADV-4091:</span>
            <span className="font-bold text-slate-900">{privacyMode ? '••••••' : '₹2,500'}</span>
          </div>
          <span className="text-slate-400 font-mono text-sm font-bold">+</span>
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs font-medium">
            <span className="text-slate-500">ADV-1021:</span>
            <span className="font-bold text-slate-900">{privacyMode ? '••••••' : '₹15,000'}</span>
          </div>
          <span className="text-slate-400 font-mono text-sm font-bold">+</span>
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs font-medium">
            <span className="text-slate-500">ADV-2010:</span>
            <span className="font-bold text-slate-900">{privacyMode ? '••••••' : '₹0'}</span>
          </div>
          <span className="text-slate-400 font-mono text-sm font-bold">=</span>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#d4af37] text-[#0f172a] font-mono text-xs font-bold shadow-xs">
            <span className="uppercase tracking-wider">Total to Collect:</span>
            <span className="text-sm">{privacyMode ? '••••••' : '₹17,500'}</span>
          </div>
        </div>
      </div>

      {/* SEARCH & MULTI-FILTER BAR */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
            search
          </span>
          <input
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#d4af37] transition placeholder:text-slate-400"
            id="ledgerSearch"
            placeholder="Search transactions by ID, date, or amount across all advances..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end flex-wrap gap-y-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase hidden sm:inline">Status:</span>
            <select
              className="bg-slate-50 text-slate-800 text-xs py-2 px-3 rounded-xl border border-slate-200 focus:outline-none cursor-pointer focus:bg-white font-medium"
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>

          {/* Date Range Filter Button */}
          <button
            type="button"
            onClick={() => showToast('Date range filter: Showing all active ledger dates')}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-medium transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">calendar_month</span>
            <span>Date: All Active</span>
            <span className="material-symbols-outlined text-[16px] text-slate-500">expand_more</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              showToast('Filters reset to default');
            }}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Reset Filters"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* ADVANCE GROUPS (With Warm Luxury Sand Table Headers as in screenshot) */}
      <div className="space-y-6">
        {filteredGroups.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-500 text-xs">
            No installments match your search or filter. Try clearing filters.
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.advanceId}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
            >
              {/* Header Summary Block */}
              <div className="p-5 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3 flex-wrap">
                    <h2 className="font-serif text-lg font-bold text-slate-900 tracking-tight">
                      Advance {group.advanceId} — {privacyMode ? '••••••' : `₹${group.sanctionedAmount.toLocaleString('en-IN')}`} Sanctioned
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        group.statusTag === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {group.statusTag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Disbursed: <span className="text-slate-900 font-semibold">{group.disbursedDate}</span> &nbsp;•&nbsp; Agent:{' '}
                    <span className="text-slate-900 font-semibold">{group.agent}</span> &nbsp;•&nbsp;{' '}
                    {group.installmentSummary}
                  </p>
                </div>

                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Collected
                    </span>
                    <span className="font-mono text-sm font-bold text-emerald-600">
                      {privacyMode ? '••••••' : `₹${group.collectedAmount.toLocaleString('en-IN')} (${group.collectedRatio})`}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block ${
                        group.remainingAmount > 0 ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      Remaining to Collect
                    </span>
                    <span
                      className={`font-mono text-sm font-bold ${
                        group.remainingAmount > 0 ? 'text-rose-600' : 'text-slate-500'
                      }`}
                    >
                      {privacyMode ? '••••••' : `₹${group.remainingAmount.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ledger Table with Warm Sand Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#fcf9f2] text-slate-700 border-b border-[#e8dcb8] text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-5">Installment #</th>
                      <th className="py-3 px-5">Due Date</th>
                      <th className="py-3 px-5">Amount (₹)</th>
                      <th className="py-3 px-5">Payment Date</th>
                      <th className="py-3 px-5">Method</th>
                      <th className="py-3 px-5">Reference / Tran ID</th>
                      <th className="py-3 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {group.installments.map((inst) => (
                      <tr
                        key={inst.installmentNum}
                        className={`transition group ${
                          inst.status === 'Overdue'
                            ? 'bg-rose-50/40 hover:bg-rose-50/60'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3 px-5 font-mono text-slate-500">{inst.installmentNum}</td>
                        <td
                          className={`py-3 px-5 font-medium ${
                            inst.status === 'Overdue' ? 'text-rose-700 font-bold' : 'text-slate-900'
                          }`}
                        >
                          {inst.dueDate}
                        </td>
                        <td
                          className={`py-3 px-5 font-mono font-bold ${
                            inst.status === 'Overdue' ? 'text-rose-700' : 'text-slate-900'
                          }`}
                        >
                          {privacyMode ? '••••••' : `₹${inst.amount.toLocaleString('en-IN')}`}
                        </td>
                        <td
                          className={`py-3 px-5 ${
                            inst.status === 'Overdue'
                              ? 'text-rose-600 font-bold'
                              : inst.paymentDate === '—'
                              ? 'text-slate-400'
                              : 'text-slate-600'
                          }`}
                        >
                          {inst.paymentDate}
                        </td>
                        <td className="py-3 px-5 text-slate-600">{inst.method}</td>
                        <td className="py-3 px-5 font-mono text-[11px] text-slate-400">
                          {inst.referenceId}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold border ${
                              inst.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : inst.status === 'Overdue'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                                : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}
                          >
                            {inst.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* BOTTOM FOOTER & AUDIT PAGINATION */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          Showing all <span className="font-bold text-slate-900">{totalFilteredCount} installments</span> across{' '}
          {filteredGroups.length} advances (ADV-4091, ADV-1021, ADV-2010)
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs cursor-not-allowed opacity-60 font-semibold"
            disabled
            type="button"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-mono text-xs font-semibold">
            Page 1 of 1
          </span>
          <button
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs cursor-not-allowed opacity-60 font-semibold"
            disabled
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
