import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { DailyOperationalLog } from '../types';

interface CapacityVarianceChartProps {
 weeklyLogs: DailyOperationalLog[];
 isLight: boolean;
}

export default function CapacityVarianceChart({ weeklyLogs, isLight }: CapacityVarianceChartProps) {
 const containerRef = useRef<HTMLDivElement>(null);
 const [width, setWidth] = useState<number>(240);
 const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

 // Responsive width tracker
 useEffect(() => {
 if (!containerRef.current) return;
 const resizeObserver = new ResizeObserver((entries) => {
 for (const entry of entries) {
 if (entry.contentRect.width > 0) {
 setWidth(entry.contentRect.width);
 }
 }
 });
 resizeObserver.observe(containerRef.current);
 return () => resizeObserver.disconnect();
 }, []);

 const height = 110;
 const margin = { top: 12, right: 12, bottom: 20, left: 30 };

 // Calculate metrics on the dataset
 const data = useMemo(() => {
 if (!weeklyLogs || weeklyLogs.length === 0) return [];
 
 // Sort standard order Mon -> Sun
 const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
 return [...weeklyLogs].sort((a, b) => {
 return daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
 });
 }, [weeklyLogs]);

 // Overall Weekly stats
 const averageWeeklyStats = useMemo(() => {
 if (data.length === 0) return { avgTarget: 0, avgMade: 0, pctVariance: 0, absVariance: 0 };
 const totalTarget = data.reduce((sum, d) => sum + d.productionTarget, 0);
 const totalMade = data.reduce((sum, d) => sum + d.productionMade, 0);
 const absVariance = totalMade - totalTarget;
 const pctVariance = totalTarget > 0 ? (absVariance / totalTarget) * 100 : 0;
 return {
 avgTarget: Math.round(totalTarget / data.length),
 avgMade: Math.round(totalMade / data.length),
 pctVariance,
 absVariance
 };
 }, [data]);

 // Active hover stats
 const activeStats = useMemo(() => {
 if (hoveredIndex === null || !data[hoveredIndex]) return null;
 const item = data[hoveredIndex];
 const diff = item.productionMade - item.productionTarget;
 const pct = item.productionTarget > 0 ? (diff / item.productionTarget) * 100 : 0;
 return {
 day: item.day,
 date: item.date.substring(5), // MM-DD
 target: item.productionTarget,
 made: item.productionMade,
 diff,
 pct
 };
 }, [hoveredIndex, data]);

 // D3 Scales & Paths calculations
 const { xScale, yScale, targetLinePath, actualLinePath, varianceAreaPath, yTicks } = useMemo(() => {
 if (data.length === 0) {
 return {
 xScale: () => 0,
 yScale: () => 0,
 targetLinePath: '',
 actualLinePath: '',
 varianceAreaPath: '',
 yTicks: []
 };
 }

 // Domain range
 const x = d3.scalePoint<string>()
 .domain(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
 .range([margin.left, width - margin.right]);

 // Find min/max for Y
 const maxVal = d3.max(data, (d: DailyOperationalLog) => Math.max(d.productionTarget, d.productionMade)) || 100;
 const minVal = d3.min(data, (d: DailyOperationalLog) => Math.min(d.productionTarget, d.productionMade)) || 0;
 const yPad = (maxVal - minVal) * 0.15 || 20;

 const y = d3.scaleLinear()
 .domain([Math.max(0, minVal - yPad), maxVal + yPad])
 .range([height - margin.bottom, margin.top]);

 // Line Generators
 const targetLineGen = d3.line<DailyOperationalLog>()
 .x(d => x(d.day) || 0)
 .y(d => y(d.productionTarget))
 .curve(d3.curveMonotoneX);

 const actualLineGen = d3.line<DailyOperationalLog>()
 .x(d => x(d.day) || 0)
 .y(d => y(d.productionMade))
 .curve(d3.curveMonotoneX);

 // Area Generator for Variance Band
 const areaGen = d3.area<DailyOperationalLog>()
 .x(d => x(d.day) || 0)
 .y0(d => y(d.productionTarget))
 .y1(d => y(d.productionMade))
 .curve(d3.curveMonotoneX);

 const ticks = y.ticks(3);

 return {
 xScale: x,
 yScale: y,
 targetLinePath: targetLineGen(data) || '',
 actualLinePath: actualLineGen(data) || '',
 varianceAreaPath: areaGen(data) || '',
 yTicks: ticks
 };
 }, [data, width, margin.left, margin.right, margin.top, margin.bottom]);

 if (data.length === 0) {
 return (
 <div className={`p-3 text-center text-xs italic ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
 No operational logs to plot variance.
 </div>
 );
 }

 // Format helper for numbers
 const formatNum = (v: number) => Math.abs(v).toLocaleString();

 return (
 <div ref={containerRef} className="w-full flex flex-col gap-2 relative">
 {/* Dynamic Summary HUD */}
 <div className="flex items-center justify-between font-mono text-[9px] select-none leading-none border-b border-dashed pb-1.5 border-zinc-800/10 dark:border-zinc-800/40">
 {activeStats ? (
 <>
 <span className="flex items-center gap-1 font-bold text-orange-500">
 <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
 {activeStats.day} ({activeStats.date}):
 </span>
 <span className="font-semibold text-right">
 M:{formatNum(activeStats.made)} vs T:{formatNum(activeStats.target)}
 <span className={`ml-1.5 font-bold ${activeStats.diff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
 {activeStats.diff >= 0 ? '+' : '-'}{formatNum(activeStats.diff)} ({activeStats.diff >= 0 ? '+' : ''}{activeStats.pct.toFixed(0)}%)
 </span>
 </span>
 </>
 ) : (
 <>
 <span className={`font-semibold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
 Weekly Drift Variance:
 </span>
 <span className={`font-bold ${averageWeeklyStats.pctVariance >= 0 ? 'text-emerald-500 font-extrabold' : 'text-orange-500 font-extrabold'}`}>
 {averageWeeklyStats.pctVariance >= 0 ? '↑ Over' : '↓ Drift'} {Math.abs(averageWeeklyStats.pctVariance).toFixed(1)}%
 </span>
 </>
 )}
 </div>

 {/* SVG Canvas Area */}
 <div className="relative">
 <svg 
 width={width} 
 height={height} 
 className="overflow-visible select-none"
 >
 <defs>
 {/* Soft glowing variance fill gradient */}
 <linearGradient id="varianceGradient" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#f97316" stopOpacity="0.16" />
 <stop offset="100%" stopColor="var(--warn)" stopOpacity="0.04" />
 </linearGradient>
 
 {/* Spark line mask or glowing filter for a super premium look */}
 <filter id="glow-variance" x="-10%" y="-10%" width="120%" height="120%">
 <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#f97316" floodOpacity="0.12" />
 </filter>
 </defs>

 {/* Guidelines Grid */}
 <g opacity={0.35}>
 {yTicks.map((tick, i) => (
 <line
 key={i}
 x1={margin.left}
 y1={yScale(tick)}
 x2={width - margin.right}
 y2={yScale(tick)}
 stroke={isLight ? '#e4e4e7' : '#27272a'}
 strokeWidth={1}
 strokeDasharray="2,2"
 />
 ))}
 </g>

 {/* Variance Shaded band */}
 <path
 d={varianceAreaPath}
 fill="url(#varianceGradient)"
 className="transition-all duration-305"
 />

 {/* Target Reference Line (Dashed) */}
 <path
 d={targetLinePath}
 fill="none"
 stroke={isLight ? '#71717a' : '#52525b'}
 strokeWidth={1.25}
 strokeDasharray="3,3"
 strokeLinecap="round"
 className="transition-all duration-305"
 />

 {/* Actual Line Curve */}
 <path
 d={actualLinePath}
 fill="none"
 stroke="#f97316"
 strokeWidth={2}
 strokeLinecap="round"
 filter="url(#glow-variance)"
 className="transition-all duration-305"
 />

 {/* Y Axis Guide ticks */}
 <g className="text-[7.5px] font-mono" fill={isLight ? '#71717a' : '#71717a'}>
 {yTicks.map((tick, i) => (
 <text
 key={i}
 x={margin.left - 4}
 y={yScale(tick) + 2.5}
 textAnchor="end"
 opacity={0.8}
 >
 {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
 </text>
 ))}
 </g>

 {/* X Axis (Days of Week) */}
 <g className="text-[8px] font-mono" fill={isLight ? '#71717a' : '#71717a'}>
 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
 const xPos = xScale(day) || 0;
 const isActive = hoveredIndex !== null && data[hoveredIndex]?.day === day;
 return (
 <text
 key={i}
 x={xPos}
 y={height - 4}
 textAnchor="middle"
 fontWeight={isActive ? 'bold' : 'normal'}
 fill={isActive ? '#f97316' : (isLight ? '#71717a' : '#a1a1aa')}
 opacity={isActive ? 1.0 : 0.75}
 >
 {day[0]}
 </text>
 );
 })}
 </g>

 {/* Active Hover vertical guide indicator */}
 {hoveredIndex !== null && data[hoveredIndex] && (
 <line
 x1={xScale(data[hoveredIndex].day) || 0}
 y1={margin.top}
 x2={xScale(data[hoveredIndex].day) || 0}
 y2={height - margin.bottom}
 stroke="#f97316"
 strokeWidth={1}
 strokeDasharray="2,2"
 opacity={0.6}
 />
 )}

 {/* Data Nodes circles */}
 {data.map((item, i) => {
 const cx = xScale(item.day) || 0;
 const cyActual = yScale(item.productionMade);
 const cyTarget = yScale(item.productionTarget);
 const isHovered = hoveredIndex === i;

 return (
 <g key={i}>
 {/* Target node dot (micro size) */}
 <circle
 cx={cx}
 cy={cyTarget}
 r={isHovered ? 2 : 1}
 fill={isLight ? '#71717a' : '#52525b'}
 opacity={isHovered ? 0.9 : 0.5}
 />

 {/* Actual node dot with hover hit target ring */}
 <circle
 cx={cx}
 cy={cyActual}
 r={isHovered ? 4.5 : 2.5}
 fill={isHovered ? '#ff781f' : '#f97316'}
 stroke={isHovered ? (isLight ? '#ffffff' : '#09090b') : 'transparent'}
 strokeWidth={isHovered ? 1.5 : 0}
 className="transition-all duration-150"
 />

 {/* Transparent Interactive touch zone for mouseover interaction */}
 <rect
 x={cx - (width / 14)}
 y={margin.top}
 width={width / 7}
 height={height - margin.top - margin.bottom}
 fill="transparent"
 className="cursor-crosshair focus:outline-none"
 onMouseEnter={() => setHoveredIndex(i)}
 onMouseLeave={() => setHoveredIndex(null)}
 />
 </g>
 );
 })}
 </svg>
 </div>

 {/* Mini Legend labels */}
 <div className="flex items-center justify-center gap-3 text-[7.5px] font-mono text-zinc-400 dark:text-zinc-500 select-none pb-0.5">
 <span className="flex items-center gap-1">
 <span className="w-1.5 h-0.5 bg-orange-500 rounded" /> Production Actual
 </span>
 <span className="flex items-center gap-1">
 <span className="w-1.5 h-0.5 border-b border-dashed border-zinc-500" /> Production Target
 </span>
 <span className="flex items-center gap-1">
 <span className="w-1.5 h-1 bg-orange-500/10 rounded-sm border border-orange-550/10" /> Drift Band
 </span>
 </div>
 </div>
 );
}
