// Saksee · 2026-07-24 · feat/density-cut
// Production tab — basic, sample, professional. 2 charts (volume + status), task list, add form.
// Removed: AI Culinary Auditor, motion/react, hover-lift, mock dish base64 SVGs.

import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, Legend } from "recharts";
import { ChefHat, Plus, CheckCircle2 } from "lucide-react";
import { Recipe, ProductionTask } from "../types";

interface ProductionTabProps {
  recipes: Recipe[];
  tasks: ProductionTask[];
  onAddTask: (task: Omit<ProductionTask, 'id'>) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: ProductionTask['status']) => void;
}

const STATUS_COLORS: Record<string, string> = {
  "In Queue": "#94a3b8",
  "Cooking": "#f59e0b",
  "Prepared": "#15803d",
};

const CHEFS = ["Chef Skipper", "Chef Kowalski", "Chef Private", "Kitchen Aide Rico", "Alice Smith"];

export default function ProductionTab({ recipes, tasks, onAddTask, onUpdateTaskStatus }: ProductionTabProps) {
  const [item, setItem] = useState("");
  const [assigned, setAssigned] = useState(CHEFS[0]);
  const [qty, setQty] = useState(1);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  // Volume by hour (sample data, kept simple)
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

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Production</h1>
          <p className="text-xs font-mono text-[var(--muted)] mt-0.5">
            {tasks.length} active tasks · {recipes.length} recipes · {completion}% of day target
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Made today", value: totalToday.toLocaleString(), sub: "items" },
          { label: "Target", value: totalTarget.toLocaleString(), sub: "items" },
          { label: "Completion", value: `${completion}%`, sub: completion >= 90 ? "on track" : "behind" },
          { label: "Active tasks", value: tasks.length, sub: "in queue + cooking" },
        ].map((k, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <div className="text-[10px] font-mono uppercase tracking-wide text-[var(--muted)]">{k.label}</div>
            <div className="text-2xl font-bold text-[var(--text)] mt-1">{k.value}</div>
            <div className="text-[10px] font-mono text-[var(--muted)] mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Volume by hour — line chart kept */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Volume by hour</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="volume" name="Made" stroke="#c2410c" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#78716c" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status breakdown — bar chart kept */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Task status</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="count" name="Items" radius={[4, 4, 0, 0]}>
                  {statusData.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.status] || "#94a3b8"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Add task — flat form */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[var(--accent)]" />
          Add production task
        </h2>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            type="text"
            value={item}
            onChange={e => setItem(e.target.value)}
            placeholder="Item (e.g. Tokyo Dragon Roll)"
            className="md:col-span-2 px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
          />
          <select
            value={assigned}
            onChange={e => setAssigned(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          >
            {CHEFS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as any)}
            className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="md:col-span-5 mt-1 px-3 py-2 text-sm font-medium rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
          >
            Add task
          </button>
        </form>
      </div>

      {/* Active tasks list */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Active tasks</h2>
          <span className="text-[10px] font-mono text-[var(--muted)] ml-auto">{tasks.length} total</span>
        </div>
        {tasks.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-[var(--muted)] font-mono">no tasks yet</div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-[var(--panel)] text-[var(--muted)]">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Item</th>
                <th className="text-left px-4 py-2 font-medium">Assigned</th>
                <th className="text-right px-4 py-2 font-medium">Qty</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Priority</th>
                <th className="text-right px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-t border-[var(--border)] hover:bg-[var(--panel)]">
                  <td className="px-4 py-2 font-medium text-[var(--text)]">{t.itemName}</td>
                  <td className="px-4 py-2 text-[var(--muted)]">{t.assignedTo}</td>
                  <td className="px-4 py-2 text-right font-mono">{t.quantity}</td>
                  <td className="px-4 py-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono uppercase"
                      style={{ color: STATUS_COLORS[t.status] || "#94a3b8", background: "var(--panel)" }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[var(--muted)] font-mono capitalize">{t.priority}</td>
                  <td className="px-4 py-2 text-right">
                    {t.status !== "Prepared" && (
                      <button
                        type="button"
                        onClick={() => onUpdateTaskStatus(t.id, t.status === "In Queue" ? "Cooking" : "Prepared")}
                        className="text-[10px] font-mono px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)]"
                      >
                        Advance →
                      </button>
                    )}
                    {t.status === "Prepared" && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ok)] inline" />}
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
