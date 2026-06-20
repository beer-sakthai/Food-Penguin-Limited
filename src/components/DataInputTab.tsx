import React, { useState, useEffect } from 'react';
import { CoreMetrics, BranchId, BranchData } from '../types';
import { BRANCHES } from '../data';
import { Save, Activity, UploadCloud, Store, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DataInputTabProps {
  onSyncData: (branchId: BranchId, metrics: CoreMetrics) => void;
  branchesData: Record<BranchId, BranchData>;
}

export default function DataInputTab({ onSyncData, branchesData }: DataInputTabProps) {
  const [targetBranch, setTargetBranch] = useState<BranchId>(BRANCHES[0].id as BranchId);
  
  // State for manual entries
  const [manualSales, setManualSales] = useState("");
  const [manualProduction, setManualProduction] = useState("");
  const [manualWaste, setManualWaste] = useState("");
  const [manualHours, setManualHours] = useState("");
  const [manualProductionTarget, setManualProductionTarget] = useState("");
  const [manualHealthScore, setManualHealthScore] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // When target branch changes, populate form with its current metrics
  useEffect(() => {
    const currentMetrics = branchesData[targetBranch].metrics;
    setManualSales(currentMetrics.salesToday.toString());
    setManualProduction(currentMetrics.productionItems.toString());
    setManualWaste(currentMetrics.wasteCost.toString());
    setManualHours(currentMetrics.hoursScheduled.toString());
    setManualProductionTarget(currentMetrics.productionTarget.toString());
    setManualHealthScore(currentMetrics.aiHealthScore.toString());
    setSyncSuccess(false);
  }, [targetBranch, branchesData]);

  const handleSync = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setSyncSuccess(false);

    // Simulate network delay for "smooth UI" feel
    setTimeout(() => {
      const updatedMetrics: CoreMetrics = {
        ...branchesData[targetBranch].metrics,
        salesToday: parseFloat(manualSales) || 0,
        productionItems: parseInt(manualProduction, 10) || 0,
        wasteCost: parseFloat(manualWaste) || 0,
        hoursScheduled: parseFloat(manualHours) || 0,
        productionTarget: parseInt(manualProductionTarget, 10) || 0,
        aiHealthScore: parseInt(manualHealthScore, 10) || 0
      };
      
      onSyncData(targetBranch, updatedMetrics);
      setIsSyncing(false);
      setSyncSuccess(true);
    }, 800);
  };

  return (
    <div className="h-full space-y-6 overflow-y-auto scrollbar-hide pb-10">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 dark:bg-orange-500/5 rounded-full filter blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-100 dark:border-slate-700">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Manual Data Input</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sync end-of-day metrics directly to the main dashboard.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <Store className="w-4 h-4 text-slate-400 ml-2" />
            <select 
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value as BranchId)}
              className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer pr-8"
            >
              {BRANCHES.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSync} className="mt-8 space-y-8 relative z-10">
          
          <div className="bg-orange-50/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-orange-100 dark:border-slate-700/50 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Warning:</strong> Synchronizing data here will overwrite the current live metrics for <span className="font-bold text-orange-600 dark:text-orange-400">{BRANCHES.find(b => b.id === targetBranch)?.name}</span>. Ensure values are audited before submission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Gross Revenue (€)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={manualSales}
                  onChange={(e) => setManualSales(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-amber-500/20 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Items Prod (pcs)</label>
              <input
                type="number"
                required
                value={manualProduction}
                onChange={(e) => setManualProduction(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-amber-500/20 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Waste Cost (€)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={manualWaste}
                  onChange={(e) => setManualWaste(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-amber-500/20 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Rostered (hrs)</label>
              <input
                type="number"
                step="0.1"
                required
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-amber-500/20 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>
            
            {/* Advanced Metrics Area */}
            <div className="space-y-2 lg:col-span-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-amber-500">Target Production (pcs)</label>
              <input
                type="number"
                required
                value={manualProductionTarget}
                onChange={(e) => setManualProductionTarget(e.target.value)}
                className="w-full px-4 py-3 bg-emerald-50 dark:bg-amber-950/20 border border-emerald-200 dark:border-amber-500/30 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
            
            <div className="space-y-2 lg:col-span-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-amber-500">AI Health Score (%)</label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={manualHealthScore}
                  onChange={(e) => setManualHealthScore(e.target.value)}
                  className="w-full pr-8 pl-4 py-3 bg-emerald-50 dark:bg-amber-950/20 border border-emerald-200 dark:border-amber-500/30 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <div>
              {syncSuccess && (
                <span className="text-emerald-500 text-sm font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Dashboard synchronized successfully
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isSyncing}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSyncing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Syncing to Core...
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  Sync Data to Dashboard
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
