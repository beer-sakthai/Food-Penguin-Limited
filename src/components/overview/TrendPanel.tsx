import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type TrendMetric = "Sales" | "Production" | "Waste" | "Hours" | "COGS";
interface TrendPanelProps { data: Array<Record<string, string | number>>; isLight: boolean; }
const colors: Record<TrendMetric, string> = { Sales: "#f97316", Production: "#10b981", Waste: "#f43f5e", Hours: "#eab308", COGS: "#8b5cf6" };
export function TrendPanel({ data, isLight }: TrendPanelProps) {
  const [metric, setMetric] = useState<TrendMetric>("Sales");
  return <section className={`gold-liner-box p-4 ${isLight ? "bg-white" : "bg-zinc-950"}`}>
    <div className="flex items-center justify-between gap-3">
      <span className={`text-sm font-bold ${isLight ? "text-zinc-900" : "text-white"}`}>Weekly trend</span>
      <div className="flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">{(Object.keys(colors) as TrendMetric[]).map(item => <button key={item} type="button" onClick={() => setMetric(item)} className={`rounded-md px-2 py-1 text-[10px] font-bold ${metric === item ? "bg-orange-500 text-white" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}>{item}</button>)}</div>
    </div>
    <div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}><CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isLight ? "#e4e4e7" : "#27272a"} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: isLight ? "#71717a" : "#a1a1aa", fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: isLight ? "#71717a" : "#a1a1aa", fontSize: 11 }} /><Tooltip cursor={{ fill: isLight ? "#f4f4f5" : "#27272a" }} contentStyle={{ borderRadius: 12, border: "none", background: isLight ? "#fff" : "#18181b" }} /><Bar dataKey={metric} fill={colors[metric]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
  </section>;
}
