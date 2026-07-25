import React, { useMemo, useState } from "react";
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  Target,
  Clock,
  Package,
  Trash2,
  Lightbulb,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
} from "lucide-react";
import type { DailyOperationalLog, SalesOrder } from "../types";

interface AnalyticsTabProps {
  weeklyLogs: DailyOperationalLog[];
  metrics: {
    salesToday: number;
    cogsToday: number;
    wasteCost: number;
    productionItems: number;
    productionTarget: number;
    hoursScheduled: number;
    aiHealthScore: number;
  };
  selectedBranch: string;
  orders: SalesOrder[];
}

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsTab({ weeklyLogs, metrics, selectedBranch, orders }: AnalyticsTabProps) {
  const [focusMetric, setFocusMetric] = useState("all");

  const logs = useMemo(() => {
    const ordered = [...weeklyLogs].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
    return ordered.map((l) => {
      const cogs = l.cogs || { tazaki: 0, sysco: 0, bulza: 0, sticker: 0, others: 0 };
      const totalCogs = cogs.tazaki + cogs.sysco + cogs.bulza + cogs.sticker + cogs.others;
      return {
        ...l,
        cogsPct: l.sales > 0 ? totalCogs / l.sales : 0,
        wastePct: totalCogs > 0 ? (l.waste || 0) / totalCogs : 0,
        hoursPer100: l.sales > 0 ? (l.hours / l.sales) * 100 : 0,
      };
    });
  }, [weeklyLogs]);

  const lastWeek = logs.slice(-7);
  const avgSales = lastWeek.reduce((a, l) => a + l.sales, 0) / (lastWeek.length || 1);
  const avgCogsPct = lastWeek.reduce((a, l) => a + l.cogsPct, 0) / (lastWeek.length || 1);
  const avgWastePct = lastWeek.reduce((a, l) => a + l.wastePct, 0) / (lastWeek.length || 1);
  const avgHours = lastWeek.reduce((a, l) => a + l.hours, 0) / (lastWeek.length || 1);
  const avgProduction = lastWeek.reduce((a, l) => a + l.productionMade, 0) / (lastWeek.length || 1);

  const nextWeekForecast = useMemo(() => {
    const out = [];
    for (let i = 0; i < 7; i++) {
      const dayName = DAY_ORDER[i];
      const sameDay = logs.find((l) => l.day === dayName);
      const yesterday = logs[logs.length - 1] || logs[0];
      const forecastSales = sameDay ? sameDay.sales * 0.4 + yesterday.sales * 0.3 + avgSales * 0.3 : yesterday.sales * 0.3 + avgSales * 0.7;
      const target = forecastSales * 1.1;
      const forecastCogs = forecastSales * avgCogsPct;
      const forecastWaste = forecastCogs * avgWastePct;
      const forecastHours = avgSales > 0 ? (avgHours / avgSales) * forecastSales : 0;
      const forecastProduction = avgSales > 0 ? (avgProduction / avgSales) * target : 0;
      out.push({ day: dayName, sales: forecastSales, target, cogs: forecastCogs, waste: forecastWaste, hours: forecastHours, production: forecastProduction });
    }
    return out;
  }, [logs, avgSales, avgCogsPct, avgWastePct, avgHours, avgProduction]);

  const currentSnapshot = useMemo(() => {
    const netSales = metrics.salesToday;
    const cogsPct = netSales > 0 ? metrics.cogsToday / netSales : 0;
    const wastePct = metrics.cogsToday > 0 ? metrics.wasteCost / metrics.cogsToday : 0;
    return {
      sales: netSales,
      target: netSales * 1.1,
      cogsPct,
      wastePct,
      productionItems: metrics.productionItems,
      productionTarget: metrics.productionTarget,
      hoursScheduled: metrics.hoursScheduled,
      hoursPer100Sales: netSales > 0 ? (metrics.hoursScheduled / netSales) * 100 : 0,
      healthScore: metrics.aiHealthScore,
    };
  }, [metrics]);

  const insights = useMemo(() => {
    const list: { severity: "ok" | "warn" | "critical"; metric: string; message: string; impact: string; action: string }[] = [];
    if (currentSnapshot.cogsPct > 0.32) {
      list.push({
        severity: currentSnapshot.cogsPct > 0.35 ? "critical" : "warn",
        metric: "COGS",
        message: `COGS is ${(currentSnapshot.cogsPct * 100).toFixed(1)}% of net sales — target is ~30%.`,
        impact: `Each €1,000 sales loses €${((currentSnapshot.cogsPct - 0.3) * 1000).toFixed(0)} more than target.`,
        action: "Renegotiate suppliers, reduce portions on low-margin items, or switch SKUs.",
      });
    }
    if (currentSnapshot.wastePct > 0.12) {
      list.push({
        severity: currentSnapshot.wastePct > 0.15 ? "critical" : "warn",
        metric: "Waste",
        message: `Waste cost is ${(currentSnapshot.wastePct * 100).toFixed(1)}% of COGS — target is ~10%.`,
        impact: `Cut production 10–15% tomorrow to save ~€${(metrics.wasteCost * 0.12).toFixed(0)}.`,
        action: "Prep less and push fastest sellers first.",
      });
    }
    if (currentSnapshot.hoursPer100Sales > 8) {
      list.push({
        severity: "warn",
        metric: "Hours",
        message: `Labor is ${currentSnapshot.hoursPer100Sales.toFixed(1)}h per €100 sales.`,
        impact: "Above 8h threshold — payroll efficiency is down.",
        action: "Align roster to sales curve and trim quiet-day hours.",
      });
    }
    if (currentSnapshot.productionItems < currentSnapshot.productionTarget * 0.9) {
      list.push({
        severity: "warn",
        metric: "Production",
        message: `Made ${currentSnapshot.productionItems}/${currentSnapshot.productionTarget} items today.`,
        impact: "Shortfall risks lost sales if demand holds.",
        action: "Check prep capacity or ingredient availability.",
      });
    }
    if (currentSnapshot.sales < currentSnapshot.target * 0.9) {
      list.push({
        severity: currentSnapshot.sales < currentSnapshot.target * 0.75 ? "critical" : "warn",
        metric: "Sales",
        message: `Sales €${currentSnapshot.sales.toFixed(0)} vs target €${currentSnapshot.target.toFixed(0)}.`,
        impact: `Gap is €${(currentSnapshot.target - currentSnapshot.sales).toFixed(0)} today.`,
        action: "Run lunch combo or counter upsell on top sellers.",
      });
    }
    if (!list.length) {
      list.push({
        severity: "ok",
        metric: "Overall",
        message: `Health score ${currentSnapshot.healthScore}/100 — metrics are on target.`,
        impact: "No critical issues detected.",
        action: "Maintain current controls and monitor end-of-day waste.",
      });
    }
    return list;
  }, [currentSnapshot, metrics.wasteCost]);

  const topOrders = useMemo(() => {
    const counts: Record<string, { item: string; qty: number; amount: number }> = {};
    for (const o of orders) {
      if (!counts[o.item]) counts[o.item] = { item: o.item, qty: 0, amount: 0 };
      counts[o.item].qty += o.quantity;
      counts[o.item].amount += o.amount;
    }
    return Object.values(counts).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [orders]);

  const weekTotals = useMemo(() => {
    const totalSales = lastWeek.reduce((a, l) => a + l.sales, 0);
    const totalCogs = lastWeek.reduce((a, l) => {
      const c = l.cogs || { tazaki: 0, sysco: 0, bulza: 0, sticker: 0, others: 0 };
      return a + c.tazaki + c.sysco + c.bulza + c.sticker + c.others;
    }, 0);
    const totalWaste = lastWeek.reduce((a, l) => a + (l.waste || 0), 0);
    const totalHours = lastWeek.reduce((a, l) => a + l.hours, 0);
    const totalProduction = lastWeek.reduce((a, l) => a + l.productionMade, 0);
    const totalTarget = lastWeek.reduce((a, l) => a + l.productionTarget, 0);
    return { totalSales, totalCogs, totalWaste, totalHours, totalProduction, totalTarget };
  }, [lastWeek]);

  const combinedChart = useMemo(() => {
    return lastWeek.map((l) => ({
      day: l.day,
      sales: l.sales,
      target: l.sales * 1.1,
      cogsPct: +(l.cogsPct * 100).toFixed(1),
      wastePct: +(l.wastePct * 100).toFixed(1),
      hours: l.hours,
      production: l.productionMade,
      productionTarget: l.productionTarget,
    }));
  }, [lastWeek]);

  const showSales = focusMetric === "all" || focusMetric === "sales";
  const showCogs = focusMetric === "all" || focusMetric === "cogs";
  const showWaste = focusMetric === "all" || focusMetric === "waste";
  const showHours = focusMetric === "all" || focusMetric === "hours";
  const showProduction = focusMetric === "all" || focusMetric === "production";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Operational Analytics</h1>
            <p className="text-xs text-slate-400">{selectedBranch} · last 7 days · next 7 days forecast</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "sales", "cogs", "waste", "hours", "production"].map((m) => (
            <button
              key={m}
              onClick={() => setFocusMetric(m)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                focusMetric === m ? "bg-blue-500 text-white border-blue-500" : "bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-500"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Week sales" value={`€${weekTotals.totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub={`Avg €${avgSales.toFixed(0)}/day`} icon={<TrendingUp className="w-4 h-4" />} />
        <KpiCard label="Week COGS" value={`${weekTotals.totalSales > 0 ? ((weekTotals.totalCogs / weekTotals.totalSales) * 100).toFixed(1) : "0.0"}%`} sub={`€${weekTotals.totalCogs.toFixed(0)} total`} warn={weekTotals.totalSales > 0 && weekTotals.totalCogs / weekTotals.totalSales > 0.32} icon={<Target className="w-4 h-4" />} />
        <KpiCard label="Week waste" value={`${weekTotals.totalCogs > 0 ? ((weekTotals.totalWaste / weekTotals.totalCogs) * 100).toFixed(1) : "0.0"}%`} sub={`€${weekTotals.totalWaste.toFixed(0)} total`} warn={weekTotals.totalCogs > 0 && weekTotals.totalWaste / weekTotals.totalCogs > 0.12} icon={<Trash2 className="w-4 h-4" />} />
        <KpiCard label="Production" value={`${weekTotals.totalProduction.toLocaleString()}`} sub={`Target ${weekTotals.totalTarget.toLocaleString()}`} warn={weekTotals.totalProduction < weekTotals.totalTarget * 0.9} icon={<Package className="w-4 h-4" />} />
      </div>

      <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <Lightbulb className="w-4 h-4 text-amber-400" /> Improvement Opportunities
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((ins, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border text-sm ${
                ins.severity === "critical"
                  ? "bg-red-950/30 border-red-900/40 text-red-100"
                  : ins.severity === "warn"
                    ? "bg-amber-950/20 border-amber-900/30 text-amber-100"
                    : "bg-emerald-950/20 border-emerald-900/30 text-emerald-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {ins.severity === "ok" ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : ins.severity === "warn" ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <ArrowDownRight className="w-4 h-4 text-red-400" />}
                <span className="font-semibold">{ins.metric}</span>
              </div>
              <p className="mb-1">{ins.message}</p>
              <p className="text-xs text-slate-400 mb-2">Impact: {ins.impact}</p>
              <div className="text-xs font-medium text-blue-300">Action: {ins.action}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <BarChart3 className="w-4 h-4 text-blue-400" /> Last 7 Days vs Targets
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedChart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12 }} itemStyle={{ color: "#e2e8f0" }} />
              {showSales && <><Bar dataKey="sales" name="Sales (€)" fill="#3b82f6" radius={[6, 6, 0, 0]} /><Line type="monotone" dataKey="target" name="Target (€)" stroke="#94a3b8" strokeDasharray="4 3" strokeWidth={2} dot={false} /></>}
              {showProduction && <Bar dataKey="production" name="Production made" fill="#10b981" radius={[6, 6, 0, 0]} />}
              {showProduction && <Bar dataKey="productionTarget" name="Production target" fill="#059669" radius={[6, 6, 0, 0]} />}
              {showCogs && <Line type="monotone" dataKey="cogsPct" name="COGS %" stroke="#f59e0b" strokeWidth={2} yAxisId="right" />}
              {showWaste && <Line type="monotone" dataKey="wastePct" name="Waste %" stroke="#ef4444" strokeWidth={2} yAxisId="right" />}
              {showHours && <Line type="monotone" dataKey="hours" name="Hours" stroke="#a855f7" strokeWidth={2} yAxisId="right" />}
              {(showCogs || showWaste || showHours) && <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />}
              {(showCogs || showWaste) && <ReferenceLine yAxisId="right" y={12} stroke="#ef4444" strokeDasharray="3 3" />}
              {(showCogs || showWaste) && <ReferenceLine yAxisId="right" y={32} stroke="#f59e0b" strokeDasharray="3 3" />}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <Calendar className="w-4 h-4 text-emerald-400" /> Next Week Forecast
        </div>
        <div className="h-56 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={nextWeekForecast} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="forecastTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12 }} itemStyle={{ color: "#e2e8f0" }} formatter={(v: number) => [`€${v.toFixed(0)}`, ""]} />
              <Area type="monotone" dataKey="sales" name="Forecast sales" stroke="#3b82f6" fill="url(#forecastSales)" strokeWidth={2} />
              <Area type="monotone" dataKey="target" name="Sales target" stroke="#10b981" fill="url(#forecastTarget)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <ForecastStat label="Forecast sales" value={`€${nextWeekForecast.reduce((a, d) => a + d.sales, 0).toFixed(0)}`} />
          <ForecastStat label="Forecast COGS" value={`€${nextWeekForecast.reduce((a, d) => a + d.cogs, 0).toFixed(0)}`} />
          <ForecastStat label="Forecast waste" value={`€${nextWeekForecast.reduce((a, d) => a + d.waste, 0).toFixed(0)}`} />
          <ForecastStat label="Forecast hours" value={`${nextWeekForecast.reduce((a, d) => a + d.hours, 0).toFixed(0)}h`} />
          <ForecastStat label="Forecast production" value={`${nextWeekForecast.reduce((a, d) => a + d.production, 0).toFixed(0)}`} />
        </div>
        <div className="mt-4 p-3 rounded-xl bg-blue-950/20 border border-blue-900/30 text-sm text-blue-100">
          <strong>Next-week target:</strong> Sales €{nextWeekForecast.reduce((a, d) => a + d.target, 0).toFixed(0)} · Keep COGS near 30% and waste near 10% of COGS.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <Package className="w-4 h-4 text-amber-400" /> Top Sellers ({orders.length} orders)
          </div>
          <div className="space-y-2">
            {topOrders.map((o, i) => (
              <div key={o.item + i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-xs flex items-center justify-center">{i + 1}</span>
                  <span className="text-slate-200">{o.item}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">€{o.amount.toFixed(0)}</div>
                  <div className="text-xs text-slate-500">{o.qty} sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <Clock className="w-4 h-4 text-purple-400" /> Week Efficiency
          </div>
          <div className="space-y-3">
            <EfficiencyRow label="COGS / sales" value={weekTotals.totalSales > 0 ? (weekTotals.totalCogs / weekTotals.totalSales) * 100 : 0} target={30} unit="%" lowerIsBetter />
            <EfficiencyRow label="Waste / COGS" value={weekTotals.totalCogs > 0 ? (weekTotals.totalWaste / weekTotals.totalCogs) * 100 : 0} target={10} unit="%" lowerIsBetter />
            <EfficiencyRow label="Production / target" value={weekTotals.totalTarget > 0 ? (weekTotals.totalProduction / weekTotals.totalTarget) * 100 : 0} target={100} unit="%" />
            <EfficiencyRow label="Labor / €100 sales" value={weekTotals.totalSales > 0 ? (weekTotals.totalHours / weekTotals.totalSales) * 100 : 0} target={8} unit="h" lowerIsBetter />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, icon, warn }: { label: string; value: string; sub: string; icon: React.ReactNode; warn?: boolean }) {
  return (
    <div className={`bg-slate-900/60 rounded-2xl p-4 border shadow-sm ${warn ? "border-red-800/60" : "border-slate-800/80"}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</span>
        <span className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center text-slate-300">{icon}</span>
      </div>
      <div className={`text-xl font-bold mt-2 ${warn ? "text-red-400" : "text-white"}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}

function ForecastStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-3">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-white font-semibold text-sm mt-1">{value}</div>
    </div>
  );
}

function EfficiencyRow({ label, value, target, unit, lowerIsBetter }: { label: string; value: number; target: number; unit: string; lowerIsBetter?: boolean }) {
  const diff = value - target;
  const bad = lowerIsBetter ? diff > 0 : diff < 0;
  const ok = Math.abs(diff) <= target * 0.1;
  return (
    <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-800/40">
      <span className="text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-white font-medium">{value.toFixed(1)}{unit}</span>
        {ok ? <Minus className="w-4 h-4 text-emerald-400" /> : bad ? <ArrowDownRight className="w-4 h-4 text-red-400" /> : <ArrowUpRight className="w-4 h-4 text-emerald-400" />}
        <span className="text-xs text-slate-500">Target {target}{unit}</span>
      </div>
    </div>
  );
}
