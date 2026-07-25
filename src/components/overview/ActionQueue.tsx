// Saksee · 2026-07-24 · feat/new-design-system
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import type { InventoryItem } from "../../types";

interface ActionQueueProps {
  lowStockItems: InventoryItem[];
  onReviewAlerts: () => void;
}

export function ActionQueue({ lowStockItems, onReviewAlerts }: ActionQueueProps) {
  const hasAlerts = lowStockItems.length > 0;
  return (
    <section className="card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${hasAlerts ? "bg-amber-500/10 text-[var(--warn)]" : "bg-emerald-500/10 text-[var(--ok)]"}`}>
            {hasAlerts ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </span>
          <div>
            <span className="text-sm font-semibold text-[var(--text)]">{hasAlerts ? `${lowStockItems.length} alert${lowStockItems.length === 1 ? "" : "s"}` : "All clear"}</span>
            <p className="text-[11px] text-[var(--muted)]">{hasAlerts ? "Inventory needs attention" : "No outstanding issues"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReviewAlerts}
          className="btn btn-primary text-[10px] shrink-0"
        >
          Review <ArrowRight className="h-3 w-3" />
        </button>
      </div>
      {hasAlerts && (
        <p className="mt-3 text-xs text-[var(--muted)]">
          {lowStockItems.slice(0, 3).map(item => `${item.name} (${item.currentQty} ${item.unit})`).join(", ")}
          {lowStockItems.length > 3 && ", and more."}
        </p>
      )}
    </section>
  );
}
