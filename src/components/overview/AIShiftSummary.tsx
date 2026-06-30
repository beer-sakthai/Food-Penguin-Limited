
import React, { useState } from 'react';
import { CoreMetrics, DailyOperationalLog } from '../../types';
import { Sparkles, BrainCircuit } from 'lucide-react';

interface AIShiftSummaryProps {
  metrics: CoreMetrics;
  selectedBranch: string;
  activeLog: DailyOperationalLog;
  theme?: 'dark' | 'light';
}

export default function AIShiftSummary({ metrics, selectedBranch, activeLog, theme = 'dark' }: AIShiftSummaryProps) {
  const isLight = theme === 'light';
  const [shiftSummary, setShiftSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string>("");

  const fetchShiftSummary = async () => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const response = await fetch("/api/gemini/shift-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: selectedBranch,
          metrics: {
            salesToday: metrics.salesToday,
            wasteCost: metrics.wasteCost,
            productionTarget: metrics.productionTarget,
            productionItems: metrics.productionItems,
            aiHealthScore: metrics.aiHealthScore
          }
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.summary) {
        setShiftSummary(data.summary);
      } else {
        throw new Error("No summary returned");
      }
    } catch (err: any) {
      console.error("Error fetching shift summary:", err);
      setSummaryError(err.message || "Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div id="ai-shift-summary" className={`rounded-3xl border p-6 shadow-sm overflow-hidden relative font-sans transition-all duration-300 ${isLight ? 'bg-orange-50/50 border border-orange-200' : 'bg-3d-copper-dark metallic-base drop-shadow-xl'}`}>
      <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />
      
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 border rounded-2xl transition-all duration-300 ${isLight ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-orange-950/30 border-orange-900/40 text-orange-400'}`}>
            <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse" />
          </div>
          <div>
            <h3 className={`text-lg font-sans font-bold flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-3d-gold drop-shadow-md'}`}>
              AI Live Shift Summary Report
              <span className={`px-2 py-0.5 rounded border text-[9px] font-mono uppercase tracking-widest font-bold ${isLight ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
                Live Analysis
              </span>
            </h3>
            <p className="subtitle text-xs text-zinc-500">
              Cognitive evaluation of performance metrics for {selectedBranch} on {activeLog.day} ({activeLog.date})
            </p>
          </div>
        </div>

        <button
          onClick={fetchShiftSummary}
          disabled={summaryLoading}
          type="button"
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 border  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:shadow-md disabled:opacity-50 ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200' : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:text-white'}`}
        >
          {summaryLoading ? (
            <>
              <span className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <BrainCircuit className="w-3.5 h-3.5" />
              Regenerate Feedback
            </>
          )}
        </button>
      </div>

      <div className="mt-6">
        {summaryLoading ? (
          <div className="space-y-3 py-2 animate-pulse">
            <div className={`h-4 rounded-full w-3/4 ${isLight ? 'bg-zinc-100' : 'bg-zinc-800/50'}`} />
            <div className={`h-4 rounded-full w-5/6 ${isLight ? 'bg-zinc-100' : 'bg-zinc-800/50'}`} />
            <div className={`h-4 rounded-full w-2/3 ${isLight ? 'bg-zinc-100' : 'bg-zinc-800/50'}`} />
          </div>
        ) : summaryError ? (
          <div className={`p-4 rounded-2xl border text-xs font-mono/80 ${isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-950/20 border-rose-900/40 text-rose-400'}`}>
            ⚠️ Failed to fetch live summary feedback: {summaryError}. Please verify your API key is correctly configured.
          </div>
        ) : (
          <div className={`p-5 rounded-2xl border relative overflow-hidden transition-colors ${isLight ? 'bg-orange-50/20 border-orange-100/70 text-zinc-800' : 'bg-orange-950/5 border-orange-900/10 text-zinc-300'}`}>
            <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/5 rounded-full filter blur-xl pointer-events-none" />
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans relative z-10 italic">
              "{shiftSummary || 'Selecting metrics and compiling the shift trajectory summary...'}"
            </p>
            
            <div className="flex flex-wrap items-center gap-6 mt-4 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 font-mono text-[10px] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${Math.min(100, Math.max(50, Math.round(95 - (activeLog.waste / (activeLog.sales || 1)) * 110))) >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>Efficiency Score: {Math.min(100, Math.max(50, Math.round(95 - (activeLog.waste / (activeLog.sales || 1)) * 110)))}%</span>
              </div>
              <div>Sales: €{activeLog.sales.toLocaleString()}</div>
              <div>Waste: €{activeLog.waste.toFixed(2)}</div>
              <div>Production Items: {activeLog.productionMade}/{activeLog.productionTarget}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
