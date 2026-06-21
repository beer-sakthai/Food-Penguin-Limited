import React, { useState, useRef } from 'react';
import { Recipe, ProductionTask } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
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
  Camera
} from 'lucide-react';

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

export default function ProductionTab({ recipes, tasks, onAddTask, onUpdateTaskStatus }: ProductionTabProps) {
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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* LEFT: LIVE PRODUCTION QUEUE & TASKS */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Active Cooking Grid */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 shadow-sm text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-805 border-zinc-800">
            <div>
              <h2 className="text-base font-sans font-semibold text-white">Kitchen Thru-rate Monitoring</h2>
              <p className="text-xs text-zinc-500">Active chef workflows and queue states</p>
            </div>
            <span className="p-1 px-3 text-[10px] rounded-full bg-emerald-950/40 text-emerald-450 font-mono font-bold border border-emerald-900/40">
              {tasks.filter(t => t.status === 'Cooking').length} Active Pots
            </span>
          </div>

          <div className="h-40 mt-6 mb-4">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1f2937" />
                 <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                 <YAxis type="category" dataKey="status" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} />
                 <Tooltip 
                   cursor={{ fill: '#1f2937' }}
                   contentStyle={{ backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }}
                   itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                 />
                 <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                   {statusData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={STATUS_COLORS[index]} />
                   ))}
                 </Bar>
               </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-zinc-800/80">
            {tasks.map((task) => (
              <div key={task.id} className="border border-zinc-800 rounded-xl p-4 bg-zinc-950 flex justify-between items-start text-white">
                <div className="space-y-1">
                  <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] uppercase font-mono tracking-wide ${
                    task.priority === 'high' ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40' : task.priority === 'medium' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}>
                    {task.priority} speed
                  </span>
                  <h4 className="text-sm font-bold text-zinc-105 text-zinc-200">{task.itemName}</h4>
                  <p className="text-xs text-zinc-500 font-mono">Station: {task.assignedTo} | {task.quantity} items</p>
                </div>

                <div className="space-y-2 text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                    task.status === 'Prepared' ? 'bg-emerald-950/40 text-emerald-450 border border-emerald-900/40' : 
                    task.status === 'Cooking' ? 'bg-amber-950/40 text-amber-450 border border-amber-900/40 animate-pulse' : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    {task.status}
                  </span>

                  <div className="flex gap-1 justify-end font-sans">
                    {task.status === 'In Queue' && (
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'Cooking')}
                        className="p-1 px-2 border text-[10px] rounded bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-white"
                      >
                        Cook
                      </button>
                    )}
                    {task.status === 'Cooking' && (
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'Prepared')}
                        className="p-1 px-2 border text-[10px] rounded bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-white font-semibold"
                      >
                        Finish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Master Recipes Catalogue */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 shadow-sm text-white">
          <h2 className="text-base font-sans font-semibold text-white pb-1">Ocean-to-Plate Recipe Standard</h2>
          <p className="text-xs text-zinc-500 pb-4">Approved corporate dish compositions and prep profiles</p>

          <div className="space-y-3">
            {recipes.map((rcp) => (
              <div key={rcp.id} className="flex justify-between items-center border-b border-zinc-800/60 pb-3 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-zinc-200">{rcp.name}</h4>
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] font-mono text-zinc-500 font-medium">Prep: {rcp.prepTime} mins | Allergens:</span>
                    {rcp.allergens.map((alg, i) => (
                      <span key={i} className="px-1 text-[9px] bg-rose-950/40 text-rose-450 rounded border border-rose-900/30">{alg}</span>
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

      {/* RIGHT SIDE: KITCHEN CONTROLLER & CULINARY QUALITY SCANNER */}
      <div className="space-y-6">
        
        {/* Create task inline */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 shadow-sm text-white">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-800 mb-4 font-sans">
            <ChefHat className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Deploy Kitchen Work-slip</span>
          </div>

          <form onSubmit={handleSubmitTask} className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Select Specialty item</label>
              <select
                required
                value={taskItem}
                onChange={(e) => setTaskItem(e.target.value)}
                className="w-full mt-1 p-2 text-xs bg-zinc-950 border border-zinc-800 text-white rounded focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">-- Choose Recipe --</option>
                {recipes.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase">Station cook</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full mt-1 p-2 text-xs bg-zinc-950 border border-zinc-800 text-white rounded focus:ring-1 focus:ring-orange-500 focus:outline-none"
                >
                  <option>Chef Skipper</option>
                  <option>Chef Kowalski</option>
                  <option>Chef Private</option>
                  <option>Kitchen Aide Rico</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase">Quantity (pcs)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="w-full mt-1 p-2 text-xs bg-zinc-950 border border-zinc-800 text-white rounded focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Priority Index</label>
              <div className="grid grid-cols-3 gap-1.5 mt-1 text-center">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p as any)}
                    className={`p-1.5 border text-[10px] rounded uppercase font-mono transition-colors ${
                      priority === p 
                        ? 'bg-orange-500 text-white border-orange-600 font-bold' 
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:bg-zinc-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-white font-medium text-xs rounded transition-colors inline-flex justify-center items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              Issue Cooking Order
            </button>
          </form>
        </div>

        {/* Auditor Scanner (image-analysis): "Analyze images" requirement */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-sm space-y-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-sans">
              <Camera className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Kitchen Quality Auditor</span>
            </div>
            <span className="bg-zinc-900 text-zinc-300 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold border border-zinc-800">
              gemini-3.1-pro-preview
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            Upload a photo of finished food, ingredient shipments, or prep setups to analyze culinary standards, thickness, weight, and trim waste.
          </p>

          {/* Preset Buttons for Easy Instant Testing */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold block">Preset Simulation Plates:</span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_MOCK_DISHES.map((d, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => selectPresetDish(d)}
                  className="bg-zinc-900 border border-zinc-800 hover:border-orange-500 rounded p-1.5 text-left transition-all text-[10px] flex flex-col justify-between"
                >
                  <span className="font-semibold text-zinc-200 truncate block">{d.name}</span>
                  <span className="text-[8px] text-zinc-500 block truncate mt-1">Select dish</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-dashed border-zinc-800 rounded-lg p-4 bg-zinc-900/40 hover:bg-zinc-900 text-center transition-all">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {selectedPhoto ? (
              <div className="space-y-2">
                <div className="flex justify-center max-h-36 overflow-hidden rounded bg-zinc-950 p-2 border border-zinc-800">
                  {selectedPhoto.startsWith("data") ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedPhoto.includes("xml") ? selectedPhoto.replace("data:image/svg+xml;utf8,", "") : `<img src="${selectedPhoto}" class="object-contain max-h-32" />` }} />
                  ) : (
                    <p className="text-xs text-white">Image pre-loaded</p>
                  )}
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-emerald-500 font-mono truncate px-1 max-w-[150px]">{fileLabel}</span>
                  <button 
                    onClick={() => { setSelectedPhoto(''); setFileLabel('No photo captured'); }}
                    className="text-rose-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={handleUploadClick}
                className="w-full flex flex-col items-center justify-center p-2 text-zinc-400 hover:text-orange-450 gap-1"
              >
                <Upload className="w-6 h-6" />
                <span className="text-[11px] font-sans font-medium">Click to select raw photo</span>
                <span className="text-[9px] font-mono">Accepts Camera rollup & Image uploads</span>
              </button>
            )}
          </div>

          <button
            onClick={handleRunAudit}
            disabled={!selectedPhoto || auditorLoading}
            className="w-full py-2 bg-zinc-900 border border-zinc-805 border-zinc-800 disabled:bg-zinc-950 hover:bg-zinc-850 text-white text-xs font-medium rounded transition-colors inline-flex justify-center items-center gap-2 shadow-sm"
          >
            {auditorLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Auditor AI Calculating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-bounce text-orange-400" />
                Execute Optical Audit
              </>
            )}
          </button>

          {auditResult && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-inner space-y-2 text-zinc-300">
              <span className="text-[10px] uppercase font-mono tracking-wider text-rose-500 font-bold block">Optical Scan Analysis:</span>
              <p className="text-xs text-zinc-305 text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">{auditResult}</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
