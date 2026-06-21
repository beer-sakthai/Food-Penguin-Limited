import { memo, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Activity,
  BrainCircuit,
  Building2,
  ChevronRight,
  Download,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { BranchOperationalWeekMap, CompanyTarget, OperationalDay } from '../types';
import {
  buildBranchSummaries,
  buildCompanyInsightPrompt,
  buildCompanySnapshot,
  buildCompanyTrendData,
  buildOverviewBranchComparisonData,
  buildTargetVariance,
  getChampionBranch,
  getWeekComparisonRange,
} from '../lib/companyKpis';
import { downloadCompanyKpiCsv, downloadCompanyKpiPdf } from '../lib/companyKpiReports';

interface CompanyKpiTabProps {
  branchWeeklyLogsMap: BranchOperationalWeekMap;
  selectedWeekRange: string;
  weekRangeOptions: readonly string[];
  onSelectedWeekRangeChange: (range: string) => void;
  targets: CompanyTarget[];
  theme: 'dark' | 'light';
  onNavigateTab: (tabId: string) => void;
  selectedBranch: string;
}

const DAYS: OperationalDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function CompanyKpiTab({
  branchWeeklyLogsMap,
  selectedWeekRange,
  weekRangeOptions,
  onSelectedWeekRangeChange,
  targets,
  theme,
  onNavigateTab,
  selectedBranch,
}: CompanyKpiTabProps) {
  const isLight = theme === 'light';
  const [period, setPeriod] = useState<'day' | 'week'>('week');
  const [selectedDay, setSelectedDay] = useState<OperationalDay>('Sun');
  const [insight, setInsight] = useState('');
  const [isRefreshingInsight, setIsRefreshingInsight] = useState(false);

  const branchWeeklyLogsByBranch = branchWeeklyLogsMap[selectedWeekRange] || {};
  const previousWeekRange = getWeekComparisonRange(weekRangeOptions, selectedWeekRange);
  const previousWeekLogsByBranch = previousWeekRange ? branchWeeklyLogsMap[previousWeekRange] || {} : {};
  const previousDay = period === 'day' ? DAYS[Math.max(DAYS.indexOf(selectedDay) - 1, 0)] : undefined;

  const branchSummaries = useMemo(
    () => buildBranchSummaries({ branchWeeklyLogsByBranch, targets, period, selectedDay }),
    [branchWeeklyLogsByBranch, period, selectedDay, targets],
  );

  const previousBranchSummaries = useMemo(() => {
    if (period === 'day' && previousDay) {
      return buildBranchSummaries({
        branchWeeklyLogsByBranch,
        targets,
        period: 'day',
        selectedDay: previousDay,
      });
    }

    if (period === 'week' && previousWeekRange) {
      return buildBranchSummaries({
        branchWeeklyLogsByBranch: previousWeekLogsByBranch,
        targets,
        period: 'week',
      });
    }

    return [];
  }, [branchWeeklyLogsByBranch, period, previousDay, previousWeekLogsByBranch, previousWeekRange, targets]);

  const snapshot = useMemo(
    () => buildCompanySnapshot({ currentBranchSummaries: branchSummaries, previousBranchSummaries, period, selectedDay }),
    [branchSummaries, previousBranchSummaries, period, selectedDay],
  );

  const targetVariance = useMemo(() => buildTargetVariance(targets), [targets]);
  const trendData = useMemo(
    () => buildCompanyTrendData(branchWeeklyLogsByBranch, targets),
    [branchWeeklyLogsByBranch, targets],
  );
  const branchComparisonData = useMemo(
    () => buildOverviewBranchComparisonData({ branchSummaries, selectedBranch, vsAverageMode: false }),
    [branchSummaries, selectedBranch],
  );
  const championBranch = useMemo(() => getChampionBranch(branchSummaries), [branchSummaries]);

  const handleRefreshInsight = async () => {
    setIsRefreshingInsight(true);
    setInsight('');
    try {
      const res = await fetch('/api/gemini/low-latency-cmd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: buildCompanyInsightPrompt(snapshot, branchSummaries, targetVariance, selectedWeekRange),
        }),
      });
      const data = await res.json();
      setInsight(data.text || 'No company KPI insight returned.');
    } catch (error: any) {
      setInsight(`Insight refresh failed: ${error.message || error}`);
    } finally {
      setIsRefreshingInsight(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-3xl border p-6 shadow-sm transition-all duration-300 ${isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-3d-gold-dark metallic-base drop-shadow-xl'}`}>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white border-amber-200 text-amber-600' : 'bg-zinc-950 border-zinc-800 text-amber-400'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-3d-gold drop-shadow-md'}`}>Company KPI Command Center</h2>
                <p className="text-xs text-zinc-500">Executive rollups across revenue, production, waste, labor, COGS, and target attainment.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
              <span className={`px-2 py-1 rounded-full border ${isLight ? 'bg-white border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                View: {period === 'week' ? 'Weekly Total' : `${selectedDay} Company Day`}
              </span>
              <span className={`px-2 py-1 rounded-full border ${isLight ? 'bg-white border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                Branches: {branchSummaries.length}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedWeekRange}
              onChange={(e) => onSelectedWeekRangeChange(e.target.value)}
              className={`rounded-xl border px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] ${
                isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-white'
              }`}
            >
              {weekRangeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <div className={`flex p-1 rounded-xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
              <button
                type="button"
                onClick={() => setPeriod('week')}
                className={`px-3 py-1.5 text-[10px] rounded-lg font-mono font-bold uppercase tracking-wider transition-all ${period === 'week' ? 'bg-orange-500 text-white shadow-md' : isLight ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-white'}`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setPeriod('day')}
                className={`px-3 py-1.5 text-[10px] rounded-lg font-mono font-bold uppercase tracking-wider transition-all ${period === 'day' ? 'bg-orange-500 text-white shadow-md' : isLight ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-white'}`}
              >
                Day
              </button>
            </div>

            <button
              type="button"
              onClick={() => downloadCompanyKpiCsv({ snapshot, branchSummaries, selectedWeekRange })}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-[0.98] hover:-translate-y-0.5 ${isLight ? 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100' : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-900'}`}
            >
              <Download className="w-4 h-4 text-orange-500" />
              CSV
            </button>

            <button
              type="button"
              onClick={() => downloadCompanyKpiPdf({ snapshot, branchSummaries, targetVariance, selectedWeekRange })}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-[0.98] hover:-translate-y-0.5 ${isLight ? 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100' : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-900'}`}
            >
              <Download className="w-4 h-4 text-amber-500" />
              PDF
            </button>
          </div>
        </div>

        {period === 'day' && (
          <div className={`mt-5 flex flex-wrap items-center gap-2 rounded-2xl border p-2 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
            {DAYS.map((day) => {
              const active = day === selectedDay;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 text-[10px] rounded-xl font-mono font-bold uppercase tracking-wider transition-all ${active ? 'bg-orange-500 text-white shadow-md' : isLight ? 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100' : 'text-zinc-400 hover:text-white'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {snapshot.metrics.map((metric) => (
          <div
            key={metric.id}
            className={`rounded-3xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800 text-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{metric.label}</p>
                <h3 className={`mt-2 text-2xl font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>{metric.displayValue}</h3>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold border ${
                  metric.status === 'healthy'
                    ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40'
                    : metric.status === 'warning'
                      ? 'bg-amber-950/30 text-amber-400 border-amber-900/40'
                      : 'bg-rose-950/30 text-rose-400 border-rose-900/40'
                }`}
              >
                {metric.status}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-zinc-500">{metric.helperText}</span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${metric.deltaPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {metric.deltaPct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {metric.deltaLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`xl:col-span-2 rounded-3xl border p-6 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/70">
            <div>
              <h3 className={`text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Company Trendline</h3>
              <p className="text-xs text-zinc-500">Daily company movement for sales, production, waste, and COGS.</p>
            </div>
            <button
              type="button"
              onClick={handleRefreshInsight}
              disabled={isRefreshingInsight}
              className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all active:scale-[0.98] hover:-translate-y-0.5 ${isLight ? 'bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200' : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-900'}`}
            >
              {isRefreshingInsight ? <RefreshCw className="w-4 h-4 animate-spin text-orange-500" /> : <BrainCircuit className="w-4 h-4 text-orange-500" />}
              Refresh AI Insight
            </button>
          </div>

          <div className="h-72 mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e4e4e7' : '#27272a'} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : '#09090b',
                    border: isLight ? '1px solid #e4e4e7' : '1px solid #27272a',
                    borderRadius: '16px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2.5} dot={false} name="Sales" />
                <Line type="monotone" dataKey="production" stroke="#10b981" strokeWidth={2.5} dot={false} name="Production" />
                <Line type="monotone" dataKey="wasteCost" stroke="#f43f5e" strokeWidth={2.2} dot={false} name="Waste" />
                <Line type="monotone" dataKey="cogs" stroke="#8b5cf6" strokeWidth={2.2} dot={false} name="COGS" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${isLight ? 'bg-amber-50 border-amber-200 text-zinc-700' : 'bg-zinc-950 border-zinc-800 text-zinc-300'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Manual AI Executive Insight</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{insight || 'Trigger a manual refresh to generate a concise executive KPI summary for the selected period.'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-3xl border p-6 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className={`text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Branch Contribution</h3>
                <p className="text-xs text-zinc-500">Weekly branch distribution based on centralized KPI rollups.</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-mono border ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                Revenue
              </span>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchComparisonData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e4e4e7' : '#27272a'} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLight ? '#ffffff' : '#09090b',
                      border: isLight ? '1px solid #e4e4e7' : '1px solid #27272a',
                      borderRadius: '16px',
                    }}
                  />
                  <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                    {branchComparisonData.map((entry) => (
                      <Cell key={entry.id} fill={entry.fill || entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`rounded-3xl border p-6 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Top Performing Branch</h3>
                <p className="text-xs text-zinc-500">Highest composite efficiency across company KPIs.</p>
              </div>
              <Target className="w-5 h-5 text-orange-500" />
            </div>
            <div className={`mt-4 rounded-2xl border p-4 ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-zinc-950 border-zinc-800'}`}>
              <h4 className={`text-base font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>{championBranch?.shortLabel || 'No branch data'}</h4>
              <p className="mt-1 text-xs text-zinc-500">{championBranch?.branch}</p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div>
                  <span className="text-zinc-500">Efficiency</span>
                  <div className="font-bold text-emerald-500">{championBranch?.efficiencyScore || 0}/100</div>
                </div>
                <div>
                  <span className="text-zinc-500">Waste Rate</span>
                  <div className="font-bold text-rose-500">{championBranch?.wastePct.toFixed(1) || '0.0'}%</div>
                </div>
                <div>
                  <span className="text-zinc-500">Sales</span>
                  <div className="font-bold">€{championBranch?.sales.toLocaleString() || 0}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Prod Attain.</span>
                  <div className="font-bold">{championBranch?.productionAttainmentPct.toFixed(1) || '0.0'}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`xl:col-span-2 rounded-3xl border p-6 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/70">
            <div>
              <h3 className={`text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Branch KPI Drilldown</h3>
              <p className="text-xs text-zinc-500">Compare branch operating mix using real seeded branch operational histories.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {branchSummaries.map((branch) => (
              <div key={branch.id} className={`rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 ${branch.branch === selectedBranch ? 'border-orange-400 shadow-md' : isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-950'}`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>{branch.shortLabel}</h4>
                  <span className="text-[10px] font-mono text-zinc-500">{branch.efficiencyScore}/100</span>
                </div>
                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between"><span className="text-zinc-500">Revenue</span><span className="font-bold">€{branch.sales.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Production</span><span className="font-bold">{branch.production.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Waste</span><span className="font-bold text-rose-500">{branch.wastePct.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Labor Eff.</span><span className="font-bold text-emerald-500">{branch.laborEfficiency.toFixed(1)} u/hr</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">COGS Ratio</span><span className="font-bold text-purple-500">{branch.cogsRatioPct.toFixed(1)}%</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-3xl border p-6 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/70">
            <div>
              <h3 className={`text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Target Variance</h3>
              <p className="text-xs text-zinc-500">Read-only KPI target alignment using the existing target register.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('Target')}
              className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:underline"
            >
              Open Targets
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3 mt-4">
            {targetVariance.map((target) => (
              <div key={target.id} className={`rounded-2xl border p-4 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>{target.name}</h4>
                    <p className="text-[11px] text-zinc-500">{target.metric}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold border ${
                    target.status === 'ahead'
                      ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40'
                      : target.status === 'at-risk'
                        ? 'bg-amber-950/30 text-amber-400 border-amber-900/40'
                        : 'bg-rose-950/30 text-rose-400 border-rose-900/40'
                  }`}>
                    {target.status}
                  </span>
                </div>
                <div className="mt-3 text-xs space-y-1.5">
                  <div className="flex justify-between"><span className="text-zinc-500">Current</span><span className="font-bold">{target.currentValue} {target.unit}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Target</span><span className="font-bold">{target.targetValue} {target.unit}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Variance</span><span className={`font-bold ${target.variance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{target.variance >= 0 ? '+' : ''}{target.variance.toFixed(1)} {target.unit}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CompanyKpiTab);
