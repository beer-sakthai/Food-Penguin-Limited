import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  CoreMetrics,
  CompanyTarget,
  DailyOperationalLog,
  SalesOrder,
  InventoryItem,
} from "../types";
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
  Activity,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface OverviewTabProps {
  metrics: CoreMetrics;
  onNavigateTab: (tabId: string) => void;
  targets: CompanyTarget[];
  userRole: "Admin" | "Manager" | "Staff" | "User";
  onUpdateMetrics: (newMetrics: Partial<CoreMetrics>) => void;
  irelandTime?: string;
  weeklyLogs: DailyOperationalLog[];
  onAddOrUpdateLog: (log: DailyOperationalLog) => void;
  selectedWeekRange: string;
  onSelectedWeekRangeChange: (range: string) => void;
  orders: SalesOrder[];
  selectedBranch: string;
  theme?: "dark" | "light";
  metallicTheme?: "gold" | "silver" | "copper" | "crystal";
  lowStockItems?: InventoryItem[];
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
  theme = "dark",
  metallicTheme = "gold",
  lowStockItems = [],
}: OverviewTabProps) {
  const isLight = theme === "light";

  // Gemini Shift Summary states
  const [shiftSummary, setShiftSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string>("");

  // Daily Selection tabs for viewing the KPI dashboard
  const [selectedDayTab, setSelectedDayTab] = useState<
    "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
  >("Sun");

  const activeLog =
    weeklyLogs.find((l) => l.day === selectedDayTab) || weeklyLogs[6];

  const fetchShiftSummary = async () => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const calculatedEff = Math.min(
        100,
        Math.max(
          50,
          Math.round(95 - (activeLog.waste / (activeLog.sales || 1)) * 110),
        ),
      );
      const response = await fetch("/api/gemini/shift-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: selectedBranch,
          metrics: {
            salesToday: metrics.salesToday,
            wasteCost: metrics.wasteCost,
            productionTarget: metrics.productionTarget,
            productionItems: metrics.productionItems,
            aiHealthScore: metrics.aiHealthScore,
          },
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.summary) {
        setShiftSummary(data.summary);
      } else {
        throw new Error("No summary returned");
      }
    } catch (err: any) {
      console.error("Error fetching shift summary:", err);
      setSummaryError(err.message || "Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  };
  const totalCogsActiveDay =
    activeLog.cogs.tazaki +
    activeLog.cogs.sysco +
    activeLog.cogs.bulza +
    activeLog.cogs.sticker +
    activeLog.cogs.others;

  // Total Weekly COGS
  const totalCogsWeek = weeklyLogs.reduce((acc, log) => {
    return (
      acc +
      log.cogs.tazaki +
      log.cogs.sysco +
      log.cogs.bulza +
      log.cogs.sticker +
      log.cogs.others
    );
  }, 0);

  // Recharts Chart Data (correlated metrics across hours/days)
  const [chartView, setChartView] = useState<"weekly" | "hourly">("weekly");

  const hourlyData = [
    {
      name: "08:00",
      Sales: 1200,
      Production: 450,
      Waste: 40,
      Hours: 12,
      COGS: 390,
    },
    {
      name: "10:00",
      Sales: 3400,
      Production: 1200,
      Waste: 65,
      Hours: 24,
      COGS: 1100,
    },
    {
      name: "12:00",
      Sales: 6800,
      Production: 2100,
      Waste: 120,
      Hours: 32,
      COGS: 2200,
    },
    {
      name: "14:00",
      Sales: 8900,
      Production: 1800,
      Waste: 95,
      Hours: 32,
      COGS: 2900,
    },
    {
      name: "16:00",
      Sales: 10400,
      Production: 2300,
      Waste: 50,
      Hours: 28,
      COGS: 3400,
    },
    {
      name: "18:00",
      Sales: 12900,
      Production: 1950,
      Waste: 35,
      Hours: 20,
      COGS: 4200,
    },
    {
      name: "20:00",
      Sales: 14820,
      Production: 1445,
      Waste: 12,
      Hours: 14,
      COGS: 4890,
    },
  ];

  const weeklyData = weeklyLogs.map((log) => ({
    name: log.day,
    Sales: log.sales,
    Production: log.productionMade,
    Waste: log.waste,
    Hours: log.hours,
    COGS:
      log.cogs.tazaki +
      log.cogs.sysco +
      log.cogs.bulza +
      log.cogs.sticker +
      log.cogs.others,
  }));

  const salesHistory = weeklyLogs.map((log) => ({
    day: log.day,
    sales: log.sales,
    predictedSales: Math.round(log.sales * 1.02),
  }));

  const productionHistory = weeklyLogs.map((log) => ({
    day: log.day,
    production: log.productionMade,
    predictedProduction: Math.round(log.productionMade * 1.02),
  }));

  const wasteHistory = weeklyLogs.map((log) => ({
    day: log.day,
    waste: log.waste,
    predictedWaste: Math.round(log.waste * 0.98),
  }));

  const hoursHistory = weeklyLogs.map((log) => ({
    day: log.day,
    hours: log.hours,
    predictedHours: Math.round(log.hours * 0.99),
  }));

  // --- MULTI-BRANCH DESIGN CONCEPTS & ANALYTICS ---
  // Store branches defined in the corporate plan:
  // 1. Marks & Spencer - Cork City (Luxury selection, premier gourmet pricing premium, high efficiency)
  // 2. Tesco - Cork City (High volume urban storefront, everyday value items, moderate waste margins)
  // 3. Tesco - Mahon Point (Suburban shopping mall storefront, mixed deals & family options)
  const [branchComparePeriod, setBranchComparePeriod] = useState<
    "day" | "week"
  >("week");
  const [branchCompareMetric, setBranchCompareMetric] = useState<
    "sales" | "production" | "waste" | "efficiency"
  >("sales");
  const [compareMode, setCompareMode] = useState<
    "all" | "vsAverage" | "twoBranches"
  >("twoBranches");
  const [compareBranchA, setCompareBranchA] = useState<string>("m_s_cork");
  const [compareBranchB, setCompareBranchB] = useState<string>("tesco_cork");

  const rawBranchList = React.useMemo(() => {
    // Determine aggregate or day-specific benchmark base values from operational logs
    let baseSales = 0;
    let baseProduction = 0;
    let baseWaste = 0;
    let baseHours = 0;

    if (branchComparePeriod === "day") {
      baseSales = activeLog.sales;
      baseProduction = activeLog.productionMade;
      baseWaste = activeLog.waste;
      baseHours = activeLog.hours;
    } else {
      baseSales = weeklyLogs.reduce((sum, log) => sum + log.sales, 0);
      baseProduction = weeklyLogs.reduce(
        (sum, log) => sum + log.productionMade,
        0,
      );
      baseWaste = weeklyLogs.reduce((sum, log) => sum + log.waste, 0);
      baseHours = weeklyLogs.reduce((sum, log) => sum + log.hours, 0);
    }

    // Extract real logged customer orders matching the timeframes and stores!
    const realOrdersForStore = (branchName: string) => {
      const filtered = orders.filter((o) => {
        const orderBranch = o.branch || "Marks & Spencer - Cork City";
        return (
          orderBranch === branchName &&
          (o.status === "Completed" || o.status === "Pending")
        );
      });
      return filtered.reduce((sum, o) => sum + o.amount, 0);
    };

    const realOrdersQtyForStore = (branchName: string) => {
      const filtered = orders.filter((o) => {
        const orderBranch = o.branch || "Marks & Spencer - Cork City";
        return (
          orderBranch === branchName &&
          (o.status === "Completed" || o.status === "Pending")
        );
      });
      return filtered.reduce((sum, o) => sum + o.quantity, 0);
    };

    // Calculate live overrides from Sell Tab
    const msLiveSales = realOrdersForStore("Marks & Spencer - Cork City");
    const tescoCorkLiveSales = realOrdersForStore("Tesco - Cork City");
    const tescoMahonLiveSales = realOrdersForStore("Tesco - Mahon Point");

    const msLiveQty = realOrdersQtyForStore("Marks & Spencer - Cork City") * 10; // scale representatively to match larger daily output
    const tescoCorkLiveQty = realOrdersQtyForStore("Tesco - Cork City") * 10;
    const tescoMahonLiveQty = realOrdersQtyForStore("Tesco - Mahon Point") * 10;

    // Apply baseline division ratios + add real custom virtual-POS sales
    const runMS_Sales = Math.round(baseSales * 0.42) + msLiveSales;
    const runMS_Prod = Math.round(baseProduction * 0.4) + msLiveQty;
    const runMS_Waste = Math.round(baseWaste * 0.28);
    const runMS_Hours = Math.round(baseHours * 0.35);

    const runTescoCork_Sales =
      Math.round(baseSales * 0.33) + tescoCorkLiveSales;
    const runTescoCork_Prod =
      Math.round(baseProduction * 0.35) + tescoCorkLiveQty;
    const runTescoCork_Waste = Math.round(baseWaste * 0.36);
    const runTescoCork_Hours = Math.round(baseHours * 0.35);

    const runTescoMahon_Sales =
      Math.round(baseSales * 0.25) + tescoMahonLiveSales;
    const runTescoMahon_Prod =
      Math.round(baseProduction * 0.25) + tescoMahonLiveQty;
    const runTescoMahon_Waste = Math.round(baseWaste * 0.36);
    const runTescoMahon_Hours = Math.round(baseHours * 0.3);

    // Compute efficiency values
    const msLaborProd = Math.round(runMS_Sales / (runMS_Hours || 1));
    const tescoCorkLaborProd = Math.round(
      runTescoCork_Sales / (runTescoCork_Hours || 1),
    );
    const tescoMahonLaborProd = Math.round(
      runTescoMahon_Sales / (runTescoMahon_Hours || 1),
    );

    const msWastePct = parseFloat(
      ((runMS_Waste / (runMS_Sales || 1)) * 100).toFixed(1),
    );
    const tescoCorkWastePct = parseFloat(
      ((runTescoCork_Waste / (runTescoCork_Sales || 1)) * 105).toFixed(1),
    ); // slightly different waste multiplier profile
    const tescoMahonWastePct = parseFloat(
      ((runTescoMahon_Waste / (runTescoMahon_Sales || 1)) * 108).toFixed(1),
    );

    // Integrated Operational Efficiency Score (0-100 scale)
    const msEffScore = Math.min(
      100,
      Math.round((msLaborProd / 130) * 65 + (100 - msWastePct) * 0.35),
    );
    const tescoCorkEffScore = Math.min(
      100,
      Math.round(
        (tescoCorkLaborProd / 130) * 65 + (100 - tescoCorkWastePct) * 0.35,
      ),
    );
    const tescoMahonEffScore = Math.min(
      100,
      Math.round(
        (tescoMahonLaborProd / 130) * 65 + (100 - tescoMahonWastePct) * 0.35,
      ),
    );

    return [
      {
        id: "m_s_cork",
        name: "M&S Cork City",
        fullName: "Marks & Spencer - Cork City",
        type: "Luxury Gourmet Specialty Store",
        sales: runMS_Sales,
        production: runMS_Prod,
        waste: runMS_Waste,
        hours: runMS_Hours,
        wastePct: msWastePct,
        laborProd: msLaborProd,
        efficiencyScore: msEffScore,
        color: "#f59e0b",
        fill: "url(#gradMS)",
      },
      {
        id: "tesco_cork",
        name: "Tesco Cork City",
        fullName: "Tesco - Cork City",
        type: "High Volume Center",
        sales: runTescoCork_Sales,
        production: runTescoCork_Prod,
        waste: runTescoCork_Waste,
        hours: runTescoCork_Hours,
        wastePct: tescoCorkWastePct,
        laborProd: tescoCorkLaborProd,
        efficiencyScore: tescoCorkEffScore,
        color: "#10b981",
        fill: "url(#gradTescoCork)",
      },
      {
        id: "tesco_mahon",
        name: "Tesco Mahon Point",
        fullName: "Tesco - Mahon Point",
        type: "Suburban Shopping Mall",
        sales: runTescoMahon_Sales,
        production: runTescoMahon_Prod,
        waste: runTescoMahon_Waste,
        hours: runTescoMahon_Hours,
        wastePct: tescoMahonWastePct,
        laborProd: tescoMahonLaborProd,
        efficiencyScore: tescoMahonEffScore,
        color: "#a855f7",
        fill: "url(#gradTescoMahon)",
      },
    ];
  }, [activeLog, weeklyLogs, orders, branchComparePeriod]);

  // Derived Performance comparison list (can be all branches or selected vs company average)
  const branchPerformanceData = React.useMemo(() => {
    if (compareMode === "all") {
      return rawBranchList;
    }

    if (compareMode === "twoBranches") {
      const bA =
        rawBranchList.find((b) => b.id === compareBranchA) || rawBranchList[0];
      const bB =
        rawBranchList.find((b) => b.id === compareBranchB) || rawBranchList[1];
      return [bA, bB];
    }

    return rawBranchList;
  }, [
    rawBranchList,
    compareMode,
    selectedBranch,
    compareBranchA,
    compareBranchB,
  ]);

  // Determine peak efficiency branch (calculating exclusively from actual real branches to avoid company average bias)
  const championBranch = React.useMemo(() => {
    return [...rawBranchList].sort(
      (a, b) => b.efficiencyScore - a.efficiencyScore,
    )[0];
  }, [rawBranchList]);

  return (
    <div
      id="overview-viewport"
      className="w-full max-w-7xl mx-auto h-full flex flex-col overflow-hidden gap-y-4"
    >
      {/* Header Banner with Premium ambient bento design */}
      <div
        className={`shrink-0 rounded-2xl p-4 md:p-5 relative overflow-hidden shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 border transition-colors duration-200 ${
          isLight
            ? "bg-white border-zinc-200 text-zinc-900"
            : "bg-zinc-900 border-zinc-800 text-white"
        }`}
      >
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full filter blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono transition-colors ${
                isLight
                  ? "bg-zinc-100 border-zinc-200 text-orange-600"
                  : "bg-zinc-800 border-zinc-700/60 text-orange-400"
              }`}
            >
              <Sparkles className="w-3 h-3 animate-pulse" />
              Live kitchen dashboard
            </div>
            {irelandTime && (
              <span
                className={`text-xs px-3.5 py-1 font-mono tracking-tight font-semibold border rounded-full inline-flex items-center gap-1.5 transition-colors ${
                  isLight
                    ? "bg-zinc-100 border-zinc-200 text-zinc-600"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400"
                }`}
              >
                Dublin Clock (IE): {irelandTime}
              </span>
            )}
          </div>
          <h1
            className={`text-2xl md:text-3xl font-sans font-extrabold tracking-tight mb-2 ${
              isLight ? "text-zinc-900" : "text-white"
            }`}
          >
            Today's Food Penguin Snapshot
          </h1>
          <p
            className={`text-sm leading-relaxed ${
              isLight
                ? "text-zinc-600 text-zinc-600 text-zinc-600"
                : "text-zinc-300"
            }`}
          >
            A quick view of sales, production, waste, hours, and stock for{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {selectedBranch}
            </span>
            . Current efficiency is{" "}
            <span className="text-orange-600 dark:text-orange-400 font-semibold">
              {metrics.aiHealthScore}% efficiency
            </span>
            , with waste improving by{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              18.2%
            </span>
            compared with last Friday.
          </p>
        </div>

        {/* Date-Range Selector Box */}
        <div
          className={`relative z-10 backdrop-blur-md p-4 rounded-xl border w-full lg:w-72 flex flex-col gap-2 shrink-0 transition-colors ${
            isLight
              ? "bg-zinc-100/60 border-zinc-200"
              : "bg-zinc-950/60 border-zinc-800"
          }`}
        >
          <div
            className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider ${
              isLight ? "text-zinc-700" : "text-zinc-400"
            }`}
          >
            <Calendar
              className={`w-3.5 h-3.5 ${isLight ? "text-orange-600" : "text-orange-400"}`}
            />
            <span>Week Filter</span>
          </div>
          <p
            className={`text-xs ${isLight ? "text-zinc-500" : "text-zinc-500"}`}
          >
            Choose the week used for the dashboard numbers and charts.
          </p>
          <select className={`input-gold-glow w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-lg px-3 py-2.5 text-xs font-mono font-bold tracking-tight mt-1 transition-all cursor-pointer shadow-inner focus:outline-none ${ isLight ? "bg-white border-zinc-200 text-orange-600 active:scale-[0.98] hover:text-orange-700" : "bg-zinc-900 border-zinc-800 text-orange-400 hover:text-orange-300" }`} value={selectedWeekRange} onChange={(e) => onSelectedWeekRangeChange(e.target.value)}>
            <option
              value="2026-06-15 to 2026-06-21"
              className={`${isLight ? "bg-white text-zinc-900" : "bg-zinc-950"} font-mono text-xs`}
            >
                Week 25 (Jun 15 - Jun 21, 2026)
            </option>
            <option
              value="2026-06-22 to 2026-06-28"
              className={`${isLight ? "bg-white text-zinc-900" : "bg-zinc-950"} font-mono text-xs`}
            >
                Week 26 (Jun 22 - Jun 28, 2026)
            </option>
            <option
              value="2026-06-08 to 2026-06-14"
              className={`${isLight ? "bg-white text-zinc-900" : "bg-zinc-950"} font-mono text-xs`}
            >
                Week 24 (Jun 08 - Jun 14, 2026)
            </option>
          </select>
          <div
            className={`flex items-center justify-between text-xs font-mono mt-1 pt-2 border-t ${
              isLight ? "border-zinc-200" : "border-zinc-900"
            }`}
          >
            <span className="text-zinc-500">Selected:</span>
            <span className="text-orange-500 font-bold">
              {selectedWeekRange}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Main Content Container with Smooth Fade-In on Week Selection Change */}
      <motion.div
        key={selectedWeekRange}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col flex-1 min-h-0 overflow-hidden gap-y-3"
      >
        {/* Low Stock Alerts Notification Banner */}
        {lowStockItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`shrink-0 p-3 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 ${
              isLight
                ? "bg-amber-50 border-amber-200 text-amber-950 shadow-sm"
                : "bg-amber-950/15 border border-amber-900/40 text-amber-200"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-2xl ${
                  isLight
                    ? "bg-amber-100 text-amber-800"
                    : "bg-amber-950/60 text-amber-400 border border-amber-900/30"
                } flex shrink-0`}
              >
                <AlertTriangle className="w-5 h-5 animate-bounce text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight">
                  Stock needs attention: {lowStockItems.length}{" "}
                  {lowStockItems.length === 1 ? "item" : "items"}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  These ingredients are below the level you set:{" "}
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">
                    {lowStockItems
                      .map(
                        (item) =>
                          `${item.name} (${item.currentQty} ${item.unit})`,
                      )
                      .join(", ")}
                  </span>
                  .
                </p>
              </div>
            </div>
            <button className="btn-interactive px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-lg shadow-sm transition-all active:scale-[0.98] shrink-0 cursor-pointer" onClick={() => onNavigateTab("Planning")}>
              Open planning
            </button>
          </motion.div>
        )}

        {/* Weekday Quick Select Tabs */}
        <div
          className={`shrink-0 flex flex-wrap items-center justify-between gap-4 p-2.5 rounded-xl border transition-colors ${
            isLight ? "bg-white border-zinc-200" : "bg-zinc-950 border-zinc-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar
              className={`w-4 h-4 font-bold ${isLight ? "text-orange-600" : "text-orange-400"}`}
            />
            <span
              className={`text-xs font-mono uppercase tracking-wider font-bold ${
                isLight ? "text-zinc-700" : "text-zinc-300"
              }`}
            >
              Viewing {activeLog.day}, {activeLog.date}
            </span>
          </div>
          <div
            className={`flex items-center p-1 rounded-lg border shadow-inner transition-colors ${
              isLight
                ? "bg-zinc-100 border-zinc-200"
                : "bg-zinc-900 border-zinc-800"
            }`}
          >
            {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const).map(
              (day) => {
                const isActive = selectedDayTab === day;
                return (
                  <button className={`btn-interactive px-3.5 py-1.5 text-xs rounded-md font-mono font-bold transition-all ${ isActive ? "bg-orange-500 text-white shadow-md" : isLight ? "text-zinc-500 active:scale-[0.98] hover:text-orange-600 hover:bg-white" : "text-zinc-400 hover:text-white" }`} key={day} onClick={() => setSelectedDayTab(day)} type="button">
                    {day}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* KPI Bento Cards */}
        <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-3">
          {/* Card 1: Sell Today */}
          <motion.div
            key={activeLog.date + "-sell-" + activeLog.sales}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            onClick={() => onNavigateTab("Sell")}
            className={`p-5 ${metallicTheme}-liner-box cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
              isLight
                ? "bg-amber-50/70 hover:bg-amber-100/60 text-zinc-900 shadow-md"
                : "bg-zinc-950/80 hover:bg-black text-white"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p
                    className={`text-xs font-mono uppercase tracking-widest font-bold ${isLight ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    Gross Revenue
                  </p>
                  <h3
                    className={`text-3xl font-sans font-black mt-1.5 ${isLight ? "text-zinc-900" : "text-3d-gold drop-shadow-md"}`}
                  >
                    EUR {activeLog.sales.toLocaleString()}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${isLight ? "text-emerald-600" : "text-emerald-400"}`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    +8.5% daily avg
                  </span>
                </div>
                <div
                  className={`p-2.5 border transition-all duration-300 rounded-xl ${
                    isLight
                      ? "bg-zinc-100 border-zinc-200 text-orange-600 group-hover:bg-orange-500 group-hover:text-white"
                      : "bg-zinc-950 border-zinc-800 text-orange-500 group-hover:bg-orange-500 group-hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            </div>
            {/* Sparkline for Sales trend (last 7 days) */}
            <div className="h-8 mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesHistory}
                  margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                >
                  <defs>
                    <linearGradient
                      id="sparklineSales1"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#f97316"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#f97316"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#sparklineSales1)"
                    dot={false}
                    isAnimationActive={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedSales"
                    stroke="#fdbf5c"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    dot={false}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </motion.div>

          {/* Card 2: Production */}
          <motion.div
            key={activeLog.date + "-prod-" + activeLog.productionMade}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onClick={() => onNavigateTab("Production")}
            className={`p-5 ${metallicTheme}-liner-box cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
              isLight
                ? "bg-zinc-50 hover:bg-zinc-100 text-zinc-900 shadow-sm"
                : "bg-zinc-950/80 hover:bg-black text-white"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p
                    className={`text-xs font-mono uppercase tracking-widest font-bold ${isLight ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    Throughput
                  </p>
                  <h3
                    className={`text-3xl font-sans font-black mt-1.5 ${isLight ? "text-zinc-900" : "text-3d-gold drop-shadow-md"}`}
                  >
                    {activeLog.productionMade.toLocaleString()}{" "}
                    <span className="text-xs text-zinc-500 font-normal">
                      units
                    </span>
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${isLight ? "text-zinc-500" : "text-zinc-400 text-zinc-400"}`}
                  >
                    Target: {activeLog.productionTarget.toLocaleString()}
                  </span>
                </div>
                <div
                  className={`p-2.5 border transition-all duration-300 rounded-xl ${
                    isLight
                      ? "bg-zinc-100 border-zinc-200 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"
                      : "bg-zinc-950 border-zinc-800 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white"
                  }`}
                >
                  <Package className="w-4 h-4" />
                </div>
              </div>
            </div>
            {/* Sparkline for Production trend (last 7 days) */}
            <div className="h-8 mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={productionHistory}
                  margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                >
                  <defs>
                    <linearGradient
                      id="sparklineProduction"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="production"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#sparklineProduction)"
                    dot={false}
                    isAnimationActive={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedProduction"
                    stroke="#34d399"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    dot={false}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </motion.div>

          {/* Card 3: Waste Cost */}
          <motion.div
            key={activeLog.date + "-waste-" + activeLog.waste}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            onClick={() => onNavigateTab("Waste")}
            className={`p-5 ${metallicTheme}-liner-box cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
              isLight
                ? "bg-orange-50/50 hover:bg-orange-100/40 text-zinc-900 shadow-sm"
                : "bg-zinc-950/80 hover:bg-black text-white"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p
                    className={`text-xs font-mono uppercase tracking-widest font-bold ${isLight ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    Seafood Waste
                  </p>
                  <h3
                    className={`text-3xl font-sans font-black mt-1.5 ${isLight ? "text-zinc-900" : "text-3d-gold drop-shadow-md"}`}
                  >
                    EUR {activeLog.waste.toFixed(2)}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${isLight ? "text-emerald-700" : "text-emerald-400"}`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Within limit
                  </span>
                </div>
                <div
                  className={`p-2.5 border transition-all duration-300 rounded-xl ${
                    isLight
                      ? "bg-zinc-100 border-zinc-200 text-rose-600 group-hover:bg-rose-500 group-hover:text-white"
                      : "bg-zinc-950 border-zinc-800 text-rose-400 group-hover:bg-rose-500 group-hover:text-white"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </div>
              </div>
            </div>
            {/* Sparkline for Waste trend (last 7 days) */}
            <div className="h-8 mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={wasteHistory}
                  margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                >
                  <defs>
                    <linearGradient
                      id="sparklineWaste"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#f43f5e"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#f43f5e"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="waste"
                    stroke="#f43f5e"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#sparklineWaste)"
                    dot={false}
                    isAnimationActive={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedWaste"
                    stroke="#fb7185"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    dot={false}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </motion.div>

          {/* Card 4: Hours */}
          <motion.div
            key={activeLog.date + "-hours-" + activeLog.hours}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={() => onNavigateTab("Hours")}
            className={`p-5 ${metallicTheme}-liner-box cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
              isLight
                ? "bg-zinc-50 hover:bg-zinc-100 text-zinc-900 shadow-sm"
                : "bg-zinc-950/80 hover:bg-black text-white"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p
                    className={`text-xs font-mono uppercase tracking-widest font-bold ${isLight ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    Worked Hours
                  </p>
                  <h3
                    className={`text-3xl font-sans font-black mt-1.5 ${isLight ? "text-zinc-900" : "text-3d-gold drop-shadow-md"}`}
                  >
                    {activeLog.hours} hrs
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${isLight ? "text-zinc-600" : "text-zinc-400"}`}
                  >
                    Staffing Optimal
                  </span>
                </div>
                <div
                  className={`p-2.5 border transition-all duration-300 rounded-xl ${
                    isLight
                      ? "bg-zinc-100 border-zinc-200 text-amber-600 group-hover:bg-amber-500 group-hover:text-white"
                      : "bg-zinc-950 border-zinc-800 text-amber-400 group-hover:bg-amber-500 group-hover:text-white"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </div>
            {/* Sparkline for Hours trend (last 7 days) */}
            <div className="h-8 mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hoursHistory}
                  margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                >
                  <defs>
                    <linearGradient
                      id="sparklineHours"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#fbbf24"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#fbbf24"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#fbbf24"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#sparklineHours)"
                    dot={false}
                    isAnimationActive={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedHours"
                    stroke="#fde047"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    dot={false}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </motion.div>

          {/* Card 5: COGS & Supplier breakdowns */}
          <motion.div
            key={activeLog.date + "-cogs-" + totalCogsActiveDay}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className={`p-5 ${metallicTheme}-liner-box group relative overflow-hidden flex flex-col justify-between ${
              isLight
                ? "bg-amber-50/70 hover:bg-amber-100/60 text-zinc-900 shadow-md"
                : "bg-zinc-950/80 hover:bg-black text-white"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p
                    className={`text-xs font-mono uppercase tracking-widest font-bold ${isLight ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    Total COGS (GOC)
                  </p>
                  <h3
                    className={`text-3xl font-sans font-black mt-1.5 ${isLight ? "text-zinc-900" : "text-3d-gold drop-shadow-md"}`}
                  >
                    EUR {totalCogsActiveDay.toLocaleString()}
                  </h3>
                  <span
                    className={`inline-flex mt-1 text-xs font-mono font-bold ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    Weekly: EUR {totalCogsWeek.toLocaleString()}
                  </span>
                </div>
                <div
                  className={`p-2.5 border transition-all duration-300 rounded-xl ${
                    isLight
                      ? "bg-zinc-100 border-zinc-200 text-purple-600 group-hover:bg-purple-500 group-hover:text-white"
                      : "bg-zinc-950 border-zinc-800 text-purple-400 group-hover:bg-purple-500 group-hover:text-white"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </div>
              </div>

              {/* Supplier Breakdowns */}
              <div className="mt-4 space-y-2 text-xs font-sans">
                <div>
                  <div
                    className={`flex justify-between font-mono ${isLight ? "text-zinc-600 text-zinc-600 font-semibold" : "text-zinc-400"}`}
                  >
                    <span>Tazaki (Ingredients)</span>
                    <span
                      className={`font-semibold ${isLight ? "text-zinc-900" : "text-zinc-200"}`}
                    >
                      EUR {activeLog.cogs.tazaki.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`w-full h-1 rounded-full overflow-hidden mt-0.5 ${isLight ? "bg-zinc-200" : "bg-zinc-900"}`}
                  >
                    <div
                      className="bg-orange-500 h-full rounded-full"
                      style={{
                        width: `${Math.min((activeLog.cogs.tazaki / totalCogsActiveDay) * 100 || 0, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    className={`flex justify-between font-mono ${isLight ? "text-zinc-600 text-zinc-600 font-semibold" : "text-zinc-400"}`}
                  >
                    <span>Sysco (Ssh Grains)</span>
                    <span
                      className={`font-semibold ${isLight ? "text-zinc-900" : "text-zinc-200"}`}
                    >
                      EUR {activeLog.cogs.sysco.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`w-full h-1 rounded-full overflow-hidden mt-0.5 ${isLight ? "bg-zinc-200" : "bg-zinc-900"}`}
                  >
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{
                        width: `${Math.min((activeLog.cogs.sysco / totalCogsActiveDay) * 100 || 0, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    className={`flex justify-between font-mono ${isLight ? "text-zinc-600 text-zinc-600 font-semibold" : "text-zinc-400"}`}
                  >
                    <span>Bulza (Display Box)</span>
                    <span
                      className={`font-semibold ${isLight ? "text-zinc-900" : "text-zinc-200"}`}
                    >
                      EUR {activeLog.cogs.bulza.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`w-full h-1 rounded-full overflow-hidden mt-0.5 ${isLight ? "bg-zinc-200" : "bg-zinc-900"}`}
                  >
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{
                        width: `${Math.min((activeLog.cogs.bulza / totalCogsActiveDay) * 100 || 0, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    className={`flex justify-between font-mono ${isLight ? "text-zinc-600 text-zinc-600 font-semibold" : "text-zinc-400"}`}
                  >
                    <span>Sticker (Thermal Label)</span>
                    <span
                      className={`font-semibold ${isLight ? "text-zinc-900" : "text-zinc-200"}`}
                    >
                      EUR {activeLog.cogs.sticker.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`w-full h-1 rounded-full overflow-hidden mt-0.5 ${isLight ? "bg-zinc-200" : "bg-zinc-900"}`}
                  >
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{
                        width: `${Math.min((activeLog.cogs.sticker / totalCogsActiveDay) * 100 || 0, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </motion.div>
        </div>

        {/* Flexible region: AI Summary + Charts + Branch Compare share the remaining viewport space */}
        <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-1 xl:grid-cols-2 gap-3">
          {/* Left column: AI Shift Summary + Performance Index chart */}
          <div className="flex flex-col min-h-0 gap-3 overflow-hidden">
            {/* Real-time AI Operations Shift Summary */}
            <div
              id="ai-shift-summary"
              className={`shrink-0 crystal-liner-box p-4 overflow-hidden relative font-sans transition-all duration-300 ${
                isLight ? "" : "drop-shadow-xl"
              }`}
            >
              <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b ${
                  isLight ? "border-zinc-200" : "border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 border rounded-2xl transition-all duration-300 ${
                      isLight
                        ? "bg-orange-50 border-orange-100 text-orange-600"
                        : "bg-orange-950/30 border-orange-900/40 text-orange-400"
                    }`}
                  >
                    <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-sans font-bold flex items-center gap-2 ${isLight ? "text-zinc-900" : "text-3d-gold drop-shadow-md"}`}
                    >
                      AI Live Shift Summary Report
                      <span
                        className={`px-2 py-0.5 rounded border text-xs font-mono uppercase tracking-widest font-bold ${
                          isLight
                            ? "bg-orange-50 border-orange-200 text-orange-700"
                            : "bg-orange-500/10 border-orange-500/30 text-orange-400"
                        }`}
                      >
                        Live Analysis
                      </span>
                    </h3>
                    <p className="subtitle text-xs text-zinc-500">
                      Cognitive evaluation of performance metrics for{" "}
                      {selectedBranch} on {activeLog.day} ({activeLog.date})
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchShiftSummary}
                  disabled={summaryLoading}
                  type="button"
                  className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 border  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:shadow-md disabled:opacity-50 ${
                    isLight
                      ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200"
                      : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  {summaryLoading ? (
                    <>
                      <span className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-3.5 h-3.5" />
                      Regenerate Feedback
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 max-h-[120px] overflow-y-auto">
                {summaryLoading ? (
                  <div className="space-y-3 py-2 animate-pulse">
                    <div
                      className={`h-4 rounded-full w-3/4 ${isLight ? "bg-zinc-100" : "bg-zinc-800"}`}
                    />
                    <div
                      className={`h-4 rounded-full w-5/6 ${isLight ? "bg-zinc-100" : "bg-zinc-800"}`}
                    />
                    <div
                      className={`h-4 rounded-full w-2/3 ${isLight ? "bg-zinc-100" : "bg-zinc-800"}`}
                    />
                  </div>
                ) : summaryError ? (
                  <div
                    className={`p-4 rounded-2xl border text-xs font-mono/80 ${
                      isLight
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-rose-950/20 border-rose-900/40 text-rose-400"
                    }`}
                  >
                    Failed to fetch live summary feedback: {summaryError}.
                    Please verify your API key is correctly configured.
                  </div>
                ) : (
                  <div
                    className={`p-3 rounded-2xl border relative overflow-hidden transition-colors ${
                      isLight
                        ? "bg-orange-50/20 border-orange-100/70 text-zinc-800"
                        : "bg-orange-950/5 border-orange-900/10 text-zinc-300"
                    }`}
                  >
                    <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/5 rounded-full filter blur-xl pointer-events-none" />
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans relative z-10 italic">
                      "
                      {shiftSummary ||
                        "Selecting metrics and compiling the shift trajectory summary..."}
                      "
                    </p>

                    <div className="flex flex-wrap items-center gap-6 mt-3 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            Math.min(
                              100,
                              Math.max(
                                50,
                                Math.round(
                                  95 -
                                    (activeLog.waste / (activeLog.sales || 1)) *
                                      110,
                                ),
                              ),
                            ) >= 80
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <span>
                          Efficiency Score:{" "}
                          {Math.min(
                            100,
                            Math.max(
                              50,
                              Math.round(
                                95 -
                                  (activeLog.waste / (activeLog.sales || 1)) *
                                    110,
                              ),
                            ),
                          )}
                          %
                        </span>
                      </div>
                      <div>Sales: EUR {activeLog.sales.toLocaleString()}</div>
                      <div>Waste: EUR {activeLog.waste.toFixed(2)}</div>
                      <div>
                        Production Items: {activeLog.productionMade}/
                        {activeLog.productionTarget}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Production & Revenue Chart */}
            <div
              className={`flex-1 min-h-0 flex flex-col ${metallicTheme}-liner-box p-4 transition-all duration-300 ${isLight ? "bg-amber-50/20" : "bg-zinc-950/80"}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-lg font-sans font-bold ${isLight ? "text-zinc-900" : "text-3d-gold drop-shadow-md"}`}
                    >
                      Performance Index
                    </h3>
                    <span
                      className={`text-xs border font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                        isLight
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-emerald-950/40 text-emerald-400 border-emerald-900/40"
                      }`}
                    >
                      {chartView === "weekly"
                        ? "Week Overview"
                        : "Today Overview"}
                    </span>
                  </div>
                  <p className="subtitle text-xs text-zinc-500 uppercase font-semibold">
                    {chartView === "weekly"
                      ? "7-Day operational flow analysis"
                      : "Correlated hourly view of cumulative metrics"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className={`btn-interactive px-3 py-1.5 text-xs uppercase tracking-wider rounded-lg font-mono font-bold transition-all ${ chartView === "hourly" ? "bg-amber-500 text-zinc-950 shadow-md" : isLight ? "text-zinc-500 hover:text-amber-700 hover:bg-white" : "text-zinc-400 hover:bg-zinc-800" }`} type="button" onClick={() => setChartView("hourly")}>
                    Hourly
                  </button>
                  <button className={`btn-interactive px-3 py-1.5 text-xs uppercase tracking-wider rounded-lg font-mono font-bold transition-all ${ chartView === "weekly" ? "bg-amber-500 text-zinc-950 shadow-md" : isLight ? "text-zinc-500 hover:text-amber-700 hover:bg-white" : "text-zinc-400 hover:bg-zinc-800" }`} type="button" onClick={() => setChartView("weekly")}>
                    Weekly
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-[140px] w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartView === "weekly" ? weeklyData : hourlyData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorSales"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorProd"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={isLight ? "#e4e4e7" : "#27272a"}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: isLight ? "#71717a" : "#a1a1aa",
                        fontSize: 15,
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: isLight ? "#71717a" : "#a1a1aa",
                        fontSize: 15,
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: isLight ? "#71717a" : "#a1a1aa",
                        fontSize: 15,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isLight ? "#fff" : "#18181b",
                        borderRadius: "12px",
                        border: `1px solid ${isLight ? "#e4e4e7" : "#27272a"}`,
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="Sales"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="Sales"
                      stroke="none"
                      fill="url(#colorSales)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="Production"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="Production"
                      stroke="none"
                      fill="url(#colorProd)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right column: Branch Compare config + bar chart + champion breakdown */}
          <div className="flex flex-col min-h-0 gap-3 overflow-y-auto xl:overflow-hidden">
            {/* Branch Compare Config Header */}
            <div
              className={`shrink-0 rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 ${isLight ? "bg-white border border-zinc-200" : "bg-zinc-950 border border-zinc-900 shadow-xl shadow-amber-500/5"}`}
            >
              <div>
                <h3
                  className={`text-lg font-sans font-bold flex items-center gap-2 ${isLight ? "text-zinc-900" : "text-white"}`}
                >
                  <Layers className="w-5 h-5 text-amber-500" />
                  Branch Compare
                </h3>
                <p className="text-xs text-zinc-500 mt-2">
                  Measure relative performance between individual stores and
                  benchmarks.
                </p>

                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                      Branch A
                    </label>
                    <select className={`input-gold-glow w-full px-3 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${ isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900 border-zinc-800 text-white" }`} value={compareBranchA} onChange={(e) => {
                        setCompareBranchA(e.target.value);
                        setCompareMode("twoBranches");
                      }}>
                      <option value="m_s_cork">M&S Cork</option>
                      <option value="tesco_cork">Tesco Cork</option>
                      <option value="tesco_mahon">Tesco Mahon</option>
                    </select>
                  </div>
                  <div className="flex justify-center">
                    <span className="text-zinc-400 font-mono text-xs font-bold bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
                      VS
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                      Branch B
                    </label>
                    <select className={`input-gold-glow w-full px-3 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${ isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900 border-zinc-800 text-white" }`} value={compareBranchB} onChange={(e) => {
                        setCompareBranchB(e.target.value);
                        setCompareMode("twoBranches");
                      }}>
                      <option value="m_s_cork">M&S Cork</option>
                      <option value="tesco_cork">Tesco Cork</option>
                      <option value="tesco_mahon">Tesco Mahon</option>
                    </select>
                  </div>
                </div>
              </div>
              <button className={`btn-interactive w-full mt-6 px-4 py-3 rounded-xl border font-bold text-sm transition-all ${ compareMode === "all" ? "bg-amber-500 text-zinc-950 border-amber-600" : isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200" : "bg-zinc-900 bg-opacity-60 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white" }`} onClick={() =>
                  setCompareMode(compareMode === "all" ? "twoBranches" : "all")
                }>
                {compareMode === "all"
                  ? "Viewing All Active Branches"
                  : "View All Global Branches"}
              </button>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              {/* Comparison Dashboard Grid */}
              <div className="flex-1 min-h-0 grid grid-cols-1 2xl:grid-cols-3 gap-3 z-10 relative">
                {/* Left Column: Recharts Comparison Visualizer BarChart */}
                <div
                  className={`2xl:col-span-2 min-h-0 flex flex-col p-3 rounded-2xl border transition-colors ${
                    isLight
                      ? "bg-zinc-50 border-zinc-200 shadow-inner"
                      : "bg-zinc-950/40 border-zinc-900"
                  }`}
                >
                  <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex items-center justify-between mb-2 shrink-0">
                      <span
                        className={`text-xs font-mono uppercase font-bold tracking-widest pl-1 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}
                      >
                        Dynamic Comparison Bar
                      </span>
                      <span
                        className={`text-xs border rounded px-2.5 py-0.5 font-mono ${
                          isLight
                            ? "bg-white border-zinc-200 text-zinc-700 shadow-sm"
                            : "bg-zinc-900 border-zinc-800 text-zinc-300"
                        }`}
                      >
                        Scale:{" "}
                        {branchCompareMetric === "sales"
                          ? "Euro (EUR)"
                          : branchCompareMetric === "production"
                            ? "Units (Pcs)"
                            : branchCompareMetric === "waste"
                              ? "Percentage (%)"
                              : "Index Points (0-100)"}
                      </span>
                    </div>

                    <div className="flex-1 min-h-[140px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={branchPerformanceData}
                          margin={{ top: 15, right: 10, left: 10, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="gradMS"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#f59e0b"
                                stopOpacity={0.9}
                              />
                              <stop
                                offset="100%"
                                stopColor="#d97706"
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                            <linearGradient
                              id="gradTescoCork"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity={0.9}
                              />
                              <stop
                                offset="100%"
                                stopColor="#059669"
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                            <linearGradient
                              id="gradTescoMahon"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#a855f7"
                                stopOpacity={0.9}
                              />
                              <stop
                                offset="100%"
                                stopColor="#7c3aed"
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                            <linearGradient
                              id="gradAvg"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#3b82f6"
                                stopOpacity={0.9}
                              />
                              <stop
                                offset="100%"
                                stopColor="#2563eb"
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={isLight ? "#e2e2e5" : "#222"}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: isLight ? "#4f4f52" : "#a1a1aa",
                              fontSize: 15,
                              fontWeight: "bold",
                            }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: isLight ? "#71717a" : "#71717a",
                              fontSize: 15,
                            }}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div
                                    className={`border p-4 rounded-xl shadow-xl transition-all ${
                                      isLight
                                        ? "bg-white border-zinc-200 text-zinc-900"
                                        : "bg-zinc-950 border-zinc-800 text-white"
                                    }`}
                                  >
                                    <p
                                      className={`text-xs font-mono uppercase font-bold select-none ${isLight ? "text-zinc-400" : "text-zinc-500"}`}
                                    >
                                      {data.type}
                                    </p>
                                    <p
                                      className={`text-sm font-extrabold mt-1 ${isLight ? "text-zinc-900" : "text-3d-gold drop-shadow-md"}`}
                                    >
                                      {data.fullName}
                                    </p>
                                    <div className="mt-2 space-y-1.5 font-mono text-xs">
                                      <div className="flex justify-between gap-8">
                                        <span
                                          className={
                                            isLight
                                              ? "text-zinc-500"
                                              : "text-zinc-400"
                                          }
                                        >
                                          Sales revenue:
                                        </span>
                                        <span className="font-bold text-amber-600 dark:text-amber-500">
                                          EUR {data.sales.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between gap-8">
                                        <span
                                          className={
                                            isLight
                                              ? "text-zinc-500"
                                              : "text-zinc-400"
                                          }
                                        >
                                          Rolled Output:
                                        </span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                          {data.production.toLocaleString()} Pcs
                                        </span>
                                      </div>
                                      <div className="flex justify-between gap-8">
                                        <span
                                          className={
                                            isLight
                                              ? "text-zinc-500"
                                              : "text-zinc-400"
                                          }
                                        >
                                          Waste Rate:
                                        </span>
                                        <span className="font-bold text-rose-600 dark:text-rose-450">
                                          {data.wastePct}%
                                        </span>
                                      </div>
                                      <div
                                        className={`flex justify-between gap-8 pt-1 border-t ${isLight ? "border-zinc-200" : "border-zinc-900"}`}
                                      >
                                        <span
                                          className={
                                            isLight
                                              ? "text-zinc-600 text-zinc-600"
                                              : "text-zinc-300"
                                          }
                                        >
                                          Efficiency Score:
                                        </span>
                                        <span className="font-extrabold text-blue-600 dark:text-blue-400">
                                          {data.efficiencyScore}/100
                                        </span>
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
                              branchCompareMetric === "sales"
                                ? "sales"
                                : branchCompareMetric === "production"
                                  ? "production"
                                  : branchCompareMetric === "waste"
                                    ? "wastePct"
                                    : "efficiencyScore"
                            }
                            radius={[6, 6, 0, 0]}
                            maxBarSize={60}
                          >
                            {branchPerformanceData.map((entry, index) => (
                              <Cell
                                key={`overview-cell-${index}-${entry.id || entry.name}`}
                                fill={entry.fill || entry.color}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Micro comparison labels */}
                  <div
                    className={`shrink-0 grid ${branchPerformanceData.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-2 border-t pt-2 mt-2 text-center text-xs font-sans ${
                      isLight ? "border-zinc-200" : "border-zinc-900/80"
                    }`}
                  >
                    {branchPerformanceData.map((branch) => (
                      <div
                        key={branch.id}
                        className="flex flex-col items-center"
                      >
                        <span
                          className={`font-semibold ${isLight ? "text-zinc-600" : "text-zinc-500"}`}
                        >
                          {branch.name}
                        </span>
                        <span
                          className="font-mono font-bold mt-0.5"
                          style={{ color: branch.color }}
                        >
                          {branchCompareMetric === "sales"
                            ? `EUR ${branch.sales.toLocaleString()}`
                            : branchCompareMetric === "production"
                              ? `${branch.production.toLocaleString()} Pcs`
                              : branchCompareMetric === "waste"
                                ? `${branch.wastePct}%`
                                : `${branch.efficiencyScore} pts`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Championship & Performance Breakdown */}
                <div className="min-h-0 flex flex-col justify-between gap-3 overflow-y-auto 2xl:overflow-hidden">
                  {/* Champion Branch Banner Card */}
                  <div
                    className={`p-3 rounded-2xl border relative overflow-hidden flex-1 flex flex-col justify-between transition-all duration-300 ${
                      isLight
                        ? "bg-zinc-50 border-emerald-200 shadow-sm shadow-emerald-500/5"
                        : "bg-zinc-950 border-emerald-950/80"
                    }`}
                  >
                    {/* Subtle visual gradient glow for the champion */}
                    <div className="absolute right-0 bottom-0 w-36 h-36 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full filter blur-xl pointer-events-none" />

                    <div>
                      <div
                        className={`flex items-center justify-between pb-3 border-b ${isLight ? "border-zinc-200" : "border-zinc-900/80"}`}
                      >
                        <span
                          className={`text-xs font-mono uppercase border px-2 py-0.5 rounded-full font-extrabold tracking-widest flex items-center gap-1 leading-none shadow-sm ${
                            isLight
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                              : "bg-emerald-950/45 text-emerald-400 border-emerald-900/60"
                          }`}
                        >
                          Peak Efficiency Store
                        </span>
                        <span
                          className={`font-mono font-extrabold text-xs ${isLight ? "text-emerald-700" : "text-emerald-400"}`}
                        >
                          {championBranch.efficiencyScore}%
                        </span>
                      </div>

                      <div className="mt-2">
                        <h4
                          className={`text-sm font-extrabold ${isLight ? "text-zinc-900" : "text-3d-gold drop-shadow-md"}`}
                        >
                          {championBranch.fullName}
                        </h4>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5 leading-none">
                          {championBranch.type}
                        </p>

                        <p
                          className={`text-xs mt-2 leading-relaxed ${isLight ? "text-zinc-600 text-zinc-600" : "text-zinc-400"}`}
                        >
                          Analyzing overall labor costs, high-premium customer
                          transaction margins, and minimal seafood waste,{" "}
                          <strong
                            className={`font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}
                          >
                            {championBranch.name}
                          </strong>{" "}
                          holds the highest corporate return ratio at{" "}
                          <strong
                            className={`font-mono ${isLight ? "text-zinc-900" : "text-3d-gold drop-shadow-md"}`}
                          >
                            EUR {championBranch.laborProd}/hr
                          </strong>{" "}
                          yield per employee hour.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`mt-3 pt-2.5 border-t grid grid-cols-2 gap-3 text-left ${isLight ? "border-zinc-200" : "border-zinc-900/80"}`}
                    >
                      <div>
                        <span className="text-xs font-mono text-zinc-500 uppercase block tracking-wider">
                          Labor Yield
                        </span>
                        <span
                          className={`text-xs font-mono font-extrabold ${isLight ? "text-zinc-800" : "text-white"}`}
                        >
                          EUR {championBranch.laborProd}/hr
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-mono text-zinc-500 uppercase block tracking-wider">
                          Waste Control
                        </span>
                        <span
                          className={`text-xs font-mono font-extrabold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}
                        >
                          {Math.max(
                            0,
                            Math.round(100 - championBranch.wastePct),
                          )}
                          % Control
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Performance Note */}
                  <div
                    className={`shrink-0 p-3 rounded-xl border text-xs leading-relaxed font-sans transition-colors ${
                      isLight
                        ? "bg-zinc-50 border-zinc-200 text-zinc-600"
                        : "bg-zinc-950 border-zinc-900 text-zinc-400"
                    }`}
                  >
                    <span className="font-mono text-amber-500 dark:text-amber-400 font-bold block mb-1 uppercase tracking-wide text-xs">
                      Multi-Branch Note
                    </span>
                    Sell products in Marks & Spencer are gourmet luxury lines
                    featuring <strong>75% average margins</strong>. Tesco stores
                    support high-volume meal deals and family-packed Trays with{" "}
                    <strong>78% labor optimization metrics</strong>. Staffing
                    schedules must remain aligned with peak regional purchase
                    hours.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
