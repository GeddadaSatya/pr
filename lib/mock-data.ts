import { CategoryStat, ExpenseItem, LoanItem, PayableItem, PeerReceivableItem, UserProfile } from './types';

export const INITIAL_PEER_RECEIVABLES: PeerReceivableItem[] = [
  {
    id: 'pr-1',
    friendName: 'Rahul Sharma',
    amount: 2000.00,
    dateGiven: 'Yesterday',
    dateKey: '2026-10-27',
    paymentMethod: 'HDFC Bank UPI',
    note: 'Dinner & cab share',
    status: 'pending',
  },
  {
    id: 'pr-2',
    friendName: 'Priya Patel',
    amount: 1500.00,
    dateGiven: '2 days ago',
    dateKey: '2026-10-26',
    paymentMethod: 'ICICI Corporate Card',
    note: 'Concert ticket advance',
    status: 'pending',
  },
];

export const INITIAL_USER: UserProfile = {
  name: 'Sterling H.',
  tier: 'Private Tier',
  code: '#0849',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  email: 'sterling.h@sovereign.vault'
};

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    title: 'NetJets Flight Fractional',
    subtitle: 'Private flight charter • Geneva summit',
    category: 'Travel & Logistics',
    categoryColor: '#d4af37',
    paidWith: 'HDFC Bank Regalia Gold',
    dateTime: 'Today, 14:22',
    amount: 3450.00,
  },
  {
    id: 'exp-2',
    title: 'High-Performance Computing Cluster',
    subtitle: 'Trading algorithmic server rig install',
    category: 'Tech & Infra',
    categoryColor: '#0f172a',
    paidWith: 'Bank NEFT/RTGS Transfer',
    dateTime: 'Yesterday, 19:10',
    amount: 1890.00,
  },
  {
    id: 'exp-3',
    title: 'Private Executive Dining',
    subtitle: "L'Atelier Partners dinner hosting",
    category: 'Client Hosting',
    categoryColor: '#e11d48',
    paidWith: 'Axis Bank Magnus Card',
    dateTime: 'Oct 23, 21:40',
    amount: 620.00,
  },
  {
    id: 'exp-4',
    title: 'Arbitration Counsel Retainer',
    subtitle: 'Sterling & Cross Legal Q4 retainer',
    category: 'Legal & Retainers',
    categoryColor: '#2563eb',
    paidWith: 'ICICI Corporate Card',
    dateTime: 'Oct 21, 11:15',
    amount: 2334.00,
  },
  {
    id: 'exp-5',
    title: 'Mayfair Suite Leasehold Maintenance',
    subtitle: 'Quarterly facility management fee',
    category: 'Real Estate & Maintenance',
    categoryColor: '#10b981',
    paidWith: 'Direct Debit ACH',
    dateTime: 'Oct 19, 09:30',
    amount: 1750.50,
  }
];

export const INITIAL_PAYABLES: PayableItem[] = [
  {
    id: 'pay-1',
    creditorName: 'Marcus Vance',
    beneficiarySub: 'Audio/Hardware Engineering',
    category: 'Equipment Capital',
    invoiceNote: 'Vendor Equipment Balance • Invoice #9802',
    amount: 2500.00,
    dueDate: 'Oct 28',
    fullDueDate: 'Oct 28, 2026',
    dueDateUrgency: 'Urgent (in 3 days)',
    urgencyBadge: 'Due in 3d',
    disbursementRoute: 'Direct Wire (HDFC)',
    statusLabel: 'Due Soon',
    actionLabel: 'Settle Now',
    status: 'pending'
  },
  {
    id: 'pay-2',
    creditorName: 'Elena Rostova',
    beneficiarySub: 'Venture Syndicate GP',
    category: 'Tranche Syndication',
    invoiceNote: 'Syndicate Tranche • Due Nov 02',
    amount: 5000.00,
    dueDate: 'Nov 02',
    fullDueDate: 'Nov 02, 2026',
    dueDateUrgency: 'Pre-authorized',
    urgencyBadge: 'Scheduled ACH',
    disbursementRoute: 'Automated ACH (Primary)',
    statusLabel: 'Scheduled ACH',
    actionLabel: 'Review ACH',
    status: 'pending'
  },
  {
    id: 'pay-3',
    creditorName: 'Sterling & Cross Law',
    beneficiarySub: 'Fiduciary Legal Counsel',
    category: 'Legal & Trust Retainer',
    invoiceNote: 'Q4 Trust Advisory Retainer',
    amount: 3200.00,
    dueDate: 'Nov 15',
    fullDueDate: 'Nov 15, 2026',
    dueDateUrgency: 'Regular Cycle',
    urgencyBadge: 'Regular',
    disbursementRoute: 'Manual NEFT / RTGS',
    statusLabel: 'Pending',
    actionLabel: 'Manage',
    status: 'pending'
  }
];

export const INITIAL_LOANS: LoanItem[] = [
  {
    id: 'loan-1',
    borrowerName: 'Devon Reed',
    initials: 'DR',
    note: 'Bridge Capital • 18% APR (Monthly)',
    principalAmount: 50000.00,
    interestRateAnnual: 18.0,
    monthlyInterest: 750.00,
    status: 'active'
  },
  {
    id: 'loan-2',
    borrowerName: 'Kasper Arts Inc.',
    initials: 'KA',
    note: 'Inventory Finance • Maturity Dec 20',
    principalAmount: 30000.00,
    interestRateAnnual: 18.0,
    monthlyInterest: 450.00,
    status: 'active'
  },
  {
    id: 'loan-3',
    borrowerName: 'Tate Chambers',
    initials: 'TC',
    note: 'Secured Promissory • 18% p.a.',
    principalAmount: 15000.00,
    interestRateAnnual: 18.0,
    monthlyInterest: 225.00,
    status: 'active'
  }
];

export const CATEGORIES_DATA: CategoryStat[] = [
  { name: 'Travel & Logistics', percent: 30, amount: 5835.00, color: '#d4af37', dashoffset: 0, dasharray: '113.1 377' },
  { name: 'Tech & Infra', percent: 20, amount: 3890.00, color: '#0f172a', dashoffset: -113.1, dasharray: '75.4 377' },
  { name: 'Executive Dining', percent: 15, amount: 2917.50, color: '#f59e0b', dashoffset: -188.5, dasharray: '56.55 377' },
  { name: 'Legal & Retainers', percent: 12, amount: 2334.00, color: '#2563eb', dashoffset: -245.05, dasharray: '45.24 377' },
  { name: 'Real Estate & Maintenance', percent: 9, amount: 1750.50, color: '#10b981', dashoffset: -290.29, dasharray: '33.93 377' },
  { name: 'Client Hosting', percent: 6, amount: 1167.00, color: '#e11d48', dashoffset: -324.22, dasharray: '22.62 377' },
  { name: 'Utilities & Comm', percent: 5, amount: 972.50, color: '#06b6d4', dashoffset: -346.84, dasharray: '18.85 377' },
  { name: 'Miscellaneous', percent: 3, amount: 583.50, color: '#8b5cf6', dashoffset: -365.69, dasharray: '11.31 377' }
];
