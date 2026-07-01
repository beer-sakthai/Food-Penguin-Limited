import { useState } from 'react';
import { EmployeeHour } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { 
 Clock, 
 Sparkles, 
 AlertTriangle, 
 UserCheck, 
 CheckCircle2, 
 
 Contact 
} from 'lucide-react';

interface HoursTabProps {
 hoursData: EmployeeHour[];
 onToggleClockStatus: (employeeId: string) => void;
 totalHoursScheduled: number;
}

export default function HoursTab({ hoursData, onToggleClockStatus, totalHoursScheduled }: HoursTabProps) {
 // Roster AI analyzer states
 const [schedulerPrompt, setSchedulerPrompt] = useState(
 "Junior Chef Private is scheduled to open tomorrow (08:00) but requires swap with Kitchen Aide Rico, who is scheduled for the night closing. Kowalski is supervisor. Review viability."
 );
 const [schedulingResult, setSchedulingResult] = useState('');
 const [complianceLoading, setComplianceLoading] = useState(false);

 const handleRosterResolve = async () => {
 if (!schedulerPrompt.trim()) return;
 setComplianceLoading(true);
 setSchedulingResult('');
 try {
 const commandText = `As Lead Workforce Compliance Officer of Food Penguin, analyze this schedule swap request: "${schedulerPrompt}". Check for role competency matches, worker fatigue issues (back-to-back shifts), and overall team cohesion. Answer in a few concise, structured bullet points.`;
 const res = await fetch("/api/gemini/low-latency-cmd", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ command: commandText }),
 });
 const data = await res.json();
 if (data.error) {
 setSchedulingResult(`Compliance Audit Error: ${data.error}`);
 } else {
 setSchedulingResult(data.text);
 }
 } catch (err: any) {
 setSchedulingResult(`Connection timed out: ${err.message || err}`);
 } finally {
 setComplianceLoading(false);
 }
 };

  return (
  <div className="w-full">

  {/* MAIN TWO COLUMN LAYOUT */}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

 {/* Shift Roster Summary metrics */}
 <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm text-white">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h2 className="text-sans font-bold text-white">Weekly Labor Allocation</h2>
 <p className="subtitle text-xs text-zinc-500">Live operational hours logged vs scheduled</p>
 </div>

 <div className="flex gap-3">
 <div className="bg-amber-950/40 border border-amber-900/40 p-3 rounded-2xl text-center min-w-[100px]">
 <span className="text-xs uppercase font-mono text-amber-400 block font-bold tracking-widest">Total Sched</span>
 <span className="text-3xl font-black text-white block font-mono mt-1">{totalHoursScheduled}h</span>
 </div>
 <div className="bg-emerald-950/40 border border-emerald-900/40 p-3 rounded-2xl text-center min-w-[100px]">
 <span className="text-xs uppercase font-mono text-emerald-450 block font-bold tracking-widest">Active Staff</span>
 <span className="text-3xl font-black text-white block font-mono mt-1">
 {hoursData.filter(e => e.status === 'Clocked In').length} / {hoursData.length}
 </span>
 </div>
 </div>
 </div>

 <div className="h-56 mt-6 mb-2">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={hoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 15 }} />
 <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 15 }} />
 <Tooltip 
 cursor={{ fill: '#1f2937' }}
 contentStyle={{ backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '15px' }}
 itemStyle={{ fontWeight: 'bold' }}
 />
 <Legend wrapperStyle={{ fontSize: '15px' }} iconType="circle" iconSize={6} />
 <Bar dataKey="scheduledHours" name="Scheduled" fill="#27272a" radius={[4, 4, 0, 0]} barSize={20} />
 <Bar dataKey="actualHours" name="Actual Logged" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 
        {/* Hour Plan and Hour Used */}
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm text-white">
          <div className="pb-4">
            <h2 className="text-base font-sans font-semibold text-white">Hour Plan & Hours Used in Branch</h2>
            <p className="text-xs text-zinc-500">Detailed review of scheduled hours vs. actual hours logged by staff</p>
          </div>

          <div className="overflow-hidden border border-zinc-800 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950 font-mono text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Team Member</th>
                  <th className="px-4 py-3">Role & Shift</th>
                  <th className="px-4 py-3 text-right">Hour Plan</th>
                  <th className="px-4 py-3 text-right">Hours Used</th>
                  <th className="px-4 py-3 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {hoursData.map((emp) => {
                  const variance = emp.scheduledHours - emp.actualHours;
                  return (
                    <tr key={emp.id} className="bg-zinc-900  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-200">{emp.name}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                        <span className="uppercase font-bold">{emp.role}</span>
                        <span className="block opacity-70">{emp.shiftStart} - {emp.shiftEnd}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-300">{emp.scheduledHours}h</td>
                      <td className="px-4 py-3 text-right font-mono text-amber-400">{emp.actualHours}h</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {variance > 0 ? (
                          <span className="text-emerald-400">-{variance.toFixed(1)}h</span>
                        ) : variance < 0 ? (
                          <span className="text-rose-400">+{Math.abs(variance).toFixed(1)}h</span>
                        ) : (
                          <span className="text-zinc-500">0h</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm text-white">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-sans font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Roster Swap Checker
              </h2>
              <p className="text-xs text-zinc-500">
                Use the empty space to test quick staff changes before changing the rota.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full border border-amber-900/50 bg-amber-950/30 text-amber-400 text-xs font-mono font-bold uppercase">
              AI helper
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
            <textarea
              value={schedulerPrompt}
              onChange={(event) => setSchedulerPrompt(event.target.value)}
              className="min-h-32 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              placeholder="Describe a staff swap, sick note, overtime risk, or shift coverage problem..."
            />
            <div className="flex lg:w-56 flex-col gap-3">
              <button
                type="button"
                onClick={handleRosterResolve}
                disabled={complianceLoading || !schedulerPrompt.trim()}
                className="rounded-2xl bg-orange-500 px-4 py-3 text-xs font-black uppercase tracking-wider text-zinc-950 shadow-sm transition-all hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {complianceLoading ? "Checking..." : "Check swap"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchedulerPrompt("");
                  setSchedulingResult("");
                }}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 active:scale-[0.98]"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 min-h-24">
            {schedulingResult ? (
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">
                {schedulingResult}
              </p>
            ) : (
              <div className="flex items-start gap-3 text-xs text-zinc-500">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p>
                  Results will show role fit, fatigue risk, and whether the shift still has enough coverage.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm text-white">
          <h2 className="text-base font-sans font-semibold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Live Clock Controls
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Quick status changes for the current branch team.
          </p>

          <div className="mt-4 space-y-2">
            {hoursData.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-zinc-200">
                    {employee.name}
                  </p>
                  <p className="text-xs font-mono text-zinc-500">
                    {employee.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleClockStatus(employee.id)}
                  className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-mono font-bold uppercase transition-all active:scale-[0.98] ${
                    employee.status === "Clocked In"
                      ? "border-rose-900/50 bg-rose-950/30 text-rose-400 hover:bg-rose-950"
                      : "border-emerald-900/50 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950"
                  }`}
                >
                  {employee.status === "Clocked In" ? "Clock out" : "Clock in"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
