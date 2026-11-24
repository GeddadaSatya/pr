import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server-client';
import { ExpenseItem } from '@/lib/types';

// In-memory fallback cache
let localExpenses: ExpenseItem[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      let query = supabase.from('expenses').select('*').order('created_at', { ascending: false });
      if (category && category !== 'all') {
        query = query.ilike('category', `%${category}%`);
      }
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const mapped: ExpenseItem[] = data.map((d: any) => ({
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
        return NextResponse.json({ success: true, count: mapped.length, data: mapped });
      }
    } catch {}
  }

  let results = [...localExpenses];
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

    const today = new Date();
    const newExpense: ExpenseItem = {
      id: body.id || `exp-${Date.now()}`,
      title: body.title,
      subtitle: body.subtitle || 'Executive expense record',
      category: body.category || 'Miscellaneous',
      categoryColor: body.categoryColor || '#d4af37',
      paidWith: body.paidWith || 'Bank Transfer',
      dateTime: body.dateTime || 'Today, Just now',
      dateKey: body.dateKey || today.toISOString().slice(0, 10),
      amount: body.amount,
      receiptUrl: body.receiptUrl,
      tag: body.tag || `#${(body.category || 'General').split(' ')[0]}`,
      statusBadge: body.statusBadge || 'Verified Receipt',
      icon: body.icon || 'receipt_long',
    };

    const supabase = getAdminSupabase();
    if (supabase) {
      try {
        await supabase.from('expenses').insert({
          title: newExpense.title,
          subtitle: newExpense.subtitle,
          category: newExpense.category,
          category_color: newExpense.categoryColor,
          paid_with: newExpense.paidWith,
          amount: newExpense.amount,
          receipt_url: newExpense.receiptUrl,
          tag: newExpense.tag,
          status_badge: newExpense.statusBadge,
          icon: newExpense.icon,
          date_time: newExpense.dateTime,
          date_key: newExpense.dateKey,
        });
      } catch {}
    }

    localExpenses = [newExpense, ...localExpenses];
    return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
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

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      await supabase.from('expenses').delete().eq('id', id);
    } catch {}
  }

  localExpenses = localExpenses.filter((e) => e.id !== id);
  return NextResponse.json({ success: true, message: 'Expense deleted successfully' });
}
