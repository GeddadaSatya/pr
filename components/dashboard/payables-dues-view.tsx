'use client';

import React, { useState } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { PayableItem } from '@/lib/types';
import { AmountDisplay } from '@/components/ui/amount-display';
import { AppBreadcrumb } from '@/components/ui/app-breadcrumb';

export function PayablesDuesView() {
  const { payables, recordPayout, privacyMode, openModal } = useFinance();
  const [activeLedgerTab, setActiveLedgerTab] = useState<'all' | 'paid'>('all');
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [pageSize, setPageSize] = useState('10');
  const [settledItems, setSettledItems] = useState<PayableItem[]>([]);

  // Settle action handler
  const handleSettle = (id: string) => {
    const item = payables.find((p) => p.id === id);
    if (item) {
      setSettledItems((prev) => [{ ...item, status: 'paid', statusLabel: 'Settled' }, ...prev]);
      recordPayout(id);
    }
  };

  const pendingPayables = payables.filter((p) => p.status === 'pending');
  const displayedPayables = activeLedgerTab === 'all' ? pendingPayables : settledItems;

  const totalOutstanding = pendingPayables.reduce((sum, p) => sum + p.amount, 0);
  const dueWithin7Days = pendingPayables
    .filter((p) => p.dueDate.includes('Oct 28') || p.urgencyBadge?.includes('3d') || p.statusLabel === 'Due Soon')
    .reduce((sum, p) => sum + p.amount, 0);
  const autoScheduledAch = pendingPayables
    .filter((p) => p.urgencyBadge?.includes('ACH') || p.statusLabel === 'Scheduled ACH')
    .reduce((sum, p) => sum + p.amount, 0);

  const marcusItem = pendingPayables.find((p) => p.creditorName.includes('Marcus'));

  const handleExportCSV = () => {
    const headers = ['Vendor / Beneficiary', 'Category', 'Due Date', 'Disbursement Route', 'Status', 'Amount'];
    const rows = displayedPayables.map((p) => [
      `"${p.creditorName}"`,
      `"${p.category || 'Vendor'}"`,
      `"${p.fullDueDate || p.dueDate}"`,
      `"${p.disbursementRoute || 'Direct Wire'}"`,
      `"${p.statusLabel || p.status}"`,
      p.amount,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `payables_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getVendorIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('marcus') || n.includes('vance') || n.includes('hardware')) return 'store';
    if (n.includes('elena') || n.includes('rostova') || n.includes('syndicate')) return 'account_balance';
    if (n.includes('sterling') || n.includes('law') || n.includes('cross')) return 'gavel';
    return 'receipt_long';
  };

  const getCategoryPill = (category?: string) => {
    const c = (category || '').toLowerCase();
    if (c.includes('equipment') || c.includes('capital')) {
      return 'bg-sky-50 text-sky-900 border border-sky-200/60';
    }
    if (c.includes('tranche') || c.includes('syndication')) {
      return 'bg-indigo-50 text-indigo-900 border border-indigo-200/60';
    }
    if (c.includes('legal') || c.includes('retainer') || c.includes('trust')) {
      return 'bg-slate-100 text-slate-700 border border-slate-200/80';
    }
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  return (
    <div className="flex flex-col w-full gap-5 md:gap-6 animate-fade-in" id="payables-dues-container">
      {/* Top Header Row with Export and Add Bill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <AppBreadcrumb
            className="mb-1"
            segments={[
              { label: 'Overview', tab: 'overview' },
              { label: 'Payables & Dues' },
            ]}
          />
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Payables &amp; Dues
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Track pending invoices, upcoming vendor liabilities, and recurring commitments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Export Ledger Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-slate-500">file_download</span>
            <span>Export Ledger</span>
          </button>

          {/* Add Bill Standardized Gold Button */}
          <button
            type="button"
            onClick={() => openModal('due')}
            className="h-10 px-4 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Bill</span>
          </button>
        </div>
      </div>

      {/* 3 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 w-full">
        {/* Card 1: TOTAL OUTSTANDING PAYABLES */}
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[145px]">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-[10px] md:text-[11px] uppercase text-slate-500 font-bold tracking-wider">
              TOTAL OUTSTANDING PAYABLES
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef9e7] text-[#b48e28] border border-[#d4af37]/40">
              {pendingPayables.length} Bills Active
            </span>
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-lg-mobile md:font-headline-lg font-serif text-slate-900 font-semibold tracking-tight">
                {privacyMode ? '••••••' : `₹${Math.floor(totalOutstanding).toLocaleString('en-IN')}`}
              </span>
              <span className="font-label-numeric text-xs text-slate-400 font-medium">
                {privacyMode ? '' : '.00'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />
            <span>Total committed liquidity due in next 30 days</span>
          </div>
        </div>

        {/* Card 2: DUE WITHIN 7 DAYS */}
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[145px]">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-[10px] md:text-[11px] uppercase text-slate-500 font-bold tracking-wider">
              DUE WITHIN 7 DAYS
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60">
              Action Required
            </span>
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-lg-mobile md:font-headline-lg font-serif text-red-600 font-semibold tracking-tight">
                {privacyMode ? '••••••' : `₹${Math.floor(dueWithin7Days).toLocaleString('en-IN')}`}
              </span>
              <span className="font-label-numeric text-xs text-red-400 font-medium">
                {privacyMode ? '' : '.00'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-red-700 font-medium">
            <span className="material-symbols-outlined text-sm text-red-500 shrink-0">schedule</span>
            <span className="truncate">Marcus Vance (Oct 28) requires settlement</span>
          </div>
        </div>

        {/* Card 3: AUTO-SCHEDULED ACH */}
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[145px]">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-[10px] md:text-[11px] uppercase text-slate-500 font-bold tracking-wider">
              AUTO-SCHEDULED ACH
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              Automated
            </span>
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-lg-mobile md:font-headline-lg font-serif text-slate-900 font-semibold tracking-tight">
                {privacyMode ? '••••••' : `₹${Math.floor(autoScheduledAch).toLocaleString('en-IN')}`}
              </span>
              <span className="font-label-numeric text-xs text-slate-400 font-medium">
                {privacyMode ? '' : '.00'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-emerald-800 font-medium">
            <span className="material-symbols-outlined text-sm text-emerald-600 shrink-0">check_circle</span>
            <span className="truncate">Elena Rostova syndicate release on Nov 02</span>
          </div>
        </div>
      </div>

      {/* Card 1: Bills to Pay Soon */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200/60 flex items-center justify-center text-red-600 shrink-0">
              <span className="material-symbols-outlined text-xl">flag</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider block">
                UPCOMING PAYMENTS
              </span>
              <h2 className="font-serif text-lg md:text-xl font-bold text-slate-900">
                Bills to Pay Soon
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Month Dropdown */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-9 pl-3 pr-7 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all cursor-pointer shadow-2xs appearance-none"
              >
                <option value="October">Month (October)</option>
                <option value="November">Month (November)</option>
                <option value="All">All Months</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 text-slate-400 text-sm pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Add Bill Standardized Gold Button */}
            <button
              type="button"
              onClick={() => openModal('due')}
              className="h-9 px-3.5 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add Bill</span>
            </button>
          </div>
        </div>

        {/* List of Bills to Pay Soon */}
        <div className="flex flex-col gap-3">
          {pendingPayables.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No upcoming bills to pay. All liabilities are settled!
            </div>
          ) : (
            pendingPayables.map((item) => {
              const isUrgent = item.dueDate.includes('Oct 28') || item.urgencyBadge?.includes('3d') || item.statusLabel === 'Due Soon';
              const isAch = item.urgencyBadge?.includes('ACH') || item.statusLabel === 'Scheduled ACH';
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-red-50/80 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                      <span className="material-symbols-outlined text-lg">{getVendorIcon(item.creditorName)}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {item.creditorName}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        {item.invoiceNote}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end">
                    <AmountDisplay amount={item.amount} privacyMode={privacyMode} size="sm" />
                    {isUrgent ? (
                      <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        <span>{item.dueDate} (Due in 3d)</span>
                      </span>
                    ) : isAch ? (
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {item.dueDate} (Scheduled ACH)
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {item.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Card Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500 italic">Pay on time to keep debt clear</span>
          {marcusItem ? (
            <button
              type="button"
              onClick={() => handleSettle(marcusItem.id)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Record Payout (Marcus)
            </button>
          ) : pendingPayables.length > 0 ? (
            <button
              type="button"
              onClick={() => handleSettle(pendingPayables[0].id)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Record Payout ({pendingPayables[0].creditorName.split(' ')[0]})
            </button>
          ) : null}
        </div>
      </div>

      {/* Card 2: Accounts Payable Master Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-serif text-lg md:text-xl font-bold text-slate-900">
              Accounts Payable Master Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete record of current liabilities, contracts, and scheduled disbursements
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveLedgerTab('all')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeLedgerTab === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Payables
              </button>
              <button
                type="button"
                onClick={() => setActiveLedgerTab('paid')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeLedgerTab === 'paid'
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paid History
              </button>
            </div>

            {/* Month Filter */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-8.5 pl-2.5 pr-7 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all cursor-pointer shadow-2xs appearance-none"
              >
                <option value="October">Month (October)</option>
                <option value="November">Month (November)</option>
                <option value="All">All Months</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-1.5 text-slate-400 text-sm pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Master Ledger Table */}
        <div className="rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[840px]">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead>
                <tr className="text-slate-400 text-[11px] uppercase tracking-wider bg-slate-50 border-b border-slate-200/80 font-bold">
                  <th className="py-2.5 px-4 text-left">VENDOR / BENEFICIARY</th>
                  <th className="py-2.5 px-4 text-center">CATEGORY</th>
                  <th className="py-2.5 px-4 text-left">DUE DATE</th>
                  <th className="py-2.5 px-4 text-left">DISBURSEMENT ROUTE</th>
                  <th className="py-2.5 px-4 text-center">STATUS</th>
                  <th className="py-2.5 px-4 text-right">AMOUNT</th>
                  <th className="py-2.5 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {displayedPayables.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                      {activeLedgerTab === 'all'
                        ? 'No active payables found.'
                        : 'No settled history records yet.'}
                    </td>
                  </tr>
                ) : (
                  displayedPayables.map((item) => {
                    const isUrgent = item.dueDate.includes('Oct 28') || item.urgencyBadge?.includes('3d') || item.statusLabel === 'Due Soon';
                    const isPreAuth = item.dueDateUrgency?.includes('Pre-authorized') || item.statusLabel === 'Scheduled ACH';
                    const isPaid = item.status === 'paid';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Vendor / Beneficiary */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-xs md:text-sm text-slate-900 truncate">
                              {item.creditorName}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate">
                              {item.beneficiarySub || item.invoiceNote}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center text-center px-2.5 h-7 rounded-full text-xs font-semibold whitespace-nowrap w-[170px] shadow-2xs ${getCategoryPill(
                              item.category
                            )}`}
                          >
                            {item.category || 'Vendor Capital'}
                          </span>
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className={`text-xs font-semibold ${isUrgent ? 'text-red-600' : 'text-slate-800'}`}>
                              {item.fullDueDate || item.dueDate}
                            </span>
                            <span
                              className={`text-[10px] font-medium ${
                                isUrgent
                                  ? 'text-red-500 font-semibold'
                                  : isPreAuth
                                  ? 'text-emerald-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {item.dueDateUrgency || (isUrgent ? 'Urgent (in 3 days)' : 'Regular Cycle')}
                            </span>
                          </div>
                        </td>

                        {/* Disbursement Route */}
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600 truncate">
                          {item.disbursementRoute || 'Direct Wire (HDFC)'}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-2xs ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                                : isUrgent
                                ? 'bg-red-50 text-red-700 border border-red-200/60'
                                : isPreAuth
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {item.statusLabel || (isPaid ? 'Settled' : 'Pending')}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <AmountDisplay amount={item.amount} privacyMode={privacyMode} size="sm" />
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center justify-center w-[96px] h-7 text-xs font-semibold text-emerald-600">Paid</span>
                          ) : item.actionLabel === 'Settle Now' || isUrgent ? (
                            <button
                              type="button"
                              onClick={() => handleSettle(item.id)}
                              className="w-[96px] h-7 rounded-lg bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center justify-center"
                            >
                              Settle Now
                            </button>
                          ) : item.actionLabel === 'Review ACH' ? (
                            <button
                              type="button"
                              onClick={() => alert(`Reviewing automated ACH release for ${item.creditorName}`)}
                              className="w-[96px] h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer inline-flex items-center justify-center"
                            >
                              Review ACH
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => alert(`Managing payable for ${item.creditorName}`)}
                              className="w-[96px] h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer inline-flex items-center justify-center"
                            >
                              {item.actionLabel || 'Manage'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>Showing {displayedPayables.length} of {displayedPayables.length} ledgers</span>
              <div className="flex items-center gap-1">
                <span>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="h-7 px-1.5 rounded border border-slate-200 bg-white text-slate-700 text-xs"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span>rows</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              <button
                type="button"
                disabled
                className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded border border-slate-300 bg-white font-bold text-slate-900 shadow-2xs"
              >
                1
              </button>
              <button
                type="button"
                disabled
                className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
