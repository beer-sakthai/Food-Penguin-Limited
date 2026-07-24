// Saksee · 2026-07-24 · feat/density-cut
import React, { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
interface Waste { id: string; item: string; category: string; weight: number; cost: number; reason: string; date: string; }
const REASONS = ["Expired", "Overproduced", "Spill/Accident", "Quality Issue", "Damaged"];
const CATS = ["Seafood", "Sushi Rolls", "Produce", "Condiments", "Wrapping"];
export default function WasteTab(props: {
  wasteRecords: Waste[]; onAddWaste: (w: Omit<Waste, "id">) => void;
  totalCostToday: number; selectedBranch: string; theme: "dark" | "light";
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
  const byReason = REASONS.map(rn => ({ reason: rn, cost: wasteRecords.filter(w => w.reason === rn).reduce((a, w) => a + w.cost, 0) })).filter(x => x.cost > 0);
  const totalWeight = wasteRecords.reduce((a, w) => a + (w.weight || 0), 0);
  const COLORS = ["var(--accent)", "var(--accent-hover)", "var(--warn)", "var(--ok)", "var(--accent)"];
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><Trash2 className="w-5 h-5 text-[var(--accent)]" />Waste</h1>
        <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{selectedBranch} · {wasteRecords.length} records · {totalWeight.toFixed(1)}kg</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Total cost", value: `€${totalCostToday.toFixed(0)}`, sub: "all branches" },
          { label: "Total weight", value: `${totalWeight.toFixed(1)} kg`, sub: `${wasteRecords.length} records` },
          { label: "Top reason", value: byReason.length ? byReason.sort((a, b) => b.cost - a.cost)[0].reason : "—", sub: "by cost" },
        ].map((k, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <div className="text-[10px] font-mono uppercase tracking-wide text-[var(--muted)]">{k.label}</div>
            <div className="text-2xl font-bold text-[var(--text)] mt-1">{k.value}</div>
            <div className="text-[10px] font-mono text-[var(--muted)] mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>
      {byReason.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Cost by reason</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byReason} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="reason" tick={{ fontSize: 10, fill: "var(--muted)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} formatter={(v: any) => `€${v}`} />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]}>{byReason.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-1.5"><Plus className="w-4 h-4 text-[var(--accent)]" />Log waste</h2>
        <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <input type="text" value={item} onChange={e => setItem(e.target.value)} placeholder="Item" className="md:col-span-2 px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]" />
          <select value={cat} onChange={e => setCat(e.target.value)} className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]">{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <input type="number" min={0} step="0.1" value={w} onChange={e => setW(parseFloat(e.target.value) || 0)} placeholder="kg" className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]" />
          <input type="number" min={0} step="0.01" value={c} onChange={e => setC(parseFloat(e.target.value) || 0)} placeholder="€ cost" className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]" />
          <select value={r} onChange={e => setR(e.target.value)} className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]">{REASONS.map(x => <option key={x} value={x}>{x}</option>)}</select>
          <button type="submit" className="md:col-span-6 px-3 py-2 text-sm font-semibold rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]">Log</button>
        </form>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center"><h2 className="text-sm font-semibold text-[var(--text)]">Records</h2><span className="text-[10px] font-mono text-[var(--muted)] ml-auto">{wasteRecords.length} total</span></div>
        {wasteRecords.length === 0 ? <div className="px-5 py-8 text-center text-xs text-[var(--muted)] font-mono">no waste records</div> : (
          <table className="w-full text-xs">
            <thead className="bg-[var(--panel)] text-[var(--muted)]"><tr><th className="text-left px-4 py-2 font-medium">Item</th><th className="text-left px-4 py-2 font-medium">Category</th><th className="text-right px-4 py-2 font-medium">Weight</th><th className="text-right px-4 py-2 font-medium">Cost</th><th className="text-left px-4 py-2 font-medium">Reason</th><th className="text-left px-4 py-2 font-medium">Date</th></tr></thead>
            <tbody>{wasteRecords.map(w => (<tr key={w.id} className="border-t border-[var(--border)] hover:bg-[var(--panel)]"><td className="px-4 py-2 font-medium text-[var(--text)]">{w.item}</td><td className="px-4 py-2 text-[var(--muted)]">{w.category}</td><td className="px-4 py-2 text-right font-mono">{w.weight.toFixed(1)} kg</td><td className="px-4 py-2 text-right font-mono">€{w.cost.toFixed(2)}</td><td className="px-4 py-2 text-[var(--muted)]">{w.reason}</td><td className="px-4 py-2 font-mono text-[var(--muted)]">{w.date}</td></tr>))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
