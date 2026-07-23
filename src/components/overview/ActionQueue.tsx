import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import type { InventoryItem } from "../../types";

interface ActionQueueProps { lowStockItems: InventoryItem[]; isLight: boolean; onReviewAlerts: () => void; }
export function ActionQueue({ lowStockItems, isLight, onReviewAlerts }: ActionQueueProps) {
  const hasAlerts = lowStockItems.length > 0;
  return <section className={`gold-liner-box p-4 ${isLight ? "bg-white" : "bg-zinc-950"}`}>
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className={`rounded-lg p-2 ${hasAlerts ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500"}`}>{hasAlerts ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</span>
        <span className={`text-sm font-bold ${isLight ? "text-zinc-900" : "text-white"}`}>{hasAlerts ? `${lowStockItems.length} alert${lowStockItems.length === 1 ? "" : "s"}` : "All clear"}</span>
      </div>
      <button type="button" onClick={onReviewAlerts} className="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-orange-600">Review <ArrowRight className="h-3 w-3" /></button>
    </div>
    {hasAlerts && <p className={`mt-3 text-xs ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>{lowStockItems.slice(0, 3).map(item => `${item.name} (${item.currentQty} ${item.unit})`).join(", ")}{lowStockItems.length > 3 && ", and more."}</p>}
  </section>;
}
