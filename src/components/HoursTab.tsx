// Saksee · 2026-07-25 · Hours tab: only 4 cards (schedule, use, goal, hour)
import React from "react";
import { Clock, CalendarDays, Target, Hourglass } from "lucide-react";

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

export default function HoursTab({ hoursData, totalHoursScheduled }: HoursTabProps) {
  const actual = hoursData.reduce((a, e) => a + e.actualHours, 0);
  const overtime = Math.max(0, actual - totalHoursScheduled);
  const goal = totalHoursScheduled;
  const remaining = Math.max(0, goal - actual);

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
      label: "Hour",
      value: `${hoursData.length}`,
      sub: "staff rostered",
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
    </div>
  );
}
