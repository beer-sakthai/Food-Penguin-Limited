import { motion } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertTriangle, TrendingUp, Cpu, Server, CheckCircle2 } from 'lucide-react';

interface RealtimeTabProps {
  theme?: 'light' | 'dark';
}

export default function RealtimeTab({ theme = 'dark' }: RealtimeTabProps) {
  const isLight = theme === 'light';
  
  const [activeOrders, setActiveOrders] = useState(12);
  const [productionRate, setProductionRate] = useState(145);
  const [wasteAlerts, setWasteAlerts] = useState<{ id: number; message: string; time: string }[]>([]);
  const [systemUptime, setSystemUptime] = useState(99.98);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update orders (mostly staying around 10-25)
      setActiveOrders(prev => Math.max(5, Math.min(35, prev + (Math.floor(Math.random() * 5) - 2))));
      
      // Update production rate (fluctuating)
      setProductionRate(prev => Math.max(80, Math.min(220, prev + (Math.floor(Math.random() * 15) - 6))));
      
      // Randomly add waste alerts
      if (Math.random() > 0.85) {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const newAlert = {
          id: Date.now(),
          message: `High temp detected at assembly line ${Math.floor(Math.random() * 4) + 1}`,
          time: timeStr
        };
        setWasteAlerts(prev => [newAlert, ...prev].slice(0, 5));
      }
      
      setSystemUptime(prev => prev + 0.0001);
    }, 3000); // update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className={`w-8 h-8 ${isLight ? 'text-rose-600' : 'text-rose-500'} animate-pulse`} />
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>Live Telemetry</h1>
          <p className={`text-sm ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Real-time operational streams</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Orders */}
        <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white/95 backdrop-blur-md shadow-lg border-zinc-200 shadow-sm' : 'bg-black border-zinc-800'}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Active Orders</h3>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className={`text-4xl font-mono font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>{activeOrders}</div>
          <div className={`text-xs mt-2 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Updated just now</div>
        </div>

        {/* Production Rate */}
        <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white/95 backdrop-blur-md shadow-lg border-zinc-200 shadow-sm' : 'bg-black border-zinc-800'}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Production Rate</h3>
            <TrendingUp className={`w-4 h-4 ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
          </div>
          <div className={`text-4xl font-mono font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            {productionRate}<span className="text-lg text-zinc-500"> /hr</span>
          </div>
          <div className={`text-xs mt-2 flex items-center gap-1 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
            <TrendingUp className="w-3 h-3" /> Target: 130/hr
          </div>
        </div>

        {/* System Uptime */}
        <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white/95 backdrop-blur-md shadow-lg border-zinc-200 shadow-sm' : 'bg-black border-zinc-800'}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>System Uptime</h3>
            <Server className={`w-4 h-4 ${isLight ? 'text-indigo-500' : 'text-indigo-400'}`} />
          </div>
          <div className={`text-4xl font-mono font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            {systemUptime.toFixed(2)}%
          </div>
          <div className={`text-xs mt-2 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>All services operational</div>
        </div>

        {/* Equipment Status */}
        <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white/95 backdrop-blur-md shadow-lg border-zinc-200 shadow-sm' : 'bg-black border-zinc-800'}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Equipment</h3>
            <Cpu className={`w-4 h-4 ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
          </div>
          <div className={`text-4xl font-mono font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>4/5</div>
          <div className={`text-xs mt-2 flex items-center gap-1 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
            <AlertTriangle className="w-3 h-3" /> 1 under maintenance
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border ${isLight ? 'bg-white/95 backdrop-blur-md shadow-lg border-zinc-200 shadow-sm' : 'bg-black border-zinc-800'}`}>
        <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
          <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            <AlertTriangle className={`w-4 h-4 ${isLight ? 'text-rose-500' : 'text-rose-400'}`} /> Live Alerts Log
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {wasteAlerts.length === 0 ? (
            <div className={`flex items-center gap-2 py-4 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">No recent alerts. System is nominal.</span>
            </div>
          ) : (
            wasteAlerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-xl border flex items-center justify-between animate-in slide-in-from-top-2 ${ isLight ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-rose-950/20 border-rose-900/50 text-rose-300' }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isLight ? 'bg-rose-500' : 'bg-rose-400'}`} />
                  <span className="text-sm font-medium">{alert.message}</span>
                </div>
                <span className={`text-xs font-mono ${isLight ? 'text-rose-500' : 'text-rose-400/70'}`}>{alert.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
