'use client';

import React, { useState } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { BorrowerLoan } from './loans-interest-view';
import { RepaymentsLedgerView } from './repayments-ledger-view';
import { AmountDisplay } from '@/components/ui/amount-display';
import { AppBreadcrumb } from '@/components/ui/app-breadcrumb';
import { EditBorrowerModal } from '@/components/modals/edit-entry-modal';

interface BorrowerDetailViewProps {
  borrower: BorrowerLoan;
  onBack: () => void;
  onRecordPayment?: (id: string, amount: number) => void;
  initialShowLedger?: boolean;
}

interface AdvanceRow {
  id: string;
  advanceId: string;
  agent: string;
  issueDate: string;
  issueAmount: number;
  outstandingTotal: number;
  total: number;
}

interface RepaymentItem {
  id: string;
  date: string;
  installmentNumber: number;
  amount: number;
  status: 'Upcoming' | 'Completed';
}

interface DocumentItem {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  iconType: 'pdf' | 'image' | 'user' | 'bill';
}

export function BorrowerDetailView({
  borrower,
  onBack,
  onRecordPayment,
  initialShowLedger = false,
}: BorrowerDetailViewProps) {
  const { privacyMode, setActiveTab, recordLoanRepayment, addLoanAdvance, addLoanDocument, borrowers } = useFinance();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('2500');
  const [paymentNote, setPaymentNote] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocTitle, setUploadDocTitle] = useState('');
  const [showLedgerView, setShowLedgerView] = useState(initialShowLedger);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const activeBorrower = borrowers.find((b) => b.id === borrower.id) || borrower;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamic or default borrower metadata
  const borrowerIdCode = activeBorrower.borrowerId || 'PD-90803';
  const phoneNumber = activeBorrower.phone || '+91 98765 43210';
  const addressText = activeBorrower.address || 'Madhapur (C), Sector 2, Cyber Towers, Hyderabad';
  const totalSanctioned = activeBorrower.totalSanctioned || (activeBorrower.principalAmount * 2.6);
  const outstandingBalance = activeBorrower.outstandingBalance !== undefined ? activeBorrower.outstandingBalance : activeBorrower.nextDueAmount;
  const repaymentPacing = activeBorrower.repaymentPacing || `${activeBorrower.progressPercent > 0 ? activeBorrower.progressPercent.toFixed(1) : '90.0'}%`;
  const lifetimeCollected = activeBorrower.lifetimeCollected || (activeBorrower.principalAmount * 2.5);

  // Distribution advances tailored dynamically to borrower
  const [advances, setAdvances] = useState<AdvanceRow[]>(() => [
    {
      id: `adv-${activeBorrower.id}-1`,
      advanceId: `ADV-${activeBorrower.badgeNumber || 1}01`,
      agent: 'Field Officer (Witnessed)',
      issueDate: activeBorrower.dateGiven || '14 May 2024',
      issueAmount: activeBorrower.principalAmount,
      outstandingTotal: Math.max(0, activeBorrower.totalReceivable - activeBorrower.receivedAmount),
      total: activeBorrower.totalReceivable,
    },
  ]);

  // Repayments history tailored dynamically to borrower
  const [repayments, setRepayments] = useState<RepaymentItem[]>(() => {
    const list: RepaymentItem[] = [];
    const tenure = activeBorrower.tenureMonths || 12;
    const installmentAmt = Math.round(activeBorrower.totalReceivable / tenure);
    const paidInstallments = Math.min(
      Math.floor(activeBorrower.receivedAmount / (installmentAmt || 1)),
      tenure
    );

    for (let i = 1; i <= Math.min(tenure, 6); i++) {
      list.push({
        id: `rep-${activeBorrower.id}-${i}`,
        date: i === 1 ? (activeBorrower.nextDueDate || 'Upcoming') : `Cycle #${i}`,
        installmentNumber: i,
        amount: installmentAmt,
        status: i <= paidInstallments ? 'Completed' : 'Upcoming',
      });
    }
    return list;
  });

  // Documents
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 'doc-1',
      title: 'Signed Promissory Note',
      type: 'PDF',
      size: '2.4 MB',
      uploadedBy: 'Arjun Sharma (Owner)',
      uploadDate: '15 May 2024',
      iconType: 'pdf',
    },
    {
      id: 'doc-2',
      title: 'Premise & Shop Photo',
      type: 'JPG',
      size: '4.2 MB',
      uploadedBy: 'Rahul Sharma (Field Agent)',
      uploadDate: '16 May 2024',
      iconType: 'image',
    },
    {
      id: 'doc-3',
      title: 'Customer Passport Photo',
      type: 'PNG',
      size: '1.1 MB',
      uploadedBy: 'Rahul Sharma (Field Agent)',
      uploadDate: '16 May 2024',
      iconType: 'user',
    },
    {
      id: 'doc-4',
      title: 'Electricity / Utility Bill',
      type: 'PDF',
      size: '850 KB',
      uploadedBy: 'Rahul Sharma (Field Agent)',
      uploadDate: '16 May 2024',
      iconType: 'bill',
    },
  ]);

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) return;

    recordLoanRepayment(activeBorrower.id, amt, 'Direct Repayment');
    if (onRecordPayment) {
      onRecordPayment(activeBorrower.id, amt);
    }
    setShowPaymentModal(false);
    showToast(`Successfully recorded payment of ₹${amt.toLocaleString('en-IN')} for ${activeBorrower.name}`);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocTitle.trim()) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: uploadDocTitle,
      type: 'PDF',
      size: '1.8 MB',
      uploadedBy: 'Current User (Manager)',
      uploadDate: 'Today',
      iconType: 'pdf',
    };

    addLoanDocument(activeBorrower.id, {
      ...newDoc,
      borrowerId: activeBorrower.id,
    });

    setDocuments((prev) => [newDoc, ...prev]);
    setUploadDocTitle('');
    setShowUploadModal(false);
    showToast(`Uploaded document "${uploadDocTitle}"`);
  };

  const handleDeleteDocument = (id: string, title: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast(`Deleted "${title}"`);
  };

  if (showLedgerView) {
    return (
      <RepaymentsLedgerView
        borrower={activeBorrower}
        onBackToProfile={() => {
          setShowLedgerView(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onBackToLoans={onBack}
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 font-sans text-slate-800 antialiased animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0f172a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-[#d4af37]/40 animate-slideDown">
          <span className="material-symbols-outlined text-sm text-[#d4af37]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation (Unboxed) */}
      <AppBreadcrumb
        segments={[
          {
            label: 'Overview',
            onClick: () => {
              onBack();
              setActiveTab('overview');
            },
          },
          {
            label: 'Loans & Interest Ledger',
            onClick: () => {
              onBack();
              setActiveTab('lending');
            },
          },
          { label: 'Borrower Dossier', badge: borrowerIdCode },
        ]}
      />

      {/* Borrower Header Title Row with Action Buttons */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900 tracking-tight">
            {borrower.name}
          </h1>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              borrower.status === 'paid'
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                borrower.status === 'paid' ? 'bg-slate-500' : 'bg-emerald-500'
              }`}
            />
            {borrower.status === 'paid' ? 'Fully Settled' : 'Active'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-500"
            >
              <path d="M12 20h9" />
              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
            </svg>
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#eed885] hover:bg-[#dec468] text-[#0f172a] border border-[#d4af37]/30 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#0f172a]"
            >
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 17.5v-11" />
            </svg>
            <span>Record Payment</span>
          </button>

          <button
            type="button"
            onClick={() => showToast(`Dialing or texting ${borrower.name} at ${phoneNumber}`)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-500"
            >
              <path d="M13 2a9 9 0 0 1 9 9" />
              <path d="M13 6a5 5 0 0 1 5 5" />
              <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
            </svg>
            <span>Call / Message</span>
          </button>
        </div>
      </section>

      {/* Bento Grid Top Section (Profile + Progress & Trend) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Bento: Customer Profile & Overview (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Profile &amp; Overview
            </h2>

            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center font-bold text-sm shrink-0 ${
                    borrower.avatarBg || 'bg-slate-100'
                  } ${borrower.avatarText || 'text-slate-700'}`}
                >
                  {borrower.initials}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{borrower.name}</h3>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1 text-slate-400"
                    >
                      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
                    </svg>
                    <span>{phoneNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details List */}
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-start text-slate-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 text-slate-400 flex-shrink-0 mt-0.5"
                >
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{addressText}</span>
              </div>

              <div className="flex items-center text-slate-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 text-slate-400 flex-shrink-0"
                >
                  <path d="M16 10h2" />
                  <path d="M16 14h2" />
                  <path d="M6.17 15a3 3 0 0 1 5.66 0" />
                  <circle cx="9" cy="11" r="2" />
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                </svg>
                <span className="font-medium text-slate-700 mr-1.5">Borrower ID:</span>
                <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                  {borrowerIdCode}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Primary Contact Verified</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              KYC Complete
            </span>
          </div>
        </div>

        {/* Right Bento Column: Payment Progress & Trend (6 cols) */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          {/* Repayment Progress Mini-Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Payment Progress &amp; Trend
              </h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-400"
              >
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Repayment Progress</span>
                <span className="text-slate-400 text-[11px]">Total</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#d4af37] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${borrower.progressPercent}%` }}
                />
              </div>
              <div className="text-[11px] font-semibold text-[#946c09]">
                {borrower.progressPercent}% Completed
              </div>
            </div>
          </div>

          {/* Payment History Trend Chart Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-semibold text-slate-700">Payment History</h3>
                <p className="text-[10px] text-slate-400">Historical vs expected timeline</p>
              </div>
            </div>

            {/* Vector Curved Trend Graphic */}
            <div className="relative w-full h-24 my-2">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 90">
                {/* Grid guide lines */}
                <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="400" y1="80" y2="80" />
                <line stroke="#f8fafc" strokeWidth="1" x1="0" x2="400" y1="40" y2="40" />
                {/* Shaded Area Below Expected Collection Trend */}
                <path
                  d="M 0 80 Q 90 75, 180 60 T 360 25 L 400 20 L 400 85 L 0 85 Z"
                  fill="url(#goldGradientDetail)"
                  opacity="0.18"
                />
                {/* Linear Gradient Definition */}
                <defs>
                  <linearGradient id="goldGradientDetail" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Expected Timeline (Dashed light grey) */}
                <path
                  d="M 0 70 Q 100 65, 200 55 T 400 35"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeDasharray="3,3"
                  strokeWidth="1.5"
                />
                {/* Historical Solid Timeline */}
                <path d="M 0 80 Q 90 75, 180 60 T 360 25 L 400 20" fill="none" stroke="#475569" strokeWidth="1.75" />
                {/* Trend Points & Collection Accent Curve */}
                <circle cx="180" cy="60" fill="#ffffff" r="3.5" stroke="#475569" strokeWidth="1.5" />
                <circle cx="360" cy="25" fill="#d4af37" r="3" />
                <circle cx="400" cy="20" fill="#d4af37" r="3" />
              </svg>
            </div>

            {/* Timeline Labels */}
            <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
              <span>Dec 10</span>
              <span>Dec 22</span>
              <span>Dec 28</span>
              <span>Dec 30</span>
              <span>Nov 18</span>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-5 text-[10px] text-slate-500 pt-2 flex-wrap gap-y-1">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-slate-700 mr-1.5" />
                Historical timeline
              </span>
              <span className="flex items-center">
                <span className="w-2.5 h-0.5 border-t border-dashed border-slate-400 mr-1.5" />
                Expected
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[#d4af37] mr-1.5" />
                Collection trend
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Metrics 4-Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Total Sanctioned */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Total GIVEN</span>
              <span className="p-1 rounded bg-slate-50 text-sky-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                  <path d="M14 8H8" />
                  <path d="M16 12H8" />
                  <path d="M13 16H8" />
                </svg>
              </span>
            </div>
            <div className="mt-1">
              <AmountDisplay amount={totalSanctioned} privacyMode={privacyMode} size="xl" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              2 Closed • <span className="text-slate-800 font-medium">1 Active</span> (3 Advances)
            </p>
          </div>

          {/* Metric 2: Outstanding Balance */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Outstanding Balance</span>
              <span className="p-1 rounded bg-amber-50 text-amber-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                  <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                  <path d="M7 21h10" />
                  <path d="M12 3v18" />
                  <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
                </svg>
              </span>
            </div>
            <div className="mt-1">
              <AmountDisplay amount={outstandingBalance} privacyMode={privacyMode} size="xl" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {privacyMode ? (
                '•••••• of ••••••'
              ) : (
                <span className="inline-flex items-baseline gap-1">
                  <span>Paid</span>
                  <AmountDisplay amount={borrower.receivedAmount} size="xs" />
                  <span>of</span>
                  <AmountDisplay amount={borrower.totalReceivable} size="xs" />
                </span>
              )}
            </p>
          </div>

          {/* Metric 3: Repayment Pacing */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Repayment Pacing</span>
              <span className="p-1 rounded bg-indigo-50 text-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 14 4-4" />
                  <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                </svg>
              </span>
            </div>
            <div className="text-xl font-semibold text-slate-900 tracking-tight font-serif">
              {repaymentPacing}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              18 of 20 daily cycles paid <span className="text-slate-700">(0 Overdue)</span>
            </p>
          </div>

          {/* Metric 4: Lifetime Collected */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Lifetime Collected</span>
              <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                  <path d="m15 9-6 6" />
                  <path d="M9 9h.01" />
                  <path d="M15 15h.01" />
                </svg>
              </span>
            </div>
            <div className="mt-1">
              <AmountDisplay amount={lifetimeCollected} privacyMode={privacyMode} size="xl" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Tier 1 Prime Customer • <span className="text-emerald-600 font-medium">100% On-Time</span>
            </p>
          </div>
        </div>
      </section>

      {/* Distribution Details Table Section */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Card Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-amber-50 rounded-lg text-[#946c09]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
                <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
                <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Distribution Details
                </h3>
                <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 font-medium px-2 py-0.5 rounded-full">
                  Active Advances ({advances.length})
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Chronological ledger of principal advances, disbursements, and aggregate balance revisions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowLedgerView(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-900 hover:text-[#b8860b] transition cursor-pointer"
            title="Open Repayments Ledger & Summary Breakdown"
          >
            <span>View all &gt;</span>
          </button>
        </div>

        {/* Advances Data Table */}
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-5 tracking-wider uppercase text-[10px]">Advance ID</th>
                <th className="py-2.5 px-4 tracking-wider uppercase text-[10px]">Distributed Agent</th>
                <th className="py-2.5 px-4 tracking-wider uppercase text-[10px]">Issue Date</th>
                <th className="py-2.5 px-4 tracking-wider uppercase text-[10px] text-right">Issue Amount</th>
                <th className="py-2.5 px-4 tracking-wider uppercase text-[10px] text-right">Outstanding Total</th>
                <th className="py-2.5 px-5 tracking-wider uppercase text-[10px] text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {advances.map((adv) => (
                <tr key={adv.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-5 font-mono font-medium text-slate-900">{adv.advanceId}</td>
                  <td className="py-3 px-4 text-slate-700">{adv.agent}</td>
                  <td className="py-3 px-4 text-slate-500">{adv.issueDate}</td>
                  <td className="py-3 px-4 text-right">
                    <AmountDisplay amount={adv.issueAmount} privacyMode={privacyMode} prefix="+₹" size="xs" color="text-emerald-700" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <AmountDisplay amount={adv.outstandingTotal} privacyMode={privacyMode} size="xs" color="text-amber-700" />
                  </td>
                  <td className="py-3 px-5 text-right">
                    <AmountDisplay amount={adv.total} privacyMode={privacyMode} size="xs" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment Ledger & Activities Split Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Repayments & History (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Repayments &amp; History
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowLedgerView(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center cursor-pointer"
              title="Open Repayments Ledger & Summary Breakdown"
            >
              <span>View all</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-0.5"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Installment items list */}
          <div className="space-y-2">
            {repayments.map((rep) => (
              <div
                key={rep.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50/60 transition"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      rep.status === 'Upcoming'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {rep.status === 'Upcoming' ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 14v2.2l1.6 1" />
                        <path d="M16 2v4" />
                        <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
                        <path d="M3 10h5" />
                        <path d="M8 2v4" />
                        <circle cx="16" cy="16" r="6" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 2v4" />
                        <path d="M16 2v4" />
                        <rect width="18" height="18" x="3" y="4" rx="2" />
                        <path d="M3 10h18" />
                        <path d="m9 16 2 2 4-4" />
                      </svg>
                    )}
                  </div>
                  <div className="text-xs">
                    <div className="font-medium text-slate-900">
                      {rep.date} <span className="text-slate-400 mx-1">•</span> Installment #{rep.installmentNumber}{' '}
                      <span className="text-slate-400 mx-1">•</span>{' '}
                      <AmountDisplay amount={rep.amount} privacyMode={privacyMode} size="xs" />
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                    rep.status === 'Upcoming'
                      ? 'bg-sky-50 text-sky-700 border-sky-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  {rep.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Notes Section (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Notes</h3>
              <button
                type="button"
                onClick={() => showToast('Viewing all recorded field visit notes')}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                View all
              </button>
            </div>

            {/* Note Entry Card */}
            <div className="p-3 bg-amber-50/40 border-l-2 border-[#d4af37] rounded-r-lg">
              <div className="flex items-start space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#946c09] flex-shrink-0 mt-0.5"
                >
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="M10 9H8" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                </svg>
                <div className="text-xs text-slate-700 leading-relaxed">
                  Visited by <strong className="text-slate-900 font-medium">Rahul Sharma (Agent)</strong> - Promised
                  to pay on Nov 20.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Last entry</span>
            <span>Recorded 3 days ago</span>
          </div>
        </div>
      </section>

      {/* Customer Documents & Uploads */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-amber-50 rounded-lg text-[#946c09]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="15" cy="19" r="2" />
                <path d="M20.9 19.8A2 2 0 0 0 22 18V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h5.1" />
                <path d="M15 11v-1" />
                <path d="M15 17v-2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Customer Documents &amp; Uploads
                </h3>
                <button
                  type="button"
                  onClick={() => showToast('Full document vault opened')}
                  className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  View all
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Manage identity proofs, loan agreement papers, premise photos, and promissory notes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#eed885] hover:bg-[#dec468] text-[#0f172a] border border-[#d4af37]/30 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 13v8" />
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
              <path d="m8 17 4-4 4 4" />
            </svg>
            <span>Upload Document</span>
          </button>
        </div>

        {/* Documents Table List */}
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-5 tracking-wider uppercase text-[10px]">Document</th>
                <th className="py-2.5 px-4 tracking-wider uppercase text-[10px]">Uploaded By</th>
                <th className="py-2.5 px-4 tracking-wider uppercase text-[10px]">Upload Date</th>
                <th className="py-2.5 px-5 tracking-wider uppercase text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-5">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                          doc.iconType === 'pdf'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : doc.iconType === 'image'
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : doc.iconType === 'user'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                        }`}
                      >
                        {doc.iconType === 'pdf' ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                            <path d="m9 15 2 2 4-4" />
                          </svg>
                        ) : doc.iconType === 'image' ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                        ) : doc.iconType === 'user' ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 21a6 6 0 0 0-12 0" />
                            <circle cx="12" cy="11" r="4" />
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                            <path d="M12 17.5v-11" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{doc.title}</div>
                        <div className="text-[10px] text-slate-400">
                          {doc.type} • {doc.size}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{doc.uploadedBy}</td>
                  <td className="py-3 px-4 text-slate-500">{doc.uploadDate}</td>
                  <td className="py-3 px-5 text-right">
                    <div className="inline-flex items-center space-x-2 text-slate-400">
                      <button
                        type="button"
                        onClick={() => showToast(`Previewing ${doc.title}`)}
                        className="p-1 hover:text-slate-800 transition cursor-pointer"
                        title="View Document"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Downloading ${doc.title}`)}
                        className="p-1 hover:text-slate-800 transition cursor-pointer"
                        title="Download"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 15V3" />
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <path d="m7 10 5 5 5-5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id, doc.title)}
                        className="p-1 hover:text-rose-600 transition cursor-pointer"
                        title="Delete"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4af37]">payments</span>
                <h3 className="font-bold text-slate-900 text-base">Record Payment</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Borrower</label>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{borrower.name}</div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Payment Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full h-10 mt-1 px-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Note / Settlement Method</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full h-10 mt-1 px-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                  placeholder="e.g. Bank Transfer / UPI / Cash"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#eed885] hover:bg-[#dec468] text-[#0f172a] border border-[#d4af37]/30 shadow-xs transition cursor-pointer active:scale-[0.98]"
                >
                  Confirm Payout Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4af37]">upload_file</span>
                <h3 className="font-bold text-slate-900 text-base">Upload Document</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Document Title</label>
                <input
                  type="text"
                  value={uploadDocTitle}
                  onChange={(e) => setUploadDocTitle(e.target.value)}
                  className="w-full h-10 mt-1 px-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                  placeholder="e.g. Identity Proof / Rental Lease Agreement"
                  required
                />
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#d4af37] transition cursor-pointer bg-slate-50">
                <span className="material-symbols-outlined text-3xl text-slate-400">cloud_upload</span>
                <span className="text-xs font-semibold text-slate-700 mt-2">Click to select file</span>
                <span className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 10MB</span>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#eed885] hover:bg-[#dec468] text-[#0f172a] border border-[#d4af37]/30 shadow-xs transition cursor-pointer active:scale-[0.98]"
                >
                  Upload &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Borrower & Terms Modal */}
      <EditBorrowerModal
        borrower={isEditModalOpen ? activeBorrower : null}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={showToast}
      />
    </div>
  );
}
