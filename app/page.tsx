'use client';

import React, { useState } from 'react';
import { FinanceProvider } from '@/components/context/finance-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileHeader } from '@/components/layout/mobile-header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CommandStrip } from '@/components/dashboard/command-strip';
import { KpiCarousel } from '@/components/dashboard/kpi-carousel';
import { DailyFlowKpi } from '@/components/dashboard/daily-flow-kpi';
import { CategoryAnalytics } from '@/components/dashboard/category-analytics';
import { ExpenseTable } from '@/components/dashboard/expense-table';
import { PayablesLoansHub } from '@/components/dashboard/payables-loans-hub';
import { PayablesDuesView } from '@/components/dashboard/payables-dues-view';
import { LoansInterestView } from '@/components/dashboard/loans-interest-view';
import { ExpenseNotebookView } from '@/components/dashboard/expense-notebook-view';
import { DayLedgerView } from '@/components/dashboard/day-ledger-view';
import { AssetsHoldingsView } from '@/components/dashboard/assets-holdings-view';
import { TransactionModal } from '@/components/modals/transaction-modal';
import { AuthModal } from '@/components/modals/auth-modal';
import { PrivacyUnlockModal } from '@/components/modals/privacy-unlock-modal';
import { SearchModal } from '@/components/modals/search-modal';
import { NotificationsDrawer } from '@/components/modals/notifications-drawer';

import { useFinance } from '@/components/context/finance-context';
import { createClient } from '@/utils/supabase/client';

function DashboardContent() {
  const { activeTab, setActiveTab, isCollapsed } = useFinance();
  const [previousTab, setPreviousTab] = useState<'overview' | 'expenses'>('expenses');
  const todayDateKey = new Date().toISOString().slice(0, 10);
  const [selectedDateKey, setSelectedDateKey] = useState(todayDateKey);

  // Recovery Interceptor: If user arrives at root with password recovery tokens, immediately forward to /reset-password
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    const search = window.location.search;

    if (hash.includes('type=recovery') || search.includes('type=recovery')) {
      window.location.href = `/reset-password${hash || search}`;
      return;
    }

    try {
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          window.location.href = '/reset-password';
        }
      });
      return () => subscription.unsubscribe();
    } catch {}
  }, []);

  const handleOpenDayLedger = (dateKey: string = todayDateKey) => {
    setPreviousTab(activeTab === 'expenses' ? 'expenses' : 'overview');
    setSelectedDateKey(dateKey);
    setActiveTab('day-ledger');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Mobile Top Header (< 780px) */}
      <MobileHeader />

      {/* Fixed Left Sidebar (>= 780px) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className={`pl-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'md:pl-20' : 'md:pl-60'}`}>
        {/* Top Floating Glass Header (>= 780px) */}
        <Header />

        {/* Dashboard Main Canvas */}
        <main className="w-full pt-20 pb-28 md:pt-20 md:pb-12 bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col w-full px-4 md:px-0 md:w-[80%] mx-auto gap-5 md:gap-6">
            {activeTab === 'expenses' ? (
              <ExpenseNotebookView onOpenDayLedger={handleOpenDayLedger} />
            ) : activeTab === 'day-ledger' ? (
              <DayLedgerView
                selectedDateKey={selectedDateKey}
                onBack={() => {
                  setActiveTab(previousTab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                previousTabTitle={previousTab === 'overview' ? 'Overview & Net Worth' : 'Expense Notebook'}
                onDateChange={(dateKey) => setSelectedDateKey(dateKey)}
              />
            ) : activeTab === 'payables' ? (
              <PayablesDuesView />
            ) : activeTab === 'lending' ? (
              <LoansInterestView />
            ) : activeTab === 'assets' ? (
              <AssetsHoldingsView />
            ) : (
              <>
                {/* Top Command Strip & Greeting */}
                <CommandStrip />

                {/* Key Wealth Indicators (Carousel of 4 KPI cards) */}
                <KpiCarousel />

                {/* Daily Inflow & Outflow Pulse */}
                <DailyFlowKpi onOpenDayLedger={() => handleOpenDayLedger(todayDateKey)} />

                {/* Recent Daily Expenses Table (Filterable & Exportable) */}
                <ExpenseTable />

                {/* Spending Breakdown by Category (Donut chart & Sector list) */}
                <CategoryAnalytics />

                {/* Operational Grid: Payables (Action Center) & Loans Ledger */}
                <PayablesLoansHub />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Scooped Bottom Navigation Dock & Quick Action Modal (< 780px) */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Interactive Modals */}
      <TransactionModal />
      <AuthModal />
      <PrivacyUnlockModal />
      <SearchModal />
      <NotificationsDrawer />
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
