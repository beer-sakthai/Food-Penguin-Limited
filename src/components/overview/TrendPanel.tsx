// Saksee · 2026-07-24 · feat/new-design-system
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type TrendMetric = "Sales" | "Production" | "Waste" | "Hours" | "COGS";

interface TrendPanelProps {
  data: Array<Record<string, string | number | null | undefined>>;
}

const colors: Record<TrendMetric, string> = {
  Sales: "var(--accent)",
  Production: "var(--ok)",
  Waste: "var(--bad)",
  Hours: "var(--warn)",
  COGS: "var(--violet)",
};

export function TrendPanel({ data }: TrendPanelProps) {
  const [metric, setMetric] = useState<TrendMetric>("Sales");
  return (
    <section className="card">
      <div className="flex items-center justify-between gap-3">
        <span className="section-title">Weekly trend</span>
        <div className="flex flex-wrap gap-1 rounded-lg bg-[var(--panel)] p-1">
          {(Object.keys(colors) as TrendMetric[]).map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setMetric(item)}
              className={`rounded-md px-2 py-1 text-[10px] font-bold transition-colors ${
                metric === item
                  ? "bg-[var(--accent)] text-[var(--bg)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "var(--panel)" }}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 12 }}
            />
            <Bar dataKey={metric} fill={colors[metric]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
