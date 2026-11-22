import { NextResponse } from 'next/server';
import { INITIAL_BORROWERS } from '@/lib/mock-data';
import { BorrowerLoan } from '@/lib/types';

let serverBorrowers: BorrowerLoan[] = [...INITIAL_BORROWERS];

export async function GET() {
  return NextResponse.json({ success: true, count: serverBorrowers.length, data: serverBorrowers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || typeof body.principalAmount !== 'number' || body.principalAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid borrower loan payload' }, { status: 400 });
    }

    const words = body.name.trim().split(' ');
    const initials =
      words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : words[0].slice(0, 2).toUpperCase();

    const rate = body.interestRate || 10.0;
    const tenure = body.tenureMonths || 12;
    const interest = body.interestRatePeriod === '/ month'
      ? (body.principalAmount * (rate / 100)) * tenure
      : body.principalAmount * (rate / 100);
    const totalReceivable = body.principalAmount + interest;

    const newBorrower: BorrowerLoan = {
      id: body.id || `borrower-${Date.now()}`,
      name: body.name,
      initials,
      avatarBg: 'bg-[#0f172a]',
      avatarText: 'text-[#d4af37]',
      contactOrNote: body.contactOrNote || 'Active Promissory Contract',
      phone: body.phone || '+91 98000 00000',
      address: body.address || 'Executive Client Address',
      borrowerId: `LN-${Math.floor(10000 + Math.random() * 90000)}`,
      principalAmount: body.principalAmount,
      paymentMode: body.paymentMode || 'Bank / UPI Transfer',
      paymentModeIcon: 'account_balance',
      dateGiven: body.dateGiven || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      interestRate: rate,
      interestRatePeriod: body.interestRatePeriod || 'flat rate',
      payoutFrequency: body.payoutFrequency || 'Monthly Interest Payout',
      tenureMonths: tenure,
      termLabel: `${tenure}-Month Term`,
      nextDueDate: body.nextDueDate || 'Dec 15, 2026',
      nextDueAmount: Math.round(totalReceivable / tenure),
      dueCountdownText: 'Upcoming Cycle',
      dueCountdownType: 'normal',
      receivedAmount: 0,
      totalReceivable,
      progressPercent: 0,
      status: 'active',
      statusLabel: 'Active & Disbursed',
      contractType: body.contractType || 'Promissory Note',
      priorityTag: 'Active Advance',
      settlementChannel: body.paymentMode || 'Direct Wire',
      totalSanctioned: body.principalAmount,
      outstandingBalance: totalReceivable,
      repaymentPacing: '0.0%',
      lifetimeCollected: 0,
    };

    serverBorrowers = [newBorrower, ...serverBorrowers];
    return NextResponse.json({ success: true, data: newBorrower }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action, amount } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    if (action === 'repayment') {
      const repaymentAmount = Number(amount) || 0;
      serverBorrowers = serverBorrowers.map((b) => {
        if (b.id === id) {
          const nextReceived = Math.min(b.totalReceivable, b.receivedAmount + repaymentAmount);
          const percent = Math.min(100, Math.round((nextReceived / b.totalReceivable) * 100));
          return {
            ...b,
            receivedAmount: nextReceived,
            progressPercent: percent,
            status: percent >= 100 ? 'paid' : b.status,
            statusLabel: percent >= 100 ? 'Fully Settled' : b.statusLabel,
            outstandingBalance: Math.max(0, b.totalReceivable - nextReceived),
            lifetimeCollected: (b.lifetimeCollected || 0) + repaymentAmount,
          };
        }
        return b;
      });
      return NextResponse.json({ success: true, message: `Repayment recorded for ${id}` });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
