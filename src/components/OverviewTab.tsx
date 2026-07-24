// Saksee · 2026-07-24 · feat/density-cut
import React from "react";
import { LayoutDashboard } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
export default function OverviewTab(props: any) {
  const { metrics, targets, orders, weeklyLogs, theme, onNavigateTab } = props;
  const trend = (weeklyLogs || []).map(l => ({ day: l.day, sales: l.sales }));
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-[var(--accent)]" />Overview</h1>
        <p className="text-xs font-mono text-[var(--muted)] mt-0.5">AI Health: {metrics?.aiHealthScore || 0}%</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Sales today", value: `€${(metrics?.sales_today || 0).toLocaleString()}`, sub: `+${metrics?.sales_growth || 0}% vs yesterday` },
          { label: "Production", value: `${(metrics?.production_items || 0).toLocaleString()} / ${(metrics?.production_target || 0).toLocaleString()}`, sub: "items / target" },
          { label: "Waste", value: `€${(metrics?.waste_cost || 0).toFixed(0)}`, sub: `-${metrics?.waste_reduction || 0}% reduction` },
          { label: "Hours", value: `${metrics?.hours_scheduled || 0}h`, sub: "scheduled" },
        ].map((k, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <div className="text-[10px] font-mono uppercase tracking-wide text-[var(--muted)]">{k.label}</div>
            <div className="text-2xl font-bold text-[var(--text)] mt-1">{k.value}</div>
            <div className="text-[10px] font-mono text-[var(--muted)] mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Sales trend</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} formatter={(v: any) => `€${Number(v).toLocaleString()}`} />
              <Line type="monotone" dataKey="sales" stroke="#c2410c" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {["Production", "Sell", "Waste", "Reports"].map(t => (
            <button key={t} type="button" onClick={() => onNavigateTab?.(t)} className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--accent)] text-left">{t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
