// Saksee · 2026-07-24 · feat/new-design-system
import React from "react";
import { Clock, Power } from "lucide-react";

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

export default function HoursTab(props: {
  hoursData: Emp[];
  onToggleClockStatus: (id: string) => void;
  totalHoursScheduled: number;
}) {
  const { hoursData, onToggleClockStatus, totalHoursScheduled } = props;
  const inCount = hoursData.filter(e => e.status === "Clocked In").length;
  const actual = hoursData.reduce((a, e) => a + e.actualHours, 0);
  const ot = Math.max(0, actual - totalHoursScheduled);

  const cards = [
    { label: "Clocked in", value: inCount, sub: "active now", tone: "up" },
    { label: "Scheduled", value: `${totalHoursScheduled}h`, sub: "weekly" },
    { label: "Actual", value: `${actual.toFixed(0)}h`, sub: "worked" },
    { label: "Overtime", value: `${ot.toFixed(1)}h`, sub: ot > 0 ? "over budget" : "on target", tone: ot > 0 ? "down" : "up" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <Clock className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Hours</h1>
          <p className="text-xs text-[var(--muted)]">{hoursData.length} staff · {inCount} on shift · {ot.toFixed(1)}h overtime</p>
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

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-right">Scheduled</th>
              <th className="text-right">Actual</th>
              <th>Shift</th>
              <th className="text-right"></th>
            </tr>
          </thead>
          <tbody>
            {hoursData.map(e => (
              <tr key={e.id}>
                <td className="font-medium">{e.name}</td>
                <td className="text-[var(--muted)]">{e.role}</td>
                <td>
                  <span className={`pill ${e.status === "Clocked In" ? "ok" : ""}`}>
                    {e.status}
                  </span>
                </td>
                <td className="text-right font-mono">{e.scheduledHours}h</td>
                <td className="text-right font-mono">{e.actualHours}h</td>
                <td className="font-mono text-[var(--muted)]">{e.shiftStart}–{e.shiftEnd}</td>
                <td className="text-right">
                  <button
                    type="button"
                    onClick={() => onToggleClockStatus(e.id)}
                    className="btn btn-ghost text-[11px]"
                  >
                    <Power className="w-3.5 h-3.5" /> {e.status === "Clocked In" ? "Out" : "In"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
