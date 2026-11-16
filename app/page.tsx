'use client';

import React, { useState } from 'react';
import { FinanceProvider } from '@/components/context/finance-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { CommandStrip } from '@/components/dashboard/command-strip';
import { KpiCarousel } from '@/components/dashboard/kpi-carousel';
import { CategoryAnalytics } from '@/components/dashboard/category-analytics';
import { ExpenseTable } from '@/components/dashboard/expense-table';
import { PayablesLoansHub } from '@/components/dashboard/payables-loans-hub';
import { TransactionModal } from '@/components/modals/transaction-modal';
import { AuthModal } from '@/components/modals/auth-modal';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Fixed Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="pl-72">
        {/* Top Floating Glass Header */}
        <Header />

        {/* Dashboard Main Canvas */}
        <main className="w-full px-8 pb-12 pt-20 bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col w-full gap-6 max-w-7xl mx-auto">
            {/* Top Command Strip & Greeting */}
            <CommandStrip />

            {/* Key Wealth Indicators (Carousel of 4 KPI cards) */}
            <KpiCarousel />

            {/* Spending Breakdown by Category (Donut chart & Sector list) */}
            <CategoryAnalytics />

            {/* Recent Daily Expenses Table (Filterable & Exportable) */}
            <ExpenseTable />

            {/* Operational Grid: Payables (Action Center) & Loans Ledger */}
            <PayablesLoansHub />
          </div>
        </main>
      </div>

      {/* Interactive Modals */}
      <TransactionModal />
      <AuthModal />
    </div>
  );
}

export default function Home() {
  return (
    <FinanceProvider>
      <DashboardContent />
    </FinanceProvider>
  );
}
