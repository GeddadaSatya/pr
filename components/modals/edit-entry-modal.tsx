'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { ExpenseItem, PayableItem, BorrowerLoan, AssetHolding } from '@/lib/types';

const EXPENSE_CATEGORIES = [
  'Dining',
  'Groceries',
  'Shopping',
  'Travel',
  'Entertainment',
  'Healthcare',
  'Education',
  'Utilities',
  'Hardware',
  'Wellness',
  'Miscellaneous',
];

const PAYMENT_METHODS = [
  'UPI Transfer',
  'HDFC Bank Regalia Gold',
  'ICICI Bank Coral',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Net Banking',
];

// ============================================================================
// 1. Edit Expense Modal
// ============================================================================
interface EditExpenseModalProps {
  expense: ExpenseItem | null;
  onClose: () => void;
  onSaved?: (message: string) => void;
}

export function EditExpenseModal({ expense, onClose, onSaved }: EditExpenseModalProps) {
  const { updateExpense } = useFinance();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Dining');
  const [paidWith, setPaidWith] = useState('UPI Transfer');
  const [dateTime, setDateTime] = useState('');
  const [dateKey, setDateKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title || '');
      setSubtitle(expense.subtitle || '');
      setAmount(String(expense.amount || ''));
      setCategory(expense.category || 'Dining');
      setPaidWith(expense.paidWith || 'UPI Transfer');
      setDateTime(expense.dateTime || 'Today, Just now');
      setDateKey(expense.dateKey || new Date().toISOString().slice(0, 10));
      setError(null);
    }
  }, [expense]);

  if (!expense) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('Item title is required.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    updateExpense(expense.id, {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      amount: numAmount,
      category,
      paidWith,
      dateTime: dateTime.trim() || 'Today, Just now',
      dateKey: dateKey || new Date().toISOString().slice(0, 10),
    });

    if (onSaved) onSaved(`Updated expense: ${title.trim()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fef9e7] border border-[#d4af37]/40 flex items-center justify-center text-[#b48e28] shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-xl">edit_note</span>
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900 leading-tight">
                Edit Expense Entry
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update transaction details, category, or payment source
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            type="button"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Title & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Expense Title / Merchant <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Swiggy, Uber, Amazon"
                required
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Amount (₹) <span className="text-amber-600">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all font-mono font-semibold"
              />
            </div>
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Paid With
              </label>
              <select
                value={paidWith}
                onChange={(e) => setPaidWith(e.target.value)}
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all cursor-pointer"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Note Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={dateKey}
                onChange={(e) => {
                  setDateKey(e.target.value);
                  setDateTime(e.target.value);
                }}
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Date / Time Label
              </label>
              <input
                type="text"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                placeholder="e.g. Today, Just now"
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Subtitle / Note
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Dinner with team, Weekly groceries"
              className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>Save Changes</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ============================================================================
// 2. Edit Payable / Bill Modal
// ============================================================================
interface EditPayableModalProps {
  payable: PayableItem | null;
  onClose: () => void;
  onSaved?: (message: string) => void;
}

export function EditPayableModal({ payable, onClose, onSaved }: EditPayableModalProps) {
  const { updatePayable } = useFinance();

  const [creditorName, setCreditorName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [invoiceNote, setInvoiceNote] = useState('');
  const [urgencyBadge, setUrgencyBadge] = useState('Regular Cycle');
  const [status, setStatus] = useState<'pending' | 'paid'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (payable) {
      setCreditorName(payable.creditorName || '');
      setAmount(String(payable.amount || ''));
      setDueDate(payable.dueDate || '');
      setCategory(payable.category || 'Utilities');
      setInvoiceNote(payable.invoiceNote || '');
      setUrgencyBadge(payable.urgencyBadge || 'Regular Cycle');
      setStatus(payable.status || 'pending');
      setError(null);
    }
  }, [payable]);

  if (!payable) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!creditorName.trim()) {
      setError('Vendor / Creditor name is required.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    updatePayable(payable.id, {
      creditorName: creditorName.trim(),
      amount: numAmount,
      dueDate: dueDate.trim() || 'Due soon',
      category,
      invoiceNote: invoiceNote.trim() || 'Pending payment',
      urgencyBadge,
      status,
      statusLabel: status === 'paid' ? 'Settled' : urgencyBadge,
    });

    if (onSaved) onSaved(`Updated payable: ${creditorName.trim()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-xl">receipt</span>
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900 leading-tight">
                Edit Payable / Bill
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update creditor, due date, invoice amount, or status
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            type="button"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Vendor / Beneficiary <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={creditorName}
                onChange={(e) => setCreditorName(e.target.value)}
                placeholder="e.g. AWS Cloud, Landlord, Credit Card"
                required
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Amount (₹) <span className="text-amber-600">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all font-mono font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="e.g. Oct 31, 2026 or 2026-10-31"
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending' | 'paid')}
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all cursor-pointer"
              >
                <option value="pending">Pending (Unpaid)</option>
                <option value="paid">Settled (Paid)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all cursor-pointer"
              >
                <option value="Utilities">Utilities &amp; Power</option>
                <option value="Rent & Lease">Rent &amp; Lease</option>
                <option value="Credit Card Bill">Credit Card Bill</option>
                <option value="Loan EMI">Loan EMI</option>
                <option value="Vendor Invoice">Vendor Invoice</option>
                <option value="Subscription">Cloud &amp; Subscriptions</option>
                <option value="Taxes">Taxes &amp; Compliance</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Urgency Badge
              </label>
              <select
                value={urgencyBadge}
                onChange={(e) => setUrgencyBadge(e.target.value)}
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all cursor-pointer"
              >
                <option value="Regular Cycle">Regular Cycle</option>
                <option value="Urgent (in 3 days)">Urgent (in 3 days)</option>
                <option value="High Priority">High Priority</option>
                <option value="Pre-Authorized ACH">Pre-Authorized ACH</option>
                <option value="Due Today">Due Today</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Invoice Note / Description
            </label>
            <input
              type="text"
              value={invoiceNote}
              onChange={(e) => setInvoiceNote(e.target.value)}
              placeholder="e.g. Monthly server hosting, Office lease Q4"
              className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>Save Changes</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ============================================================================
// 3. Edit Borrower & Loan Terms Modal
// ============================================================================
interface EditBorrowerModalProps {
  borrower: BorrowerLoan | null;
  onClose: () => void;
  onSaved?: (message: string) => void;
}

export function EditBorrowerModal({ borrower, onClose, onSaved }: EditBorrowerModalProps) {
  const { updateBorrowerProfile } = useFinance();

  const [name, setName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('18');
  const [phone, setPhone] = useState('');
  const [contactOrNote, setContactOrNote] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('Wire Transfer (HDFC)');
  const [status, setStatus] = useState<'active' | 'grace' | 'paid'>('active');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (borrower) {
      setName(borrower.name || '');
      setPrincipalAmount(String(borrower.principalAmount || ''));
      setInterestRate(String(borrower.interestRate || '18'));
      setPhone(borrower.phone || '');
      setContactOrNote(borrower.contactOrNote || '');
      setNextDueDate(borrower.nextDueDate || '');
      setPaymentMode(borrower.paymentMode || 'Wire Transfer (HDFC)');
      setStatus(borrower.status || 'active');
      setError(null);
    }
  }, [borrower]);

  if (!borrower) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = parseFloat(principalAmount);
    const rate = parseFloat(interestRate) || 18;

    if (!name.trim()) {
      setError('Borrower name is required.');
      return;
    }
    if (isNaN(principal) || principal <= 0) {
      setError('Please enter a valid positive principal amount.');
      return;
    }

    const words = name.trim().split(' ');
    const initials = words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();

    // Recompute total receivable and next due amount based on updated terms
    const annualInterest = (principal * rate) / 100;
    const monthlyInterest = Math.round(annualInterest / 12);
    const nextDueAmount = monthlyInterest;

    updateBorrowerProfile(borrower.id, {
      name: name.trim(),
      initials,
      principalAmount: principal,
      interestRate: rate,
      phone: phone.trim() || undefined,
      contactOrNote: contactOrNote.trim() || 'Active credit agreement',
      nextDueDate: nextDueDate.trim() || 'Next Month',
      nextDueAmount,
      paymentMode,
      status,
      statusLabel: status === 'paid' ? 'Fully Settled' : status === 'grace' ? 'In Grace Period' : 'Active Credit',
    });

    if (onSaved) onSaved(`Updated borrower: ${name.trim()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-xl">account_balance</span>
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900 leading-tight">
                Edit Borrower &amp; Loan Terms
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update principal, interest rate, due dates, or contact info
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            type="button"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Borrower Full Name <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Principal (₹) <span className="text-amber-600">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all font-mono font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Annual Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="any"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="18"
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'grace' | 'paid')}
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all cursor-pointer"
              >
                <option value="active">Active (On Schedule)</option>
                <option value="grace">Grace Period</option>
                <option value="paid">Fully Settled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Phone / Contact
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Next Due Date
              </label>
              <input
                type="text"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                placeholder="e.g. Nov 15, 2026"
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Purpose / Loan Note
            </label>
            <input
              type="text"
              value={contactOrNote}
              onChange={(e) => setContactOrNote(e.target.value)}
              placeholder="e.g. Commercial bridge loan, Promissory note verified"
              className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>Save Loan Terms</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ============================================================================
// 4. Edit Asset Holding Modal
// ============================================================================
interface EditAssetModalProps {
  asset: AssetHolding | null;
  onClose: () => void;
  onSaved?: (message: string) => void;
}

export function EditAssetModal({ asset, onClose, onSaved }: EditAssetModalProps) {
  const { updateAsset } = useFinance();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetHolding['category']>('Liquid Cash & Banking');
  const [valuation, setValuation] = useState('');
  const [annualYieldRate, setAnnualYieldRate] = useState('7');
  const [institution, setInstitution] = useState('');
  const [accountRef, setAccountRef] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setName(asset.name || '');
      setCategory(asset.category || 'Liquid Cash & Banking');
      setValuation(String(asset.valuation || ''));
      setAnnualYieldRate(String(asset.annualYieldRate || '7'));
      setInstitution(asset.institution || '');
      setAccountRef(asset.accountRef || '');
      setNotes(asset.notes || '');
      setError(null);
    }
  }, [asset]);

  if (!asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valuation);
    const rate = parseFloat(annualYieldRate) || 0;

    if (!name.trim()) {
      setError('Asset name is required.');
      return;
    }
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid positive valuation.');
      return;
    }

    updateAsset(asset.id, {
      name: name.trim(),
      category,
      valuation: val,
      annualYieldRate: rate,
      institution: institution.trim() || 'Direct Holding',
      accountRef: accountRef.trim() || 'REF-HOLDING',
      notes: notes.trim() || undefined,
    });

    if (onSaved) onSaved(`Updated asset: ${name.trim()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900 leading-tight">
                Edit Asset Holding
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update holding name, valuation, yield, or institution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            type="button"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Asset Name <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. HDFC Fixed Deposit, Sovereign Gold Bond"
                required
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Valuation (₹) <span className="text-amber-600">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={valuation}
                onChange={(e) => setValuation(e.target.value)}
                placeholder="0.00"
                required
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all font-mono font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetHolding['category'])}
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all cursor-pointer"
              >
                <option value="Liquid Cash & Banking">Liquid Cash &amp; Banking</option>
                <option value="Bullion & Precious Metals">Bullion &amp; Precious Metals</option>
                <option value="Bonds & Fixed Income">Bonds &amp; Fixed Income</option>
                <option value="Real Estate & Properties">Real Estate &amp; Properties</option>
                <option value="Alternative & Equity">Alternative &amp; Equity</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Annual Yield Rate (% p.a.)
              </label>
              <input
                type="number"
                step="any"
                value={annualYieldRate}
                onChange={(e) => setAnnualYieldRate(e.target.value)}
                placeholder="7.25"
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all font-mono font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Institution / Broker
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. HDFC Bank, Zerodha, MMTC-PAMP"
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Account / Folio Reference
              </label>
              <input
                type="text"
                value={accountRef}
                onChange={(e) => setAccountRef(e.target.value)}
                placeholder="e.g. FD-98721, DEMAT-44"
                className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Notes &amp; Details
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 5-year lock-in maturity 2029"
              className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>Save Asset</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
