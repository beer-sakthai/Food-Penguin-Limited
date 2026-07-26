// Saksee · 2026-07-25 · Targets + Production planner with editable daily target and past-week analytics
import React, { useMemo, useState } from "react";
import {
  ShieldCheck,
  ChefHat,
  Plus,
  CheckCircle2,
  Package,
  Target,
  TrendingUp,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  COGS_TARGET_PCT,
  COMMISSION_TARGET_PCT,
  WASTE_TARGET_PCT,
  NET_SALES_FACTOR,
} from "../business";
import type { CompanyTarget, Recipe, ProductionTask, DailyOperationalLog } from "../types";

interface TargetsProductionTabProps {
  targets: CompanyTarget[];
  onAddTarget: (t: Omit<CompanyTarget, "id">) => void;
  onUpdateTarget: (id: string, updates: Partial<CompanyTarget>) => void;
  recipes: Recipe[];
  tasks: ProductionTask[];
  onAddTask: (task: Omit<ProductionTask, "id">) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: ProductionTask["status"]) => void;
  weeklyLogs: DailyOperationalLog[];
  metrics: { productionItems: number; productionTarget: number };
}

const STATUS_COLORS: Record<string, string> = {
  "In Queue": "var(--muted)",
  "Cooking": "var(--warn)",
  "Prepared": "var(--ok)",
};

const CHEFS = ["Chef Skipper", "Chef Kowalski", "Chef Private", "Kitchen Aide Rico", "Alice Smith"];

export default function TargetsProductionTab({
  targets,
  onAddTarget,
  onUpdateTarget,
  recipes,
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  weeklyLogs,
  metrics,
}: TargetsProductionTabProps) {
  const [item, setItem] = useState("");
  const [assigned, setAssigned] = useState(CHEFS[0]);
  const [qty, setQty] = useState(1);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  // Production target from targets list
  const productionTargetObj = targets.find(
    (t) => t.category === "Production" && t.metric.toLowerCase().includes("items"),
  );
  const [draftTarget, setDraftTarget] = useState(productionTargetObj?.targetValue ?? metrics.productionTarget);

  const pastWeekData = useMemo(() => {
    return (weeklyLogs || []).map((l) => ({
      day: l.day,
      made: Number(l.productionMade) || 0,
      target: Number(l.productionTarget) || 0,
      sales: Number(l.sales) || 0,
      suggested: Math.round((Number(l.sales) || 0) * NET_SALES_FACTOR * (COGS_TARGET_PCT / 100) / 3), // rough items from sales value
    }));
  }, [weeklyLogs]);

  const avgMade = useMemo(
    () => (pastWeekData.length ? Math.round(pastWeekData.reduce((a, d) => a + d.made, 0) / pastWeekData.length) : 0),
    [pastWeekData],
  );
  const avgTarget = useMemo(
    () => (pastWeekData.length ? Math.round(pastWeekData.reduce((a, d) => a + d.target, 0) / pastWeekData.length) : 0),
    [pastWeekData],
  );
  const suggestedToday = useMemo(() => {
    const lastWeekAvg = avgMade || metrics.productionTarget;
    const salesToday = weeklyLogs[weeklyLogs.length - 1]?.sales || 7500;
    const demandFactor = salesToday / 7500;
    return Math.round(lastWeekAvg * demandFactor);
  }, [avgMade, metrics.productionTarget, weeklyLogs]);

  const applySuggested = () => {
    setDraftTarget(suggestedToday);
  };

  const saveTarget = () => {
    if (!productionTargetObj) {
      onAddTarget({
        name: "Daily Production Target",
        metric: "Items Made",
        targetValue: draftTarget,
        currentValue: metrics.productionItems,
        unit: "units",
        category: "Production",
        deadline: "Today, 21:05",
        date: new Date().toISOString().slice(0, 10),
      });
    } else {
      onUpdateTarget(productionTargetObj.id, { targetValue: draftTarget });
    }
  };

  const onTrack = targets.filter((t) => t.currentValue >= t.targetValue * 0.85).length;
  const avgProgress = targets.length
    ? Math.round(targets.reduce((a, t) => a + Math.min(100, (t.currentValue / (t.targetValue || 1)) * 100), 0) / targets.length)
    : 0;

  const totalMade = metrics.productionItems;
  const todayTarget = productionTargetObj?.targetValue ?? draftTarget;
  const completion = todayTarget ? Math.round((totalMade / todayTarget) * 100) : 0;

  const statusData = (["In Queue", "Cooking", "Prepared"] as const).map((status) => ({
    status,
    count: tasks.filter((t) => t.status === status).reduce((sum, t) => sum + t.quantity, 0),
  }));

  const submitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim()) return;
    onAddTask({
      itemName: item,
      assignedTo: assigned,
      quantity: qty,
      priority,
      status: "In Queue",
      date: new Date().toISOString().slice(0, 10),
    });
    setItem("");
    setQty(1);
  };

  const headerCards = [
    { label: "Today target", value: todayTarget.toLocaleString(), sub: "items planned" },
    { label: "Made today", value: totalMade.toLocaleString(), sub: "items" },
    { label: "Completion", value: `${completion}%`, sub: completion >= 90 ? "on track" : "behind", tone: completion >= 90 ? ("ok" as const) : ("warn" as const) },
    { label: "Active tasks", value: tasks.length, sub: "in queue + cooking" },
  ];

  const targetCards = [
    { label: "Active targets", value: targets.length, sub: "set up" },
    { label: "On track", value: onTrack, sub: "≥85% progress" },
    { label: "Avg progress", value: `${avgProgress}%`, sub: "across all" },
  ];

  const toneClasses = {
    ok: "text-[var(--ok)] bg-[var(--ok-soft)] ring-1 ring-[var(--ok-ring)]",
    warn: "text-[var(--warn)] bg-[var(--warn-soft)] ring-1 ring-[var(--warn-ring)]",
    bad: "text-[var(--bad)] bg-[var(--bad-soft)] ring-1 ring-[var(--bad-ring)]",
    accent: "text-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]/20",
  };

  return (
    <div className="page-shell space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">Targets & Production</h1>
            <p className="text-xs text-[var(--muted)]">
              Plan today · track tasks · COGS {COGS_TARGET_PCT}% · Commission {COMMISSION_TARGET_PCT}% · Waste {WASTE_TARGET_PCT}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {headerCards.map((k, i) => (
          <div key={i} className="card card-hover">
            <span className="metric-label">{k.label}</span>
            <div className="mt-2 metric-value">{k.value}</div>
            <div className={`mt-1 text-[11px] ${k.tone === "warn" ? "text-[var(--warn)]" : "text-[var(--muted)]"}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--muted)]" />
              <h2 className="section-title">Past week · production vs target (avg {avgMade.toLocaleString()} made · {avgTarget.toLocaleString()} target)</h2>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pastWeekData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="made" name="Made" radius={[4, 4, 0, 0]} fill="var(--accent)" />
                <Bar dataKey="target" name="Target" radius={[4, 4, 0, 0]} fill="var(--muted)" />
                <ReferenceLine y={avgMade} stroke="var(--ok)" strokeDasharray="3 3" label={{ value: "avg made", fill: "var(--ok)", fontSize: 10, position: "insideTopRight" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="section-title">Set today’s target</h2>
            </div>
            <label className="block text-xs text-[var(--muted)] mb-2">Production target (items)</label>
            <input
              type="number"
              min={0}
              value={draftTarget}
              onChange={(e) => setDraftTarget(Math.max(0, parseInt(e.target.value) || 0))}
              className="input w-full mb-3"
            />
            <div className="rounded-lg bg-[var(--panel)] p-3 mb-3">
              <p className="text-[11px] text-[var(--muted)] mb-1">Suggested from last week + today sales</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[var(--text)]">{suggestedToday.toLocaleString()} items</span>
                <button type="button" onClick={applySuggested} className="btn btn-ghost text-[10px]">Apply</button>
              </div>
            </div>
            <button type="button" onClick={saveTarget} className="btn btn-primary w-full justify-center">
              Save target
            </button>
          </div>

          <div className="card">
            <h2 className="section-title mb-4">Task status</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Items" radius={[6, 6, 0, 0]}>
                    {statusData.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.status] || "var(--muted)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add production task
          </h2>
          <form onSubmit={submitTask} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Item (e.g. Tokyo Dragon Roll)"
              className="md:col-span-2 input"
            />
            <select value={assigned} onChange={(e) => setAssigned(e.target.value)} className="select">
              {CHEFS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="input"
            />
            <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="select">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button type="submit" className="md:col-span-5 btn btn-primary justify-center">
              Add task
            </button>
          </form>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="section-title">Active targets</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {targetCards.map((k, i) => (
              <div key={i} className="rounded-lg bg-[var(--panel)] p-3">
                <span className="text-[10px] text-[var(--muted)]">{k.label}</span>
                <div className="mt-1 text-lg font-semibold text-[var(--text)]">{k.value}</div>
                <div className="text-[10px] text-[var(--muted)]">{k.sub}</div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Metric</th>
                  <th className="text-right">Current</th>
                  <th className="text-right">Goal</th>
                  <th>Progress</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((t) => {
                  const pct = t.targetValue ? Math.min(100, Math.round((t.currentValue / t.targetValue) * 100)) : 0;
                  return (
                    <tr key={t.id}>
                      <td className="font-medium">{t.name}</td>
                      <td className="text-[var(--muted)]">{t.metric}</td>
                      <td className="text-right font-mono">{t.currentValue.toLocaleString()} {t.unit}</td>
                      <td className="text-right font-mono">{t.targetValue.toLocaleString()} {t.unit}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[var(--panel)] rounded overflow-hidden">
                            <div className="h-full bg-[var(--accent)] rounded-sm" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] font-mono text-[var(--muted)] w-9 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="font-mono text-[11px] text-[var(--muted)]">{new Date(t.deadline).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="section-title">Active production tasks</h2>
          <span className="text-[11px] text-[var(--muted)] ml-auto">{tasks.length} total</span>
        </div>
        {tasks.length === 0 ? (
          <div className="py-10 text-center text-xs text-[var(--muted)]">no tasks yet</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Assigned</th>
                <th className="text-right">Qty</th>
                <th>Status</th>
                <th>Priority</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium">{t.itemName}</td>
                  <td className="text-[var(--muted)]">{t.assignedTo}</td>
                  <td className="text-right font-mono">{t.quantity}</td>
                  <td>
                    <span className="pill" style={{ color: STATUS_COLORS[t.status] || "var(--muted)", background: "var(--panel)" }}>
                      {t.status}
                    </span>
                  </td>
                  <td className="text-[var(--muted)] capitalize">{t.priority}</td>
                  <td className="text-right">
                    {t.status !== "Prepared" && (
                      <button
                        type="button"
                        onClick={() => onUpdateTaskStatus(t.id, t.status === "In Queue" ? "Cooking" : "Prepared")}
                        className="btn btn-ghost text-[11px]"
                      >
                        Advance →
                      </button>
                    )}
                    {t.status === "Prepared" && <CheckCircle2 className="w-4 h-4 text-[var(--ok)] inline" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
