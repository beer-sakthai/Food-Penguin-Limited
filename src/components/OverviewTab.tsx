import { useMemo, useState } from "react";
import { Activity, Calendar, Clock, Package, TrendingUp, Trash2, WalletCards, type LucideIcon } from "lucide-react";
import type { CompanyTarget, CoreMetrics, DailyOperationalLog, InventoryItem, SalesOrder } from "../types";
import { KpiCard } from "./overview/KpiCard";
import { OperationalLogForm } from "./overview/OperationalLogForm";

interface OverviewTabProps {
  metrics: CoreMetrics;
  onNavigateTab: (tabId: string) => void;
  targets: CompanyTarget[];
  userRole: "Admin" | "Manager" | "Staff" | "User";
  availableTabIds: string[];
  onUpdateMetrics: (newMetrics: Partial<CoreMetrics>) => void;
  irelandTime?: string;
  weeklyLogs: DailyOperationalLog[];
  onAddOrUpdateLog: (log: DailyOperationalLog) => void;
  selectedWeekRange: string;
  onSelectedWeekRangeChange: (range: string) => void;
  orders: SalesOrder[];
  selectedBranch: string;
  theme?: "dark" | "light";
  lowStockItems?: InventoryItem[];
}

export default function OverviewTab({
  metrics,
  onNavigateTab,
  targets,
  userRole,
  availableTabIds,
  onUpdateMetrics,
  irelandTime,
  weeklyLogs,
  onAddOrUpdateLog,
  selectedWeekRange,
  onSelectedWeekRangeChange,
  selectedBranch,
  theme = "dark",
  lowStockItems = [],
}: OverviewTabProps) {
  const isLight = theme === "light";
  const [selectedDay, setSelectedDay] = useState<DailyOperationalLog["day"]>("Sun");
  const [isEntryOpen, setIsEntryOpen] = useState(false);

  const activeLog = weeklyLogs.find(log => log.day === selectedDay) ?? weeklyLogs[weeklyLogs.length - 1];
  if (!activeLog) return null;

  const totalCogs = Object.values(activeLog.cogs).reduce((sum, cost) => sum + cost, 0);
  const trendData = useMemo(() => weeklyLogs.map(log => ({
    name: log.day,
    Sales: log.sales,
    Production: log.productionMade,
    Waste: log.waste,
    Hours: log.hours,
    COGS: Object.values(log.cogs).reduce((sum, cost) => sum + cost, 0),
  })), [weeklyLogs]);

  const kpis: Array<{ label: string; value: string; detail: string; icon: LucideIcon; tab?: string }> = [
    { label: "Revenue", value: `€${activeLog.sales.toLocaleString()}`, detail: "+8.5% vs daily average", icon: TrendingUp, tab: "Sell" },
    { label: "Production", value: `${activeLog.productionMade.toLocaleString()} units`, detail: `Target ${activeLog.productionTarget.toLocaleString()} units`, icon: Package, tab: "Production" },
    { label: "Waste", value: `€${activeLog.waste.toFixed(2)}`, detail: "Within daily control limit", icon: Trash2, tab: "Waste" },
    { label: "Worked hours", value: `${activeLog.hours} hrs`, detail: "Staffing is on plan", icon: Clock, tab: "Hours" },
    { label: "COGS", value: `€${totalCogs.toLocaleString()}`, detail: `Primary: ${activeLog.supplierName}`, icon: WalletCards },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
            Today · {irelandTime || "Dublin time"}
          </p>
          <h1 className={`mt-0.5 text-xl font-bold ${isLight ? "text-zinc-900" : "text-white"}`}>
            {selectedBranch.replace("Marks & Spencer", "M&S")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedWeekRange} onChange={e => onSelectedWeekRangeChange(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-bold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
            <option value="2026-06-15 to 2026-06-21">Jun 15–21</option>
            <option value="2026-06-22 to 2026-06-28">Jun 22–28</option>
            <option value="2026-06-08 to 2026-06-14">Jun 8–14</option>
          </select>
          <button type="button" onClick={() => setIsEntryOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
            <Activity className="h-3.5 w-3.5" />Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => kpi.tab && onNavigateTab(kpi.tab)}
            className={`text-left rounded-xl border p-4 transition-colors ${isLight ? "bg-white border-zinc-200 hover:border-zinc-300" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"}`}
          >
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
              <kpi.icon className="w-3.5 h-3.5" />
              {kpi.label}
            </div>
            <p className={`mt-2 text-2xl font-bold ${isLight ? "text-zinc-900" : "text-white"}`}>{kpi.value}</p>
            <p className="mt-1 text-xs text-zinc-500">{kpi.detail}</p>
          </button>
        ))}
      </div>

      <div className={`rounded-xl border p-4 ${isLight ? "bg-white border-zinc-200" : "bg-zinc-900 border-zinc-800"}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold">Daily performance</span>
          <div className="flex gap-1">
            {weeklyLogs.map(log => (
              <button
                key={log.day}
                type="button"
                onClick={() => setSelectedDay(log.day)}
                className={`px-2 py-1 text-xs font-medium rounded-md ${selectedDay === log.day ? (isLight ? "bg-zinc-900 text-white" : "bg-white text-zinc-900") : (isLight ? "text-zinc-500 hover:bg-zinc-100" : "text-zinc-500 hover:bg-zinc-800")}`}
              >
                {log.day}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 w-full">
          {/* Chart will be rendered here; for now a placeholder grid */}
          <div className={`h-full rounded-lg border border-dashed flex items-center justify-center ${isLight ? "border-zinc-300 bg-zinc-50" : "border-zinc-700 bg-zinc-950"}`}>
            <span className="text-xs text-zinc-500">Weekly trend chart ({trendData.length} days)</span>
          </div>
        </div>
      </div>

      {isEntryOpen && (
        <OperationalLogForm
          isOpen={isEntryOpen}
          weeklyLogs={weeklyLogs}
          onClose={() => setIsEntryOpen(false)}
          onSave={(log) => {
            onAddOrUpdateLog(log);
            setIsEntryOpen(false);
          }}
        />
      )}
    </div>
  );
}
