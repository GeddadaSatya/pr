import { test, expect } from '@playwright/test';

test.describe('Next.js App Router Backend API Endpoints', () => {
  test('GET /api/health returns 200 OK and healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.service).toContain('PR ExpenseTracker');
  });

  test('GET /api/expenses returns list of expense items', async ({ request }) => {
    const response = await request.get('/api/expenses');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    const first = data.data[0];
    expect(first.id).toBeDefined();
    expect(first.title).toBeDefined();
    expect(typeof first.amount).toBe('number');
  });

  test('POST /api/expenses creates a new expense with validation', async ({ request }) => {
    const newExpense = {
      title: 'Automated QA Test Dinner',
      subtitle: 'Client Hospitality Session',
      category: 'Dining',
      amount: 4500,
      paidWith: 'Corporate Card',
    };
    const response = await request.post('/api/expenses', { data: newExpense });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('Automated QA Test Dinner');
    expect(data.data.amount).toBe(4500);
  });

  test('POST /api/expenses rejects invalid payload with 400', async ({ request }) => {
    const invalidExpense = {
      title: '', // Missing title
      amount: -100, // Invalid negative amount
    };
    const response = await request.post('/api/expenses', { data: invalidExpense });
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test('GET /api/payables returns bills with pending and paid counts', async ({ request }) => {
    const response = await request.get('/api/payables');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data.some((p: any) => p.status === 'pending')).toBe(true);
  });

  test('PUT /api/payables marks bill as settled', async ({ request }) => {
    // First fetch payables to get a valid ID
    const getRes = await request.get('/api/payables');
    const payablesRes = await getRes.json();
    const pending = payablesRes.data.find((p: any) => p.status === 'pending');
    expect(pending).toBeDefined();

    const settleRes = await request.put('/api/payables', {
      data: {
        action: 'settle',
        id: pending.id,
      },
    });
    expect(settleRes.status()).toBe(200);
    const settleData = await settleRes.json();
    expect(settleData.success).toBe(true);
    expect(settleData.data.status).toBe('paid');
  });

  test('GET /api/loans returns borrowers and lending registry', async ({ request }) => {
    const response = await request.get('/api/loans');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    const borrower = data.data[0];
    expect(borrower.name).toBeDefined();
    expect(typeof borrower.principalAmount).toBe('number');
  });

  test('GET /api/assets returns asset holdings and net worth breakdown', async ({ request }) => {
    const response = await request.get('/api/assets');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    const totalValuation = data.data.reduce((sum: number, a: any) => sum + a.valuation, 0);
    expect(totalValuation).toBeGreaterThan(0);
  });

  test('POST /api/assets creates and updates asset valuation', async ({ request }) => {
    // 1. Create asset
    const newAsset = {
      name: 'QA Test Sovereign Gold Sovereign',
      category: 'Bullion & Precious Metals',
      institution: 'Brinks Vault Zurich',
      valuation: 50000,
      annualYieldRate: 4.5,
      liquidityTier: 'High',
    };
    const createRes = await request.post('/api/assets', { data: newAsset });
    expect(createRes.status()).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    const createdId = createData.data.id;

    // 2. Update valuation
    const updateRes = await request.put('/api/assets', {
      data: { id: createdId, valuation: 55000 },
    });
    expect(updateRes.status()).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);
    expect(updateData.data.valuation).toBe(55000);
  });

  test('GET /api/notifications returns activity feed', async ({ request }) => {
    const response = await request.get('/api/notifications');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
