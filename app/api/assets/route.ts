import { NextResponse } from 'next/server';
import { INITIAL_ASSETS } from '@/lib/mock-data';
import { AssetHolding } from '@/lib/types';

let serverAssets: AssetHolding[] = [...INITIAL_ASSETS];

export async function GET() {
  return NextResponse.json({ success: true, count: serverAssets.length, data: serverAssets });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || typeof body.valuation !== 'number' || body.valuation <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid asset holding payload' }, { status: 400 });
    }

    const yieldRate = body.annualYieldRate || 0;
    const monthlyYield = (body.valuation * (yieldRate / 100)) / 12;

    const newAsset: AssetHolding = {
      id: body.id || `asset-${Date.now()}`,
      name: body.name,
      category: body.category || 'Liquid Cash & Banking',
      institution: body.institution || 'Sovereign Custody',
      valuation: body.valuation,
      annualYieldRate: yieldRate,
      monthlyYield,
      liquidityTier: body.liquidityTier || 'Instant',
      accountRef: body.accountRef || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      lastValuationDate: new Date().toISOString().slice(0, 10),
      notes: body.notes || 'Asset holding recorded into Sovereign Vault.',
    };

    serverAssets = [newAsset, ...serverAssets];
    return NextResponse.json({ success: true, data: newAsset }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, valuation } = body;
    if (!id || typeof valuation !== 'number' || valuation <= 0) {
      return NextResponse.json({ success: false, error: 'Valid ID and valuation are required' }, { status: 400 });
    }

    let updatedAsset: AssetHolding | null = null;
    serverAssets = serverAssets.map((a) => {
      if (a.id === id) {
        const monthlyYield = (valuation * (a.annualYieldRate / 100)) / 12;
        updatedAsset = {
          ...a,
          valuation,
          monthlyYield,
          lastValuationDate: new Date().toISOString().slice(0, 10),
        };
        return updatedAsset;
      }
      return a;
    });

    if (!updatedAsset) {
      return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedAsset });
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

  serverAssets = serverAssets.filter((a) => a.id !== id);
  return NextResponse.json({ success: true, message: `Asset ${id} deleted` });
}
