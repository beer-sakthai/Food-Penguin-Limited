// Saksee · 2026-07-24 · feat/new-design-system
import React from "react";
import { Zap, Flame } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area } from "recharts";

export default function EnergyTab({ weeklyLogs }: { theme: string; weeklyLogs: any[] }) {
  const data = (weeklyLogs || []).map(l => ({
    day: l.day,
    sales: l.sales,
    wh: Math.round((l.sales || 0) / 100)
  }));

  const total = data.reduce((a, d) => a + d.wh, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <Zap className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Energy</h1>
          <p className="text-xs text-[var(--muted)]">{data.length} days · {total.toLocaleString()} kWh estimated</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Est. kWh", value: total.toLocaleString(), sub: "this week" },
          { label: "Peak day", value: data.length ? data.reduce((m, d) => d.wh > m.wh ? d : m, data[0]).day : "—", sub: "highest use" },
          { label: "Avg / day", value: data.length ? Math.round(total / data.length).toLocaleString() : "—", sub: "kWh" },
          { label: "Efficiency", value: "—", sub: "per € sales" },
        ].map((k, i) => (
          <div key={i} className="card card-hover">
            <span className="metric-label">{k.label}</span>
            <div className="mt-2 metric-value">{k.value}</div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Flame className="w-4 h-4" /> Daily energy use
        </h2>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="wh" name="kWh (est)" stroke="none" fill="url(#energyFill)" />
              <Line type="monotone" dataKey="wh" name="kWh (est)" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--accent)", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="sales" name="Sales (€)" stroke="var(--muted)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
