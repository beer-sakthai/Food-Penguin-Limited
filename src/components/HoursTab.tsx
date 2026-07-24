// Saksee · 2026-07-24 · feat/density-cut
import React from "react";
import { Clock, Power } from "lucide-react";
interface Emp { id: string; name: string; role: string; status: string; scheduledHours: number; actualHours: number; shiftStart: string; shiftEnd: string; }
export default function HoursTab(props: { hoursData: Emp[]; onToggleClockStatus: (id: string) => void; totalHoursScheduled: number; }) {
  const { hoursData, onToggleClockStatus, totalHoursScheduled } = props;
  const inCount = hoursData.filter(e => e.status === "Clocked In").length;
  const actual = hoursData.reduce((a, e) => a + e.actualHours, 0);
  const ot = Math.max(0, actual - totalHoursScheduled);
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><Clock className="w-5 h-5 text-[var(--accent)]" />Hours</h1>
        <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{hoursData.length} staff · {inCount} on shift · {ot.toFixed(1)}h overtime</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Clocked in", value: inCount, sub: "active now" },
          { label: "Scheduled", value: `${totalHoursScheduled}h`, sub: "weekly" },
          { label: "Actual", value: `${actual.toFixed(0)}h`, sub: "worked" },
          { label: "Overtime", value: `${ot.toFixed(1)}h`, sub: ot > 0 ? "over budget" : "on target" },
        ].map((k, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <div className="text-[10px] font-mono uppercase tracking-wide text-[var(--muted)]">{k.label}</div>
            <div className="text-2xl font-bold text-[var(--text)] mt-1">{k.value}</div>
            <div className="text-[10px] font-mono text-[var(--muted)] mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--panel)] text-[var(--muted)]"><tr><th className="text-left px-4 py-2 font-medium">Name</th><th className="text-left px-4 py-2 font-medium">Role</th><th className="text-left px-4 py-2 font-medium">Status</th><th className="text-right px-4 py-2 font-medium">Scheduled</th><th className="text-right px-4 py-2 font-medium">Actual</th><th className="text-left px-4 py-2 font-medium">Shift</th><th className="text-right px-4 py-2 font-medium"></th></tr></thead>
          <tbody>{hoursData.map(e => (
            <tr key={e.id} className="border-t border-[var(--border)] hover:bg-[var(--panel)]">
              <td className="px-4 py-2 font-medium text-[var(--text)]">{e.name}</td>
              <td className="px-4 py-2 text-[var(--muted)]">{e.role}</td>
              <td className="px-4 py-2"><span className={`text-[10px] font-mono uppercase ${e.status === "Clocked In" ? "text-[var(--ok)]" : "text-[var(--muted)]"}`}>{e.status}</span></td>
              <td className="px-4 py-2 text-right font-mono">{e.scheduledHours}h</td>
              <td className="px-4 py-2 text-right font-mono">{e.actualHours}h</td>
              <td className="px-4 py-2 text-[var(--muted)] font-mono">{e.shiftStart}–{e.shiftEnd}</td>
              <td className="px-4 py-2 text-right">
                <button type="button" onClick={() => onToggleClockStatus(e.id)}
                  className="text-[10px] font-mono px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] flex items-center gap-1 ml-auto">
                  <Power className="w-3 h-3" />{e.status === "Clocked In" ? "Out" : "In"}
                </button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
