import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server-client';
import { PayableItem } from '@/lib/types';

let localPayables: PayableItem[] = [];

export async function GET() {
  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('payables').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped: PayableItem[] = data.map((d: any) => ({
          id: d.id,
          creditorName: d.creditor_name,
          invoiceNote: d.invoice_note,
          amount: parseFloat(d.amount) || 0,
          dueDate: d.due_date,
          urgencyBadge: d.urgency_badge,
          category: d.category,
          beneficiarySub: d.beneficiary_sub,
          fullDueDate: d.full_due_date,
          dueDateUrgency: d.due_date_urgency,
          disbursementRoute: d.disbursement_route,
          statusLabel: d.status_label,
          actionLabel: d.action_label,
          status: d.status,
          settledAt: d.settled_at,
        }));
        return NextResponse.json({ success: true, count: mapped.length, data: mapped });
      }
    } catch {}
  }

  return NextResponse.json({ success: true, count: localPayables.length, data: localPayables });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.creditorName || typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid payable payload' }, { status: 400 });
    }

    const newPayable: PayableItem = {
      id: body.id || `pay-${Date.now()}`,
      creditorName: body.creditorName,
      invoiceNote: body.invoiceNote || 'Vendor commitment',
      amount: body.amount,
      dueDate: body.dueDate || 'Nov 15',
      fullDueDate: body.fullDueDate || 'Nov 15, 2026',
      urgencyBadge: body.urgencyBadge || 'Due Soon',
      category: body.category || 'Vendor Liability',
      beneficiarySub: body.beneficiarySub || 'Accounts Payable',
      disbursementRoute: body.disbursementRoute || 'Direct Wire (HDFC)',
      statusLabel: 'Pending',
      actionLabel: 'Settle Now',
      status: 'pending',
    };

    const supabase = getAdminSupabase();
    if (supabase) {
      try {
        await supabase.from('payables').insert({
          creditor_name: newPayable.creditorName,
          invoice_note: newPayable.invoiceNote,
          amount: newPayable.amount,
          due_date: newPayable.dueDate,
          full_due_date: newPayable.fullDueDate,
          urgency_badge: newPayable.urgencyBadge,
          category: newPayable.category,
          beneficiary_sub: newPayable.beneficiarySub,
          disbursement_route: newPayable.disbursementRoute,
          status_label: newPayable.statusLabel,
          action_label: newPayable.actionLabel,
          status: newPayable.status,
        });
      } catch {}
    }

    localPayables = [newPayable, ...localPayables];
    return NextResponse.json({ success: true, data: newPayable }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
