import { NextResponse } from 'next/server';
import { INITIAL_EXPENSES } from '@/lib/mock-data';
import { ExpenseItem } from '@/lib/types';

// In-memory server store for local API operations
let serverExpenses: ExpenseItem[] = [...INITIAL_EXPENSES];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  let results = [...serverExpenses];

  if (category && category !== 'all') {
    results = results.filter((e) => e.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    results = results.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        (e.subtitle && e.subtitle.toLowerCase().includes(s)) ||
        e.paidWith.toLowerCase().includes(s)
    );
  }

  return NextResponse.json({ success: true, count: results.length, data: results });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid expense payload' }, { status: 400 });
    }

    const newExpense: ExpenseItem = {
      id: body.id || `exp-${Date.now()}`,
      title: body.title,
      subtitle: body.subtitle || 'Executive expense record',
      category: body.category || 'Miscellaneous',
      categoryColor: body.categoryColor || '#d4af37',
      paidWith: body.paidWith || 'Bank Transfer',
      dateTime: body.dateTime || 'Today, Just now',
      dateKey: body.dateKey || new Date().toISOString().slice(0, 10),
      amount: body.amount,
      receiptUrl: body.receiptUrl,
      tag: body.tag || `#${(body.category || 'General').split(' ')[0]}`,
      statusBadge: 'Verified Receipt',
      icon: body.icon || 'receipt_long',
      dateGroup: 'Today',
    };

    serverExpenses = [newExpense, ...serverExpenses];
    return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID parameter is required' }, { status: 400 });
  }

  serverExpenses = serverExpenses.filter((e) => e.id !== id);
  return NextResponse.json({ success: true, message: `Expense ${id} deleted` });
}
