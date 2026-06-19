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
      case 'Healthy': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Low': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'Critical': return 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 overflow-hidden">

      {/* LEFT ASPECT: REAL RAW MATERIALS STOCK PLAN */}
      <div className="xl:col-span-2 space-y-4 min-h-0 overflow-y-auto scrollbar-hide">

        {/* Stock Level Matrix */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="pb-4">
            <h2 className="text-base font-sans font-semibold text-slate-900">Cold Chain Inventory Planning</h2>
            <p className="text-xs text-slate-500">Documented levels of fresh ingredients & freezer raw materials</p>
          </div>

          <div className="space-y-4">
            {inventory.map((item) => (
              <div key={item.id} className="border border-slate-100 bg-slate-50/50 p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1 md:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-slate-800 text-sm">{item.name}</span>
                    <span className={`px-2 py-0.2 rounded font-mono text-[9px] font-bold ${statusColors(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">ID: {item.id} | Category: {item.category}</p>
                </div>

                <div className="flex-1 space-y-1.5 md:px-4">
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>Reorder alert threshold: {item.reorderLevel} {item.unit}</span>
                    <span className="font-bold text-slate-800">{item.currentQty} {item.unit} ({item.stockLevel}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
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
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 shadow'
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
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-sky-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-widest text-sans">Market Grounding Center</span>
          </div>
          <span className="bg-amber-100 text-amber-800 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
            gemini-3.5-flash
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          This feature implements active <span className="text-sky-600 font-bold">Google Search Grounding</span>. Before purchasing bulk shipments of flour, fish, or packaging, use the live search grounder to scan global wholesale trends:
        </p>

        <div>
          <label className="text-[10px] font-mono text-slate-400 uppercase">Search Grounding Query</label>
          <div className="relative mt-1">
            <textarea
              value={procurementQuery}
              onChange={(e) => setProcurementQuery(e.target.value)}
              className="w-full h-24 p-2.5 text-xs bg-white border border-slate-250 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none shadow-inner text-slate-800 font-sans"
              placeholder="e.g. wholesale price fluctuations wheat gluten pack..."
            />
          </div>
        </div>

        <button
          onClick={handleGroundingSearch}
          disabled={searchLoading}
          className="w-full py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:bg-slate-350 text-white text-xs font-semibold rounded transition-all inline-flex justify-center items-center gap-2 shadow-sm"
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
          <div className="bg-white border border-slate-200/95 rounded-lg p-4 shadow-inner space-y-2 overflow-y-auto scrollbar-hide max-h-[220px]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-sky-600 font-extrabold flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Grounded Search Findings (2026):
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">{groundedInsights}</p>
          </div>
        )}
      </div>

    </div>
  );
}
