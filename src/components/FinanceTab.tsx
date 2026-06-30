import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { DollarSign, Target, Activity, Calendar, Layers, Save } from 'lucide-react';
import { DailyOperationalLog } from '../types';

interface FinanceTabProps {
  theme?: 'light' | 'dark';
  metallicTheme?: 'gold' | 'silver' | 'copper';
  weeklyLogs: DailyOperationalLog[];
  onAddOrUpdateLog: (log: DailyOperationalLog) => void;
}

export default function FinanceTab({ theme = 'dark', metallicTheme = 'gold', weeklyLogs, onAddOrUpdateLog }: FinanceTabProps) {
  const isLight = theme === 'light';

  // States for Daily Operational and Supplier COG Ledger Inputs
  const [entryDay, setEntryDay] = useState<
    "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
  >("Sun");
  const [entryDate, setEntryDate] = useState("2026-06-21");
  const [entrySales, setEntrySales] = useState("14820");
  const [entryWaste, setEntryWaste] = useState("412.50");
  const [entryHours, setEntryHours] = useState("124");
  const [entryProdTarget, setEntryProdTarget] = useState("11500");
  const [entryProdMade, setEntryProdMade] = useState("11240");
  const [entryTazaki, setEntryTazaki] = useState("4890");
  const [entrySysco, setEntrySysco] = useState("1100");
  const [entryBulza, setEntryBulza] = useState("820");
  const [entrySticker, setEntrySticker] = useState("240");
  const [entryOthers, setEntryOthers] = useState("380");
  const [entrySupplierName, setEntrySupplierName] = useState<
    "Tazaki" | "Sysco" | "Bulza" | "Sticker" | "Others"
  >("Others");

  useEffect(() => {
    const existing = weeklyLogs.find((l) => l.day === entryDay);
    if (existing) {
      setEntryDate(existing.date);
      setEntrySales(existing.sales.toString());
      setEntryWaste(existing.waste.toString());
      setEntryHours(existing.hours.toString());
      setEntryProdTarget(existing.productionTarget.toString());
      setEntryProdMade(existing.productionMade.toString());
      setEntryTazaki(existing.cogs.tazaki.toString());
      setEntrySysco(existing.cogs.sysco.toString());
      setEntryBulza(existing.cogs.bulza.toString());
      setEntrySticker(existing.cogs.sticker.toString());
      setEntryOthers(existing.cogs.others.toString());
      setEntrySupplierName(existing.supplierName || "Others");
    }
  }, [entryDay, weeklyLogs]);

  const handleSaveOperationalLog = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRecord: DailyOperationalLog = {
      day: entryDay,
      date: entryDate,
      sales: parseFloat(entrySales) || 0,
      waste: parseFloat(entryWaste) || 0,
      hours: parseFloat(entryHours) || 0,
      productionTarget: parseInt(entryProdTarget, 10) || 0,
      productionMade: parseInt(entryProdMade, 10) || 0,
      supplierName: entrySupplierName,
      cogs: {
        tazaki: parseFloat(entryTazaki) || 0,
        sysco: parseFloat(entrySysco) || 0,
        bulza: parseFloat(entryBulza) || 0,
        sticker: parseFloat(entrySticker) || 0,
        others: parseFloat(entryOthers) || 0,
      },
    };
    onAddOrUpdateLog(updatedRecord);
  };


  
  const [mode, setMode] = useState<'plan' | 'use'>('plan');

  // Plan data as requested by user
  const planData = [
    { name: 'Staff', value: 20, color: '#3b82f6' },
    { name: 'COG', value: 30, color: '#f59e0b' },
    { name: 'Composition', value: 30, color: '#8b5cf6' },
    { name: 'Profits', value: 20, color: '#10b981' }
  ];

  // Actual 'use' data (mocked slightly off plan for realism and AI analysis)
  const useData = [
    { name: 'Staff', value: 24, color: '#3b82f6' },
    { name: 'COG', value: 32, color: '#f59e0b' },
    { name: 'Composition', value: 29, color: '#8b5cf6' },
    { name: 'Profits', value: 15, color: '#10b981' }
  ];

  const currentData = mode === 'plan' ? planData : useData;

  const comparisonData = planData.map(p => ({
    name: p.name,
    Plan: p.value,
    Use: useData.find(u => u.name === p.name)?.value || 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between transition-all gap-4">
        <div>
          <h1 className={`text-2xl font-bold font-sans tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'} flex items-center gap-2`}>
            <DollarSign className={`${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} size={28} />
            Financial Composition
          </h1>
          <p className={`text-sm mt-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Analyze business cost structure and profit margins.
          </p>
        </div>

        {/* View Toggle */}
        <div className={`flex p-1 rounded-xl shadow-sm ${isLight ? 'bg-zinc-200/50' : 'bg-black/50'} w-full md:w-auto`}>
          <button
            onClick={() => setMode('plan')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
              mode === 'plan'
                ? isLight 
                  ? 'bg-white text-zinc-900 shadow-sm' 
                  : 'bg-zinc-800 text-white shadow-md shadow-black/50'
                : isLight
                  ? 'text-zinc-500 hover:text-zinc-700 hover:bg-white/50'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            <Target size={16} className={mode === 'plan' ? 'text-emerald-500' : ''} />
            Plan Structure
          </button>
          <button
            onClick={() => setMode('use')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
              mode === 'use'
                ? isLight 
                  ? 'bg-white text-zinc-900 shadow-sm' 
                  : 'bg-zinc-800 text-white shadow-md shadow-black/50'
                : isLight
                  ? 'text-zinc-500 hover:text-zinc-700 hover:bg-white/50'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            <Activity size={16} className={mode === 'use' ? 'text-orange-500' : ''} />
            Actual Use
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="space-y-4">
          {currentData.map(item => (
            <div key={item.name} className={`p-5 rounded-2xl border transition-all ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
               <div className="flex justify-between items-center mb-2">
                 <h3 className={`text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{item.name}</h3>
                 <span className="text-2xl font-mono font-black" style={{ color: item.color }}>{item.value}%</span>
               </div>
               <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-zinc-100' : 'bg-black'}`}>
                 <div className="h-full rounded-full transition-all duration-500" style={{ width: `\${item.value}%`, backgroundColor: item.color }} />
               </div>
            </div>
          ))}
        </div>

        {/* Charts Container */}
        <div className="md:col-span-2 space-y-6 flex flex-col">
          {/* Pie Chart */}
          <div className={`flex-1 p-6 rounded-2xl border transition-all min-h-[300px] ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
            <h3 className={`text-sm font-bold font-sans tracking-tight mb-4 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              Composition ({mode === 'plan' ? 'Target Plan' : 'Actual Use'})
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `\${name} \${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`finance-cell-${index}-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isLight ? '#ffffff' : '#18181b', 
                    borderColor: isLight ? '#e4e4e7' : '#27272a',
                    color: isLight ? '#18181b' : '#f4f4f5',
                    borderRadius: '12px',
                    fontWeight: 600
                  }}
                  itemStyle={{ color: isLight ? '#18181b' : '#f4f4f5' }}
                  formatter={(value: number) => [`\${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Variance Bar Chart */}
          <div className={`p-6 rounded-2xl border transition-all h-[250px] ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
            <h3 className={`text-sm font-bold font-sans tracking-tight mb-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              Plan vs Use Variance
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e4e4e7' : '#3f3f46'} />
                <XAxis dataKey="name" stroke={isLight ? '#71717a' : '#a1a1aa'} fontSize={12} tickLine={false} axisLine={false} dy={5} />
                <YAxis stroke={isLight ? '#71717a' : '#a1a1aa'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `\${v}%`} />
                <Tooltip 
                  cursor={{ fill: isLight ? '#f4f4f5' : '#27272a' }}
                  contentStyle={{ 
                    backgroundColor: isLight ? '#ffffff' : '#18181b', 
                    borderColor: isLight ? '#e4e4e7' : '#27272a',
                    borderRadius: '12px',
                  }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ bottom: 0, fontSize: 12 }} />
                <Bar dataKey="Plan" fill="#a1a1aa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Use" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    
          {/* Daily Sushi Ops & COGS Ledger Entry Form */}
          <div
            className={`${metallicTheme}-liner-box p-6 overflow-hidden relative font-sans transition-all duration-300 ${isLight ? "bg-amber-50/20" : "bg-zinc-950/80"}`}
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
                isLight ? "border-zinc-200" : "border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 border rounded-2xl transition-all duration-300 ${
                    isLight
                      ? "bg-zinc-100 border-zinc-200 text-orange-600"
                      : "bg-zinc-950 border-zinc-800 text-orange-400"
                  }`}
                >
                  <Calendar className="w-5 h-5 flex-shrink-0" />
                </div>
                <div className="z-10">
                  <h3
                    className={`text-lg font-sans font-bold flex items-center gap-2 ${isLight ? "text-zinc-900" : "text-3d-gold drop-shadow-md"}`}
                  >
                    Operational Ledger & COGS Input
                    <span
                      className={`px-2 py-0.5 rounded border text-[9px] font-mono uppercase tracking-widest font-bold ${
                        isLight
                          ? "bg-orange-50 border-orange-200 text-orange-700 font-bold"
                          : "bg-orange-500/10 border-orange-500/30 text-orange-400"
                      }`}
                    >
                      Ledger Direct Writer
                    </span>
                  </h3>
                  <p className="subtitle text-xs text-zinc-500">
                    Record sales, waste, hours, targets, and supplier cost
                    breakdown for any date
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSaveOperationalLog}
              className="mt-5 space-y-6 z-10 relative"
            >
              <div
                className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                  isLight
                    ? "bg-zinc-50 border-zinc-200"
                    : "bg-zinc-950 border-zinc-905"
                }`}
              >
                <div>
                  <label
                    className={`text-[10px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    Target Day of Week
                  </label>
                  <select
                    value={entryDay}
                    onChange={(e) => setEntryDay(e.target.value as any)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 ${
                      isLight
                        ? "bg-white border-zinc-300 text-zinc-900 font-semibold"
                        : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thu">Thursday</option>
                    <option value="Fri">Friday</option>
                    <option value="Sat">Saturday</option>
                    <option value="Sun">Sunday</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`text-[10px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    Calendar Date
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 ${
                      isLight
                        ? "bg-white border-zinc-300 text-zinc-900 font-semibold"
                        : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`text-[10px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    Primary Registered Supplier
                  </label>
                  <select
                    value={entrySupplierName}
                    onChange={(e) =>
                      setEntrySupplierName(e.target.value as any)
                    }
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 ${
                      isLight
                        ? "bg-white border-zinc-300 text-zinc-900 font-semibold"
                        : "bg-zinc-900 border-zinc-800 text-white"
                    }`}
                  >
                    <option value="Tazaki">Tazaki</option>
                    <option value="Sysco">Sysco</option>
                    <option value="Bulza">Bulza</option>
                    <option value="Sticker">Sticker</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 font-sans">
                {/* Column A: Productivity Metrics */}
                <div className="space-y-4">
                  <h4
                    className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 border-b pb-1.5 ${
                      isLight
                        ? "border-zinc-200 text-zinc-600 text-zinc-600"
                        : "border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-orange-400" />
                    Operational & Yield Inputs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Gross Revenue (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={entrySales}
                        onChange={(e) => setEntrySales(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 ${
                          isLight
                            ? "bg-white border-zinc-300 text-zinc-900"
                            : "bg-zinc-950 border-zinc-800 text-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Sushi Waste Cost (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={entryWaste}
                        onChange={(e) => setEntryWaste(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] ${
                          isLight
                            ? "bg-white border-zinc-300 text-zinc-900"
                            : "bg-zinc-950 border-zinc-800 text-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Staff Rostered (hrs)
                      </label>
                      <input
                        type="number"
                        required
                        value={entryHours}
                        onChange={(e) => setEntryHours(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 ${
                          isLight
                            ? "bg-white border-zinc-300 text-zinc-900"
                            : "bg-zinc-950 border-zinc-800 text-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Production Target (units)
                      </label>
                      <input
                        type="number"
                        required
                        value={entryProdTarget}
                        onChange={(e) => setEntryProdTarget(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] ${
                          isLight
                            ? "bg-white border-zinc-300 text-zinc-900"
                            : "bg-zinc-950 border-zinc-800 text-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Production Made (units)
                      </label>
                      <input
                        type="number"
                        required
                        value={entryProdMade}
                        onChange={(e) => setEntryProdMade(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] ${
                          isLight
                            ? "bg-white border-zinc-300 text-zinc-900"
                            : "bg-zinc-950 border-zinc-800 text-white"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Column B: Supplier COGS breakdown */}
                <div className="space-y-4">
                  <h4
                    className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 border-b pb-1.5 ${
                      isLight
                        ? "border-zinc-200 text-zinc-600 text-zinc-600"
                        : "border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-emerald-400" />
                    Supplier COGS Breakdown (GOC)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Tazaki Supplier (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={entryTazaki}
                        onChange={(e) => setEntryTazaki(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 ${
                          isLight
                            ? "bg-white border-zinc-300 text-zinc-900"
                            : "bg-zinc-950 border-zinc-800 text-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Sysco Supplier (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={entrySysco}
                        onChange={(e) => setEntrySysco(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] ${
                          isLight
                            ? "bg-white border-zinc-300 text-zinc-900"
                            : "bg-zinc-950 border-zinc-800 text-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Bulza Supplier (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={entryBulza}
                        onChange={(e) => setEntryBulza(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] focus:border-yellow-500 ${
                          isLight
                            ? "bg-white border-zinc-300 text-zinc-900"
                            : "bg-zinc-950 border-zinc-800 text-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Sticker Supplier (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={entrySticker}
                        onChange={(e) => setEntrySticker(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] ${
                          isLight
                            ? "bg-white border-zinc-300 text-zinc-900"
                            : "bg-zinc-950 border-zinc-800 text-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Others / Etc. (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={entryOthers}
                        onChange={(e) => setEntryOthers(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all focus:shadow-[0_0_8px_rgba(234,179,8,0.4)] ${
                          isLight
                            ? "bg-white border-zinc-300 text-zinc-900"
                            : "bg-zinc-950 border-zinc-800 text-white"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`flex justify-end pt-4 border-t ${isLight ? "border-zinc-200" : "border-zinc-800"}`}
              >
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/15 border border-orange-500/20 hover:scale-[1.01] active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  Commit Active Operational Records
                </button>
              </div>
            </form>
          </div>

</div>
  );
}
