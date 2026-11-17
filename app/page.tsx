'use client';

import React, { useState } from 'react';
import { FinanceProvider } from '@/components/context/finance-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileHeader } from '@/components/layout/mobile-header';
import { MobileNav } from '@/components/layout/mobile-nav';
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
      {/* Mobile Top Header (< 780px) */}
      <MobileHeader />

      {/* Fixed Left Sidebar (>= 780px) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="pl-0 md:pl-72">
        {/* Top Floating Glass Header (>= 780px) */}
        <Header />

        {/* Dashboard Main Canvas */}
        <main className="w-full pt-20 pb-28 md:pt-20 md:pb-12 bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col w-full px-4 md:px-0 md:w-[88%] mx-auto gap-5 md:gap-6">
            {/* Top Command Strip & Greeting */}
            <CommandStrip />

            {/* Key Wealth Indicators (Carousel of 4 KPI cards) */}
            <KpiCarousel />

            {/* Spending Breakdown by Category (Donut chart & Sector list) */}
            <CategoryAnalytics />

            {/* Operational Grid: Payables (Action Center) & Loans Ledger */}
            <PayablesLoansHub />

            {/* Recent Daily Expenses Table (Filterable & Exportable) */}
            <ExpenseTable />
          </div>
        </main>
      </div>

      {/* Scooped Bottom Navigation Dock & Quick Action Modal (< 780px) */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

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
