// Saksee · 2026-07-24 · feat/density-cut
import React from "react";
import { DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from "recharts";
export default function FinanceTab({ theme }: { theme: string }) {
  const monthly = [
    { m: "Jan", revenue: 280000, cost: 210000 },
    { m: "Feb", revenue: 295000, cost: 218000 },
    { m: "Mar", revenue: 312000, cost: 225000 },
    { m: "Apr", revenue: 298000, cost: 220000 },
    { m: "May", revenue: 325000, cost: 230000 },
    { m: "Jun", revenue: 340000, cost: 235000 },
  ];
  const margin = monthly.map(m => ({ m: m.m, margin: m.revenue - m.cost }));
  const COLORS = ["var(--accent)", "var(--accent-hover)", "var(--warn)", "var(--ok)", "var(--accent)", "#6366f1"];
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><DollarSign className="w-5 h-5 text-[var(--accent)]" />Finance</h1>
        <p className="text-xs font-mono text-[var(--muted)] mt-0.5">6 months</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Revenue vs cost</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} formatter={(v: any) => `€${Number(v).toLocaleString()}`} />
                <Bar dataKey="revenue" name="Revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Cost" fill="var(--muted)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Margin</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={margin} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} formatter={(v: any) => `€${Number(v).toLocaleString()}`} />
                <Bar dataKey="margin" name="Margin" radius={[4, 4, 0, 0]}>{margin.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
