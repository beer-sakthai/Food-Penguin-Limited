import { motion } from 'motion/react';
import React, { useState, useRef } from 'react';

import {
  FolderHeart,
  ChefHat,
  Sparkles,
  CheckCircle2,
  Eye,
  FileText,
  AlertCircle,
  Plus,
  Upload,
  Camera,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, Legend, ComposedChart } from 'recharts';
import { Recipe, ProductionTask } from '../types';



interface ProductionTabProps {
  recipes: Recipe[];
  tasks: ProductionTask[];
  onAddTask: (task: Omit<ProductionTask, 'id'>) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: ProductionTask['status']) => void;
}


// Low-profile base64 image placeholders for instant simulation
const SAMPLE_MOCK_DISHES = [
  {
    name: "Cod Burger Double",
    data: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%230284c7'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='10'>Cod Burger</text></svg>",
    desc: "A freshly cooked double stack Alaskan Cod filet burger with dripping glacier-sauce."
  },
  {
    name: "Emperor Pizza",
    data: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%23b91c1c'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='10'>Emperor Pizza</text></svg>",
    desc: "Ultra thin sourdough pizza slice with molten mozzarella and charred pepperoni discs."
  },
  {
    name: "Peppermint Sundae",
    data: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%23059669'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='10'>Sweet Polar</text></svg>",
    desc: "Peppermint-infused gelato with chocolate crumbs and sugar crystal frost."
  }
];

export default function ProductionTab({ recipes, tasks, onAddTask, onUpdateTaskStatus, theme = 'dark' }: ProductionTabProps & { theme?: 'light' | 'dark' }) {
  // New production cooker task form
  const [taskItem, setTaskItem] = useState('');
  const [assignedTo, setAssignedTo] = useState('Chef Skipper');
  const [qty, setQty] = useState(1);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Auditor states
  const [auditResult, setAuditResult] = useState('');
  const [auditorLoading, setAuditorLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [fileLabel, setFileLabel] = useState('No photo captured');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLight = theme === 'light';


  const efficiencyData = [
    { hour: '08:00', volume: 45, target: 50, efficiency: 90 },
    { hour: '10:00', volume: 85, target: 80, efficiency: 106 },
    { hour: '12:00', volume: 150, target: 120, efficiency: 125 },
    { hour: '14:00', volume: 110, target: 110, efficiency: 100 },
    { hour: '16:00', volume: 60, target: 70, efficiency: 82 },
    { hour: '18:00', volume: 130, target: 140, efficiency: 92 },
    { hour: '20:00', volume: 90, target: 80, efficiency: 112 },
  ];

  const statusData = ['In Queue', 'Cooking', 'Prepared'].map(status => ({
    status,
    count: tasks.filter(t => t.status === status).reduce((sum, t) => sum + t.quantity, 0)
  }));
  const STATUS_COLORS: string[] = ['#94a3b8', '#f59e0b', '#10b981'];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLabel(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const selectPresetDish = (preset: typeof SAMPLE_MOCK_DISHES[0]) => {
    setSelectedPhoto(preset.data);
    setFileLabel(`Preset: ${preset.name}`);
  };

  const handleRunAudit = async () => {
    if (!selectedPhoto) return;
    setAuditorLoading(true);
    setAuditResult('');
    try {
      const res = await fetch("/api/gemini/analyze-dish-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedPhoto,
          mimeType: selectedPhoto.startsWith("data:image/png") ? "image/png" : "image/jpeg"
        })
      });
      const data = await res.json();
      if (data.error) {
        setAuditResult(`Audit error: ${data.error}`);
      } else {
        setAuditResult(data.analysis);
      }
    } catch (err: any) {
      setAuditResult(`Connection failed during culinary audit: ${err.message || err}`);
    } finally {
      setAuditorLoading(false);
    }
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskItem.trim()) return;
    onAddTask({
      itemName: taskItem,
      assignedTo,
      quantity: qty,
      priority,
      status: 'In Queue'
    });
    setTaskItem('');
    setQty(1);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 xl:grid-cols-2 gap-6 md:overflow-hidden">

      {/* LEFT: LIVE PRODUCTION QUEUE & TASKS */}
      <div className="lg:col-span-2 space-y-6 md:h-full md:overflow-y-auto md:pr-1">

        {/* Active Cooking Grid */}
        <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
            <div>
              <h2 className={`text-base font-sans font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Kitchen Thru-rate Monitoring</h2>
              <p className="text-xs text-zinc-500">Active chef workflows and queue states</p>
            </div>
            <span className={`p-1 px-3 text-xs rounded-full font-mono font-bold border ${isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/40 text-emerald-450 border-emerald-900/40'}`}>
              {tasks.filter(t => t.status === 'Cooking').length} Active Pots
            </span>
          </div>

          <div className="flex-1 min-h-[120px] mt-6 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isLight ? '#e4e4e7' : '#1f2937'} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 15 }} />
                <YAxis type="category" dataKey="status" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 15, fontWeight: 'bold' }} />
                <Tooltip
                  cursor={{ fill: isLight ? '#f4f4f5' : '#1f2937' }}
                  contentStyle={{ backgroundColor: isLight ? '#fff' : '#09090b', borderRadius: '12px', border: `1px solid ${isLight ? '#e4e4e7' : '#27272a'}`, color: isLight ? '#18181b' : '#fff', fontSize: '15px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {statusData.map((entry, index) => (
                    <Cell key={`prod-cell-${index}`} fill={STATUS_COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t ${isLight ? 'border-zinc-200' : 'border-zinc-800/80'}`}>
            {tasks.map((task) => (
              <div key={task.id} className={`border rounded-xl p-4 flex justify-between items-start ${isLight ? 'border-zinc-200 bg-white text-zinc-900' : 'border-zinc-800 bg-zinc-950 text-white'}`}>
                <div className="space-y-1">
                  <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-xs uppercase font-mono tracking-wide ${task.priority === 'high' ? (isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950/40 text-rose-400 border-rose-900/40') : task.priority === 'medium' ? (isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/40 text-amber-400 border-amber-900/40') : (isLight ? 'bg-zinc-100 text-zinc-600 border-zinc-200' : 'bg-zinc-900 text-zinc-400 border-zinc-800')
                    }`}>
                    {task.priority} speed
                  </span>
                  <h4 className={`text-sm font-bold ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{task.itemName}</h4>
                  <p className="text-xs text-zinc-500 font-mono">Station: {task.assignedTo} | {task.quantity} items</p>
                </div>

                <div className="space-y-2 text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono font-bold ${task.status === 'Prepared' ? (isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/40 text-emerald-450 border-emerald-900/40') :
                      task.status === 'Cooking' ? (isLight ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : 'bg-amber-950/40 text-amber-450 border-amber-900/40 animate-pulse') : (isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-900 text-zinc-400')
                    }`}>
                    {task.status}
                  </span>

                  <div className="flex gap-1 justify-end font-sans">
                    {task.status === 'In Queue' && (
                      <button className={`btn-interactive p-1 px-2 border text-xs rounded transition-colors ${isLight ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100' : 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800'}`} onClick={() => onUpdateTaskStatus(task.id, 'Cooking')}>
                        Cook
                      </button>
                    )}
                    {task.status === 'Cooking' && (
                      <button className={`btn-interactive p-1 px-2 border text-xs rounded font-semibold transition-colors ${isLight ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100' : 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800'}`} onClick={() => onUpdateTaskStatus(task.id, 'Prepared')}>
                        Finish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Production Volume & Efficiency Rates */}
        <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 border rounded-lg ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'border-emerald-900/40 bg-emerald-950/40 text-emerald-400'}`}>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`text-base font-sans font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Volume & Efficiency</h2>
                <p className="text-xs text-zinc-500">Hourly units produced against target expectations</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono font-bold uppercase tracking-wider">
              <div className={`flex items-center gap-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Actual
              </div>
              <div className={`flex items-center gap-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isLight ? 'bg-zinc-300' : 'bg-zinc-600'}`}></div> Target
              </div>
              <div className={`flex items-center gap-1.5 ${isLight ? 'text-amber-600' : 'text-amber-500'}`}>
                <div className="w-2 h-0.5 bg-amber-500"></div> Efficiency
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-4">
            {efficiencyData.map((data, idx) => {
              const isLow = data.efficiency < 85;
              const radius = 18;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (Math.min(data.efficiency, 100) / 100) * circumference;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/50 border-zinc-800/50'}`}
                >
                  <div className="relative flex items-center justify-center w-12 h-12 mb-1">
                    {isLow && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-rose-500/50"
                        initial={{ opacity: 0.5, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 1.4 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    <svg className="w-full h-full transform -rotate-90 relative z-10">
                      <circle cx="24" cy="24" r={radius} stroke={isLight ? '#e4e4e7' : '#27272a'} strokeWidth="4" fill="transparent" />
                      <motion.circle
                        cx="24" cy="24" r={radius}
                        stroke={isLow ? "#f43f5e" : "#f59e0b"}
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, delay: 0.5 + idx * 0.1, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={`absolute text-xs font-bold font-mono z-20 ${isLow ? (isLight ? 'text-rose-600' : 'text-rose-400') : (isLight ? 'text-zinc-700' : 'text-zinc-200')}`}>
                      {data.efficiency}%
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono tracking-wider">{data.hour}</span>
                </motion.div>
              );
            })}
          </div>
          <div className="flex-1 min-h-[160px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={efficiencyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e4e4e7' : '#27272a'} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#a1a1aa', fontSize: 15 }} />
                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#a1a1aa', fontSize: 15 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#a1a1aa', fontSize: 15 }} />
                <Tooltip
                  cursor={{ fill: isLight ? '#f4f4f5' : '#1f2937' }}
                  contentStyle={{ backgroundColor: isLight ? '#fff' : '#09090b', borderRadius: '12px', border: `1px solid ${isLight ? '#e4e4e7' : '#27272a'}`, color: isLight ? '#18181b' : '#fff', fontSize: '15px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Bar yAxisId="left" dataKey="volume" name="Actual Volume" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="left" dataKey="target" name="Target Volume" fill={isLight ? '#d4d4d8' : '#52525b'} radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#f59e0b' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Production Output vs Target Grouped Bar Chart */}
        <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800'} gap-2`}>
            <div>
              <h2 className={`text-base font-sans font-semibold flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                <Activity className="w-4 h-4 text-emerald-400" />
                Daily Culinary Output vs. Target
              </h2>
              <p className="text-xs text-zinc-500">Weekly comparison of actual items plated versus daily targets</p>
            </div>
            <span className="p-1 px-3 text-xs rounded-full bg-emerald-950/40 text-emerald-400 font-mono font-bold border border-emerald-900/40">
              92% Weekly Efficiency
            </span>
          </div>

          <div className="flex-1 min-h-[160px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { day: 'Mon', Output: 450, Target: 400 },
                { day: 'Tue', Output: 380, Target: 400 },
                { day: 'Wed', Output: 520, Target: 450 },
                { day: 'Thu', Output: 480, Target: 480 },
                { day: 'Fri', Output: 610, Target: 550 },
                { day: 'Sat', Output: 680, Target: 600 },
                { day: 'Sun', Output: 590, Target: 550 },
              ]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e4e4e7' : '#27272a'} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#a1a1aa', fontSize: 15 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#a1a1aa', fontSize: 15 }} />
                <Tooltip
                  cursor={{ fill: isLight ? '#f4f4f5' : '#1f2937', opacity: 0.3 }}
                  contentStyle={{ backgroundColor: isLight ? '#fff' : '#09090b', borderRadius: '12px', border: `1px solid ${isLight ? '#e4e4e7' : '#27272a'}`, color: isLight ? '#18181b' : '#fff', fontSize: '15px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '15px', paddingTop: '10px' }} />
                <Bar dataKey="Output" name="Actual Plated Items" fill="#10b981" radius={[3, 3, 0, 0]} barSize={20} />
                <Bar dataKey="Target" name="Culinary Target" fill={isLight ? '#a1a1aa' : '#4b5563'} radius={[3, 3, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Master Recipes Catalogue */}
        <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
          <h2 className={`text-base font-sans font-semibold pb-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>Ocean-to-Plate Recipe Standard</h2>
          <p className="text-xs text-zinc-500 pb-4">Approved corporate dish compositions and prep profiles</p>

          <div className="space-y-3">
            {recipes.map((rcp) => (
              <div key={rcp.id} className={`flex justify-between items-center border-b pb-3 last:border-0 last:pb-0 ${isLight ? 'border-zinc-200/60' : 'border-zinc-800/60'}`}>
                <div className="space-y-1">
                  <h4 className={`text-sm font-bold ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{rcp.name}</h4>
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-xs font-mono text-zinc-500 font-medium">Prep: {rcp.prepTime} mins | Allergens:</span>
                    {rcp.allergens.map((alg, i) => (
                      <span key={i} className={`px-1 text-xs rounded border ${isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950/40 text-rose-450 border-rose-900/30'}`}>{alg}</span>
                    ))}
                  </div>
                </div>

                <div className="max-w-xs text-right">
                  <p className="text-xs text-zinc-400 leading-snug font-sans">
                    {rcp.ingredients.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT: TASK INPUT & AI AUDIT */}
      <div className="space-y-6 md:h-full md:overflow-y-auto md:pr-1">

        {/* Add Task Form */}
        <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-amber-500" />
            <h2 className={`text-base font-sans font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Queue New Dish</h2>
          </div>

          <form onSubmit={handleSubmitTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-400">Dish Name</label>
              <input className={`input-gold-glow w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'}`} type="text" value={taskItem} onChange={e => setTaskItem(e.target.value)} placeholder="e.g. Classic Cod Slabs" required />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-400">Chef Station</label>
              <select className={`input-gold-glow w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-300'}`} value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                <option value="Chef Skipper">Chef Skipper (Grill)</option>
                <option value="Chef Rico">Chef Rico (Fryer)</option>
                <option value="Chef Kowalski">Chef Kowalski (Prep)</option>
                <option value="Chef Private">Chef Private (Plating)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-400">Quantity</label>
                <input className={`input-gold-glow w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'}`} type="number" min="1" value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-400">Priority</label>
                <select className={`input-gold-glow w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-300'}`} value={priority} onChange={e => setPriority(e.target.value as any)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 btn-interactive">
              <ChefHat className="w-4 h-4" />
              Dispatch Order
            </button>
          </form>
        </div>

        {/* AI Culinary Auditor */}
        <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-base font-sans font-semibold flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              <Camera className="w-4 h-4 text-amber-500" />
              AI Culinary Auditor
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Upload a photo of a plated dish for instant AI quality compliance analysis against standard recipes.</p>

          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden input-gold-glow"
              accept="image/*"
              onChange={handleFileChange}
            />

            <div className="grid grid-cols-3 gap-2 mb-3">
              {SAMPLE_MOCK_DISHES.map((d, i) => (
                <button className={`btn-interactive p-2 border rounded flex flex-col items-center gap-1 hover:border-amber-500/50 transition-colors ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-950'}`} key={i} onClick={() => selectPresetDish(d)} title={d.desc}>
                  <img src={d.data} alt={d.name} className="w-8 h-8 rounded" />
                  <span className="text-xs font-bold text-zinc-400 text-center truncate w-full">{d.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUploadClick}
                className={`flex items-center gap-1 px-3 py-2 border rounded-xl text-xs font-mono font-bold transition-colors hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] btn-interactive ${isLight ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'}`}
              >
                <Upload className="w-3 h-3" />
                Select
              </button>
              <span className="text-xs text-zinc-500 font-mono truncate flex-1">{fileLabel}</span>
            </div>

            <button
              onClick={handleRunAudit}
              disabled={auditorLoading || !selectedPhoto}
              className={`w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all ${(auditorLoading || !selectedPhoto)
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                } hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all `}
            >
              {auditorLoading ? 'INSPECTING...' : 'RUN AUDIT'}
            </button>

            {auditResult && (
              <div className="p-4 rounded-xl mt-4 text-xs leading-relaxed border bg-amber-950/20 border-amber-900/40 text-amber-50">
                {auditResult}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
