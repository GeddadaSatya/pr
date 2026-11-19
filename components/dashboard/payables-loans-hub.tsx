'use client';

import React from 'react';
import { useFinance } from '@/components/context/finance-context';
import { formatCurrency } from '@/lib/utils';

export function PayablesLoansHub() {
  const { payables, loans, recordPayout, privacyMode, openModal } = useFinance();

  const totalPayables = payables
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalLoans = loans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.principalAmount, 0);

  const totalYield = loans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.monthlyInterest, 0);

  return (
    <div className="flex flex-col gap-4 w-full" id="operational-hub-section">
      {/* Mobile 2-Column Operational Summary (< 780px) */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {/* Bills to Pay Soon / Payable */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[11px] uppercase text-slate-500 font-bold tracking-wider">
              Payable
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">calendar_month</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-label-numeric text-base font-bold text-slate-900">
              {privacyMode ? '••••••' : `₹${totalPayables.toLocaleString('en-IN')}${totalPayables === 0 ? '.00' : ''}`}
            </span>
            {totalPayables === 0 ? (
              <div className="flex items-center gap-1.5 font-body-sm text-xs text-slate-500 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#fed65b] inline-block shrink-0" />
                <span className="truncate">No upcoming dues</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-body-sm text-xs text-slate-500 mt-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0" />
                <span className="truncate">{payables.length} bills within 7 days</span>
              </div>
            )}
          </div>
        </div>

        {/* Money You Lent / Receivable */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[11px] uppercase text-slate-500 font-bold tracking-wider">
              Receivable
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">diamond</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-label-numeric text-base font-bold text-slate-900">
              {privacyMode ? '••••••' : `₹${totalLoans.toLocaleString('en-IN')}${totalLoans === 0 ? '.00' : ''}`}
            </span>
            {totalLoans === 0 ? (
              <div className="flex items-center gap-1.5 font-body-sm text-xs text-slate-500 mt-1">
                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block shrink-0" />
                <span className="truncate">0 active loans</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-body-sm text-xs text-slate-500 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                <span className="truncate">{loans.length} parties active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Operational Grid (Visible on Desktop, >= 780px) */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Immediate Action Center: Dues & Payables You Owe */}
        <div className="lg:col-span-6 rounded-xl bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
                  <span className="material-symbols-outlined text-lg">schedule_send</span>
                </div>
                <div>
                  <span className="text-[11px] text-red-700 uppercase font-bold tracking-widest">
                    Upcoming Payments
                  </span>
                  <div className="font-headline-sm text-slate-900 font-semibold">
                    Bills to Pay Soon
                  </div>
                </div>
              </div>
              <button
                onClick={() => openModal('due')}
                className="text-[#b48e28] hover:underline text-xs font-semibold cursor-pointer"
                type="button"
              >
                + Add Bill
              </button>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              {payables.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                    <span className="material-symbols-outlined text-xl">event_available</span>
                  </div>
                  <span className="font-semibold text-xs text-slate-800">No upcoming dues</span>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 mb-3">
                    All scheduled vendor payments and liabilities have been settled.
                  </p>
                  <button
                    onClick={() => openModal('due')}
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    + Add Bill
                  </button>
                </div>
              ) : (
                payables.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between hover:bg-slate-100/70 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-red-600 shadow-xs shrink-0">
                        <span className="material-symbols-outlined text-xl">
                          {idx === 0
                            ? 'precision_manufacturing'
                            : idx === 1
                            ? 'real_estate_agent'
                            : 'gavel'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-slate-900">
                          {item.creditorName}
                        </span>
                        <span className="text-[11px] text-slate-500">{item.invoiceNote}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-extrabold text-xs text-slate-900">
                        {formatCurrency(item.amount, privacyMode)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                          item.urgencyBadge?.includes('Due in')
                            ? 'text-red-700 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.urgencyBadge?.includes('Due in') && (
                          <span className="material-symbols-outlined text-xs">timer</span>
                        )}
                        {item.dueDate} {item.urgencyBadge ? `(${item.urgencyBadge})` : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>Pay on time to keep debt clear</span>
            {payables.length > 0 && (
              <button
                onClick={() => recordPayout(payables[0].id)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 transition-colors font-semibold text-xs cursor-pointer"
                type="button"
              >
                Record Payout ({payables[0].creditorName.split(' ')[0]})
              </button>
            )}
          </div>
        </div>

        {/* Active Lending & Interest Flow Ticker */}
        <div className="lg:col-span-6 rounded-xl bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#fef9e7] border border-[#d4af37]/30 flex items-center justify-center text-[#b48e28]">
                  <span className="material-symbols-outlined text-lg">trending_up</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#b48e28] uppercase font-bold tracking-widest">
                    Active Loans
                  </span>
                  <div className="font-headline-sm text-slate-900 font-semibold">
                    Money You Lent to Others
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-emerald-800 font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                +{privacyMode ? '••••' : `₹${Math.round(totalYield).toLocaleString('en-IN')}`}/mo Yield
              </span>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              {loans.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                    <span className="material-symbols-outlined text-xl">handshake</span>
                  </div>
                  <span className="font-semibold text-xs text-slate-800">0 active loans</span>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 mb-3">
                    No active borrower promissory notes or personal capital disbursed.
                  </p>
                  <button
                    onClick={() => openModal('loan')}
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    + Issue Loan
                  </button>
                </div>
              ) : (
                loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between hover:bg-slate-100/70 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#fef9e7] border border-[#d4af37]/30 flex items-center justify-center text-[#b48e28] font-bold text-xs shrink-0">
                        {loan.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-slate-900">
                          {loan.borrowerName}
                        </span>
                        <span className="text-[11px] text-slate-500">{loan.note}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-extrabold text-xs text-slate-900">
                        {formatCurrency(loan.principalAmount, privacyMode)}
                      </span>
                      <span className="text-[11px] text-[#b48e28] font-semibold">
                        +{privacyMode ? '••••' : `₹${Math.round(loan.monthlyInterest).toLocaleString('en-IN')}`}/mo interest
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>
              Total interest collected: {privacyMode ? '••••' : '₹11,400.00'}
            </span>
            <button
              onClick={() => openModal('loan')}
              className="text-[#b48e28] text-xs font-semibold hover:underline cursor-pointer"
              type="button"
            >
              + Lend to New Person →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
