// Saksee · 2026-07-24 · feat/new-design-system
import React, { useState } from "react";
import { ChefHat, Plus, CheckCircle2, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, Legend } from "recharts";
import { Recipe, ProductionTask } from "../types";

interface ProductionTabProps {
  recipes: Recipe[];
  tasks: ProductionTask[];
  onAddTask: (task: Omit<ProductionTask, 'id'>) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: ProductionTask['status']) => void;
}

const STATUS_COLORS: Record<string, string> = {
  "In Queue": "var(--muted)",
  "Cooking": "var(--warn)",
  "Prepared": "var(--ok)",
};

const CHEFS = ["Chef Skipper", "Chef Kowalski", "Chef Private", "Kitchen Aide Rico", "Alice Smith"];

export default function ProductionTab({ recipes, tasks, onAddTask, onUpdateTaskStatus }: ProductionTabProps) {
  const [item, setItem] = useState("");
  const [assigned, setAssigned] = useState(CHEFS[0]);
  const [qty, setQty] = useState(1);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const volumeData = [
    { hour: "08", volume: 45, target: 50 },
    { hour: "10", volume: 85, target: 80 },
    { hour: "12", volume: 150, target: 120 },
    { hour: "14", volume: 110, target: 110 },
    { hour: "16", volume: 60, target: 70 },
    { hour: "18", volume: 130, target: 140 },
    { hour: "20", volume: 90, target: 80 },
  ];

  const statusData = (["In Queue", "Cooking", "Prepared"] as const).map(status => ({
    status,
    count: tasks.filter(t => t.status === status).reduce((sum, t) => sum + t.quantity, 0),
  }));

  const totalToday = volumeData.reduce((a, d) => a + d.volume, 0);
  const totalTarget = volumeData.reduce((a, d) => a + d.target, 0);
  const completion = totalTarget ? Math.round((totalToday / totalTarget) * 100) : 0;

  const submit = (e: React.FormEvent) => {
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

  const cards = [
    { label: "Made today", value: totalToday.toLocaleString(), sub: "items" },
    { label: "Target", value: totalTarget.toLocaleString(), sub: "items" },
    { label: "Completion", value: `${completion}%`, sub: completion >= 90 ? "on track" : "behind", tone: completion >= 90 ? "up" : "down" },
    { label: "Active tasks", value: tasks.length, sub: "in queue + cooking" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">Production</h1>
            <p className="text-xs text-[var(--muted)]">{tasks.length} active tasks · {recipes.length} recipes · {completion}% of day target</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((k, i) => (
          <div key={i} className="card card-hover">
            <span className="metric-label">{k.label}</span>
            <div className="mt-2 metric-value">{k.value}</div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="section-title mb-4">Volume by hour</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="volume" name="Made" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--accent)", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="var(--muted)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">Task status</h2>
          <div className="h-56">
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

      <div className="card">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add production task
        </h2>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            value={item}
            onChange={e => setItem(e.target.value)}
            placeholder="Item (e.g. Tokyo Dragon Roll)"
            className="md:col-span-2 input"
          />
          <select value={assigned} onChange={e => setAssigned(e.target.value)} className="select">
            {CHEFS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="input"
          />
          <select value={priority} onChange={e => setPriority(e.target.value as any)} className="select">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="submit" className="md:col-span-5 btn btn-primary justify-center">Add task</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="section-title">Active tasks</h2>
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
                    <span
                      className="pill"
                      style={{ color: STATUS_COLORS[t.status] || "var(--muted)", background: "var(--panel)" }}
                    >
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
