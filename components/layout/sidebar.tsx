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

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-50 hidden md:flex flex-col justify-between py-6 shadow-sm overflow-hidden select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="flex flex-col w-full overflow-hidden">
        {/* Top Brand Header Row */}
        <div className="px-3.5 mb-4 flex items-center justify-between overflow-hidden min-h-[44px]">
          <div className="flex items-center min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[#d4af37] shadow-xs shrink-0">
              <span className="material-symbols-outlined text-2xl font-semibold">account_balance</span>
            </div>
            
            <div
              className={`flex flex-col ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                isCollapsed
                  ? 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
                  : 'opacity-100 max-w-[185px] translate-x-0'
              }`}
            >
              <span className="font-title-md text-base text-slate-900 tracking-tight leading-tight uppercase font-bold truncate">
                Personal Tracker
              </span>
              <span className="font-label-sm text-[10px] text-[#b48e28] tracking-widest uppercase font-bold truncate">
                Wealth Command
              </span>
            </div>
          </div>

          {/* Sleek Collapse Toggle Button (when expanded) */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-8'
            }`}
          >
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shadow-xs cursor-pointer ml-auto shrink-0"
              title="Collapse sidebar"
              type="button"
            >
              {/* Modern Panel Collapse Icon */}
              <svg
                className="w-4 h-4 text-slate-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="3" />
                <path d="M9 3v18" />
                <path d="m14 9-3 3 3 3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dedicated Sleek Expand Button (when collapsed) */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out flex justify-center ${
            isCollapsed ? 'max-h-12 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0 pointer-events-none'
          }`}
        >
          <button
            onClick={toggleSidebar}
            className="w-11 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            title="Expand sidebar"
            type="button"
          >
            {/* Modern Panel Expand Icon */}
            <svg
              className="w-4 h-4 text-slate-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="3" />
              <path d="M9 3v18" />
              <path d="m13 15 3-3-3-3" />
            </svg>
          </button>
        </div>

        {/* Butter-Smooth Add Transaction Button */}
        <div className="px-3.5 mb-5 flex justify-center overflow-hidden">
          <button
            onClick={() => openModal('expense')}
            className={`h-11 rounded-xl flex items-center bg-[#d4af37] text-slate-950 font-semibold transition-all duration-300 ease-in-out cursor-pointer hover:brightness-105 active:scale-[0.98] overflow-hidden whitespace-nowrap shadow-xs ${
              isCollapsed
                ? 'w-11 justify-center px-0 rounded-2xl'
                : 'w-full justify-start px-3.5 gap-2.5 rounded-xl'
            }`}
            title="Add Transaction"
            type="button"
          >
            <span
              className="material-symbols-outlined text-xl shrink-0 leading-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add_circle
            </span>
            <span
              className={`text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                isCollapsed
                  ? 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
                  : 'opacity-100 max-w-[160px] translate-x-0'
              }`}
            >
              Add Transaction
            </span>
          </button>
        </div>

        {/* Navigation Category Header */}
        <div
          className={`px-4 mb-2 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
            isCollapsed ? 'opacity-0 max-h-0 mb-0 pointer-events-none' : 'opacity-100 max-h-6'
          }`}
        >
          <span className="text-[11px] tracking-wider text-slate-400 font-bold uppercase">
            Navigation
          </span>
        </div>

        {/* Navigation Items List */}
        <nav className="flex flex-col gap-1.5 px-3 w-full overflow-hidden">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                type="button"
                className={`w-full h-11 rounded-xl flex items-center transition-all duration-200 cursor-pointer overflow-hidden whitespace-nowrap relative ${
                  isCollapsed ? 'justify-center px-0' : 'justify-start px-3 gap-3'
                } ${
                  isActive
                    ? 'bg-slate-100/90 text-slate-900 font-semibold border-l-[3px] border-[#d4af37] shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl shrink-0 leading-none"
                  style={{
                    color: isActive ? '#b48e28' : 'rgb(100, 116, 139)',
                  }}
                >
                  {item.icon}
                </span>
                
                <span
                  className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                    isCollapsed
                      ? 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
                      : 'opacity-100 max-w-[170px] translate-x-0'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls: Privacy Mode & Version */}
      <div className="px-3 pt-4 flex flex-col gap-2.5 overflow-hidden w-full">
        <div
          className={`rounded-xl bg-slate-50 border border-slate-200/80 flex items-center transition-all duration-300 overflow-hidden ${
            isCollapsed ? 'p-1.5 justify-center' : 'p-3 justify-between'
          }`}
        >
          <div
            className={`flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
              isCollapsed
                ? 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
                : 'opacity-100 max-w-[140px] translate-x-0'
            }`}
          >
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Privacy Mode
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {privacyMode ? 'Values Hidden' : 'Values Visible'}
            </span>
          </div>

          <button
            onClick={togglePrivacyMode}
            className={`w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer ${
              privacyMode ? 'text-[#b48e28]' : 'text-slate-600 hover:text-slate-900'
            }`}
            title={privacyMode ? 'Privacy Mode: Values Hidden (Click to show)' : 'Privacy Mode: Values Visible (Click to hide)'}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">
              {privacyMode ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>

        <div className="text-center overflow-hidden whitespace-nowrap transition-all duration-300">
          <span className="text-[11px] text-slate-400 font-medium">
            {isCollapsed ? 'v2.4' : 'v2.4 FinTech Suite'}
          </span>
        </div>
      </div>
    </aside>
  );
}
