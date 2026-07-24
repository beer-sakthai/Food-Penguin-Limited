// Saksee · 2026-07-24 · feat/density-cut
import React from "react";
import { Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar, Cell } from "recharts";
export default function EnergyTab({ theme, weeklyLogs }: { theme: string; weeklyLogs: any[] }) {
  const data = (weeklyLogs || []).map(l => ({ day: l.day, sales: l.sales, hours: l.hours, wh: Math.round((l.sales || 0) / 100) }));
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><Zap className="w-5 h-5 text-[var(--accent)]" />Energy</h1>
        <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{data.length} days</p>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Daily energy use</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="wh" name="kWh (est)" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="sales" name="Sales (€)" stroke="var(--muted)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
