// Saksee · 2026-07-24 · feat/new-design-system
import React from "react";
import { Boxes, AlertTriangle, PackageCheck } from "lucide-react";

export default function PlanningTab(props: {
  inventory: any[];
  onOrderRestock: (id: string) => void;
  selectedBranch: string;
  theme: string;
  weeklyLogs: any[];
}) {
  const { inventory, onOrderRestock } = props;
  const low = inventory.filter(i => i.status === "Low");
  const ok = inventory.filter(i => i.status !== "Low");

  const cards = [
    { label: "Total items", value: inventory.length, sub: "in inventory" },
    { label: "Low stock", value: low.length, sub: "need reorder", warn: low.length > 0 },
    { label: "OK", value: ok.length, sub: "above reorder level" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <Boxes className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Planning</h1>
          <p className="text-xs text-[var(--muted)]">{inventory.length} items · {low.length} low stock</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((k, i) => (
          <div key={i} className="card card-hover">
            <div className="flex items-center gap-2">
              <span className="metric-label">{k.label}</span>
              {k.warn && <AlertTriangle className="w-3.5 h-3.5 text-[var(--warn)]" />}
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
              <th>Item</th>
              <th>Category</th>
              <th className="text-right">Stock</th>
              <th className="text-right">Reorder</th>
              <th>Status</th>
              <th className="text-right"></th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(i => (
              <tr key={i.id}>
                <td className="font-medium">{i.name}</td>
                <td className="text-[var(--muted)]">{i.category}</td>
                <td className="text-right font-mono">{i.currentQty} {i.unit}</td>
                <td className="text-right font-mono">{i.reorderLevel} {i.unit}</td>
                <td>
                  <span className={`pill ${i.status === "Low" ? "warn" : "ok"}`}>
                    {i.status}
                  </span>
                </td>
                <td className="text-right">
                  {i.status === "Low" && (
                    <button
                      type="button"
                      onClick={() => onOrderRestock(i.id)}
                      className="btn btn-ghost text-[11px]"
                    >
                      <PackageCheck className="w-3.5 h-3.5" /> Order restock
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
