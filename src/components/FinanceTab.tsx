// Saksee · 2026-07-24 · feat/new-design-system
import React from "react";
import { DollarSign, TrendingUp, Wallet, Percent, PieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";
import {
  COGS_TARGET_PCT,
  COMMISSION_TARGET_PCT,
  NET_SALES_FACTOR,
  cogsTargetFromSales,
} from "../business";

export default function FinanceTab({ theme }: { theme: string }) {
  const monthly = [
    { m: "Jan", revenue: 205000 },
    { m: "Feb", revenue: 212000 },
    { m: "Mar", revenue: 220000 },
    { m: "Apr", revenue: 215000 },
    { m: "May", revenue: 228000 },
    { m: "Jun", revenue: 235000 },
  ].map((m) => ({
    ...m,
    net: Math.round(m.revenue * NET_SALES_FACTOR),
    commission: Math.round(m.revenue * (COMMISSION_TARGET_PCT / 100)),
    cogs: Math.round(cogsTargetFromSales(m.revenue)),
    cogsTarget: Math.round(cogsTargetFromSales(m.revenue)),
    margin: Math.round(m.revenue * NET_SALES_FACTOR - cogsTargetFromSales(m.revenue)),
  }));

  const totalRevenue = monthly.reduce((a, m) => a + m.revenue, 0);
  const totalNet = monthly.reduce((a, m) => a + m.net, 0);
  const totalCommission = monthly.reduce((a, m) => a + m.commission, 0);
  const totalCOGS = monthly.reduce((a, m) => a + m.cogs, 0);
  const totalMargin = monthly.reduce((a, m) => a + m.margin, 0);

  const cogsPct = totalNet ? (totalCOGS / totalNet) * 100 : 0;
  const marginPct = totalNet ? (totalMargin / totalNet) * 100 : 0;
  const commissionPct = totalRevenue ? (totalCommission / totalRevenue) * 100 : 0;

  const COLORS = ["var(--accent)", "var(--warn)", "var(--bad)", "var(--ok)", "var(--muted)", "#6366f1"];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Finance</h1>
          <p className="text-xs text-[var(--muted)]">6 months · COGS {COGS_TARGET_PCT}% · Commission {COMMISSION_TARGET_PCT}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Gross revenue", value: `€${totalRevenue.toLocaleString()}`, sub: "6 months", icon: TrendingUp },
          { label: "Commission", value: `€${totalCommission.toLocaleString()}`, sub: `${commissionPct.toFixed(1)}%`, icon: Percent },
          { label: "Net sales", value: `€${totalNet.toLocaleString()}`, sub: "after commission", icon: Wallet },
          { label: "COGS", value: `€${totalCOGS.toLocaleString()}`, sub: `${cogsPct.toFixed(1)}% of net`, icon: PieChart },
          { label: "Margin", value: `€${totalMargin.toLocaleString()}`, sub: "gross", icon: DollarSign },
          { label: "Margin %", value: `${marginPct.toFixed(1)}%`, sub: "of net", icon: Percent },
        ].map((k, i) => (
          <div key={i} className="card card-hover">
            <div className="flex items-center gap-2">
              <k.icon className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="metric-label">{k.label}</span>
            </div>
            <div className="mt-2 metric-value">{k.value}</div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Revenue flow
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `€${Number(v).toLocaleString()}`} />
                <Bar dataKey="revenue" name="Gross" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="commission" name="Commission" stackId="a" fill="var(--warn)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="net" name="Net" stackId="a" fill="var(--ok)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Net margin vs COGS target
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `€${Number(v).toLocaleString()}`} />
                <ReferenceLine y={0} stroke="var(--border)" />
                <Bar dataKey="margin" name="Margin" radius={[6, 6, 0, 0]}>
                  {monthly.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
