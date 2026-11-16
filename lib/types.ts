export type LedgerType = 'expense' | 'due' | 'loan';

export interface ExpenseItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  categoryColor?: string;
  paidWith: string;
  dateTime: string;
  amount: number;
  receiptUrl?: string;
}

export interface PayableItem {
  id: string;
  creditorName: string;
  invoiceNote: string;
  amount: number;
  dueDate: string;
  urgencyBadge?: string;
  status: 'pending' | 'paid';
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
