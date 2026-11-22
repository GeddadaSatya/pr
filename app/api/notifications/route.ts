import { NextResponse } from 'next/server';
import { INITIAL_NOTIFICATIONS } from '@/lib/mock-data';
import { NotificationItem } from '@/lib/types';

let serverNotifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

export async function GET() {
  return NextResponse.json({ success: true, count: serverNotifications.length, data: serverNotifications });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (action === 'mark_all_read') {
      serverNotifications = serverNotifications.map((n) => ({ ...n, read: true }));
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (id) {
      serverNotifications = serverNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return NextResponse.json({ success: true, message: `Notification ${id} marked as read` });
    }

    return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
