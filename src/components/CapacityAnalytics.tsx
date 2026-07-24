// Saksee · 2026-07-24 · feat/new-design-system
import React, { useMemo } from 'react';
import { DailyOperationalLog } from '../types';

interface CapacityAnalyticsProps {
  weeklyLogs: DailyOperationalLog[];
  isLight: boolean;
}

export default function CapacityAnalytics({ weeklyLogs, isLight }: CapacityAnalyticsProps) {
  const chartHeight = 220;

  const { data, scales } = useMemo(() => {
    if (!weeklyLogs || weeklyLogs.length === 0) return { data: [], scales: null };
    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sorted = [...weeklyLogs].sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));

    const processedData = sorted.map(d => {
      const perfPct = d.productionTarget > 0 ? (d.productionMade / d.productionTarget) * 100 : 0;
      const laborEff = d.hours > 0 ? (d.productionMade / d.hours) : 0;
      return { ...d, perfPct, laborEff };
    });

    const maxPerf = Math.max(...processedData.map(d => d.perfPct), 100);
    const maxLabor = Math.max(...processedData.map(d => d.laborEff), 1);

    return { data: processedData, scales: { maxPerf, maxLabor } };
  }, [weeklyLogs]);

  if (!data || data.length === 0 || !scales) {
    return <div className="card text-xs text-[var(--muted)]">No data available for analytical view.</div>;
  }

  const avgPerf = data.reduce((sum, d) => sum + d.perfPct, 0) / data.length;
  const avgLabor = data.reduce((sum, d) => sum + d.laborEff, 0) / data.length;

  return (
    <div className="card mt-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]" />

      <div className="pb-5">
        <h2 className="text-base font-semibold text-[var(--text)]">Capacity & Labor Analytics</h2>
        <p className="text-xs text-[var(--muted)] mt-0.5">Weekly production performance vs. labor efficiency index</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <span className="metric-label">Avg target match</span>
          <div className={`mt-2 metric-value ${avgPerf >= 100 ? 'text-[var(--ok)]' : 'text-[var(--warn)]'}`}>
            {avgPerf.toFixed(1)}%
          </div>
        </div>
        <div className="card">
          <span className="metric-label">Avg labor efficiency</span>
          <div className="mt-2 metric-value">
            {avgLabor.toFixed(1)} <span className="text-[10px] font-sans opacity-75">units/hour</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar pb-2">
        <div className="min-w-[500px]">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)]">Production target met</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)]">Labor efficiency heat</span>
          </div>

          <div className="flex items-end justify-between px-2 gap-3" style={{ height: chartHeight }}>
            {data.map((d, i) => {
              const heightPct = Math.min((d.perfPct / (scales.maxPerf * 1.1)) * 100, 100);
              const isOver = d.perfPct > 100;
              const effRatio = d.laborEff / scales.maxLabor;
              const alpha = 0.35 + (0.65 * effRatio);

              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  <div
                    className="w-full max-w-[48px] rounded-t transition-all duration-300 flex items-start justify-center pt-2 relative overflow-hidden group-hover:scale-[1.02] border"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: isOver ? `rgba(52, 211, 153, ${alpha})` : `rgba(251, 191, 36, ${alpha})`,
                      borderColor: isOver ? 'var(--ok)' : 'var(--warn)',
                    }}
                  >
                    {d.perfPct >= 100 && (
                      <div
                        className="absolute w-full h-[1px] bg-white/40 border-b border-dashed border-white/20"
                        style={{ bottom: `${(100 / d.perfPct) * 100}%` }}
                      />
                    )}
                    <span className="text-[9px] text-white font-bold font-mono opacity-0 group-hover:opacity-100 drop-shadow-md">
                      {d.perfPct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full text-center mt-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)]">
                    {d.day}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 border-t border-[var(--border)] pt-4 flex flex-wrap items-center justify-center gap-6 text-[9px] font-mono uppercase tracking-wider text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded border bg-[var(--ok)]/80" /> Target met / over
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded border bg-[var(--warn)]/80" /> Under target
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-3 rounded bg-gradient-to-r from-transparent to-[var(--muted)]/80 border border-[var(--border)]" /> Opacity = efficiency ratio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
