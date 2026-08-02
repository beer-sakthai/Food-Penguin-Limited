// Saksee · 2026-07-25 · Hours tab: 4 cards (schedule, use, goal, hour) + per-staff table
import React from "react";
import { Clock, CalendarDays, Target, Hourglass, LogIn, LogOut, Users } from "lucide-react";

interface Emp {
  id: string;
  name: string;
  role: string;
  status: string;
  scheduledHours: number;
  actualHours: number;
  shiftStart: string;
  shiftEnd: string;
}

interface HoursTabProps {
  hoursData: Emp[];
  onToggleClockStatus: (id: string) => void;
  totalHoursScheduled: number;
}

export default function HoursTab({ hoursData, onToggleClockStatus, totalHoursScheduled }: HoursTabProps) {
  const actual = hoursData.reduce((a, e) => a + e.actualHours, 0);
  const overtime = Math.max(0, actual - totalHoursScheduled);
  const goal = totalHoursScheduled;
  const remaining = Math.max(0, goal - actual);
  const clockedIn = hoursData.filter((e) => e.status === "Clocked In").length;

  const cards = [
    {
      id: "schedule",
      label: "Hour schedule",
      value: `${totalHoursScheduled.toFixed(0)}h`,
      sub: "planned this week",
      icon: CalendarDays,
      tone: "ok",
    },
    {
      id: "use",
      label: "Hour use",
      value: `${actual.toFixed(0)}h`,
      sub: `${overtime.toFixed(1)}h overtime`,
      icon: Clock,
      tone: overtime > 0 ? "warn" : "ok",
    },
    {
      id: "goal",
      label: "Hour goal",
      value: `${goal.toFixed(0)}h`,
      sub: `${remaining.toFixed(1)}h left`,
      icon: Target,
      tone: remaining > 0 ? "ok" : "warn",
    },
    {
      id: "hour",
      label: "Staff on shift",
      value: `${clockedIn}/${hoursData.length}`,
      sub: "currently clocked in",
      icon: Hourglass,
      tone: "ok",
    },
  ];

  return (
    <div className="page-shell space-y-5">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center shrink-0 shadow-lg shadow-[var(--accent)]/10">
            <Clock className="w-5 h-5 text-[var(--text)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">Hours</h1>
            <p className="text-xs text-[var(--muted)]">{hoursData.length} staff · {actual.toFixed(1)}h worked · {overtime.toFixed(1)}h OT</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.id} className="card card-hover p-5">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <span className={`pill text-[10px] ${k.tone === "warn" ? "warn" : "ok"}`}>
                  {k.tone === "warn" ? "attention" : "on track"}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-[11px] text-[var(--muted)] uppercase tracking-wide">{k.label}</div>
                <div className="mt-1 text-2xl font-semibold text-[var(--text)] font-mono">{k.value}</div>
                <div className="mt-1 text-[11px] text-[var(--muted)]">{k.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border)]">
          <Users className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Staff roster</h2>
          <span className="ml-auto text-[11px] text-[var(--muted)]">
            {hoursData.length} people · {clockedIn} clocked in
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--panel)] text-[10px] uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Role</th>
                <th className="text-left px-4 py-2 font-medium">Shift</th>
                <th className="text-right px-4 py-2 font-medium">Scheduled</th>
                <th className="text-right px-4 py-2 font-medium">Actual</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-right px-4 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {hoursData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-xs text-[var(--muted)]">
                    No staff scheduled.
                  </td>
                </tr>
              )}
              {hoursData.map((emp) => {
                const isIn = emp.status === "Clocked In";
                const variance = emp.actualHours - emp.scheduledHours;
                return (
                  <tr key={emp.id} className="border-t border-[var(--border)] hover:bg-[var(--panel)]/50">
                    <td className="px-4 py-3 text-[var(--text)] font-medium">{emp.name}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{emp.role}</td>
                    <td className="px-4 py-3 text-[var(--muted)] font-mono text-xs">
                      {emp.shiftStart}–{emp.shiftEnd}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--text)] font-mono">{emp.scheduledHours}h</td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className={variance < -2 ? "text-[var(--warn)]" : variance > 2 ? "text-[var(--bad)]" : "text-[var(--text)]"}>
                        {emp.actualHours}h
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`pill text-[10px] ${isIn ? "ok" : "warn"}`}>{emp.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onToggleClockStatus(emp.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--panel)] hover:bg-[var(--accent-soft)] text-[var(--text)] transition-colors border border-[var(--border)]"
                      >
                        {isIn ? <LogOut className="w-3 h-3" /> : <LogIn className="w-3 h-3" />}
                        {isIn ? "Clock out" : "Clock in"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
