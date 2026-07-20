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
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{label}</p>
        <p className={`mt-2 text-2xl font-black tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>{value}</p>
      </div>
      <span className={`rounded-xl p-2.5 ${toneClasses[tone]}`}><Icon className="h-4 w-4" /></span>
    </div>
    <p className={`mt-4 text-xs ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>{detail}</p>
  </>;

  const classes = `gold-liner-box min-h-36 p-5 text-left transition-transform ${isLight ? "bg-white text-zinc-900" : "bg-zinc-950 text-white"} ${onClick ? "cursor-pointer hover:-translate-y-1" : ""}`;
  return onClick ? <button type="button" onClick={onClick} className={classes}>{content}</button> : <div className={classes}>{content}</div>;
}
