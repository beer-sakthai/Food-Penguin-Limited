import { useState } from 'react';
import { InventoryItem } from '../types';
import { 
  Boxes, 
  Sparkles, 
  Search, 
  Globe, 
  AlertTriangle, 
  TrendingUp, 
  ArrowDownToLine, 
  CheckCircle2 
} from 'lucide-react';

interface PlanningTabProps {
  inventory: InventoryItem[];
  onOrderRestock: (itemId: string) => void;
}

export default function PlanningTab({ inventory, onOrderRestock }: PlanningTabProps) {
  // Search Grounding states
  const [procurementQuery, setProcurementQuery] = useState('Current wholesale bulk price of wild cold-water Alaskan Cod slabs, and general ocean shipment bottlenecks.');
  const [groundedInsights, setGroundedInsights] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleGroundingSearch = async () => {
    if (!procurementQuery.trim()) return;
    setSearchLoading(true);
    setGroundedInsights('');
    try {
      const res = await fetch("/api/gemini/search-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: procurementQuery }),
      });
      const data = await res.json();
      if (data.error) {
        setGroundedInsights(`Search Grounding failure: ${data.error}`);
      } else {
        setGroundedInsights(data.text);
      }
    } catch (err: any) {
      setGroundedInsights(`Network issue: ${err.message || err}`);
    } finally {
      setSearchLoading(false);
    }
  };

  const statusColors = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-emerald-950/40 text-emerald-450 border border-emerald-900/40';
      case 'Low': return 'bg-amber-950/40 text-amber-450 border border-amber-900/40';
      case 'Critical': return 'bg-rose-950/40 text-rose-450 border border-rose-900/40 animate-pulse';
      default: return 'bg-zinc-900 text-zinc-500 border border-zinc-800';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* LEFT ASPECT: REAL RAW MATERIALS STOCK PLAN */}
      <div className="xl:col-span-2 space-y-6">

        {/* Stock Level Matrix */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 shadow-sm text-white">
          <div className="pb-4">
            <h2 className="text-base font-sans font-semibold text-white">Cold Chain Inventory Planning</h2>
            <p className="text-xs text-zinc-500">Documented levels of fresh ingredients & freezer raw materials</p>
          </div>

          <div className="space-y-4">
            {inventory.map((item) => (
              <div key={item.id} className="border border-zinc-800 bg-zinc-950 p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1 md:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-white text-sm">{item.name}</span>
                    <span className={`px-2 py-0.2 rounded font-mono text-[9px] font-bold ${statusColors(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono">ID: {item.id} | Category: {item.category}</p>
                </div>

                <div className="flex-1 space-y-1.5 md:px-4">
                  <div className="flex justify-between text-xs text-zinc-500 font-mono">
                    <span>Reorder alert threshold: {item.reorderLevel} {item.unit}</span>
                    <span className="font-bold text-zinc-305 text-zinc-300">{item.currentQty} {item.unit} ({item.stockLevel}%)</span>
                  </div>
                  <div className="w-full bg-zinc-900/80 h-2 rounded-full overflow-hidden border border-zinc-850">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.stockLevel <= 20 ? 'bg-rose-500' : item.stockLevel <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.stockLevel}%` }}
                    />
                  </div>
                </div>

                <div className="md:w-32 text-right">
                  <button
                    onClick={() => onOrderRestock(item.id)}
                    disabled={item.status === 'Healthy'}
                    className={`px-3 py-1.5 text-xs rounded transition-colors inline-flex items-center gap-1 w-full justify-center ${
                      item.status === 'Healthy'
                        ? 'bg-zinc-900/50 text-zinc-600 cursor-not-allowed border border-zinc-800/40'
                        : 'bg-zinc-950 border border-zinc-800 text-white hover:bg-zinc-900 shadow'
                    }`}
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR: COMMODITY PROCUREMENT GROUNDING WITH gemini-3.5-flash */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-sm space-y-4 max-h-[580px] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-sans">
            <Globe className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-white uppercase tracking-widest text-sans">Market Grounding Center</span>
          </div>
          <span className="bg-zinc-900 text-zinc-300 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold border border-zinc-800">
            gemini-3.5-flash
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
          This feature implements active <span className="text-orange-400 font-bold">Google Search Grounding</span>. Before purchasing bulk shipments of flour, fish, or packaging, use the live search grounder to scan global wholesale trends:
        </p>

        <div>
          <label className="text-[10px] font-mono text-zinc-500 uppercase">Search Grounding Query</label>
          <div className="relative mt-1">
            <textarea
              value={procurementQuery}
              onChange={(e) => setProcurementQuery(e.target.value)}
              className="w-full h-24 p-2.5 text-xs bg-zinc-900 border border-zinc-800 text-white rounded focus:ring-1 focus:ring-orange-500 focus:outline-none shadow-inner font-sans"
              placeholder="e.g. wholesale price fluctuations wheat gluten pack..."
            />
          </div>
        </div>

        <button
          onClick={handleGroundingSearch}
          disabled={searchLoading}
          className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 disabled:bg-zinc-950 text-white text-xs font-semibold rounded transition-all inline-flex justify-center items-center gap-2 shadow-sm"
        >
          {searchLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Scanning Grounding Layers...
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              Fetch Real-time Grounded Price Index
            </>
          )}
        </button>

        {groundedInsights && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-inner space-y-2 overflow-y-auto max-h-[220px]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-extrabold flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Grounded Search Findings (2026):
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">{groundedInsights}</p>
          </div>
        )}
      </div>

    </div>
  );
}
