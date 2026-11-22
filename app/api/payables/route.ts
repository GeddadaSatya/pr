import { NextResponse } from 'next/server';
import { INITIAL_PAYABLES } from '@/lib/mock-data';
import { PayableItem } from '@/lib/types';

let serverPayables: PayableItem[] = [...INITIAL_PAYABLES];

export async function GET() {
  return NextResponse.json({ success: true, count: serverPayables.length, data: serverPayables });
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

    serverPayables = [newPayable, ...serverPayables];
    return NextResponse.json({ success: true, data: newPayable }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    if (action === 'settle') {
      let settledItem: PayableItem | null = null;
      serverPayables = serverPayables.map((p) => {
        if (p.id === id) {
          settledItem = { ...p, status: 'paid', statusLabel: 'Settled', settledAt: new Date().toISOString() };
          return settledItem;
        }
        return p;
      });
      return NextResponse.json({ success: true, message: `Payable ${id} settled`, data: settledItem });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
  }

  serverPayables = serverPayables.filter((p) => p.id !== id);
  return NextResponse.json({ success: true, message: `Payable ${id} deleted` });
}
