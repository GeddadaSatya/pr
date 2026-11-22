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
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-50 hidden md:flex flex-col justify-between py-5 shadow-sm overflow-hidden select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      <div className="flex flex-col w-full overflow-hidden">
        {/* Top Brand Header Row */}
        <div
          className={`mb-5 flex items-center overflow-hidden min-h-[40px] transition-all duration-300 ${
            isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
          }`}
        >
          <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
            {/* Logo Icon - When collapsed, hovering reveals the expand icon and clicking toggles sidebar */}
            <div
              onClick={isCollapsed ? toggleSidebar : undefined}
              className={`w-10 h-10 rounded-xl bg-[#020b1e] border border-slate-800 flex items-center justify-center shadow-xs shrink-0 relative group transition-all duration-300 overflow-hidden ${
                isCollapsed
                  ? 'cursor-pointer hover:border-[#d4af37]/70 hover:shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  : ''
              }`}
              title={isCollapsed ? 'Click to expand sidebar' : 'Personal Tracker'}
            >
              {/* Custom Gold PR Brand Logo */}
              <img
                src="/brand-logo.png"
                alt="PR Brand Emblem"
                className={`w-full h-full object-cover scale-105 transition-all duration-200 ${
                  isCollapsed ? 'group-hover:opacity-0 group-hover:scale-75' : 'opacity-100'
                }`}
              />

              {/* Reveal Expand Icon on Hover (Only when collapsed) - Option 3 Dual Chevron */}
              {isCollapsed && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-200 text-[#d4af37] bg-[#020b1e]">
                  <svg
                    className="w-4.5 h-4.5 text-[#d4af37]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 17 5-5-5-5" />
                    <path d="m13 17 5-5-5-5" />
                  </svg>
                </div>
              )}
            </div>

            {/* Brand Title (when expanded) */}
            <div
              className={`flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                isCollapsed
                  ? 'opacity-0 max-w-0 ml-0 -translate-x-3 pointer-events-none'
                  : 'opacity-100 max-w-[145px] ml-2.5 translate-x-0'
              }`}
            >
              <span className="text-xs text-slate-900 tracking-wider leading-tight uppercase font-bold truncate">
                Personal Tracker
              </span>
              <span className="font-label-sm text-[10px] text-[#b48e28] tracking-widest uppercase font-bold truncate">
                Wealth Command
              </span>
            </div>
          </div>

          {/* Collapse Toggle Button (when expanded) */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-7'
            }`}
          >
            <button
              onClick={toggleSidebar}
              className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shadow-xs cursor-pointer ml-auto shrink-0"
              title="Collapse sidebar"
              type="button"
            >
              {/* Option 3: Dual Chevron (pointing left) */}
              <svg
                className="w-3.5 h-3.5 text-slate-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m11 17-5-5 5-5" />
                <path d="m18 17-5-5 5-5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Butter-Smooth Add Transaction Button */}
        <div className={`mb-5 flex justify-center overflow-hidden ${isCollapsed ? 'px-0' : 'px-3'}`}>
          <button
            onClick={() => openModal('expense')}
            className={`h-10 rounded-xl flex items-center bg-[#d4af37] text-slate-950 font-semibold transition-all duration-300 ease-in-out cursor-pointer hover:brightness-105 active:scale-[0.98] overflow-hidden whitespace-nowrap shadow-xs ${
              isCollapsed
                ? 'w-10 justify-center px-0'
                : 'w-full justify-start px-3 gap-2.5'
            }`}
            title="Add Transaction"
            type="button"
          >
            <span
              className="material-symbols-outlined text-lg shrink-0 leading-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add_circle
            </span>
            <span
              className={`text-[13px] font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                isCollapsed
                  ? 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
                  : 'opacity-100 max-w-[140px] translate-x-0'
              }`}
            >
              Add Transaction
            </span>
          </button>
        </div>

        {/* Navigation Category Header */}
        <div
          className={`px-3 mb-2 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
            isCollapsed ? 'opacity-0 max-h-0 mb-0 pointer-events-none' : 'opacity-100 max-h-6'
          }`}
        >
          <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase">
            Navigation
          </span>
        </div>

        {/* Navigation Items List */}
        <nav className={`flex flex-col gap-1.5 w-full overflow-hidden ${isCollapsed ? 'px-0 items-center' : 'px-2.5'}`}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (activeTab === 'day-ledger' && item.id === 'expenses');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                type="button"
                className={`h-10 rounded-xl flex items-center transition-all duration-200 cursor-pointer overflow-hidden whitespace-nowrap relative ${
                  isCollapsed ? 'w-11 justify-center px-0' : 'w-full justify-start px-2.5 gap-2.5'
                } ${
                  isActive
                    ? isCollapsed
                      ? 'bg-[#f1f5f9] text-[#b48e28] font-semibold border-l-[3.5px] border-[#d4af37] shadow-xs'
                      : 'bg-slate-100/90 text-slate-900 font-semibold border-l-[3px] border-[#d4af37] shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <span
                  className="material-symbols-outlined text-lg shrink-0 leading-none"
                  style={{
                    color: isActive ? '#b48e28' : 'rgb(100, 116, 139)',
                  }}
                >
                  {item.icon}
                </span>

                <span
                  className={`text-[13px] whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                    isCollapsed
                      ? 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
                      : 'opacity-100 max-w-[155px] translate-x-0'
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
      <div className={`pt-4 flex flex-col gap-2.5 overflow-hidden w-full ${isCollapsed ? 'px-0 items-center' : 'px-3'}`}>
        <div
          className={`rounded-xl bg-slate-50 border border-slate-200/80 flex items-center transition-all duration-300 overflow-hidden ${
            isCollapsed ? 'w-10 h-10 p-0 justify-center' : 'p-3 justify-between'
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
