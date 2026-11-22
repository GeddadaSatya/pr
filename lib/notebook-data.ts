export interface NotebookEntry {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  category: string;
  statusBadge: string;
  paidWith: string;
  dateTime: string;
  amount: number;
  icon: string;
  dateGroup: string;
  dateKey: string;
  time: string;
  attachments?: string[];
}

export interface DayLedgerData {
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
  entries: NotebookEntry[];
}

export const INITIAL_NOTEBOOK_ENTRIES: NotebookEntry[] = [
  {
    id: 'nb-1',
    title: 'Third Wave Coffee Roasters',
    subtitle: 'Afternoon client catchup & cold brews • Paid via HDFC UPI • 03:42 PM',
    tag: 'Dining',
    category: 'Dining',
    statusBadge: 'Verified Receipt',
    paidWith: 'HDFC UPI',
    dateTime: 'Today, 15:42',
    amount: 420.00,
    icon: 'restaurant',
    dateGroup: 'Today, October 28',
    dateKey: '2026-10-28',
    time: '03:42 PM',
    attachments: ['Receipt_TW_420.pdf'],
  },
  {
    id: 'nb-2',
    title: 'Uber Premier • Airport Transit',
    subtitle: 'Terminal 2 to Indiranagar Office • ICICI Corporate Card • 11:15 AM',
    tag: 'Travel',
    category: 'Travel',
    statusBadge: 'Auto-matched GST',
    paidWith: 'ICICI Corporate Card',
    dateTime: 'Today, 11:15',
    amount: 820.00,
    icon: 'directions_car',
    dateGroup: 'Today, October 28',
    dateKey: '2026-10-28',
    time: '11:15 AM',
    attachments: ['GST_Invoice_Uber_820.pdf'],
  },
  {
    id: 'nb-3',
    title: 'Apple Store BKC • MagSafe Duo & Adapter',
    subtitle: 'Replacement travel power adapter kit • Amex Platinum • 06:10 PM',
    tag: 'Hardware',
    category: 'Hardware',
    statusBadge: 'Tax Invoice Attached',
    paidWith: 'Amex Platinum',
    dateTime: 'Sunday, 18:10',
    amount: 3450.00,
    icon: 'laptop_mac',
    dateGroup: 'Sunday, October 27',
    dateKey: '2026-10-27',
    time: '06:10 PM',
    attachments: ['Apple_Tax_Invoice_BKC.pdf'],
  },
  {
    id: 'nb-4',
    title: 'Cult.fit Center - Recovery Session',
    subtitle: 'Physiotherapy & recovery routine • SBI Debit • 07:30 AM',
    tag: 'Wellness',
    category: 'Wellness',
    statusBadge: 'Membership Auto-Debited',
    paidWith: 'SBI Debit',
    dateTime: 'Friday, 07:30',
    amount: 1500.00,
    icon: 'fitness_center',
    dateGroup: 'Friday, October 25',
    dateKey: '2026-10-25',
    time: '07:30 AM',
  },
  {
    id: 'nb-5',
    title: 'Blue Tokai Coffee • Subscription Batch',
    subtitle: '500g Attikan Estate whole beans • HDFC UPI • 09:20 AM',
    tag: 'Dining',
    category: 'Dining',
    statusBadge: 'Invoice #BT-9021',
    paidWith: 'HDFC UPI',
    dateTime: 'Friday, 09:20',
    amount: 878.40,
    icon: 'local_cafe',
    dateGroup: 'Friday, October 25',
    dateKey: '2026-10-25',
    time: '09:20 AM',
  },
];

export const DAY_LEDGER_CONFIGS: Record<string, Omit<DayLedgerData, 'entries'>> = {
  '2026-10-28': {
    dateKey: '2026-10-28',
    dateLabel: 'Today, October 28',
    formattedDate: 'Oct 28, 2026',
    inflow: 5200.00,
    inflowDelta: 1400.00,
    inflowPercent: 37,
    yesterdayInflow: 3800.00,
    inflowNote: 'Yesterday: ₹3,800.00 • Consulting tranche & Yield',
    outflow: 3450.00,
    outflowDelta: 1560.00,
    outflowPercent: 83,
    yesterdayOutflow: 1890.00,
    targetCeiling: 4000.00,
    netVelocity: 1750.00,
  },
  '2026-10-27': {
    dateKey: '2026-10-27',
    dateLabel: 'Sunday, October 27',
    formattedDate: 'Oct 27, 2026',
    inflow: 3800.00,
    inflowDelta: 800.00,
    inflowPercent: 26,
    yesterdayInflow: 3000.00,
    inflowNote: 'Yield distribution from Bond Portfolio A',
    outflow: 3450.00,
    outflowDelta: 600.00,
    outflowPercent: 21,
    yesterdayOutflow: 2850.00,
    targetCeiling: 4000.00,
    netVelocity: 350.00,
  },
  '2026-10-25': {
    dateKey: '2026-10-25',
    dateLabel: 'Friday, October 25',
    formattedDate: 'Oct 25, 2026',
    inflow: 4500.00,
    inflowDelta: 500.00,
    inflowPercent: 12,
    yesterdayInflow: 4000.00,
    inflowNote: 'Client retainer disbursement tranche',
    outflow: 2378.40,
    outflowDelta: -420.00,
    outflowPercent: -15,
    yesterdayOutflow: 2798.40,
    targetCeiling: 4000.00,
    netVelocity: 2121.60,
  },
};
