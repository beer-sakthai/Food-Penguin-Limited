import React, { useMemo, useState } from "react";
import { Search, Lightbulb, TrendingUp, AlertTriangle, Target, Activity, Store } from "lucide-react";
import type { SalesOrder } from "../types";
import type { DailyOperationalLog } from "../types";

interface RagAnalyzerProps {
  metrics: {
    salesToday: number;
    cogsToday: number;
    wasteCost: number;
    productionItems: number;
    productionTarget: number;
    hoursScheduled: number;
    aiHealthScore: number;
  };
  orders: SalesOrder[];
  selectedBranch: string;
  weeklyLogs?: DailyOperationalLog[];
}

const KNOWLEDGE_BASE = [
  {
    id: "fpl-cogs-target",
    tags: ["cogs", "cost", "target", "margin"],
    text: "FPL target: COGS should be ~30% of net sales. Above 32% flags high cost pressure.",
    priority: 10,
  },
  {
    id: "fpl-waste-target",
    tags: ["waste", "cogs", "target", "production"],
    text: "FPL target: waste cost should be ~10% of COGS. Above 12% means overproduction or spoilage.",
    priority: 10,
  },
  {
    id: "fpl-commission",
    tags: ["commission", "retailer", "tesco", "marks", "spencer"],
    text: "Retailer commission is ~30% of gross sales. Net sales = gross minus commission.",
    priority: 8,
  },
  {
    id: "branch-cork",
    tags: ["cork", "tesco", "city", "green", "branch"],
    text: "Cork (Tesco Cork City) is the green branch. Track daily consistency and lunch rush sell-through.",
    priority: 6,
  },
  {
    id: "branch-mahon",
    tags: ["mahon", "tesco", "blue", "point", "branch"],
    text: "Mahon Point (Tesco Mahon Point) is the blue branch. Higher weekend traffic; adjust Friday/Saturday production up.",
    priority: 6,
  },
  {
    id: "branch-ms",
    tags: ["marks", "spencer", "m&s", "gold", "white", "premium", "branch"],
    text: "Marks & Spencer Cork City is the white/gold premium branch. Higher price points, tighter waste control needed.",
    priority: 6,
  },
  {
    id: "production-forecast",
    tags: ["production", "target", "forecast", "tomorrow"],
    text: "Production target should be 105–110% of expected sales units for the day, adjusted for weather and weekday pattern.",
    priority: 9,
  },
  {
    id: "waste-action",
    tags: ["waste", "action", "reduce", "production"],
    text: "If waste is high, reduce tomorrow's production target by 10–15% and push yesterday's bestsellers first.",
    priority: 9,
  },
  {
    id: "cogs-action",
    tags: ["cogs", "action", "supplier", "price", "portion"],
    text: "If COGS is high, review top-cost SKUs, renegotiate supplier prices, or reduce portion sizes on low-margin items.",
    priority: 9,
  },
  {
    id: "sales-action",
    tags: ["sales", "target", "promotion", "marketing"],
    text: "If sales are below target, run a lunch combo promotion or push top sellers through staff recommendations.",
    priority: 8,
  },
  {
    id: "hours-action",
    tags: ["hours", "labor", "staff", "schedule"],
    text: "Labor hours per €100 sales above 8 is high. Align staffing to expected sales curve.",
    priority: 7,
  },
  {
    id: "sunday-pattern",
    tags: ["sunday", "weekend", "pattern", "sales"],
    text: "Sunday often has the softest sales. Use it to clear weekend stock with targeted discounts.",
    priority: 6,
  },
];

function scoreDocuments(query: string, metrics: any, docs: typeof KNOWLEDGE_BASE) {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  const branchWord = (metrics.branch || "").toLowerCase();
  const contextWords = [
    metrics.cogsPct > 0.32 ? "cogs" : "",
    metrics.wastePct > 0.12 ? "waste" : "",
    metrics.sales < metrics.target * 0.9 ? "sales" : "",
    metrics.hoursPer100Sales > 8 ? "hours" : "",
    metrics.wastePct > 0.12 ? "production" : "",
    branchWord,
  ].filter(Boolean);

  return docs
    .map((doc) => {
      let score = doc.priority * 0.5;
      const text = (doc.text + " " + doc.tags.join(" ")).toLowerCase();
      for (const w of [...words, ...contextWords]) {
        if (text.includes(w)) score += 3;
      }
      return { ...doc, score };
    })
    .sort((a, b) => b.score - a.score)
    .filter((d) => d.score > 4);
}

function buildInsights(metrics: any) {
  const insights = [];
  if (metrics.cogsPct > 0.32) insights.push({ type: "warning", icon: AlertTriangle, text: `COGS ${(metrics.cogsPct * 100).toFixed(1)}% — above 32% target.` });
  if (metrics.wastePct > 0.12) insights.push({ type: "warning", icon: AlertTriangle, text: `Waste ${(metrics.wastePct * 100).toFixed(1)}% of COGS — above 12% target.` });
  if (metrics.sales < metrics.target * 0.9) insights.push({ type: "warning", icon: TrendingUp, text: `Sales €${metrics.sales.toFixed(0)} vs target €${metrics.target.toFixed(0)} — gap ${((1 - metrics.sales / metrics.target) * 100).toFixed(0)}%.` });
  if (metrics.hoursPer100Sales > 8) insights.push({ type: "warning", icon: Activity, text: `Labor ${metrics.hoursPer100Sales.toFixed(1)}h per €100 sales — above 8h target.` });
  if (metrics.healthScore >= 90) insights.push({ type: "ok", icon: Target, text: `Health score ${metrics.healthScore}/100 — metrics look healthy.` });
  if (!insights.length) insights.push({ type: "ok", icon: Target, text: `Health score ${metrics.healthScore}/100 — no major flags.` });
  return insights;
}

export default function RagAnalyzerTab({ metrics, orders, selectedBranch, weeklyLogs }: RagAnalyzerProps) {
  const [query, setQuery] = useState("");

  const snapshot = useMemo(() => {
    const branchOrders = selectedBranch === "All branches"
      ? orders
      : orders.filter((o) => o.branch === selectedBranch);
    const netSales = metrics.salesToday;
    const cogsPct = netSales > 0 ? metrics.cogsToday / netSales : 0;
    const wastePct = metrics.cogsToday > 0 ? metrics.wasteCost / metrics.cogsToday : 0;
    return {
      branch: selectedBranch,
      sales: netSales,
      target: netSales * 1.1,
      cogsPct,
      wastePct,
      productionItems: metrics.productionItems,
      productionTarget: metrics.productionTarget,
      hoursScheduled: metrics.hoursScheduled,
      hoursPer100Sales: netSales > 0 ? (metrics.hoursScheduled / netSales) * 100 : 0,
      healthScore: metrics.aiHealthScore,
      orders: branchOrders.length,
    };
  }, [metrics, orders, selectedBranch]);

  const insights = useMemo(() => buildInsights(snapshot), [snapshot]);

  const matches = useMemo(() => {
    const q = query.trim() || "what should I fix today";
    return scoreDocuments(q, snapshot, KNOWLEDGE_BASE).slice(0, 5);
  }, [query, snapshot]);

  const topActions = useMemo(() => {
    const actions = [];
    if (snapshot.cogsPct > 0.32) actions.push("Review top-cost SKUs and renegotiate supplier prices or reduce portions.");
    if (snapshot.wastePct > 0.12) actions.push("Reduce tomorrow's production target by 10–15% and push bestsellers.");
    if (snapshot.sales < snapshot.target * 0.9) actions.push("Run a lunch combo promotion and upsell top sellers.");
    if (snapshot.hoursPer100Sales > 8) actions.push("Align staffing schedule to expected sales curve.");
    if (snapshot.productionItems < snapshot.productionTarget * 0.9) actions.push("Production is behind target — check prep capacity.");
    if (!actions.length) actions.push("Maintain current targets and monitor end-of-day waste.");
    return actions.slice(0, 3);
  }, [snapshot]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-white">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        SakThai RAG Analysis
      </div>

      <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about today's performance..."
          className="bg-transparent text-sm text-white placeholder-slate-400 outline-none flex-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Sales" value={`€${snapshot.sales.toFixed(0)}`} sub={`Target €${snapshot.target.toFixed(0)}`} />
        <MetricCard label="COGS" value={`${(snapshot.cogsPct * 100).toFixed(1)}%`} sub={snapshot.cogsPct > 0.32 ? "Above 32%" : "On target"} warn={snapshot.cogsPct > 0.32} />
        <MetricCard label="Waste" value={`${(snapshot.wastePct * 100).toFixed(1)}%`} sub={snapshot.wastePct > 0.12 ? "Above 12%" : "On target"} warn={snapshot.wastePct > 0.12} />
        <MetricCard label="Health" value={`${snapshot.healthScore}`} sub="/ 100" warn={snapshot.healthScore < 70} />
      </div>

      <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
          <Activity className="w-4 h-4 text-blue-400" />
          Live Insights
        </div>
        <div className="space-y-2">
          {insights.map((insight, i) => (
            <div key={i} className={`flex items-start gap-2 text-sm p-2 rounded ${insight.type === "warning" ? "bg-red-950/40 text-red-100" : "bg-emerald-950/40 text-emerald-100"}`}>
              <insight.icon className="w-4 h-4 mt-0.5 shrink-0" />
              {insight.text}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
          <Target className="w-4 h-4 text-amber-400" />
          Top 3 Priority Actions
        </div>
        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-200">
          {topActions.map((a, i) => (
            <li key={i} className="pl-1">{a}</li>
          ))}
        </ol>
      </div>

      <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
        <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
          <Store className="w-4 h-4 text-purple-400" />
          Matched Knowledge ({matches.length})
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-slate-400">Type a specific question (e.g., "waste", "cogs", "mahon") to surface matched rules.</p>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => (
              <div key={m.id} className="text-sm p-2 rounded bg-slate-800/50 border border-slate-700/50 text-slate-200">
                <span className="text-xs text-slate-500 uppercase tracking-wide">{m.id}</span>
                <p className="mt-1">{m.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {weeklyLogs && weeklyLogs.length > 0 && (
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Week Trend ({weeklyLogs.length} days)
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-400">
            {weeklyLogs.slice(-7).map((log, i) => (
              <div key={i} className="bg-slate-800/50 rounded p-2">
                <div className="text-slate-500">{log.day}</div>
                <div className="text-white font-medium">€{log.sales?.toFixed(0) || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, warn }: { label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div className={`bg-slate-900/60 rounded-xl p-3 border ${warn ? "border-red-800/60" : "border-slate-800"}`}>
      <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={`text-lg font-semibold ${warn ? "text-red-400" : "text-white"}`}>{value}</div>
      <div className="text-xs text-slate-400">{sub}</div>
    </div>
  );
}
