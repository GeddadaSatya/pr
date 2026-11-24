import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PR ExpenseTracker & Sovereign Wealth Engine',
    version: '2.4.1',
    database: 'supabase-ready',
  });
}
