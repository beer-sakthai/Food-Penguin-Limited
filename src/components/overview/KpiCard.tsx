import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  key?: string;
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "orange" | "emerald" | "rose" | "violet" | "amber";
  isLight: boolean;
  onClick?: () => void;
}

const toneClasses = {
  orange: "text-orange-500 bg-orange-500/10",
  emerald: "text-emerald-500 bg-emerald-500/10",
  rose: "text-rose-500 bg-rose-500/10",
  violet: "text-violet-500 bg-violet-500/10",
  amber: "text-amber-500 bg-amber-500/10",
};

export function KpiCard({ label, value, detail, icon: Icon, tone = "orange", isLight, onClick }: KpiCardProps) {
  const content = <>
    <p className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>{label}</p>
    <p className={`mt-2 text-2xl font-black tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>{value}</p>
    <p className={`mt-2 text-xs ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>{detail}</p>
  </>;

  const classes = `kpi-card rounded-xl border p-4 text-left transition-colors ${isLight ? "bg-white border-zinc-200 text-zinc-900" : "bg-zinc-900 border-zinc-800 text-white"} ${onClick ? "cursor-pointer" : ""}`;
  return onClick ? <button type="button" onClick={onClick} className={classes}>{content}</button> : <div className={classes}>{content}</div>;
}
