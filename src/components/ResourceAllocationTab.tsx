// Saksee · 2026-07-24 · feat/new-design-system
import React from "react";
import { SlidersHorizontal, Users, Clock, ShoppingBag, Gauge } from "lucide-react";

export default function ResourceAllocationTab({ branches }: { theme: string; branches: string[] }) {
  const data = [
    { branch: branches[0] || "M&S Cork", staff: 5, hours: 38, orders: 142, efficiency: 92 },
    { branch: branches[1] || "Tesco Cork", staff: 4, hours: 32, orders: 98, efficiency: 87 },
    { branch: branches[2] || "Tesco Mahon", staff: 4, hours: 34, orders: 110, efficiency: 90 },
  ];

  const totals = data.reduce((a, d) => ({
    staff: a.staff + d.staff,
    hours: a.hours + d.hours,
    orders: a.orders + d.orders,
    efficiency: a.efficiency + d.efficiency,
  }), { staff: 0, hours: 0, orders: 0, efficiency: 0 });

  const avgEfficiency = Math.round(totals.efficiency / data.length);

  const cards = [
    { label: "Total staff", value: totals.staff, sub: "across branches", icon: Users },
    { label: "Total hours", value: totals.hours, sub: "scheduled", icon: Clock },
    { label: "Total orders", value: totals.orders, sub: "handled", icon: ShoppingBag },
    { label: "Avg efficiency", value: `${avgEfficiency}%`, sub: "per branch", icon: Gauge },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <SlidersHorizontal className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Resource Allocation</h1>
          <p className="text-xs text-[var(--muted)]">{data.length} branches</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((k, i) => (
          <div key={i} className="card card-hover">
            <div className="flex items-center justify-between">
              <span className="metric-label">{k.label}</span>
              <k.icon className="w-4 h-4 text-[var(--subtle)]" />
            </div>
            <div className="mt-2 metric-value">{k.value}</div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Branch</th>
              <th className="text-right">Staff</th>
              <th className="text-right">Hours</th>
              <th className="text-right">Orders</th>
              <th className="text-right">Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.branch}>
                <td className="font-medium">{d.branch}</td>
                <td className="text-right font-mono">{d.staff}</td>
                <td className="text-right font-mono">{d.hours}</td>
                <td className="text-right font-mono">{d.orders}</td>
                <td className="text-right font-mono">{d.efficiency}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
