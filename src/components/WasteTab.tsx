// Saksee · 2026-07-24 · waste: day + week view with target, driven by weeklyLogs
import React, { useState } from "react";
import { Trash2, Plus, AlertTriangle, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";
import { WASTE_TARGET_PCT, wasteTargetFromProduction } from "../business";
import { DailyOperationalLog } from "../types";

interface Waste { id: string; item: string; category: string; weight: number; cost: number; reason: string; date: string; }

const REASONS = ["Expired", "Overproduced", "Spill/Accident", "Quality Issue", "Damaged"];
const CATS = ["Seafood", "Sushi Rolls", "Produce", "Condiments", "Wrapping"];

const EMPTY_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({ d, cost: 0, prod: 0 }));

export default function WasteTab(props: {
  wasteRecords: Waste[];
  onAddWaste: (w: Omit<Waste, "id">) => void;
  totalCostToday: number;
  selectedBranch: string;
  theme: "dark" | "light";
  productionValueToday?: number;
  weeklyLogs?: DailyOperationalLog[];
}) {
  const { wasteRecords, onAddWaste, totalCostToday, selectedBranch, productionValueToday = 2200, weeklyLogs = [] } = props;

  const lastSeven = weeklyLogs.slice(-7);
  const weekData = lastSeven.length
    ? lastSeven.map((log) => ({ d: log.day, cost: Math.round(log.waste || 0), prod: log.productionMade || 0 }))
    : EMPTY_WEEK;
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

  const wasteTarget = wasteTargetFromProduction(productionValueToday);
  const wastePct = productionValueToday ? (totalCostToday / productionValueToday) * 100 : 0;
  const overTarget = wastePct > WASTE_TARGET_PCT;

  const weekCost = weekData.reduce((a, r) => a + r.cost, 0);
  const weekProd = weekData.reduce((a, r) => a + r.prod, 0);
  const weekPct = weekProd ? (weekCost / weekProd) * 100 : 0;
  const weekTarget = weekProd * (WASTE_TARGET_PCT / 100);
  const maxDay = weekData.reduce((m, r) => r.cost > m.cost ? r : m, weekData[0]);

  const chartData = weekData.map((r) => ({
    ...r,
    target: weekTarget / 7,
    pct: r.prod ? (r.cost / r.prod) * 100 : 0,
  }));

  const cards = [
    { label: "Today cost", value: `€${totalCostToday.toFixed(0)}`, sub: `€${wasteTarget.toFixed(0)} budget`, warn: overTarget },
    { label: "Today waste %", value: `${wastePct.toFixed(1)}%`, sub: `target ${WASTE_TARGET_PCT}%`, warn: overTarget },
    { label: "Week cost", value: `€${weekCost.toLocaleString()}`, sub: `€${Math.round(weekTarget).toLocaleString()} budget`, warn: weekPct > WASTE_TARGET_PCT },
    { label: "Week waste %", value: `${weekPct.toFixed(1)}%`, sub: `target ${WASTE_TARGET_PCT}%`, warn: weekPct > WASTE_TARGET_PCT },
    { label: "Max day", value: maxDay.d, sub: `€${maxDay.cost} · ${(maxDay.cost / maxDay.prod * 100).toFixed(1)}%` },
    { label: "Records", value: `${wasteRecords.length}`, sub: `${totalWeight.toFixed(1)} kg total` },
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
            <p className="text-xs text-[var(--muted)]">{selectedBranch} · target {WASTE_TARGET_PCT}% · today vs this week</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> This week · waste vs target
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `€${v}`} />
                <ReferenceLine y={weekTarget / 7} stroke="var(--warn)" strokeDasharray="4 4" label={{ value: "target", fill: "var(--warn)", fontSize: 10, position: "insideTopRight" }} />
                <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.pct > WASTE_TARGET_PCT ? "var(--bad)" : "var(--accent)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {byReason.length > 0 && (
          <div className="card">
            <h2 className="section-title mb-4">Cost by reason</h2>
            <div className="h-56">
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
      </div>

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
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Reason</th>
                <th className="text-right">Weight</th>
                <th className="text-right">Cost</th>
                <th className="text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {wasteRecords.slice().reverse().slice(0, 20).map((w) => (
                <tr key={w.id}>
                  <td>{w.item}</td>
                  <td><span className="status-pill status-ok">{w.category}</span></td>
                  <td>{w.reason}</td>
                  <td className="text-right">{w.weight.toFixed(1)} kg</td>
                  <td className="text-right">€{w.cost.toFixed(2)}</td>
                  <td className="text-right">{w.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
