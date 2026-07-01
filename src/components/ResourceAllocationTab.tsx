import React, { useState } from 'react';
import { Share2, History, Truck, Package, Box, TrendingUp, AlertTriangle } from 'lucide-react';

interface AllocationRecord {
  id: string;
  item: string;
  quantity: number;
  fromBranch: string;
  toBranch: string;
  status: 'Pending' | 'In Transit' | 'Delivered';
  date: string;
}

interface ResourceAllocationTabProps {
  theme: 'light' | 'dark';
  branches: string[];
}

export default function ResourceAllocationTab({ theme, branches }: ResourceAllocationTabProps) {
  const isLight = theme === 'light';

  const [allocations, setAllocations] = useState<AllocationRecord[]>([
    {
      id: 'TRF-1029',
      item: 'Premium Cod Slabs',
      quantity: 50,
      fromBranch: 'Main Warehouse',
      toBranch: 'M&S Cork',
      status: 'In Transit',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: 'TRF-1028',
      item: 'Biodegradable Packaging',
      quantity: 500,
      fromBranch: 'Main Warehouse',
      toBranch: 'Tesco Mahon',
      status: 'Delivered',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
    }
  ]);

  const [newItem, setNewItem] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newFromBranch, setNewFromBranch] = useState(branches[0] || 'Main Warehouse');
  const [newToBranch, setNewToBranch] = useState(branches[1] || 'M&S Cork');

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem || !newQty) return;
    
    setAllocations(prev => [
      {
        id: `TRF-${Math.floor(Math.random() * 10000)}`,
        item: newItem,
        quantity: parseInt(newQty, 10),
        fromBranch: newFromBranch,
        toBranch: newToBranch,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      },
      ...prev
    ]);
    
    setNewItem('');
    setNewQty('');
  };

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      {/* Header section */}
      <div className="flex items-center gap-3">
        <Share2 className={`w-8 h-8 ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>Resource Allocation</h1>
          <p className={`text-sm ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Distribute supplies and track inter-branch deliveries.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Form */}
        <div className={`col-span-1 rounded-2xl border p-6 ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-950 border-zinc-800'}`}>
          <div className="flex items-center gap-2 mb-6">
            <Truck className={`w-5 h-5 ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
            <h2 className={`font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>New Transfer</h2>
          </div>

          <form onSubmit={handleAllocate} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Resource / Item</label>
              <input className={`input-gold-glow w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800 text-white'}`} type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="e.g. Flour, Packaging..." required/>
            </div>
            
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Quantity</label>
              <input className={`input-gold-glow w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800 text-white'}`} type="number" value={newQty} onChange={e => setNewQty(e.target.value)} min="1" placeholder="0" required/>
            </div>

            <div className="pt-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>From Branch</label>
              <select className={`input-gold-glow w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`} value={newFromBranch} onChange={e => setNewFromBranch(e.target.value)}>
                <option value="Main Warehouse">Main Warehouse</option>
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center my-0.5">
              <span className={`text-xs uppercase font-bold tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>To</span>
            </div>

            <div>
              <select className={`input-gold-glow w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`} value={newToBranch} onChange={e => setNewToBranch(e.target.value)}>
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
                <option value="Main Warehouse">Main Warehouse</option>
              </select>
            </div>

            <button type="submit" className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-amber-500/20 btn-interactive">
              Execute Transfer
            </button>
          </form>
        </div>

        {/* Right Col: List & Summary */}
        <div className={`col-span-1 lg:col-span-2 rounded-2xl border p-6 flex flex-col ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-950 border-zinc-800'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className={`w-5 h-5 ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
              <h2 className={`font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Active Transfers & History</h2>
            </div>
            <div className={`text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono font-bold`}>
              {allocations.filter(a => a.status === 'Pending' || a.status === 'In Transit').length} Active
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {allocations.length === 0 ? (
              <div className={`flex flex-col items-center justify-center h-48 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <Box className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">No transfer history available.</p>
              </div>
            ) : (
              allocations.map(req => (
                <div key={req.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-amber-500/50 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'}`}>
                  <div className="flex gap-4 items-center">
                    <div className={`p-2.5 rounded-lg border ${
                      req.status === 'Delivered' 
                        ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-500') 
                        : (isLight ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-950/30 border-amber-900/50 text-amber-500')
                    }`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${isLight ? 'bg-zinc-200/50 text-zinc-600' : 'bg-zinc-800 text-zinc-400'}`}>
                          {req.id}
                        </span>
                        <h4 className={`font-bold text-sm ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{req.item}</h4>
                      </div>
                      <p className={`text-xs mt-1 flex items-center gap-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        <span>{req.fromBranch}</span>
                        <span className="text-xs">→</span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{req.toBranch}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className={`text-sm font-bold font-mono ${isLight ? 'text-zinc-900' : 'text-white'}`}>x{req.quantity}</div>
                      <div className={`text-xs mt-0.5 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{req.date}</div>
                    </div>
                    <div className="w-24 text-right">
                      <span className={`text-xs uppercase font-bold tracking-wider px-2 py-1 rounded-full border ${
                        req.status === 'Delivered' ? (isLight ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50') :
                        req.status === 'Pending' ? (isLight ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-rose-400 bg-rose-950/40 border-rose-900/50') :
                        (isLight ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-amber-400 bg-amber-950/40 border-amber-900/50')
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
