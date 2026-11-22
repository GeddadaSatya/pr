'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { LedgerType } from '@/lib/types';

export function TransactionModal() {
  const { isModalOpen, modalType, closeModal, addExpense, addPayable, addLoan, addPeerReceivable, modalInitialData } = useFinance();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<LedgerType>('expense');
  const [category, setCategory] = useState('Dining');
  const [paidWith, setPaidWith] = useState('HDFC Bank Regalia Gold');
  const [dueDate, setDueDate] = useState('');
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync internal type state with modalType prop whenever it opens
  useEffect(() => {
    if (isModalOpen) {
      setType(modalType);
      setTitle(modalInitialData?.title || '');
      setAmount(modalInitialData?.amount || '');
      if (modalInitialData?.category) {
        setCategory(modalInitialData.category);
      } else {
        setCategory('Dining');
      }
      setReceiptPreview(null);
      setSavedFeedback(false);
    }
  }, [isModalOpen, modalType, modalInitialData]);

  if (!isModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    if (!title || numAmount <= 0) return;

    if (type === 'expense') {
      addExpense({
        title,
        subtitle: 'Manual transaction entry',
        category,
        paidWith,
        amount: numAmount,
        receiptUrl: receiptPreview || undefined,
        dateTime: 'Today, Just now',
        dateKey: '2026-10-28',
      });
    } else if (type === 'due') {
      addPayable({
        creditorName: title,
        invoiceNote: 'Pending bill / Due payment',
        amount: numAmount,
        dueDate: dueDate || 'Due soon',
        urgencyBadge: 'Manual Entry',
      });
    } else if (type === 'loan') {
      const words = title.trim().split(' ');
      const initials = words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : words[0].slice(0, 2).toUpperCase();
      addLoan({
        borrowerName: title,
        initials,
        note: 'Direct loan • 18% p.a.',
        principalAmount: numAmount,
        interestRateAnnual: 18.0,
        monthlyInterest: Math.round((numAmount * 0.18) / 12),
      });
    } else if (type === 'receive') {
      addPeerReceivable({
        friendName: title,
        amount: numAmount,
        dateGiven: 'Today',
        paymentMethod: paidWith || 'UPI Transfer',
        note: category !== 'Dining' && category !== '' ? category : 'Friend advance',
      });
    }

    setSavedFeedback(true);
    setTimeout(() => {
      closeModal();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-2xl flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b48e28] text-2xl">
              receipt_long
            </span>
            <span className="font-headline-sm text-slate-900 font-semibold">
              New Ledger Entry
            </span>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Quick Add Context Notice */}
        {modalInitialData?.source === 'quick-add' && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs animate-in fade-in">
            <span className="material-symbols-outlined text-amber-600 text-base">category</span>
            <span>
              <strong>Category Required:</strong> Please choose a category below to finish saving your quick entry.
            </span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] text-slate-600 uppercase block mb-1 font-semibold">
              {type === 'receive' ? "Friend's Name" : type === 'due' ? 'Creditor / Bill Name' : 'Entry Title / Person'}
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-white transition-all"
              placeholder={
                type === 'expense'
                  ? 'e.g. Airline tickets or Executive dinner'
                  : type === 'due'
                  ? 'e.g. Marcus Vance (Vendor Equipment)'
                  : type === 'receive'
                  ? 'e.g. Rahul Sharma or Priya'
                  : 'e.g. Devon Reed'
              }
              type="text"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-600 uppercase block mb-1 font-semibold">
                Amount (₹ INR)
              </label>
              <input
                required
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-white transition-all font-mono"
                placeholder="0.00"
                type="number"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-600 uppercase block mb-1 font-semibold">
                Ledger Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LedgerType)}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-white transition-all cursor-pointer"
              >
                <option value="expense">Add Expense</option>
                <option value="due">- To Give (Bill / Debt)</option>
                <option value="receive">+ Given to Friend (Advance)</option>
                <option value="loan">Lend Money</option>
              </select>
            </div>
          </div>

          {type === 'expense' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1 font-semibold">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Dining">Dining</option>
                  <option value="Travel">Travel</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Travel & Logistics">Travel &amp; Logistics</option>
                  <option value="Tech & Infra">Tech &amp; Infra</option>
                  <option value="Executive Dining">Executive Dining</option>
                  <option value="Legal & Retainers">Legal &amp; Retainers</option>
                  <option value="Client Hosting">Client Hosting</option>
                  <option value="Utilities & Comm">Utilities &amp; Comm</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1 font-semibold">
                  Payment Method
                </label>
                <input
                  value={paidWith}
                  onChange={(e) => setPaidWith(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-white transition-all"
                  placeholder="e.g. HDFC Regalia or UPI"
                />
              </div>
            </div>
          )}

          {type === 'receive' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1 font-semibold">
                  Purpose / Note (Optional)
                </label>
                <input
                  value={category === 'Dining' ? '' : category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-white transition-all"
                  placeholder="e.g. Lunch split, Cab, Advance"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1 font-semibold">
                  How Given (Method)
                </label>
                <input
                  value={paidWith}
                  onChange={(e) => setPaidWith(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-white transition-all"
                  placeholder="e.g. UPI, Cash, Card"
                />
              </div>
            </div>
          )}

          {(type === 'due' || type === 'loan') && (
            <div>
              <label className="text-[11px] text-slate-600 uppercase block mb-1 font-semibold">
                Due Date / Terms (Optional)
              </label>
              <input
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-white transition-all"
                type="date"
              />
            </div>
          )}

          {/* Receipt / Camera Upload Component */}
          <div>
            <label className="text-[11px] text-slate-600 uppercase block mb-1 font-semibold">
              Receipt / Bill Photo (Free Upload)
            </label>

            {/* Hidden native inputs for mobile camera and desktop file browser */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {!receiptPreview ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 rounded-lg border border-dashed border-slate-300 hover:border-[#d4af37] bg-slate-50 hover:bg-[#fef9e7]/50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg text-[#b48e28]">
                    photo_camera
                  </span>
                  <span>Take Camera Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg text-slate-500">
                    upload_file
                  </span>
                  <span>Upload File / Invoice</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="w-12 h-12 object-cover rounded border border-slate-200"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800">
                      Receipt Attached
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Ready to store in Supabase
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptPreview(null)}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg text-slate-600 text-xs font-semibold hover:text-slate-900 cursor-pointer"
              type="button"
            >
              Cancel
            </button>
            <button
              disabled={savedFeedback}
              className="px-5 py-2 rounded-lg bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
              type="submit"
            >
              {savedFeedback ? 'Saved ✓' : 'Save to Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
