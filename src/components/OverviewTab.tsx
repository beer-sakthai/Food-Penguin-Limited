import { useMemo, useState } from "react";
import { Activity, Clock, Package, TrendingUp, Trash2, WalletCards, type LucideIcon } from "lucide-react";
import type { CompanyTarget, CoreMetrics, DailyOperationalLog, InventoryItem, SalesOrder } from "../types";
import { OperationalLogForm } from "./overview/OperationalLogForm";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
}: OverviewTabProps) {
  const isLight = theme === "light";
  const [selectedDay, setSelectedDay] = useState<DailyOperationalLog["day"]>("Sun");
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [metric, setMetric] = useState<"Sales" | "Production" | "Waste" | "Hours" | "COGS">("Sales");

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

  const colors = {
    Sales: "#0d9488",
    Production: "#059669",
    Waste: "#e11d48",
    Hours: "#d97706",
    COGS: "#6366f1",
  };

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
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--muted)]">
            Today · {irelandTime || "Dublin time"}
          </p>
          <h1 className="mt-0.5 text-xl font-bold text-[var(--text)]">
            {selectedBranch.replace("Marks & Spencer", "M&S")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedWeekRange} onChange={e => onSelectedWeekRangeChange(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs font-medium text-[var(--text)] focus:outline-none">
            <option value="2026-06-15 to 2026-06-21">Jun 15–21</option>
            <option value="2026-06-22 to 2026-06-28">Jun 22–28</option>
            <option value="2026-06-08 to 2026-06-14">Jun 8–14</option>
          </select>
          <button type="button" onClick={() => setIsEntryOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity">
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
            className="text-left rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)] transition-colors"
          >
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--muted)]">
              <kpi.icon className="w-3.5 h-3.5" />
              {kpi.label}
            </div>
            <p className="mt-2 text-2xl font-bold text-[var(--text)]">{kpi.value}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{kpi.detail}</p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-[var(--text)]">Weekly performance</span>
          <div className="flex gap-1">
            {(Object.keys(colors) as Array<keyof typeof colors>).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${metric === m ? "bg-[var(--panel)] text-[var(--text)]" : "text-[var(--muted)] hover:bg-[var(--panel)]"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#2a2e3b"} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <Tooltip cursor={{ fill: isLight ? "#f6f7f9" : "#1e212b" }} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} />
              <Bar dataKey={metric} fill={colors[metric]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
