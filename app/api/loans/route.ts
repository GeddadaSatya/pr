import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server-client';
import { BorrowerLoan } from '@/lib/types';

let localBorrowers: BorrowerLoan[] = [];

export async function GET() {
  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('borrowers').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped: BorrowerLoan[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          initials: d.initials,
          avatarBg: d.avatar_bg,
          avatarText: d.avatar_text,
          contactOrNote: d.contact_or_note,
          phone: d.phone,
          address: d.address,
          borrowerId: d.borrower_id,
          principalAmount: parseFloat(d.principal_amount) || 0,
          paymentMode: d.payment_mode,
          paymentModeIcon: d.payment_mode_icon,
          dateGiven: d.date_given,
          interestRate: parseFloat(d.interest_rate) || 0,
          interestRatePeriod: d.interest_rate_period,
          payoutFrequency: d.payout_frequency,
          tenureMonths: d.tenure_months,
          termLabel: d.term_label,
          nextDueDate: d.next_due_date,
          nextDueAmount: parseFloat(d.next_due_amount) || 0,
          dueCountdownText: d.due_countdown_text,
          dueCountdownType: d.due_countdown_type,
          receivedAmount: parseFloat(d.received_amount) || 0,
          totalReceivable: parseFloat(d.total_receivable) || 0,
          progressPercent: d.progress_percent,
          status: d.status,
          statusLabel: d.status_label,
          contractType: d.contract_type,
        }));
        return NextResponse.json({ success: true, count: mapped.length, data: mapped });
      }
    } catch {}
  }

  return NextResponse.json({ success: true, count: localBorrowers.length, data: localBorrowers });
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
      statusLabel: 'Active & Paying',
      contractType: body.contractType || 'Promissory Note',
    };

    const supabase = getAdminSupabase();
    if (supabase) {
      try {
        await supabase.from('borrowers').insert({
          name: newBorrower.name,
          initials: newBorrower.initials,
          contact_or_note: newBorrower.contactOrNote,
          phone: newBorrower.phone,
          address: newBorrower.address,
          borrower_id: newBorrower.borrowerId,
          principal_amount: newBorrower.principalAmount,
          payment_mode: newBorrower.paymentMode,
          date_given: newBorrower.dateGiven,
          interest_rate: newBorrower.interestRate,
          interest_rate_period: newBorrower.interestRatePeriod,
          tenure_months: newBorrower.tenureMonths,
          term_label: newBorrower.termLabel,
          next_due_date: newBorrower.nextDueDate,
          next_due_amount: newBorrower.nextDueAmount,
          total_receivable: newBorrower.totalReceivable,
          status: newBorrower.status,
          status_label: newBorrower.statusLabel,
          contract_type: newBorrower.contractType,
        });
      } catch {}
    }

    localBorrowers = [newBorrower, ...localBorrowers];
    return NextResponse.json({ success: true, data: newBorrower }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
