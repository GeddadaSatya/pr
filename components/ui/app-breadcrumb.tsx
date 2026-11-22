'use client';

import React from 'react';
import { useFinance } from '@/components/context/finance-context';

export interface BreadcrumbSegment {
  label: string;
  tab?: string;
  onClick?: () => void;
  badge?: string;
}

export interface AppBreadcrumbProps {
  segments: BreadcrumbSegment[];
  className?: string;
}

export function AppBreadcrumb({ segments, className = '' }: AppBreadcrumbProps) {
  const { setActiveTab } = useFinance();

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-slate-500 space-x-2 flex-wrap ${className}`}>
      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1;
        const isClickable = !isLast && Boolean(seg.onClick || seg.tab);

        const handleClick = () => {
          if (seg.onClick) {
            seg.onClick();
          } else if (seg.tab) {
            setActiveTab(seg.tab);
          }
        };

        return (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <span className="text-slate-300 select-none">/</span>
            )}

            <div className="flex items-center space-x-1.5">
              {isClickable ? (
                <button
                  type="button"
                  onClick={handleClick}
                  className="font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
                  title={`Navigate to ${seg.label}`}
                >
                  <span>{seg.label}</span>
                </button>
              ) : (
                <span className={`font-semibold ${isLast ? 'text-slate-900' : 'text-slate-600'}`}>
                  {seg.label}
                </span>
              )}

              {seg.badge && (
                <span className="inline-flex items-center space-x-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400 select-none ml-0.5"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  <span className="font-medium text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                    {seg.badge}
                  </span>
                </span>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
