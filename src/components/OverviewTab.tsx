import { useMemo, useState } from "react";
import { Activity, BrainCircuit, Calendar, Clock, Package, Sparkles, TrendingUp, Trash2, WalletCards, type LucideIcon } from "lucide-react";
import type { CompanyTarget, CoreMetrics, DailyOperationalLog, InventoryItem, SalesOrder } from "../types";
import { ActionQueue } from "./overview/ActionQueue";
import { KpiCard } from "./overview/KpiCard";
import { OperationalLogForm } from "./overview/OperationalLogForm";
import { TrendPanel } from "./overview/TrendPanel";

interface OverviewTabProps {
  metrics: CoreMetrics;
  onNavigateTab: (tabId: string) => void;
  targets: CompanyTarget[];
  userRole: "Admin" | "Manager" | "Staff";
  onUpdateMetrics: (newMetrics: Partial<CoreMetrics>) => void;
  irelandTime?: string;
  weeklyLogs: DailyOperationalLog[];
  onAddOrUpdateLog: (log: DailyOperationalLog) => void;
  selectedWeekRange: string;
  onSelectedWeekRangeChange: (range: string) => void;
  orders: SalesOrder[];
  selectedBranch: string;
  theme?: "dark" | "light";
  metallicTheme?: "gold" | "silver" | "copper";
  lowStockItems?: InventoryItem[];
}

export default function OverviewTab({ metrics, onNavigateTab, irelandTime, weeklyLogs, onAddOrUpdateLog, selectedWeekRange, onSelectedWeekRangeChange, selectedBranch, theme = "dark", lowStockItems = [] }: OverviewTabProps) {
  const isLight = theme === "light";
  const [selectedDay, setSelectedDay] = useState<DailyOperationalLog["day"]>("Sun");
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryUpdatedAt, setSummaryUpdatedAt] = useState<string | null>(null);
  const activeLog = weeklyLogs.find(log => log.day === selectedDay) ?? weeklyLogs[weeklyLogs.length - 1];
  const totalCogs = activeLog ? Object.values(activeLog.cogs).reduce((sum, cost) => sum + cost, 0) : 0;
  const trendData = useMemo(() => weeklyLogs.map(log => ({ name: log.day, Sales: log.sales, Production: log.productionMade, Waste: log.waste, Hours: log.hours, COGS: Object.values(log.cogs).reduce((sum, cost) => sum + cost, 0) })), [weeklyLogs]);
  const requestSummary = async () => {
    setSummaryLoading(true); setSummaryError("");
    try { const response = await fetch("/api/gemini/shift-summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ branch: selectedBranch, metrics }) }); if (!response.ok) throw new Error(`Request failed (${response.status})`); const data = await response.json(); if (!data.summary) throw new Error("No insight was returned"); setSummary(data.summary); setSummaryUpdatedAt(new Intl.DateTimeFormat("en-IE", { hour: "2-digit", minute: "2-digit" }).format(new Date())); } catch (error) { setSummaryError(error instanceof Error ? error.message : "Unable to generate an insight"); } finally { setSummaryLoading(false); }
  };
  if (!activeLog) return null;
  const kpis: Array<{ label: string; value: string; detail: string; icon: LucideIcon; tone: "orange" | "emerald" | "rose" | "violet" | "amber"; tab?: string }> = [
    { label: "Revenue", value: `€${activeLog.sales.toLocaleString()}`, detail: "+8.5% vs daily average", icon: TrendingUp, tone: "orange", tab: "Sell" },
    { label: "Production", value: `${activeLog.productionMade.toLocaleString()} units`, detail: `Target ${activeLog.productionTarget.toLocaleString()} units`, icon: Package, tone: "emerald", tab: "Production" },
    { label: "Waste", value: `€${activeLog.waste.toFixed(2)}`, detail: "Within daily control limit", icon: Trash2, tone: "rose", tab: "Waste" },
    { label: "Worked hours", value: `${activeLog.hours} hrs`, detail: "Staffing is on plan", icon: Clock, tone: "amber", tab: "Hours" },
    { label: "COGS", value: `€${totalCogs.toLocaleString()}`, detail: `Primary: ${activeLog.supplierName}`, icon: WalletCards, tone: "violet" },
  ];
  return <div id="overview-viewport" className="space-y-6">
    <section className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 ${isLight ? "border-zinc-200 bg-white" : "border-zinc-800 bg-zinc-900"}`} aria-labelledby="today-heading">
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between"><div><div className="flex flex-wrap items-center gap-2 text-xs font-mono"><span className="rounded-full bg-orange-500/10 px-3 py-1 font-bold text-orange-500">TODAY</span>{irelandTime && <span className="text-zinc-500">Dublin {irelandTime}</span>}</div><h1 id="today-heading" className={`mt-3 text-3xl font-black tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>Today at {selectedBranch}</h1><p className="mt-2 max-w-2xl text-sm text-zinc-500">Command view for the selected operating day. Prioritise exceptions, then log the day’s figures.</p></div><div className={`min-w-72 rounded-2xl border p-4 ${isLight ? "border-zinc-200 bg-zinc-50" : "border-zinc-800 bg-zinc-950/60"}`}><label className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500"><Calendar className="h-3.5 w-3.5 text-orange-500" />Date range</label><select value={selectedWeekRange} onChange={event => onSelectedWeekRangeChange(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"><option value="2026-06-15 to 2026-06-21">Week 25 · Jun 15–21, 2026</option><option value="2026-06-22 to 2026-06-28">Week 26 · Jun 22–28, 2026</option><option value="2026-06-08 to 2026-06-14">Week 24 · Jun 8–14, 2026</option></select></div></div>
      <div className="relative mt-6 flex flex-col gap-4 lg:flex-row"><div className="flex flex-wrap gap-2 lg:w-2/3">{(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const).map(day => <button key={day} type="button" onClick={() => setSelectedDay(day)} className={`rounded-xl px-3 py-2 text-xs font-bold ${selectedDay === day ? "bg-orange-500 text-white" : isLight ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>{day}</button>)}</div><button type="button" onClick={() => setIsEntryOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"><Activity className="h-4 w-4" />Log daily figures</button></div>
    </section>
    <section aria-label="Today key performance indicators"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{kpis.map(({ tab, ...kpi }) => <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} detail={kpi.detail} icon={kpi.icon} tone={kpi.tone} isLight={isLight} onClick={tab ? () => onNavigateTab(tab) : undefined} />)}</div></section>
    <ActionQueue lowStockItems={lowStockItems} isLight={isLight} onReviewAlerts={() => onNavigateTab("Planning")} />
    <TrendPanel data={trendData} isLight={isLight} />
    <section className={`gold-liner-box p-5 md:p-6 ${isLight ? "bg-orange-50/60" : "bg-zinc-950"}`} aria-labelledby="ai-insight-heading"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="flex gap-3"><span className="rounded-xl bg-orange-500/15 p-2.5 text-orange-500"><BrainCircuit className="h-5 w-5" /></span><div><p className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-500">On-demand AI insight</p><h2 id="ai-insight-heading" className={`mt-1 text-lg font-black ${isLight ? "text-zinc-900" : "text-white"}`}>Shift summary</h2><p className="mt-1 text-xs text-zinc-500">Clearly labelled interpretation of today’s dashboard signals.</p></div></div><button type="button" disabled={summaryLoading} onClick={requestSummary} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"> <Sparkles className="h-4 w-4" />{summaryLoading ? "Generating…" : summary ? "Refresh insight" : "Generate insight"}</button></div>{summaryLoading && <p className="mt-5 text-sm text-zinc-500">Analysing operational signals…</p>}{summaryError && <p className="mt-5 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600">Could not generate the insight: {summaryError}</p>}{summary && <div className={`mt-5 rounded-2xl border p-4 text-sm leading-relaxed ${isLight ? "border-orange-100 bg-white text-zinc-700" : "border-zinc-800 bg-zinc-900 text-zinc-200"}`}><p>{summary}</p>{summaryUpdatedAt && <p className="mt-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500">Last updated {summaryUpdatedAt}</p>}</div>}</section>
    <OperationalLogForm isOpen={isEntryOpen} onClose={() => setIsEntryOpen(false)} weeklyLogs={weeklyLogs} onSave={onAddOrUpdateLog} />
  </div>;
}
