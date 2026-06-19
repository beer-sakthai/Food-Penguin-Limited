import React, { useState, useEffect } from 'react';
import { CoreMetrics, CompanyTarget } from '../types';
import {
  TrendingUp,
  Package,
  Trash2,
  Clock,
  Sparkles,
  ChevronRight,
  BrainCircuit,
  Lightbulb,
  CheckCircle2,
  Save,
  Settings
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface OverviewTabProps {
  metrics: CoreMetrics;
  onNavigateTab: (tabId: string) => void;
  targets: CompanyTarget[];
  userRole: 'Admin' | 'Manager' | 'Staff';
  onUpdateMetrics: (newMetrics: Partial<CoreMetrics>) => void;
}

export default function OverviewTab({ metrics, onNavigateTab, targets, userRole, onUpdateMetrics }: OverviewTabProps) {
  const [strategicPrompt, setStrategicPrompt] = useState(
    "Synthesize an optimization plan for Food Penguin to reduce sushi-grade fish shipment costs by 12% while keeping fish-trim waste below 4% and maintaining neta freshness during peak dinner service."
  );
  const [advisorResponse, setAdvisorResponse] = useState<string>("");
  const [thinkingProcess, setThinkingProcess] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Admin Manual Entry State
  const [manualSales, setManualSales] = useState(metrics.salesToday.toString());
  const [manualProduction, setManualProduction] = useState(metrics.productionItems.toString());
  const [manualWaste, setManualWaste] = useState(metrics.wasteCost.toString());
  const [manualHours, setManualHours] = useState(metrics.hoursScheduled.toString());
  const [manualEntryDate, setManualEntryDate] = useState(new Date().toISOString().split('T')[0]);

  // Keep manual values in sync if metrics change externally
  useEffect(() => {
    setManualSales(metrics.salesToday.toString());
    setManualProduction(metrics.productionItems.toString());
    setManualWaste(metrics.wasteCost.toString());
    setManualHours(metrics.hoursScheduled.toString());
  }, [metrics]);

  const handleSaveManualMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMetrics({
      salesToday: parseFloat(manualSales) || 0,
      productionItems: parseInt(manualProduction, 10) || 0,
      wasteCost: parseFloat(manualWaste) || 0,
      hoursScheduled: parseFloat(manualHours) || 0
    });
  };

  // Recharts Chart Data (correlated metrics across hours)
  const hourlyData = [
    { hour: '08:00', Sales: 1200, Production: 450, Waste: 40, Hours: 12 },
    { hour: '10:00', Sales: 3400, Production: 1200, Waste: 65, Hours: 24 },
    { hour: '12:00', Sales: 6800, Production: 2100, Waste: 120, Hours: 32 },
    { hour: '14:00', Sales: 8900, Production: 1800, Waste: 95, Hours: 32 },
    { hour: '16:00', Sales: 10400, Production: 2300, Waste: 50, Hours: 28 },
    { hour: '18:00', Sales: 12900, Production: 1950, Waste: 35, Hours: 20 },
    { hour: '20:00', Sales: 14820, Production: 1440, Waste: 7.5, Hours: 14 },
  ];

  const handleAskAdvisor = async () => {
    if (!strategicPrompt.trim()) return;
    setLoading(true);
    setAdvisorResponse("");
    setThinkingProcess("");
    try {
      const res = await fetch("/api/gemini/strategic-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: strategicPrompt }),
      });
      const data = await res.json();
      if (data.error) {
        setAdvisorResponse(`Error: ${data.error}`);
      } else {
        setAdvisorResponse(data.text);
        if (data.thinking) {
          setThinkingProcess(data.thinking);
        }
      }
    } catch (err: any) {
      setAdvisorResponse(`Connection error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  return (
    <div id="overview-viewport" className="h-full space-y-4 min-h-0 overflow-y-auto scrollbar-hide">
      {/* Header Banner with Premium ambient bento design */}
      <div className="bg-slate-900 rounded-3xl p-5 md:p-6 text-white relative overflow-hidden shadow-md border border-slate-800">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full filter blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full filter blur-2xl" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-orange-400 text-xs font-mono mb-4">
            <Sparkles className="w-3 h-3 animate-pulse" />
            2026 Core Intelligence Active
          </div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight text-white mb-2">
            Welcome Back, Skipper
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Food Penguin Limited is currently executing at <span className="text-orange-400 font-semibold">{metrics.aiHealthScore}% efficiency</span>. Sushi plating goals are on target, and fish-waste reports show an improvement of <span className="text-emerald-400 font-semibold">18.2% vs last Friday</span>.
          </p>
        </div>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sell Today */}
        <div 
          onClick={() => onNavigateTab('Sell')}
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-orange-500/40 transition-all shadow-sm cursor-pointer group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest font-bold">Gross Revenue Today</p>
              <h3 className="text-3xl font-sans font-black text-slate-900 mt-2">
                ${metrics.salesToday.toLocaleString()}
              </h3>
              <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-2">
                <TrendingUp className="w-3 h-3" />
                +{metrics.salesGrowth}% vs yesterday
              </span>
            </div>
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all duration-350">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </div>

        {/* Card 2: Production */}
        <div 
          onClick={() => onNavigateTab('Production')}
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-500/40 transition-all shadow-sm cursor-pointer group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest font-bold">Kitchen Throughput</p>
              <h3 className="text-3xl font-sans font-black text-slate-900 mt-2">
                {metrics.productionItems.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ {metrics.productionTarget.toLocaleString()} pcs</span>
              </h3>
              <div className="w-36 bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all" 
                  style={{ width: `${(metrics.productionItems / metrics.productionTarget) * 100}%` }}
                />
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-350">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </div>

        {/* Card 3: Waste Cost */}
        <div 
          onClick={() => onNavigateTab('Waste')}
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-rose-500/40 transition-all shadow-sm cursor-pointer group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest font-bold">Food Waste Cost</p>
              <h3 className="text-3xl font-sans font-black text-slate-900 mt-2">
                ${metrics.wasteCost.toFixed(2)}
              </h3>
              <span className="inline-flex items-center gap-0.5 text-emerald-600 text-xs font-semibold mt-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                -18.2% from quota threshold
              </span>
            </div>
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-all duration-350">
              <Trash2 className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </div>

        {/* Card 4: Hours - Re-styled as slate-900 high-contrast bento block */}
        <div 
          onClick={() => onNavigateTab('Hours')}
          className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-white hover:border-orange-500/40 transition-all shadow-md cursor-pointer group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest font-bold">Rostered Man-hours</p>
              <h3 className="text-3xl font-sans font-black text-white mt-2">
                {metrics.hoursScheduled} hrs
              </h3>
              <span className="inline-flex items-center gap-1 text-slate-300 text-xs font-semibold mt-2">
                <Clock className="w-3 h-3 text-orange-400" />
                Staffing Optimal
              </span>
            </div>
            <div className="p-3 bg-slate-800 rounded-2xl text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-350">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </div>
      </div>

      {/* Main Stats Charts & Active Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive Production & Revenue Chart (Bento Orange Custom Area) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 gap-2">
            <div>
              <h3 className="text-lg font-sans font-bold text-slate-900">Performance Index</h3>
              <p className="subtitle text-xs text-slate-400 uppercase font-semibold">Correlated hourly view of cumulative metrics</p>
            </div>
            <div className="flex gap-4 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-orange-500 rounded-sm" />
                <span className="text-slate-600 font-semibold">Sales (Actual)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
                <span className="text-slate-600 font-semibold">Items Cooked</span>
              </div>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', color: '#fff', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="Sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Production" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgent Core Targets Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-lg font-sans font-bold text-slate-900">Today's Key Milestones</h3>
              <p className="text-xs text-slate-500">Urgent target progress metrics</p>
            </div>
            <button 
              onClick={() => onNavigateTab('Target')}
              className="text-xs text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-0.5 hover:underline"
            >
              Manage
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide max-h-56 pr-1">
            {targets.slice(0, 4).map((target) => {
              const pct = Math.min((target.currentValue / target.targetValue) * 100, 100);
              const isHours = target.category === 'Hours';
              // Check completion
              const isCompleted = isHours ? target.currentValue <= target.targetValue : target.currentValue >= target.targetValue;
              const displayPct = isHours ? (target.currentValue === 0 ? 100 : 0) : pct;

              return (
                <div key={target.id} className="space-y-1.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{target.name}</span>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                      isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                    }`}>
                      {isCompleted ? 'Achieved' : 'In Progress'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end text-xs">
                    <span className="text-slate-400 font-mono text-[10px]">{target.deadline}</span>
                    <span className="text-slate-700 font-mono font-bold">
                      {target.currentValue}/{target.targetValue} {target.unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-orange-500'
                      }`} 
                      style={{ width: `${isHours ? (isCompleted ? 100 : 50) : pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Manual Override Module */}
      {userRole === 'Admin' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-800 rounded-2xl text-emerald-400">
                <Settings className="w-5 h-5" />
              </div>
              <div className="z-10">
                <h3 className="text-lg font-sans font-bold text-white flex items-center gap-2">
                  Admin System Overrides
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/50 text-rose-400 text-[9px] font-mono uppercase tracking-widest font-bold">
                    Root Access
                  </span>
                </h3>
                <p className="subtitle text-xs text-slate-400">Force override dashboard baseline metrics</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveManualMetrics} className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 z-10 relative">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-widest block mb-1.5">Gross Revenue ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={manualSales}
                onChange={(e) => setManualSales(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-widest block mb-1.5">Items Prod (pcs)</label>
              <input
                type="number"
                required
                value={manualProduction}
                onChange={(e) => setManualProduction(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-widest block mb-1.5">Waste Cost ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={manualWaste}
                onChange={(e) => setManualWaste(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-widest block mb-1.5">Rostered (hrs)</label>
              <input
                type="number"
                required
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" />
                Inject Data
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deep Advisor: "Enable high thinking" with gemini-3.1-pro-preview */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 rounded-2xl text-orange-400 shadow-md">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-sans font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
                Deep Strategic Advisor
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono select-none">
                  gemini-3.1-pro-preview
                </span>
                <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[10px] font-mono select-none animate-pulse">
                  Thinking Level: HIGH
                </span>
              </h2>
              <p className="text-xs text-slate-500">Provide complex operational complications for multi-faceted reasoning solutions</p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono sm:text-right">Uses deep thinking tree solver</span>
        </div>

        <div className="space-y-4 mt-3">
          <textarea
            value={strategicPrompt}
            onChange={(e) => setStrategicPrompt(e.target.value)}
            className="w-full h-20 p-3 border border-slate-200 bg-white rounded-2xl text-sm text-slate-800 shadow-inner focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-sans"
            placeholder="Introduce multi-layered logistic, resource, target, or supply complications..."
          />

          <div className="flex justify-end items-center">
            <button
              onClick={handleAskAdvisor}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-350 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-2 shadow-md hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating High Thinking Report...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-3.5 h-3.5" />
                  Compute Strategic Assessment
                </>
              )}
            </button>
          </div>

          {/* Thinking process & Advice displays */}
          {thinkingProcess && (
            <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-orange-700 font-bold block">
                🧠 Thinking Process Summary (Reasoning Path):
              </span>
              <p className="text-xs text-orange-900 font-mono leading-relaxed whitespace-pre-wrap">
                {thinkingProcess}
              </p>
            </div>
          )}

          {advisorResponse && (
            <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-inner space-y-3">
              <div className="flex items-center gap-1.5 border-b border-orange-100 pb-2">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-slate-900 font-bold uppercase tracking-wide">Formulated Corporate Strategy:</span>
              </div>
              <div className="text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">
                {advisorResponse}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
