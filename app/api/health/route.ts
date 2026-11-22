import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PR ExpenseTracker & Sovereign Wealth Engine',
    version: '1.0.0',
    database: 'supabase-ready',
  });
}
