'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '@/components/context/finance-context';

export interface BorrowerLoan {
  id: string;
  name: string;
  initials: string;
  avatarBg?: string;
  avatarText?: string;
  badgeNumber?: number;
  contactOrNote: string;
  principalAmount: number;
  paymentMode: string;
  paymentModeIcon: string;
  dateGiven: string;
  interestRate: number; // percentage
  interestRatePeriod: '/ month' | '/ year' | 'flat rate';
  payoutFrequency: string;
  tenureMonths: number;
  termLabel: string;
  nextDueDate: string;
  nextDueAmount: number;
  dueCountdownText: string;
  dueCountdownType: 'critical' | 'warning' | 'normal';
  receivedAmount: number;
  totalReceivable: number;
  progressPercent: number;
  status: 'active' | 'grace' | 'paid';
  statusLabel: string;
  // Card-specific rich metadata
  contractType?: string;
  priorityTag?: string;
  settlementChannel?: string;
  noteTitle?: string;
  noteText?: string;
  attachmentName?: string;
}

const INITIAL_BORROWERS: BorrowerLoan[] = [
  {
    id: 'borrower-1',
    name: 'Marcus Vance',
    initials: 'MV',
    avatarBg: 'bg-[#0f172a]',
    avatarText: 'text-[#d4af37]',
    badgeNumber: 1,
    contactOrNote: 'Head Builder & Architect Renovations',
    principalAmount: 10000,
    paymentMode: 'UPI / Bank Wire',
    paymentModeIcon: 'account_balance',
    dateGiven: 'Mar 20, 2024',
    interestRate: 10.0,
    interestRatePeriod: 'flat rate',
    payoutFrequency: 'Lump Sum at Maturity',
    tenureMonths: 6,
    termLabel: '6-Month Term',
    nextDueDate: 'Nov 18, 2024',
    nextDueAmount: 3500,
    dueCountdownText: '3 Days Remaining',
    dueCountdownType: 'critical',
    receivedAmount: 8500,
    totalReceivable: 12000,
    progressPercent: 71,
    status: 'active',
    statusLabel: 'Active & Paying',
    contractType: 'Milestone Contract',
    priorityTag: 'Priority High',
    settlementChannel: 'FedWire Direct (Chase Corp)',
    noteTitle: 'General Contractor',
    noteText: 'Milestone loan for materials and subcontractor advance.',
  },
  {
    id: 'borrower-2',
    name: 'Sarah Jenkins',
    initials: 'SJ',
    avatarBg: 'bg-[#0f172a]',
    avatarText: 'text-white',
    badgeNumber: 2,
    contactOrNote: 'Tribeca Creative Loft Leasing',
    principalAmount: 30000,
    paymentMode: 'Cheque #4021',
    paymentModeIcon: 'history_edu',
    dateGiven: 'Feb 01, 2024',
    interestRate: 12.0,
    interestRatePeriod: '/ year',
    payoutFrequency: 'Quarterly Payout',
    tenureMonths: 24,
    termLabel: '24-Month Term',
    nextDueDate: 'Nov 20, 2024',
    nextDueAmount: 4000,
    dueCountdownText: '5 Days Remaining',
    dueCountdownType: 'warning',
    receivedAmount: 6000,
    totalReceivable: 10000,
    progressPercent: 60,
    status: 'active',
    statusLabel: 'Active & Paying',
    contractType: 'Commercial Rent',
    priorityTag: 'Due This Week',
    settlementChannel: 'Auto-ACH Pull / Signature Bank',
    noteTitle: 'Lease Note',
    noteText: 'Includes designated freight elevator clearance window. Utilities invoiced separately on 28th.',
    attachmentName: 'Master_Lease_2024.pdf',
  },
  {
    id: 'borrower-3',
    name: 'David Chen',
    initials: 'DC',
    avatarBg: 'bg-[#0f172a]',
    avatarText: 'text-[#d4af37]',
    badgeNumber: 3,
    contactOrNote: 'Cinema Tech Equip Loan (Tranche 2/4)',
    principalAmount: 20000,
    paymentMode: 'Bank Transfer',
    paymentModeIcon: 'account_balance',
    dateGiven: 'Apr 12, 2024',
    interestRate: 0.0,
    interestRatePeriod: 'flat rate',
    payoutFrequency: '0% Peer Loan',
    tenureMonths: 12,
    termLabel: 'Installment 2 of 4',
    nextDueDate: 'Nov 27, 2024',
    nextDueAmount: 5000,
    dueCountdownText: '12 Days',
    dueCountdownType: 'normal',
    receivedAmount: 10000,
    totalReceivable: 20000,
    progressPercent: 50,
    status: 'active',
    statusLabel: 'Active & Paying',
    contractType: '0% Peer Loan',
    priorityTag: 'Installment 2 of 4',
    settlementChannel: 'Zelle / Instant Wire',
    noteTitle: 'Promissory Note',
    noteText: '0% personal loan agreement for camera production package. Next installment due Dec 27.',
    attachmentName: 'Promissory_Chen_08.pdf',
  },
  {
    id: 'borrower-4',
    name: 'Apex Global Logistics',
    initials: 'AG',
    avatarBg: 'bg-[#f1f5f9]',
    avatarText: 'text-[#0f172a]',
    badgeNumber: 4,
    contactOrNote: 'International Air Freight & Duty Customs',
    principalAmount: 18750,
    paymentMode: 'SWIFT International Transfer',
    paymentModeIcon: 'language',
    dateGiven: 'May 05, 2024',
    interestRate: 0.0,
    interestRatePeriod: 'flat rate',
    payoutFrequency: 'Net-30 Invoice',
    tenureMonths: 1,
    termLabel: 'Extended Term',
    nextDueDate: 'Dec 06, 2024',
    nextDueAmount: 18750,
    dueCountdownText: '21 Days',
    dueCountdownType: 'normal',
    receivedAmount: 0,
    totalReceivable: 18750,
    progressPercent: 0,
    status: 'active',
    statusLabel: 'Active & Paying',
    contractType: 'Net-30 Invoice',
    priorityTag: 'Extended Term',
    settlementChannel: 'SWIFT International Transfer',
    noteTitle: 'Customs Clearing',
    noteText: 'AWB #948-291684. Includes import tariffs & bonded warehouse insurance.',
    attachmentName: 'AWB_Manifest_Apex.pdf',
  },
  {
    id: 'borrower-5',
    name: 'Robert Sterling',
    initials: 'RS',
    avatarBg: 'bg-[#0f172a]',
    avatarText: 'text-[#d4af37]',
    badgeNumber: 5,
    contactOrNote: 'robert.s@havencrest.io • +91 98200 45112',
    principalAmount: 40000,
    paymentMode: 'Bank Transfer',
    paymentModeIcon: 'account_balance',
    dateGiven: 'Jan 15, 2024',
    interestRate: 1.5,
    interestRatePeriod: '/ month',
    payoutFrequency: 'Monthly Interest Payout',
    tenureMonths: 12,
    termLabel: '12-Month Term',
    nextDueDate: 'Nov 15, 2024',
    nextDueAmount: 600,
    dueCountdownText: 'Due in 3 Days',
    dueCountdownType: 'critical',
    receivedAmount: 3000,
    totalReceivable: 47200,
    progressPercent: 32,
    status: 'active',
    statusLabel: 'Active & Paying',
    contractType: 'Promissory Note',
    priorityTag: 'Yield Asset',
    settlementChannel: 'HDFC Direct RTGS',
    noteTitle: 'Havencrest Bridge',
    noteText: 'Secured promissory note with quarterly capital check-in.',
  },
  {
    id: 'borrower-6',
    name: 'Clara Hughes',
    initials: 'CH',
    avatarBg: 'bg-[#fdf8ea]',
    avatarText: 'text-[#0f172a]',
    badgeNumber: 6,
    contactOrNote: 'Shop Expansion • Witnessed',
    principalAmount: 15000,
    paymentMode: 'Cash Handover',
    paymentModeIcon: 'handshake',
    dateGiven: 'Nov 10, 2023',
    interestRate: 2.0,
    interestRatePeriod: '/ month',
    payoutFrequency: 'Monthly Interest Payout',
    tenureMonths: 10,
    termLabel: '10-Month Term',
    nextDueDate: 'Nov 10, 2024',
    nextDueAmount: 2100,
    dueCountdownText: 'Extra Time (4d)',
    dueCountdownType: 'warning',
    receivedAmount: 2100,
    totalReceivable: 18000,
    progressPercent: 48,
    status: 'grace',
    statusLabel: 'Grace Period',
    contractType: 'Personal Advance',
    priorityTag: 'Grace Period',
    settlementChannel: 'Cash Handover (Witnessed)',
    noteTitle: 'Boutique Expansion',
    noteText: 'Boutique fit-out advance, structured monthly cash return.',
  },
];

export function LoansInterestView() {
  const { privacyMode } = useFinance();

  // Master loan records
  const [borrowers, setBorrowers] = useState<BorrowerLoan[]>(INITIAL_BORROWERS);

  // View Mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'grace'>('all');

  // New Loan Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPaymentMode, setFormPaymentMode] = useState('Bank / UPI Transfer');
  const [formRate, setFormRate] = useState('1.5');
  const [formInterestType, setFormInterestType] = useState('Simple Monthly');
  const [formDuration, setFormDuration] = useState('12');

  // Interactive Calculator State (stored as strings so inputs can be cleared completely without '01' glitches)
  const [simPrincipal, setSimPrincipal] = useState<string>('25000');
  const [simRate, setSimRate] = useState<string>('10');
  const [simTenure, setSimTenure] = useState<string>('2');
  const [isCompound, setIsCompound] = useState<boolean>(true);
  const [showSchedule, setShowSchedule] = useState<boolean>(true);

  // Parsed numeric values for calculation
  const parsedPrincipal = useMemo(() => {
    if (!simPrincipal.trim()) return 0;
    const clean = simPrincipal.replace(/[^0-9.]/g, '');
    return clean ? parseFloat(clean) : 0;
  }, [simPrincipal]);

  const parsedRate = useMemo(() => {
    if (!simRate.trim()) return 0;
    const clean = simRate.replace(/[^0-9.]/g, '');
    return clean ? parseFloat(clean) : 0;
  }, [simRate]);

  const parsedTenure = useMemo(() => {
    if (!simTenure.trim()) return 0;
    const clean = simTenure.replace(/[^0-9]/g, '');
    return clean ? parseInt(clean, 10) : 0;
  }, [simTenure]);

  // Handle Reset Calculator (clears all calculator inputs)
  const handleResetCalculator = () => {
    setSimPrincipal('');
    setSimRate('');
    setSimTenure('');
    showToast('Calculator reset');
  };

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Month-by-month Compounding & Schedule Breakdown
  const monthlySchedule = useMemo(() => {
    const P = parsedPrincipal;
    const r = parsedRate / 100;
    const m = Math.min(Math.max(parsedTenure, 0), 60);

    if (P === 0 || m === 0) {
      return {
        rows: [],
        firstMonthInterest: 0,
        lastMonthInterest: 0,
        lastMonthInterestOnInterest: 0,
        totalInterestOnInterest: 0,
        totalBaseInterest: 0,
      };
    }

    const schedule: Array<{
      month: number;
      opening: number;
      baseInterest: number;
      interestOnInterest: number;
      monthTotalInterest: number;
      closing: number;
    }> = [];

    let currentBalance = P;
    const baseInterest = P * r;

    for (let i = 1; i <= m; i++) {
      const opening = currentBalance;
      const accruedPreviousInterest = Math.max(0, opening - P);
      const interestOnInterest = isCompound ? accruedPreviousInterest * r : 0;
      const monthTotalInterest = baseInterest + interestOnInterest;
      const closing = opening + monthTotalInterest;
      currentBalance = closing;

      schedule.push({
        month: i,
        opening,
        baseInterest,
        interestOnInterest,
        monthTotalInterest,
        closing,
      });
    }

    const firstMonthInterest = schedule[0]?.monthTotalInterest || 0;
    const lastMonth = schedule[schedule.length - 1];
    const lastMonthInterest = lastMonth?.monthTotalInterest || 0;
    const lastMonthInterestOnInterest = lastMonth?.interestOnInterest || 0;
    const totalInterestOnInterest = schedule.reduce((sum, item) => sum + item.interestOnInterest, 0);
    const totalBaseInterest = baseInterest * m;

    return {
      rows: schedule,
      firstMonthInterest,
      lastMonthInterest,
      lastMonthInterestOnInterest,
      totalInterestOnInterest,
      totalBaseInterest,
    };
  }, [parsedPrincipal, parsedRate, parsedTenure, isCompound]);

  // Calculator Math
  const calcResults = useMemo(() => {
    const P = parsedPrincipal;
    const r = parsedRate / 100;
    const m = parsedTenure;

    if (P === 0 || m === 0) {
      return {
        monthly: 0,
        totalInterest: 0,
        gross: P,
      };
    }

    let monthly = 0;
    let totalInterest = 0;
    let gross = P;

    if (!isCompound) {
      monthly = P * r;
      totalInterest = monthly * m;
      gross = P + totalInterest;
    } else {
      gross = P * Math.pow(1 + r, m);
      totalInterest = Math.max(0, gross - P);
      monthly = totalInterest / m;
    }

    return {
      monthly,
      totalInterest,
      gross,
    };
  }, [parsedPrincipal, parsedRate, parsedTenure, isCompound]);

  // Aggregate Metrics
  const totalPrincipalLent = useMemo(() => {
    return borrowers.reduce((acc, b) => acc + b.principalAmount, 0);
  }, [borrowers]);

  const totalInterestExpected = useMemo(() => {
    return borrowers.reduce((acc, b) => acc + Math.max(0, b.totalReceivable - b.principalAmount), 0);
  }, [borrowers]);

  const totalExpectedBack = totalPrincipalLent + totalInterestExpected;
  const activeCount = borrowers.filter((b) => b.status === 'active').length;
  const graceCount = borrowers.filter((b) => b.status === 'grace').length;

  // Filtered Borrowers List
  const filteredBorrowers = useMemo(() => {
    return borrowers.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        b.name.toLowerCase().includes(q) ||
        b.contactOrNote.toLowerCase().includes(q) ||
        b.paymentMode.toLowerCase().includes(q) ||
        (b.contractType && b.contractType.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ? true : statusFilter === 'active' ? b.status === 'active' : b.status === 'grace';

      return matchesSearch && matchesStatus;
    });
  }, [borrowers, searchQuery, statusFilter]);

  // Handle Mark as Paid
  const handleMarkAsPaid = (id: string, name: string) => {
    setBorrowers((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const alreadyPaid = b.receivedAmount >= b.totalReceivable;
          return {
            ...b,
            receivedAmount: alreadyPaid ? 0 : b.totalReceivable,
            progressPercent: alreadyPaid ? 0 : 100,
            status: alreadyPaid ? 'active' : 'paid',
            statusLabel: alreadyPaid ? 'Active & Paying' : 'Fully Settled',
          };
        }
        return b;
      })
    );
    showToast(`Payment status updated for ${name}`);
  };

  // Handle Quick Partial Payment
  const handlePayPart = (id: string, name: string) => {
    const addAmt = 1000;
    setBorrowers((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const nextReceived = Math.min(b.totalReceivable, b.receivedAmount + addAmt);
          const percent = Math.min(100, Math.round((nextReceived / b.totalReceivable) * 100));
          return {
            ...b,
            receivedAmount: nextReceived,
            progressPercent: percent,
            status: percent >= 100 ? 'paid' : b.status,
            statusLabel: percent >= 100 ? 'Fully Settled' : b.statusLabel,
          };
        }
        return b;
      })
    );
    showToast(`Added ₹1,000 partial payment from ${name}`);
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Borrower Name',
      'Principal Amount',
      'Payment Mode',
      'Interest Rate',
      'Terms',
      'Next Due Date',
      'Next Due Amount',
      'Received Amount',
      'Total Receivable',
      'Status',
    ];
    const rows = borrowers.map((b) => [
      `"${b.name}"`,
      b.principalAmount,
      `"${b.paymentMode}"`,
      `"${b.interestRate}%"`,
      `"${b.termLabel}"`,
      `"${b.nextDueDate}"`,
      b.nextDueAmount,
      b.receivedAmount,
      b.totalReceivable,
      `"${b.statusLabel}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Money_Lent_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported loans & interest ledger to CSV');
  };

  // Handle New Loan Submit
  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = parseFloat(formAmount) || 0;
    if (!formName.trim() || principal <= 0) return;

    const rate = parseFloat(formRate) || 1.5;
    const duration = parseInt(formDuration, 10) || 12;

    const initials = formName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

    const monthlyInterest = (principal * (rate / 100));
    const totalExpected = principal + (monthlyInterest * duration);

    const newLoan: BorrowerLoan = {
      id: `borrower-${Date.now()}`,
      name: formName.trim(),
      initials: initials || 'LN',
      avatarBg: 'bg-[#0f172a]',
      avatarText: 'text-[#d4af37]',
      badgeNumber: borrowers.length + 1,
      contactOrNote: formContact.trim() || 'Direct Personal Loan',
      principalAmount: principal,
      paymentMode: formPaymentMode,
      paymentModeIcon: formPaymentMode.includes('Cheque') ? 'history_edu' : formPaymentMode.includes('Cash') ? 'handshake' : 'account_balance',
      dateGiven: 'Today, Just now',
      interestRate: rate,
      interestRatePeriod: formInterestType.includes('Yearly') ? '/ year' : '/ month',
      payoutFrequency: formInterestType,
      tenureMonths: duration,
      termLabel: `${duration}-Month Term`,
      nextDueDate: 'Next Month',
      nextDueAmount: monthlyInterest,
      dueCountdownText: '30 Days Remaining',
      dueCountdownType: 'normal',
      receivedAmount: 0,
      totalReceivable: totalExpected,
      progressPercent: 0,
      status: 'active',
      statusLabel: 'Active & Paying',
      contractType: formInterestType,
      priorityTag: 'Active Loan',
      settlementChannel: formPaymentMode,
      noteTitle: 'Agreement Note',
      noteText: `${formInterestType} loan at ${rate}% interest for ${duration} months.`,
    };

    setBorrowers([newLoan, ...borrowers]);
    setIsModalOpen(false);
    setFormName('');
    setFormContact('');
    setFormAmount('');
    showToast(`Recorded new loan of ₹${principal.toLocaleString('en-IN')} to ${formName}`);
  };

  return (
    <div className="flex flex-col w-full py-4 md:py-6 gap-6 animate-fade-in">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-60 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-sm text-[#d4af37]">check_circle</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Top Control Banner: Context, Date & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] uppercase tracking-wider text-[#d4af37] font-bold">Personal Lending</span>
            <span className="text-[#76777d] text-xs">•</span>
            <span className="text-[11px] text-[#45464d] uppercase font-semibold">Money Lent &amp; Interest</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-[#0f172a] font-normal tracking-tight">
            Money Given &amp; Interest Tracker
          </h1>
          <p className="text-xs md:text-sm text-[#45464d] mt-0.5">
            Keep track of money you lent to people, interest rates, and when you get paid back.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="text-xs text-[#0f172a] font-semibold tracking-wide">
              {activeCount} Active Loans
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-[#0f172a] text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Give New Loan</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Row (Executive Sovereign Light Luxury Cards - 5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Lent */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-semibold">Total Lent</span>
            <div className="w-8 h-8 rounded-lg bg-[#f8fafc] border border-slate-200/70 flex items-center justify-center text-[#0f172a]">
              <span className="material-symbols-outlined text-base">payments</span>
            </div>
          </div>
          <div>
            <div className="font-serif text-xl md:text-2xl text-[#0f172a] font-bold tracking-tight">
              {privacyMode ? '••••••' : `₹${totalPrincipalLent.toLocaleString('en-IN')}`}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#fdf8ea] text-[#9a761e] border border-[#d4af37]/30">
                {borrowers.length} Loans
              </span>
            </div>
          </div>
        </div>

        {/* Interest to Earn */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-semibold">Interest to Earn</span>
            <div className="w-8 h-8 rounded-lg bg-[#fdf8ea] border border-[#d4af37]/30 flex items-center justify-center text-[#9a761e]">
              <span className="material-symbols-outlined text-base">trending_up</span>
            </div>
          </div>
          <div>
            <div className="font-serif text-xl md:text-2xl text-[#0f172a] font-bold tracking-tight">
              {privacyMode ? '••••••' : `+₹${totalInterestExpected.toLocaleString('en-IN')}`}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                15.0% Net
              </span>
              <span className="text-xs text-[#76777d]">Avg Yield</span>
            </div>
          </div>
        </div>

        {/* Expected Back */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-semibold">Expected Back</span>
            <div className="w-8 h-8 rounded-lg bg-[#f8fafc] border border-slate-200/70 flex items-center justify-center text-[#0f172a]">
              <span className="material-symbols-outlined text-base">account_balance</span>
            </div>
          </div>
          <div>
            <div className="font-serif text-xl md:text-2xl text-[#0f172a] font-bold tracking-tight">
              {privacyMode ? '••••••' : `₹${totalExpectedBack.toLocaleString('en-IN')}`}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-xs text-[#76777d]">Principal + Interest</span>
            </div>
          </div>
        </div>

        {/* Monthly Inflow */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-semibold">Monthly Inflow</span>
            <div className="w-8 h-8 rounded-lg bg-[#fdf8ea] border border-[#d4af37]/30 flex items-center justify-center text-[#9a761e]">
              <span className="material-symbols-outlined text-base">savings</span>
            </div>
          </div>
          <div>
            <div className="font-serif text-xl md:text-2xl text-[#0f172a] font-bold tracking-tight">
              {privacyMode ? '••••••' : '₹1,425'}
              <span className="text-xs text-[#76777d] font-normal ml-1">/ mon</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-xs text-[#76777d]">Recurring interest</span>
            </div>
          </div>
        </div>

        {/* Repayment Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-semibold">Repayment Rate</span>
            <div className="w-8 h-8 rounded-lg bg-[#f8fafc] border border-slate-200/70 flex items-center justify-center text-emerald-800">
              <span className="material-symbols-outlined text-base">verified</span>
            </div>
          </div>
          <div>
            <div className="font-serif text-xl md:text-2xl text-[#0f172a] font-bold tracking-tight">
              98.2%
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Good
              </span>
              <span className="text-xs text-[#76777d]">On-time track</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive ROI Calculator Simulator & Visual Analytics Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Calculator (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#fdf8ea] border border-[#d4af37]/30 flex items-center justify-center text-[#9a761e]">
                <span className="material-symbols-outlined text-base">calculate</span>
              </div>
              <div>
                <span className="text-sm font-bold text-[#0f172a] block">Calculate Interest &amp; Return</span>
                <p className="text-xs text-[#76777d]">Estimate monthly interest and total repayment</p>
              </div>
            </div>

            {/* Actions: Reset & Simple vs Compound Mode */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleResetCalculator}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                title="Reset calculator inputs"
              >
                <span className="material-symbols-outlined text-sm text-[#9a761e]">restart_alt</span>
                <span>Reset</span>
              </button>

              {/* Simple vs Compound Mode */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setIsCompound(false)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    !isCompound ? 'bg-[#0f172a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Simple
                </button>
                <button
                  type="button"
                  onClick={() => setIsCompound(true)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isCompound ? 'bg-[#0f172a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Compound
                </button>
              </div>
            </div>
          </div>

          {/* Calculator Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            {/* Loan Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-[#45464d] uppercase font-semibold">Loan Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#0f172a] font-bold">₹</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={simPrincipal}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setSimPrincipal(clean);
                  }}
                  className="w-full h-10 bg-[#f8fafc] border border-slate-200 pl-7 pr-3 rounded-xl text-xs md:text-sm font-semibold text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white transition-all"
                />
              </div>
              <span className="text-[11px] text-[#76777d]">Principal sum</span>
            </div>

            {/* Interest Rate */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] text-[#45464d] uppercase font-semibold">Interest Rate</label>
                <span className="text-[11px] text-[#9a761e] font-semibold">
                  {parsedRate > 0 ? `${parsedRate.toFixed(2)}% / mo` : '0% / mo'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={simRate}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9.]/g, '');
                    setSimRate(clean);
                  }}
                  className="w-full h-10 bg-[#f8fafc] border border-slate-200 px-3 pr-14 rounded-xl text-xs md:text-sm font-semibold text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#76777d] pointer-events-none">% / mo</span>
              </div>
              <span className="text-[11px] text-[#76777d]">Monthly rate</span>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] text-[#45464d] uppercase font-semibold">Duration</label>
                <span className="text-[11px] text-[#0f172a] font-semibold">
                  {parsedTenure > 0 ? `${parsedTenure} Months` : '0 Months'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={simTenure}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setSimTenure(clean);
                    }}
                    className="w-full h-10 bg-[#f8fafc] border border-slate-200 px-3 pr-10 rounded-xl text-xs md:text-sm font-semibold text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#76777d] pointer-events-none">Mo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSimTenure('6')}
                  className={`h-10 px-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    simTenure === '6' ? 'bg-[#fdf8ea] border border-[#d4af37]/40 text-[#0f172a] font-bold' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  6M
                </button>
                <button
                  type="button"
                  onClick={() => setSimTenure('12')}
                  className={`h-10 px-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    simTenure === '12' ? 'bg-[#fdf8ea] border border-[#d4af37]/40 text-[#0f172a] font-bold' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  12M
                </button>
                <button
                  type="button"
                  onClick={() => setSimTenure('24')}
                  className={`h-10 px-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    simTenure === '24' ? 'bg-[#fdf8ea] border border-[#d4af37]/40 text-[#0f172a] font-bold' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  24M
                </button>
              </div>
              <span className="text-[11px] text-[#76777d]">Term period</span>
            </div>
          </div>

          {/* Results Boxes */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Monthly Interest Card */}
            <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#76777d] block uppercase tracking-wider font-semibold">
                    {isCompound ? 'Monthly Interest (Compounding)' : 'Monthly Interest'}
                  </span>
                  {isCompound && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      Grows monthly
                    </span>
                  )}
                </div>

                {isCompound && parsedTenure > 1 ? (
                  <div className="mt-1 flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-xs text-[#76777d]">1st Month:</span>
                      <span className="font-serif text-base font-bold text-[#9a761e]">
                        ₹{monthlySchedule.firstMonthInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-1 pt-1 border-t border-slate-200/60">
                      <span className="text-xs text-[#0f172a] font-semibold">Month {parsedTenure}:</span>
                      <span className="font-serif text-base font-bold text-[#0f172a]">
                        ₹{monthlySchedule.lastMonthInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 mt-0.5">
                      <span>+ Interest on Interest:</span>
                      <span className="font-bold">
                        +₹{monthlySchedule.lastMonthInterestOnInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="font-serif text-base md:text-lg text-[#9a761e] font-bold block mt-0.5">
                      ₹{monthlySchedule.firstMonthInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-[#76777d] mt-0.5 block">
                      {isCompound ? 'Month 1 base rate' : 'Monthly income (Fixed)'}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 pt-1 border-t border-slate-200/40 text-[11px] text-[#76777d] flex items-center justify-between">
                <span>
                  {isCompound && parsedTenure > 1
                    ? `Avg: ₹${calcResults.monthly.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo`
                    : '1st Month Base'}
                </span>
                {isCompound && (
                  <button
                    type="button"
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="text-[10px] font-semibold text-[#9a761e] hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>{showSchedule ? 'Hide detail' : 'View breakdown'}</span>
                    <span className="material-symbols-outlined text-[12px]">
                      {showSchedule ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Total Interest Card */}
            <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-[#76777d] block uppercase tracking-wider font-semibold">Total Interest</span>
                <span className="font-serif text-base md:text-lg text-[#0f172a] font-bold block mt-0.5">
                  +₹{calcResults.totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {isCompound && monthlySchedule.totalInterestOnInterest > 0 ? (
                  <div className="mt-1 flex flex-col gap-0.5 text-[10px]">
                    <span className="text-slate-600">
                      Base Interest: ₹{monthlySchedule.totalBaseInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-emerald-700 font-bold">
                      +₹{monthlySchedule.totalInterestOnInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} on interest
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#76777d] mt-0.5 block">Total interest earned</span>
                )}
              </div>
              <div className="mt-2 pt-1 border-t border-slate-200/40 text-[10px] text-slate-500">
                Yield: {((calcResults.totalInterest / (parsedPrincipal || 1)) * 100).toFixed(1)}% total return
              </div>
            </div>

            {/* Total You Get Back Card */}
            <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-[#76777d] block uppercase tracking-wider font-semibold">Total You Get Back</span>
                <span className="font-serif text-base md:text-lg text-[#0f172a] font-extrabold block mt-0.5">
                  ₹{calcResults.gross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-[#76777d] mt-0.5 block">
                  Principal (₹{parsedPrincipal.toLocaleString('en-IN')}) + Interest
                </span>
              </div>
              <div className="mt-2 pt-1 border-t border-slate-200/40 text-[10px] text-slate-500">
                Maturity in {parsedTenure} months
              </div>
            </div>
          </div>

          {/* Month-by-Month Compounding Schedule Table */}
          {showSchedule && isCompound && (
            <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#9a761e]">table_rows</span>
                  <span className="text-xs font-bold text-[#0f172a]">
                    Month-by-Month Compounding Breakdown ({parsedTenure} Months)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Base rate: {parsedRate}% on ₹{parsedPrincipal.toLocaleString('en-IN')} (₹{(parsedPrincipal * (parsedRate / 100)).toLocaleString('en-IN')}/mo)
                </span>
              </div>

              <div className="overflow-x-auto max-h-52 border border-slate-200 rounded-xl bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[#76777d] text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2 px-3">Month</th>
                      <th className="py-2 px-3">Opening Principal</th>
                      <th className="py-2 px-3">1st Mo Base Int.</th>
                      <th className="py-2 px-3 text-emerald-800">+ Int. on Interest</th>
                      <th className="py-2 px-3">Total Month Payout</th>
                      <th className="py-2 px-3 text-right">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {monthlySchedule.rows.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-[#0f172a]">Month {row.month}</td>
                        <td className="py-2 px-3 text-slate-600 font-mono">
                          ₹{row.opening.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-slate-700 font-mono font-medium">
                          ₹{row.baseInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono">
                          {row.interestOnInterest > 0 ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50">
                              +₹{row.interestOnInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">₹0.00 (Base)</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-bold font-mono text-[#9a761e]">
                          ₹{row.monthTotalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right font-bold font-mono text-[#0f172a]">
                          ₹{row.closing.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-2.5 py-2 rounded-lg bg-[#fdf8ea] border border-[#d4af37]/30 text-[11px] text-[#0f172a] font-medium">
                <span>
                  Compound Formula: <code className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#d4af37]/30">₹{parsedPrincipal.toLocaleString('en-IN')} × (1 + {parsedRate}%)^{parsedTenure}</code>
                </span>
                <span className="font-bold text-[#9a761e]">
                  Extra Earned from Compounding: +₹{monthlySchedule.totalInterestOnInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Visual Growth Trend & Next Due (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0f172a] text-lg">trending_up</span>
              <span className="text-sm text-[#0f172a] font-bold">Monthly Interest Growth</span>
            </div>
            <span className="text-xs text-emerald-800 font-bold px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200">
              +18.4% YoY
            </span>
          </div>

          {/* SVG Glow Curve */}
          <div className="my-2 bg-[#f8fafc] p-3 rounded-xl border border-slate-200/80">
            <svg className="w-full h-20 overflow-visible" fill="none" viewBox="0 0 360 85">
              <defs>
                <linearGradient id="curveGlowLight" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d="M 0 70 Q 50 65, 90 48 T 180 40 T 270 24 T 360 12 L 360 85 L 0 85 Z" fill="url(#curveGlowLight)" />
              <path d="M 0 70 Q 50 65, 90 48 T 180 40 T 270 24 T 360 12" stroke="#d4af37" strokeLinecap="round" strokeWidth="2.5" />
              <circle cx="90" cy="48" fill="#ffffff" r="4" stroke="#0f172a" strokeWidth="2" />
              <circle cx="180" cy="40" fill="#ffffff" r="4" stroke="#0f172a" strokeWidth="2" />
              <circle cx="270" cy="24" fill="#ffffff" r="4" stroke="#0f172a" strokeWidth="2" />
              <circle cx="360" cy="12" fill="#d4af37" r="5" stroke="#0f172a" strokeWidth="2" />
            </svg>
            <div className="flex justify-between text-[11px] text-[#76777d] px-1 mt-1 font-semibold">
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span className="font-bold text-[#0f172a]">Aug (Proj)</span>
            </div>
          </div>

          {/* Next Payment Due Banner */}
          <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#fdf8ea] border border-[#d4af37]/30 flex items-center justify-center text-[#9a761e]">
                <span className="material-symbols-outlined text-base">event_upcoming</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#76777d] font-semibold uppercase tracking-wider">Next Payment Due</span>
                <span className="text-xs md:text-sm text-[#0f172a] font-bold">
                  {privacyMode ? 'Robert Sterling • ••••••' : 'Robert Sterling • ₹600.00'}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-[#0f172a] font-bold px-2.5 py-1 rounded-lg bg-[#fdf8ea] border border-[#d4af37]/40">
              Due in 3 Days
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Payments & Due Dates (Next 30 Days) Quick-Track Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[#9a761e]">
              <span className="material-symbols-outlined text-lg">event_upcoming</span>
              <span className="text-sm md:text-base text-[#0f172a] font-bold tracking-tight">
                Upcoming Payments &amp; Due Dates
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
              Next 30 Days
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#45464d] font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Critical (&lt;48h)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Next 7 Days</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Extended Term</span>
            </div>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-1">
          {/* Card 1: Marcus Vance */}
          <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fdf8ea] border border-[#d4af37]/40 text-[#0f172a] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[13px] text-[#9a761e]">timer</span>
                3 Days Remaining
              </span>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-[#76777d] uppercase">Nov</span>
                <span className="font-bold text-xs text-[#0f172a] leading-none">18</span>
              </div>
            </div>
            <div className="my-1">
              <h3 className="font-semibold text-sm text-[#0f172a] leading-tight">Marcus Vance</h3>
              <p className="text-xs text-[#76777d] truncate mt-0.5">General Contractor / Milesto...</p>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#76777d]">DUE</span>
              <span className="font-bold text-sm text-[#0f172a]">{privacyMode ? '••••••' : '₹3,500'}</span>
            </div>
          </div>

          {/* Card 2: Sarah Jenkins */}
          <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fdf8ea] border border-[#d4af37]/40 text-[#0f172a] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[13px] text-[#9a761e]">timer</span>
                5 Days Remaining
              </span>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-[#76777d] uppercase">Nov</span>
                <span className="font-bold text-xs text-[#0f172a] leading-none">20</span>
              </div>
            </div>
            <div className="my-1">
              <h3 className="font-semibold text-sm text-[#0f172a] leading-tight">Sarah Jenkins</h3>
              <p className="text-xs text-[#76777d] truncate mt-0.5">Highline Studio Lease Q4</p>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#76777d]">DUE</span>
              <span className="font-bold text-sm text-[#0f172a]">{privacyMode ? '••••••' : '₹4,000'}</span>
            </div>
          </div>

          {/* Card 3: David Chen */}
          <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[#0f172a] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[13px] text-[#45464d]">schedule</span>
                12 Days
              </span>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-[#76777d] uppercase">Nov</span>
                <span className="font-bold text-xs text-[#0f172a] leading-none">27</span>
              </div>
            </div>
            <div className="my-1">
              <h3 className="font-semibold text-sm text-[#0f172a] leading-tight">David Chen</h3>
              <p className="text-xs text-[#76777d] truncate mt-0.5">RED V-Raptor Equipment Loan</p>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#76777d]">DUE</span>
              <span className="font-bold text-sm text-[#0f172a]">{privacyMode ? '••••••' : '₹5,000'}</span>
            </div>
          </div>

          {/* Card 4: Apex Global Logistics */}
          <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[#0f172a] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[13px] text-[#45464d]">date_range</span>
                21 Days
              </span>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-[#76777d] uppercase">Dec</span>
                <span className="font-bold text-xs text-[#0f172a] leading-none">06</span>
              </div>
            </div>
            <div className="my-1">
              <h3 className="font-semibold text-sm text-[#0f172a] leading-tight">Apex Global Logistics</h3>
              <p className="text-xs text-[#76777d] truncate mt-0.5">Freight Charter &amp; Customs #...</p>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#76777d]">DUE</span>
              <span className="font-bold text-sm text-[#0f172a]">{privacyMode ? '••••••' : '₹18,750'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* People You Lent Money To (Master Ledger Container) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header Filter Bar */}
        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200">
          <div>
            <h2 className="font-serif text-lg md:text-xl text-[#0f172a] font-bold tracking-tight">
              People You Lent Money To
            </h2>
            <span className="text-xs text-[#45464d]">
              {filteredBorrowers.length} records • {privacyMode ? '••••••' : `₹${totalPrincipalLent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} total principal outstanding
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Switcher: Table vs Cards */}
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200 mr-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#0f172a] shadow-2xs font-bold'
                    : 'text-[#45464d] hover:text-[#0f172a]'
                }`}
                title="Table View"
              >
                <span className="material-symbols-outlined text-sm">table_chart</span>
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#0f172a] shadow-2xs font-bold'
                    : 'text-[#45464d] hover:text-[#0f172a]'
                }`}
                title="List View (Cards)"
              >
                <span className="material-symbols-outlined text-sm">view_agenda</span>
                <span>Cards</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search borrower..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full bg-[#f8fafc] border border-slate-200 pl-8 pr-3 rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-[#0f172a] shadow-2xs'
                    : 'text-[#45464d] hover:text-[#0f172a]'
                }`}
              >
                All ({borrowers.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-white text-[#0f172a] shadow-2xs'
                    : 'text-[#45464d] hover:text-[#0f172a]'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('grace')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'grace'
                    ? 'bg-white text-[#0f172a] shadow-2xs'
                    : 'text-[#45464d] hover:text-[#0f172a]'
                }`}
              >
                Grace ({graceCount})
              </button>
            </div>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-[#0f172a] text-xs font-semibold flex items-center gap-1 hover:bg-[#f8fafc] transition-all cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* View 1: Table View */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse table-fixed min-w-[850px]">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[18%]" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200 text-[#76777d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Borrower Name</th>
                  <th className="py-3 px-4">Amount &amp; Mode</th>
                  <th className="py-3 px-4">Rate &amp; Terms</th>
                  <th className="py-3 px-4">Next Due Date</th>
                  <th className="py-3 px-4">Received / Total</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-[#0f172a] bg-white">
                {filteredBorrowers.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Borrower */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${b.avatarBg} ${b.avatarText}`}
                        >
                          {b.initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-900 truncate">{b.name}</span>
                          <span className="text-[11px] text-[#76777d] truncate">{b.contactOrNote}</span>
                        </div>
                      </div>
                    </td>

                    {/* Amount & Payment Mode */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 font-serif text-sm">
                          {privacyMode ? '••••••' : `₹${b.principalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#45464d]">
                          <span className="material-symbols-outlined text-xs text-[#9a761e]">
                            {b.paymentModeIcon}
                          </span>
                          <span className="truncate">{b.paymentMode}</span>
                        </div>
                        <span className="text-[10px] text-[#76777d]">Given: {b.dateGiven}</span>
                      </div>
                    </td>

                    {/* Interest Rate & Terms */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[#9a761e]">{b.interestRate}%</span>
                          <span className="text-[11px] text-[#45464d]">{b.interestRatePeriod}</span>
                        </div>
                        <span className="text-[11px] text-[#45464d] truncate">{b.payoutFrequency}</span>
                        <span className="text-[10px] text-[#76777d]">{b.termLabel}</span>
                      </div>
                    </td>

                    {/* Next Due Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{b.nextDueDate}</span>
                        <div className="inline-flex items-center gap-1 mt-0.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#fdf8ea] text-[#0f172a] border border-[#d4af37]/30 text-[10px] font-semibold">
                            <span className="material-symbols-outlined text-[11px] text-[#9a761e]">schedule</span>
                            {privacyMode ? '••••••' : `₹${b.nextDueAmount.toLocaleString('en-IN')} Due`}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Received / Total */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col min-w-[130px]">
                        <div className="flex justify-between items-center mb-1 text-[11px]">
                          <span className="font-bold text-[#0f172a]">
                            {privacyMode ? '••••••' : `₹${b.receivedAmount.toLocaleString('en-IN')}`}
                          </span>
                          <span className="text-[#76777d]">
                            of {privacyMode ? '••••••' : `₹${b.totalReceivable.toLocaleString('en-IN')}`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0f172a] h-full rounded-full transition-all duration-300"
                            style={{ width: `${b.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#76777d] mt-1">
                          {b.progressPercent}% repaid
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePayPart(b.id, b.name)}
                          className="h-7.5 px-2.5 rounded-lg bg-[#f8fafc] border border-slate-200 text-[#0f172a] hover:bg-[#0f172a] hover:text-white transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer shadow-2xs"
                          title="Record Received Payment"
                        >
                          <span className="material-symbols-outlined text-xs text-[#9a761e]">receipt_long</span>
                          <span>+ Payment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkAsPaid(b.id, b.name)}
                          className={`w-7.5 h-7.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                            b.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                          }`}
                          title="Toggle Fully Paid"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {b.status === 'paid' ? 'check_circle' : 'task_alt'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Cards (List) View */}
        {viewMode === 'cards' && (
          <div className="flex flex-col gap-4 p-4 md:p-5 bg-slate-50/60">
            {filteredBorrowers.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-2xs hover:border-[#d4af37]/40 transition-all flex flex-col gap-3.5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Avatar + Details */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <div
                        className={`w-11 h-11 rounded-full font-bold flex items-center justify-center border border-slate-200 shadow-2xs text-sm ${b.avatarBg} ${b.avatarText}`}
                      >
                        {b.initials}
                      </div>
                      {b.badgeNumber && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#d4af37] text-[#0f172a] font-bold text-[10px] flex items-center justify-center border border-white">
                          {b.badgeNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[#0f172a] text-sm md:text-base leading-snug">
                          {b.name}
                        </span>
                        <span className="material-symbols-outlined text-sm text-[#9a761e]">check_circle</span>
                      </div>
                      <span className="text-xs text-[#76777d] mt-0.5">{b.contactOrNote}</span>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {b.contractType && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-[#45464d] border border-slate-200">
                            {b.contractType}
                          </span>
                        )}
                        {b.priorityTag && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#fdf8ea] text-[#9a761e] border border-[#d4af37]/30">
                            {b.priorityTag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle Left: Balance Due Progress */}
                  <div className="flex flex-col min-w-[190px]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10px] text-[#76777d] uppercase font-semibold">BALANCE DUE</span>
                      <span className="text-base font-bold text-[#0f172a]">
                        {privacyMode ? '••••••' : `₹${b.nextDueAmount.toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-xs text-[#76777d]">
                        / {privacyMode ? '••••••' : `₹${b.totalReceivable.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden my-1">
                      <div
                        className="bg-[#d4af37] h-full rounded-full transition-all duration-300"
                        style={{ width: `${b.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-[#76777d]">
                      <span>
                        {privacyMode ? '••••••' : `₹${b.receivedAmount.toLocaleString('en-IN')}`} Paid to date
                      </span>
                      <span className="font-semibold text-[#0f172a]">{b.progressPercent}% cleared</span>
                    </div>
                  </div>

                  {/* Middle Right: Strict Due Date & Settlement Channel */}
                  <div className="flex flex-col text-xs text-[#45464d] min-w-[180px]">
                    <span className="text-[10px] uppercase font-semibold text-[#76777d]">STRICT DUE DATE</span>
                    <div className="flex items-center gap-1 font-semibold text-[#0f172a] mt-0.5">
                      <span className="material-symbols-outlined text-sm text-[#9a761e]">calendar_today</span>
                      <span>{b.nextDueDate}</span>
                      <span className="text-[11px] font-normal text-[#76777d]">({b.dueCountdownText})</span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-[#76777d] mt-1.5">SETTLEMENT CHANNEL</span>
                    <div className="flex items-center gap-1 text-[11px] text-[#45464d] mt-0.5 truncate">
                      <span className="material-symbols-outlined text-xs text-[#76777d]">account_balance</span>
                      <span className="truncate">{b.settlementChannel || b.paymentMode}</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-start lg:self-center">
                    <button
                      type="button"
                      onClick={() => handleMarkAsPaid(b.id, b.name)}
                      className="px-3.5 py-1.5 rounded-full bg-[#d4af37] hover:bg-[#b48e28] text-[#0f172a] font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                      <span>{b.status === 'paid' ? 'Paid' : 'Mark as Paid'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePayPart(b.id, b.name)}
                      className="px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-xs font-semibold transition-all cursor-pointer"
                    >
                      Pay Part
                    </button>
                  </div>
                </div>

                {/* Optional Note / Attachment Card */}
                {b.noteText && (
                  <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#45464d]">
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#76777d] mt-0.5">article</span>
                      <div>
                        <strong className="text-[#0f172a] font-semibold">{b.noteTitle || 'Note'}:</strong>{' '}
                        {b.noteText}
                      </div>
                    </div>
                    {b.attachmentName && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#0f172a] hover:text-[#9a761e] font-medium shrink-0 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-sm text-[#9a761e]">description</span>
                        <span>{b.attachmentName}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Table Footer Meta & Summary */}
        <div className="p-4 bg-[#f8fafc] border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[#45464d] text-xs font-medium">
          <div className="flex items-center gap-2">
            <span>Showing {filteredBorrowers.length} of {borrowers.length} Active Loans</span>
            <span className="text-[#76777d]">•</span>
            <span className="text-[#0f172a] font-semibold">
              Total Money Lent:{' '}
              <span className="text-[#9a761e] font-bold">
                {privacyMode ? '••••••' : `₹${totalPrincipalLent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[#45464d] hover:text-[#0f172a] hover:bg-slate-50 transition-colors cursor-pointer text-xs"
            >
              Previous
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-[#0f172a] text-white font-bold flex items-center justify-center text-xs"
            >
              1
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[#45464d] hover:text-[#0f172a] hover:bg-slate-50 transition-colors cursor-pointer text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Give New Loan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-[#0f172a]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#fdf8ea] border border-[#d4af37]/30 flex items-center justify-center text-[#9a761e]">
                  <span className="material-symbols-outlined text-lg">note_add</span>
                </div>
                <h2 className="font-serif text-lg text-[#0f172a] font-bold">Give New Loan</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#f8fafc] border border-slate-200 flex items-center justify-center text-[#45464d] hover:text-[#0f172a] cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#45464d] uppercase font-semibold">Borrower Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="h-10 px-3 rounded-xl bg-[#f8fafc] border border-slate-200 text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#45464d] uppercase font-semibold">Borrower Phone / Email</label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-10 px-3 rounded-xl bg-[#f8fafc] border border-slate-200 text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#45464d] uppercase font-semibold">Loan Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="20000"
                    className="h-10 px-3 rounded-xl bg-[#f8fafc] border border-slate-200 text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#45464d] uppercase font-semibold">Payment Mode</label>
                  <select
                    value={formPaymentMode}
                    onChange={(e) => setFormPaymentMode(e.target.value)}
                    className="h-10 px-3 rounded-xl bg-[#f8fafc] border border-slate-200 text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white transition-all cursor-pointer"
                  >
                    <option>Bank / UPI Transfer</option>
                    <option>Cheque</option>
                    <option>Cash in Hand (Witnessed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#45464d] uppercase font-semibold">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    placeholder="1.5"
                    className="h-10 px-3 rounded-xl bg-[#f8fafc] border border-slate-200 text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#45464d] uppercase font-semibold">Interest Type</label>
                  <select
                    value={formInterestType}
                    onChange={(e) => setFormInterestType(e.target.value)}
                    className="h-10 px-3 rounded-xl bg-[#f8fafc] border border-slate-200 text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white transition-all cursor-pointer"
                  >
                    <option>Simple Monthly</option>
                    <option>Compound Monthly</option>
                    <option>Flat Yearly</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#45464d] uppercase font-semibold">Duration (Months)</label>
                  <input
                    type="number"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="12"
                    className="h-10 px-3 rounded-xl bg-[#f8fafc] border border-slate-200 text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 h-10 rounded-xl bg-[#f8fafc] border border-slate-200 text-xs font-semibold text-[#45464d] hover:text-[#0f172a] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 h-10 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  Save &amp; Record Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
