import React, { useState } from 'react';
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
import { Sparkles, DollarSign, RefreshCw, Target, Activity } from 'lucide-react';

interface FinanceTabProps {
  theme?: 'light' | 'dark';
}

export default function FinanceTab({ theme = 'dark' }: FinanceTabProps) {
  const isLight = theme === 'light';
  
  const [mode, setMode] = useState<'plan' | 'use'>('plan');
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/gemini/finance-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planData,
          actual: useData
        })
      });
      if (!response.ok) throw new Error("Failed");
      const { text } = await response.json();
      setReport(text);
    } catch (e) {
      setReport("Jules was unable to generate financial insights.");
    } finally {
      setIsGenerating(false);
    }
  };

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

          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-center items-start group relative overflow-hidden ${isLight ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-800 border-zinc-700'}`}>
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-400">
              <Sparkles size={80} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-1 z-10 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              Jules P&L Auditor
            </h3>
            <p className="text-xs text-zinc-400 mb-3 z-10 leading-relaxed">
              Analyze structural variance (Target vs Actual Use) to recover margins.
            </p>
            <button 
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full py-2 bg-emerald-500 text-zinc-900 text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 z-10 flex items-center justify-center gap-2"
            >
              {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : "Run Analysis"}
            </button>
          </div>
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
                    <Cell key={`cell-\${index}`} fill={entry.color} />
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

      {report && (
        <div className={`p-6 rounded-2xl border transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-950 border-emerald-900/40'}`}>
          <h3 className={`text-sm font-bold font-sans tracking-wide uppercase flex items-center gap-2 mb-4 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
            <Sparkles size={16} />
            Jules Structural Insights
          </h3>
          <div className={`prose prose-sm max-w-none ${isLight ? 'prose-emerald text-zinc-700' : 'prose-invert text-zinc-300'} font-sans leading-relaxed whitespace-pre-wrap`}>
            {report}
          </div>
        </div>
      )}
    </div>
  );
}
