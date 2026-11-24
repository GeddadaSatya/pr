'use client';

import React, { useState } from 'react';
import { useFinance } from '@/components/context/finance-context';
import { AssetHolding } from '@/lib/types';
import { AmountDisplay } from '@/components/ui/amount-display';
import { AppBreadcrumb } from '@/components/ui/app-breadcrumb';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Liquid Cash & Banking': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  'Bullion & Precious Metals': { bg: 'bg-[#fdf8ea]', text: 'text-[#9a761e]', border: 'border-[#d4af37]/40' },
  'Bonds & Fixed Income': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  'Real Estate & Properties': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  'Alternative & Equity': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
};

export function AssetsHoldingsView() {
  const { assets, addAsset, updateAssetValuation, deleteAsset, privacyMode } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetHolding | null>(null);
  const [newValuationInput, setNewValuationInput] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetHolding['category']>('Liquid Cash & Banking');
  const [institution, setInstitution] = useState('');
  const [valuation, setValuation] = useState('');
  const [yieldRate, setYieldRate] = useState('');
  const [liquidity, setLiquidity] = useState<AssetHolding['liquidityTier']>('Instant');
  const [accountRef, setAccountRef] = useState('');
  const [notes, setNotes] = useState('');

  // Calculations
  const totalValuation = assets.reduce((sum, a) => sum + a.valuation, 0);
  const totalMonthlyYield = assets.reduce((sum, a) => sum + a.monthlyYield, 0);
  const blendedYieldRate = totalValuation > 0 ? (totalMonthlyYield * 12 / totalValuation) * 100 : 0;

  const filteredAssets = assets.filter((a) => {
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.accountRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valuation) || 0;
    const rate = parseFloat(yieldRate) || 0;
    if (!name || val <= 0) return;

    addAsset({
      name,
      category,
      institution: institution || 'Sovereign Custody',
      valuation: val,
      annualYieldRate: rate,
      monthlyYield: (val * (rate / 100)) / 12,
      liquidityTier: liquidity,
      accountRef: accountRef || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      lastValuationDate: new Date().toISOString().slice(0, 10),
      notes,
    });

    // Reset
    setName('');
    setInstitution('');
    setValuation('');
    setYieldRate('');
    setAccountRef('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const handleUpdateValuation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    const val = parseFloat(newValuationInput);
    if (isNaN(val) || val <= 0) return;

    updateAssetValuation(editingAsset.id, val);
    setEditingAsset(null);
    setNewValuationInput('');
  };

  return (
    <div className="flex flex-col w-full gap-5 md:gap-6 animate-fade-in" id="assets-holdings-view">
      {/* Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <AppBreadcrumb
            className="mb-1"
            segments={[
              { label: 'Overview', tab: 'overview' },
              { label: 'Total Assets & Holdings' },
            ]}
          />
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Total Assets &amp; Holdings
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Sovereign asset register, diversified holdings, bullion vaults, and income-generating capital.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-[#eed885] hover:bg-[#dec468] text-[#0f172a] border border-[#d4af37]/30 text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>Register New Asset</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Valuation */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-semibold">Total Portfolio Net Worth</span>
            <div className="w-8 h-8 rounded-lg bg-[#fdf8ea] border border-[#d4af37]/30 flex items-center justify-center text-[#9a761e]">
              <span className="material-symbols-outlined text-base">account_balance_wallet</span>
            </div>
          </div>
          <div>
            <AmountDisplay amount={totalValuation} privacyMode={privacyMode} size="2xl" />
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#76777d]">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {assets.length} Active Holdings
              </span>
            </div>
          </div>
        </div>

        {/* Blended Yield */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-semibold">Blended Annual Yield</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <span className="material-symbols-outlined text-base">trending_up</span>
            </div>
          </div>
          <div>
            <span className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
              {privacyMode ? '••••••' : `${blendedYieldRate.toFixed(2)}%`}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#76777d]">
              <span className="text-emerald-700 font-semibold">Weighted annual return</span>
            </div>
          </div>
        </div>

        {/* Monthly Passive Flow */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-semibold">Est. Monthly Inflow</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800">
              <span className="material-symbols-outlined text-base">savings</span>
            </div>
          </div>
          <div>
            <AmountDisplay amount={totalMonthlyYield} privacyMode={privacyMode} prefix="+₹" size="2xl" />
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#76777d]">
              <span>Passive yield / dividends</span>
            </div>
          </div>
        </div>

        {/* Liquid Coverage */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-semibold">Instant Liquidity</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <span className="material-symbols-outlined text-base">flash_on</span>
            </div>
          </div>
          <div>
            <AmountDisplay
              amount={assets.filter((a) => a.liquidityTier === 'Instant').reduce((sum, a) => sum + a.valuation, 0)}
              privacyMode={privacyMode}
              size="2xl"
            />
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#76777d]">
              <span>T+0 cash availability</span>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation Breakdown Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#9a761e]">pie_chart</span>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Asset Class Allocation</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Diversification Index: Sovereign Prime</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
          {Object.entries(
            assets.reduce<Record<string, number>>((acc, a) => {
              acc[a.category] = (acc[a.category] || 0) + a.valuation;
              return acc;
            }, {})
          ).map(([cat, val]) => {
            const pct = totalValuation > 0 ? (val / totalValuation) * 100 : 0;
            const barColors: Record<string, string> = {
              'Liquid Cash & Banking': 'bg-emerald-500',
              'Bullion & Precious Metals': 'bg-[#d4af37]',
              'Bonds & Fixed Income': 'bg-blue-500',
              'Real Estate & Properties': 'bg-purple-500',
              'Alternative & Equity': 'bg-amber-500',
            };
            return (
              <div
                key={cat}
                style={{ width: `${pct}%` }}
                className={`${barColors[cat] || 'bg-slate-400'} h-full transition-all duration-300`}
                title={`${cat}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-3 pt-1 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Liquid Cash ({totalValuation > 0 ? Math.round((assets.filter(a => a.category === 'Liquid Cash & Banking').reduce((s, a) => s + a.valuation, 0) / totalValuation) * 100) : 0}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]"></span>
            <span>Gold Bullion ({totalValuation > 0 ? Math.round((assets.filter(a => a.category === 'Bullion & Precious Metals').reduce((s, a) => s + a.valuation, 0) / totalValuation) * 100) : 0}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Bonds &amp; Fixed ({totalValuation > 0 ? Math.round((assets.filter(a => a.category === 'Bonds & Fixed Income').reduce((s, a) => s + a.valuation, 0) / totalValuation) * 100) : 0}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Real Estate ({totalValuation > 0 ? Math.round((assets.filter(a => a.category === 'Real Estate & Properties').reduce((s, a) => s + a.valuation, 0) / totalValuation) * 100) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search holdings, accounts, or custodians..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full bg-[#f8fafc] border border-slate-200 pl-8 pr-3 rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#0f172a] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Classes ({assets.length})
          </button>
          {['Liquid Cash & Banking', 'Bullion & Precious Metals', 'Bonds & Fixed Income', 'Real Estate & Properties'].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#0f172a] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.split(' ')[0]}
              </button>
            )
          )}
        </div>
      </div>

      {/* Holdings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full py-12 px-4 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 mb-3">
              <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
            </div>
            <h3 className="font-headline-sm text-base font-semibold text-slate-900 mb-1">
              No asset holdings recorded
            </h3>
            <p className="font-body-sm text-xs text-slate-500 max-w-sm mb-4">
              Add your liquid cash, bank balances, bullion, or investment assets to track your net worth.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-[#b48e28] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add First Asset</span>
            </button>
          </div>
        ) : (
          filteredAssets.map((asset) => {
          const catStyle = CATEGORY_COLORS[asset.category] || {
            bg: 'bg-slate-100',
            text: 'text-slate-800',
            border: 'border-slate-200',
          };
          return (
            <div
              key={asset.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#d4af37]/40 transition-all flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-sm leading-snug group-hover:text-[#9a761e] transition-colors">
                      {asset.name}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">{asset.institution}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                  >
                    {asset.liquidityTier}
                  </span>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Valuation</span>
                    <AmountDisplay amount={asset.valuation} privacyMode={privacyMode} size="base" weight="bold" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Yield</span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">
                      {privacyMode ? '••••' : `+${asset.annualYieldRate}% p.a.`}
                    </span>
                  </div>
                </div>

                {asset.notes && (
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed bg-[#f8fafc] p-2 rounded-lg border border-slate-100">
                    {asset.notes}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono">{asset.accountRef}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAsset(asset);
                      setNewValuationInput(String(asset.valuation));
                    }}
                    className="text-xs font-semibold text-[#9a761e] hover:text-[#78570f] cursor-pointer"
                  >
                    Update Value
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => deleteAsset(asset.id)}
                    className="text-xs text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove Asset"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#fdf8ea] border border-[#d4af37]/30 flex items-center justify-center text-[#9a761e]">
                  <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                </div>
                <h2 className="font-serif text-lg text-slate-900 font-bold">Register Asset or Holding</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600 uppercase font-semibold">Asset / Holding Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Sovereign Wealth Deposit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-600 uppercase font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                  >
                    <option value="Liquid Cash & Banking">Liquid Cash &amp; Banking</option>
                    <option value="Bullion & Precious Metals">Bullion &amp; Precious Metals</option>
                    <option value="Bonds & Fixed Income">Bonds &amp; Fixed Income</option>
                    <option value="Real Estate & Properties">Real Estate &amp; Properties</option>
                    <option value="Alternative & Equity">Alternative &amp; Equity</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-600 uppercase font-semibold">Institution / Custodian</label>
                  <input
                    type="text"
                    placeholder="e.g. Brinks Vault Security"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-600 uppercase font-semibold">Valuation (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="50000"
                    value={valuation}
                    onChange={(e) => setValuation(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-600 uppercase font-semibold">Annual Yield (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="7.5"
                    value={yieldRate}
                    onChange={(e) => setYieldRate(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-600 uppercase font-semibold">Liquidity Tier</label>
                  <select
                    value={liquidity}
                    onChange={(e) => setLiquidity(e.target.value as any)}
                    className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                  >
                    <option value="Instant">Instant (T+0)</option>
                    <option value="T+1">T+1 (Next Day)</option>
                    <option value="T+3">T+3 (Settlement)</option>
                    <option value="Illiquid">Illiquid</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600 uppercase font-semibold">Account / Vault Reference</label>
                <input
                  type="text"
                  placeholder="e.g. VAULT-AU-99128"
                  value={accountRef}
                  onChange={(e) => setAccountRef(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600 uppercase font-semibold">Notes &amp; Custody Details</label>
                <textarea
                  rows={2}
                  placeholder="Additional notes, collateral or certificate numbers..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#eed885] hover:bg-[#dec468] text-slate-950 font-bold text-xs shadow-2xs cursor-pointer"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Valuation Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-60 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full relative">
            <h3 className="font-serif text-base font-bold text-slate-900 mb-1">
              Update Valuation for {editingAsset.name}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Enter current verified market valuation or audited statement balance.
            </p>

            <form onSubmit={handleUpdateValuation} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] text-slate-600 uppercase font-semibold block mb-1">
                  New Valuation (₹)
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  value={newValuationInput}
                  onChange={(e) => setNewValuationInput(e.target.value)}
                  className="h-10 w-full px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#eed885] hover:bg-[#dec468] text-slate-950 font-bold text-xs shadow-2xs cursor-pointer"
                >
                  Save Valuation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
