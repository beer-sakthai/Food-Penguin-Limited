// Saksee · 2026-07-25 · SakThai Operational Advisor tab (multi-engine)
import React, { useEffect, useMemo, useState } from "react";
import { MessageSquare, Sparkles, AlertTriangle, Send, Loader2, Cpu, Cloud, BookOpen } from "lucide-react";
import type { SalesOrder } from "../types";

interface AdvisorTabProps {
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
}

type Engine = "auto" | "local" | "hf" | "rules";

const engineMeta: Record<Engine, { label: string; icon: React.ReactNode; note: string }> = {
  auto: { label: "Auto", icon: <Sparkles className="w-3.5 h-3.5" />, note: "Local → HF → Rules" },
  local: { label: "Local GGUF", icon: <Cpu className="w-3.5 h-3.5" />, note: "SakThai 1.5B on this machine" },
  hf: { label: "Hugging Face", icon: <Cloud className="w-3.5 h-3.5" />, note: "HF Inference API (token optional)" },
  rules: { label: "Rule engine", icon: <BookOpen className="w-3.5 h-3.5" />, note: "Built-in business rules" },
};

export default function AdvisorTab({ metrics, orders, selectedBranch }: AdvisorTabProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<string | null>(null);
  const [engine, setEngine] = useState<Engine>("auto");
  const [usedEngine, setUsedEngine] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

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
      cogs: metrics.cogsToday,
      cogsPct,
      waste: metrics.wasteCost,
      wastePct,
      productionItems: metrics.productionItems,
      productionTarget: metrics.productionTarget,
      hoursScheduled: metrics.hoursScheduled,
      hoursPer100Sales: netSales > 0 ? (metrics.hoursScheduled / netSales) * 100 : 0,
      healthScore: metrics.aiHealthScore,
      orders: branchOrders.length,
      target: netSales * 1.1,
    };
  }, [metrics, orders, selectedBranch]);

  const ask = async (customQuestion?: string) => {
    const question = (customQuestion ?? input).trim();
    if (!question && !customQuestion) return;
    setLoading(true); setErr(null);
    try {
      const r = await fetch("/api/sakthai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics: snapshot, question, engine }),
      });
      if (!r.ok) throw new Error(`Server returned ${r.status}`);
      const d = await r.json();
      setResp(d.text || d.response || JSON.stringify(d));
      setUsedEngine(d.engine || "unknown");
    } catch (e) {
      setErr("SakThai advisor unreachable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ask("Analyse current branch metrics and give 3 operational recommendations.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.branch, engine]);

  const quickPrompts = [
    "Why is COGS high today?",
    "How can we reduce waste?",
    "Suggest a production target adjustment.",
    "Should we change staffing tomorrow?",
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">SakThai Operational Advisor</h1>
          <p className="text-xs text-[var(--muted)]">Multi-engine advisor · Local SakThai · Hugging Face · Rule fallback</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Net sales" value={`€${snapshot.sales.toFixed(2)}`} />
        <Metric label="COGS %" value={`${(snapshot.cogsPct * 100).toFixed(1)}%`} warn={snapshot.cogsPct > 0.32} />
        <Metric label="Waste %" value={`${(snapshot.wastePct * 100).toFixed(1)}%`} warn={snapshot.wastePct > 0.12} />
        <Metric label="Health" value={`${snapshot.healthScore}`} warn={snapshot.healthScore < 75} />
      </div>

      <div className="card flex flex-wrap gap-2 items-center">
        <span className="text-xs text-[var(--muted)] mr-1">Engine:</span>
        {(Object.keys(engineMeta) as Engine[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setEngine(k)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border transition ${engine === k ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"}`}
            title={engineMeta[k].note}
          >
            {engineMeta[k].icon}
            {engineMeta[k].label}
          </button>
        ))}
      </div>

      {err && (
        <div className="card border border-amber-400/30 text-amber-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {err}
        </div>
      )}

      {resp && (
        <div className="card text-sm text-[var(--text)] leading-relaxed whitespace-pre-line">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">{usedEngine}</span>
            <MessageSquare className="w-4 h-4 text-[var(--muted)]" />
          </div>
          {resp}
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickPrompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setInput(p); ask(p); }}
              disabled={loading}
              className="px-3 py-1.5 rounded-md bg-[var(--accent-soft)] text-xs text-[var(--accent)] hover:brightness-110 transition"
            >
              {p}
            </button>
          ))}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask SakThai about operations, waste, staffing, or pricing..."
          rows={3}
          className="input w-full mb-3"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => ask()}
            disabled={loading || !input.trim()}
            className="btn btn-primary"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-1 inline" />}
            <Send className="w-4 h-4 inline mr-1" />
            Ask SakThai
          </button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={`card p-3 ${warn ? "border-l-4 border-l-amber-400" : ""}`}>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className={`text-lg font-semibold ${warn ? "text-amber-300" : "text-[var(--text)]"}`}>{value}</p>
    </div>
  );
}
