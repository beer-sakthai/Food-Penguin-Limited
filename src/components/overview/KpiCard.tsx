// Saksee · 2026-07-24 · feat/new-design-system
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  key?: string | number;
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "accent" | "ok" | "bad" | "warn";
  onClick?: () => void;
}

const toneClasses = {
  accent: "text-[var(--accent)] bg-[var(--accent-soft)]",
  ok: "text-[var(--ok)] bg-emerald-500/10",
  bad: "text-[var(--bad)] bg-rose-500/10",
  warn: "text-[var(--warn)] bg-amber-500/10",
};

export function KpiCard({ label, value, detail, icon: Icon, tone = "accent", onClick }: KpiCardProps) {
  const content = <>
    <div className="flex items-center justify-between">
      <span className="metric-label">{label}</span>
      <span className={`w-7 h-7 rounded-md ${toneClasses[tone]} flex items-center justify-center`}>
        <Icon className="w-4 h-4" />
      </span>
    </div>
    <div className="mt-2 metric-value">{value}</div>
    <div className="mt-1 text-xs text-[var(--muted)]">{detail}</div>
  </>;

  const classes = `card text-left transition-all hover:shadow-lg/20 ${onClick ? "cursor-pointer" : ""}`;
  return onClick ? <button type="button" onClick={onClick} className={classes}>{content}</button> : <div className={classes}>{content}</div>;
}
