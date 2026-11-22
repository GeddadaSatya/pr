export type LedgerType = 'expense' | 'due' | 'loan' | 'receive' | 'asset';

export interface PeerReceivableItem {
  id: string;
  friendName: string;
  amount: number;
  dateGiven: string;
  dateKey?: string;
  paymentMethod: string;
  note?: string;
  status: 'pending' | 'received';
  settledDate?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  categoryColor?: string;
  paidWith: string;
  dateTime?: string;
  amount: number;
  receiptUrl?: string;
  tag?: string;
  statusBadge?: string;
  icon?: string;
  dateGroup?: string;
  dateKey?: string;
  time?: string;
  attachments?: string[];
}

export interface PayableItem {
  id: string;
  creditorName: string;
  invoiceNote: string;
  amount: number;
  dueDate: string;
  urgencyBadge?: string;
  status: 'pending' | 'paid';
  category?: string;
  beneficiarySub?: string;
  fullDueDate?: string;
  dueDateUrgency?: string;
  disbursementRoute?: string;
  statusLabel?: string;
  actionLabel?: string;
  settledAt?: string;
}

export interface LoanItem {
  id: string;
  borrowerName: string;
  initials: string;
  note: string;
  principalAmount: number;
  interestRateAnnual: number;
  monthlyInterest: number;
  status: 'active' | 'repaid';
}

export interface LoanAdvance {
  id: string;
  advanceId: string;
  agent: string;
  issueDate: string;
  issueAmount: number;
  outstandingTotal: number;
  total: number;
}

export interface LoanRepayment {
  id: string;
  borrowerId: string;
  installmentNum: number;
  dueDate: string;
  amount: number;
  paymentDate?: string;
  method?: string;
  referenceId?: string;
  status: 'Completed' | 'Overdue' | 'Upcoming';
}

export interface LoanDocument {
  id: string;
  borrowerId?: string;
  title: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  iconType: 'pdf' | 'image' | 'user' | 'bill';
  fileUrl?: string;
}

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
  contractType?: string;
  priorityTag?: string;
  settlementChannel?: string;
  noteTitle?: string;
  noteText?: string;
  attachmentName?: string;
  phone?: string;
  address?: string;
  borrowerId?: string;
  totalSanctioned?: number;
  outstandingBalance?: number;
  repaymentPacing?: string;
  lifetimeCollected?: number;
  advances?: LoanAdvance[];
  repayments?: LoanRepayment[];
  documents?: LoanDocument[];
}

export interface AssetHolding {
  id: string;
  name: string;
  category: 'Liquid Cash & Banking' | 'Bullion & Precious Metals' | 'Bonds & Fixed Income' | 'Real Estate & Properties' | 'Alternative & Equity';
  institution: string;
  valuation: number;
  annualYieldRate: number;
  monthlyYield: number;
  liquidityTier: 'Instant' | 'T+1' | 'T+3' | 'Illiquid';
  accountRef: string;
  lastValuationDate: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'due_alert' | 'loan_payment' | 'repayment_due' | 'security' | 'system';
  severity: 'high' | 'medium' | 'info';
  timestamp: string;
  read: boolean;
  actionTab?: string;
}

export interface CategoryStat {
  name: string;
  percent: number;
  amount: number;
  color: string;
  dashoffset: number;
  dasharray: string;
}

export interface UserProfile {
  name: string;
  tier: string;
  code: string;
  avatarUrl: string;
  email?: string;
}
