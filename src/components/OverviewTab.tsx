import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CoreMetrics, CompanyTarget, DailyOperationalLog, SalesOrder } from '../types';
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
  Legend,
  Cell
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
  orders: SalesOrder[];
  selectedBranch: string;
  theme?: 'dark' | 'light';
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
  onSelectedWeekRangeChange,
  orders,
  selectedBranch,
  theme = 'dark'
}: OverviewTabProps) {
  const isLight = theme === 'light';
  const [strategicPrompt, setStrategicPrompt] = useState(
    "Synthesize an optimization plan for premium Sushi production to reduce Tazaki and Sysco transport delays by 12% while keeping active kitchen seafood waste indexes below 3% under Dublin humid weather."
  );
  const [advisorResponse, setAdvisorResponse] = useState<string>("");
  const [thinkingProcess, setThinkingProcess] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
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
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
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

  // --- MULTI-BRANCH DESIGN CONCEPTS & ANALYTICS ---
  // Store branches defined in the corporate plan:
  // 1. Marks & Spencer - Cork City (Luxury selection, premier gourmet pricing premium, high efficiency)
  // 2. Tesco - Cork City (High volume urban storefront, everyday value items, moderate waste margins)
  // 3. Tesco - Mahon Point (Suburban shopping mall storefront, mixed deals & family options)
  const [branchComparePeriod, setBranchComparePeriod] = useState<'day' | 'week'>('week');
  const [branchCompareMetric, setBranchCompareMetric] = useState<'sales' | 'production' | 'waste' | 'efficiency'>('sales');
  const [vsAverageMode, setVsAverageMode] = useState<boolean>(false);

  const rawBranchList = React.useMemo(() => {
    // Determine aggregate or day-specific benchmark base values from operational logs
    let baseSales = 0;
    let baseProduction = 0;
    let baseWaste = 0;
    let baseHours = 0;

    if (branchComparePeriod === 'day') {
      baseSales = activeLog.sales;
      baseProduction = activeLog.productionMade;
      baseWaste = activeLog.waste;
      baseHours = activeLog.hours;
    } else {
      baseSales = weeklyLogs.reduce((sum, log) => sum + log.sales, 0);
      baseProduction = weeklyLogs.reduce((sum, log) => sum + log.productionMade, 0);
      baseWaste = weeklyLogs.reduce((sum, log) => sum + log.waste, 0);
      baseHours = weeklyLogs.reduce((sum, log) => sum + log.hours, 0);
    }

    // Extract real logged customer orders matching the timeframes and stores!
    const realOrdersForStore = (branchName: string) => {
      const filtered = orders.filter(o => {
        const orderBranch = o.branch || 'Marks & Spencer - Cork City';
        return orderBranch === branchName && (o.status === 'Completed' || o.status === 'Pending');
      });
      return filtered.reduce((sum, o) => sum + o.amount, 0);
    };

    const realOrdersQtyForStore = (branchName: string) => {
      const filtered = orders.filter(o => {
        const orderBranch = o.branch || 'Marks & Spencer - Cork City';
        return orderBranch === branchName && (o.status === 'Completed' || o.status === 'Pending');
      });
      return filtered.reduce((sum, o) => sum + o.quantity, 0);
    };

    // Calculate live overrides from Sell Tab
    const msLiveSales = realOrdersForStore('Marks & Spencer - Cork City');
    const tescoCorkLiveSales = realOrdersForStore('Tesco - Cork City');
    const tescoMahonLiveSales = realOrdersForStore('Tesco - Mahon Point');

    const msLiveQty = realOrdersQtyForStore('Marks & Spencer - Cork City') * 10; // scale representatively to match larger daily output
    const tescoCorkLiveQty = realOrdersQtyForStore('Tesco - Cork City') * 10;
    const tescoMahonLiveQty = realOrdersQtyForStore('Tesco - Mahon Point') * 10;

    // Apply baseline division ratios + add real custom virtual-POS sales
    const runMS_Sales = Math.round(baseSales * 0.42) + msLiveSales;
    const runMS_Prod = Math.round(baseProduction * 0.40) + msLiveQty;
    const runMS_Waste = Math.round(baseWaste * 0.28);
    const runMS_Hours = Math.round(baseHours * 0.35);

    const runTescoCork_Sales = Math.round(baseSales * 0.33) + tescoCorkLiveSales;
    const runTescoCork_Prod = Math.round(baseProduction * 0.35) + tescoCorkLiveQty;
    const runTescoCork_Waste = Math.round(baseWaste * 0.36);
    const runTescoCork_Hours = Math.round(baseHours * 0.35);

    const runTescoMahon_Sales = Math.round(baseSales * 0.25) + tescoMahonLiveSales;
    const runTescoMahon_Prod = Math.round(baseProduction * 0.25) + tescoMahonLiveQty;
    const runTescoMahon_Waste = Math.round(baseWaste * 0.36);
    const runTescoMahon_Hours = Math.round(baseHours * 0.30);

    // Compute efficiency values
    const msLaborProd = Math.round(runMS_Sales / (runMS_Hours || 1));
    const tescoCorkLaborProd = Math.round(runTescoCork_Sales / (runTescoCork_Hours || 1));
    const tescoMahonLaborProd = Math.round(runTescoMahon_Sales / (runTescoMahon_Hours || 1));

    const msWastePct = parseFloat(((runMS_Waste / (runMS_Sales || 1)) * 100).toFixed(1));
    const tescoCorkWastePct = parseFloat(((runTescoCork_Waste / (runTescoCork_Sales || 1)) * 105).toFixed(1)); // slightly different waste multiplier profile
    const tescoMahonWastePct = parseFloat(((runTescoMahon_Waste / (runTescoMahon_Sales || 1)) * 108).toFixed(1));

    // Integrated Operational Efficiency Score (0-100 scale)
    const msEffScore = Math.min(100, Math.round((msLaborProd / 130) * 65 + (100 - msWastePct) * 0.35));
    const tescoCorkEffScore = Math.min(100, Math.round((tescoCorkLaborProd / 130) * 65 + (100 - tescoCorkWastePct) * 0.35));
    const tescoMahonEffScore = Math.min(100, Math.round((tescoMahonLaborProd / 130) * 65 + (100 - tescoMahonWastePct) * 0.35));

    return [
      {
        id: 'm_s_cork',
        name: 'M&S Cork City',
        fullName: 'Marks & Spencer - Cork City',
        type: 'Luxury Gourmet Specialty Store',
        sales: runMS_Sales,
        production: runMS_Prod,
        waste: runMS_Waste,
        hours: runMS_Hours,
        wastePct: msWastePct,
        laborProd: msLaborProd,
        efficiencyScore: msEffScore,
        color: '#f59e0b',
        fill: 'url(#gradMS)'
      },
      {
        id: 'tesco_cork',
        name: 'Tesco Cork City',
        fullName: 'Tesco - Cork City',
        type: 'High Volume Center',
        sales: runTescoCork_Sales,
        production: runTescoCork_Prod,
        waste: runTescoCork_Waste,
        hours: runTescoCork_Hours,
        wastePct: tescoCorkWastePct,
        laborProd: tescoCorkLaborProd,
        efficiencyScore: tescoCorkEffScore,
        color: '#10b981',
        fill: 'url(#gradTescoCork)'
      },
      {
        id: 'tesco_mahon',
        name: 'Tesco Mahon Point',
        fullName: 'Tesco - Mahon Point',
        type: 'Suburban Shopping Mall',
        sales: runTescoMahon_Sales,
        production: runTescoMahon_Prod,
        waste: runTescoMahon_Waste,
        hours: runTescoMahon_Hours,
        wastePct: tescoMahonWastePct,
        laborProd: tescoMahonLaborProd,
        efficiencyScore: tescoMahonEffScore,
        color: '#a855f7',
        fill: 'url(#gradTescoMahon)'
      }
    ];
  }, [activeLog, weeklyLogs, orders, branchComparePeriod]);

  // Derived Performance comparison list (can be all branches or selected vs company average)
  const branchPerformanceData = React.useMemo(() => {
    if (!vsAverageMode) {
      return rawBranchList;
    }

    // Company averages
    const avgSales = Math.round(rawBranchList.reduce((sum, b) => sum + b.sales, 0) / rawBranchList.length);
    const avgProduction = Math.round(rawBranchList.reduce((sum, b) => sum + b.production, 0) / rawBranchList.length);
    const avgWaste = Math.round(rawBranchList.reduce((sum, b) => sum + b.waste, 0) / rawBranchList.length);
    const avgHours = Math.round(rawBranchList.reduce((sum, b) => sum + b.hours, 0) / rawBranchList.length);
    const avgWastePct = parseFloat((rawBranchList.reduce((sum, b) => sum + b.wastePct, 0) / rawBranchList.length).toFixed(1));
    const avgLaborProd = Math.round(rawBranchList.reduce((sum, b) => sum + b.laborProd, 0) / rawBranchList.length);
    const avgEfficiencyScore = Math.round(rawBranchList.reduce((sum, b) => sum + b.efficiencyScore, 0) / rawBranchList.length);

    // Selected branch
    const activeBranch = rawBranchList.find(b => b.fullName === selectedBranch) || rawBranchList[0];

    // Company Average Item
    const companyAvgItem = {
      id: 'company_avg',
      name: 'Company Average',
      fullName: 'Standard Company Average',
      type: 'Combined Corporate Benchmark',
      sales: avgSales,
      production: avgProduction,
      waste: avgWaste,
      hours: avgHours,
      wastePct: avgWastePct,
      laborProd: avgLaborProd,
      efficiencyScore: avgEfficiencyScore,
      color: '#3b82f6', // brand blue for benchmark comparisons
      fill: 'url(#gradAvg)'
    };

    return [activeBranch, companyAvgItem];
  }, [rawBranchList, vsAverageMode, selectedBranch]);

  // Determine peak efficiency branch (calculating exclusively from actual real branches to avoid company average bias)
  const championBranch = React.useMemo(() => {
    return [...rawBranchList].sort((a, b) => b.efficiencyScore - a.efficiencyScore)[0];
  }, [rawBranchList]);

  return (
    <div id="overview-viewport" className="space-y-6">
      {/* Header Banner with Premium ambient bento design */}
      <div className={`rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 border transition-colors duration-200 ${
        isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-white'
      }`}>
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full filter blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono transition-colors ${
              isLight ? 'bg-zinc-100 border-zinc-200 text-orange-600' : 'bg-zinc-800 border-zinc-700/60 text-orange-400'
            }`}>
              <Sparkles className="w-3 h-3 animate-pulse" />
              Sushi Intelligence Portal Active
            </div>
            {irelandTime && (
              <span className={`text-xs px-3.5 py-1 font-mono tracking-tight font-semibold border rounded-full inline-flex items-center gap-1.5 transition-colors ${
                isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-855 text-zinc-400'
              }`}>
                Dublin Clock (IE): {irelandTime}
              </span>
            )}
          </div>
          <h1 className={`text-3xl md:text-4xl font-sans font-extrabold tracking-tight mb-2 ${
            isLight ? 'text-zinc-900' : 'text-white'
          }`}>
            Sushi Ops Strategy Center
          </h1>
          <p className={`text-sm leading-relaxed ${
            isLight ? 'text-zinc-650 text-zinc-605 text-zinc-600' : 'text-zinc-300'
          }`}>
            Premium Sushi Production Company is currently executing at <span className="text-orange-600 dark:text-orange-400 font-semibold">{metrics.aiHealthScore}% efficiency</span>. Cooking objectives are on target, and waste reports show an improvement of <span className="text-emerald-600 dark:text-emerald-400 font-semibold">18.2% vs last Friday</span>.
          </p>
        </div>

        {/* Date-Range Selector Box */}
        <div className={`relative z-10 backdrop-blur-md p-5 rounded-2xl border w-full lg:w-72 flex flex-col gap-2 shrink-0 transition-colors ${
          isLight ? 'bg-zinc-100/60 border-zinc-200' : 'bg-zinc-950/60 border-zinc-800'
        }`}>
          <div className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider ${
            isLight ? 'text-zinc-700' : 'text-zinc-400'
          }`}>
            <Calendar className={`w-3.5 h-3.5 ${isLight ? 'text-orange-600' : 'text-orange-400'}`} />
            <span>Audit Calendar Week</span>
          </div>
          <p className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Filter general dashboard throughput, COGS, waste stats, and bar charts</p>
          <select
            value={selectedWeekRange}
            onChange={(e) => onSelectedWeekRangeChange(e.target.value)}
            className={`w-full focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2.5 text-xs font-mono font-bold tracking-tight mt-1 transition-all cursor-pointer shadow-inner focus:outline-none ${
              isLight ? 'bg-white border-zinc-200 text-orange-600 hover:text-orange-700' : 'bg-zinc-900 border-zinc-800 text-orange-400 hover:text-orange-355'
            }`}
          >
            <option value="2026-06-15 to 2026-06-21" className={`${isLight ? 'bg-white text-zinc-900' : 'bg-zinc-950'} font-mono text-xs`}>
              Week 25 (Jun 15 - Jun 21, 2026) [Active]
            </option>
            <option value="2026-06-22 to 2026-06-28" className={`${isLight ? 'bg-white text-zinc-900' : 'bg-zinc-950'} font-mono text-xs`}>
              Week 26 (Jun 22 - Jun 28, 2026) [Future]
            </option>
            <option value="2026-06-08 to 2026-06-14" className={`${isLight ? 'bg-white text-zinc-900' : 'bg-zinc-950'} font-mono text-xs`}>
              Week 24 (Jun 08 - Jun 14, 2026) [Historical]
            </option>
          </select>
          <div className={`flex items-center justify-between text-[9px] font-mono mt-1 pt-2 border-t ${
            isLight ? 'border-zinc-200' : 'border-zinc-900'
          }`}>
            <span className="text-zinc-500">Selected Date Range:</span>
            <span className="text-orange-500 font-bold">{selectedWeekRange}</span>
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
        <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border transition-colors ${
          isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-900'
        }`}>
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 font-bold ${isLight ? 'text-orange-600' : 'text-orange-400'}`} />
            <span className={`text-xs font-mono uppercase tracking-wider font-bold ${
              isLight ? 'text-zinc-700' : 'text-zinc-350'
            }`}>
              Display Mode: {activeLog.date} ({activeLog.day}) Audit
            </span>
          </div>
          <div className={`flex items-center p-1 rounded-2xl border shadow-inner transition-colors ${
            isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-850'
          }`}>
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
                      : isLight
                        ? 'text-zinc-550 text-zinc-500 hover:text-orange-600 hover:bg-white'
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
          className={`p-5 rounded-3xl border transition-all shadow-sm cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
            isLight 
              ? 'bg-white border-zinc-200 hover:border-orange-500/50 text-zinc-900 shadow-[0_4px_24px_rgba(0,0,0,0.02)]' 
              : 'bg-zinc-900 border-zinc-800 hover:border-orange-500/40 text-white'
          }`}
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>Gross Revenue</p>
                <h3 className={`text-2xl font-sans font-black mt-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  €{activeLog.sales.toLocaleString()}
                </h3>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                  <TrendingUp className="w-3 h-3" />
                  +8.5% daily avg
                </span>
              </div>
              <div className={`p-2.5 border transition-all duration-300 rounded-xl ${
                isLight 
                  ? 'bg-zinc-100 border-zinc-200 text-orange-600 group-hover:bg-orange-500 group-hover:text-white' 
                  : 'bg-zinc-950 border-zinc-850 text-orange-550 group-hover:bg-orange-500 group-hover:text-white'
              }`}>
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
          className={`p-5 rounded-3xl border transition-all shadow-sm cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
            isLight 
              ? 'bg-white border-zinc-200 hover:border-emerald-500/50 text-zinc-900 shadow-[0_4px_24px_rgba(0,0,0,0.02)]' 
              : 'bg-zinc-900 border-zinc-800 hover:border-emerald-500/40 text-white'
          }`}
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>Throughput</p>
                <h3 className={`text-2xl font-sans font-black mt-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {activeLog.productionMade.toLocaleString()} <span className="text-[10px] text-zinc-500 font-normal">pcs</span>
                </h3>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-401 text-zinc-400'}`}>
                  Target: {activeLog.productionTarget.toLocaleString()}
                </span>
              </div>
              <div className={`p-2.5 border transition-all duration-300 rounded-xl ${
                isLight 
                  ? 'bg-zinc-100 border-zinc-200 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' 
                  : 'bg-zinc-950 border-zinc-850 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white'
              }`}>
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
          className={`p-5 rounded-3xl border transition-all shadow-sm cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
            isLight 
              ? 'bg-white border-zinc-200 hover:border-rose-500/50 text-zinc-900 shadow-[0_4px_24px_rgba(0,0,0,0.02)]' 
              : 'bg-zinc-900 border-zinc-800 hover:border-rose-500/40 text-white'
          }`}
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>Seafood Waste</p>
                <h3 className={`text-2xl font-sans font-black mt-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  €{activeLog.waste.toFixed(2)}
                </h3>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  Within limit
                </span>
              </div>
              <div className={`p-2.5 border transition-all duration-300 rounded-xl ${
                isLight 
                  ? 'bg-zinc-100 border-zinc-200 text-rose-600 group-hover:bg-rose-500 group-hover:text-white' 
                  : 'bg-zinc-950 border-zinc-850 text-rose-455 group-hover:bg-rose-500 group-hover:text-white'
              }`}>
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
          className={`p-5 rounded-3xl border transition-all shadow-md cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
            isLight 
              ? 'bg-white border-zinc-200 hover:border-amber-500/50 text-zinc-900 shadow-[0_4px_24px_rgba(0,0,0,0.02)]' 
              : 'bg-zinc-900 border-zinc-800 hover:border-amber-500/40 text-white'
          }`}
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>Worked Hours</p>
                <h3 className={`text-2xl font-sans font-black mt-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {activeLog.hours} hrs
                </h3>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Staffing Optimal
                </span>
              </div>
              <div className={`p-2.5 border transition-all duration-300 rounded-xl ${
                isLight 
                  ? 'bg-zinc-100 border-zinc-200 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' 
                  : 'bg-zinc-950 border-zinc-850 text-amber-400 group-hover:bg-amber-500 group-hover:text-white'
              }`}>
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
          className={`p-5 rounded-3xl border transition-all shadow-md group relative overflow-hidden flex flex-col justify-between ${
            isLight 
              ? 'bg-white border-zinc-200 hover:border-purple-500/50 text-zinc-900 shadow-[0_4px_24px_rgba(0,0,0,0.02)]' 
              : 'bg-zinc-900 border-zinc-800 hover:border-purple-500/40 text-white'
          }`}
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>Total COGS (GOC)</p>
                <h3 className="text-2xl font-sans font-black text-purple-600 dark:text-purple-400 mt-1.5 font-sans">
                  €{totalCogsActiveDay.toLocaleString()}
                </h3>
                <span className={`inline-flex mt-1 text-[9px] font-mono font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Weekly: €{totalCogsWeek.toLocaleString()}
                </span>
              </div>
              <div className={`p-2.5 border transition-all duration-300 rounded-xl ${
                isLight 
                  ? 'bg-zinc-100 border-zinc-200 text-purple-600 group-hover:bg-purple-500 group-hover:text-white' 
                  : 'bg-zinc-950 border-zinc-850 text-purple-400 group-hover:bg-purple-500 group-hover:text-white'
              }`}>
                <Settings className="w-4 h-4" />
              </div>
            </div>

            {/* Supplier Breakdowns */}
            <div className="mt-4 space-y-2 text-[9px] font-sans">
              <div>
                <div className={`flex justify-between font-mono ${isLight ? 'text-zinc-650 text-zinc-600 font-semibold' : 'text-zinc-400'}`}>
                  <span>Tazaki (Ingredients)</span>
                  <span className={`font-semibold ${isLight ? 'text-zinc-905 text-zinc-900' : 'text-zinc-200'}`}>€{activeLog.cogs.tazaki.toLocaleString()}</span>
                </div>
                <div className={`w-full h-1 rounded-full overflow-hidden mt-0.5 ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`}>
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min((activeLog.cogs.tazaki / totalCogsActiveDay) * 100 || 0, 100)}%` }} />
                </div>
              </div>

              <div>
                <div className={`flex justify-between font-mono ${isLight ? 'text-zinc-650 text-zinc-600 font-semibold' : 'text-zinc-400'}`}>
                  <span>Sysco (Ssh Grains)</span>
                  <span className={`font-semibold ${isLight ? 'text-zinc-905 text-zinc-900' : 'text-zinc-200'}`}>€{activeLog.cogs.sysco.toLocaleString()}</span>
                </div>
                <div className={`w-full h-1 rounded-full overflow-hidden mt-0.5 ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`}>
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min((activeLog.cogs.sysco / totalCogsActiveDay) * 100 || 0, 100)}%` }} />
                </div>
              </div>

              <div>
                <div className={`flex justify-between font-mono ${isLight ? 'text-zinc-650 text-zinc-600 font-semibold' : 'text-zinc-400'}`}>
                  <span>Bulza (Display Box)</span>
                  <span className={`font-semibold ${isLight ? 'text-zinc-905 text-zinc-900' : 'text-zinc-200'}`}>€{activeLog.cogs.bulza.toLocaleString()}</span>
                </div>
                <div className={`w-full h-1 rounded-full overflow-hidden mt-0.5 ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`}>
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min((activeLog.cogs.bulza / totalCogsActiveDay) * 100 || 0, 100)}%` }} />
                </div>
              </div>

              <div>
                <div className={`flex justify-between font-mono ${isLight ? 'text-zinc-650 text-zinc-600 font-semibold' : 'text-zinc-400'}`}>
                  <span>Sticker (Thermal Label)</span>
                  <span className={`font-semibold ${isLight ? 'text-zinc-905 text-zinc-900' : 'text-zinc-200'}`}>€{activeLog.cogs.sticker.toLocaleString()}</span>
                </div>
                <div className={`w-full h-1 rounded-full overflow-hidden mt-0.5 ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`}>
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
        <div className={`lg:col-span-2 rounded-3xl border p-6 shadow-sm transition-all duration-300 ${isLight ? 'bg-white border-zinc-200 shadow-zinc-100/50' : 'bg-zinc-900 border-zinc-800'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-sans font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Performance Index</h3>
                <span className={`text-[10px] border font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                  isLight 
                    ? 'bg-emerald-50 text-emerald-750 text-emerald-700 border-emerald-250 border-emerald-200' 
                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                }`}>
                  {chartView === 'weekly' ? 'Week Overview' : 'Today Overview'}
                </span>
              </div>
              <p className="subtitle text-xs text-zinc-500 uppercase font-semibold">
                {chartView === 'weekly' ? '7-Day operational flow analysis' : 'Correlated hourly view of cumulative metrics'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className={`flex p-1 rounded-xl border transition-colors ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                <button
                  type="button"
                  onClick={() => setChartView('weekly')}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-lg font-mono font-bold transition-all ${
                    chartView === 'weekly'
                      ? 'bg-orange-500 text-white shadow-md'
                      : isLight 
                        ? 'text-zinc-500 hover:text-zinc-800' 
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
                      : isLight 
                        ? 'text-zinc-500 hover:text-zinc-800' 
                        : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Hourly View
                </button>
              </div>

              <div className="flex gap-3 font-mono text-[11px]">
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded-sm" />
                  <span className={`font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Sales</span>
                </div>
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                  <span className={`font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Production</span>
                </div>
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 bg-purple-500 rounded-sm" />
                  <span className={`font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>COGS</span>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e4e4e7' : '#1f2937'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isLight ? '#ffffff' : '#09090b', 
                    borderRadius: '16px', 
                    color: isLight ? '#18181b' : '#fff', 
                    border: isLight ? '1px solid #e4e4e7' : '1px solid #27272a', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' 
                  }}
                  labelStyle={{ color: isLight ? '#71717a' : '#a1a1aa' }}
                />
                <Area type="monotone" dataKey="Sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Production" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProd)" />
                <Area type="monotone" dataKey="COGS" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorCogs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgent Core Targets Summary */}
        <div className={`rounded-3xl border p-6 shadow-sm flex flex-col transition-all duration-300 ${isLight ? 'bg-white border-zinc-200 shadow-zinc-100/50' : 'bg-zinc-900 border-zinc-800'}`}>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div>
              <h3 className={`text-lg font-sans font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Today's Key Milestones</h3>
              <p className="text-xs text-zinc-500">Urgent target progress metrics</p>
            </div>
            <button 
              onClick={() => onNavigateTab('Target')}
              className={`text-xs font-bold inline-flex items-center gap-0.5 hover:underline ${isLight ? 'text-orange-655 text-orange-600 hover:text-orange-700' : 'text-orange-400 hover:text-orange-355'}`}
            >
              Manage
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-72 pr-1 mt-4">
            {targets.slice(0, 4).map((target) => {
              const pct = Math.min((target.currentValue / target.targetValue) * 100, 100);
              const isHours = target.category === 'Hours';
              const isComplete = target.currentValue >= target.targetValue;
              return (
                <div key={target.id} className={`p-3 border rounded-2xl transition-colors ${
                  isLight ? 'bg-zinc-50 border-zinc-200 shadow-sm' : 'bg-zinc-950 border-zinc-850'
                }`}>
                  <div className="flex justify-between text-xs mb-1.5 font-sans">
                    <span className={`font-semibold ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>{target.name}</span>
                    <span className={`font-mono text-[10px] uppercase tracking-wider font-extrabold ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{target.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                    <span className={isLight ? 'text-zinc-600 font-semibold' : 'text-zinc-404 text-zinc-430 text-zinc-400'}>
                      {target.currentValue.toLocaleString()} {isHours ? 'hrs' : 'pcs'} ({Math.round(pct)}%)
                    </span>
                    <span className={isLight ? 'text-zinc-500' : 'text-zinc-500'}>Goal: {target.targetValue.toLocaleString()}</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden transition-colors ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`}>
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
      <div className={`rounded-3xl border p-6 shadow-sm overflow-hidden relative font-sans transition-all duration-300 ${
        isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
      }`}>
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isLight ? 'border-zinc-200' : 'border-zinc-805'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 border rounded-2xl transition-all duration-300 ${
              isLight ? 'bg-zinc-100 border-zinc-200 text-orange-600' : 'bg-zinc-950 border-zinc-850 text-orange-400'
            }`}>
              <Activity className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <h3 className={`text-lg font-sans font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Weekly Operational Audit & Suppliers Log
              </h3>
              <p className="text-xs text-zinc-500">Overview of the 7-day operational loop, baseline performance metrics, and primary registered suppliers</p>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300 border-collapse">
            <thead>
              <tr className={`border-b font-mono text-[10px] uppercase tracking-wider ${
                isLight ? 'border-zinc-200 text-zinc-500' : 'border-zinc-800 text-zinc-500'
              }`}>
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
            <tbody className={`divide-y ${isLight ? 'divide-zinc-200' : 'divide-zinc-900'}`}>
              {weeklyLogs.map((log) => {
                const totalCogs = log.cogs.tazaki + log.cogs.sysco + log.cogs.bulza + log.cogs.sticker + log.cogs.others;
                const isSelected = selectedDayTab === log.day;
                return (
                  <tr 
                    key={log.day}
                    className={`transition-colors group ${
                      isSelected 
                        ? 'bg-orange-500/5' 
                        : isLight 
                          ? 'hover:bg-zinc-50' 
                          : 'hover:bg-zinc-850/50'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-zinc-250">
                      <button
                        type="button"
                        onClick={() => setSelectedDayTab(log.day)}
                        className={`font-mono text-xs px-2 py-1 rounded-lg transition-all ${
                          isSelected 
                            ? 'bg-orange-500 text-white' 
                            : isLight 
                              ? 'text-orange-600 hover:bg-zinc-100' 
                              : 'text-orange-400 hover:bg-zinc-800'
                        }`}
                      >
                        {log.day}
                      </button>
                    </td>
                    <td className={`py-3.5 px-4 font-mono text-[11px] ${isLight ? 'text-zinc-650 text-zinc-605' : 'text-zinc-400'}`}>{log.date}</td>
                    <td className={`py-3.5 px-4 text-right font-mono font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>€{log.sales.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-rose-605 dark:text-rose-400">€{log.waste.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">{log.hours} <span className="text-[10px] text-zinc-500 font-normal">h</span></td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>{log.productionMade.toLocaleString()}</span>
                      <span className="text-zinc-500 text-[10px5] text-[10px]"> / {log.productionTarget.toLocaleString()}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-purple-600 dark:text-purple-400 font-bold">€{totalCogs.toLocaleString()}</td>
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
                        className={`border rounded-lg py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors text-xs font-semibold cursor-pointer ${
                          isLight 
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-white' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
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
      <div id="weekly-production-comparison" className={`rounded-3xl border p-6 shadow-sm overflow-hidden relative font-sans transition-all duration-300 ${
        isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
      }`}>
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isLight ? 'border-zinc-200' : 'border-zinc-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 border rounded-2xl transition-all duration-300 ${
              isLight ? 'bg-zinc-100 border-zinc-200 text-emerald-650 text-emerald-600' : 'bg-zinc-950 border-zinc-800 text-emerald-400'
            }`}>
              <Package className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <h3 className={`text-lg font-sans font-bold flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Weekly Production Benchmarks (Made vs Target)
                <span className={`px-2 py-0.5 rounded border text-[9px] font-mono uppercase tracking-widest font-bold ${
                  isLight 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  Weekly Output Analysis
                </span>
              </h3>
              <p className="subtitle text-xs text-zinc-500">Live dual-axis visual comparison of daily production targets against actual rolled batches</p>
            </div>
          </div>
          
          <div className="flex gap-4 font-mono text-[11px] items-center">
            <div className="flex items-center gap-1.5 font-sans">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: isLight ? '#a1a1aa' : '#4b5563' }} />
              <span className={`font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Production Target</span>
            </div>
            <div className="flex items-center gap-1.5 font-sans">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
              <span className={`font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Production Made</span>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e4e4e7' : '#1f2937'} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 11 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 11 }} 
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
                cursor={{ fill: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)' }}
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
                        <span className={`font-semibold uppercase tracking-wider text-[10px] ${isLight ? 'text-zinc-650' : 'text-zinc-400'}`}>
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
                fill={isLight ? '#a1a1aa' : '#4b5563'} 
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

      {/* Dynamic Multi-Branch Performance & Store Efficiency Hub */}
      <div id="multi-branch-perf-hub" className={`rounded-3xl border p-6 shadow-sm overflow-hidden relative font-sans transition-all duration-300 ${
        isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
      }`}>
        {/* Subtle background decorative element */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full filter blur-2xl pointer-events-none" />

        {/* Tab Header Banner */}
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b z-10 relative ${
          isLight ? 'border-zinc-200' : 'border-zinc-800/95'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-3 border rounded-2xl transition-all duration-350 ${
              isLight ? 'bg-zinc-150 bg-zinc-100 border-zinc-200 text-amber-600' : 'bg-zinc-950 border-zinc-850 text-amber-500'
            }`}>
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`text-lg font-sans font-bold leading-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  Multi-Branch Performance Comparison
                </h3>
                <span className={`px-2 py-0.5 rounded border text-[9px] font-mono uppercase tracking-widest font-bold ${
                  isLight 
                    ? 'bg-amber-50 border-amber-250 border-amber-200 text-amber-700' 
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  Corporate Branch Analyzer
                </span>
              </div>
              <p className="subtitle text-xs text-zinc-500 mt-1.5 leading-relaxed">
                Visualizing operational efficiency, value sales, rolled throughput, and waste across the M&S and Tesco locations of the brand.
              </p>
            </div>
          </div>

          {/* Interactive Comparison Period & Metric Selectors */}
          <div className="flex flex-wrap items-center gap-3 mt-2 lg:mt-0 font-sans">
            {/* Comparison Mode Toggle */}
            <div className={`flex p-1 rounded-xl border transition-colors ${
              isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
            }`} id="selected-branch-toggle-container">
              <button
                type="button"
                id="comparison-toggle-all-branches"
                onClick={() => setVsAverageMode(false)}
                className={`px-3 py-1.5 text-[9px] uppercase tracking-wider rounded-lg font-mono font-bold transition-all ${
                  !vsAverageMode
                    ? 'bg-amber-600 text-white shadow-md'
                    : isLight 
                      ? 'text-zinc-500 hover:text-amber-700' 
                      : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Branches
              </button>
              <button
                type="button"
                id="comparison-toggle-vs-average"
                onClick={() => setVsAverageMode(true)}
                className={`px-3 py-1.5 text-[9px] uppercase tracking-wider rounded-lg font-mono font-bold transition-all ${
                  vsAverageMode
                    ? 'bg-blue-600 text-white shadow-md'
                    : isLight 
                      ? 'text-zinc-500 hover:text-amber-700' 
                      : 'text-zinc-400 hover:text-white'
                }`}
                title={`Exclusively compare the selected branch (${selectedBranch}) against standard Company Average`}
              >
                Vs Company Avg
              </button>
            </div>

            {/* Period selector */}
            <div className={`flex p-1 rounded-xl border transition-colors ${
              isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <button
                type="button"
                onClick={() => setBranchComparePeriod('day')}
                className={`px-3 py-1.5 text-[9px] uppercase tracking-wider rounded-lg font-mono font-bold transition-all ${
                  branchComparePeriod === 'day'
                    ? 'bg-amber-600 text-white shadow-md'
                    : isLight 
                      ? 'text-zinc-500 hover:text-amber-700' 
                      : 'text-zinc-400 hover:text-white'
                }`}
              >
                Day View ({activeLog.day})
              </button>
              <button
                type="button"
                onClick={() => setBranchComparePeriod('week')}
                className={`px-3 py-1.5 text-[9px] uppercase tracking-wider rounded-lg font-mono font-bold transition-all ${
                  branchComparePeriod === 'week'
                    ? 'bg-amber-600 text-white shadow-md'
                    : isLight 
                      ? 'text-zinc-500 hover:text-amber-700' 
                      : 'text-zinc-400 hover:text-white'
                }`}
              >
                Weekly Total
              </button>
            </div>

            {/* Metric Selector Dropdown */}
            <div className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1.5 shadow-sm transition-colors ${
              isLight ? 'bg-zinc-50 border-zinc-250 border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-505 text-zinc-500'}`}>Measure:</span>
              <select
                value={branchCompareMetric}
                onChange={(e) => setBranchCompareMetric(e.target.value as any)}
                className={`bg-transparent font-bold text-xs cursor-pointer focus:outline-none border-none py-0.5 pl-0.5 pr-4 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23f59e0b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:6px_6px] bg-[right_1px_center] bg-no-repeat font-sans outline-none font-bold ${
                  isLight ? 'text-orange-700' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <option value="sales" className={isLight ? 'text-zinc-900 bg-white font-bold' : 'bg-zinc-950 text-white font-bold'}>Gross Sales revenue (€)</option>
                <option value="production" className={isLight ? 'text-zinc-900 bg-white font-bold' : 'bg-zinc-950 text-white font-bold'}>Rolled Sushi throughput (Pcs)</option>
                <option value="waste" className={isLight ? 'text-zinc-900 bg-white font-bold' : 'bg-zinc-950 text-white font-bold'}>Seafood Ingredient Waste (%)</option>
                <option value="efficiency" className={isLight ? 'text-zinc-900 bg-white font-bold' : 'bg-zinc-950 text-white font-bold'}>Store Efficiency Score (0-100)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 z-10 relative">
          
          {/* Left Column: Recharts Comparison Visualizer BarChart */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-colors ${
            isLight ? 'bg-zinc-50 border-zinc-200 shadow-inner' : 'bg-zinc-950/40 border-zinc-900'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-mono uppercase font-bold tracking-widest pl-1 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Dynamic Comparison Bar
                </span>
                <span className={`text-[10px] border rounded px-2.5 py-0.5 font-mono ${
                  isLight ? 'bg-white border-zinc-200 text-zinc-700 shadow-sm' : 'bg-zinc-905 bg-zinc-900 border-zinc-800 text-zinc-350'
                }`}>
                  Scale: {branchCompareMetric === 'sales' ? 'Euro (€)' : branchCompareMetric === 'production' ? 'Units (Pcs)' : branchCompareMetric === 'waste' ? 'Percentage (%)' : 'Index Points (0-100)'}
                </span>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={branchPerformanceData}
                    margin={{ top: 15, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradMS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="gradTescoCork" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="gradTescoMahon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e2e5' : '#222'} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: isLight ? '#4f4f52' : '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: isLight ? '#71717a' : '#71717a', fontSize: 10 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className={`border p-4 rounded-xl shadow-xl transition-all ${
                              isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
                            }`}>
                              <p className={`text-[10px] font-mono uppercase font-bold select-none ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{data.type}</p>
                              <p className={`text-sm font-extrabold mt-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>{data.fullName}</p>
                              <div className="mt-2 space-y-1.5 font-mono text-[11px]">
                                <div className="flex justify-between gap-8">
                                  <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>Sales revenue:</span>
                                  <span className="font-bold text-amber-600 dark:text-amber-500">€{data.sales.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between gap-8">
                                  <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>Rolled Output:</span>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.production.toLocaleString()} Pcs</span>
                                </div>
                                <div className="flex justify-between gap-8">
                                  <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>Waste Rate:</span>
                                  <span className="font-bold text-rose-600 dark:text-rose-450">{data.wastePct}%</span>
                                </div>
                                <div className={`flex justify-between gap-8 pt-1 border-t ${isLight ? 'border-zinc-200' : 'border-zinc-900'}`}>
                                  <span className={isLight ? 'text-zinc-605 text-zinc-600' : 'text-zinc-350'}>Efficiency Score:</span>
                                  <span className="font-extrabold text-blue-600 dark:text-blue-400">{data.efficiencyScore}/100</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey={
                        branchCompareMetric === 'sales' ? 'sales' : 
                        branchCompareMetric === 'production' ? 'production' : 
                        branchCompareMetric === 'waste' ? 'wastePct' : 
                        'efficiencyScore'
                      } 
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                    >
                      {branchPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Micro comparison labels */}
            <div className={`grid ${branchPerformanceData.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-2 border-t pt-3 mt-2 text-center text-[10px] font-sans ${
              isLight ? 'border-zinc-200' : 'border-zinc-900/80'
            }`}>
              {branchPerformanceData.map(branch => (
                <div key={branch.id} className="flex flex-col items-center">
                  <span className={`font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-500'}`}>{branch.name}</span>
                  <span className="font-mono font-bold mt-0.5" style={{ color: branch.color }}>
                    {branchCompareMetric === 'sales' ? `€${branch.sales.toLocaleString()}` : 
                     branchCompareMetric === 'production' ? `${branch.production.toLocaleString()} Pcs` : 
                     branchCompareMetric === 'waste' ? `${branch.wastePct}%` : 
                     `${branch.efficiencyScore} pts`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Championship & Performance Breakdown */}
          <div className="flex flex-col justify-between space-y-4">
            
            {/* Champion Branch Banner Card */}
            <div className={`p-5 rounded-2xl border relative overflow-hidden flex-1 flex flex-col justify-between transition-all duration-300 ${
              isLight ? 'bg-zinc-50 border-emerald-250 border-emerald-200 shadow-sm shadow-emerald-500/5' : 'bg-zinc-950 border-emerald-950/80'
            }`}>
              {/* Subtle visual gradient glow for the champion */}
              <div className="absolute right-0 bottom-0 w-36 h-36 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full filter blur-xl pointer-events-none" />
              
              <div>
                <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-900/80'}`}>
                  <span className={`text-[9px] font-mono uppercase border px-2 py-0.5 rounded-full font-extrabold tracking-widest flex items-center gap-1 leading-none shadow-sm ${
                    isLight 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' 
                      : 'bg-emerald-950/45 text-emerald-400 border-emerald-900/60'
                  }`}>
                    <span>🏆</span> Peak Efficiency Store
                  </span>
                  <span className={`font-mono font-extrabold text-[13px] ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{championBranch.efficiencyScore}%</span>
                </div>

                <div className="mt-4">
                  <h4 className={`text-sm font-extrabold ${isLight ? 'text-zinc-900' : 'text-white'}`}>{championBranch.fullName}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5 leading-none">{championBranch.type}</p>
                  
                  <p className={`text-xs mt-3 leading-relaxed ${isLight ? 'text-zinc-650 text-zinc-600' : 'text-zinc-400'}`}>
                    Analyzing overall labor costs, high-premium customer transaction margins, and minimal seafood waste, <strong className={`font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{championBranch.name}</strong> holds the highest corporate return ratio at <strong className={`font-mono ${isLight ? 'text-zinc-900' : 'text-white'}`}>€{championBranch.laborProd}/hr</strong> yield per employee hour.
                  </p>
                </div>
              </div>

              <div className={`mt-4 pt-3.5 border-t grid grid-cols-2 gap-3 text-left ${isLight ? 'border-zinc-200' : 'border-zinc-900/80'}`}>
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider">Labor Yield</span>
                  <span className={`text-xs font-mono font-extrabold ${isLight ? 'text-zinc-800' : 'text-white'}`}>€{championBranch.laborProd}/hr</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider">Waste Control</span>
                  <span className={`text-xs font-mono font-extrabold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{Math.max(0, Math.round(100 - championBranch.wastePct))}% Control</span>
                </div>
              </div>
            </div>

            {/* Summary Performance Note */}
            <div className={`p-4 rounded-xl border text-[11px] leading-relaxed font-sans transition-colors ${
              isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-900 text-zinc-400'
            }`}>
              <span className="font-mono text-amber-500 dark:text-amber-550 font-bold block mb-1 uppercase tracking-wide text-[9px]">💡 Strategic Multi-Branch Note</span>
              Sell products in Marks & Spencer are gourmet luxury lines featuring <strong>75% average margins</strong>. Tesco stores support high-volume meal deals and family-packed Trays with <strong>78% labor optimization metrics</strong>. Staffing schedules must remain aligned with peak regional purchase hours.
            </div>

          </div>

        </div>
      </div>

      {/* Daily Sushi Ops & COGS Ledger Entry Form */}
      <div className={`rounded-3xl border p-6 shadow-sm overflow-hidden relative font-sans transition-all duration-300 ${
        isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
      }`}>
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isLight ? 'border-zinc-200' : 'border-zinc-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 border rounded-2xl transition-all duration-300 ${
              isLight ? 'bg-zinc-100 border-zinc-200 text-orange-600' : 'bg-zinc-950 border-zinc-800 text-orange-400'
            }`}>
              <Calendar className="w-5 h-5 flex-shrink-0" />
            </div>
            <div className="z-10">
              <h3 className={`text-lg font-sans font-bold flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Operational Ledger & COGS Input
                <span className={`px-2 py-0.5 rounded border text-[9px] font-mono uppercase tracking-widest font-bold ${
                  isLight 
                    ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold' 
                    : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                }`}>
                  Ledger Direct Writer
                </span>
              </h3>
              <p className="subtitle text-xs text-zinc-500">Record sales, waste, hours, targets, and supplier cost breakdown for any date</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveOperationalLog} className="mt-5 space-y-6 z-10 relative">
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl border transition-all duration-300 ${
            isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-905'
          }`}>
            <div>
              <label className={`text-[10px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Target Day of Week</label>
              <select
                value={entryDay}
                onChange={(e) => setEntryDay(e.target.value as any)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                  isLight ? 'bg-white border-zinc-300 text-zinc-900 font-semibold' : 'bg-zinc-900 border-zinc-800 text-white'
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
              <label className={`text-[10px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Calendar Date</label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                  isLight ? 'bg-white border-zinc-300 text-zinc-900 font-semibold' : 'bg-zinc-900 border-zinc-800 text-white'
                }`}
              />
            </div>
            <div>
              <label className={`text-[10px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Primary Registered Supplier</label>
              <select
                value={entrySupplierName}
                onChange={(e) => setEntrySupplierName(e.target.value as any)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                  isLight ? 'bg-white border-zinc-300 text-zinc-900 font-semibold' : 'bg-zinc-900 border-zinc-800 text-white'
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
              <h4 className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 border-b pb-1.5 ${
                isLight ? 'border-zinc-200 text-zinc-650 text-zinc-605' : 'border-zinc-800 text-zinc-400'
              }`}>
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                Operational & Yield Inputs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Gross Revenue (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entrySales}
                    onChange={(e) => setEntrySales(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                      isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Sushi Waste Cost (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entryWaste}
                    onChange={(e) => setEntryWaste(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                      isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Staff Rostered (hrs)</label>
                  <input
                    type="number"
                    required
                    value={entryHours}
                    onChange={(e) => setEntryHours(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                      isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Production Target (pcs)</label>
                  <input
                    type="number"
                    required
                    value={entryProdTarget}
                    onChange={(e) => setEntryProdTarget(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Production Made (pcs)</label>
                  <input
                    type="number"
                    required
                    value={entryProdMade}
                    onChange={(e) => setEntryProdMade(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Column B: Supplier COGS breakdown */}
            <div className="space-y-4">
              <h4 className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 border-b pb-1.5 ${
                isLight ? 'border-zinc-200 text-zinc-650 text-zinc-605' : 'border-zinc-800 text-zinc-400'
              }`}>
                <Settings className="w-3.5 h-3.5 text-emerald-400" />
                Supplier COGS Breakdown (GOC)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Tazaki Supplier (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entryTazaki}
                    onChange={(e) => setEntryTazaki(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                      isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Sysco Supplier (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entrySysco}
                    onChange={(e) => setEntrySysco(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Bulza Supplier (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entryBulza}
                    onChange={(e) => setEntryBulza(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Sticker Supplier (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entrySticker}
                    onChange={(e) => setEntrySticker(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                      isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[9px] font-mono uppercase font-bold tracking-widest block mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Others / Etc. (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entryOthers}
                    onChange={(e) => setEntryOthers(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-zinc-500 ${
                      isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`flex justify-end pt-4 border-t ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
            <button
              type="submit"
              className={`px-6 py-3 transition-all duration-300 rounded-xl flex items-center justify-center gap-2 shadow-lg border hover:scale-[1.01] font-bold text-sm ${
                showSuccess
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/20 shadow-emerald-500/15"
                  : "bg-orange-600 hover:bg-orange-700 text-white border-orange-500/20 shadow-orange-500/15"
              }`}
            >
              {showSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {showSuccess ? "Records Committed!" : "Commit Active Operational Records"}
            </button>
          </div>
        </form>
      </div>

      {/* Deep Advisor: "Enable high thinking" with gemini-3.1-pro-preview */}
      <div id="deep-advisor-panel" className={`rounded-3xl border p-6 shadow-sm font-sans transition-all duration-300 ${
        isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-900'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b ${
          isLight ? 'border-zinc-250 border-zinc-200' : 'border-zinc-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 border rounded-2xl text-orange-400 shadow-md ${
              isLight ? 'bg-zinc-100 border-zinc-200 text-orange-600' : 'bg-zinc-900 border-zinc-800'
            }`}>
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className={`text-lg font-sans font-extrabold flex items-center gap-2 flex-wrap ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Deep Strategic Advisor
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono select-none ${
                  isLight ? 'bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold' : 'bg-zinc-900 text-zinc-300'
                }`}>
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
            className={`w-full h-24 p-3 border shadow-inner transition-all duration-350 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-sans rounded-2xl ${
              isLight ? 'border-zinc-300 bg-white text-zinc-900' : 'border-zinc-800 bg-zinc-900 text-zinc-100'
            }`}
            placeholder="Introduce multi-layered logistic, resource, target, or supply complications..."
          />

          <div className="flex justify-end items-center">
            <button
              onClick={handleAskAdvisor}
              disabled={loading}
              className={`px-5 py-2.5 border rounded-xl transition-all inline-flex items-center gap-2 shadow-md hover:scale-[1.01] ${
                isLight 
                  ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-350 border-zinc-300 text-zinc-850 hover:text-zinc-900 font-bold text-xs' 
                  : 'bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 disabled:bg-zinc-950 text-white font-bold text-xs'
              }`}
            >
              {loading ? (
                <>
                  <span className={`w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin ${
                    isLight ? 'border-zinc-400 border-t-zinc-800' : 'border-white/30 border-t-white'
                  }`} />
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
            <div className={`p-4 rounded-2xl space-y-2 border ${
              isLight ? 'bg-orange-50/40 border-orange-200/80 text-zinc-800' : 'bg-orange-950/25 border border-orange-900/60'
            }`}>
              <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold block ${
                isLight ? 'text-orange-700' : 'text-orange-400'
              }`}>
                🧠 Thinking Process Summary (Reasoning Path):
              </span>
              <p className={`text-xs font-mono leading-relaxed whitespace-pre-wrap ${
                isLight ? 'text-zinc-650' : 'text-orange-200'
              }`}>
                {thinkingProcess}
              </p>
            </div>
          )}

          {advisorResponse && (
            <div className={`border rounded-2xl p-6 shadow-inner space-y-3 transition-colors ${
              isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
            }`}>
              <div className={`flex items-center gap-1.5 border-b pb-2 ${
                isLight ? 'border-zinc-200' : 'border-zinc-800'
              }`}>
                <Lightbulb className="w-4 h-4 text-emerald-500" />
                <span className={`text-xs font-bold uppercase tracking-wide ${isLight ? 'text-zinc-900' : 'text-white'}`}>Formulated Corporate Strategy:</span>
              </div>
              <div className={`text-xs font-sans leading-relaxed whitespace-pre-wrap ${
                isLight ? 'text-zinc-700' : 'text-zinc-300'
              }`}>
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
