import React, { useState } from 'react';
import { CompanyTarget } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { 
 Target, 
 Sparkles, 
 Trophy, 
 TrendingUp, 
 Trash2, 
 Clock, 
 Package, 
 Plus,
 AlertCircle
} from 'lucide-react';

interface TargetTabProps {
 targets: CompanyTarget[];
 onAddTarget: (target: Omit<CompanyTarget, 'id'>) => void;
}

export default function TargetTab({ targets, onAddTarget }: TargetTabProps) {
 // Target Formulation Form state
 const [name, setName] = useState('');
 const [metric, setMetric] = useState('');
 const [targetValue, setTargetValue] = useState(0);
 const [unit, setUnit] = useState('units');
 const [category, setCategory] = useState<'Sell' | 'Production' | 'Waste' | 'Hours'>('Production');
 const [deadline, setDeadline] = useState('End of next week');

 // AI Target Optimization state
 const [optimizeText, setOptimizeText] = useState('Suggest an ambitious, achievable waste-reduction target and timeline for a high-volume cold-chain distribution center like ours.');
 const [aiSuggestions, setAiSuggestions] = useState('');
 const [loadingSuggestion, setLoadingSuggestion] = useState(false);

 const completionData = targets.map(tgt => {
 const isHours = tgt.category === 'Hours';
 const pct = Math.min((tgt.currentValue / tgt.targetValue) * 100, 100);
 return {
 name: tgt.name,
 completion: Math.round(isHours ? (tgt.currentValue <= tgt.targetValue ? 100 : 50) : pct)
 };
 });

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!name.trim() || !metric.trim() || targetValue <= 0) return;
 onAddTarget({
 name,
 metric,
 targetValue,
 currentValue: 0,
 unit,
 category,
 deadline
 });
 setName('');
 setMetric('');
 setTargetValue(0);
 setUnit('units');
 };

 const handleOptimizeTarget = async () => {
 if (!optimizeText.trim()) return;
 setLoadingSuggestion(true);
 setAiSuggestions('');
 try {
 const res = await fetch("/api/gemini/low-latency-cmd", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ command: `Format a smart food target optimization strategy based on: "${optimizeText}"` }),
 });
 const data = await res.json();
 if (data.error) {
 setAiSuggestions(`Error parsing optimization: ${data.error}`);
 } else {
 setAiSuggestions(data.text);
 }
 } catch (err: any) {
 setAiSuggestions(`Error connecting: ${err.message || err}`);
 } finally {
 setLoadingSuggestion(false);
 }
 };

 const getCategoryIcon = (cat: string) => {
 switch (cat) {
 case 'Sell': return <TrendingUp className="w-5 h-5 text-orange-500" />;
 case 'Production': return <Package className="w-5 h-5 text-emerald-500" />;
 case 'Waste': return <Trash2 className="w-5 h-5 text-rose-500" />;
 case 'Hours': return <Clock className="w-5 h-5 text-amber-500" />;
 default: return <Target className="w-5 h-5 text-slate-500" />;
 }
 };

 return (
 <div className="grid w-full grid grid-cols-1 xl:grid-cols-2 gap-6 items-start:grid-cols-3 gap-6">
 
 {/* TARGET PROGRESS & PERFORMANCE OVERVIEW */}
 <div className="xl:col-span-2 space-y-6">

 {/* Global Progress Chart Overview */}
 <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm">
 <div className="pb-4 border-b border-zinc-800 flex justify-between items-center">
 <div>
 <h2 className="text-sans font-bold text-white">Completion Status</h2>
 <p className="text-xs text-zinc-500">Corporate-wide metric completions visualized</p>
 </div>
 </div>
 <div className="h-48 mt-6">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={completionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
 <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={(val) => `${val}%`} />
 <Tooltip 
 cursor={{ fill: '#1f2937' }}
 contentStyle={{ backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }}
 itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
 />
 <Bar dataKey="completion" radius={[4, 4, 0, 0]} maxBarSize={40}>
 {completionData.map((entry, index) => (
 <Cell key={`target-cell-${index}-${entry.name}`} fill={entry.completion >= 100 ? '#10b981' : '#f59e0b'} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 
 {/* Progress Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
 {targets.map((tgt) => {
 const isHours = tgt.category === 'Hours';
 const pct = Math.min((tgt.currentValue / tgt.targetValue) * 100, 100);
 const isCompleted = isHours ? tgt.currentValue <= tgt.targetValue : tgt.currentValue >= tgt.targetValue;
 
 return (
 <div key={tgt.id} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm relative overflow-hidden group">
 <div className="flex justify-between items-start pb-2">
 <div className="flex items-center gap-3">
 <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl relative">
 {getCategoryIcon(tgt.category)}
 </div>
 <div>
 <h4 className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest font-bold">{tgt.category} goal</h4>
 <h3 className="text-sm font-sans font-bold text-white group-hover:text-orange-400 transition-colors mt-0.5">{tgt.name}</h3>
 </div>
 </div>
 <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${
 isCompleted ? 'bg-emerald-950/40 text-emerald-450 font-bold border border-emerald-900/40' : 'bg-orange-950/40 text-orange-400 border border-orange-900/40'
 }`}>
 {isCompleted ? 'Verified' : 'Ongoing'}
 </span>
 </div>

 <div className="space-y-2 mt-4">
 <div className="flex justify-between text-xs">
 <span className="text-zinc-500 font-mono">Metric: {tgt.metric}</span>
 <span className="text-white font-bold font-mono">
 {tgt.currentValue} / {tgt.targetValue} {tgt.unit}
 </span>
 </div>
 <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
 <div 
 className={`h-full rounded-full transition-all duration-500 ease-out ${isCompleted ? 'bg-emerald-500' : 'bg-orange-500'}`}
 style={{ width: `${isHours ? (isCompleted ? 100 : 50) : pct}%` }}
 />
 </div>
 <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono pt-1">
 <span>Deadline: {tgt.deadline}</span>
 <span className="text-zinc-400 font-bold">{Math.round(isHours ? (isCompleted ? 100 : 50) : pct)}% Done</span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 
 {/* Target Smart Optimizing Bench */}
 <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-sm space-y-4">
 <div className="flex items-center gap-3">
 <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-orange-400 shadow-md">
 <Trophy className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-sm font-sans font-bold text-white flex items-center gap-1.5">
 AI Target Structuring Helper
 <span className="px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300 text-[9px] font-mono border border-zinc-800">
 gemini-3.1-flash-lite
 </span>
 </h3>
 <p className="text-xs text-zinc-505">Formulate and test mathematical target limits before deployment</p>
 </div>
 </div>

 <textarea
 value={optimizeText}
 onChange={(e) => setOptimizeText(e.target.value)}
 className="w-full h-16 p-3 text-xs bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 font-sans shadow-inner text-white"
 />

 <div className="text-right">
 <button
 onClick={handleOptimizeTarget}
 disabled={loadingSuggestion}
 className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-950 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-2 shadow-md active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
 >
 {loadingSuggestion ? (
 <>
 <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 Stretching Parameters...
 </>
 ) : (
 <>
 <Sparkles className="w-3.5 h-3.5" />
 Analyze Target Feasibility
 </>
 )}
 </button>
 </div>

 {aiSuggestions && (
 <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-inner space-y-2">
 <span className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-bold block">Optimized Target Guidelines:</span>
 <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">{aiSuggestions}</p>
 </div>
 )}
 </div>

 </div>

 {/* FORM: TARGET BUILDER */}
 <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm max-h-[550px]">
 <div className="flex items-center gap-2 pb-4 border-b border-zinc-800 mb-4 animate-fade-in font-sans">
 <Target className="w-5 h-5 text-orange-500" />
 <span className="text-xs font-bold text-white uppercase tracking-wider">Target Formulary Board</span>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Target Header Name</label>
 <input
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="e.g. Kyoto Salmon goal"
 className="w-full mt-1.5 p-2.5 bg-zinc-950 border border-zinc-800 text-white rounded-xl text-xs focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 focus:outline-none"
 />
 </div>

 <div>
 <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Assessment Metric</label>
 <input
 type="text"
 required
 value={metric}
 onChange={(e) => setMetric(e.target.value)}
 placeholder="e.g. Sales (€)"
 className="w-full mt-1.5 p-2.5 bg-zinc-950 border border-zinc-800 text-white rounded-xl text-xs focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 focus:outline-none"
 />
 </div>

 <div className="grid grid-cols-2 gap-3.5">
 <div>
 <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Target value</label>
 <input
 type="number"
 required
 value={targetValue || ''}
 onChange={(e) => setTargetValue(parseInt(e.target.value) || 0)}
 className="w-full mt-1.5 p-2.5 bg-zinc-950 border border-zinc-800 text-white rounded-xl text-xs focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 focus:outline-none font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Unit label</label>
 <input
 type="text"
 required
 value={unit}
 onChange={(e) => setUnit(e.target.value)}
 placeholder="units, €, kg"
 className="w-full mt-1.5 p-2.5 bg-zinc-950 border border-zinc-800 text-white rounded-xl text-xs focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 focus:outline-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3.5">
 <div>
 <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Category</label>
 <select
 value={category}
 onChange={(e) => setCategory(e.target.value as any)}
 className="w-full mt-1.5 p-2.5 bg-zinc-950 border border-zinc-800 text-white rounded-xl text-xs focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 focus:outline-none"
 >
 <option value="Sell">Sell</option>
 <option value="Production">Production</option>
 <option value="Waste">Waste</option>
 <option value="Hours">Hours</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Target Deadline</label>
 <input
 type="text"
 required
 value={deadline}
 onChange={(e) => setDeadline(e.target.value)}
 placeholder="End of Friday"
 className="w-full mt-1.5 p-2.5 bg-zinc-950 border border-zinc-800 text-white rounded-xl text-xs focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 focus:outline-none"
 />
 </div>
 </div>

 <button
 type="submit"
 className="w-full py-2.5 mt-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 shadow-md border border-zinc-800 active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
 >
 <Plus className="w-4 h-4 text-orange-400 animate-pulse" />
 Publish New Corporate Target
 </button>
 </form>
 </div>

 </div>
 );
}
