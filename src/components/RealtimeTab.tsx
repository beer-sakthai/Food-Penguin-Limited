import React, { useState, useEffect } from 'react';
import { RealtimeAlert } from '../types';
import { 
  Radio, 
  Sparkles, 
  Cpu, 
  Activity, 
  Send, 
  Flame, 
  Snowflake, 
  AlertTriangle, 
  CheckCircle2,
  Clock
} from 'lucide-react';

interface RealtimeTabProps {
  alerts: RealtimeAlert[];
}

export default function RealtimeTab({ alerts }: RealtimeTabProps) {
  // Fluctuating Simulated Sensors state
  const [sensors, setSensors] = useState([
    { name: 'Cold-Storage Freezy-01', temp: -18.4, status: 'Normal', suffix: '°C' },
    { name: 'Seafood Deep Chamber', temp: -12.1, status: 'Warning', suffix: '°C' },
    { name: 'Glacier Double Oven', temp: 185.2, status: 'Normal', suffix: '°C' },
    { name: 'Dishwasher Rinsing Tank', temp: 82.5, status: 'Normal', suffix: '°C' }
  ]);

  // Low latency prompt state
  const [lowLatencyCmd, setLowLatencyCmd] = useState('warn skipper seafood temp warning');
  const [copilotReply, setCopilotReply] = useState('');
  const [loadingCopilot, setLoadingCopilot] = useState(false);

  // Tick the temperatures slightly every 3 seconds to look alive
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => prev.map(s => {
        const delta = (Math.random() - 0.5) * 0.4;
        let newTemp = parseFloat((s.temp + delta).toFixed(1));
        if (s.name.includes('Oven')) {
          newTemp = parseFloat((s.temp + (Math.random() - 0.5) * 1.5).toFixed(1));
        }
        let status = 'Normal';
        if (s.name.includes('Seafood') && newTemp > -12.5) {
          status = 'Warning';
        } else if (newTemp > 0 && !s.name.includes('Oven') && !s.name.includes('Dishwasher')) {
          status = 'Critical';
        }
        return { ...s, temp: newTemp, status };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSendQuickCmd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lowLatencyCmd.trim()) return;
    setLoadingCopilot(true);
    setCopilotReply('');
    try {
      const res = await fetch("/api/gemini/low-latency-cmd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: lowLatencyCmd }),
      });
      const data = await res.json();
      if (data.error) {
        setCopilotReply(`Error: ${data.error}`);
      } else {
        setCopilotReply(data.text);
      }
    } catch (err: any) {
      setCopilotReply(`Connection lag: ${err.message || err}`);
    } finally {
      setLoadingCopilot(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 overflow-hidden">

      {/* LEFT ASPECT: TELEMETRY INTERFACES & GAUGES */}
      <div className="xl:col-span-2 space-y-4 min-h-0 overflow-y-auto scrollbar-hide">

        {/* Live Flashing Header Sensors */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-6">
            <div>
              <h2 className="text-base font-sans font-semibold text-slate-900 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                Active Cold-Chain Telemetry
              </h2>
              <p className="text-xs text-slate-500">Fluctuating thermal state indices for kitchen units</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sensors.map((s, i) => (
              <div key={i} className="border border-slate-150 rounded-xl p-4 bg-slate-50 flex items-center justify-between group">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono block tracking-wide font-bold uppercase">{s.name}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-sans font-bold text-slate-900 tracking-tight font-mono">{s.temp}</span>
                    <span className="text-slate-400 text-sm">{s.suffix}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-2.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                    s.status === 'Normal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    ● {s.status}
                  </span>
                  <div className="text-[9px] text-slate-400 font-mono mt-2">
                    {s.name.includes('Cold') || s.name.includes('Deep') ? 'Freezer Probe' : 'Heating Element'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Incident Audit Stream */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-sans font-semibold text-slate-900">Live Sensory Alarms & Events</h2>
              <p className="text-xs text-slate-500">Real-time chronos logs of food kitchen probes</p>
            </div>
            <Activity className="w-5 h-5 text-sky-500 animate-pulse" />
          </div>

          <div className="space-y-3.5 pt-4">
            {alerts.map((al) => (
              <div key={al.id} className="flex gap-3 text-xs leading-relaxed">
                <div className="w-20 font-mono text-slate-400 text-[10px] shrink-0 pt-0.5">{al.timestamp}</div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-800">{al.sensor}</span>
                    <span className={`px-1 rounded text-[9px] font-mono font-medium ${
                      al.status === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {al.value}
                    </span>
                  </div>
                  <p className="text-slate-500 font-sans">{al.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT ASPECT SIDEBAR: LOW-LATENCY COPILOT CHAT */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 min-h-0 overflow-y-auto scrollbar-hide flex flex-col justify-between">
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-sky-650" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-widest font-sans">Kitchen Dispatcher</span>
            </div>
            <span className="bg-sky-100 text-sky-800 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse">
              gemini-3.1-flash-lite
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            Under-sub-second rapid floor responses. Throw quick operational checks, warnings or alerts to kitchen leads:
          </p>

          <form onSubmit={handleSendQuickCmd} className="space-y-2 pt-2">
            <div className="relative">
              <input
                type="text"
                required
                value={lowLatencyCmd}
                onChange={(e) => setLowLatencyCmd(e.target.value)}
                placeholder="e.g. notify kowalski to check deep chamber temp"
                className="w-full p-2.5 pr-10 text-xs border border-slate-250 bg-white rounded focus:ring-1 focus:ring-sky-500 focus:outline-none shadow-inner text-slate-805"
              />
              <button
                type="submit"
                disabled={loadingCopilot}
                className="absolute right-1.5 top-1.5 p-1 text-slate-500 hover:text-sky-600 focus:outline-none disabled:text-slate-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block">Speed-priority response engine (<span className="text-emerald-500 font-bold">Fast-Lite</span>)</span>
          </form>

          {copilotReply && (
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-inner space-y-1 mt-3">
              <span className="text-[10px] uppercase font-mono tracking-wider text-sky-650 font-bold block">Dispatcher Response:</span>
              <p className="text-xs text-slate-755 leading-relaxed font-sans">{copilotReply}</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>Simulation Active</span>
          <span>Latency: ~80ms</span>
        </div>

      </div>

    </div>
  );
}
