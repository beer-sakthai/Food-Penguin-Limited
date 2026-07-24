// Saksee · 2026-07-24 · feat/density-cut
import React, { useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import type { CompanyTarget } from "../types";
export default function TargetTab({ targets, onAddTarget }: { targets: CompanyTarget[]; onAddTarget: (t: Omit<CompanyTarget, "id">) => void; }) {
  const [name, setName] = useState("");
  const [metric, setMetric] = useState("Total Sales (€)");
  const [tv, setTv] = useState(1000);
  const [cv, setCv] = useState(0);
  const [unit, setUnit] = useState("€");
  const onTrack = targets.filter(t => t.currentValue >= t.targetValue * 0.85).length;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddTarget({ name, metric, targetValue: tv, currentValue: cv, unit, category: "Custom", deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(), date: new Date().toISOString().slice(0, 10) });
    setName(""); setTv(1000); setCv(0);
  };
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[var(--accent)]" />Targets</h1>
        <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{targets.length} active · {onTrack} on track</p>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-1.5"><Plus className="w-4 h-4 text-[var(--accent)]" />Add target</h2>
        <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="md:col-span-2 px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]" />
          <input type="text" value={metric} onChange={e => setMetric(e.target.value)} placeholder="Metric" className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]" />
          <input type="number" min={0} value={tv} onChange={e => setTv(parseFloat(e.target.value) || 0)} placeholder="Target" className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]" />
          <input type="number" value={cv} onChange={e => setCv(parseFloat(e.target.value) || 0)} placeholder="Current" className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]" />
          <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unit" className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]" />
          <button type="submit" className="md:col-span-6 px-3 py-2 text-sm font-semibold rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]">Add target</button>
        </form>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--panel)] text-[var(--muted)]"><tr><th className="text-left px-4 py-2 font-medium">Target</th><th className="text-left px-4 py-2 font-medium">Metric</th><th className="text-right px-4 py-2 font-medium">Current</th><th className="text-right px-4 py-2 font-medium">Goal</th><th className="text-left px-4 py-2 font-medium">Progress</th><th className="text-left px-4 py-2 font-medium">Deadline</th></tr></thead>
          <tbody>{targets.map(t => {
            const pct = t.targetValue ? Math.min(100, Math.round((t.currentValue / t.targetValue) * 100)) : 0;
            return (
              <tr key={t.id} className="border-t border-[var(--border)] hover:bg-[var(--panel)]">
                <td className="px-4 py-2 font-medium text-[var(--text)]">{t.name}</td>
                <td className="px-4 py-2 text-[var(--muted)]">{t.metric}</td>
                <td className="px-4 py-2 text-right font-mono">{t.currentValue.toLocaleString()} {t.unit}</td>
                <td className="px-4 py-2 text-right font-mono">{t.targetValue.toLocaleString()} {t.unit}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[var(--panel)] rounded overflow-hidden"><div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} /></div>
                    <span className="text-[10px] font-mono text-[var(--muted)] w-9 text-right">{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-[var(--muted)] font-mono text-[10px]">{new Date(t.deadline).toLocaleDateString()}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}
