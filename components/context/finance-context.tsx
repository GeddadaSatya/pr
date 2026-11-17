'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExpenseItem, PayableItem, LoanItem, LedgerType, UserProfile } from '@/lib/types';
import { INITIAL_EXPENSES, INITIAL_PAYABLES, INITIAL_LOANS, INITIAL_USER } from '@/lib/mock-data';

interface FinanceContextType {
  expenses: ExpenseItem[];
  payables: PayableItem[];
  loans: LoanItem[];
  userProfile: UserProfile;
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  isModalOpen: boolean;
  modalType: LedgerType;
  openModal: (type?: LedgerType) => void;
  closeModal: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'dateTime'>) => void;
  addPayable: (payable: Omit<PayableItem, 'id' | 'status'>) => void;
  addLoan: (loan: Omit<LoanItem, 'id' | 'monthlyInterest' | 'status'>) => void;
  recordPayout: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [payables, setPayables] = useState<PayableItem[]>(INITIAL_PAYABLES);
  const [loans, setLoans] = useState<LoanItem[]>(INITIAL_LOANS);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER);
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<LedgerType>('expense');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Auto collapse below 1100px screen width and support saved state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1100) {
        setIsCollapsed(true);
      } else {
        const saved = localStorage.getItem('wt_sidebar_collapsed');
        if (saved !== null) {
          setIsCollapsed(saved === 'true');
        } else {
          setIsCollapsed(false);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('wt_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Load from localStorage if present for local persistence
  useEffect(() => {
    const savedPrivacy = localStorage.getItem('wt_privacy_mode');
    if (savedPrivacy !== null) {
      setPrivacyMode(savedPrivacy === 'true');
    }
  }, []);

  const togglePrivacyMode = () => {
    setPrivacyMode((prev) => {
      const next = !prev;
      localStorage.setItem('wt_privacy_mode', String(next));
      return next;
    });
  };

  const openModal = (type: LedgerType = 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const addExpense = (item: Omit<ExpenseItem, 'id' | 'dateTime'>) => {
    const newExpense: ExpenseItem = {
      ...item,
      id: `exp-${Date.now()}`,
      dateTime: 'Just now',
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const addPayable = (item: Omit<PayableItem, 'id' | 'status'>) => {
    const newPayable: PayableItem = {
      ...item,
      id: `pay-${Date.now()}`,
      status: 'pending',
    };
    setPayables((prev) => [newPayable, ...prev]);
  };

  const addLoan = (item: Omit<LoanItem, 'id' | 'monthlyInterest' | 'status'>) => {
    const monthly = (item.principalAmount * (item.interestRateAnnual || 18) / 100) / 12;
    const newLoan: LoanItem = {
      ...item,
      id: `loan-${Date.now()}`,
      monthlyInterest: monthly,
      status: 'active',
    };
    setLoans((prev) => [newLoan, ...prev]);
  };

  const recordPayout = (id: string) => {
    setPayables((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <FinanceContext.Provider
      value={{
        expenses,
        payables,
        loans,
        userProfile,
        privacyMode,
        togglePrivacyMode,
        isModalOpen,
        modalType,
        openModal,
        closeModal,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        isCollapsed,
        setIsCollapsed,
        toggleSidebar,
        addExpense,
        addPayable,
        addLoan,
        recordPayout,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
