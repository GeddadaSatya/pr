'use client';

import React from 'react';
import { useFinance } from '@/components/context/finance-context';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { privacyMode, togglePrivacyMode, openModal, isCollapsed, toggleSidebar } = useFinance();

  const navItems = [
    { id: 'overview', label: 'Overview & Net Worth', icon: 'insights' },
    { id: 'expenses', label: 'Expense Notebook', icon: 'menu_book' },
    { id: 'payables', label: 'Payables & Dues', icon: 'schedule_send' },
    { id: 'lending', label: 'Loans & Interest Ledger', icon: 'trending_up' },
    { id: 'assets', label: 'Total Assets & Holdings', icon: 'account_balance_wallet' },
  ];

  if (isCollapsed) {
    return (
      <aside className="fixed left-0 top-0 h-full w-20 bg-white border-r border-slate-200 z-50 hidden md:flex flex-col items-center justify-between py-6 shadow-sm transition-all duration-300 ease-in-out">
        <div className="flex flex-col items-center w-full gap-5">
          {/* Collapsed Brand Icon */}
          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-xs shrink-0 text-[#d4af37]">
            <span className="material-symbols-outlined text-2xl font-semibold">account_balance</span>
          </div>

          {/* Expand Toggle Button (>|) */}
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            title="Expand Sidebar"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">last_page</span>
          </button>

          {/* Collapsed Circular Gold Add FAB */}
          <button
            onClick={() => openModal('expense')}
            className="w-11 h-11 rounded-full flex items-center justify-center text-slate-950 shadow-sm hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            style={{
              backgroundColor: '#d4af37',
            }}
            title="Add Transaction"
            type="button"
          >
            <span className="material-symbols-outlined text-2xl font-bold">add_circle</span>
          </button>

          {/* Collapsed Navigation Items Stack */}
          <nav className="flex flex-col gap-2 w-full px-2.5 items-center mt-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  type="button"
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-slate-100/90 text-slate-900 border-l-[3px] border-[#d4af37] rounded-l-none shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{
                      color: isActive ? '#b48e28' : 'rgb(100, 116, 139)',
                    }}
                  >
                    {item.icon}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Collapsed Footer: Privacy Button & Version */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          <button
            onClick={togglePrivacyMode}
            className={`w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
              privacyMode ? 'text-[#b48e28]' : 'text-slate-600 hover:text-slate-900'
            }`}
            title={privacyMode ? 'Privacy Mode: Values Hidden (Click to show)' : 'Privacy Mode: Values Visible (Click to hide)'}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">
              {privacyMode ? 'visibility_off' : 'visibility'}
            </span>
          </button>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider">v2.4</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-50 hidden md:flex flex-col justify-between py-6 shadow-sm transition-all duration-300 ease-in-out">
      <div className="flex flex-col">
        {/* Logo, Brand, and Collapse Toggle Button */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center shadow-xs shrink-0 text-[#d4af37]">
              <span className="material-symbols-outlined text-2xl">account_balance</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-base text-slate-900 tracking-tight leading-tight uppercase font-bold">
                Personal Tracker
              </span>
              <span className="font-label-sm text-[10px] text-[#b48e28] tracking-widest uppercase font-bold">
                Wealth Command
              </span>
            </div>
          </div>

          {/* Collapse Toggle Button (|<) */}
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            title="Collapse Sidebar"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">first_page</span>
          </button>
        </div>

        {/* Add Transaction Button */}
        <div className="px-4 mb-6">
          <button
            onClick={() => openModal('expense')}
            className="w-full flex items-center justify-center gap-2 text-slate-900 font-semibold transition-all active:scale-[0.98] cursor-pointer hover:opacity-95"
            style={{
              backgroundColor: 'rgb(212, 167, 55)',
              color: 'rgb(30, 41, 59)',
              fontWeight: 600,
              borderRadius: '12px',
              padding: '12px 16px',
            }}
            type="button"
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            <span className="text-sm">Add Transaction</span>
          </button>
        </div>

        {/* Navigation Category Label */}
        <div className="px-6 mb-3">
          <span className="text-[11px] tracking-wider text-slate-400 font-bold uppercase">
            Navigation
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                type="button"
                className={`flex items-center text-left transition-all rounded-[10px] py-3 px-3.5 gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold border-l-[3px] border-[#d4af37]'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{
                    color: isActive ? 'rgb(180, 142, 40)' : 'rgb(100, 116, 139)',
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls: Privacy Mode & Version */}
      <div className="px-6 pt-6 flex flex-col gap-3">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Privacy Mode
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {privacyMode ? 'Values Hidden' : 'Values Visible'}
            </span>
          </div>
          <button
            onClick={togglePrivacyMode}
            className={`w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
              privacyMode ? 'text-[#b48e28]' : 'text-slate-600 hover:text-slate-900'
            }`}
            title={privacyMode ? 'Click to show values' : 'Click to hide values'}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">
              {privacyMode ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        <div className="text-center">
          <span className="text-[11px] text-slate-400">v2.4 FinTech Suite</span>
        </div>
      </div>
    </aside>
  );
}
