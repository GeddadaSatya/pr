'use client';

import React from 'react';
import { FinanceProvider } from '@/components/context/finance-context';
import { VersionTrackingView } from '@/components/dashboard/version-tracking-view';

export default function ReleaseNotesPage() {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-[#fafbfd] p-3 md:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          <VersionTrackingView />
        </div>
      </div>
    </FinanceProvider>
  );
}
