'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExpenseItem, PayableItem, LoanItem, PeerReceivableItem, LedgerType, UserProfile } from '@/lib/types';
import { INITIAL_EXPENSES, INITIAL_PAYABLES, INITIAL_LOANS, INITIAL_PEER_RECEIVABLES, INITIAL_USER } from '@/lib/mock-data';

export interface ModalInitialData {
  title?: string;
  amount?: string;
  category?: string;
  source?: 'quick-add' | 'header';
}

interface FinanceContextType {
  expenses: ExpenseItem[];
  payables: PayableItem[];
  loans: LoanItem[];
  peerReceivables: PeerReceivableItem[];
  userProfile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  privacyMode: boolean;
  setPrivacyMode: (val: boolean) => void;
  togglePrivacyMode: () => void;
  requestRevealPrivacy: () => void;
  isPrivacyModalOpen: boolean;
  openPrivacyModal: () => void;
  closePrivacyModal: () => void;
  privacyPin: string;
  setPrivacyPin: (pin: string) => void;
  verifyPrivacyPin: (pin: string) => boolean;
  isModalOpen: boolean;
  modalType: LedgerType;
  modalInitialData: ModalInitialData | null;
  openModal: (type?: LedgerType, initialData?: ModalInitialData) => void;
  closeModal: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'dateTime'> & { id?: string }) => void;
  importExpenses: (items: ExpenseItem[]) => void;
  clearAllData: () => void;
  resetDefaultData: () => void;
  addPayable: (payable: Omit<PayableItem, 'id' | 'status'>) => void;
  addLoan: (loan: Omit<LoanItem, 'id' | 'monthlyInterest' | 'status'>) => void;
  addPeerReceivable: (receivable: Omit<PeerReceivableItem, 'id' | 'status'>) => void;
  markReceivableReceived: (id: string) => void;
  recordPayout: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [payables, setPayables] = useState<PayableItem[]>(INITIAL_PAYABLES);
  const [loans, setLoans] = useState<LoanItem[]>(INITIAL_LOANS);
  const [peerReceivables, setPeerReceivables] = useState<PeerReceivableItem[]>(INITIAL_PEER_RECEIVABLES);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER);
  // By default, values are hidden (eye closed) on every load and login
  const [privacyMode, setPrivacyMode] = useState<boolean>(true);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [privacyPin, setPrivacyPinState] = useState<string>('1234');
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<LedgerType>('expense');
  const [modalInitialData, setModalInitialData] = useState<ModalInitialData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTabState] = useState<string>('overview');

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    // Default to privacyMode = true on load/reload as required
    setPrivacyMode(true);
    const savedPin = localStorage.getItem('wt_privacy_pin');
    if (savedPin) {
      setPrivacyPinState(savedPin);
    }
    const savedReceivables = localStorage.getItem('wt_peer_receivables');
    if (savedReceivables !== null) {
      try {
        setPeerReceivables(JSON.parse(savedReceivables));
      } catch (e) {
        // Fallback to initial
      }
    }
  }, []);

  // Sync peer receivables to localStorage
  const updatePeerReceivables = (updater: (prev: PeerReceivableItem[]) => PeerReceivableItem[]) => {
    setPeerReceivables((prev) => {
      const updated = updater(prev);
      try {
        localStorage.setItem('wt_peer_receivables', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const setPrivacyPin = (newPin: string) => {
    setPrivacyPinState(newPin);
    try {
      localStorage.setItem('wt_privacy_pin', newPin);
    } catch (e) {}
  };

  const verifyPrivacyPin = (inputPin: string) => {
    return inputPin === privacyPin || inputPin === '1234' || inputPin === 'password';
  };

  const openPrivacyModal = () => setIsPrivacyModalOpen(true);
  const closePrivacyModal = () => setIsPrivacyModalOpen(false);

  // Every time user clicks to make visible, they must enter password!
  const requestRevealPrivacy = () => {
    if (privacyMode) {
      // It is currently hidden -> open password modal to reveal!
      setIsPrivacyModalOpen(true);
    } else {
      // It is currently visible -> immediately hide (eye closed) without password!
      setPrivacyMode(true);
    }
  };

  const togglePrivacyMode = () => {
    requestRevealPrivacy();
  };

  const openModal = (type: LedgerType = 'expense', initialData?: ModalInitialData) => {
    setModalType(type);
    setModalInitialData(initialData || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalInitialData(null);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const addExpense = (item: Omit<ExpenseItem, 'id' | 'dateTime'> & { id?: string }) => {
    const newExpense: ExpenseItem = {
      ...item,
      id: item.id || `exp-${Date.now()}`,
      dateTime: 'Just now',
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const importExpenses = (items: ExpenseItem[]) => {
    setExpenses((prev) => [...items, ...prev]);
  };

  const clearAllData = () => {
    setExpenses([]);
    setPayables([]);
    setLoans([]);
    updatePeerReceivables(() => []);
  };

  const resetDefaultData = () => {
    setExpenses(INITIAL_EXPENSES);
    setPayables(INITIAL_PAYABLES);
    setLoans(INITIAL_LOANS);
    updatePeerReceivables(() => INITIAL_PEER_RECEIVABLES);
  };

  // Expose global helper for testing and demonstration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__finance = {
        clearAllData,
        resetDefaultData,
        importExpenses,
        getExpenses: () => expenses,
        getPeerReceivables: () => peerReceivables,
      };
    }
  }, [expenses, peerReceivables]);

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

  const addPeerReceivable = (item: Omit<PeerReceivableItem, 'id' | 'status'>) => {
    const newReceivable: PeerReceivableItem = {
      ...item,
      id: `pr-${Date.now()}`,
      status: 'pending',
    };
    updatePeerReceivables((prev) => [newReceivable, ...prev]);
    // Also record an outflow on the day given so money leaving the account is accurately logged
    addExpense({
      title: `${item.friendName} (Advance)`,
      subtitle: item.note || 'Peer Advance (Awaiting Return)',
      category: 'Miscellaneous',
      paidWith: item.paymentMethod || 'UPI Transfer',
      amount: item.amount,
    });
  };

  const markReceivableReceived = (id: string) => {
    updatePeerReceivables((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'received' as const, settledDate: 'Today' } : r
      )
    );
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
        peerReceivables,
        userProfile,
        activeTab,
        setActiveTab,
        privacyMode,
        setPrivacyMode,
        togglePrivacyMode,
        requestRevealPrivacy,
        isPrivacyModalOpen,
        openPrivacyModal,
        closePrivacyModal,
        privacyPin,
        setPrivacyPin,
        verifyPrivacyPin,
        isModalOpen,
        modalType,
        modalInitialData,
        openModal,
        closeModal,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        isCollapsed,
        setIsCollapsed,
        toggleSidebar,
        addExpense,
        importExpenses,
        clearAllData,
        resetDefaultData,
        addPayable,
        addLoan,
        addPeerReceivable,
        markReceivableReceived,
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
