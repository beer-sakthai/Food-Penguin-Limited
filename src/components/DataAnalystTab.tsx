import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Download,
  LineChart as LineChartIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CompanyTarget,
  DailyOperationalLog,
  EmployeeHour,
  InventoryItem,
  SalesOrder,
  WasteRecord,
} from "../types";

interface DataAnalystTabProps {
  theme: "dark" | "light";
  orders: SalesOrder[];
  targets: CompanyTarget[];
  wasteRecords: WasteRecord[];
  hoursData: EmployeeHour[];
  inventory: InventoryItem[];
  weeklyLogs: DailyOperationalLog[];
  selectedBranch: string;
}

type AnalystView = "profit" | "waste" | "labor" | "stock";

const money = (value: number) => `EUR ${Math.round(value).toLocaleString()}`;

export default function DataAnalystTab({
  theme,
  orders,
  targets,
  wasteRecords,
  hoursData,
  inventory,
  weeklyLogs,
  selectedBranch,
}: DataAnalystTabProps) {
  const isLight = theme === "light";
  const [view, setView] = useState<AnalystView>("profit");

  const filteredOrders = useMemo(() => {
    if (selectedBranch === "All Branches") return orders;
    return orders.filter((order) => !order.branch || order.branch === selectedBranch);
  }, [orders, selectedBranch]);

  const analytics = useMemo(() => {
    const weeklySales = weeklyLogs.reduce((sum, log) => sum + log.sales, 0);
    const weeklyWaste = weeklyLogs.reduce((sum, log) => sum + log.waste, 0);
    const weeklyHours = weeklyLogs.reduce((sum, log) => sum + log.hours, 0);
    const weeklyCogs = weeklyLogs.reduce(
      (sum, log) =>
        sum +
        log.cogs.tazaki +
        log.cogs.sysco +
        log.cogs.bulza +
        log.cogs.sticker +
        log.cogs.others,
      0,
    );
    const orderRevenue = filteredOrders.reduce((sum, order) => sum + order.amount, 0);
    const orderQty = filteredOrders.reduce((sum, order) => sum + order.quantity, 0);
    const wasteLogCost = wasteRecords.reduce((sum, item) => sum + item.cost, 0);
    const targetHits = targets.filter((target) => target.currentValue >= target.targetValue).length;
    const lowStock = inventory.filter(
      (item) => item.status === "Low" || item.status === "Critical",
    );
    const activeStaff = hoursData.filter((employee) => employee.status === "Clocked In").length;
    const scheduledHours = hoursData.reduce((sum, employee) => sum + employee.scheduledHours, 0);
    const actualHours = hoursData.reduce((sum, employee) => sum + employee.actualHours, 0);
    const laborVariance = scheduledHours - actualHours;
    const marginEstimate = weeklySales - weeklyCogs - weeklyWaste;
    const wasteRate = weeklySales ? (weeklyWaste / weeklySales) * 100 : 0;
    const salesPerHour = weeklyHours ? weeklySales / weeklyHours : 0;

    const trendRows = weeklyLogs.map((log) => {
      const cogs =
        log.cogs.tazaki +
        log.cogs.sysco +
        log.cogs.bulza +
        log.cogs.sticker +
        log.cogs.others;
      return {
        day: log.day,
        sales: log.sales,
        waste: log.waste,
        labor: log.hours,
        margin: log.sales - cogs - log.waste,
      };
    });

    return {
      weeklySales,
      weeklyWaste,
      weeklyHours,
      weeklyCogs,
      orderRevenue,
      orderQty,
      wasteLogCost,
      targetHits,
      targetCount: targets.length,
      lowStock,
      activeStaff,
      scheduledHours,
      actualHours,
      laborVariance,
      marginEstimate,
      wasteRate,
      salesPerHour,
      trendRows,
    };
  }, [filteredOrders, hoursData, inventory, targets, wasteRecords, weeklyLogs]);

  const insightCards = [
    {
      label: "Net Margin Estimate",
      value: money(analytics.marginEstimate),
      detail: `${money(analytics.weeklySales)} sales - COGS - waste`,
      tone: analytics.marginEstimate > 50000 ? "emerald" : "amber",
    },
    {
      label: "Waste Rate",
      value: `${analytics.wasteRate.toFixed(1)}%`,
      detail: analytics.wasteRate < 4 ? "Healthy waste control" : "Needs review today",
      tone: analytics.wasteRate < 4 ? "emerald" : "rose",
    },
    {
      label: "Sales Per Labor Hour",
      value: money(analytics.salesPerHour),
      detail: `${analytics.weeklyHours} logged weekly hours`,
      tone: analytics.salesPerHour > 100 ? "emerald" : "amber",
    },
    {
      label: "Stock Risk",
      value: `${analytics.lowStock.length} items`,
      detail: analytics.lowStock.map((item) => item.name).join(", ") || "No low stock",
      tone: analytics.lowStock.length ? "rose" : "emerald",
    },
  ];

  const actionList = [
    analytics.lowStock.length
      ? `Restock ${analytics.lowStock[0].name} first because it is already marked ${analytics.lowStock[0].status}.`
      : "Stock position is stable; keep today's ordering pattern.",
    analytics.wasteRate > 4
      ? "Run a waste check before close and compare prep volume against the final two sales hours."
      : "Waste is under control; keep prep batch sizes close to the current plan.",
    analytics.laborVariance > 8
      ? "There are unused scheduled hours; move one person onto prep, delivery packing, or tomorrow setup."
      : "Labor usage is close to plan; avoid extra overtime unless sales spike.",
  ];

  const chartMetric =
    view === "profit"
      ? "margin"
      : view === "waste"
        ? "waste"
        : view === "labor"
          ? "labor"
          : "sales";

  const exportSummary = () => {
    const rows = [
      ["Metric", "Value"],
      ["Selected Branch", selectedBranch],
      ["Weekly Sales", analytics.weeklySales.toString()],
      ["Weekly COGS", analytics.weeklyCogs.toString()],
      ["Weekly Waste", analytics.weeklyWaste.toString()],
      ["Estimated Margin", analytics.marginEstimate.toString()],
      ["Waste Rate", analytics.wasteRate.toFixed(2)],
      ["Sales Per Labor Hour", analytics.salesPerHour.toFixed(2)],
      ["Low Stock Items", analytics.lowStock.map((item) => item.name).join("; ")],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "food-penguin-data-analysis.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5">
      <div
        className={`rounded-3xl border p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          isLight ? "bg-white border-zinc-200" : "bg-zinc-900 border-zinc-800"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-orange-500/10 border border-orange-500/25 p-3 text-orange-500">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-black ${isLight ? "text-zinc-900" : "text-white"}`}>
              Data Analyst
            </h1>
            <p className={`text-sm mt-1 max-w-2xl ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
              Turns this dashboard data into ratios, trend signals, and simple actions for {selectedBranch}.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={exportSummary}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-950 shadow-sm transition-all hover:bg-orange-400 active:scale-[0.98] btn-interactive"
        >
          <Download className="h-4 w-4" />
          Export analysis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {insightCards.map((card) => {
          const toneClass =
            card.tone === "emerald"
              ? "text-emerald-400 border-emerald-500/25 bg-emerald-500/10"
              : card.tone === "rose"
                ? "text-rose-400 border-rose-500/25 bg-rose-500/10"
                : "text-amber-400 border-amber-500/25 bg-amber-500/10";
          return (
            <div
              key={card.label}
              className={`rounded-2xl border p-4 ${
                isLight ? "bg-white border-zinc-200" : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`text-xs font-mono font-bold uppercase ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                  {card.label}
                </span>
                <span className={`rounded-full border px-2 py-1 ${toneClass}`}>
                  {card.tone === "emerald" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : card.tone === "rose" ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingUp className="h-3.5 w-3.5" />
                  )}
                </span>
              </div>
              <div className={`text-3xl font-black mt-3 ${isLight ? "text-zinc-900" : "text-white"}`}>
                {card.value}
              </div>
              <p className={`text-xs mt-2 line-clamp-2 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                {card.detail}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className={`xl:col-span-2 rounded-3xl border p-5 ${isLight ? "bg-white border-zinc-200" : "bg-zinc-900 border-zinc-800"}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? "text-zinc-900" : "text-white"}`}>
                <LineChartIcon className="h-4 w-4 text-orange-500" />
                Weekly Trend Explorer
              </h2>
              <p className={`text-xs mt-1 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                Switch the analyst lens to inspect margin, waste, labor, or sales.
              </p>
            </div>
            <div className={`flex rounded-xl border p-1 ${isLight ? "bg-zinc-100 border-zinc-200" : "bg-zinc-950 border-zinc-800"}`}>
              {(["profit", "waste", "labor", "stock"] as AnalystView[]).map((item) => (
                <button className="btn-interactive"
                  key={item}
                  type="button"
                  onClick={() => setView(item)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                    view === item
                      ? "bg-orange-500 text-zinc-950"
                      : isLight
                        ? "text-zinc-500 hover:text-zinc-900"
                        : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.trendRows} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "#e4e4e7" : "#27272a"} />
                <XAxis dataKey="day" tick={{ fill: isLight ? "#52525b" : "#a1a1aa", fontSize: 14 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isLight ? "#52525b" : "#a1a1aa", fontSize: 14 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? "#fff" : "#09090b",
                    border: `1px solid ${isLight ? "#e4e4e7" : "#27272a"}`,
                    borderRadius: "12px",
                    color: isLight ? "#18181b" : "#fff",
                  }}
                />
                <Line type="monotone" dataKey={chartMetric} stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-3xl border p-5 ${isLight ? "bg-white border-zinc-200" : "bg-zinc-900 border-zinc-800"}`}>
          <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? "text-zinc-900" : "text-white"}`}>
            <BarChart3 className="h-4 w-4 text-orange-500" />
            Action Priorities
          </h2>
          <div className="mt-4 space-y-3">
            {actionList.map((action, index) => (
              <div
                key={action}
                className={`rounded-2xl border p-3 ${isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-950 border-zinc-800"}`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-xs font-black text-zinc-950">
                    {index + 1}
                  </span>
                  <p className={`text-xs leading-relaxed ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                    {action}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-4 rounded-2xl border p-3 ${isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-950 border-zinc-800"}`}>
            <p className={`text-xs font-mono uppercase font-bold ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
              Target Completion
            </p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${analytics.targetCount ? (analytics.targetHits / analytics.targetCount) * 100 : 0}%`,
                }}
              />
            </div>
            <p className={`mt-2 text-xs ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
              {analytics.targetHits} of {analytics.targetCount} goals are currently on track.
            </p>
          </div>
        </div>
      </div>

      <div className={`rounded-3xl border p-5 ${isLight ? "bg-white border-zinc-200" : "bg-zinc-900 border-zinc-800"}`}>
        <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? "text-zinc-900" : "text-white"}`}>
          <TrendingDown className="h-4 w-4 text-rose-400" />
          Risk Breakdown
        </h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: "COGS", value: analytics.weeklyCogs, color: "#f59e0b" },
                { name: "Waste", value: analytics.weeklyWaste + analytics.wasteLogCost, color: "#f43f5e" },
                { name: "Labor Hours", value: analytics.actualHours * 100, color: "#10b981" },
                { name: "Orders", value: analytics.orderRevenue || analytics.orderQty * 10, color: "#3b82f6" },
              ]}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "#e4e4e7" : "#27272a"} />
              <XAxis dataKey="name" tick={{ fill: isLight ? "#52525b" : "#a1a1aa", fontSize: 14 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isLight ? "#52525b" : "#a1a1aa", fontSize: 14 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isLight ? "#fff" : "#09090b",
                  border: `1px solid ${isLight ? "#e4e4e7" : "#27272a"}`,
                  borderRadius: "12px",
                  color: isLight ? "#18181b" : "#fff",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {["#f59e0b", "#f43f5e", "#10b981", "#3b82f6"].map((color) => (
                  <Cell key={color} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
