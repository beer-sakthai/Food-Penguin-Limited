// Saksee · 2026-07-24 · feat/new-design-system
import React, { useState } from "react";
import { ShieldCheck, Plus, Target } from "lucide-react";
import type { CompanyTarget } from "../types";

export default function TargetTab({
  targets,
  onAddTarget,
}: {
  targets: CompanyTarget[];
  onAddTarget: (t: Omit<CompanyTarget, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [metric, setMetric] = useState("Total Sales (€)");
  const [tv, setTv] = useState(1000);
  const [cv, setCv] = useState(0);
  const [unit, setUnit] = useState("€");

  const onTrack = targets.filter(t => t.currentValue >= t.targetValue * 0.85).length;
  const avgProgress = targets.length
    ? Math.round(targets.reduce((a, t) => a + Math.min(100, (t.currentValue / (t.targetValue || 1)) * 100), 0) / targets.length)
    : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddTarget({
      name,
      metric,
      targetValue: tv,
      currentValue: cv,
      unit,
      category: "Sell" as const,
      deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      date: new Date().toISOString().slice(0, 10),
    });
    setName(""); setTv(1000); setCv(0);
  };

  const cards = [
    { label: "Active targets", value: targets.length, sub: "set up" },
    { label: "On track", value: onTrack, sub: "≥85% progress" },
    { label: "Avg progress", value: `${avgProgress}%`, sub: "across all" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Targets</h1>
          <p className="text-xs text-[var(--muted)]">{targets.length} active · {onTrack} on track</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((k, i) => (
          <div key={i} className="card card-hover">
            <span className="metric-label">{k.label}</span>
            <div className="mt-2 metric-value">{k.value}</div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add target
        </h2>
        <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="md:col-span-2 input" />
          <input type="text" value={metric} onChange={e => setMetric(e.target.value)} placeholder="Metric" className="input" />
          <input type="number" min={0} value={tv} onChange={e => setTv(parseFloat(e.target.value) || 0)} placeholder="Target" className="input" />
          <input type="number" value={cv} onChange={e => setCv(parseFloat(e.target.value) || 0)} placeholder="Current" className="input" />
          <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unit" className="input" />
          <button type="submit" className="md:col-span-6 btn btn-primary justify-center">Add target</button>
        </form>
      </div>

      <div className="card overflow-hidden">
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
            {targets.map(t => {
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
  );
}
