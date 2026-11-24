'use client';

import React, { useState } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { AppBreadcrumb } from '@/components/ui/app-breadcrumb';

interface VersionRelease {
  version: string;
  tag: string;
  isLatest?: boolean;
  publishedDate: string;
  readTime: string;
  title: string;
  summary: string;
  subversionNotes: string;
  subsystems: {
    title: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    modulePath: string;
    changes: {
      type: 'Feature' | 'Improvement' | 'Security' | 'Fix' | 'Currency';
      typeBg: string;
      typeText: string;
      label: string;
      description: string;
    }[];
  }[];
}

const RELEASES: VersionRelease[] = [
  {
    version: 'v2.4.1',
    tag: 'Latest — Universal In-Place Edit System & Security Refinements',
    isLatest: true,
    publishedDate: 'Nov 24, 2026',
    readTime: '3 minute read',
    title: 'Release Notes: Version 2.4.1 — Universal Entry Edit System & Security Refinements',
    summary:
      'Version 2.4.1 is a major capability release introducing universal in-place editing across every single transaction and all ledger categories (Expenses, Payables, Loans, and Assets). Furthermore, this patch fortifies Privacy Mode with generous cursor whitespace around key icons, mandatory account password authorization before configuring or updating custom PINs, and dynamic state-aware button labeling with instant re-authentication.',
    subversionNotes: 'v2.4.1-patch & v2.4.0-rc2 • Verified against Ledger Integrity Spec 2.0',
    subsystems: [
      {
        title: '1. Universal In-Place Entry Editing Across All Categories',
        icon: 'edit_note',
        iconColor: 'text-[#9a761e]',
        iconBg: 'bg-[#fef9e7]',
        modulePath: 'module/universal-edit-engine',
        changes: [
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'Expense Notebook & Table Editing:',
            description:
              'Clicking the edit pencil icon opens the dedicated editor for Merchant/Title, Subtitle/Note, Amount (₹), Category, Paid With, Date, and Time label.',
          },
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'Payables & Dues Editing:',
            description:
              'Full editing for Creditor/Vendor Name, Bill Amount, Due Date, Category, Invoice Note, Urgency Badge, and Status (Pending or Settled). Available both in the ledger table and directly inside the Settle dialog.',
          },
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'Promissory Loans & Borrower Terms:',
            description:
              'Borrower Name, Principal Amount, Annual Interest Rate (% p.a.), Contact Phone, Next Due Date, and Note are fully modifiable in-place and within the Dossier view, with dynamic recalculation of monthly yield.',
          },
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'Total Assets & Holdings Editing:',
            description:
              'Replaced legacy valuation-only prompt with universal editor modifying Asset Name, Category (Liquid Cash, Bullion, Bonds, Real Estate, Alternative), Verified Valuation, Annual Yield Rate, Custodian/Broker, and Account Reference.',
          },
        ],
      },
      {
        title: '2. Privacy Security & PIN Authorization Engine',
        icon: 'lock',
        iconColor: 'text-purple-700',
        iconBg: 'bg-purple-50',
        modulePath: 'module/privacy-vault-auth',
        changes: [
          {
            type: 'Security',
            typeBg: 'bg-purple-100',
            typeText: 'text-purple-800',
            label: 'Account Password Verification for PIN Setup:',
            description:
              'Users are required to confirm their real Supabase account password before setting or updating a custom PIN, preventing unauthorized PIN alterations.',
          },
          {
            type: 'Improvement',
            typeBg: 'bg-blue-100',
            typeText: 'text-blue-800',
            label: 'Generous Key Icon Cursor Spacing:',
            description:
              'Expanded input left padding to pl-12 (48px) with 16px+ whitespace, preventing the text cursor from colliding with the decorative key symbol.',
          },
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'Dynamic State-Aware Button Wording:',
            description:
              'Button dynamically indicates "Set Custom PIN" when default, and switches to "Change PIN" once active, enabling immediate direct PIN changes with password verification without needing the old PIN.',
          },
        ],
      },
      {
        title: '3. Authentication Form Password Visibility Toggles',
        icon: 'visibility',
        iconColor: 'text-sky-700',
        iconBg: 'bg-sky-50',
        modulePath: 'module/auth-eye-toggles',
        changes: [
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'Interactive Eye Symbols Across All Forms:',
            description:
              'Unified show/hide password toggle buttons across Login, Create Account (Password & Confirm), Forgot Password, and Reset Password views.',
          },
          {
            type: 'Fix',
            typeBg: 'bg-amber-100',
            typeText: 'text-amber-800',
            label: 'Right-Padding Collision Fix:',
            description:
              'Applied pr-11 padding on password input fields to prevent typed passwords and browser autofill icons from overlapping the eye toggle button.',
          },
        ],
      },
    ],
  },
  {
    version: 'v2.4.0',
    tag: 'Sovereign Core & Ledger Refinements',
    publishedDate: 'Nov 18, 2026',
    readTime: '3 minute read',
    title: 'Release Notes: Version 2.4.0 — Sovereign Core & Ledger Refinements',
    summary:
      'Version 2.4.0 introduces the comprehensive Sovereign Core engine update for PERSONAL Tracker. This release standardizes Indian Rupee (₹) baseline calculations across all vaults, delivers a zero-latency toggle between compact Table and immersive Card views for personal lending, embeds granular Day-by-Day ledger verification, and bolsters device-level cryptographic authentication.',
    subversionNotes: 'v2.4.0-rc2 & v2.3.9 • Verified against Ledger Integrity Spec 1.9',
    subsystems: [
      {
        title: '1. Lending & Interest Ledger Viewport Switcher',
        icon: 'payments',
        iconColor: 'text-amber-700',
        iconBg: 'bg-amber-50',
        modulePath: 'module/lending-ledger',
        changes: [
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'Dual Viewport Switcher:',
            description:
              'High-contrast toggle between dense accounting table view and responsive visual loan debtor cards with progressive interest status indicators.',
          },
          {
            type: 'Improvement',
            typeBg: 'bg-blue-100',
            typeText: 'text-blue-800',
            label: 'Compound vs Flat Interest Calculator:',
            description:
              'Streamlined interest accrual formulas; auto-generates month-by-month projection schedule for personal loans given to peers and family.',
          },
          {
            type: 'Currency',
            typeBg: 'bg-slate-100',
            typeText: 'text-slate-700',
            label: '₹ (INR) Currency Precision:',
            description:
              'Normalized Indian numeric format (Lakhs and Crores: 1,00,000.00) directly in principal summary cards.',
          },
        ],
      },
      {
        title: '2. Expense Notebook & 7-Preset Universal Date Filter',
        icon: 'calendar_month',
        iconColor: 'text-slate-700',
        iconBg: 'bg-slate-100',
        modulePath: 'module/expense-notebook',
        changes: [
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'Universal 7-Preset Date Filter:',
            description:
              'Quickly filter records by All Dates, Today, Yesterday, This Week, Last Week, This Month, and Last Month, plus Single Date and custom Date Range selection.',
          },
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'One-Click Day Audit Navigation:',
            description:
              'Clicking any daily spend pill instantly loads full transaction breakdowns with verified receipt tags and daily velocity pulse.',
          },
        ],
      },
      {
        title: '3. Payables, Recurring Dues & Settlement Hub',
        icon: 'schedule_send',
        iconColor: 'text-rose-700',
        iconBg: 'bg-rose-50',
        modulePath: 'module/payables-dues',
        changes: [
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'Custom Due-Date Horizon:',
            description:
              'Added status filtering for Due Soon (3 days), Scheduled ACH, and Settled history with smart urgency badges.',
          },
          {
            type: 'Security',
            typeBg: 'bg-purple-100',
            typeText: 'text-purple-800',
            label: 'Two-Step Settlement Confirmation:',
            description:
              'Requires dedicated review modal before disbursing payment or clearing vendor invoices.',
          },
        ],
      },
    ],
  },
  {
    version: 'v2.3.2',
    tag: 'Maintenance & Mobile Viewport Patch',
    publishedDate: 'Oct 30, 2026',
    readTime: '2 minute read',
    title: 'Release Notes: Version 2.3.2 — Mobile Viewport & Formatting Patch',
    summary:
      'Version 2.3.2 resolved edge-case viewport rendering glitches on mobile devices, optimized table column widths to prevent button wrapping, and enhanced touch targets across executive cards.',
    subversionNotes: 'v2.3.2-patch • Maintenance Release',
    subsystems: [
      {
        title: 'Mobile Layout & Responsive Fixes',
        icon: 'phone_iphone',
        iconColor: 'text-blue-700',
        iconBg: 'bg-blue-50',
        modulePath: 'module/mobile-responsive',
        changes: [
          {
            type: 'Fix',
            typeBg: 'bg-amber-100',
            typeText: 'text-amber-800',
            label: 'Text Wrapping Glitch Resolved:',
            description:
              'Fixed text-wrapping on 390px viewports for amounts exceeding six digits with nowrap styling.',
          },
          {
            type: 'Improvement',
            typeBg: 'bg-blue-100',
            typeText: 'text-blue-800',
            label: 'Touch Targets:',
            description:
              'Expanded mobile button hitboxes to minimum 44px to satisfy WCAG AA accessibility standards.',
          },
        ],
      },
    ],
  },
  {
    version: 'v2.3.0',
    tag: 'Multi-Currency & CSV/PDF Folio Export Engine',
    publishedDate: 'Oct 14, 2026',
    readTime: '4 minute read',
    title: 'Release Notes: Version 2.3.0 — Multi-Currency & Export Engine',
    summary:
      'Version 2.3.0 introduced sovereign PDF Folio report generation with printable executive styling, CSV and Excel two-way export/import with schema validation, and real-time ledger synchronization across devices.',
    subversionNotes: 'v2.3.0 • Major Feature Release',
    subsystems: [
      {
        title: 'Export & Folio Generation Hub',
        icon: 'picture_as_pdf',
        iconColor: 'text-red-700',
        iconBg: 'bg-red-50',
        modulePath: 'module/folio-export',
        changes: [
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'Client-Side PDF Generation:',
            description:
              'Generate printable financial statements with executive gold headers, signature blocks, and verified balance seals.',
          },
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'CSV Data Portability:',
            description:
              'Full export and import compatibility for external spreadsheets with auto-mapping of dates, categories, and amounts.',
          },
        ],
      },
    ],
  },
  {
    version: 'v2.2.0',
    tag: 'Biometric Auth, Privacy Mode & Passkey Infrastructure',
    publishedDate: 'Sep 22, 2026',
    readTime: '3 minute read',
    title: 'Release Notes: Version 2.2.0 — Privacy Mode & Passkey Architecture',
    summary:
      'Version 2.2.0 delivered Privacy Mode with sovereign obfuscation masks (••••••), preventing shoulder-surfing in public environments, alongside WebAuthn hardware key support.',
    subversionNotes: 'v2.2.0 • Security Milestone',
    subsystems: [
      {
        title: 'Privacy Masking & Zero-Knowledge Security',
        icon: 'security',
        iconColor: 'text-emerald-700',
        iconBg: 'bg-emerald-50',
        modulePath: 'module/privacy-security',
        changes: [
          {
            type: 'Security',
            typeBg: 'bg-purple-100',
            typeText: 'text-purple-800',
            label: 'Sovereign Privacy Obfuscation:',
            description:
              'Toggle instant numerical masking across all balances, KPI tiles, transaction amounts, and interest yields.',
          },
          {
            type: 'Security',
            typeBg: 'bg-purple-100',
            typeText: 'text-purple-800',
            label: 'Local PIN & Passkey Vault:',
            description:
              'Biometric and PIN challenge gate required before revealing sensitive wealth numbers.',
          },
        ],
      },
    ],
  },
  {
    version: 'v2.0.0',
    tag: 'Major: Sovereign Engine Architecture Launch',
    publishedDate: 'Aug 01, 2026',
    readTime: '5 minute read',
    title: 'Release Notes: Version 2.0.0 — Sovereign Engine Architecture Launch',
    summary:
      'The initial sovereign foundation launch: Next.js 16 App Router, Turbopack, Tailwind CSS typography, Supabase Row-Level Security (RLS), and unified ledger tracking for personal expenses, debts, loans, and assets.',
    subversionNotes: 'v2.0.0 • Initial Sovereign Release',
    subsystems: [
      {
        title: 'Sovereign Core Ledger Foundation',
        icon: 'hub',
        iconColor: 'text-[#0f172a]',
        iconBg: 'bg-slate-100',
        modulePath: 'module/sovereign-core',
        changes: [
          {
            type: 'Feature',
            typeBg: 'bg-emerald-100',
            typeText: 'text-emerald-800',
            label: 'Next.js 16 & Turbopack Architecture:',
            description:
              'Ultra-fast client hydration, zero-delay rendering, and secure SSR cookie session management.',
          },
        ],
      },
    ],
  },
];

export function VersionTrackingView() {
  const { setActiveTab } = useFinance();
  const [selectedVersion, setSelectedVersion] = useState<string>('v2.4.1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGettingStartedOpen, setIsGettingStartedOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(true);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [feedbackVote, setFeedbackVote] = useState<'yes' | 'no' | null>(null);

  const activeRelease = RELEASES.find((r) => r.version === selectedVersion) || RELEASES[0];

  const filteredReleases = RELEASES.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.version.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.subsystems.some((s) => s.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-6rem)] bg-[#fafbfd] border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden animate-fade-in">
      {/* Top Global Documentation Breadcrumb Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-2.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-xs md:text-sm text-slate-500">
          <nav className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap py-1">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-slate-400 hover:text-slate-900 transition-colors flex items-center cursor-pointer"
              title="Return to Dashboard Overview"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="text-slate-300">›</span>
            <span className="text-slate-500">Documentation</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-500">Personal Wealth Core</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-500">Release Notes</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-800 font-semibold truncate max-w-xs md:max-w-md">
              {activeRelease.version} ({activeRelease.publishedDate})
            </span>
          </nav>

          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-200">
              PERSONAL TRACKER
            </span>
            <span className="text-xs text-[#b48e28] font-bold">Sovereign {activeRelease.version}</span>
          </div>
        </div>
      </header>

      {/* Main Layout: Documentation Sidebar + Article Content Area */}
      <div className="flex-1 flex w-full relative">
        {/* Left Documentation Tree Sidebar */}
        <aside
          className={`${
            isSidebarHidden ? 'hidden' : 'flex'
          } w-72 lg:w-80 border-r border-slate-200/80 bg-white flex-col shrink-0 min-h-[calc(100vh-120px)] transition-all`}
        >
          {/* Search Input with Keyboard Badge and Filter Icon */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-base pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search release notes..."
                  className="w-full pl-8 pr-12 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] placeholder:text-slate-400 shadow-2xs"
                />
                <span className="absolute right-2 top-1.5 text-[9px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded">
                  ESC
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                title="Reset search filter"
              >
                <span className="material-symbols-outlined text-sm">filter_alt</span>
              </button>
            </div>
          </div>

          {/* Navigation Tree */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3 text-xs">
            {/* Tree Group: Getting Started (Collapsible) */}
            <div>
              <button
                type="button"
                onClick={() => setIsGettingStartedOpen(!isGettingStartedOpen)}
                className="w-full flex items-center justify-between text-left py-1.5 px-2 font-semibold text-slate-700 hover:text-slate-900 rounded-lg group cursor-pointer hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-sm text-slate-400 group-hover:text-slate-600 transition-transform ${
                      isGettingStartedOpen ? 'rotate-90' : ''
                    }`}
                  >
                    chevron_right
                  </span>
                  <span>Getting Started</span>
                </span>
                <span className="text-[10px] text-slate-400">Guide</span>
              </button>
              {isGettingStartedOpen && (
                <div className="ml-5 pl-2.5 border-l border-slate-200 py-1 space-y-1 text-slate-600">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="block w-full text-left px-2 py-1 hover:text-[#b48e28] hover:bg-slate-50 rounded text-[11px]"
                  >
                    Dashboard Net Worth Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('expenses')}
                    className="block w-full text-left px-2 py-1 hover:text-[#b48e28] hover:bg-slate-50 rounded text-[11px]"
                  >
                    Expense Notebook Logging
                  </button>
                  <button
                    onClick={() => setActiveTab('lending')}
                    className="block w-full text-left px-2 py-1 hover:text-[#b48e28] hover:bg-slate-50 rounded text-[11px]"
                  >
                    Lending &amp; Promissory Contracts
                  </button>
                </div>
              )}
            </div>

            {/* Tree Group: Modules & Features (Collapsible) */}
            <div>
              <button
                type="button"
                onClick={() => setIsModulesOpen(!isModulesOpen)}
                className="w-full flex items-center justify-between text-left py-1.5 px-2 font-semibold text-slate-700 hover:text-slate-900 rounded-lg group cursor-pointer hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-sm text-slate-400 group-hover:text-slate-600 transition-transform ${
                      isModulesOpen ? 'rotate-90' : ''
                    }`}
                  >
                    chevron_right
                  </span>
                  <span>Modules &amp; Ledger Hub</span>
                </span>
                <span className="text-[10px] text-slate-400">4 Modules</span>
              </button>
              {isModulesOpen && (
                <div className="ml-5 pl-2.5 border-l border-slate-200 py-1 space-y-1 text-slate-600">
                  <button
                    onClick={() => setActiveTab('expenses')}
                    className="block w-full text-left px-2 py-1 hover:text-[#b48e28] hover:bg-slate-50 rounded text-[11px]"
                  >
                    Expense Notebook &amp; Diary
                  </button>
                  <button
                    onClick={() => setActiveTab('payables')}
                    className="block w-full text-left px-2 py-1 hover:text-[#b48e28] hover:bg-slate-50 rounded text-[11px]"
                  >
                    Payables &amp; Recurring Bills
                  </button>
                  <button
                    onClick={() => setActiveTab('lending')}
                    className="block w-full text-left px-2 py-1 hover:text-[#b48e28] hover:bg-slate-50 rounded text-[11px]"
                  >
                    Money Lent &amp; Interest Tracker
                  </button>
                  <button
                    onClick={() => setActiveTab('assets')}
                    className="block w-full text-left px-2 py-1 hover:text-[#b48e28] hover:bg-slate-50 rounded text-[11px]"
                  >
                    Total Assets &amp; Sovereign Holdings
                  </button>
                </div>
              )}
            </div>

            {/* Tree Group: Release Notes (Expanded Active Group) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between py-1 px-2 font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-slate-600">expand_more</span>
                  <span>Release Notes &amp; Pushes</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-mono font-bold">
                  {filteredReleases.length} Versions
                </span>
              </div>

              {/* Sub-branch Version Links */}
              <div className="ml-2 pl-3 border-l border-slate-200 space-y-1 text-slate-600">
                {filteredReleases.map((rel) => {
                  const isSelected = rel.version === selectedVersion;
                  return (
                    <button
                      key={rel.version}
                      type="button"
                      onClick={() => setSelectedVersion(rel.version)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'font-bold text-slate-950 bg-slate-100 border-l-[3px] border-[#d4af37] -ml-[1px] shadow-2xs'
                          : 'hover:text-slate-900 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span className="truncate pr-1">
                        {rel.version} {rel.isLatest ? '(Latest)' : ''}
                      </span>
                      {rel.isLatest && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tree Group: API & Security Protocols */}
            <div>
              <button
                type="button"
                onClick={() => setIsSecurityOpen(!isSecurityOpen)}
                className="w-full flex items-center justify-between text-left py-1.5 px-2 font-semibold text-slate-700 hover:text-slate-900 rounded-lg group cursor-pointer hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-sm text-slate-400 group-hover:text-slate-600 transition-transform ${
                      isSecurityOpen ? 'rotate-90' : ''
                    }`}
                  >
                    chevron_right
                  </span>
                  <span>Security &amp; Privacy Vault</span>
                </span>
                <span className="text-[10px] text-slate-400">Specs</span>
              </button>
              {isSecurityOpen && (
                <div className="ml-5 pl-2.5 border-l border-slate-200 py-1 space-y-1 text-slate-600">
                  <span className="block px-2 py-1 text-[11px] text-slate-500">
                    Supabase Row Level Security (RLS)
                  </span>
                  <span className="block px-2 py-1 text-[11px] text-slate-500">
                    Local Device Encryption (AES-256)
                  </span>
                  <span className="block px-2 py-1 text-[11px] text-slate-500">
                    Zero-Knowledge Privacy Masking
                  </span>
                </div>
              )}
            </div>
          </nav>

          {/* Sidebar Footer: Vault Status */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Zero-Knowledge Vault: Sync 100%</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">AES-256</span>
          </div>
        </aside>

        {/* Sidebar Toggle Handle Button */}
        <div className="hidden lg:flex items-center -ml-3.5 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsSidebarHidden(!isSidebarHidden)}
            className="bg-white border border-slate-300 text-slate-500 hover:text-slate-900 shadow-xs rounded-full w-7 h-7 flex items-center justify-center text-xs transition cursor-pointer"
            title={isSidebarHidden ? 'Show Documentation Sidebar' : 'Hide Documentation Sidebar'}
          >
            <span className="material-symbols-outlined text-sm">
              {isSidebarHidden ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Main Content Area: Release Notes Article */}
        <main className="flex-1 bg-white p-6 lg:p-10 overflow-y-auto">
          {/* Header Title & Article Anchor */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-serif font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                <span>{activeRelease.title}</span>
                <span className="material-symbols-outlined text-slate-300 text-xl">link</span>
              </h1>
            </div>
          </div>

          {/* Metadata Badges Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {activeRelease.isLatest ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#fef8e7] text-[#946c00] border border-[#f5e4ab]">
                  LATEST RELEASE
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  STABLE ARCHIVE
                </span>
              )}
              <span className="text-slate-600 font-medium">Published on {activeRelease.publishedDate}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                <span>{activeRelease.readTime}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsSidebarHidden(!isSidebarHidden)}
                className="flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer text-slate-500"
              >
                <span className="material-symbols-outlined text-sm">fullscreen</span>
                <span>{isSidebarHidden ? 'Expand' : 'Focus'}</span>
              </button>
            </div>
          </div>

          {/* Action Row: Follow, Share, Export */}
          <div className="mt-4 flex items-center justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors font-semibold shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-slate-500">dashboard</span>
              <span>Back to Dashboard</span>
            </button>
            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
              title="Share release link"
            >
              <span className="material-symbols-outlined text-sm">share</span>
            </button>
            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
              title="Bookmark release"
            >
              <span className="material-symbols-outlined text-sm">bookmark</span>
            </button>
          </div>

          {/* Release Summary Callout Section (Article summary with Diamond) */}
          <section className="mt-6">
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-900">
              <span className="material-symbols-outlined text-sm text-amber-500">auto_awesome</span>
              <span>Article Summary</span>
            </div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed font-sans">
              {activeRelease.summary}
            </p>
          </section>

          {/* Feature Highlight Card (Core Ledger Modules & Feature Artifacts) */}
          <section className="mt-8">
            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs">
              <h2 className="text-sm font-bold text-slate-900 mb-3">
                Core Ledger Modules &amp; Feature Artifacts
              </h2>

              <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-[240px]">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#9a761e]">
                    <span className="material-symbols-outlined text-xl">token</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      Universal Ledger Engine ({activeRelease.version})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      in_place_edits, privacy_pin, universal_date_filter • Sovereign Core
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center border border-emerald-200 bg-emerald-50 rounded-lg overflow-hidden">
                    <span className="px-2.5 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check</span>
                      <span>Released &amp; Active</span>
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                    <span className="material-symbols-outlined text-xs text-slate-500">lock</span>
                    <span>Private Vault</span>
                  </span>

                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/50 transition-colors cursor-pointer"
                    title="Ledger verified"
                  >
                    <span className="material-symbols-outlined text-base">public</span>
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                <span className="font-mono text-[11px]">
                  Subversion artifacts: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">{activeRelease.subversionNotes}</code>
                </span>
                <span className="text-[#9a761e] font-bold">100% Zero-Knowledge Verified</span>
              </div>
            </div>
          </section>

          {/* Important Vault Notice (Rose/Red Warning Banner) */}
          <section className="mt-6" data-purpose="security-warning">
            <div className="rounded-xl p-4 bg-[#fdf2f2] border-l-4 border-[#b91c1c] text-[#7f1d1d] text-xs leading-relaxed shadow-2xs">
              <h3 className="font-bold text-sm text-[#991b1b] mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-base text-red-600">warning</span>
                <span>Important Vault Notice</span>
              </h3>
              <p>
                It is the <strong className="font-bold text-[#7f1d1d]">account holder&apos;s responsibility</strong> to ensure that any local biometric keys are <strong className="font-bold text-[#7f1d1d]">re-synchronized</strong> and sensitive financial recovery tokens are <strong className="font-bold text-[#7f1d1d]">redacted and archived</strong> offline so no confidential ledger state is compromised during cloud backup sync.
              </p>
            </div>
          </section>

          {/* Detailed Changelog by Subsystem */}
          <section className="mt-10 space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Detailed Changelog by Subsystem</span>
                <span className="text-xs font-normal text-slate-400">
                  ({activeRelease.subsystems.length} Subsystems upgraded)
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Complete architectural breakdown of features, UI optimizations, security patches, and database indexing updates in this build.
              </p>
            </div>

            {/* Subsystem Cards */}
            {activeRelease.subsystems.map((sub, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 ${sub.iconBg} ${sub.iconColor} rounded-lg flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-base">{sub.icon}</span>
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{sub.title}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{sub.modulePath}</span>
                </div>

                <ul className="mt-3.5 space-y-3 text-xs text-slate-600">
                  {sub.changes.map((change, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${change.typeBg} ${change.typeText} uppercase shrink-0 mt-0.5`}
                      >
                        {change.type}
                      </span>
                      <span className="leading-relaxed">
                        <strong className="text-slate-900 font-bold mr-1">{change.label}</strong>
                        <span>{change.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          {/* Bottom Page Navigation / Feedback */}
          <footer className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div className="flex items-center gap-3">
              <span>Was this release note helpful?</span>
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFeedbackVote('yes')}
                  className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    feedbackVote === 'yes'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackVote('no')}
                  className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    feedbackVote === 'no'
                      ? 'bg-red-50 text-red-800 border-red-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              {activeRelease.version !== 'v2.0.0' && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = RELEASES.findIndex((r) => r.version === selectedVersion);
                    if (currentIndex < RELEASES.length - 1) {
                      setSelectedVersion(RELEASES[currentIndex + 1].version);
                    }
                  }}
                  className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer text-[#9a761e]"
                >
                  <span>← Previous Release</span>
                </button>
              )}
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Zero-Knowledge Dashboard →</span>
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
