import React, { useState } from 'react';
import { SalesOrder } from '../types';
import { useApi } from '../hooks/useApi';
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
  const [newCategory, setNewCategory] = useState('Nigiri');
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(12.50);

  // AI Menu Banner Maker state
  const [bannerPrompt, setBannerPrompt] = useState('A professional, delicious publicity photograph of premium salmon and bluefin tuna nigiri with a signature dragon roll on a slate board, garnished with wasabi and pickled ginger, high-end catalog style');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const { data: imageData, loading: loadingImage, error: imageError, execute: generateBannerApi } = useApi<{ imageUrl: string }>();
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    if (newQty <= 0 || newPrice <= 0) {
      alert("Error: Quantity and Unit Price must be greater than zero.");
      return;
    }
    if (newPrice > 10000) {
      alert("Error: Unit Price cannot exceed €10,000.");
      return;
    }
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

  const bannerApiCall = (params: { prompt: string, aspectRatio: string }) =>
    fetch("/api/gemini/generate-marketing-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }).then(res => res.json().then(data => {
      if (!res.ok || data.error) throw new Error(data.error || `Request failed with status ${res.status}`);
      return data;
    }));

  const handleGenerateBanner = async () => {
    if (!bannerPrompt.trim()) return;
    generateBannerApi(bannerApiCall, { prompt: bannerPrompt, aspectRatio: selectedRatio });
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
    <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 overflow-hidden">

      {/* LEFT & CENTER: LIVE SALES & TRANSACTION TERMINAL */}
      <div className="xl:col-span-2 space-y-4 min-h-0 overflow-y-auto scrollbar-hide">

        {/* Quick Menu Overview */}
        <div className="bg-white rounded-3xl border border-slate-205 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Food Penguin Limited Specialties</h2>
          <p className="text-xs text-slate-400 uppercase font-semibold mt-0.5 mb-4">Standard pricing margins on primary sushi product groups</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { name: 'Nigiri Sets', price: '€12.90', margin: '68% margin' },
              { name: 'Maki Rolls', price: '€8.50', margin: '74% margin' },
              { name: 'Sashimi Platters', price: '€24.90', margin: '65% margin' },
              { name: 'Signature Rolls', price: '€16.50', margin: '70% margin' },
              { name: 'Sides & Drinks', price: '€5.80', margin: '85% margin' }
            ].map((cat, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between transition-all hover:bg-white hover:shadow-sm hover:border-orange-200">
                <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                  <span className="font-mono text-xs font-bold text-orange-600">{cat.price}</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-medium">{cat.margin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Transaction Ledger and Chart */}
        <div className="bg-white rounded-3xl border border-slate-205 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Active Order Ledger</h2>
              <p className="text-xs text-slate-500">Live POS sales tracked since midnight</p>
            </div>
            <span className="bg-orange-50 text-orange-700 font-mono text-[10px] px-3 py-1 rounded-full font-bold border border-orange-100 self-start">
              {orders.length} Active Purchases
            </span>
          </div>

          <div className="h-56 mt-6 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(val) => `€${val}`} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : '#fdba74'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto border-t border-slate-100 pt-4">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-mono tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Specialty Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{order.id}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{order.timestamp}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{order.item}</td>
                    <td className="py-3 px-4 text-slate-500">{order.category}</td>
                    <td className="py-3 px-4 text-center font-mono">{order.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">€{order.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: ORDER CREATOR & BANNER GENERATOR */}
      <div className="space-y-4 min-h-0 overflow-y-auto scrollbar-hide">

        {/* Mock POS Order Creator */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-bold text-slate-905 uppercase tracking-wider">Kitchen POS Terminal</span>
          </div>

          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Specialty Item Name</label>
              <input
                type="text"
                required
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g. Glacier Salmon Nigiri (8pc)"
                className="w-full mt-1.5 p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Grouping</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full mt-1.5 p-2.5 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option>Nigiri</option>
                  <option>Maki Rolls</option>
                  <option>Signature Rolls</option>
                  <option>Sashimi</option>
                  <option>Sides & Drinks</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Unit Price (€)</label>
                <input
                  type="number"
                  step="0.10"
                  min="0.01"
                  max="10000"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1.5 p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewQty(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center font-bold font-mono text-xs text-slate-600 hover:bg-slate-100 transition-all"
                >
                  -
                </button>
                <span className="font-mono text-xs font-bold text-slate-800 w-4 text-center">{newQty}</span>
                <button
                  type="button"
                  onClick={() => setNewQty(prev => prev + 1)}
                  className="w-8 h-8 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center font-bold font-mono text-xs text-slate-600 hover:bg-slate-100 transition-all"
                >
                  +
                </button>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4 text-orange-400" />
                Commit POS Sale
              </button>
            </div>
          </form>
        </div>

        {/* AI Menu Banner Maker: Supports ratio control as requested */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-orange-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">AI Banner Illustrator</span>
            </div>
            <span className="bg-amber-100 text-amber-800 font-mono text-[9px] px-2 py-0.5 rounded font-bold">
              gemini-2.5-flash-image
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Banner Marketing Prompt</label>
            <textarea
              value={bannerPrompt}
              onChange={(e) => setBannerPrompt(e.target.value)}
              className="w-full h-20 mt-1.5 p-3 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-sans shadow-inner leading-relaxed"
              placeholder="Describe the aesthetic and food element..."
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Controlled Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {ASPECT_RATIOS.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setSelectedRatio(r.value)}
                  className={`px-3 py-2 border text-[10px] rounded-xl text-left transition-all ${selectedRatio === r.value
                      ? 'bg-slate-900 border-slate-900 text-white font-bold shadow'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
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
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-sm disabled:bg-slate-300"
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
          {imageData?.imageUrl && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                Visual Render Response ({selectedRatio}):
              </span>
              <div className="flex justify-center bg-slate-950 p-3 rounded-2xl border border-slate-900 shadow-inner">
                <img
                  src={imageData.imageUrl}
                  referrerPolicy="no-referrer"
                  alt="AI Food Penguin Banner"
                  className={`w-full max-h-[300px] object-contain rounded-xl ${getTailwindAspectClass(selectedRatio)}`}
                />
              </div>
            </div>
          )}

          {imageError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="whitespace-pre-wrap">{imageError}</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
