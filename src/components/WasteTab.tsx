import React, { useState } from 'react';
import { WasteRecord } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Trash2, 
  Sparkles, 
  Scale, 
  DollarSign, 
  AlertCircle, 
  Plus, 
  UtensilsCrossed 
} from 'lucide-react';

interface WasteTabProps {
  wasteRecords: WasteRecord[];
  onAddWaste: (record: Omit<WasteRecord, 'id' | 'date'>) => void;
  totalCostToday: number;
}

export default function WasteTab({ wasteRecords, onAddWaste, totalCostToday }: WasteTabProps) {
  // New logging form state
  const [newItem, setNewItem] = useState('');
  const [category, setCategory] = useState('Seafood');
  const [weight, setWeight] = useState(1.0);
  const [cost, setCost] = useState(10.00);
  const [reason, setReason] = useState<'Expired' | 'Overproduced' | 'Quality Issue' | 'Spill/Accident'>('Expired');

  // AI strategy helper states
  const [helpCat, setHelpCat] = useState('Seafood');
  const [repurposeStrategy, setRepurposeStrategy] = useState('');
  const [strategyLoading, setStrategyLoading] = useState(false);

  // Compute Data for Pie Chart
  const reasonData = wasteRecords.reduce((acc: any, rec) => {
    if (!acc[rec.reason]) acc[rec.reason] = 0;
    acc[rec.reason] += rec.cost; // Aggregate by cost proportions
    return acc;
  }, {});
  const pieData = Object.keys(reasonData).map(key => ({
    name: key, 
    value: reasonData[key]
  }));
  const PIE_COLORS: Record<string, string> = {
    'Expired': '#f43f5e',       // rose-500
    'Overproduced': '#f59e0b',  // amber-500
    'Quality Issue': '#6366f1', // indigo-500
    'Spill/Accident': '#64748b' // slate-500
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim() || weight <= 0 || cost <= 0) return;
    onAddWaste({
      item: newItem,
      category,
      weight,
      cost,
      reason
    });
    setNewItem('');
    setWeight(1.0);
    setCost(10.00);
  };

  const handleFetchRepurposeStrategy = async () => {
    setStrategyLoading(true);
    setRepurposeStrategy('');
    try {
      const commandText = `As Head Chef of Food Penguin, give 3 innovative commercial recipe repurposing guidelines or preservation hacks for high-volume kitchen waste in our "${helpCat}" category. Be creative and focus on raising margins. Keep advice under 5 sentences.`;
      const res = await fetch("/api/gemini/low-latency-cmd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: commandText }),
      });
      const data = await res.json();
      if (data.error) {
        setRepurposeStrategy(`Error drawing plans: ${data.error}`);
      } else {
        setRepurposeStrategy(data.text);
      }
    } catch (err: any) {
      setRepurposeStrategy(`Strategy retrieval failed: ${err.message || err}`);
    } finally {
      setStrategyLoading(false);
    }
  };

  const reasonColors = (reasonStr: string) => {
    switch (reasonStr) {
      case 'Expired': return 'bg-rose-50 text-rose-700 border border-rose-100';
      case 'Overproduced': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'Quality Issue': return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      case 'Spill/Accident': return 'bg-slate-100 text-slate-700 border';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 overflow-hidden">

      {/* LEFT ASPECT: FOOD WASTE LEDGER & METRICS */}
      <div className="xl:col-span-2 space-y-4 min-h-0 overflow-y-auto scrollbar-hide">

        {/* Dynamic Allowance Index and Chart Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Food Waste Cost Summary</h2>
                <p className="subtitle text-xs text-slate-500">Corporate daily financial leakage benchmarks</p>
              </div>
              
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-center gap-3 self-start sm:self-auto">
                <div className="p-2 bg-rose-500 text-white rounded">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-rose-500 font-bold tracking-wide">Leakage Today</span>
                  <span className="text-lg font-sans font-bold text-slate-905 block -mt-1">
                    €{totalCostToday.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalCostToday / 500) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2">
                <span>Safety Limit Target: €500.00 Max</span>
                <span className="font-bold text-rose-600">
                  {((totalCostToday / 500) * 100).toFixed(1)}% of allowance consumed
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm h-48 md:h-auto min-h-[220px] flex flex-col">
            <h2 className="text-lg font-semibold text-slate-900">Leakage Proportions</h2>
            <p className="text-xs text-slate-500">Cost value breakdown by incident reason</p>
            <div className="flex-1 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(value: number) => `€${value.toFixed(2)}`}
                  />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    iconSize={8} 
                    wrapperStyle={{ fontSize: '10px', color: '#64748b' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Waste Ledger */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Daily Spoilage & Scrap Ledger</h2>
            <p className="text-xs text-slate-500">Documented items removed from active inventory</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-mono tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Waste Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Weight</th>
                  <th className="py-3 px-4 text-center">Incident Classification</th>
                  <th className="py-3 px-4 text-right">Lost Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wasteRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{rec.item}</td>
                    <td className="py-3 px-4 text-slate-500">{rec.category}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{rec.weight.toFixed(1)} kg</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono text-[9px] font-semibold ${reasonColors(rec.reason)}`}>
                        {rec.reason}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">-€{rec.cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE ASPECT: WASTE LOG BUILDER & AI OPTIMIZER */}
      <div className="space-y-4 min-h-0 overflow-y-auto scrollbar-hide">

        {/* Scraps Spoilage Log Creator */}
        <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-4">
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Log Spoilage Incident</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase">Debited Item Description</label>
              <input
                type="text"
                required
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g. Oxidized tuna trim, Dried nori sheets"
                className="w-full mt-1 p-2 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 p-2 text-xs border border-slate-200 bg-white rounded focus:ring-1 focus:ring-sky-500 focus:outline-none"
                >
                  <option>Seafood</option>
                  <option>Rice</option>
                  <option>Seaweed</option>
                  <option>Produce</option>
                  <option>Condiments</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Weight Equivalent (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weight || ''}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 p-2 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Estimated loss (€)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={cost || ''}
                  onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 p-2 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Primary Cause</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full mt-1 p-2 text-xs border border-slate-200 bg-white rounded focus:ring-1 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="Expired">Expired</option>
                  <option value="Overproduced">Overproduced</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Spill/Accident">Spill/Accident</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-medium text-xs rounded transition-colors inline-flex justify-center items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              Commit Spoilage Debiting
            </button>
          </form>
        </div>

        {/* AI Repurposing Chef Bench */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-sky-600 animate-spin-slow" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">AI Upcycle Kitchen Chef</span>
            </div>
            <span className="bg-amber-100 text-amber-800 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
              gemini-3.1-flash-lite
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Select a waste category and generate high-yield raw material transformations to turn scrap to margins.
          </p>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase">Category under pressure</label>
              <select
                value={helpCat}
                onChange={(e) => setHelpCat(e.target.value)}
                className="w-full mt-1 p-2 text-xs border border-slate-250 bg-white rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="Seafood">Seafood Scraps (tuna/salmon trim, belly cuts)</option>
                <option value="Rice">Sushi Rice Overshoot (over-seasoned shari)</option>
                <option value="Seaweed">Nori Offcuts (dried or damp sheets)</option>
                <option value="Produce">Produce Trimmings (avocado, cucumber ends)</option>
              </select>
            </div>

            <button
              onClick={handleFetchRepurposeStrategy}
              disabled={strategyLoading}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-white font-medium text-xs rounded transition-all inline-flex justify-center items-center gap-1.5 shadow-sm disabled:bg-slate-300"
            >
              {strategyLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvaging Scrap Ingredients...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Formulate Salvage Instructions
                </>
              )}
            </button>
          </div>

          {repurposeStrategy && (
            <div className="bg-white border border-slate-190 rounded p-4 shadow-inner space-y-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-teal-600 font-extrabold block">Skipper's Kitchen Hack Sheet:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">{repurposeStrategy}</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
