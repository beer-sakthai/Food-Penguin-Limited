import React, { useState, useEffect } from 'react';
import { WasteRecord, DailyOperationalLog, CompanyTarget } from '../types';
import { 
 PieChart, 
 Pie, 
 Cell, 
 Tooltip, 
 ResponsiveContainer, 
 Legend,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid
} from 'recharts';
import { 
 Trash2, 
 Sparkles, 
 Euro, 
 Plus, 
 TrendingDown
} from 'lucide-react';
import { MS_PRODUCTS, TESCO_PRODUCTS } from '../data';
import { Badge, Button, Card, Input, Select } from '../design-system';

interface WasteTabProps {
 wasteRecords: WasteRecord[];
 onAddWaste: (record: Omit<WasteRecord, 'id' | 'date'>) => void;
 totalCostToday: number;
 selectedBranch: 'Marks & Spencer - Cork City' | 'Tesco - Cork City' | 'Tesco - Mahon Point' | 'All Branches';
 weeklyLogs?: DailyOperationalLog[];
 targets?: CompanyTarget[];
 theme?: 'light' | 'dark';
}

export default function WasteTab({ 
 wasteRecords, 
 onAddWaste, 
 totalCostToday, 
 selectedBranch,
 weeklyLogs = [],
 targets = [],
 theme = 'dark'
}: WasteTabProps) {
 const isLight = theme === 'light';
 const isMS = selectedBranch === 'Marks & Spencer - Cork City';
 const products = isMS ? MS_PRODUCTS : TESCO_PRODUCTS;

 // New logging form state
 const [newItem, setNewItem] = useState(products[0].name);
 const [category, setCategory] = useState(products[0].category);
 const [weight, setWeight] = useState(1.0);
 const [cost, setCost] = useState(products[0].price);
 const [reason, setReason] = useState<'Expired' | 'Overproduced' | 'Quality Issue' | 'Spill/Accident'>('Expired');

 const handleProductChange = (prodName: string) => {
 setNewItem(prodName);
 const prod = products.find(p => p.name === prodName);
 if (prod) {
 setCategory(prod.category);
 setCost(parseFloat((prod.price * weight).toFixed(2)));
 }
 };

 const handleWeightChange = (newWg: number) => {
 setWeight(newWg);
 const prod = products.find(p => p.name === newItem);
 if (prod) {
 setCost(parseFloat((prod.price * newWg).toFixed(2)));
 }
 };

 // Sync state when selected branch changes
 useEffect(() => {
 const firstProd = products[0];
 if (firstProd) {
 setNewItem(firstProd.name);
 setCategory(firstProd.category);
 setCost(parseFloat((firstProd.price * weight).toFixed(2)));
 }
 }, [selectedBranch]);

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
 'Expired': '#f43f5e', // rose-500
 'Overproduced': '#f59e0b', // amber-500
 'Quality Issue': '#6366f1', // yellow-500
 'Spill/Accident': '#64748b' // slate-500
 };

 // Compute Data for Waste vs Budget Bar Chart
 const wasteTarget = targets.find(t => t.category === 'Waste' && t.metric === 'Food Waste Cost') || targets.find(t => t.category === 'Waste');
 const targetBudget = wasteTarget ? wasteTarget.targetValue : 500;

 const barChartData = (weeklyLogs && weeklyLogs.length > 0 ? weeklyLogs : []).map(log => ({
 day: log.day,
 actual: log.waste,
 budget: targetBudget
 }));

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
 const firstProd = products[0];
 if (firstProd) {
 setNewItem(firstProd.name);
 setCategory(firstProd.category);
 setWeight(1.0);
 setCost(firstProd.price);
 } else {
 setNewItem('');
 setWeight(1.0);
 setCost(10.00);
 }
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

 const reasonTone = (reasonStr: string) => {
 switch (reasonStr) {
 case 'Expired': return 'danger' as const;
 case 'Overproduced': return 'warning' as const;
 case 'Quality Issue': return 'warning' as const;
 case 'Spill/Accident': return 'neutral' as const;
 default: return 'neutral' as const;
 }
 };

 return (
 <div className="w-full h-full grid grid-cols-1 xl:grid-cols-2 gap-6 md:overflow-hidden">

      {/* LEFT ASPECT: FOOD WASTE LEDGER & METRICS */}
      <div className="lg:col-span-2 space-y-6 md:h-full md:overflow-y-auto md:pr-1">

 {/* Dynamic Allowance Index and Chart Split */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card isLight={isLight} className="flex flex-col justify-between">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h2 className={`text-base font-sans font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Food Waste Cost Summary</h2>
 <p className="subtitle text-xs text-zinc-500">Corporate daily financial leakage benchmarks</p>
 </div>
 
 <div className={`p-3 rounded-lg flex items-center gap-3 self-start sm:self-auto ${
 isLight ? 'bg-rose-50 border border-rose-200' : 'bg-rose-950/40 border border-rose-900/40'
 }`}>
 <div className="p-2 bg-rose-500 text-white rounded">
 <Euro className="w-5 h-5" />
 </div>
 <div>
 <span className={`text-xs uppercase font-mono font-bold tracking-wide ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>Leakage Today</span>
 <span className={`text-3xl font-sans font-bold block -mt-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
 €{totalCostToday.toFixed(2)}
 </span>
 </div>
 </div>
 </div>

 <div className="mt-8">
 <div className={`w-full h-2 rounded-full overflow-hidden border ${
 isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
 }`}>
 <div 
 className="bg-rose-500 h-full rounded-full transition-all duration-500"
 style={{ width: `${Math.min((totalCostToday / 500) * 100, 100)}%` }}
 />
 </div>
 <div className="flex justify-between items-center text-xs text-zinc-500 font-mono mt-2">
 <span>Safety Limit Target: €500.00 Max</span>
 <span className="font-bold text-rose-400">
 {((totalCostToday / 500) * 100).toFixed(1)}% of allowance consumed
 </span>
 </div>
 </div>
 </Card>

 <Card isLight={isLight} className="flex-1 min-h-[220px] flex flex-col">
 <h2 className={`text-base font-sans font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Leakage Proportions</h2>
 <p className="text-xs text-zinc-500">Cost value breakdown by incident reason</p>
 <div className="flex-1 mt-2">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Tooltip 
 contentStyle={{ 
 backgroundColor: isLight ? '#ffffff' : '#09090b', 
 borderRadius: '12px', 
 border: isLight ? '1px solid #e4e4e7' : '1px solid #27272a', 
 color: isLight ? '#18181b' : '#fff', 
 fontSize: '15px' 
 }}
 itemStyle={{ fontWeight: 'bold' }}
 formatter={(value: any) => `€${value.toFixed(2)}`}
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
 <Cell key={`waste-cell-${index}-${entry.name}`} fill={PIE_COLORS[entry.name] || '#94a3b8'} />
 ))}
 </Pie>
 <Legend 
 verticalAlign="bottom" 
 height={36} 
 iconType="circle" 
 iconSize={8} 
 wrapperStyle={{ fontSize: '15px', color: isLight ? '#52525b' : '#a1a1aa' }} 
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </Card>
 </div>

 {/* Create a beautiful bar chart to compare daily waste costs against the target waste budget */}
 <Card isLight={isLight}>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dashed border-zinc-700/20">
 <div className="flex items-center gap-3">
 <div className={`p-3 border rounded-2xl transition-all duration-300 ${
 isLight ? 'bg-zinc-100 border-zinc-200 text-rose-600' : 'bg-zinc-950 border-zinc-800 text-rose-400'
 }`}>
 <TrendingDown className="w-5 h-5 flex-shrink-0" />
 </div>
 <div>
 <h3 className={`text-base font-sans font-bold flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
 Daily Waste Benchmark vs Target
 <Badge tone="danger" size="sm" isLight={isLight} uppercase>
 Weekly Target
 </Badge>
 </h3>
 <p className="subtitle text-xs text-zinc-500">Chronological analysis of actual food waste costs compared to the preset daily target budget</p>
 </div>
 </div>
 </div>

 <div className="flex-1 min-h-[180px] w-full mt-6">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={barChartData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e4e4e7' : '#1f2937'} />
 <XAxis 
 dataKey="day" 
 tickLine={false} 
 axisLine={false} 
 tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 15 }} 
 />
 <YAxis 
 tickLine={false} 
 axisLine={false} 
 tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 15 }} 
 unit="€"
 />
 <Tooltip 
 contentStyle={{ 
 backgroundColor: isLight ? '#ffffff' : '#09090b', 
 borderRadius: '16px', 
 color: isLight ? '#18181b' : '#fff', 
 border: isLight ? '1px solid #e4e4e7' : '1px solid #27272a', 
 boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' 
 }}
 labelStyle={{ color: isLight ? '#71717a' : '#a1a1aa', fontWeight: 'bold' }}
 cursor={{ fill: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)' }}
 formatter={(value: any) => [`€${value.toFixed(2)}`]}
 />
 <Legend 
 verticalAlign="bottom" 
 height={36} 
 content={({ payload }) => (
 <div className="flex justify-center gap-6 mt-4 text-xs font-sans">
 {payload?.map((entry: any, index: number) => (
 <div key={`item-${index}`} className="flex items-center gap-2">
 <span 
 className="w-3 h-3 rounded-full" 
 style={{ backgroundColor: entry.color }} 
 />
 <span className={`font-semibold uppercase tracking-wider text-xs ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
 {entry.value === 'actual' ? 'Actual Waste Cost' : 'Budget Allowance'}
 </span>
 </div>
 ))}
 </div>
 )}
 />
 <Bar 
 dataKey="actual" 
 name="actual" 
 fill="#f43f5e" 
 radius={[6, 6, 0, 0]} 
 maxBarSize={28}
 />
 <Bar 
 dataKey="budget" 
 name="budget" 
 fill={isLight ? '#cbd5e1' : '#3f3f46'} 
 radius={[6, 6, 0, 0]} 
 maxBarSize={28}
 />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </Card>

 {/* Active Waste Ledger */}
 <Card isLight={isLight}>
 <div className="pb-4">
 <h2 className={`text-base font-sans font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Daily Spoilage & Scrap Ledger</h2>
 <p className="text-xs text-zinc-500">Documented items removed from active inventory</p>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className={`font-mono text-xs uppercase tracking-wider border-b ${
 isLight ? 'bg-zinc-50 text-zinc-600 border-zinc-200' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
 }`}>
 <tr>
 <th className="py-3 px-4">Waste Item</th>
 <th className="py-3 px-4">Category</th>
 <th className="py-3 px-4 text-center">Weight</th>
 <th className="py-3 px-4 text-center">Incident Classification</th>
 <th className="py-3 px-4 text-right">Lost Value</th>
 </tr>
 </thead>
 <tbody className={`divide-y ${isLight ? 'divide-zinc-200' : 'divide-zinc-805/60'}`}>
 {wasteRecords.map((rec) => (
 <tr key={rec.id} className={`transition-colors ${isLight ? ' hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-50' : 'hover:bg-zinc-950/50'}`}>
 <td className={`py-3 px-4 font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>{rec.item}</td>
 <td className={`py-3 px-4 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{rec.category}</td>
 <td className="py-3 px-4 text-center font-mono font-medium">{rec.weight.toFixed(1)} kg</td>
 <td className="py-3 px-4 text-center">
 <Badge tone={reasonTone(rec.reason)} size="sm" isLight={isLight}>
 {rec.reason}
 </Badge>
 </td>
 <td className="py-3 px-4 text-right font-mono font-bold text-rose-500">-€{rec.cost.toFixed(2)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>

      </div>

      {/* RIGHT ASPECT: LOGGING & AI STRATEGY */}
      <div className="space-y-6 md:h-full md:overflow-y-auto md:pr-1">
        
        {/* Input Form */}
        <Card isLight={isLight}>
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className={`w-5 h-5 ${isLight ? 'text-zinc-700' : 'text-zinc-400'}`} />
            <h2 className={`text-base font-sans font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Log Waste Event</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Select isLight={isLight} label="Item" value={newItem} onChange={e => handleProductChange(e.target.value)}>
                {products.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input isLight={isLight} label="Weight (kg)" type="number" step="0.1" min="0.1" value={weight} onChange={e => handleWeightChange(parseFloat(e.target.value))} required />
              <Input isLight={isLight} label="Value (€)" type="number" step="0.01" value={cost} readOnly className="opacity-80 cursor-not-allowed" />
            </div>

            <div>
              <Select isLight={isLight} label="Reason" value={reason} onChange={e => setReason(e.target.value as any)}>
                <option value="Expired">Expired</option>
                <option value="Overproduced">Overproduced</option>
                <option value="Quality Issue">Quality Issue</option>
                <option value="Spill/Accident">Spill/Accident</option>
              </Select>
            </div>

            <Button type="submit" variant="amber" fullWidth icon={<Plus className="w-4 h-4" />} className="mt-6 btn-interactive">
              Log Waste Record
            </Button>
          </form>
        </Card>

        {/* AI Action Strategy */}
        <Card isLight={isLight}>
          <div className="flex items-center justify-between mb-4">
             <h2 className={`text-base font-sans font-semibold flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI Prevention Strategy
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Select a high-loss category to generate predictive preservation tactics and repurposing hacks.</p>
          
          <div className="space-y-3">
             <Select isLight={isLight} value={helpCat} onChange={e => setHelpCat(e.target.value)}>
                <option value="Seafood">Seafood</option>
                <option value="Produce">Produce</option>
                <option value="Dairy">Dairy</option>
                <option value="Baked Goods">Baked Goods</option>
                <option value="Prepared Foods">Prepared Foods</option>
              </Select>

              <Button
                onClick={handleFetchRepurposeStrategy}
                disabled={strategyLoading}
                variant="secondary"
                size="sm"
                isLight={isLight}
                fullWidth
                className="py-2.5 font-mono tracking-wider"
              >
                {strategyLoading ? 'ANALYZING...' : 'GENERATE ADVICE'}
              </Button>

              {repurposeStrategy && (
                 <div className={`p-4 rounded-xl mt-4 text-xs leading-relaxed border ${isLight ? 'bg-amber-50/50 border-amber-200 text-zinc-800' : 'bg-amber-950/20 border-amber-900/40 text-amber-50'}`}>
                  {repurposeStrategy}
                 </div>
              )}
          </div>
        </Card>

      </div>
    </div>
  );
}
