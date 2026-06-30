import { useState } from 'react';
import { motion } from 'motion/react';
import { InventoryItem, DailyOperationalLog } from '../types';
import CapacityAnalytics from './CapacityAnalytics';
import { 
 Boxes, 
 Sparkles, 
 Search, 
 Globe, 
 AlertTriangle, 
 TrendingUp, 
 ArrowDownToLine, 
 CheckCircle2,
 BrainCircuit,
 ArrowRight,
 X
} from 'lucide-react';

interface PlanningTabProps {
 inventory: InventoryItem[];
 onOrderRestock: (itemId: string) => void;
 selectedBranch: string;
 theme: 'dark' | 'light';
 weeklyLogs: DailyOperationalLog[];
}

export default function PlanningTab({ inventory, onOrderRestock, selectedBranch, theme, weeklyLogs }: PlanningTabProps) {
 const isLight = theme === 'light';
 const lowStockItems = inventory.filter(item => item.status === 'Low' || item.status === 'Critical');
 
 // State for restock confirmation modal
 const [restockConfirmItem, setRestockConfirmItem] = useState<InventoryItem | null>(null);
 
 // Search Grounding states
 const [procurementQuery, setProcurementQuery] = useState('Current wholesale bulk price of wild cold-water Alaskan Cod slabs, and general ocean shipment bottlenecks.');
 const [groundedInsights, setGroundedInsights] = useState('');
 const [searchLoading, setSearchLoading] = useState(false);

 // AI Restock Suggestion states
 const [aiSuggestions, setAiSuggestions] = useState<Record<string, number> | null>(null);
 const [isSuggesting, setIsSuggesting] = useState(false);
 const [suggestionLog, setSuggestionLog] = useState('');

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

 const handleSuggestRestock = async () => {
 setIsSuggesting(true);
 setSuggestionLog(`Analyzing previous week sales volume and product waste metrics for ${selectedBranch}...\n`);
 try {
 const res = await fetch("/api/gemini/suggest-restock", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ 
 branch: selectedBranch, 
 inventory: inventory 
 }),
 });
 const data = await res.json();
 if (data.error) {
 setSuggestionLog(prev => prev + `\nAI Analysis failure: ${data.error}`);
 } else {
 setSuggestionLog(prev => prev + `\n${data.text}`);
 try {
 const parsed = JSON.parse(data.jsonString || '{}');
 setAiSuggestions(parsed);
 } catch(e) {
 const defaultSuggestions: Record<string, number> = {};
 inventory.forEach(item => {
 if (item.status === 'Critical') defaultSuggestions[item.id] = item.reorderLevel * 2;
 else if (item.status === 'Low') defaultSuggestions[item.id] = item.reorderLevel;
 });
 setAiSuggestions(defaultSuggestions);
 }
 }
 } catch (err: any) {
 setSuggestionLog(prev => prev + `\nNetwork issue: ${err.message || err}`);
 } finally {
 setIsSuggesting(false);
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
 <div className="grid grid-cols-1 gap-6">

  {/* LEFT ASPECT: REAL RAW MATERIALS STOCK PLAN */}
 <div className="space-y-6">

 {lowStockItems.length > 0 && (
  <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-300 ${
   isLight ? 'bg-amber-50 border-amber-200 text-amber-950 shadow-sm' : 'bg-amber-950/15 border border-amber-900/40 text-amber-200'
  }`}>
   <div className="flex items-center gap-3">
    <div className={`p-2 rounded-lg ${isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-950/60 text-amber-400'}`}>
     <AlertTriangle className="w-4 h-4 animate-bounce text-amber-500" />
    </div>
    <div>
     <p className="text-xs font-black">Restock Warning: {lowStockItems.length} Raw Materials Low</p>
     <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Automated safety threshold triggers active. Please initialize the supply chain order restock procedure below.</p>
    </div>
   </div>
   <span className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 text-[10px] font-mono font-black uppercase tracking-wider animate-pulse shrink-0">
    Action Needed
   </span>
  </div>
 )}

 {/* Stock Level Matrix */}
 <div className={`rounded-xl border p-5 shadow-sm transition-all ${
 isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800 text-white'
 }`}>
 <div className="pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h2 className={`text-base font-sans font-semibold ${isLight ? 'text-zinc-800' : 'text-white'}`}>Cold Chain Inventory Planning</h2>
 <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Documented levels of fresh ingredients & freezer raw materials for {selectedBranch}</p>
 </div>
 
 <button
 onClick={handleSuggestRestock}
 disabled={isSuggesting}
 className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm ${
 isLight 
 ? 'bg-yellow-50  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-yellow-100 text-yellow-700 border border-yellow-200'
 : 'bg-yellow-950/40 hover:bg-yellow-900/60 text-yellow-400 border border-yellow-900/50'
 }`}
 >
 {isSuggesting ? (
 <span className="w-3.5 h-3.5 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
 ) : (
 <BrainCircuit className="w-4 h-4" />
 )}
 {isSuggesting ? 'Analyzing...' : 'AI Suggest Restock'}
 </button>
 </div>
 
 {suggestionLog && (
 <div className={`mb-4 p-3 rounded-lg border text-[10px] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto ${
 isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
 }`}>
 {suggestionLog}
 </div>
 )}

 <div className="space-y-4">
 {inventory.map((item) => {
 const suggestedValue = aiSuggestions ? aiSuggestions[item.id] : null;
 
 return (
 <div key={item.id} className={`border p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
 isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
 }`}>
 <div className="space-y-1 md:w-1/3">
 <div className="flex items-center gap-2">
 <span className={`font-sans font-bold text-sm ${isLight ? 'text-zinc-800' : 'text-white'}`}>{item.name}</span>
 <span className={`px-2 py-0.2 rounded font-mono text-[9px] font-bold ${statusColors(item.status)}`}>
 {item.status}
 </span>
 </div>
 <p className="text-xs text-zinc-500 font-mono">ID: {item.id} | Category: {item.category}</p>
 </div>

 <div className="flex-1 space-y-1.5 md:px-4">
 <div className="flex justify-between text-xs text-zinc-500 font-mono">
 <span>Reorder alert threshold: {item.reorderLevel} {item.unit}</span>
 <span className={`font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{item.currentQty} {item.unit} ({item.stockLevel}%)</span>
 </div>
 <div className={`w-full h-2 rounded-full overflow-hidden border ${isLight ? 'bg-zinc-200 border-zinc-300' : 'bg-zinc-900/80 border-zinc-800'}`}>
 <div 
 className={`h-full rounded-full transition-all duration-300 ${
 item.stockLevel <= 20 ? 'bg-rose-500' : item.stockLevel <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
 }`}
 style={{ width: `${item.stockLevel}%` }}
 />
 </div>
 </div>

 <div className="md:w-40 text-right flex flex-col items-end gap-2">
 {suggestedValue != null && (
 <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${isLight ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-950/80 text-yellow-400'}`}>
 Suggest: +{suggestedValue}{item.unit}
 </span>
 )}
 <button
 onClick={() => setRestockConfirmItem(item)}
 disabled={item.status === 'Healthy'}
 className={`px-3 py-1.5 text-xs rounded transition-colors inline-flex items-center gap-1 w-full justify-center ${
 item.status === 'Healthy'
 ? isLight 
 ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-100' 
 : 'bg-zinc-900/50 text-zinc-600 cursor-not-allowed border border-zinc-800/40 hover:bg-zinc-900/50'
 : isLight
 ? 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 shadow'
 : 'bg-zinc-950 border border-zinc-800 text-white hover:bg-zinc-900 shadow'
 }`}
 >
 <ArrowDownToLine className="w-3.5 h-3.5" />
 Restock
 </button>
 </div>
 </div>
 )})}
 </div>
 </div>

 {/* Capacity Analytics visual component */}
 <CapacityAnalytics weeklyLogs={weeklyLogs} isLight={isLight} />

  {/* Restock Order Confirmation Modal */}
  {restockConfirmItem && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/65 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-md rounded-3xl shadow-2xl p-6 border relative transition-all duration-300 ${
          isLight
            ? "bg-white border-zinc-200 text-zinc-900"
            : "bg-zinc-950 border-zinc-800 text-white"
        } focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500`}
      >
        {/* Close Button */}
        <button
          onClick={() => setRestockConfirmItem(null)}
          className={`absolute top-5 right-5 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer ${
            isLight ? "text-zinc-400 hover:text-zinc-600" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <X size={16} />
        </button>

        {/* Header Icon + Brand Title */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-950/60 text-amber-400 border border-amber-900/30'} flex shrink-0`}>
            <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h3 className={`text-base font-sans font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
              Confirm Supply Chain Reset
            </h3>
            <p className="text-[9px] uppercase font-mono font-black tracking-wider text-amber-500 mt-0.5">
              Food Penguin Operational Trigger
            </p>
          </div>
        </div>

        {/* Change pathway summary */}
        <div className={`mt-5 p-4 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-850'} space-y-4`}>
          <div>
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Raw Ingredient Target
            </span>
            <span className={`block font-sans font-black text-sm mt-0.5 ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>
              {restockConfirmItem.name}
            </span>
            <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">
              ID: {restockConfirmItem.id} | Category: {restockConfirmItem.category}
            </span>
          </div>

          {/* Flow Pathway columns */}
          <div className="grid grid-cols-11 items-center gap-2 py-2.5 border-t border-b border-zinc-200 dark:border-zinc-800/80">
            {/* Current State Column */}
            <div className="col-span-5 space-y-1">
              <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Current Level
              </span>
              <span className="block font-sans font-extrabold text-xs text-rose-500 dark:text-rose-400">
                {restockConfirmItem.currentQty} {restockConfirmItem.unit}
              </span>
              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-rose-950/40 text-rose-400 border border-rose-900/40">
                {restockConfirmItem.stockLevel}% ({restockConfirmItem.status})
              </span>
            </div>

            {/* Transform arrow */}
            <div className="col-span-1 flex justify-center text-amber-500">
              <ArrowRight size={14} className="animate-pulse" />
            </div>

            {/* Target State Column */}
            <div className="col-span-5 space-y-1 text-right">
              <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Restocked Level
              </span>
              <span className="block font-sans font-extrabold text-xs text-emerald-500 dark:text-emerald-400">
                {restockConfirmItem.reorderLevel + 120} {restockConfirmItem.unit}
              </span>
              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900/40">
                100% (Healthy)
              </span>
            </div>
          </div>

          <p className="text-[10.5px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
            This action will authorize restocking to the premium margin safe-threshold. The inventory status indicator will reset to <span className="font-extrabold text-emerald-500">Healthy</span>, clear alert flags from dashboard tabs, and restore full operational capacity.
          </p>
        </div>

        {/* Buttons / Options */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => setRestockConfirmItem(null)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer ${
              isLight
                ? "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700"
                : "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-400"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onOrderRestock(restockConfirmItem.id);
              setRestockConfirmItem(null);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            Confirm & Restock
          </button>
        </div>
      </motion.div>
    </div>
  )}

 </div>

 </div>
 );
}