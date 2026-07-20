import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type TrendMetric = "Sales" | "Production" | "Waste" | "Hours" | "COGS";
interface TrendPanelProps { data: Array<Record<string, string | number>>; isLight: boolean; }
const colors: Record<TrendMetric, string> = { Sales: "#f97316", Production: "#10b981", Waste: "#f43f5e", Hours: "#eab308", COGS: "#8b5cf6" };
export function TrendPanel({ data, isLight }: TrendPanelProps) {
  const [metric, setMetric] = useState<TrendMetric>("Sales");
  return <section className={`gold-liner-box p-5 md:p-6 ${isLight ? "bg-white" : "bg-zinc-950"}`} aria-labelledby="performance-heading">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Performance</p><h2 id="performance-heading" className={`mt-1 text-xl font-black ${isLight ? "text-zinc-900" : "text-white"}`}>Weekly operating trend</h2><p className="mt-1 text-xs text-zinc-500">One view for the metric that matters most right now.</p></div><div className="flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">{(Object.keys(colors) as TrendMetric[]).map(item => <button key={item} type="button" onClick={() => setMetric(item)} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${metric === item ? "bg-orange-500 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}>{item}</button>)}</div></div>
    <div className="mt-6 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}><CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isLight ? "#e4e4e7" : "#27272a"} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: isLight ? "#71717a" : "#a1a1aa", fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: isLight ? "#71717a" : "#a1a1aa", fontSize: 11 }} /><Tooltip cursor={{ fill: isLight ? "#f4f4f5" : "#27272a" }} contentStyle={{ borderRadius: 12, border: "none", background: isLight ? "#fff" : "#18181b" }} /><Bar dataKey={metric} fill={colors[metric]} radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
  </section>;
}
