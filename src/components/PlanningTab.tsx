import { useState } from 'react';
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
 BrainCircuit
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
 ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
 : 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-400 border border-indigo-900/50'
 }`}
 >
 {isSuggesting ? (
 <span className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
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
 <span className={`font-sans font-bold text-sm ${isLight ? 'text-zinc-850' : 'text-white'}`}>{item.name}</span>
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
 <div className={`w-full h-2 rounded-full overflow-hidden border ${isLight ? 'bg-zinc-200 border-zinc-300' : 'bg-zinc-900/80 border-zinc-850'}`}>
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
 <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-950/80 text-indigo-400'}`}>
 Suggest: +{suggestedValue}{item.unit}
 </span>
 )}
 <button
 onClick={() => onOrderRestock(item.id)}
 disabled={item.status === 'Healthy'}
 className={`px-3 py-1.5 text-xs rounded transition-colors inline-flex items-center gap-1 w-full justify-center ${
 item.status === 'Healthy'
 ? isLight 
 ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200 hover:bg-zinc-100' 
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

 </div>

 </div>
 );
}