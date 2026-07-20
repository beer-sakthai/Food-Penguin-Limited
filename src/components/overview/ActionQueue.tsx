import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import type { InventoryItem } from "../../types";

interface ActionQueueProps { lowStockItems: InventoryItem[]; isLight: boolean; onReviewAlerts: () => void; }
export function ActionQueue({ lowStockItems, isLight, onReviewAlerts }: ActionQueueProps) {
  const hasAlerts = lowStockItems.length > 0;
  return <section className={`gold-liner-box p-5 ${isLight ? "bg-white" : "bg-zinc-950"}`} aria-labelledby="action-queue-heading">
    <div className="flex items-start justify-between gap-4">
      <div className="flex gap-3"><span className={`rounded-xl p-2.5 ${hasAlerts ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500"}`}>{hasAlerts ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}</span><div><p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Action queue</p><h2 id="action-queue-heading" className={`mt-1 text-base font-black ${isLight ? "text-zinc-900" : "text-white"}`}>{hasAlerts ? `${lowStockItems.length} alert${lowStockItems.length === 1 ? "" : "s"} need attention` : "No urgent actions"}</h2></div></div>
      <button type="button" onClick={onReviewAlerts} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-xs font-bold text-white hover:bg-orange-600">Review alerts <ArrowRight className="h-3.5 w-3.5" /></button>
    </div>
    <p className={`mt-4 text-xs leading-relaxed ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>{hasAlerts ? `Low stock: ${lowStockItems.slice(0, 3).map(item => `${item.name} (${item.currentQty} ${item.unit})`).join(", ")}${lowStockItems.length > 3 ? ", and more." : "."}` : "Production, stock, and staffing signals are within their normal operating thresholds."}</p>
  </section>;
}
