import { useState } from 'react';
import { EmployeeHour } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  UserCheck, 
  CheckCircle2, 
  RefreshCw, 
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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* LEFT ASPECT: EMPLOYEES DIRECTORY & SIMULATORS */}
      <div className="xl:col-span-2 space-y-6">

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

        {/* Employee Roster List */}
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm text-white">
          <div className="pb-4">
            <h2 className="text-base font-sans font-semibold text-white">Current Crew Roll-Call</h2>
            <p className="text-xs text-zinc-500">Click actions to simulate live clocking and work register shifts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hoursData.map((emp) => (
              <div key={emp.id} className="border border-zinc-800 bg-zinc-950 rounded-xl p-4 flex flex-col justify-between group">
                <div className="flex justify-between items-start pb-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold">{emp.role}</span>
                    <h4 className="text-sm font-bold text-zinc-200">{emp.name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                    emp.status === 'Clocked In' 
                      ? 'bg-emerald-950/40 text-emerald-450 border border-emerald-900/40 animate-pulse' 
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}>
                    {emp.status}
                  </span>
                </div>

                <div className="border-t border-zinc-800 my-3 pt-3 flex justify-between items-center text-xs text-zinc-500">
                  <div className="font-mono text-[10px]">
                    <p>Shift: {emp.shiftStart} - {emp.shiftEnd}</p>
                    <p className="mt-0.5">Actual: {emp.actualHours} hrs / {emp.scheduledHours} hrs</p>
                  </div>

                  <button
                    onClick={() => onToggleClockStatus(emp.id)}
                    className={`px-3 py-1 text-[10px] rounded font-medium border transition-colors inline-flex items-center gap-1 ${
                      emp.status === 'Clocked Out'
                        ? 'bg-zinc-900 text-white hover:bg-zinc-850 border-zinc-800'
                        : 'bg-zinc-950 text-zinc-300 border border-zinc-800 hover:bg-zinc-900'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    {emp.status === 'Clocked Out' ? 'Clock In' : 'Clock Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT ASPECT SIDEBAR: SHIFT SWAP AI CONSULTANT */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-sm space-y-4 max-h-[550px] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-sans">
            <Contact className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Roster Swap Investigator</span>
          </div>
          <span className="bg-zinc-900 text-zinc-300 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold border border-zinc-800">
            gemini-3.1-flash-lite
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          Swapping staff can cause regulatory fatigue issues or lack of food-handling certifications. Type a shift-swap proposal and let the AI audit compliance:
        </p>

        <div>
          <label className="text-[10px] font-mono text-zinc-500 uppercase">Worker Swap Prompt</label>
          <textarea
            value={schedulerPrompt}
            onChange={(e) => setSchedulerPrompt(e.target.value)}
            className="w-full h-24 mt-1 p-2 border border-zinc-800 bg-zinc-900 text-white rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none shadow-inner"
          />
        </div>

        <button
          onClick={handleRosterResolve}
          disabled={complianceLoading}
          className="w-full py-2 bg-zinc-900 border border-zinc-800 disabled:bg-zinc-950 hover:bg-zinc-850 text-white text-xs font-medium rounded transition-all inline-flex justify-center items-center gap-1.5 shadow-sm"
        >
          {complianceLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Auditing Shift Integrity...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Authorize Schedule Swap
            </>
          )}
        </button>

        {schedulingResult && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-inner space-y-2 text-zinc-300">
            <span className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-bold block">Labor Compliance Assessment:</span>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">{schedulingResult}</p>
          </div>
        )}
      </div>

    </div>
  );
}
