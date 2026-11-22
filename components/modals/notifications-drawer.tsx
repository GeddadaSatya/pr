'use client';

import React from 'react';
import { useFinance } from '@/components/context/finance-context';

export function NotificationsDrawer() {
  const {
    isNotificationsDrawerOpen,
    closeNotificationsDrawer,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    setActiveTab,
  } = useFinance();

  if (!isNotificationsDrawerOpen) return null;

  const handleAction = (tab?: string, id?: string) => {
    if (id) markNotificationRead(id);
    closeNotificationsDrawer();
    if (tab) {
      setActiveTab(tab);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'due_alert':
        return { icon: 'schedule_send', color: 'text-red-600 bg-red-50 border-red-200' };
      case 'loan_payment':
        return { icon: 'payments', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'repayment_due':
        return { icon: 'alarm', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      default:
        return { icon: 'verified', color: 'text-[#9a761e] bg-[#fdf8ea] border-[#d4af37]/30' };
    }
  };

  return (
    <div id="notifications-drawer" className="fixed inset-0 z-60 bg-slate-950/30 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={closeNotificationsDrawer} />
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-[#9a761e]">notifications</span>
            <span className="font-serif font-bold text-sm text-slate-900">Notifications &amp; Activity</span>
          </div>
          <button
            id="close-notifications-btn"
            aria-label="Close Notifications"
            onClick={closeNotificationsDrawer}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{notifications.filter((n) => !n.read).length} Unread Alerts</span>
          <button
            onClick={markAllNotificationsRead}
            className="text-[11px] font-semibold text-[#9a761e] hover:text-[#78570f] cursor-pointer"
          >
            Mark all read
          </button>
        </div>

        {/* List */}
        <div id="notifications-list" className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-1.5">
              <span className="material-symbols-outlined text-3xl text-slate-300">notifications_off</span>
              <p className="text-xs font-semibold text-slate-600">No Notifications</p>
              <span className="text-[11px] text-slate-400">You are completely up to date.</span>
            </div>
          ) : (
            notifications.map((notif) => {
              const style = getTypeIcon(notif.type);
              return (
                <div
                  key={notif.id}
                  data-notification-card
                  className={`p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    notif.read ? 'bg-white border-slate-200/80 opacity-80' : 'bg-[#fefdf8] border-[#d4af37]/40 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${style.color}`}
                      >
                        <span className="material-symbols-outlined text-xs">{style.icon}</span>
                      </div>
                      <span className="font-bold text-xs text-slate-900 leading-snug">{notif.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => dismissNotification(notif.id)}
                      className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer p-0.5"
                      title="Dismiss"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed pl-8">{notif.description}</p>

                  <div className="flex items-center justify-between pl-8 pt-1 text-[10px] text-slate-400">
                    <span>{notif.timestamp}</span>
                    {notif.actionTab && (
                      <button
                        type="button"
                        onClick={() => handleAction(notif.actionTab, notif.id)}
                        className="font-bold text-[#9a761e] hover:text-[#78570f] flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>View</span>
                        <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
