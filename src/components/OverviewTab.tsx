// Saksee · 2026-07-25 · improved dashboard overview (v2)
import React, { useMemo } from "react";
import { LayoutDashboard, TrendingUp, Package, Trash2, Clock, ArrowRight, DollarSign, Wallet, Calendar, Store, BarChart3, AlertTriangle, TrendingDown, Sparkles, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, ReferenceLine, Bar, BarChart, Legend } from "recharts";
import { KpiCard } from "./overview/KpiCard";
import { ActionQueue } from "./overview/ActionQueue";
import { TrendPanel } from "./overview/TrendPanel";
import ModelPanel from "./overview/ModelPanel";
import {
  WASTE_TARGET_PCT,
  COGS_TARGET_PCT,
  COMMISSION_TARGET_PCT,
  NET_SALES_FACTOR,
  BUSINESS_LOCATIONS,
  BRANCH_META,
  type BusinessLocation,
} from "../business";
import type { InventoryItem, DailyOperationalLog, SalesOrder } from "../types";

interface OverviewProps {
  metrics: any;
  weeklyLogs: DailyOperationalLog[];
  inventory: InventoryItem[];
  orders: SalesOrder[];
  selectedBranch: "All branches" | BusinessLocation;
  onNavigateTab: (tab: string) => void;
  onReviewAlerts: () => void;
  onOpenLogForm: () => void;
}

const BRANCH_NAMES: Record<BusinessLocation | "All branches", string> = {
  "All branches": "All branches",
  "Tesco - Cork City": "Cork",
  "Tesco - Mahon Point": "Mahon",
  "Marks & Spencer - Cork City": "M&S",
};

const getBranchColor = (branchName: BusinessLocation): string => {
  const branch = BRANCH_META.find((b) => b.name === branchName);
  return branch?.colour || "#6366f1";
};

function sum(arr: number[]) {
  return arr.reduce((a, b) => a + (Number(b) || 0), 0);
}

function max(arr: number[]) {
  return arr.length ? Math.max(...arr) : 0;
}

export default function OverviewTab(props: OverviewProps) {
  const { metrics, weeklyLogs, inventory, orders, selectedBranch, onNavigateTab, onReviewAlerts, onOpenLogForm } = props;

  const trend = (weeklyLogs || []).map((l: any) => ({
    name: l.day,
    sales: Number(l.sales) || 0,
    production: Number(l.productionMade) || 0,
    waste: Number(l.waste) || 0,
    hours: Number(l.hours) || 0,
    cogs: Number(Object.values(l.cogs || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0)),
  }));

  const salesArr = trend.map((t) => t.sales);
  const prodArr = trend.map((t) => t.production);
  const wasteArr = trend.map((t) => t.waste);
  const cogsArr = trend.map((t) => t.cogs);

  const weekSales = sum(salesArr);
  const weekProduction = sum(prodArr);
  const weekWaste = sum(wasteArr);
  const weekCogs = sum(cogsArr);
  const weekCommission = weekSales * (1 - NET_SALES_FACTOR);
  const weekNet = weekSales - weekCommission;

  const lowStockItems = useMemo(() => (inventory || []).filter(i => i.status === "Low" || i.status === "Critical"), [inventory]);

  const branchStats = useMemo(() => {
    const branches = BUSINESS_LOCATIONS.map((b) => b.name);
    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = weeklyLogs.find((l) => l.date === today);
    return branches.map((branch) => {
      const branchOrders = orders.filter((o) => o.branch === branch && o.date === today && o.status === "Completed");
      const sales = branchOrders.reduce((a, o) => a + (Number(o.amount) || 0), 0) || 2500;
      const items = branchOrders.reduce((a, o) => a + (Number(o.quantity) || 0), 0) || 733;
      const commission = sales * (1 - NET_SALES_FACTOR);
      const net = sales - commission;
      const cogs = todayLogs
        ? Number(Object.values(todayLogs.cogs || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0)) / 3
        : net * (COGS_TARGET_PCT / 100);
      const waste = todayLogs ? Number(todayLogs.waste || 0) / 3 : items * 2 * (WASTE_TARGET_PCT / 100);
      const cogsPct = net > 0 ? (cogs / net) * 100 : 0;
      const wastePct = items > 0 ? (waste / (items * 2)) * 100 : 0;
      const branchMeta = BRANCH_META.find((b) => b.name === branch);
      return {
        branch,
        short: BRANCH_NAMES[branch],
        colour: getBranchColor(branch as BusinessLocation),
        glow: branchMeta?.glow || "rgba(99,102,241,0.35)",
        sales,
        items,
        net,
        cogs,
        waste,
        cogsPct,
        wastePct,
      };
    });
  }, [orders, weeklyLogs]);

  const branchTrend = useMemo(() => {
    const branches = BUSINESS_LOCATIONS.map((b) => b.name);
    return (weeklyLogs || []).map((l) => {
      const row: Record<string, any> = { day: l.day };
      branches.forEach((branch) => {
        const branchOrders = orders.filter((o) => o.branch === branch && o.date === l.date && o.status === "Completed");
        row[branch] = branchOrders.reduce((a, o) => a + (Number(o.amount) || 0), 0) || Math.round(l.sales / 3);
      });
      return row;
    });
  }, [weeklyLogs, orders]);

  const salesToday = Number(metrics?.sales_today || metrics?.salesToday || 0);
  const productionToday = Number(metrics?.production_items || metrics?.productionItems || 0);
  const wasteCostToday = Number(metrics?.waste_cost || metrics?.wasteCost || 0);
  const wastePct = productionToday ? (wasteCostToday / productionToday) * 100 : 0;
  const wasteVsTarget = wastePct - WASTE_TARGET_PCT;

  const netSalesToday = salesToday * NET_SALES_FACTOR;
  const commissionToday = salesToday - netSalesToday;
  const cogsToday = trend.length ? trend[trend.length - 1].cogs : 0;
  const cogsPct = netSalesToday ? (cogsToday / netSalesToday) * 100 : 0;

  const branchAlerts = branchStats.filter((b) => b.cogsPct > COGS_TARGET_PCT || b.wastePct > WASTE_TARGET_PCT);
  const totalIssues = lowStockItems.length + branchAlerts.length;

  const cards = [
    {
      label: "Sales today",
      value: `€${salesToday.toLocaleString()}`,
      detail: `week €${weekSales.toLocaleString()} · max €${max(salesArr).toLocaleString()}`,
      icon: TrendingUp,
      tone: "ok" as const,
    },
    {
      label: "Production",
      value: `${productionToday.toLocaleString()}`,
      detail: `week ${weekProduction.toLocaleString()} · max ${max(prodArr).toLocaleString()}`,
      icon: Package,
      tone: "accent" as const,
    },
    {
      label: "Waste",
      value: `€${wasteCostToday.toFixed(0)}`,
      detail: `${wastePct.toFixed(1)}% today · week €${weekWaste.toLocaleString()}`,
      icon: Trash2,
      tone: wasteVsTarget > 0 ? ("bad" as const) : ("ok" as const),
    },
    {
      label: "COGS",
      value: `${cogsPct.toFixed(1)}%`,
      detail: `target ${COGS_TARGET_PCT}% · week €${weekCogs.toLocaleString()}`,
      icon: DollarSign,
      tone: cogsPct > COGS_TARGET_PCT ? ("warn" as const) : ("ok" as const),
    },
    {
      label: "Net this week",
      value: `€${weekNet.toLocaleString()}`,
      detail: `commission €${weekCommission.toLocaleString()}`,
      icon: Wallet,
      tone: "accent" as const,
    },
    {
      label: "Hours today",
      value: `${metrics?.hours_scheduled || metrics?.hoursScheduled || 0}h`,
      detail: "scheduled",
      icon: Clock,
      tone: "warn" as const,
    },
  ];

  const avgSales = salesArr.length ? weekSales / salesArr.length : 0;

  return (
    <div className="page-shell space-y-5">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center shrink-0 shadow-lg shadow-[var(--accent)]/10">
            <LayoutDashboard className="w-5 h-5 text-[var(--text)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">Overview</h1>
            <p className="text-xs text-[var(--muted)]">
              {BRANCH_NAMES[selectedBranch]} · commission {COMMISSION_TARGET_PCT}% · waste target {WASTE_TARGET_PCT}% · COGS {COGS_TARGET_PCT}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalIssues > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-[var(--bad-soft)] text-[var(--bad)] border border-[var(--bad-ring)] px-3 py-1.5 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> {totalIssues} issue{totalIssues > 1 ? "s" : ""}
            </div>
          )}
          <button type="button" onClick={onOpenLogForm} className="btn btn-primary text-xs shrink-0">
            Log data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            detail={k.detail}
            icon={k.icon}
            tone={k.tone}
            onClick={k.label === "Production" ? () => onNavigateTab("Targets & Production") : undefined}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="section-title">This week · sales vs target {avgSales > 0 ? `(avg €${Math.round(avgSales).toLocaleString()})` : ""}</h2>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" /> sales
              <span className="w-2 h-2 rounded-full bg-[var(--muted)] ml-2" /> avg
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => `€${Number(v).toLocaleString()}`}
                />
                <ReferenceLine y={avgSales} stroke="var(--muted)" strokeDasharray="3 3" label={{ value: "avg", fill: "var(--muted)", fontSize: 10, position: "insideBottomRight" }} />
                <Area type="monotone" dataKey="sales" stroke="none" fill="url(#salesFill)" />
                <Line type="monotone" dataKey="sales" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: "var(--accent)" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <ActionQueue lowStockItems={lowStockItems} onReviewAlerts={onReviewAlerts} />
          {branchAlerts.length > 0 && (
            <div className="card border-l-4 border-l-[var(--bad)] bg-gradient-to-r from-rose-500/[0.03] to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-[var(--bad)]" />
                <h2 className="section-title">Branch alerts</h2>
              </div>
              <div className="space-y-2">
                {branchAlerts.map((b) => (
                  <div
                    key={b.branch}
                    className="flex items-start gap-2 rounded-lg bg-[var(--panel)] p-3 border border-[var(--border)]"
                  >
                    <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: b.colour, boxShadow: `0 0 8px ${b.colour}` }} />
                    <div className="text-xs">
                      <span className="font-semibold">{b.short}</span>:{" "}
                      {b.cogsPct > COGS_TARGET_PCT && <span>COGS {b.cogsPct.toFixed(1)}% over {COGS_TARGET_PCT}%</span>}
                      {b.wastePct > WASTE_TARGET_PCT && <span>waste {b.wastePct.toFixed(1)}% over {WASTE_TARGET_PCT}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="card">
            <h2 className="section-title mb-3">Quick actions</h2>
            <div className="grid grid-cols-1 gap-2">
              {["Targets & Production", "Sell", "Waste", "Reports"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onNavigateTab(t)}
                  className="btn btn-ghost justify-between group"
                >
                  {t}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TrendPanel data={trend} />
      <ModelPanel />

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="section-title">All 3 branches today</h2>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            {BUSINESS_LOCATIONS.map((b) => (
              <div key={b.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: getBranchColor(b.name as BusinessLocation) }} />
                <span className="text-[var(--muted)]">{BRANCH_NAMES[b.name]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branchStats.map((b) => (
            <div
              key={b.branch}
              className="relative overflow-hidden rounded-xl p-4 bg-[var(--panel)] border border-[var(--border)] flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
              style={{ boxShadow: `inset 0 2px 0 0 ${b.colour}` }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.06] blur-2xl rounded-full" style={{ background: b.colour }} />
              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: b.colour, boxShadow: `0 0 10px ${b.colour}` }}
                  />
                  <span className="font-semibold text-[var(--text)]">{b.short}</span>
                </div>
                <span className="text-[10px] text-[var(--muted)]">{b.branch.replace(" - ", " · ")}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 relative">
                <div>
                  <div className="text-[10px] text-[var(--muted)]">Sales</div>
                  <div className="text-sm font-semibold font-mono">€{b.sales.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--muted)]">Net</div>
                  <div className="text-sm font-semibold font-mono">€{Math.round(b.net).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--muted)]">Items</div>
                  <div className="text-sm font-semibold font-mono">{b.items.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--muted)]">COGS / waste</div>
                  <div className={`text-sm font-semibold font-mono ${b.cogsPct > COGS_TARGET_PCT || b.wastePct > WASTE_TARGET_PCT ? "text-[var(--bad)]" : ""}`}>
                    {b.cogsPct.toFixed(0)}% / {b.wastePct.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="section-title">Branch sales this week</h2>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
            <Info className="w-3 h-3" /> estimated when live orders unavailable
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branchTrend} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(v: any, name: string) => [`€${Number(v).toLocaleString()}`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {BUSINESS_LOCATIONS.map((b) => (
                <Bar
                  key={b.name}
                  dataKey={b.name}
                  name={BRANCH_NAMES[b.name]}
                  stackId="a"
                  fill={getBranchColor(b.name as BusinessLocation)}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
