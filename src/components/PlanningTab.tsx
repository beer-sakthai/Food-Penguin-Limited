// Saksee · 2026-07-24 · feat/density-cut
import React from "react";
import { Boxes } from "lucide-react";
export default function PlanningTab(props: { inventory: any[]; onOrderRestock: (id: string) => void; selectedBranch: string; theme: string; weeklyLogs: any[]; }) {
  const { inventory, onOrderRestock } = props;
  const low = inventory.filter(i => i.status === "Low");
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><Boxes className="w-5 h-5 text-[var(--accent)]" />Planning</h1>
        <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{inventory.length} items · {low.length} low stock</p>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--panel)] text-[var(--muted)]">
            <tr><th className="text-left px-4 py-2 font-medium">Item</th><th className="text-left px-4 py-2 font-medium">Category</th><th className="text-right px-4 py-2 font-medium">Stock</th><th className="text-right px-4 py-2 font-medium">Reorder</th><th className="text-left px-4 py-2 font-medium">Status</th><th className="text-right px-4 py-2 font-medium"></th></tr>
          </thead>
          <tbody>{inventory.map(i => (
            <tr key={i.id} className="border-t border-[var(--border)] hover:bg-[var(--panel)]">
              <td className="px-4 py-2 font-medium text-[var(--text)]">{i.name}</td>
              <td className="px-4 py-2 text-[var(--muted)]">{i.category}</td>
              <td className="px-4 py-2 text-right font-mono">{i.currentQty} {i.unit}</td>
              <td className="px-4 py-2 text-right font-mono">{i.reorderLevel} {i.unit}</td>
              <td className="px-4 py-2"><span className={`text-[10px] font-mono uppercase ${i.status === "Low" ? "text-[var(--warn)]" : "text-[var(--ok)]"}`}>{i.status}</span></td>
              <td className="px-4 py-2 text-right">
                {i.status === "Low" && (
                  <button type="button" onClick={() => onOrderRestock(i.id)} className="text-[10px] font-mono px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)]">Order restock</button>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
