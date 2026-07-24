// Saksee · 2026-07-24 · feat/new-design-system
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

  const data = useMemo(() => {
    if (!weeklyLogs || weeklyLogs.length === 0) return [];
    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return [...weeklyLogs].sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));
  }, [weeklyLogs]);

  const averageWeeklyStats = useMemo(() => {
    if (data.length === 0) return { avgTarget: 0, avgMade: 0, pctVariance: 0, absVariance: 0 };
    const totalTarget = data.reduce((sum, d) => sum + d.productionTarget, 0);
    const totalMade = data.reduce((sum, d) => sum + d.productionMade, 0);
    const absVariance = totalMade - totalTarget;
    const pctVariance = totalTarget > 0 ? (absVariance / totalTarget) * 100 : 0;
    return { avgTarget: Math.round(totalTarget / data.length), avgMade: Math.round(totalMade / data.length), pctVariance, absVariance };
  }, [data]);

  const activeStats = useMemo(() => {
    if (hoveredIndex === null || !data[hoveredIndex]) return null;
    const item = data[hoveredIndex];
    const diff = item.productionMade - item.productionTarget;
    const pct = item.productionTarget > 0 ? (diff / item.productionTarget) * 100 : 0;
    return { day: item.day, date: item.date.substring(5), target: item.productionTarget, made: item.productionMade, diff, pct };
  }, [hoveredIndex, data]);

  const { xScale, yScale, targetLinePath, actualLinePath, varianceAreaPath, yTicks } = useMemo(() => {
    if (data.length === 0) {
      return { xScale: () => 0, yScale: () => 0, targetLinePath: '', actualLinePath: '', varianceAreaPath: '', yTicks: [] };
    }

    const x = d3.scalePoint<string>()
      .domain(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
      .range([margin.left, width - margin.right]);

    const maxVal = d3.max(data, (d: DailyOperationalLog) => Math.max(d.productionTarget, d.productionMade)) || 100;
    const minVal = d3.min(data, (d: DailyOperationalLog) => Math.min(d.productionTarget, d.productionMade)) || 0;
    const yPad = (maxVal - minVal) * 0.15 || 20;

    const y = d3.scaleLinear()
      .domain([Math.max(0, minVal - yPad), maxVal + yPad])
      .range([height - margin.bottom, margin.top]);

    const targetLineGen = d3.line<DailyOperationalLog>()
      .x(d => x(d.day) || 0)
      .y(d => y(d.productionTarget))
      .curve(d3.curveMonotoneX);

    const actualLineGen = d3.line<DailyOperationalLog>()
      .x(d => x(d.day) || 0)
      .y(d => y(d.productionMade))
      .curve(d3.curveMonotoneX);

    const areaGen = d3.area<DailyOperationalLog>()
      .x(d => x(d.day) || 0)
      .y0(d => y(d.productionTarget))
      .y1(d => y(d.productionMade))
      .curve(d3.curveMonotoneX);

    return {
      xScale: x,
      yScale: y,
      targetLinePath: targetLineGen(data) || '',
      actualLinePath: actualLineGen(data) || '',
      varianceAreaPath: areaGen(data) || '',
      yTicks: y.ticks(3)
    };
  }, [data, width, margin.left, margin.right, margin.top, margin.bottom]);

  if (data.length === 0) {
    return <div className="card text-xs text-[var(--muted)] text-center py-6">No operational logs to plot variance.</div>;
  }

  const formatNum = (v: number) => Math.abs(v).toLocaleString();

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-2 relative">
      <div className="flex items-center justify-between font-mono text-[9px] select-none leading-none border-b border-dashed pb-1.5 border-[var(--border)]">
        {activeStats ? (
          <>
            <span className="flex items-center gap-1 font-bold text-[var(--warn)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--warn)]" />
              {activeStats.day} ({activeStats.date}):
            </span>
            <span className="font-semibold text-right">
              M:{formatNum(activeStats.made)} vs T:{formatNum(activeStats.target)}
              <span className={`ml-1.5 font-bold ${activeStats.diff >= 0 ? 'text-[var(--ok)]' : 'text-[var(--bad)]'}`}>
                {activeStats.diff >= 0 ? '+' : '-'}{formatNum(activeStats.diff)} ({activeStats.diff >= 0 ? '+' : ''}{activeStats.pct.toFixed(0)}%)
              </span>
            </span>
          </>
        ) : (
          <>
            <span className="font-semibold uppercase tracking-wider text-[var(--muted)]">Weekly drift variance:</span>
            <span className={`font-bold ${averageWeeklyStats.pctVariance >= 0 ? 'text-[var(--ok)]' : 'text-[var(--warn)]'}`}>
              {averageWeeklyStats.pctVariance >= 0 ? '↑ Over' : '↓ Drift'} {Math.abs(averageWeeklyStats.pctVariance).toFixed(1)}%
            </span>
          </>
        )}
      </div>

      <div className="relative">
        <svg width={width} height={height} className="overflow-visible select-none">
          <defs>
            <linearGradient id="varianceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--warn)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--warn)" stopOpacity="0.04" />
            </linearGradient>
            <filter id="glow-variance" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="var(--warn)" floodOpacity="0.15" />
            </filter>
          </defs>

          <g opacity={0.35}>
            {yTicks.map((tick, i) => (
              <line
                key={i}
                x1={margin.left}
                y1={yScale(tick)}
                x2={width - margin.right}
                y2={yScale(tick)}
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray="2,2"
              />
            ))}
          </g>

          <path d={varianceAreaPath} fill="url(#varianceGradient)" />
          <path d={targetLinePath} fill="none" stroke="var(--muted)" strokeWidth={1.25} strokeDasharray="3,3" strokeLinecap="round" />
          <path d={actualLinePath} fill="none" stroke="var(--warn)" strokeWidth={2} strokeLinecap="round" filter="url(#glow-variance)" />

          <g className="text-[7.5px] font-mono" fill="var(--muted)">
            {yTicks.map((tick, i) => (
              <text key={i} x={margin.left - 4} y={yScale(tick) + 2.5} textAnchor="end" opacity={0.8}>
                {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
              </text>
            ))}
          </g>

          <g className="text-[8px] font-mono" fill="var(--muted)">
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
                  fill={isActive ? 'var(--warn)' : 'var(--muted)'}
                  opacity={isActive ? 1.0 : 0.75}
                >
                  {day[0]}
                </text>
              );
            })}
          </g>

          {hoveredIndex !== null && data[hoveredIndex] && (
            <line
              x1={xScale(data[hoveredIndex].day) || 0}
              y1={margin.top}
              x2={xScale(data[hoveredIndex].day) || 0}
              y2={height - margin.bottom}
              stroke="var(--warn)"
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={0.6}
            />
          )}

          {data.map((item, i) => {
            const cx = xScale(item.day) || 0;
            const cyActual = yScale(item.productionMade);
            const cyTarget = yScale(item.productionTarget);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                <circle cx={cx} cy={cyTarget} r={isHovered ? 2 : 1} fill="var(--muted)" opacity={isHovered ? 0.9 : 0.5} />
                <circle
                  cx={cx}
                  cy={cyActual}
                  r={isHovered ? 4.5 : 2.5}
                  fill={isHovered ? 'var(--accent-hover)' : 'var(--warn)'}
                  stroke={isHovered ? 'var(--surface)' : 'transparent'}
                  strokeWidth={isHovered ? 1.5 : 0}
                  className="transition-all duration-150"
                />

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

      <div className="flex items-center justify-center gap-3 text-[7.5px] font-mono text-[var(--muted)] select-none pb-0.5">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-0.5 bg-[var(--warn)] rounded" /> Production actual
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-0.5 border-b border-dashed border-[var(--muted)]" /> Production target
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1 bg-[var(--warn)]/10 rounded-sm border border-[var(--warn)]/20" /> Drift band
        </span>
      </div>
    </div>
  );
}
