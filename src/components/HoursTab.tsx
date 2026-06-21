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
 <div className="grid grid-cols-1 gap-6">

 {/* LEFT ASPECT: EMPLOYEES DIRECTORY & SIMULATORS */}
 <div className="space-y-6">

 {/* Shift Roster Summary metrics */}
 <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm text-white">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h2 className="text-sans font-bold text-white">Weekly Labor Allocation</h2>
 <p className="subtitle text-xs text-zinc-500">Live operational hours logged vs scheduled</p>
 </div>

 <div className="flex gap-3">
 <div className="bg-amber-950/40 border border-amber-900/40 p-3 rounded-2xl text-center min-w-[100px]">
 <span className="text-[9px] uppercase font-mono text-amber-400 block font-bold tracking-widest">Total Sched</span>
 <span className="text-xl font-black text-white block font-mono mt-1">{totalHoursScheduled}h</span>
 </div>
 <div className="bg-emerald-950/40 border border-emerald-900/40 p-3 rounded-2xl text-center min-w-[100px]">
 <span className="text-[9px] uppercase font-mono text-emerald-450 block font-bold tracking-widest">Active Staff</span>
 <span className="text-xl font-black text-white block font-mono mt-1">
 {hoursData.filter(e => e.status === 'Clocked In').length} / {hoursData.length}
 </span>
 </div>
 </div>
 </div>

 <div className="h-56 mt-6 mb-2">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={hoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
 <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
 <Tooltip 
 cursor={{ fill: '#1f2937' }}
 contentStyle={{ backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }}
 itemStyle={{ fontWeight: 'bold' }}
 />
 <Legend wrapperStyle={{ fontSize: '10px' }} iconType="circle" iconSize={6} />
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
              <thead className="bg-zinc-950 font-mono text-[10px] uppercase text-zinc-500">
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
                    <tr key={emp.id} className="bg-zinc-900 hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-200">{emp.name}</td>
                      <td className="px-4 py-3 text-[10px] font-mono text-zinc-400">
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
    </div>
  );
}
