// Saksee · 2026-07-24 · feat/density-cut
import React from "react";
import { SlidersHorizontal } from "lucide-react";
export default function ResourceAllocationTab({ theme, branches }: { theme: string; branches: string[] }) {
  const data = [
    { branch: branches[0] || "M&S Cork", staff: 5, hours: 38, orders: 142, efficiency: 92 },
    { branch: branches[1] || "Tesco Cork", staff: 4, hours: 32, orders: 98, efficiency: 87 },
    { branch: branches[2] || "Tesco Mahon", staff: 4, hours: 34, orders: 110, efficiency: 90 },
  ];
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-[var(--accent)]" />Resource Allocation</h1>
        <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{data.length} branches</p>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--panel)] text-[var(--muted)]">
            <tr><th className="text-left px-4 py-2 font-medium">Branch</th><th className="text-right px-4 py-2 font-medium">Staff</th><th className="text-right px-4 py-2 font-medium">Hours</th><th className="text-right px-4 py-2 font-medium">Orders</th><th className="text-right px-4 py-2 font-medium">Efficiency</th></tr>
          </thead>
          <tbody>{data.map(d => (
            <tr key={d.branch} className="border-t border-[var(--border)] hover:bg-[var(--panel)]">
              <td className="px-4 py-2 font-medium text-[var(--text)]">{d.branch}</td>
              <td className="px-4 py-2 text-right font-mono">{d.staff}</td>
              <td className="px-4 py-2 text-right font-mono">{d.hours}</td>
              <td className="px-4 py-2 text-right font-mono">{d.orders}</td>
              <td className="px-4 py-2 text-right font-mono">{d.efficiency}%</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
