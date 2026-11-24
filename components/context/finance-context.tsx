'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  ExpenseItem,
  PayableItem,
  LoanItem,
  PeerReceivableItem,
  BorrowerLoan,
  AssetHolding,
  NotificationItem,
  LedgerType,
  UserProfile,
  LoanAdvance,
  LoanRepayment,
  LoanDocument,
} from '@/lib/types';
import {
  INITIAL_EXPENSES,
  INITIAL_PAYABLES,
  INITIAL_LOANS,
  INITIAL_BORROWERS,
  INITIAL_ASSETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PEER_RECEIVABLES,
  INITIAL_USER,
} from '@/lib/mock-data';

export interface ModalInitialData {
  title?: string;
  amount?: string;
  category?: string;
  source?: 'quick-add' | 'header';
}

export interface DayLedgerComputation {
  dateKey: string;
  dateLabel: string;
  formattedDate: string;
  inflow: number;
  inflowDelta: number;
  inflowPercent: number;
  yesterdayInflow: number;
  inflowNote: string;
  outflow: number;
  outflowDelta: number;
  outflowPercent: number;
  yesterdayOutflow: number;
  targetCeiling: number;
  netVelocity: number;
}

interface FinanceContextType {
  // Collections
  expenses: ExpenseItem[];
  payables: PayableItem[];
  loans: LoanItem[];
  borrowers: BorrowerLoan[];
  assets: AssetHolding[];
  peerReceivables: PeerReceivableItem[];
  notifications: NotificationItem[];
  userProfile: UserProfile;
  unreadNotificationsCount: number;

  // Active navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Privacy Mode
  privacyMode: boolean;
  setPrivacyMode: (val: boolean) => void;
  togglePrivacyMode: () => void;
  requestRevealPrivacy: () => void;
  isPrivacyModalOpen: boolean;
  openPrivacyModal: () => void;
  closePrivacyModal: () => void;
  privacyPin: string;
  setPrivacyPin: (pin: string) => void;
  verifyPrivacyPin: (pin: string) => Promise<boolean>;
  verifyAccountPassword: (password: string) => Promise<boolean>;

  // Transaction Modal
  isModalOpen: boolean;
  modalType: LedgerType;
  modalInitialData: ModalInitialData | null;
  openModal: (type?: LedgerType, initialData?: ModalInitialData) => void;
  closeModal: () => void;

  // Global Dialogs
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isSearchModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  isNotificationsDrawerOpen: boolean;
  openNotificationsDrawer: () => void;
  closeNotificationsDrawer: () => void;

  // Layout
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // CRUD Operations: Expenses
  addExpense: (expense: Omit<ExpenseItem, 'id'> & { id?: string }) => void;
  updateExpense: (id: string, updates: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;
  importExpenses: (items: ExpenseItem[]) => void;

  // CRUD Operations: Payables
  addPayable: (payable: Omit<PayableItem, 'id' | 'status'> & { id?: string }) => void;
  updatePayable: (id: string, updates: Partial<PayableItem>) => void;
  settlePayable: (id: string) => void;
  recordPayout: (id: string) => void;
  deletePayable: (id: string) => void;

  // CRUD Operations: Loans & Borrowers
  addLoan: (loan: Omit<LoanItem, 'id' | 'status'> & { id?: string }) => void;
  addBorrower: (borrower: Omit<BorrowerLoan, 'id'> & { id?: string }) => void;
  recordLoanRepayment: (borrowerId: string, amount: number, method?: string) => void;
  addLoanAdvance: (borrowerId: string, advance: Omit<LoanAdvance, 'id'>) => void;
  addLoanDocument: (borrowerId: string, document: Omit<LoanDocument, 'id'>) => void;
  updateBorrowerProfile: (borrowerId: string, updates: Partial<BorrowerLoan>) => void;
  toggleBorrowerPaid: (borrowerId: string) => void;

  // CRUD Operations: Assets & Holdings
  addAsset: (asset: Omit<AssetHolding, 'id'> & { id?: string }) => void;
  updateAsset: (id: string, updates: Partial<AssetHolding>) => void;
  updateAssetValuation: (id: string, newValuation: number) => void;
  deleteAsset: (id: string) => void;

  // CRUD Operations: Peer Receivables
  addPeerReceivable: (receivable: Omit<PeerReceivableItem, 'id' | 'status'>) => void;
  updatePeerReceivable: (id: string, updates: Partial<PeerReceivableItem>) => void;
  markReceivableReceived: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;

  // Dynamic Day Ledger Computation
  computeDayLedger: (dateKey: string) => DayLedgerComputation;

  // Global actions
  clearAllData: () => void;
  resetDefaultData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  // Primary Entity Collections with Initial Seeding
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [payables, setPayables] = useState<PayableItem[]>([]);
  const [borrowers, setBorrowers] = useState<BorrowerLoan[]>([]);
  const [assets, setAssets] = useState<AssetHolding[]>([]);
  const [peerReceivables, setPeerReceivables] = useState<PeerReceivableItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Executive Client',
    email: '',
    tier: 'Private Tier',
    code: '#0001',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  });

  // Backward-compatible `loans` state derived from borrowers
  const loans: LoanItem[] = useMemo(() => {
    return borrowers.map((b) => ({
      id: b.id,
      borrowerName: b.name,
      initials: b.initials,
      note: `${b.contractType || 'Promissory Note'} • ${b.interestRate}%`,
      principalAmount: b.principalAmount,
      interestRateAnnual: b.interestRate,
      monthlyInterest: Math.round((b.principalAmount * (b.interestRate / 100)) / (b.tenureMonths || 12)),
      status: b.status === 'paid' ? 'repaid' : 'active',
    }));
  }, [borrowers]);

  // Security & Privacy State
  const [privacyMode, setPrivacyMode] = useState<boolean>(true);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [privacyPin, setPrivacyPinState] = useState<string>('');

  // User-scoped persistent storage prefix ref (ensures data is never overwritten or lost on refresh)
  const storagePrefixRef = useRef<string>('wt_');

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<LedgerType>('expense');
  const [modalInitialData, setModalInitialData] = useState<ModalInitialData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState<boolean>(false);

  // Layout & Navigation State
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTabState] = useState<string>('overview');

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-collapse sidebar on smaller screens & persist user toggle
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

  // Rehydrate collections & check authenticated user on client mount
  useEffect(() => {
    setPrivacyMode(true);

    const isDemoSession = typeof document !== 'undefined' && document.cookie.includes('sovereign_demo_session=true');

    // If password recovery token is detected in URL hash, bypass dashboard initialization
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      return;
    }

    const initUserData = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        const user = data?.user;

        if (user) {
          // Real Authenticated User -> Set their real identity
          const userKeyPrefix = `wt_${user.id}_`;
          storagePrefixRef.current = userKeyPrefix;

          const fullName =
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'Executive Client';
          setUserProfile({
            name: fullName,
            email: user.email || '',
            tier: user.user_metadata?.tier_label || 'Private Tier',
            code: `#${user.id.slice(0, 4).toUpperCase()}`,
            avatarUrl:
              user.user_metadata?.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
          });

          // Rehydrate custom user privacy PIN if previously configured
          const userSavedPin = localStorage.getItem(`${userKeyPrefix}privacy_pin`) || localStorage.getItem('wt_privacy_pin');
          if (userSavedPin) {
            setPrivacyPinState(userSavedPin);
          }

          // Check user-scoped storage key with seamless fallback
          const loadUserScoped = <T,>(keySuffix: string, setter: (val: T) => void, fallback: T) => {
            try {
              const raw = localStorage.getItem(userKeyPrefix + keySuffix);
              if (raw !== null) {
                setter(JSON.parse(raw));
                return;
              }
              // Also check unscoped key for migration if user already added items previously
              const unscoped = localStorage.getItem(`wt_${keySuffix}`);
              if (unscoped !== null) {
                const parsed = JSON.parse(unscoped);
                setter(parsed);
                localStorage.setItem(userKeyPrefix + keySuffix, unscoped);
                return;
              }
            } catch {}
            // FOR NEW REAL USERS: EMPTY ZERO-STATE!
            setter(fallback);
          };

          loadUserScoped<ExpenseItem[]>('expenses', setExpenses, []);
          loadUserScoped<PayableItem[]>('payables', setPayables, []);
          loadUserScoped<BorrowerLoan[]>('borrowers', setBorrowers, []);
          loadUserScoped<AssetHolding[]>('assets', setAssets, []);
          loadUserScoped<PeerReceivableItem[]>('peer_receivables', setPeerReceivables, []);
          loadUserScoped<NotificationItem[]>('notifications', setNotifications, []);

          // Background Supabase DB sync if tables exist in PostgreSQL
          try {
            const { data: dbExpenses, error } = await supabase
              .from('expenses')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
            if (!error && dbExpenses && dbExpenses.length > 0) {
              const mapped: ExpenseItem[] = dbExpenses.map((d: any) => ({
                id: d.id,
                title: d.title,
                subtitle: d.subtitle,
                category: d.category,
                categoryColor: d.category_color,
                paidWith: d.paid_with,
                amount: parseFloat(d.amount) || 0,
                receiptUrl: d.receipt_url,
                tag: d.tag,
                statusBadge: d.status_badge,
                icon: d.icon,
                dateTime: d.date_time,
                dateKey: d.date_key,
              }));
              setExpenses(mapped);
              localStorage.setItem(`${userKeyPrefix}expenses`, JSON.stringify(mapped));
            }
          } catch {}

          return;
        }
      } catch {}

      // If demo mode preview was chosen:
      if (isDemoSession) {
        storagePrefixRef.current = 'wt_demo_';
        const savedDemoPin = localStorage.getItem('wt_demo_privacy_pin') || localStorage.getItem('wt_privacy_pin');
        if (savedDemoPin) setPrivacyPinState(savedDemoPin);

        const loadDemo = <T,>(keySuffix: string, setter: (val: T) => void, fallback: T) => {
          try {
            const raw = localStorage.getItem(`wt_demo_${keySuffix}`);
            if (raw !== null) {
              setter(JSON.parse(raw));
              return;
            }
          } catch {}
          setter(fallback);
        };

        loadDemo<ExpenseItem[]>('expenses', setExpenses, INITIAL_EXPENSES);
        loadDemo<PayableItem[]>('payables', setPayables, INITIAL_PAYABLES);
        loadDemo<BorrowerLoan[]>('borrowers', setBorrowers, INITIAL_BORROWERS);
        loadDemo<AssetHolding[]>('assets', setAssets, INITIAL_ASSETS);
        loadDemo<PeerReceivableItem[]>('peer_receivables', setPeerReceivables, INITIAL_PEER_RECEIVABLES);
        loadDemo<NotificationItem[]>('notifications', setNotifications, INITIAL_NOTIFICATIONS);
        setUserProfile(INITIAL_USER);
        return;
      }

      // Default: clean empty state for any new visitor
      storagePrefixRef.current = 'wt_';
      const savedPin = localStorage.getItem('wt_privacy_pin');
      if (savedPin) setPrivacyPinState(savedPin);

      const loadLocal = <T,>(key: string, setter: (val: T) => void, fallback: T) => {
        try {
          const raw = localStorage.getItem(key);
          if (raw !== null) {
            setter(JSON.parse(raw));
            return;
          }
        } catch {}
        setter(fallback);
      };

      loadLocal<ExpenseItem[]>('wt_expenses', setExpenses, []);
      loadLocal<PayableItem[]>('wt_payables', setPayables, []);
      loadLocal<BorrowerLoan[]>('wt_borrowers', setBorrowers, []);
      loadLocal<AssetHolding[]>('wt_assets', setAssets, []);
      loadLocal<PeerReceivableItem[]>('wt_peer_receivables', setPeerReceivables, []);
      loadLocal<NotificationItem[]>('wt_notifications', setNotifications, []);
    };

    initUserData();
  }, []);

  // Global Ctrl+K / Cmd+K search listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Save changes to user-scoped localStorage (prevents loss on refresh)
  const saveLocal = (key: string, data: any) => {
    try {
      const cleanKey = key.startsWith('wt_') ? key.replace(/^wt_/, '') : key;
      const userScopedKey = `${storagePrefixRef.current}${cleanKey}`;
      localStorage.setItem(userScopedKey, JSON.stringify(data));
      // Also update generic key for preview resilience
      localStorage.setItem(`wt_${cleanKey}`, JSON.stringify(data));
    } catch (err) {}
  };

  // Privacy Credential Helpers: User's Account Password by default, or Custom PIN if configured
  const setPrivacyPin = (newPin: string) => {
    setPrivacyPinState(newPin);
    try {
      const cleanPin = newPin.trim();
      const pinKey = `${storagePrefixRef.current}privacy_pin`;
      localStorage.setItem(pinKey, cleanPin);
      localStorage.setItem('wt_privacy_pin', cleanPin);
    } catch (e) {}
  };

  const verifyPrivacyPin = async (inputPin: string): Promise<boolean> => {
    const trimmed = inputPin.trim();
    if (!trimmed) return false;

    // 1. If user configured a custom PIN, verify against it first
    if (privacyPin && trimmed === privacyPin) {
      return true;
    }

    // 2. Demo mode session: accept demo credential 'demo' immediately
    const isDemo = typeof document !== 'undefined' && document.cookie.includes('sovereign_demo_session=true');
    if (isDemo && trimmed.toLowerCase() === 'demo') {
      return true;
    }

    // 3. Default: Verify against the user's real account password via Supabase Auth
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || userProfile.email;
      if (userEmail) {
        const { error } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: trimmed,
        });
        if (!error) {
          return true;
        }
      }
    } catch {}

    return false;
  };

  const verifyAccountPassword = async (accountPassword: string): Promise<boolean> => {
    const trimmed = accountPassword.trim();
    if (!trimmed) return false;

    // Demo mode session: accept demo password 'demo'
    const isDemo = typeof document !== 'undefined' && document.cookie.includes('sovereign_demo_session=true');
    if (isDemo && trimmed.toLowerCase() === 'demo') {
      return true;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || userProfile.email;
      if (userEmail) {
        const { error } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: trimmed,
        });
        if (!error) {
          return true;
        }
      }
    } catch {}

    return false;
  };

  const openPrivacyModal = () => setIsPrivacyModalOpen(true);
  const closePrivacyModal = () => setIsPrivacyModalOpen(false);

  const requestRevealPrivacy = () => {
    if (privacyMode) {
      setIsPrivacyModalOpen(true);
    } else {
      setPrivacyMode(true);
    }
  };

  const togglePrivacyMode = () => {
    requestRevealPrivacy();
  };

  // Modal Control
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

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  const openNotificationsDrawer = () => setIsNotificationsDrawerOpen(true);
  const closeNotificationsDrawer = () => setIsNotificationsDrawerOpen(false);

  // ---------------------------------------------------------------------------
  // CRUD Operations: Expenses
  // ---------------------------------------------------------------------------
  const addExpense = (item: Omit<ExpenseItem, 'id'> & { id?: string }) => {
    const today = new Date();
    const dateKey = item.dateKey || today.toISOString().slice(0, 10);
    const dateGroup = item.dateGroup || today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const newExpense: ExpenseItem = {
      ...item,
      id: item.id || `exp-${Date.now()}`,
      dateTime: item.dateTime || 'Today, Just now',
      dateKey,
      tag: item.tag || `#${item.category.split(' ')[0]}`,
      statusBadge: item.statusBadge || 'Verified Receipt',
      icon: item.icon || 'receipt_long',
      dateGroup,
    };
    setExpenses((prev) => {
      const updated = [newExpense, ...prev];
      saveLocal('wt_expenses', updated);
      return updated;
    });

    // Background sync to Supabase if tables exist
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          supabase.from('expenses').insert({
            user_id: data.user.id,
            title: newExpense.title,
            subtitle: newExpense.subtitle || null,
            category: newExpense.category,
            category_color: newExpense.categoryColor || '#d4af37',
            paid_with: newExpense.paidWith,
            amount: newExpense.amount,
            receipt_url: newExpense.receiptUrl || null,
            tag: newExpense.tag || null,
            status_badge: newExpense.statusBadge || 'Verified Receipt',
            icon: newExpense.icon || 'receipt_long',
            date_time: newExpense.dateTime,
            date_key: newExpense.dateKey,
          }).then(() => {});
        }
      }).catch(() => {});
    } catch {}
  };

  const updateExpense = (id: string, updates: Partial<ExpenseItem>) => {
    setExpenses((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      saveLocal('wt_expenses', updated);
      return updated;
    });

    try {
      const supabase = createClient();
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.categoryColor !== undefined) payload.category_color = updates.categoryColor;
      if (updates.paidWith !== undefined) payload.paid_with = updates.paidWith;
      if (updates.amount !== undefined) payload.amount = updates.amount;
      if (updates.receiptUrl !== undefined) payload.receipt_url = updates.receiptUrl;
      if (updates.tag !== undefined) payload.tag = updates.tag;
      if (updates.dateTime !== undefined) payload.date_time = updates.dateTime;
      if (updates.dateKey !== undefined) payload.date_key = updates.dateKey;

      if (Object.keys(payload).length > 0) {
        supabase.from('expenses').update(payload).eq('id', id).then(() => {});
      }
    } catch {}
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveLocal('wt_expenses', updated);
      return updated;
    });

    try {
      const supabase = createClient();
      supabase.from('expenses').delete().eq('id', id).then(() => {});
    } catch {}
  };

  const importExpenses = (items: ExpenseItem[]) => {
    setExpenses((prev) => {
      const updated = [...items, ...prev];
      saveLocal('wt_expenses', updated);
      return updated;
    });
  };

  // ---------------------------------------------------------------------------
  // CRUD Operations: Payables
  // ---------------------------------------------------------------------------
  const addPayable = (item: Omit<PayableItem, 'id' | 'status'> & { id?: string }) => {
    const newPayable: PayableItem = {
      ...item,
      id: item.id || `pay-${Date.now()}`,
      status: 'pending',
      statusLabel: item.statusLabel || 'Due Soon',
      actionLabel: item.actionLabel || 'Settle Now',
    };
    setPayables((prev) => {
      const updated = [newPayable, ...prev];
      saveLocal('wt_payables', updated);
      return updated;
    });
  };

  const updatePayable = (id: string, updates: Partial<PayableItem>) => {
    setPayables((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      saveLocal('wt_payables', updated);
      return updated;
    });

    try {
      const supabase = createClient();
      const payload: Record<string, any> = {};
      if (updates.creditorName !== undefined) payload.creditor_name = updates.creditorName;
      if (updates.amount !== undefined) payload.amount = updates.amount;
      if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
      if (updates.invoiceNote !== undefined) payload.note = updates.invoiceNote;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.status !== undefined) payload.status = updates.status;

      if (Object.keys(payload).length > 0) {
        supabase.from('payables').update(payload).eq('id', id).then(() => {});
      }
    } catch {}
  };

  const settlePayable = (id: string) => {
    const payable = payables.find((p) => p.id === id);
    if (!payable) return;

    // 1. Mark payable as settled
    setPayables((prev) => {
      const updated = prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'paid' as const,
              statusLabel: 'Settled',
              settledAt: new Date().toISOString(),
            }
          : p
      );
      saveLocal('wt_payables', updated);
      return updated;
    });

    // 2. Automatically log an outflow expense so the balance updates everywhere
    const today = new Date();
    addExpense({
      title: `${payable.creditorName} (Settlement)`,
      subtitle: payable.invoiceNote || 'Vendor liability settled',
      category: payable.category || 'Vendor Liability',
      paidWith: payable.disbursementRoute || 'Direct Wire (HDFC)',
      amount: payable.amount,
      dateTime: 'Today, Just now',
      dateKey: today.toISOString().slice(0, 10),
      dateGroup: today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    });

    // 3. Add success notification
    addNotification({
      title: `Invoice Settled: ${payable.creditorName}`,
      description: `Payment of ₹${payable.amount.toLocaleString('en-IN')} successfully disbursed via ${
        payable.disbursementRoute || 'Direct Wire'
      }.`,
      type: 'due_alert',
      severity: 'info',
      actionTab: 'payables',
    });
  };

  const deletePayable = (id: string) => {
    setPayables((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveLocal('wt_payables', updated);
      return updated;
    });
  };

  // ---------------------------------------------------------------------------
  // CRUD Operations: Loans & Borrowers
  // ---------------------------------------------------------------------------
  const addLoan = (loan: Omit<LoanItem, 'id' | 'status'> & { id?: string }) => {
    addBorrower({
      name: loan.borrowerName,
      initials: loan.initials,
      contactOrNote: loan.note,
      principalAmount: loan.principalAmount,
      paymentMode: 'Bank Transfer',
      paymentModeIcon: 'account_balance',
      dateGiven: 'Today',
      interestRate: loan.interestRateAnnual || 18,
      interestRatePeriod: 'flat rate',
      payoutFrequency: 'Monthly Payout',
      tenureMonths: 12,
      termLabel: '12-Month Term',
      nextDueDate: 'Next Month',
      nextDueAmount: Math.round((loan.principalAmount * ((loan.interestRateAnnual || 18) / 100)) / 12),
      dueCountdownText: '30 Days Remaining',
      dueCountdownType: 'normal',
      receivedAmount: 0,
      totalReceivable: loan.principalAmount * (1 + (loan.interestRateAnnual || 18) / 100),
      progressPercent: 0,
      status: 'active',
      statusLabel: 'Active & Paying',
    });
  };

  const addBorrower = (item: Omit<BorrowerLoan, 'id'> & { id?: string }) => {
    const words = item.name.trim().split(' ');
    const initials =
      item.initials ||
      (words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : words[0].slice(0, 2).toUpperCase());

    const newBorrower: BorrowerLoan = {
      ...item,
      id: item.id || `borrower-${Date.now()}`,
      initials,
      avatarBg: item.avatarBg || 'bg-[#0f172a]',
      avatarText: item.avatarText || 'text-[#d4af37]',
      status: item.status || 'active',
      statusLabel: item.statusLabel || 'Active',
      borrowerId: item.borrowerId || `LN-${Math.floor(10000 + Math.random() * 90000)}`,
      receivedAmount: item.receivedAmount || 0,
      totalReceivable: item.totalReceivable || item.principalAmount * 1.1,
      progressPercent: item.progressPercent || 0,
      totalSanctioned: item.totalSanctioned || item.principalAmount,
      outstandingBalance: item.outstandingBalance || item.totalReceivable || item.principalAmount * 1.1,
      repaymentPacing: item.repaymentPacing || '0.0%',
      lifetimeCollected: item.lifetimeCollected || 0,
      advances: item.advances || [
        {
          id: `adv-${Date.now()}`,
          advanceId: `ADV-${Math.floor(1000 + Math.random() * 9000)}`,
          agent: 'Arjun Sharma (Field Lead)',
          issueDate: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
          issueAmount: item.principalAmount,
          outstandingTotal: item.principalAmount,
          total: item.principalAmount,
        },
      ],
      repayments: item.repayments || [],
      documents: item.documents || [],
    };

    setBorrowers((prev) => {
      const updated = [newBorrower, ...prev];
      saveLocal('wt_borrowers', updated);
      return updated;
    });

    // Also record outflow expense when lending money so day cashflow reflects capital deployment
    addExpense({
      title: `${item.name} (Capital Lent)`,
      subtitle: `${item.contractType || 'Promissory Loan'} • Disbursed via ${item.paymentMode || 'Wire'}`,
      category: 'Capital Deployment',
      paidWith: item.paymentMode || 'Bank Wire',
      amount: item.principalAmount,
      dateTime: 'Today, Just now',
      dateKey: '2026-10-28',
      dateGroup: 'Today, October 28',
    });
  };

  const recordLoanRepayment = (borrowerId: string, amount: number, method: string = 'UPI') => {
    let borrowerName = 'Borrower';
    setBorrowers((prev) => {
      const updated = prev.map((b) => {
        if (b.id === borrowerId) {
          borrowerName = b.name;
          const newReceived = Math.min(b.totalReceivable, b.receivedAmount + amount);
          const percent = Math.min(100, Math.round((newReceived / b.totalReceivable) * 100));
          const newOutstanding = Math.max(0, b.totalReceivable - newReceived);

          const newRepayment: LoanRepayment = {
            id: `rep-${Date.now()}`,
            borrowerId,
            installmentNum: (b.repayments?.length || 0) + 1,
            dueDate: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount,
            paymentDate: 'Today',
            method,
            referenceId: `REF-${Math.floor(100000000 + Math.random() * 900000000)}`,
            status: 'Completed',
          };

          return {
            ...b,
            receivedAmount: newReceived,
            outstandingBalance: newOutstanding,
            progressPercent: percent,
            status: percent >= 100 ? ('paid' as const) : b.status,
            statusLabel: percent >= 100 ? 'Fully Settled' : b.statusLabel,
            lifetimeCollected: (b.lifetimeCollected || 0) + amount,
            repayments: [newRepayment, ...(b.repayments || [])],
          };
        }
        return b;
      });
      saveLocal('wt_borrowers', updated);
      return updated;
    });

    // Notify user of cash inflow
    addNotification({
      title: `Loan Installment Collected: ${borrowerName}`,
      description: `Received ₹${amount.toLocaleString('en-IN')} via ${method}. Outstanding balance updated.`,
      type: 'loan_payment',
      severity: 'info',
      actionTab: 'lending',
    });
  };

  const addLoanAdvance = (borrowerId: string, advance: Omit<LoanAdvance, 'id'>) => {
    setBorrowers((prev) => {
      const updated = prev.map((b) => {
        if (b.id === borrowerId) {
          const newAdv: LoanAdvance = { ...advance, id: `adv-${Date.now()}` };
          return {
            ...b,
            advances: [newAdv, ...(b.advances || [])],
            totalSanctioned: (b.totalSanctioned || 0) + advance.issueAmount,
            principalAmount: b.principalAmount + advance.issueAmount,
            totalReceivable: b.totalReceivable + advance.total,
            outstandingBalance: (b.outstandingBalance || 0) + advance.outstandingTotal,
          };
        }
        return b;
      });
      saveLocal('wt_borrowers', updated);
      return updated;
    });
  };

  const addLoanDocument = (borrowerId: string, doc: Omit<LoanDocument, 'id'>) => {
    setBorrowers((prev) => {
      const updated = prev.map((b) => {
        if (b.id === borrowerId) {
          const newDoc: LoanDocument = { ...doc, id: `doc-${Date.now()}` };
          return {
            ...b,
            documents: [newDoc, ...(b.documents || [])],
          };
        }
        return b;
      });
      saveLocal('wt_borrowers', updated);
      return updated;
    });
  };

  const updateBorrowerProfile = (borrowerId: string, updates: Partial<BorrowerLoan>) => {
    setBorrowers((prev) => {
      const updated = prev.map((b) => (b.id === borrowerId ? { ...b, ...updates } : b));
      saveLocal('wt_borrowers', updated);
      return updated;
    });
  };

  const toggleBorrowerPaid = (borrowerId: string) => {
    setBorrowers((prev) => {
      const updated = prev.map((b) => {
        if (b.id === borrowerId) {
          const isCurrentlyPaid = b.status === 'paid';
          return {
            ...b,
            status: isCurrentlyPaid ? ('active' as const) : ('paid' as const),
            statusLabel: isCurrentlyPaid ? 'Active' : 'Fully Settled',
            progressPercent: isCurrentlyPaid ? 50 : 100,
            receivedAmount: isCurrentlyPaid ? Math.round(b.totalReceivable / 2) : b.totalReceivable,
            outstandingBalance: isCurrentlyPaid ? Math.round(b.totalReceivable / 2) : 0,
          };
        }
        return b;
      });
      saveLocal('wt_borrowers', updated);
      return updated;
    });
  };

  // ---------------------------------------------------------------------------
  // CRUD Operations: Assets & Holdings
  // ---------------------------------------------------------------------------
  const addAsset = (item: Omit<AssetHolding, 'id'> & { id?: string }) => {
    const yieldRate = item.annualYieldRate || 0;
    const monthlyYield = (item.valuation * (yieldRate / 100)) / 12;
    const newAsset: AssetHolding = {
      ...item,
      id: item.id || `asset-${Date.now()}`,
      monthlyYield,
      lastValuationDate: item.lastValuationDate || new Date().toISOString().slice(0, 10),
    };
    setAssets((prev) => {
      const updated = [newAsset, ...prev];
      saveLocal('wt_assets', updated);
      return updated;
    });

    addNotification({
      title: `New Asset Registered: ${item.name}`,
      description: `Valuation of ₹${item.valuation.toLocaleString('en-IN')} added to Sovereign Net Worth.`,
      type: 'system',
      severity: 'info',
      actionTab: 'assets',
    });
  };

  const updateAsset = (id: string, updates: Partial<AssetHolding>) => {
    setAssets((prev) => {
      const updated = prev.map((a) => {
        if (a.id === id) {
          const merged = { ...a, ...updates };
          const monthlyYield = (merged.valuation * (merged.annualYieldRate / 100)) / 12;
          return {
            ...merged,
            monthlyYield,
            lastValuationDate: updates.lastValuationDate || new Date().toISOString().slice(0, 10),
          };
        }
        return a;
      });
      saveLocal('wt_assets', updated);
      return updated;
    });
  };

  const updateAssetValuation = (id: string, newValuation: number) => {
    setAssets((prev) => {
      const updated = prev.map((a) => {
        if (a.id === id) {
          const monthlyYield = (newValuation * (a.annualYieldRate / 100)) / 12;
          return {
            ...a,
            valuation: newValuation,
            monthlyYield,
            lastValuationDate: new Date().toISOString().slice(0, 10),
          };
        }
        return a;
      });
      saveLocal('wt_assets', updated);
      return updated;
    });
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveLocal('wt_assets', updated);
      return updated;
    });
  };

  // ---------------------------------------------------------------------------
  // CRUD Operations: Peer Receivables
  // ---------------------------------------------------------------------------
  const addPeerReceivable = (item: Omit<PeerReceivableItem, 'id' | 'status'>) => {
    const newReceivable: PeerReceivableItem = {
      ...item,
      id: `pr-${Date.now()}`,
      status: 'pending',
    };
    setPeerReceivables((prev) => {
      const updated = [newReceivable, ...prev];
      saveLocal('wt_peer_receivables', updated);
      return updated;
    });

    // Also record outflow expense
    addExpense({
      title: `${item.friendName} (Advance)`,
      subtitle: item.note || 'Peer Advance (Awaiting Return)',
      category: 'Miscellaneous',
      paidWith: item.paymentMethod || 'UPI Transfer',
      amount: item.amount,
      dateTime: 'Today, Just now',
      dateKey: '2026-10-28',
      dateGroup: 'Today, October 28',
    });
  };

  const updatePeerReceivable = (id: string, updates: Partial<PeerReceivableItem>) => {
    setPeerReceivables((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
      saveLocal('wt_peer_receivables', updated);
      return updated;
    });
  };

  const markReceivableReceived = (id: string) => {
    let friendName = 'Friend';
    let amt = 0;
    setPeerReceivables((prev) => {
      const updated = prev.map((r) => {
        if (r.id === id) {
          friendName = r.friendName;
          amt = r.amount;
          return { ...r, status: 'received' as const, settledDate: 'Today' };
        }
        return r;
      });
      saveLocal('wt_peer_receivables', updated);
      return updated;
    });

    addNotification({
      title: `Peer Advance Repaid: ${friendName}`,
      description: `Collected ₹${amt.toLocaleString('en-IN')} return into cash balance.`,
      type: 'loan_payment',
      severity: 'info',
      actionTab: 'overview',
    });
  };

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      saveLocal('wt_notifications', updated);
      return updated;
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveLocal('wt_notifications', updated);
      return updated;
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveLocal('wt_notifications', updated);
      return updated;
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveLocal('wt_notifications', updated);
      return updated;
    });
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // ---------------------------------------------------------------------------
  // Dynamic Day Ledger Aggregator
  // ---------------------------------------------------------------------------
  const computeDayLedger = useCallback(
    (dateKey: string): DayLedgerComputation => {
      // 1. Calculate actual outflows for dateKey
      const dayExpenses = expenses.filter((e) => (e.dateKey || '2026-10-28') === dateKey);
      const actualOutflow = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Baseline inflows & settled friend returns
      const settledReturns = peerReceivables
        .filter((r) => r.status === 'received' && (r.dateKey === dateKey || (dateKey === '2026-10-28' && r.settledDate === 'Today')))
        .reduce((sum, r) => sum + r.amount, 0);

      const isZeroUser = expenses.length === 0;
      const baselineInflows: Record<string, number> = isZeroUser
        ? {}
        : {
            '2026-10-28': 5200.0,
            '2026-10-27': 3800.0,
            '2026-10-25': 4500.0,
            '2026-10-23': 3200.0,
          };

      const baseInflow = isZeroUser ? 0 : (baselineInflows[dateKey] ?? 3500.0);
      const actualInflow = baseInflow + settledReturns;

      const yesterdayOutflow = isZeroUser ? 0 : (dateKey === '2026-10-28' ? 1890.0 : 2850.0);
      const yesterdayInflow = isZeroUser ? 0 : (dateKey === '2026-10-28' ? 3800.0 : 3000.0);

      const outflowDelta = actualOutflow - yesterdayOutflow;
      const outflowPercent = yesterdayOutflow > 0 ? Math.round((outflowDelta / yesterdayOutflow) * 100) : 0;

      const inflowDelta = actualInflow - yesterdayInflow;
      const inflowPercent = yesterdayInflow > 0 ? Math.round((inflowDelta / yesterdayInflow) * 100) : 0;

      const netVelocity = actualInflow - actualOutflow;

      const labels: Record<string, { label: string; formatted: string }> = {
        '2026-10-28': { label: 'Today, October 28', formatted: 'Oct 28, 2026' },
        '2026-10-27': { label: 'Sunday, October 27', formatted: 'Oct 27, 2026' },
        '2026-10-25': { label: 'Friday, October 25', formatted: 'Oct 25, 2026' },
        '2026-10-23': { label: 'Wednesday, October 23', formatted: 'Oct 23, 2026' },
      };

      const dateMeta = labels[dateKey] || { label: `Date ${dateKey}`, formatted: dateKey };

      return {
        dateKey,
        dateLabel: dateMeta.label,
        formattedDate: dateMeta.formatted,
        inflow: actualInflow,
        inflowDelta,
        inflowPercent,
        yesterdayInflow,
        inflowNote: `Yesterday: ₹${yesterdayInflow.toLocaleString('en-IN', { minimumFractionDigits: 2 })} • Consulting & Yield`,
        outflow: actualOutflow,
        outflowDelta,
        outflowPercent,
        yesterdayOutflow,
        targetCeiling: 4000.0,
        netVelocity,
      };
    },
    [expenses, peerReceivables]
  );

  // ---------------------------------------------------------------------------
  // Global Reset & Testing
  // ---------------------------------------------------------------------------
  const clearAllData = () => {
    setExpenses([]);
    setPayables([]);
    setBorrowers([]);
    setAssets([]);
    setPeerReceivables([]);
    setNotifications([]);
    localStorage.removeItem('wt_expenses');
    localStorage.removeItem('wt_payables');
    localStorage.removeItem('wt_borrowers');
    localStorage.removeItem('wt_assets');
    localStorage.removeItem('wt_peer_receivables');
    localStorage.removeItem('wt_notifications');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__clearAllData = clearAllData;
    }
  }, []);

  const resetDefaultData = () => {
    setExpenses(INITIAL_EXPENSES);
    setPayables(INITIAL_PAYABLES);
    setBorrowers(INITIAL_BORROWERS);
    setAssets(INITIAL_ASSETS);
    setPeerReceivables(INITIAL_PEER_RECEIVABLES);
    setNotifications(INITIAL_NOTIFICATIONS);
    saveLocal('wt_expenses', INITIAL_EXPENSES);
    saveLocal('wt_payables', INITIAL_PAYABLES);
    saveLocal('wt_borrowers', INITIAL_BORROWERS);
    saveLocal('wt_assets', INITIAL_ASSETS);
    saveLocal('wt_peer_receivables', INITIAL_PEER_RECEIVABLES);
    saveLocal('wt_notifications', INITIAL_NOTIFICATIONS);
  };

  return (
    <FinanceContext.Provider
      value={{
        expenses,
        payables,
        loans,
        borrowers,
        assets,
        peerReceivables,
        notifications,
        userProfile,
        unreadNotificationsCount,

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
        verifyAccountPassword,

        isModalOpen,
        modalType,
        modalInitialData,
        openModal,
        closeModal,

        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,

        isSearchModalOpen,
        openSearchModal,
        closeSearchModal,

        isNotificationsDrawerOpen,
        openNotificationsDrawer,
        closeNotificationsDrawer,

        isCollapsed,
        setIsCollapsed,
        toggleSidebar,

        addExpense,
        updateExpense,
        deleteExpense,
        importExpenses,

        addPayable,
        updatePayable,
        settlePayable,
        recordPayout: settlePayable,
        deletePayable,

        addLoan,
        addBorrower,
        recordLoanRepayment,
        addLoanAdvance,
        addLoanDocument,
        updateBorrowerProfile,
        toggleBorrowerPaid,

        addAsset,
        updateAsset,
        updateAssetValuation,
        deleteAsset,

        addPeerReceivable,
        updatePeerReceivable,
        markReceivableReceived,

        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,

        computeDayLedger,

        clearAllData,
        resetDefaultData,
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
