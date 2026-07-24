// Saksee · 2026-07-24 · feat/new-design-system
import React from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function FinanceTab({ theme }: { theme: string }) {
  const monthly = [
    { m: "Jan", revenue: 280000, cost: 210000 },
    { m: "Feb", revenue: 295000, cost: 218000 },
    { m: "Mar", revenue: 312000, cost: 225000 },
    { m: "Apr", revenue: 298000, cost: 220000 },
    { m: "May", revenue: 325000, cost: 230000 },
    { m: "Jun", revenue: 340000, cost: 235000 },
  ];

  const totalRevenue = monthly.reduce((a, m) => a + m.revenue, 0);
  const totalCost = monthly.reduce((a, m) => a + m.cost, 0);
  const margin = monthly.map(m => ({ m: m.m, margin: m.revenue - m.cost }));
  const COLORS = ["var(--accent)", "var(--accent-hover)", "var(--warn)", "var(--ok)", "var(--accent)", "#6366f1"];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Finance</h1>
          <p className="text-xs text-[var(--muted)]">6 months · P&L overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: `€${totalRevenue.toLocaleString()}`, sub: "6 months", tone: "up" },
          { label: "Cost", value: `€${totalCost.toLocaleString()}`, sub: "6 months", tone: "down" },
          { label: "Margin", value: `€${(totalRevenue - totalCost).toLocaleString()}`, sub: "gross", tone: "up" },
          { label: "Margin %", value: `${Math.round(((totalRevenue - totalCost) / totalRevenue) * 100)}%`, sub: "avg" },
        ].map((k, i) => (
          <div key={i} className="card card-hover">
            <span className="metric-label">{k.label}</span>
            <div className="mt-2 metric-value">{k.value}</div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Revenue vs cost
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `€${Number(v).toLocaleString()}`} />
                <Bar dataKey="revenue" name="Revenue" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cost" name="Cost" fill="var(--muted)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Margin
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={margin} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `€${Number(v).toLocaleString()}`} />
                <Bar dataKey="margin" name="Margin" radius={[6, 6, 0, 0]}>
                  {margin.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
