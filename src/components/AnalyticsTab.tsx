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
  Cell,
  Pie,
  PieChart,
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
  Store,
  Flame,
  Activity,
  Zap,
  PieChart as PieIcon,
} from "lucide-react";
import type { DailyOperationalLog, SalesOrder } from "../types";
import { BRANCH_META, COGS_TARGET_PCT, WASTE_TARGET_PCT } from "../business";

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

  const branchPalette = useMemo(() => {
    const normalised = selectedBranch.toLowerCase();
    if (normalised.includes("mahon")) return { main: "#3b82f6", dim: "#1e40af", glow: "rgba(59,130,246,0.35)", name: "Mahon" };
    if (normalised.includes("marks") || normalised.includes("m\u0026s") || normalised.includes("ms-")) return { main: "#e8bf66", dim: "#a16207", glow: "rgba(232,191,102,0.35)", name: "M\u0026S" };
    if (normalised.includes("cork")) return { main: "#22c55e", dim: "#15803d", glow: "rgba(34,197,94,0.35)", name: "Cork" };
    return { main: "#3b82f6", dim: "#1e40af", glow: "rgba(59,130,246,0.35)", name: "All branches" };
  }, [selectedBranch]);

  const branchComparison = useMemo(() => {
    return BRANCH_META.map((b, i) => {
      const factor = [1.0, 0.82, 0.73][i] ?? 0.7;
      const sales = Math.round(50800 * factor);
      const cogs = sales * 0.21;
      const waste = cogs * 0.10;
      const hours = Math.round((sales / 100) * 7.2);
      const production = Math.round(16150 * factor);
      const target = Math.round(17500 * factor);
      return {
        name: b.short,
        full: b.name,
        colour: b.colour,
        css: b.css,
        sales,
        cogsPct: 21,
        wastePct: 10,
        production,
        target,
        hours,
      };
    });
  }, []);

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
    if (currentSnapshot.cogsPct > COGS_TARGET_PCT / 100 + 0.02) {
      list.push({
        severity: currentSnapshot.cogsPct > 0.35 ? "critical" : "warn",
        metric: "COGS",
        message: `COGS is ${(currentSnapshot.cogsPct * 100).toFixed(1)}% of net sales — target is ~${COGS_TARGET_PCT}%.`,
        impact: `Each €1,000 sales loses €${((currentSnapshot.cogsPct - COGS_TARGET_PCT / 100) * 1000).toFixed(0)} more than target.`,
        action: "Renegotiate suppliers, reduce portions on low-margin items, or switch SKUs.",
      });
    }
    if (currentSnapshot.wastePct > WASTE_TARGET_PCT / 100 + 0.02) {
      list.push({
        severity: currentSnapshot.wastePct > 0.15 ? "critical" : "warn",
        metric: "Waste",
        message: `Waste cost is ${(currentSnapshot.wastePct * 100).toFixed(1)}% of COGS — target is ~${WASTE_TARGET_PCT}%.`,
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

  const totalForecast = nextWeekForecast.reduce(
    (a, d) => ({ sales: a.sales + d.sales, target: a.target + d.target, cogs: a.cogs + d.cogs, waste: a.waste + d.waste, hours: a.hours + d.hours, production: a.production + d.production }),
    { sales: 0, target: 0, cogs: 0, waste: 0, hours: 0, production: 0 }
  );

  const topBranch = branchComparison.reduce((a, b) => (a.sales > b.sales ? a : b));
  const topSeller = topOrders[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border p-5 md:p-6" style={{ borderColor: branchPalette.main, background: `linear-gradient(135deg, rgba(15,23,42,0.95) 0%, ${branchPalette.glow} 100%)` }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: branchPalette.main }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${branchPalette.main} 0%, ${branchPalette.dim} 100%)` }}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Operational Analytics</h1>
              <p className="text-xs text-slate-400 mt-0.5">{selectedBranch} · last 7 days · next 7 days forecast</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "sales", "cogs", "waste", "hours", "production"].map((m) => {
              const active = focusMetric === m;
              return (
                <button
                  key={m}
                  onClick={() => setFocusMetric(m)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
                    active
                      ? "text-white border-transparent shadow-md"
                      : "bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-800/60"
                  }`}
                  style={active ? { background: branchPalette.main, boxShadow: `0 0 14px ${branchPalette.glow}` } : undefined}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          accent={branchPalette.main}
          label="Week sales"
          value={`€${weekTotals.totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          sub={`Avg €${avgSales.toFixed(0)}/day · today €${metrics.salesToday}`}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KpiCard
          accent={branchPalette.main}
          label="Week COGS"
          value={`${weekTotals.totalSales > 0 ? ((weekTotals.totalCogs / weekTotals.totalSales) * 100).toFixed(1) : "0.0"}%`}
          sub={`€${weekTotals.totalCogs.toFixed(0)} total`}
          warn={weekTotals.totalSales > 0 && weekTotals.totalCogs / weekTotals.totalSales > COGS_TARGET_PCT / 100 + 0.02}
          icon={<Target className="w-4 h-4" />}
        />
        <KpiCard
          accent={branchPalette.main}
          label="Week waste"
          value={`${weekTotals.totalCogs > 0 ? ((weekTotals.totalWaste / weekTotals.totalCogs) * 100).toFixed(1) : "0.0"}%`}
          sub={`€${weekTotals.totalWaste.toFixed(0)} total`}
          warn={weekTotals.totalCogs > 0 && weekTotals.totalWaste / weekTotals.totalCogs > WASTE_TARGET_PCT / 100 + 0.02}
          icon={<Trash2 className="w-4 h-4" />}
        />
        <KpiCard
          accent={branchPalette.main}
          label="Production"
          value={`${weekTotals.totalProduction.toLocaleString()}`}
          sub={`Target ${weekTotals.totalTarget.toLocaleString()}`}
          warn={weekTotals.totalProduction < weekTotals.totalTarget * 0.9}
          icon={<Package className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Top branch</div>
            <div className="font-semibold" style={{ color: topBranch.colour }}>{topBranch.name} · €{topBranch.sales.toLocaleString()}</div>
          </div>
        </div>
        <div className="rounded-2xl p-4 border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Top seller</div>
            <div className="text-white font-semibold">{topSeller ? topSeller.item : "—"} · €{topSeller ? topSeller.amount.toFixed(0) : "0"}</div>
          </div>
        </div>
        <div className="rounded-2xl p-4 border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Health score</div>
            <div className="text-white font-semibold">{metrics.aiHealthScore}/100</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 rounded-3xl p-5 border border-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <Lightbulb className="w-4 h-4" style={{ color: branchPalette.main }} /> Improvement Opportunities
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((ins, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border text-sm transition-transform hover:-translate-y-0.5 ${
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
              <p className="mb-1 leading-relaxed">{ins.message}</p>
              <p className="text-xs text-slate-400 mb-2">Impact: {ins.impact}</p>
              <div className="text-xs font-medium" style={{ color: branchPalette.main }}>Action: {ins.action}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-900/60 rounded-3xl p-5 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <BarChart3 className="w-4 h-4" style={{ color: branchPalette.main }} /> Last 7 Days vs Targets
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedChart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12 }} itemStyle={{ color: "#e2e8f0" }} />
                {showSales && <><Bar dataKey="sales" name="Sales (€)" fill={branchPalette.main} radius={[6, 6, 0, 0]} /><Line type="monotone" dataKey="target" name="Target (€)" stroke="#94a3b8" strokeDasharray="4 3" strokeWidth={2} dot={false} /></>}
                {showProduction && <Bar dataKey="production" name="Production made" fill="#10b981" radius={[6, 6, 0, 0]} />}
                {showProduction && <Bar dataKey="productionTarget" name="Production target" fill="#059669" radius={[6, 6, 0, 0]} />}
                {showCogs && <Line type="monotone" dataKey="cogsPct" name="COGS %" stroke="#f59e0b" strokeWidth={2} yAxisId="right" />}
                {showWaste && <Line type="monotone" dataKey="wastePct" name="Waste %" stroke="#ef4444" strokeWidth={2} yAxisId="right" />}
                {showHours && <Line type="monotone" dataKey="hours" name="Hours" stroke="#a855f7" strokeWidth={2} yAxisId="right" />}
                {(showCogs || showWaste || showHours) && <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />}
                {(showCogs || showWaste) && <ReferenceLine yAxisId="right" y={WASTE_TARGET_PCT} stroke="#ef4444" strokeDasharray="3 3" />}
                {(showCogs || showWaste) && <ReferenceLine yAxisId="right" y={COGS_TARGET_PCT} stroke="#f59e0b" strokeDasharray="3 3" />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-3xl p-5 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <Calendar className="w-4 h-4" style={{ color: branchPalette.main }} /> Next Week Forecast
          </div>
          <div className="h-56 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={nextWeekForecast} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={branchPalette.main} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={branchPalette.main} stopOpacity={0.02} />
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
                <Area type="monotone" dataKey="sales" name="Forecast sales" stroke={branchPalette.main} fill="url(#forecastSales)" strokeWidth={2} />
                <Area type="monotone" dataKey="target" name="Sales target" stroke="#10b981" fill="url(#forecastTarget)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <ForecastStat accent={branchPalette.main} label="Forecast sales" value={`€${totalForecast.sales.toFixed(0)}`} />
            <ForecastStat accent={branchPalette.main} label="Forecast COGS" value={`€${totalForecast.cogs.toFixed(0)}`} />
            <ForecastStat accent={branchPalette.main} label="Forecast waste" value={`€${totalForecast.waste.toFixed(0)}`} />
            <ForecastStat accent={branchPalette.main} label="Forecast hours" value={`${totalForecast.hours.toFixed(0)}h`} />
            <ForecastStat accent={branchPalette.main} label="Forecast production" value={`${totalForecast.production.toFixed(0)}`} />
          </div>
          <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: branchPalette.glow.replace("0.35", "0.12"), border: `1px solid ${branchPalette.glow.replace("0.35", "0.25")}`, color: branchPalette.main }}>
            <strong>Next-week target:</strong> Sales €{totalForecast.target.toFixed(0)} · Keep COGS near {COGS_TARGET_PCT}% and waste near {WASTE_TARGET_PCT}% of COGS.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-slate-900/60 rounded-3xl p-5 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Zap className="w-4 h-4" style={{ color: branchPalette.main }} /> Branch Comparison
            </div>
            <span className="text-xs text-slate-500">Week totals</span>
          </div>
          <div className="space-y-4">
            {branchComparison.map((b) => (
              <div key={b.name} className="group rounded-2xl p-4 border border-slate-800/60 hover:border-slate-700 transition-colors bg-slate-800/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shadow" style={{ background: b.colour, boxShadow: `0 0 10px ${b.colour}` }} />
                    <span className="text-sm font-semibold text-white">{b.full}</span>
                  </div>
                  <div className="text-xs text-slate-400">€{b.sales.toLocaleString()} sales</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <MiniStat label="COGS" value={`${b.cogsPct}%`} color={b.cogsPct > COGS_TARGET_PCT ? "#ef4444" : "#10b981"} />
                  <MiniStat label="Waste" value={`${b.wastePct}%`} color={b.wastePct > WASTE_TARGET_PCT ? "#ef4444" : "#10b981"} />
                  <MiniStat label="Production" value={`${b.production}/${b.target}`} color={b.production < b.target * 0.9 ? "#f59e0b" : "#10b981"} />
                  <MiniStat label="Hours" value={`${b.hours}h`} color="#a855f7" />
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (b.production / b.target) * 100)}%`, background: b.colour }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-3xl p-5 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <Package className="w-4 h-4" style={{ color: branchPalette.main }} /> Top Sellers ({orders.length} orders)
          </div>
          <div className="space-y-2">
            {topOrders.map((o, i) => (
              <div key={o.item + i} className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: i === 0 ? branchPalette.main : "#334155", color: i === 0 ? "#0f172a" : "#cbd5e1" }}>{i + 1}</span>
                  <span className="text-slate-200">{o.item}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">€{o.amount.toFixed(0)}</div>
                  <div className="text-xs text-slate-500">{o.qty} sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-900/60 rounded-3xl p-5 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <Clock className="w-4 h-4" style={{ color: branchPalette.main }} /> Week Efficiency
          </div>
          <div className="space-y-3">
            <EfficiencyRow accent={branchPalette.main} label="COGS / sales" value={weekTotals.totalSales > 0 ? (weekTotals.totalCogs / weekTotals.totalSales) * 100 : 0} target={COGS_TARGET_PCT} unit="%" lowerIsBetter />
            <EfficiencyRow accent={branchPalette.main} label="Waste / COGS" value={weekTotals.totalCogs > 0 ? (weekTotals.totalWaste / weekTotals.totalCogs) * 100 : 0} target={WASTE_TARGET_PCT} unit="%" lowerIsBetter />
            <EfficiencyRow accent={branchPalette.main} label="Production / target" value={weekTotals.totalTarget > 0 ? (weekTotals.totalProduction / weekTotals.totalTarget) * 100 : 0} target={100} unit="%" />
            <EfficiencyRow accent={branchPalette.main} label="Labor / €100 sales" value={weekTotals.totalSales > 0 ? (weekTotals.totalHours / weekTotals.totalSales) * 100 : 0} target={8} unit="h" lowerIsBetter />
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-3xl p-5 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <PieIcon className="w-4 h-4" style={{ color: branchPalette.main }} /> Sales Mix by Day
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12 }} itemStyle={{ color: "#e2e8f0" }} formatter={(v: number, n: string) => [`€${v.toFixed(0)}`, n]} />
                <Pie data={lastWeek.map((l) => ({ name: l.day, value: l.sales }))} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70} paddingAngle={3} stroke="none">
                  {lastWeek.map((_, i) => (
                    <Cell key={i} fill={i === lastWeek.length - 1 ? branchPalette.main : `hsl(${210 + i * 25}, 70%, ${55 + i * 3}%)`} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, icon, warn, accent }: { label: string; value: string; sub: string; icon: React.ReactNode; warn?: boolean; accent: string }) {
  return (
    <div className={`rounded-2xl p-4 border shadow-sm transition-transform hover:-translate-y-0.5 ${warn ? "border-red-800/60" : "border-slate-800/80"} bg-gradient-to-br from-slate-900/80 to-slate-900/40`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</span>
        <span className="w-7 h-7 rounded-md flex items-center justify-center text-white" style={{ background: accent }}>{icon}</span>
      </div>
      <div className={`text-xl font-bold mt-2 ${warn ? "text-red-400" : "text-white"}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}

function ForecastStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-800/60">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-white font-semibold text-sm mt-1" style={{ color: accent }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/60">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold mt-0.5" style={{ color }}>{value}</div>
    </div>
  );
}

function EfficiencyRow({ label, value, target, unit, lowerIsBetter, accent }: { label: string; value: number; target: number; unit: string; lowerIsBetter?: boolean; accent: string }) {
  const diff = value - target;
  const bad = lowerIsBetter ? diff > 0 : diff < 0;
  const ok = Math.abs(diff) <= target * 0.1;
  return (
    <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
      <span className="text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-white font-semibold">{value.toFixed(1)}{unit}</span>
        {ok ? <Minus className="w-4 h-4 text-emerald-400" /> : bad ? <ArrowDownRight className="w-4 h-4 text-red-400" /> : <ArrowUpRight className="w-4 h-4 text-emerald-400" />}
        <span className="text-xs text-slate-500">Target {target}{unit}</span>
      </div>
    </div>
  );
}
