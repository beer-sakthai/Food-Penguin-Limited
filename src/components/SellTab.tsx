import React, { useState } from 'react';
import { SalesOrder } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { 
  DollarSign, 
  ShoppingCart, 
  Image as ImageIcon,
  Sparkles,
  Download,
  AlertCircle,
  Plus
} from 'lucide-react';

interface SellTabProps {
  orders: SalesOrder[];
  onAddOrder: (order: Omit<SalesOrder, 'id' | 'timestamp'>) => void;
}

export const ASPECT_RATIOS = [
  { label: '1:1 Square', value: '1:1' },
  { label: '2:3 Portrait', value: '2:3' },
  { label: '3:2 Landscape', value: '3:2' },
  { label: '3:4 Book', value: '3:4' },
  { label: '4:3 Standard', value: '4:3' },
  { label: '9:16 Stories', value: '9:16' },
  { label: '16:9 Cinematic', value: '16:9' },
  { label: '21:9 UltraWide', value: '21:9' }
];

export default function SellTab({ orders, onAddOrder }: SellTabProps) {
  // New Order Form state
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Arctic Burgers');
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(12.50);

  // AI Menu Banner Maker state
  const [bannerPrompt, setBannerPrompt] = useState('A professional, delicious publicity photograph of premium Alaskan Cod fish burgers on ice, side of seaweed fries, high-end catalog style');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [generatedImg, setGeneratedImg] = useState<string>('');
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    onAddOrder({
      item: newItem,
      category: newCategory,
      quantity: newQty,
      amount: newPrice * newQty,
      status: 'Completed'
    });
    setNewItem('');
    setNewQty(1);
    setNewPrice(12.50);
  };

  const handleGenerateBanner = async () => {
    if (!bannerPrompt.trim()) return;
    setLoadingImage(true);
    setImageError('');
    setGeneratedImg('');
    try {
      const res = await fetch("/api/gemini/generate-marketing-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: bannerPrompt, aspectRatio: selectedRatio }),
      });
      const data = await res.json();
      if (data.error) {
        setImageError(`Error: ${data.error}`);
      } else {
        setGeneratedImg(data.imageUrl);
      }
    } catch (err: any) {
      setImageError(`Connection failure: ${err.message || err}`);
    } finally {
      setLoadingImage(false);
    }
  };

  const categoryData = orders.reduce((acc: any, order) => {
    if (!acc[order.category]) {
      acc[order.category] = { category: order.category, revenue: 0 };
    }
    acc[order.category].revenue += order.amount;
    return acc;
  }, {});
  const barData = Object.values(categoryData).sort((a: any, b: any) => b.revenue - a.revenue);

  // Utility to obtain matching Tailwind aspect ratios for the preview container
  const getTailwindAspectClass = (ratio: string) => {
    switch (ratio) {
      case '1:1': return 'aspect-square';
      case '2:3': return 'aspect-[2/3] max-w-[220px]';
      case '3:2': return 'aspect-[3/2]';
      case '3:4': return 'aspect-[3/4] max-w-[240px] font-sans';
      case '4:3': return 'aspect-[4/3]';
      case '9:16': return 'aspect-[9/16] max-w-[200px]';
      case '16:9': return 'aspect-[16/9]';
      case '21:9': return 'aspect-[21/9]';
      default: return 'aspect-video';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* LEFT & CENTER: LIVE SALES & TRANSACTION TERMINAL */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Quick Menu Overview */}
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm">
          <h2 className="text-sans font-bold text-white">Food Penguin Sushi Specialties</h2>
          <p className="text-xs text-zinc-500 uppercase font-semibold mt-0.5 mb-4">Standard pricing margins on primary sushi and sashimi product lines</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { name: 'Sushi Rolls', price: '€14.50', margin: '75% margin' },
              { name: 'Sashimi & Platters', price: '€28.90', margin: '70% margin' },
              { name: 'Specialty Rolls', price: '€19.00', margin: '78% margin' },
              { name: 'Nigiri Selections', price: '€16.00', margin: '82% margin' },
              { name: 'Bento Lunch Sets', price: '€22.50', margin: '68% margin' }
            ].map((cat, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex flex-col justify-between transition-all hover:bg-zinc-900 hover:shadow-md hover:border-orange-500/40">
                <span className="text-xs font-bold text-zinc-200">{cat.name}</span>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-800/60">
                  <span className="font-mono text-xs font-bold text-orange-400">{cat.price}</span>
                  <span className="text-[10px] text-emerald-450 bg-emerald-950/40 px-1.5 py-0.5 rounded font-mono font-medium">{cat.margin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Transaction Ledger and Chart */}
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-sans font-bold text-white">Active Order Ledger</h2>
              <p className="text-xs text-zinc-500">Live POS sales tracked since midnight</p>
            </div>
            <span className="bg-zinc-950 text-orange-400 font-mono text-[10px] px-3 py-1 rounded-full font-bold border border-zinc-800 self-start">
              {orders.length} Active Purchases
            </span>
          </div>

          <div className="h-56 mt-6 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={(val) => `€${val}`} />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : '#ea580c'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto border-t border-zinc-800 pt-4">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 text-[10px] uppercase font-mono tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Specialty Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-950/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">{order.id}</td>
                    <td className="py-3 px-4 text-zinc-500 font-mono">{order.timestamp}</td>
                    <td className="py-3 px-4 font-medium text-zinc-200">{order.item}</td>
                    <td className="py-3 px-4 text-zinc-400">{order.category}</td>
                    <td className="py-3 px-4 text-center font-mono">{order.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">€{order.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: ORDER CREATOR & BANNER GENERATOR */}
      <div className="space-y-6">
        
        {/* Mock POS Order Creator */}
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-800 mb-4 font-sans">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Kitchen POS Terminal</span>
          </div>

          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Specialty Item Name</label>
              <input
                type="text"
                required
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g. Kyoto Spicy Tuna Roll"
                className="w-full mt-1.5 p-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Grouping</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full mt-1.5 p-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option>Sushi Rolls</option>
                  <option>Sashimi & Platters</option>
                  <option>Specialty Rolls</option>
                  <option>Nigiri Selections</option>
                  <option>Bento Lunch Sets</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Unit Price (€)</label>
                <input
                  type="number"
                  step="0.10"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1.5 p-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewQty(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 border border-zinc-800 rounded-xl bg-zinc-950 flex items-center justify-center font-bold font-mono text-xs text-zinc-300 hover:bg-zinc-900 transition-all"
                >
                  -
                </button>
                <span className="font-mono text-xs font-bold text-zinc-200 w-4 text-center">{newQty}</span>
                <button
                  type="button"
                  onClick={() => setNewQty(prev => prev + 1)}
                  className="w-8 h-8 border border-zinc-800 rounded-xl bg-zinc-950 flex items-center justify-center font-bold font-mono text-xs text-zinc-300 hover:bg-zinc-900 transition-all"
                >
                  +
                </button>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-zinc-955 bg-zinc-950 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4 text-orange-400" />
                Commit POS Sale
              </button>
            </div>
          </form>
        </div>

        {/* AI Menu Banner Maker: Supports ratio control as requested */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2 font-sans">
              <ImageIcon className="w-5 h-5 text-orange-500" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">AI Banner Illustrator</span>
            </div>
            <span className="bg-teal-950/85 text-teal-400 border border-teal-900/40 font-mono text-[9px] px-2 py-0.5 rounded font-bold">
              gemini-2.5-flash-image
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Banner Marketing Prompt</label>
            <textarea
              value={bannerPrompt}
              onChange={(e) => setBannerPrompt(e.target.value)}
              className="w-full h-20 mt-1.5 p-3 text-xs border border-zinc-800 bg-zinc-900 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-sans shadow-inner leading-relaxed"
              placeholder="Describe the aesthetic and food element..."
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Controlled Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {ASPECT_RATIOS.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setSelectedRatio(r.value)}
                  className={`px-3 py-2 border text-[10px] rounded-xl text-left transition-all ${
                    selectedRatio === r.value
                      ? 'bg-orange-605 bg-orange-600 border-orange-600 text-white font-bold shadow'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateBanner}
            disabled={loadingImage}
            className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-sm disabled:bg-zinc-950"
          >
            {loadingImage ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Drawing Canvas...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Promotional Banner
              </>
            )}
          </button>

          {/* Render Result with matching simulated bounds */}
          {generatedImg && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold block">
                Visual Render Response ({selectedRatio}):
              </span>
              <div className="flex justify-center bg-black p-3 rounded-2xl border border-zinc-850 shadow-inner overflow-hidden">
                <img
                  src={generatedImg}
                  referrerPolicy="no-referrer"
                  alt="AI Food Penguin Banner"
                  className={`w-full max-h-[300px] object-contain rounded-xl ${getTailwindAspectClass(selectedRatio)}`}
                />
              </div>
            </div>
          )}

          {imageError && (
            <div className="p-3 bg-red-950/50 border border-red-900/60 rounded-xl text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="whitespace-pre-wrap">{imageError}</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
