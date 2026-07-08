import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ComposedChart
} from 'recharts';
import { 
  Zap, 
  Leaf, 
  AlertCircle, 
  TrendingDown,
  Sparkles,
  RefreshCw,
  Flame,
  BatteryCharging
} from 'lucide-react';
import { DailyOperationalLog } from '../types';

interface EnergyTabProps {
  theme?: 'light' | 'dark';
  weeklyLogs?: DailyOperationalLog[];
}

// Mock real-time energy usage data (kWh) vs production volume (units)
const generateEnergyData = () => {
  const data: { time: string; energy: number; volume: number; efficiency: number }[] = [];
  const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'];
  let totalEnergy = 0;
  let totalVolume = 0;
  
  hours.forEach(hour => {
    // Peak hours around 10AM-2PM
    const isPeak = hour === '10AM' || hour === '12PM' || hour === '2PM';
    const volume = isPeak ? Math.floor(Math.random() * 200 + 300) : Math.floor(Math.random() * 100 + 100);
    // Base energy + variable energy based on volume + some inefficiency noise
    const baseEnergy = 10;
    const variableEnergy = volume * 0.05;
    const inefficiency = Math.random() * 5;
    const energy = Number((baseEnergy + variableEnergy + inefficiency).toFixed(1));
    
    totalEnergy += energy;
    totalVolume += volume;
    
    data.push({
      time: hour,
      energy: energy,
      volume: volume,
      efficiency: Number((energy / volume * 1000).toFixed(1)) // Wh per unit
    });
  });
  
  return { data, totalEnergy, totalVolume };
};

export default function EnergyTab({ theme = 'dark', weeklyLogs = [] }: EnergyTabProps) {
  const isLight = theme === 'light';
  const { data: chartData, totalEnergy, totalVolume } = useMemo(() => generateEnergyData(), []);
  
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const avgWhPerUnit = ((totalEnergy * 1000) / totalVolume).toFixed(1);
  const maxEfficiencyAllowed = 65; // Wh per unit benchmark

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/gemini/sustainability-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: chartData,
          totalEnergy,
          totalVolume,
          avgWhPerUnit
        })
      });
      if (!response.ok) throw new Error("Failed");
      const { text } = await response.json();
      setReport(text);
    } catch (e) {
      setReport("Jules was unable to generate the report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      <div className="flex flex-col md:flex-row md:items-end justify-between transition-all gap-4">
        <div>
          <h1 className={`text-2xl font-bold font-sans tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'} flex items-center gap-2`}>
            <Leaf className={isLight ? 'text-emerald-600' : 'text-emerald-400'} size={28} />
            Sustainability & Energy
          </h1>
          <p className={`text-sm mt-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Real-time oven energy consumption vs production throughput footprint.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border transition-all ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isLight ? 'bg-yellow-100 text-yellow-600' : 'bg-yellow-500/10 text-yellow-400'}`}>
              <Zap size={20} />
            </div>
            <h3 className={`text-sm font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Total Energy Today</h3>
          </div>
          <div className="text-3xl font-bold font-mono text-yellow-500">{totalEnergy.toFixed(1)} kWh</div>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-400'}`}>
              <Flame size={20} />
            </div>
            <h3 className={`text-sm font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Production Volume</h3>
          </div>
          <div className={`text-3xl font-bold font-mono ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>{totalVolume}</div>
          <div className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Baked Items</div>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          Number(avgWhPerUnit) > maxEfficiencyAllowed 
            ? isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/20 border-rose-900/50'
            : isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-900/50'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              Number(avgWhPerUnit) > maxEfficiencyAllowed 
                ? isLight ? 'bg-rose-100 text-rose-600' : 'bg-rose-500/10 text-rose-400'
                : isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              <BatteryCharging size={20} />
            </div>
            <h3 className={`text-sm font-semibold ${
              Number(avgWhPerUnit) > maxEfficiencyAllowed 
                ? isLight ? 'text-rose-700' : 'text-rose-300'
                : isLight ? 'text-emerald-700' : 'text-emerald-300'
            }`}>Energy per Unit</h3>
          </div>
          <div className={`text-3xl font-bold font-mono flex items-center gap-2 ${
            Number(avgWhPerUnit) > maxEfficiencyAllowed 
              ? isLight ? 'text-rose-600' : 'text-rose-500'
              : isLight ? 'text-emerald-600' : 'text-emerald-500'
          }`}>
            {avgWhPerUnit} Wh
            {Number(avgWhPerUnit) > maxEfficiencyAllowed && <AlertCircle size={20} className="animate-pulse" />}
          </div>
          <div className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Target: <span className="font-bold">{maxEfficiencyAllowed} Wh</span></div>
        </div>

        <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-center items-start group relative overflow-hidden ${isLight ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-800 border-zinc-700'}`}>
          <div className="absolute -right-4 -top-4 opacity-10">
            <Sparkles size={80} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-300 mb-1 z-10 flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400" />
            Jules AI Audit
          </h3>
          <p className="text-xs text-zinc-400 mb-3 z-10 leading-relaxed">
            Generate an executive-grade ESG compliance and energy optimization blueprint.
          </p>
          <button 
            onClick={generateReport}
            disabled={isGenerating}
            className="w-full py-2 bg-yellow-500 text-zinc-900 text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 z-10 flex items-center justify-center gap-2 btn-interactive"
          >
            {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : "Run Compliance"}
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className={`p-6 rounded-2xl border transition-all ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-900 border-zinc-800'}`}>
        <h2 className={`text-lg font-bold font-sans tracking-tight mb-6 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
          Energy Draw vs Throughput
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e4e4e7' : '#3f3f46'} vertical={false} />
              <XAxis dataKey="time" stroke={isLight ? '#71717a' : '#a1a1aa'} fontSize={15} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke={isLight ? '#71717a' : '#a1a1aa'} fontSize={15} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}kWh`} />
              <YAxis yAxisId="right" orientation="right" stroke={isLight ? '#71717a' : '#a1a1aa'} fontSize={15} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isLight ? '#ffffff' : '#18181b', 
                  borderColor: isLight ? '#e4e4e7' : '#27272a',
                  color: isLight ? '#18181b' : '#f4f4f5',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: isLight ? '#18181b' : '#f4f4f5', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '15px' }} />
              <Bar yAxisId="right" dataKey="volume" name="Production Volume" fill={isLight ? '#e4e4e7' : '#3f3f46'} radius={[4, 4, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="energy" name="Energy Use (kWh)" stroke="#eab308" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: isLight ? '#ffffff' : '#18181b' }} activeDot={{ r: 6, stroke: '#eab308' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Section */}
      {report && (
        <div className={`p-6 rounded-2xl border transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black border-zinc-800'}`}>
          <h3 className={`text-sm font-bold font-sans tracking-wide uppercase flex items-center gap-2 mb-4 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            <Sparkles size={16} className="text-yellow-500" />
            Jules Strategy Output
          </h3>
          <div className={`prose prose-sm max-w-none ${isLight ? 'prose-zinc' : 'prose-invert'} font-sans leading-relaxed whitespace-pre-wrap`}>
            {report}
          </div>
        </div>
      )}
    </div>
  );
}
