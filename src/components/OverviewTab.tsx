// Saksee · 2026-07-24 · feat/new-design-system
import React, { useMemo } from "react";
import { LayoutDashboard, TrendingUp, Package, Trash2, Clock, ArrowRight, AlertTriangle, DollarSign, Wallet } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area } from "recharts";
import { KpiCard } from "./overview/KpiCard";
import { ActionQueue } from "./overview/ActionQueue";
import { TrendPanel } from "./overview/TrendPanel";
import {
  WASTE_TARGET_PCT,
  COGS_TARGET_PCT,
  COMMISSION_TARGET_PCT,
  NET_SALES_FACTOR,
  cogsTargetFromSales,
  wasteTargetFromProduction,
} from "../business";
import type { InventoryItem, DailyOperationalLog } from "../types";

interface OverviewProps {
  metrics: any;
  weeklyLogs: DailyOperationalLog[];
  inventory: InventoryItem[];
  onNavigateTab: (tab: string) => void;
  onReviewAlerts: () => void;
  onOpenLogForm: () => void;
}

export default function OverviewTab(props: OverviewProps) {
  const { metrics, weeklyLogs, inventory, onNavigateTab, onReviewAlerts, onOpenLogForm } = props;
  const trend = (weeklyLogs || []).map((l: any) => ({
    name: l.day,
    sales: Number(l.sales) || 0,
    production: Number(l.productionMade) || 0,
    waste: Number(l.waste) || 0,
    hours: Number(l.hours) || 0,
    cogs: Number(Object.values(l.cogs || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0)),
  }));
  const lowStockItems = useMemo(() => (inventory || []).filter(i => i.status === "Low"), [inventory]);

  const salesToday = Number(metrics?.sales_today || metrics?.salesToday || 0);
  const productionToday = Number(metrics?.production_items || metrics?.productionItems || 0);
  const wasteCostToday = Number(metrics?.waste_cost || metrics?.wasteCost || 0);
  const wastePct = productionToday ? (wasteCostToday / productionToday) * 100 : 0;
  const wasteTargetPct = WASTE_TARGET_PCT;
  const wasteVsTarget = wastePct - wasteTargetPct;

  const netSales = salesToday * NET_SALES_FACTOR;
  const commission = salesToday - netSales;
  const cogsTarget = cogsTargetFromSales(salesToday);
  const cogsActual = trend.length
    ? trend.reduce((a, r) => a + Number(r.cogs || 0), 0) / (trend.length || 1)
    : 0;
  const cogsPct = netSales ? (cogsActual / netSales) * 100 : 0;

  const cards = [
    {
      label: "Sales today",
      value: `€${salesToday.toLocaleString()}`,
      detail: `+${metrics?.sales_growth || metrics?.salesGrowth || 0}% vs yesterday`,
      icon: TrendingUp,
      tone: "ok" as const,
    },
    {
      label: "Production",
      value: `${productionToday.toLocaleString()} / ${(metrics?.production_target || metrics?.productionTarget || 0).toLocaleString()}`,
      detail: "items / target",
      icon: Package,
      tone: "accent" as const,
    },
    {
      label: "Waste",
      value: `€${wasteCostToday.toFixed(0)}`,
      detail: `${wastePct.toFixed(1)}% of prod · target ${wasteTargetPct}%`,
      icon: Trash2,
      tone: wasteVsTarget > 0 ? ("bad" as const) : ("ok" as const),
    },
    {
      label: "COGS",
      value: `${cogsPct.toFixed(1)}%`,
      detail: `target ${COGS_TARGET_PCT}% · commission ${COMMISSION_TARGET_PCT}%`,
      icon: DollarSign,
      tone: cogsPct > COGS_TARGET_PCT ? ("warn" as const) : ("ok" as const),
    },
    {
      label: "Net after commission",
      value: `€${netSales.toLocaleString()}`,
      detail: `commission €${commission.toLocaleString()}`,
      icon: Wallet,
      tone: "accent" as const,
    },
    {
      label: "Hours",
      value: `${metrics?.hours_scheduled || metrics?.hoursScheduled || 0}h`,
      detail: "scheduled",
      icon: Clock,
      tone: "warn" as const,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">Overview</h1>
            <p className="text-xs text-[var(--muted)]">Operational health: {metrics?.aiHealthScore || 0}%</p>
          </div>
        </div>
        <button type="button" onClick={onOpenLogForm} className="btn btn-primary text-xs">
          Log data
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((k, i) => (
          <KpiCard
            label={k.label}
            value={k.value}
            detail={k.detail}
            icon={k.icon}
            tone={k.tone}
            onClick={k.label === "Production" ? () => onNavigateTab("Production") : undefined}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Sales trend</h2>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
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
                <Area type="monotone" dataKey="sales" stroke="none" fill="url(#salesFill)" />
                <Line type="monotone" dataKey="sales" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: "var(--accent)" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <ActionQueue lowStockItems={lowStockItems} onReviewAlerts={onReviewAlerts} />
          <div className="card">
            <h2 className="section-title mb-3">Quick actions</h2>
            <div className="grid grid-cols-1 gap-2">
              {["Production", "Sell", "Waste", "Reports"].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onNavigateTab(t)}
                  className="btn btn-ghost justify-between"
                >
                  {t}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TrendPanel data={trend} />
    </div>
  );
}
