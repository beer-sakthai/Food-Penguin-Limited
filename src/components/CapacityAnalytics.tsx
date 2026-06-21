import React, { useMemo } from 'react';
import { DailyOperationalLog } from '../types';
import * as d3 from 'd3';

interface CapacityAnalyticsProps {
 weeklyLogs: DailyOperationalLog[];
 isLight: boolean;
}

export default function CapacityAnalytics({ weeklyLogs, isLight }: CapacityAnalyticsProps) {
 const chartHeight = 220;
 const margin = { top: 20, right: 20, bottom: 30, left: 40 };

 const { data, scales } = useMemo(() => {
 if (!weeklyLogs || weeklyLogs.length === 0) return { data: [], scales: null };
 
 // Sort properly
 const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
 const sorted = [...weeklyLogs].sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));

 const processedData = sorted.map(d => {
 const perfPct = d.productionTarget > 0 ? (d.productionMade / d.productionTarget) * 100 : 0;
 const laborEff = d.hours > 0 ? (d.productionMade / d.hours) : 0;
 return {
 ...d,
 perfPct,
 laborEff
 };
 });

 const maxPerf = d3.max(processedData, d => d.perfPct) || 100;
 const maxLabor = d3.max(processedData, d => d.laborEff) || 100;

 return {
 data: processedData,
 scales: {
 maxPerf,
 maxLabor
 }
 };
 }, [weeklyLogs]);

 if (!data || data.length === 0 || !scales) {
 return <div className="p-4 text-xs italic text-zinc-500">No data available for analytical view.</div>;
 }

 // Find average
 const avgPerf = data.reduce((sum, d) => sum + d.perfPct, 0) / data.length;
 const avgLabor = data.reduce((sum, d) => sum + d.laborEff, 0) / data.length;

 return (
 <div className={`rounded-xl border p-5 shadow-sm transition-all mt-6 relative overflow-hidden ${
 isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-900 text-white'
 }`}>
 <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isLight ? 'from-indigo-400 to-indigo-300' : 'from-indigo-600 to-indigo-500'}`} />
 
 <div className="pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h2 className={`text-base font-sans font-semibold tracking-tight ${isLight ? 'text-zinc-800' : 'text-white'}`}>Capacity & Labor Analytics</h2>
 <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Weekly Production Performance vs. Labor Efficiency Index</p>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
 <div className={`p-4 rounded-xl border flex flex-col justify-center ${isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-zinc-900/50 border-zinc-850'}`}>
 <span className={`text-[9.5px] font-mono tracking-widest uppercase mb-1.5 opacity-80 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Avg Target Match</span>
 <div className={`text-2xl font-bold font-sans tracking-tight ${avgPerf >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
 {avgPerf.toFixed(1)}%
 </div>
 </div>
 <div className={`p-4 rounded-xl border flex flex-col justify-center ${isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-zinc-900/50 border-zinc-850'}`}>
 <span className={`text-[9.5px] font-mono tracking-widest uppercase mb-1.5 opacity-80 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Avg Labor Efficiency</span>
 <div className={`text-2xl font-bold font-sans tracking-tight ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
 {avgLabor.toFixed(1)} <span className={`text-[10px] ml-0.5 tracking-normal font-sans opacity-75`}>units/hour</span>
 </div>
 </div>
 </div>

 <div className="w-full overflow-x-auto custom-scrollbar pb-2">
 <div className="min-w-[500px]">
 <div className="flex justify-between items-center mb-4 px-2">
 <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Production Target Met</span>
 <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Labor Efficiency Heat</span>
 </div>
 
 <div className="flex items-end justify-between px-2 gap-3" style={{ height: chartHeight }}>
 {data.map((d, i) => {
 const heightPct = Math.min((d.perfPct / (scales.maxPerf * 1.1)) * 100, 100);
 const isOver = d.perfPct > 100;
 
 // Normalize efficiency for opacity mapping
 const effRatio = d.laborEff / scales.maxLabor; 
 
 // Base colors
 const emerald = isLight ? '16, 185, 129' : '5, 150, 105';
 const amber = isLight ? '245, 158, 11' : '217, 119, 6';
 const baseRgb = isOver ? emerald : amber;
 const alpha = 0.35 + (0.65 * effRatio);

 return (
 <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
 {/* Tooltip */}
 <div className={`absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 flex flex-col items-center drop-shadow-xl ${isLight ? 'filter' : ''}`}>
 <div className={`text-[10px] font-mono p-2 rounded shadow-lg border ${
 isLight ? 'bg-zinc-900 text-zinc-50 border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200'
 }`}>
 <span className="font-bold">{d.day}</span>
 <div className="mt-1 flex items-center gap-2">
 <span>Perf: <span className={isOver ? 'text-emerald-400' : 'text-amber-400'}>{d.perfPct.toFixed(1)}%</span></span>
 <span>Eff: <span className="text-indigo-400">{d.laborEff.toFixed(1)}</span></span>
 </div>
 </div>
 <div className={`w-2 h-2 rotate-45 -mt-1 border-b border-r ${
 isLight ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
 }`} />
 </div>

 <div 
 className={`w-full max-w-[48px] rounded-t transition-all duration-300 flex items-start justify-center pt-2 relative overflow-hidden group-hover:scale-[1.02] ${
 isLight ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
 }`}
 style={{ 
 height: `${heightPct}%`, 
 backgroundColor: `rgba(${baseRgb}, ${alpha})`,
 border: `1px solid rgba(${baseRgb}, 0.8)`
 }}
 >
 {/* Target Marker Line at 100% */}
 {d.perfPct >= 100 && (
 <div 
 className="absolute w-full h-[1px] bg-white/40 border-b border-dashed border-white/20"
 style={{ bottom: `${(100 / d.perfPct) * 100}%` }}
 />
 )}

 <span className="text-[9px] text-white font-bold font-mono tracking-tighter opacity-0 group-hover:opacity-100 drop-shadow-md">
 {d.perfPct.toFixed(0)}%
 </span>
 </div>
 <div className={`w-full text-center mt-3 text-[10px] font-mono font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
 {d.day}
 </div>
 </div>
 );
 })}
 </div>
 <div className={`mt-5 border-t pt-4 flex flex-wrap items-center justify-center gap-6 text-[9px] font-mono uppercase tracking-widest ${isLight ? 'text-zinc-500 border-zinc-200' : 'text-zinc-500 border-zinc-850'}`}>
 <div className="flex items-center gap-2">
 <span className={`w-3.5 h-3.5 rounded border ${isLight ? 'bg-emerald-500/80 border-emerald-600' : 'bg-emerald-600/80 border-emerald-500'}`} /> 
 Target Met / Over
 </div>
 <div className="flex items-center gap-2">
 <span className={`w-3.5 h-3.5 rounded border ${isLight ? 'bg-amber-500/80 border-amber-600' : 'bg-amber-600/80 border-amber-500'}`} /> 
 Under Target
 </div>
 <div className="flex items-center gap-2">
 <div className="w-16 h-3 rounded bg-gradient-to-r from-transparent to-zinc-500/80 border border-zinc-500/30" /> 
 Color Opacity = Efficiency Ratio
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
