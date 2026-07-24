// Saksee · 2026-07-24 · feat/new-design-system
import React, { useState } from "react";
import { Trash2, Plus, Search, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface Waste { id: string; item: string; category: string; weight: number; cost: number; reason: string; date: string; }

const REASONS = ["Expired", "Overproduced", "Spill/Accident", "Quality Issue", "Damaged"];
const CATS = ["Seafood", "Sushi Rolls", "Produce", "Condiments", "Wrapping"];

export default function WasteTab(props: {
  wasteRecords: Waste[];
  onAddWaste: (w: Omit<Waste, "id">) => void;
  totalCostToday: number;
  selectedBranch: string;
  theme: "dark" | "light";
}) {
  const { wasteRecords, onAddWaste, totalCostToday, selectedBranch } = props;
  const [item, setItem] = useState("");
  const [cat, setCat] = useState(CATS[0]);
  const [w, setW] = useState(1);
  const [c, setC] = useState(0);
  const [r, setR] = useState(REASONS[0]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim()) return;
    onAddWaste({ item, category: cat, weight: w, cost: c, reason: r, date: new Date().toISOString().slice(0, 10) });
    setItem(""); setW(1); setC(0);
  };

  const byReason = REASONS.map(rn => ({
    reason: rn,
    cost: wasteRecords.filter(w => w.reason === rn).reduce((a, w) => a + w.cost, 0)
  })).filter(x => x.cost > 0);

  const totalWeight = wasteRecords.reduce((a, w) => a + (w.weight || 0), 0);
  const topReason = byReason.length ? byReason.sort((a, b) => b.cost - a.cost)[0].reason : "—";

  const cards = [
    { label: "Total cost", value: `€${totalCostToday.toFixed(0)}`, sub: "all branches", warn: totalCostToday > 200 },
    { label: "Total weight", value: `${totalWeight.toFixed(1)} kg`, sub: `${wasteRecords.length} records` },
    { label: "Top reason", value: topReason, sub: "by cost" },
  ];

  const COLORS = ["var(--accent)", "var(--warn)", "var(--bad)", "var(--ok)", "var(--accent-hover)"];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">Waste</h1>
            <p className="text-xs text-[var(--muted)]">{selectedBranch} · {wasteRecords.length} records · {totalWeight.toFixed(1)}kg</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((k, i) => (
          <div key={i} className="card card-hover">
            <div className="flex items-center gap-2">
              <span className="metric-label">{k.label}</span>
              {k.warn && <AlertTriangle className="w-3.5 h-3.5 text-[var(--warn)]" />}
            </div>
            <div className="mt-2 metric-value">{k.value}</div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">{k.sub}</div>
          </div>
        ))}
      </div>

      {byReason.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-4">Cost by reason</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byReason} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="reason" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `€${v}`} />
                <Bar dataKey="cost" radius={[6, 6, 0, 0]} fontSize={12}>
                  {byReason.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log waste
        </h2>
        <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <input type="text" value={item} onChange={e => setItem(e.target.value)} placeholder="Item" className="md:col-span-2 input" />
          <select value={cat} onChange={e => setCat(e.target.value)} className="select">{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <input type="number" min={0} step="0.1" value={w} onChange={e => setW(parseFloat(e.target.value) || 0)} placeholder="kg" className="input" />
          <input type="number" min={0} step="0.01" value={c} onChange={e => setC(parseFloat(e.target.value) || 0)} placeholder="€ cost" className="input" />
          <select value={r} onChange={e => setR(e.target.value)} className="select">{REASONS.map(x => <option key={x} value={x}>{x}</option>)}</select>
          <button type="submit" className="md:col-span-6 btn btn-primary justify-center">Log</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Records</h2>
          <span className="text-[11px] text-[var(--muted)]">{wasteRecords.length} total</span>
        </div>
        {wasteRecords.length === 0 ? (
          <div className="py-10 text-center text-xs text-[var(--muted)]">no waste records</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th className="text-right">Weight</th>
                <th className="text-right">Cost</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {wasteRecords.map(w => (
                <tr key={w.id}>
                  <td className="font-medium">{w.item}</td>
                  <td className="text-[var(--muted)]">{w.category}</td>
                  <td className="text-right font-mono">{w.weight.toFixed(1)} kg</td>
                  <td className="text-right font-mono">€{w.cost.toFixed(2)}</td>
                  <td className="text-[var(--muted)]">{w.reason}</td>
                  <td className="font-mono text-[var(--muted)]">{w.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
