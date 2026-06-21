import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CoreMetrics, CompanyTarget, DailyOperationalLog } from '../types';
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
  Settings,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
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
  irelandTime?: string;
  weeklyLogs: DailyOperationalLog[];
  onAddOrUpdateLog: (log: DailyOperationalLog) => void;
  selectedWeekRange: string;
  onSelectedWeekRangeChange: (range: string) => void;
}

export default function OverviewTab({ 
  metrics, 
  onNavigateTab, 
  targets, 
  userRole, 
  onUpdateMetrics, 
  irelandTime,
  weeklyLogs,
  onAddOrUpdateLog,
  selectedWeekRange,
  onSelectedWeekRangeChange
}: OverviewTabProps) {
  const [strategicPrompt, setStrategicPrompt] = useState(
    "Synthesize an optimization plan for premium Sushi production to reduce Tazaki and Sysco transport delays by 12% while keeping active kitchen seafood waste indexes below 3% under Dublin humid weather."
  );
  const [advisorResponse, setAdvisorResponse] = useState<string>("");
  const [thinkingProcess, setThinkingProcess] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Daily Selection tabs for viewing the KPI dashboard
  const [selectedDayTab, setSelectedDayTab] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Sun');

  const activeLog = weeklyLogs.find(l => l.day === selectedDayTab) || weeklyLogs[6];
  const totalCogsActiveDay = activeLog.cogs.tazaki + activeLog.cogs.sysco + activeLog.cogs.bulza + activeLog.cogs.sticker + activeLog.cogs.others;

  // Total Weekly COGS
  const totalCogsWeek = weeklyLogs.reduce((acc, log) => {
    return acc + log.cogs.tazaki + log.cogs.sysco + log.cogs.bulza + log.cogs.sticker + log.cogs.others;
  }, 0);

  // States for Daily Operational and Supplier COG Ledger Inputs
  const [entryDay, setEntryDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Sun');
  const [entryDate, setEntryDate] = useState('2026-06-21');
  const [entrySales, setEntrySales] = useState('14820');
  const [entryWaste, setEntryWaste] = useState('412.50');
  const [entryHours, setEntryHours] = useState('124');
  const [entryProdTarget, setEntryProdTarget] = useState('11500');
  const [entryProdMade, setEntryProdMade] = useState('11240');
  const [entryTazaki, setEntryTazaki] = useState('4890');
  const [entrySysco, setEntrySysco] = useState('1100');
  const [entryBulza, setEntryBulza] = useState('820');
  const [entrySticker, setEntrySticker] = useState('240');
  const [entryOthers, setEntryOthers] = useState('380');
  const [entrySupplierName, setEntrySupplierName] = useState<'Tazaki' | 'Sysco' | 'Bulza' | 'Sticker' | 'Others'>('Others');

  useEffect(() => {
    const existing = weeklyLogs.find(l => l.day === entryDay);
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
      setEntrySupplierName(existing.supplierName || 'Others');
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
        others: parseFloat(entryOthers) || 0
      }
    };
    onAddOrUpdateLog(updatedRecord);
  };

  // Recharts Chart Data (correlated metrics across hours/days)
  const [chartView, setChartView] = useState<'weekly' | 'hourly'>('weekly');

  const hourlyData = [
    { name: '08:00', Sales: 1200, Production: 450, Waste: 40, Hours: 12, COGS: 390 },
    { name: '10:00', Sales: 3400, Production: 1200, Waste: 65, Hours: 24, COGS: 1100 },
    { name: '12:00', Sales: 6800, Production: 2100, Waste: 120, Hours: 32, COGS: 2200 },
    { name: '14:00', Sales: 8900, Production: 1800, Waste: 95, Hours: 32, COGS: 2900 },
    { name: '16:00', Sales: 10400, Production: 2300, Waste: 50, Hours: 28, COGS: 3400 },
    { name: '18:00', Sales: 12900, Production: 1950, Waste: 35, Hours: 20, COGS: 4200 },
    { name: '20:00', Sales: 14820, Production: 1445, Waste: 12, Hours: 14, COGS: 4890 },
  ];

  const weeklyData = weeklyLogs.map(log => ({
    name: log.day,
    Sales: log.sales,
    Production: log.productionMade,
    Waste: log.waste,
    Hours: log.hours,
    COGS: log.cogs.tazaki + log.cogs.sysco + log.cogs.bulza + log.cogs.sticker + log.cogs.others
  }));

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

  const salesHistory = weeklyLogs.map(log => ({
    day: log.day,
    sales: log.sales,
    predictedSales: Math.round(log.sales * 1.02)
  }));

  const productionHistory = weeklyLogs.map(log => ({
    day: log.day,
    production: log.productionMade,
    predictedProduction: Math.round(log.productionMade * 1.02)
  }));

  const wasteHistory = weeklyLogs.map(log => ({
    day: log.day,
    waste: log.waste,
    predictedWaste: Math.round(log.waste * 0.98)
  }));

  const hoursHistory = weeklyLogs.map(log => ({
    day: log.day,
    hours: log.hours,
    predictedHours: Math.round(log.hours * 0.99)
  }));

  return (
    <div id="overview-viewport" className="space-y-6">
      {/* Header Banner with Premium ambient bento design */}
      <div className="bg-zinc-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md border border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full filter blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700/60 text-orange-400 text-xs font-mono">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Sushi Intelligence Portal Active
            </div>
            {irelandTime && (
              <span className="text-xs bg-zinc-950 px-3.5 py-1 text-zinc-400 font-mono tracking-tight font-semibold border border-zinc-855 rounded-full inline-flex items-center gap-1.5 font-mono">
                Dublin Clock (IE): {irelandTime}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold tracking-tight text-white mb-2">
            Sushi Ops Strategy Center
          </h1>
          <p className="text-zinc-350 text-sm leading-relaxed text-zinc-300">
            Premium Sushi Production Company is currently executing at <span className="text-orange-400 font-semibold">{metrics.aiHealthScore}% efficiency</span>. Cooking objectives are on target, and waste reports show an improvement of <span className="text-emerald-400 font-semibold">18.2% vs last Friday</span>.
          </p>
        </div>

        {/* Date-Range Selector Box */}
        <div className="relative z-10 bg-zinc-950/60 backdrop-blur-md p-5 rounded-2xl border border-zinc-800 w-full lg:w-72 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            <span>Audit Calendar Week</span>
          </div>
          <p className="text-[10px] text-zinc-500">Filter general dashboard throughput, COGS, waste stats, and bar charts</p>
          <select
            value={selectedWeekRange}
            onChange={(e) => onSelectedWeekRangeChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-orange-400 hover:text-orange-350 focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2.5 text-xs font-mono font-bold tracking-tight mt-1 transition-all cursor-pointer shadow-inner hover:border-zinc-700 focus:outline-none"
          >
            <option value="2026-06-15 to 2026-06-21" className="bg-zinc-950 font-mono text-xs">
              Week 25 (Jun 15 - Jun 21, 2026) [Active]
            </option>
            <option value="2026-06-22 to 2026-06-28" className="bg-zinc-950 font-mono text-xs">
              Week 26 (Jun 22 - Jun 28, 2026) [Future]
            </option>
            <option value="2026-06-08 to 2026-06-14" className="bg-zinc-950 font-mono text-xs">
              Week 24 (Jun 08 - Jun 14, 2026) [Historical]
            </option>
          </select>
          <div className="flex items-center justify-between text-[9px] text-zinc-450 font-mono mt-1 pt-2 border-t border-zinc-900">
            <span className="text-zinc-500">Selected Date Range:</span>
            <span className="text-orange-400 font-bold">{selectedWeekRange}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Main Content Container with Smooth Fade-In on Week Selection Change */}
      <motion.div
        key={selectedWeekRange}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* Weekday Quick Select Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950 p-4 rounded-3xl border border-zinc-900">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-400 font-bold" />
          <span className="text-xs font-mono text-zinc-350 uppercase tracking-wider font-bold">
            Display Mode: {activeLog.date} ({activeLog.day}) Audit
          </span>
        </div>
        <div className="flex items-center bg-zinc-900 p-1 rounded-2xl border border-zinc-850 shadow-inner">
          {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day) => {
            const isActive = selectedDayTab === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDayTab(day)}
                type="button"
                className={`px-3.5 py-1.5 text-xs rounded-xl font-mono font-bold transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
        {/* Card 1: Sell Today */}
        <div 
          onClick={() => onNavigateTab('Sell')}
          className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 hover:border-orange-500/40 transition-all shadow-sm cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest font-bold">Gross Revenue</p>
                <h3 className="text-2xl font-sans font-black text-white mt-1.5">
                  €{activeLog.sales.toLocaleString()}
                </h3>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-semibold mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8.5% daily avg
                </span>
              </div>
              <div className="p-2.5 bg-zinc-950 border border-zinc-850 text-orange-550 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>
          {/* Sparkline for Sales trend (last 7 days) */}
          <div className="h-8 mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesHistory} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id="sparklineSales1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={1.5} fillOpacity={1} fill="url(#sparklineSales1)" dot={false} isAnimationActive={true} />
                <Line type="monotone" dataKey="predictedSales" stroke="#fdbf5c" strokeWidth={1.2} strokeDasharray="3 3" dot={false} isAnimationActive={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </div>

        {/* Card 2: Production */}
        <div 
          onClick={() => onNavigateTab('Production')}
          className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 hover:border-emerald-500/40 transition-all shadow-sm cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest font-bold">Throughput</p>
                <h3 className="text-2xl font-sans font-black text-white mt-1.5">
                  {activeLog.productionMade.toLocaleString()} <span className="text-[10px] text-zinc-500 font-normal">pcs</span>
                </h3>
                <span className="inline-flex items-center gap-1 text-zinc-400 text-[10px] font-semibold mt-1">
                  Target: {activeLog.productionTarget.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-zinc-950 border border-zinc-850 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 rounded-xl">
                <Package className="w-4 h-4" />
              </div>
            </div>
          </div>
          {/* Sparkline for Production trend (last 7 days) */}
          <div className="h-8 mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionHistory} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id="sparklineProduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="production" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#sparklineProduction)" dot={false} isAnimationActive={true} />
                <Line type="monotone" dataKey="predictedProduction" stroke="#34d399" strokeWidth={1.2} strokeDasharray="3 3" dot={false} isAnimationActive={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </div>

        {/* Card 3: Waste Cost */}
        <div 
          onClick={() => onNavigateTab('Waste')}
          className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 hover:border-rose-500/40 transition-all shadow-sm cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest font-bold">Seafood Waste</p>
                <h3 className="text-2xl font-sans font-black text-white mt-1.5">
                  €{activeLog.waste.toFixed(2)}
                </h3>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-semibold mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Within limit
                </span>
              </div>
              <div className="p-2.5 bg-zinc-950 border border-zinc-850 text-rose-455 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 rounded-xl">
                <Trash2 className="w-4 h-4" />
              </div>
            </div>
          </div>
          {/* Sparkline for Waste trend (last 7 days) */}
          <div className="h-8 mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wasteHistory} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id="sparklineWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="waste" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={1} fill="url(#sparklineWaste)" dot={false} isAnimationActive={true} />
                <Line type="monotone" dataKey="predictedWaste" stroke="#fb7185" strokeWidth={1.2} strokeDasharray="3 3" dot={false} isAnimationActive={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </div>

        {/* Card 4: Hours */}
        <div 
          onClick={() => onNavigateTab('Hours')}
          className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 hover:border-amber-500/40 transition-all shadow-md cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest font-bold">Worked Hours</p>
                <h3 className="text-2xl font-sans font-black text-white mt-1.5">
                  {activeLog.hours} hrs
                </h3>
                <span className="inline-flex items-center gap-1 text-zinc-400 text-[10px] font-semibold mt-1">
                  Staffing Optimal
                </span>
              </div>
              <div className="p-2.5 bg-zinc-950 border border-zinc-850 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>
          {/* Sparkline for Hours trend (last 7 days) */}
          <div className="h-8 mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hoursHistory} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id="sparklineHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="hours" stroke="#fbbf24" strokeWidth={1.5} fillOpacity={1} fill="url(#sparklineHours)" dot={false} isAnimationActive={true} />
                <Line type="monotone" dataKey="predictedHours" stroke="#fde047" strokeWidth={1.2} strokeDasharray="3 3" dot={false} isAnimationActive={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </div>

        {/* Card 5: COGS & Supplier breakdowns */}
        <div 
          className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 hover:border-purple-500/40 transition-all shadow-md group relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest font-bold">Total COGS (GOC)</p>
                <h3 className="text-2xl font-sans font-black text-purple-400 mt-1.5">
                  €{totalCogsActiveDay.toLocaleString()}
                </h3>
                <span className="inline-flex mt-1 text-zinc-505 text-zinc-550 text-[9px] font-mono">
                  Weekly: €{totalCogsWeek.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-zinc-950 border border-zinc-850 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 rounded-xl">
                <Settings className="w-4 h-4" />
              </div>
            </div>

            {/* Supplier Breakdowns */}
            <div className="mt-4 space-y-2 text-[9px] font-sans">
              <div>
                <div className="flex justify-between text-zinc-400 font-mono">
                  <span>Tazaki (Sushi Ingredients)</span>
                  <span className="font-semibold text-zinc-200">€{activeLog.cogs.tazaki.toLocaleString()}</span>
                </div>
                <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden mt-0.5">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min((activeLog.cogs.tazaki / totalCogsActiveDay) * 100 || 0, 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 font-mono">
                  <span>Sysco (General Food)</span>
                  <span className="font-semibold text-zinc-200">€{activeLog.cogs.sysco.toLocaleString()}</span>
                </div>
                <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden mt-0.5">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min((activeLog.cogs.sysco / totalCogsActiveDay) * 100 || 0, 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 font-mono">
                  <span>Bulza (Display Box)</span>
                  <span className="font-semibold text-zinc-200">€{activeLog.cogs.bulza.toLocaleString()}</span>
                </div>
                <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden mt-0.5">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min((activeLog.cogs.bulza / totalCogsActiveDay) * 100 || 0, 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 font-mono">
                  <span>Sticker (Thermal Label)</span>
                  <span className="font-semibold text-zinc-200">€{activeLog.cogs.sticker.toLocaleString()}</span>
                </div>
                <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden mt-0.5">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min((activeLog.cogs.sticker / totalCogsActiveDay) * 100 || 0, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </div>
      </div>

      {/* Main Stats Charts & Active Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Interactive Production & Revenue Chart */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-sans font-bold text-white">Performance Index</h3>
                <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                  {chartView === 'weekly' ? 'Week Overview' : 'Today Overview'}
                </span>
              </div>
              <p className="subtitle text-xs text-zinc-500 uppercase font-semibold">
                {chartView === 'weekly' ? '7-Day operational flow analysis' : 'Correlated hourly view of cumulative metrics'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setChartView('weekly')}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-lg font-mono font-bold transition-all ${
                    chartView === 'weekly'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Weekly View
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('hourly')}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-lg font-mono font-bold transition-all ${
                    chartView === 'hourly'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Hourly View
                </button>
              </div>

              <div className="flex gap-3 font-mono text-[11px]">
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded-sm" />
                  <span className="text-zinc-400 font-semibold">Sales</span>
                </div>
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                  <span className="text-zinc-400 font-semibold">Production</span>
                </div>
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 bg-purple-500 rounded-sm" />
                  <span className="text-zinc-400 font-semibold">COGS</span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartView === 'weekly' ? weeklyData : hourlyData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorCogs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderRadius: '16px', color: '#fff', border: '1px solid #27272a', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Area type="monotone" dataKey="Sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Production" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProd)" />
                <Area type="monotone" dataKey="COGS" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorCogs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgent Core Targets Summary */}
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div>
              <h3 className="text-lg font-sans font-bold text-white">Today's Key Milestones</h3>
              <p className="text-xs text-zinc-500">Urgent target progress metrics</p>
            </div>
            <button 
              onClick={() => onNavigateTab('Target')}
              className="text-xs text-orange-400 hover:text-orange-355 font-bold inline-flex items-center gap-0.5 hover:underline"
            >
              Manage
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-72 pr-1 mt-4">
            {targets.slice(0, 4).map((target) => {
              const pct = Math.min((target.currentValue / target.targetValue) * 100, 100);
              const isHours = target.category === 'Hours';
              // Check completion
              const isComplete = target.currentValue >= target.targetValue;
              return (
                <div key={target.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-2xl">
                  <div className="flex justify-between text-xs mb-1.5 font-sans">
                    <span className="text-zinc-300 font-semibold">{target.name}</span>
                    <span className="font-mono text-zinc-500">{target.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                    <span>
                      {target.currentValue.toLocaleString()} {isHours ? 'hrs' : 'pcs'} ({Math.round(pct)}%)
                    </span>
                    <span>Goal: {target.targetValue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete ? 'bg-emerald-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Operational Logs & Suppliers Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden relative font-sans">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-805">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-2xl text-orange-400">
              <Activity className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <h3 className="text-lg font-sans font-bold text-white">
                Weekly Operational Audit & Suppliers Log
              </h3>
              <p className="text-xs text-zinc-500">Overview of the 7-day operational loop, baseline performance metrics, and primary registered suppliers</p>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300 border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Calendar Date</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right">Seafood Waste</th>
                <th className="py-3 px-4 text-right">Hours</th>
                <th className="py-3 px-4 text-right">Throughput</th>
                <th className="py-3 px-4 text-right">Total COGS</th>
                <th className="py-3 px-4">Primary Supplier Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {weeklyLogs.map((log) => {
                const totalCogs = log.cogs.tazaki + log.cogs.sysco + log.cogs.bulza + log.cogs.sticker + log.cogs.others;
                const isSelected = selectedDayTab === log.day;
                return (
                  <tr 
                    key={log.day}
                    className={`hover:bg-zinc-850/50 transition-colors group ${
                      isSelected ? 'bg-orange-500/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-zinc-250">
                      <button
                        type="button"
                        onClick={() => setSelectedDayTab(log.day)}
                        className={`font-mono text-xs px-2 py-1 rounded-lg transition-all ${
                          isSelected ? 'bg-orange-500 text-white' : 'hover:bg-zinc-800 text-orange-400'
                        }`}
                      >
                        {log.day}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">{log.date}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">€{log.sales.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-rose-400">€{log.waste.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-amber-400">{log.hours} <span className="text-[10px] text-zinc-500 font-normal">h</span></td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className="text-white font-semibold">{log.productionMade.toLocaleString()}</span>
                      <span className="text-zinc-500 text-[10px]"> / {log.productionTarget.toLocaleString()}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-purple-400 font-semibold">€{totalCogs.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={log.supplierName || 'Others'}
                        onChange={(e) => {
                          const val = e.target.value as 'Tazaki' | 'Sysco' | 'Bulza' | 'Sticker' | 'Others';
                          onAddOrUpdateLog({
                            ...log,
                            supplierName: val
                          });
                        }}
                        className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 hover:border-zinc-700 text-xs font-medium cursor-pointer transition-colors"
                      >
                        <option value="Tazaki">Tazaki</option>
                        <option value="Sysco">Sysco</option>
                        <option value="Bulza">Bulza</option>
                        <option value="Sticker">Sticker</option>
                        <option value="Others">Others</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Production Made vs Target Bar Chart */}
      <div id="weekly-production-comparison" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden relative font-sans">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-emerald-400">
              <Package className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <h3 className="text-lg font-sans font-bold text-white flex items-center gap-2">
                Weekly Production Benchmarks (Made vs Target)
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono uppercase tracking-widest font-bold">
                  Weekly Output Analysis
                </span>
              </h3>
              <p className="subtitle text-xs text-zinc-500">Live dual-axis visual comparison of daily production targets against actual rolled batches</p>
            </div>
          </div>
          
          <div className="flex gap-4 font-mono text-[11px] items-center">
            <div className="flex items-center gap-1.5 font-sans">
              <span className="w-2.5 h-2.5 bg-zinc-650 rounded-sm" style={{ backgroundColor: '#4b5563' }} />
              <span className="text-zinc-400 font-semibold">Production Target</span>
            </div>
            <div className="flex items-center gap-1.5 font-sans">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
              <span className="text-zinc-400 font-semibold">Production Made</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyLogs}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 11 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 11 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  borderRadius: '16px', 
                  color: '#fff', 
                  border: '1px solid #27272a', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
                }}
                labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                content={({ payload }) => (
                  <div className="flex justify-center gap-6 mt-4 text-[11px] font-sans">
                    {payload?.map((entry: any, index: number) => (
                      <div key={`item-${index}`} className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-sm" 
                          style={{ backgroundColor: entry.color }} 
                        />
                        <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                          {entry.value === 'productionTarget' ? 'Production Target' : 'Production Made'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
              <Bar 
                dataKey="productionTarget" 
                name="productionTarget" 
                fill="#4b5563" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={45}
              />
              <Bar 
                dataKey="productionMade" 
                name="productionMade" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Sushi Ops & COGS Ledger Entry Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden relative font-sans">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-orange-400">
              <Calendar className="w-5 h-5 flex-shrink-0" />
            </div>
            <div className="z-10">
              <h3 className="text-lg font-sans font-bold text-white flex items-center gap-2">
                Operational Ledger & COGS Input
                <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[9px] font-mono uppercase tracking-widest font-bold animate-pulse">
                  Ledger Direct Writer
                </span>
              </h3>
              <p className="subtitle text-xs text-zinc-500">Record sales, waste, hours, targets, and supplier cost breakdown for any date</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveOperationalLog} className="mt-5 space-y-6 z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-905">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Target Day of Week</label>
              <select
                value={entryDay}
                onChange={(e) => setEntryDay(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
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
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Calendar Date</label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Primary Registered Supplier</label>
              <select
                value={entrySupplierName}
                onChange={(e) => setEntrySupplierName(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
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
              <h4 className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-bold flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                Operational & Yield Inputs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Gross Revenue (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entrySales}
                    onChange={(e) => setEntrySales(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Sushi Waste Cost (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entryWaste}
                    onChange={(e) => setEntryWaste(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Staff Rostered (hrs)</label>
                  <input
                    type="number"
                    required
                    value={entryHours}
                    onChange={(e) => setEntryHours(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Production Target (pcs)</label>
                  <input
                    type="number"
                    required
                    value={entryProdTarget}
                    onChange={(e) => setEntryProdTarget(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Production Made (pcs)</label>
                  <input
                    type="number"
                    required
                    value={entryProdMade}
                    onChange={(e) => setEntryProdMade(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Column B: Supplier COGS breakdown */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-bold flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
                <Settings className="w-3.5 h-3.5 text-emerald-400" />
                Supplier COGS Breakdown (GOC)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Tazaki Supplier (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entryTazaki}
                    onChange={(e) => setEntryTazaki(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Sysco Supplier (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entrySysco}
                    onChange={(e) => setEntrySysco(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Bulza Supplier (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entryBulza}
                    onChange={(e) => setEntryBulza(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Sticker Supplier (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entrySticker}
                    onChange={(e) => setEntrySticker(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-1.5">Others / Etc. (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entryOthers}
                    onChange={(e) => setEntryOthers(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <button
              type="submit"
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/15 border border-orange-500/20 hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              Commit Active Operational Records
            </button>
          </div>
        </form>
      </div>

      {/* Deep Advisor: "Enable high thinking" with gemini-3.1-pro-preview */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-sm font-sans">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-orange-400 shadow-md">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-sans font-extrabold text-white flex items-center gap-2 flex-wrap">
                Deep Strategic Advisor
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[10px] font-mono select-none">
                  gemini-3.1-pro-preview
                </span>
                <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[10px] font-mono select-none animate-pulse">
                  Thinking Level: HIGH
                </span>
              </h2>
              <p className="text-xs text-zinc-500">Provide complex operational complications for multi-faceted reasoning solutions</p>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono sm:text-right">Uses deep thinking tree solver</span>
        </div>

        <div className="space-y-4 mt-4">
          <textarea
            value={strategicPrompt}
            onChange={(e) => setStrategicPrompt(e.target.value)}
            className="w-full h-24 p-3 border border-zinc-800 bg-zinc-900 text-sm text-zinc-100 shadow-inner focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-sans rounded-2xl"
            placeholder="Introduce multi-layered logistic, resource, target, or supply complications..."
          />

          <div className="flex justify-end items-center">
            <button
              onClick={handleAskAdvisor}
              disabled={loading}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 disabled:bg-zinc-950 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-2 shadow-md hover:scale-[1.01]"
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
            <div className="bg-orange-950/25 border border-orange-900/60 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-bold block">
                🧠 Thinking Process Summary (Reasoning Path):
              </span>
              <p className="text-xs text-orange-200 font-mono leading-relaxed whitespace-pre-wrap">
                {thinkingProcess}
              </p>
            </div>
          )}

          {advisorResponse && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-inner space-y-3">
              <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                <Lightbulb className="w-4 h-4 text-emerald-450" />
                <span className="text-xs text-white font-bold uppercase tracking-wide">Formulated Corporate Strategy:</span>
              </div>
              <div className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                {advisorResponse}
              </div>
            </div>
          )}
        </div>
      </div>
      </motion.div>
    </div>
  );
}
