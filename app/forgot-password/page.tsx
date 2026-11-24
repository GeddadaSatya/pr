'use client';

import React, { Suspense } from 'react';
import { UnifiedAuthContainer } from '@/app/login/page';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#bf801f] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <UnifiedAuthContainer defaultMode="forgot" />
    </Suspense>
  );
}
