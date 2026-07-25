import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  Activity,
  Store,
  ChevronRight,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";
import type { SalesOrder, DailyOperationalLog } from "../types";

// --- Embedding-based RAG with Transformers.js (zero API cost) ---

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

interface KnowledgeDoc {
  id: string;
  tags: string[];
  text: string;
  priority: number;
  embedding?: number[];
}

const KNOWLEDGE_BASE: KnowledgeDoc[] = [
  {
    id: "fpl-cogs-target",
    tags: ["cogs", "cost", "target", "margin", "supplier"],
    text: "FPL target: COGS should be approximately 30% of net sales. Above 32% is a red flag requiring supplier or portion review.",
    priority: 10,
  },
  {
    id: "fpl-waste-target",
    tags: ["waste", "cogs", "target", "production", "spoilage"],
    text: "FPL target: waste cost should be approximately 10% of COGS. Above 12% indicates overproduction or poor sell-through.",
    priority: 10,
  },
  {
    id: "fpl-commission",
    tags: ["commission", "retailer", "tesco", "marks", "spencer", "gross", "net"],
    text: "Retailer commission is approximately 30% of gross sales. Net sales equals gross sales minus commission.",
    priority: 8,
  },
  {
    id: "branch-cork",
    tags: ["cork", "tesco", "city", "green", "branch"],
    text: "Cork (Tesco Cork City) is the green branch. Focus on lunch-rush sell-through and consistent daily production.",
    priority: 6,
  },
  {
    id: "branch-mahon",
    tags: ["mahon", "tesco", "blue", "point", "branch", "weekend"],
    text: "Mahon Point (Tesco Mahon Point) is the blue branch. Expect higher weekend traffic; raise Friday and Saturday prep.",
    priority: 6,
  },
  {
    id: "branch-ms",
    tags: ["marks", "spencer", "m&s", "gold", "white", "premium", "branch"],
    text: "Marks & Spencer Cork City is the white/gold premium branch. Higher price points demand tighter waste control.",
    priority: 6,
  },
  {
    id: "production-forecast",
    tags: ["production", "target", "forecast", "tomorrow", "prep"],
    text: "Production target should be 105–110% of expected sales units, adjusted for weather and the same weekday pattern last week.",
    priority: 9,
  },
  {
    id: "waste-action",
    tags: ["waste", "action", "reduce", "production", "overproduction"],
    text: "If waste is above target, reduce tomorrow's production target by 10–15% and prioritise yesterday's fastest-selling SKUs.",
    priority: 9,
  },
  {
    id: "cogs-action",
    tags: ["cogs", "action", "supplier", "price", "portion", "cost"],
    text: "If COGS is above target, renegotiate supplier prices, switch to lower-cost SKUs, or reduce portion sizes on low-margin items.",
    priority: 9,
  },
  {
    id: "sales-action",
    tags: ["sales", "target", "promotion", "marketing", "discount"],
    text: "If sales are below target, run a lunch combo promotion or ask staff to actively recommend top sellers.",
    priority: 8,
  },
  {
    id: "hours-action",
    tags: ["hours", "labor", "staff", "schedule", "roster"],
    text: "Labor hours per €100 sales above 8 is high. Align the roster to the expected hourly sales curve.",
    priority: 7,
  },
  {
    id: "sunday-pattern",
    tags: ["sunday", "weekend", "pattern", "sales", "clearance"],
    text: "Sunday often has the softest sales. Use it to clear weekend stock with targeted end-of-day discounts.",
    priority: 6,
  },
];

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export default function RagAnalyzerTab({ metrics, orders, selectedBranch, weeklyLogs }: RagAnalyzerProps) {
  const [query, setQuery] = useState("");
  const [embeddingsReady, setEmbeddingsReady] = useState(false);
  const [simProd, setSimProd] = useState(100);
  const [simStaff, setSimStaff] = useState(100);
  const [matches, setMatches] = useState<KnowledgeDoc[]>([]);
  const pipelineRef = useRef<any>(null);

  // Embed knowledge base once on mount
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const { pipeline } = await import("@xenova/transformers");
      if (cancelled) return;
      pipelineRef.current = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
        quantized: true,
        revision: "main",
      });
      const texts = KNOWLEDGE_BASE.map((d) => d.text);
      const out = await pipelineRef.current(texts, { pooling: "mean", normalize: true });
      const hiddenSize = out.dims[1];
      const data = out.data as Float32Array;
      const vectors: number[][] = [];
      for (let i = 0; i < texts.length; i++) {
        const v: number[] = [];
        for (let j = 0; j < hiddenSize; j++) v.push(data[i * hiddenSize + j]);
        vectors.push(v);
      }
      KNOWLEDGE_BASE.forEach((d, i) => (d.embedding = vectors[i]));
      setEmbeddingsReady(true);
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

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

  // Semantic search against knowledge base
  useEffect(() => {
    if (!embeddingsReady || !pipelineRef.current) return;
    const run = async () => {
      const q = query.trim() || "what should I fix today";
      const qText = `${q} ${snapshot.branch} cogs ${(snapshot.cogsPct * 100).toFixed(0)}% waste ${(snapshot.wastePct * 100).toFixed(0)}% health ${snapshot.healthScore}`;
      const out = await pipelineRef.current(qText, { pooling: "mean", normalize: true });
      const hiddenSize = out.dims[1];
      const qVec: number[] = [];
      for (let i = 0; i < hiddenSize; i++) qVec.push(out.data[i]);

      const scored = KNOWLEDGE_BASE.map((d) => ({
        ...d,
        score: d.embedding ? cosineSimilarity(d.embedding, qVec) * 0.7 + d.priority * 0.03 : d.priority * 0.05,
      }))
        .sort((a, b) => b.score - a.score)
        .filter((d) => d.score > 0.35)
        .slice(0, 4);
      setMatches(scored);
    };
    run();
  }, [query, snapshot, embeddingsReady]);

  const insights = useMemo(() => {
    const list: { type: "warning" | "ok"; icon: typeof AlertTriangle; text: string }[] = [];
    if (snapshot.cogsPct > 0.32) list.push({ type: "warning", icon: AlertTriangle, text: `COGS ${(snapshot.cogsPct * 100).toFixed(1)}% — above 32% target.` });
    if (snapshot.wastePct > 0.12) list.push({ type: "warning", icon: AlertTriangle, text: `Waste ${(snapshot.wastePct * 100).toFixed(1)}% of COGS — above 12% target.` });
    if (snapshot.sales < snapshot.target * 0.9) list.push({ type: "warning", icon: TrendingUp, text: `Sales €${snapshot.sales.toFixed(0)} vs target €${snapshot.target.toFixed(0)} — gap ${((1 - snapshot.sales / snapshot.target) * 100).toFixed(0)}%.` });
    if (snapshot.hoursPer100Sales > 8) list.push({ type: "warning", icon: Activity, text: `Labor ${snapshot.hoursPer100Sales.toFixed(1)}h per €100 sales — above 8h target.` });
    if (snapshot.productionItems < snapshot.productionTarget * 0.9) list.push({ type: "warning", icon: Target, text: `Production ${snapshot.productionItems}/${snapshot.productionTarget} — behind target.` });
    if (!list.length) list.push({ type: "ok", icon: Target, text: `Health score ${snapshot.healthScore}/100 — no major flags today.` });
    return list;
  }, [snapshot]);

  const topActions = useMemo(() => {
    const actions = [];
    if (snapshot.cogsPct > 0.32) actions.push("Review top-cost SKUs and renegotiate supplier prices or reduce portions.");
    if (snapshot.wastePct > 0.12) actions.push("Reduce tomorrow's production target by 10–15% and push fastest-selling SKUs first.");
    if (snapshot.sales < snapshot.target * 0.9) actions.push("Run a lunch combo promotion and upsell top sellers at the counter.");
    if (snapshot.hoursPer100Sales > 8) actions.push("Align the roster to the expected hourly sales curve.");
    if (snapshot.productionItems < snapshot.productionTarget * 0.9) actions.push("Check prep capacity — production is below today's target.");
    if (!actions.length) actions.push("Maintain current targets and monitor end-of-day waste.");
    return actions.slice(0, 3);
  }, [snapshot]);

  const simHours = snapshot.hoursScheduled * (simStaff / 100);
  const simProduction = snapshot.productionItems * (simProd / 100);
  const simHoursPer100 = snapshot.sales > 0 ? (simHours / snapshot.sales) * 100 : 0;
  const simCogsPct = snapshot.cogsPct * (simProd / 100);

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold text-white">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          SakThai RAG Analysis
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className={`w-2 h-2 rounded-full ${embeddingsReady ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
          {embeddingsReady ? "RAG engine ready" : "Loading embeddings..."}
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-400 transition-colors" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about today's performance..."
          className="w-full bg-slate-900/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none border border-slate-700 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all"
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Net Sales" value={`€${snapshot.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub={`Target €${snapshot.target.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <MetricCard label="COGS" value={`${(snapshot.cogsPct * 100).toFixed(1)}%`} sub={snapshot.cogsPct > 0.32 ? "Above 32% target" : "Within target"} warn={snapshot.cogsPct > 0.32} />
        <MetricCard label="Waste" value={`${(snapshot.wastePct * 100).toFixed(1)}%`} sub={snapshot.wastePct > 0.12 ? "Above 12% target" : "Within target"} warn={snapshot.wastePct > 0.12} />
        <MetricCard label="Health" value={`${snapshot.healthScore}`} sub="/ 100" warn={snapshot.healthScore < 70} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Insights */}
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <Activity className="w-4 h-4 text-blue-400" />
            Live Insights
          </div>
          <div className="space-y-2.5">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 text-sm p-3 rounded-xl border ${
                  insight.type === "warning"
                    ? "bg-red-950/30 border-red-900/40 text-red-100"
                    : "bg-emerald-950/30 border-emerald-900/40 text-emerald-100"
                }`}
              >
                <div className={`p-1 rounded-md ${insight.type === "warning" ? "bg-red-500/20" : "bg-emerald-500/20"}`}>
                  <insight.icon className={`w-4 h-4 ${insight.type === "warning" ? "text-red-400" : "text-emerald-400"}`} />
                </div>
                {insight.text}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <Target className="w-4 h-4 text-amber-400" />
            Top 3 Priority Actions
          </div>
          <ol className="space-y-3">
            {topActions.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-semibold">{i + 1}</span>
                {a}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* What-if simulator */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          What-If Simulator
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="flex items-center justify-between text-sm text-slate-300">
              Production volume
              <span className="font-mono text-white">{simProd}%</span>
            </label>
            <input
              type="range"
              min={70}
              max={130}
              value={simProd}
              onChange={(e) => setSimProd(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between text-sm text-slate-300">
              Staff hours
              <span className="font-mono text-white">{simStaff}%</span>
            </label>
            <input
              type="range"
              min={70}
              max={130}
              value={simStaff}
              onChange={(e) => setSimStaff(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-slate-500 text-xs">Sim production</div>
            <div className="text-white font-medium">{Math.round(simProduction)} units</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-slate-500 text-xs">Sim labor/€100</div>
            <div className={`font-medium ${simHoursPer100 > 8 ? "text-red-400" : "text-white"}`}>{simHoursPer100.toFixed(1)}h</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-slate-500 text-xs">Est. waste shift</div>
            <div className={`font-medium ${simProd > 105 ? "text-red-400" : simProd < 95 ? "text-emerald-400" : "text-white"}`}>{simProd > 105 ? "Higher" : simProd < 95 ? "Lower" : "Neutral"}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-slate-500 text-xs">COGS impact</div>
            <div className="text-white font-medium">{(snapshot.cogsPct * 100).toFixed(1)}% → {(simCogsPct * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Matched knowledge */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <Store className="w-4 h-4 text-purple-400" />
          Matched Rules
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-slate-400">Type a question (e.g. "waste", "cogs", "mahon") or wait for embeddings to load.</p>
        ) : (
          <div className="space-y-2">
            {matches.map((m, idx) => (
              <div
                key={m.id}
                className="group flex items-start gap-3 text-sm p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-amber-500/30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-500 mt-0.5 group-hover:text-amber-400 transition-colors" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{idx + 1}. {m.id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">Score {(m as any).score.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-slate-200">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Week trend */}
      {weeklyLogs && weeklyLogs.length > 0 && (
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            7-Day Sales Trend
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {weeklyLogs.slice(-7).map((log, i) => {
              const max = Math.max(...weeklyLogs.slice(-7).map((l) => l.sales));
              const pct = max > 0 ? (log.sales / max) * 100 : 0;
              return (
                <div key={i} className="flex flex-col gap-1">
                  <div className="h-20 bg-slate-800/50 rounded-lg relative overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-emerald-500/60 rounded-b-lg transition-all duration-700"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500">{log.day}</div>
                  <div className="text-xs text-white font-medium">€{log.sales.toFixed(0)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, warn }: { label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div className={`bg-slate-900/60 rounded-2xl p-4 border shadow-sm transition-colors ${warn ? "border-red-800/60" : "border-slate-800/80"}`}>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</div>
      <div className={`text-xl font-bold mt-1 ${warn ? "text-red-400" : "text-white"}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}
