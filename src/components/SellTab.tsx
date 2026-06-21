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
  selectedBranch: 'Marks & Spencer - Cork City' | 'Tesco - Cork City' | 'Tesco - Mahon Point';
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

const MS_PRODUCTS = [
  { name: 'Luxury Salmon & Caviar Platter', category: 'Sashimi & Platters', price: 34.50, margin: '76%' },
  { name: 'Gastropub Spicy Truffle Roll', category: 'Specialty Rolls', price: 19.95, margin: '73%' },
  { name: 'M&S Gold Grade Lobster Nigiri', category: 'Nigiri Selections', price: 24.00, margin: '80%' },
  { name: 'Handcrafted Premium Dragon Roll', category: 'Sushi Rolls', price: 17.50, margin: '78%' },
  { name: 'Gourmet Signature Bento Set', category: 'Bento Lunch Sets', price: 26.50, margin: '70%' }
];

const TESCO_PRODUCTS = [
  { name: 'YO! highlights', category: 'Specialty Selections', price: 11.25, margin: '74%', barcode: '5391548890457' },
  { name: 'veggie tofu yakisoba noodles', category: 'Noodles & Sides', price: 7.95, margin: '78%', barcode: '5391548890679' },
  { name: 'veggie gyoza - heat me first!', category: 'Gyoza & Starters', price: 5.95, margin: '82%', barcode: '5391548890150' },
  { name: 'TokYO! party platter', category: 'Party Platters', price: 16.75, margin: '71%', barcode: '5391548890549' },
  { name: 'teriyaki chicken udon noodles', category: 'Noodles & Sides', price: 8.25, margin: '76%', barcode: '5391548890730' },
  { name: 'Tokyo top 5', category: 'Specialty Selections', price: 11.25, margin: '75%', barcode: '5391548890495' },
  { name: 'teriyaki chicken rice bowl', category: 'Rice Bowls & Poké', price: 7.95, margin: '77%', barcode: '5391548890648' },
  { name: 'teriyaki chicken karaage', category: 'Warm Street Food', price: 7.75, margin: '79%', barcode: '5391548890129' },
  { name: 'sweet chilli chicken yakitori', category: 'Warm Street Food', price: 5.50, margin: '84%', barcode: '5391548890136' },
  { name: 'sriracha salmon poké bowl', category: 'Rice Bowls & Poké', price: 8.25, margin: '78%', barcode: '5391548890600' },
  { name: 'St Patrick\'s Irish stout karaage', category: 'Warm Street Food', price: 7.75, margin: '80%', barcode: '5391548892611' },
  { name: 'strawberry cheesecake mochi', category: 'Desserts & Sweets', price: 3.95, margin: '85%', barcode: '5391548890754' },
  { name: 'spicy veggie roll', category: 'Sushi Rolls', price: 5.50, margin: '81%', barcode: '5391548890266' },
  { name: 'Spicy salmon avocado sushi sando', category: 'Sushi Sandos', price: 4.95, margin: '83%', barcode: '5391548892512' },
  { name: 'spicy salmon & avocado roll', category: 'Sushi Rolls', price: 7.25, margin: '79%', barcode: '5391548890372' },
  { name: 'spicy california roll', category: 'Sushi Rolls', price: 5.95, margin: '81%', barcode: '5391548890303' },
  { name: 'spicy chicken katsu crunch roll', category: 'Sushi Rolls', price: 6.50, margin: '80%', barcode: '5391548890358' },
  { name: 'spicy prawn katsu roll', category: 'Sushi Rolls', price: 7.95, margin: '76%', barcode: '5391548890419' },
  { name: 'spice up YO! life', category: 'Specialty Selections', price: 11.25, margin: '75%', barcode: '5391548890464' },
  { name: 'Shinjuku Collection', category: 'Premium Assortments', price: 27.95, margin: '72%', barcode: '5391548892376' },
  { name: 'Shibuya Collection', category: 'Premium Assortments', price: 23.50, margin: '73%', barcode: '5391548892499' },
  { name: 'salmon maki', category: 'Maki Rolls', price: 4.50, margin: '84%', barcode: '5391548890020' },
  { name: 'salmon nigiri', category: 'Nigiri Duos', price: 6.95, margin: '82%', barcode: '5391548890051' },
  { name: 'seaweed salad', category: 'Sides & Starters', price: 3.95, margin: '86%', barcode: '5391548890174' },
  { name: 'salmon dragon roll', category: 'Sushi Rolls', price: 8.75, margin: '77%', barcode: '5391548890181' },
  { name: 'salmon sashimi', category: 'Sashimi Selections', price: 7.75, margin: '79%', barcode: '5391548890068' },
  { name: 'Salmon Poke', category: 'Rice Bowls & Poké', price: 8.25, margin: '77%', barcode: '5391548892642' },
  { name: 'Saikou! selects', category: 'Specialty Selections', price: 9.75, margin: '78%', barcode: '5391548890518' },
  { name: 'Sakana selects', category: 'Specialty Selections', price: 9.75, margin: '78%', barcode: '5391548890501' },
  { name: 'salmon classics', category: 'Specialty Selections', price: 9.75, margin: '78%', barcode: '5391548890440' },
  { name: 'pumpkin katsu rice bowl', category: 'Rice Bowls & Poké', price: 7.25, margin: '81%', barcode: '5391548890655' },
  { name: 'pumpkin katsu curry', category: 'Warm Street Food', price: 7.75, margin: '79%', barcode: '5391548890624' },
  { name: 'pumpkin katsu bao', category: 'Bao & Buns', price: 4.50, margin: '83%', barcode: '5391548890099' },
  { name: 'nigiri selection', category: 'Nigiri Duos', price: 6.95, margin: '82%', barcode: '5391548890044' },
  { name: 'Osaka veggie platter', category: 'Party Platters', price: 14.95, margin: '75%', barcode: '5391548890556' },
  { name: 'plant power', category: 'Specialty Selections', price: 8.50, margin: '80%', barcode: '5391548890471' },
  { name: 'mixed maki box', category: 'Maki Rolls', price: 6.75, margin: '81%', barcode: '5391548890525' },
  { name: 'Mexican Mango Salmon Sharer', category: 'Premium Assortments', price: 19.75, margin: '74%', barcode: '5391548892789' },
  { name: 'Mexican Mango Salmon Roll', category: 'Sushi Rolls', price: 7.95, margin: '77%', barcode: '5391548892741' },
  { name: 'Mexican Mango Salmon Bento', category: 'Bento Lunch Boxes', price: 11.25, margin: '76%', barcode: '5391548892765' },
  { name: 'Mexican Crunch Chicken Roll', category: 'Sushi Rolls', price: 6.95, margin: '79%', barcode: '5391548892734' },
  { name: 'korean chicken udon noodles', category: 'Noodles & Sides', price: 8.25, margin: '78%', barcode: '5391548890723' },
  { name: 'lucky dip', category: 'Specialty Selections', price: 12.95, margin: '76%', barcode: '5391548890488' },
  { name: 'Mexican Crunch Chicken Bento', category: 'Bento Lunch Boxes', price: 10.75, margin: '77%', barcode: '5391548892758' },
  { name: 'inari nigiri', category: 'Nigiri Duos', price: 4.75, margin: '84%', barcode: '5391548890037' },
  { name: 'Harajuku Collection', category: 'Premium Assortments', price: 33.50, margin: '70%', barcode: '5391548892406' },
  { name: 'Ginza Collection', category: 'Premium Assortments', price: 36.95, margin: '69%', barcode: '5391548892437' },
  { name: 'crunchy prawn katsu roll', category: 'Sushi Rolls', price: 8.25, margin: '78%', barcode: '5391548890426' },
  { name: 'crunchy salmon & avocado roll', category: 'Sushi Rolls', price: 7.50, margin: '80%', barcode: '5391548890389' },
  { name: 'crunchy veggie roll', category: 'Sushi Rolls', price: 5.75, margin: '81%', barcode: '5391548890273' },
  { name: 'chocolate mochi', category: 'Desserts & Sweets', price: 3.95, margin: '85%', barcode: '5391548890747' },
  { name: 'crunchy california roll', category: 'Sushi Rolls', price: 6.25, margin: '82%', barcode: '5391548890310' },
  { name: 'crunchy chicken katsu roll', category: 'Sushi Rolls', price: 6.25, margin: '82%', barcode: '5391548890341' },
  { name: 'Chicken Teriyaki Sushi Sando', category: 'Sushi Sandos', price: 4.75, margin: '83%', barcode: '5391548892505' },
  { name: 'chicken teriyaki roll', category: 'Sushi Rolls', price: 6.50, margin: '82%', barcode: '5391548890204' },
  { name: 'chicken yakisoba noodles', category: 'Noodles & Sides', price: 7.95, margin: '79%', barcode: '5391548890662' },
  { name: 'chicken katsu curry udon noodles', category: 'Noodles & Sides', price: 7.75, margin: '80%', barcode: '5391548890716' },
  { name: 'chicken teriyaki bao', category: 'Bao & Buns', price: 4.50, margin: '84%', barcode: '5391548890075' },
  { name: 'Chicken teriyaki Poke', category: 'Rice Bowls & Poké', price: 8.25, margin: '79%', barcode: '5391548892635' },
  { name: 'avocado maki', category: 'Maki Rolls', price: 3.50, margin: '86%', barcode: '5391548890006' },
  { name: 'chicken gyoza - heat me first!', category: 'Gyoza & Starters', price: 6.25, margin: '81%', barcode: '5391548890143' },
  { name: 'California sushi sando', category: 'Sushi Sandos', price: 4.75, margin: '83%', barcode: '5391548892529' },
  { name: 'california mango roll', category: 'Sushi Rolls', price: 6.50, margin: '82%', barcode: '5391548890198' },
  { name: 'chicken gyoza udon noodles', category: 'Noodles & Sides', price: 7.75, margin: '80%', barcode: '5391548890709' },
  { name: 'chicken katsu bao', category: 'Bao & Buns', price: 4.50, margin: '84%', barcode: '5391548890082' },
  { name: 'chicken katsu curry', category: 'Warm Street Food', price: 7.95, margin: '79%', barcode: '5391548890617' }
];

export default function SellTab({ orders, onAddOrder, selectedBranch }: SellTabProps) {
  const isMS = selectedBranch === 'Marks & Spencer - Cork City';
  const branchProducts = isMS ? MS_PRODUCTS : TESCO_PRODUCTS;
  const branchCategories = isMS 
    ? ['Sushi Rolls', 'Sashimi & Platters', 'Specialty Rolls', 'Nigiri Selections', 'Bento Lunch Sets']
    : Array.from(new Set(TESCO_PRODUCTS.map(p => p.category))).sort();

  // New Order Form state
  const [newItem, setNewItem] = useState(branchProducts[0].name);
  const [newCategory, setNewCategory] = useState(branchProducts[0].category);
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(branchProducts[0].price);

  const matchedProduct = branchProducts.find(p => p.name === newItem);
  const matchedBarcode = (matchedProduct as any)?.barcode;

  // Automatically sync presets and reset quantity when active store branch shifts
  React.useEffect(() => {
    const firstProduct = branchProducts[0];
    setNewItem(firstProduct.name);
    setNewCategory(firstProduct.category);
    setNewPrice(firstProduct.price);
    setNewQty(1);
  }, [selectedBranch]);

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
          <h2 className="text-sans font-bold text-white">
            {isMS ? '🇬🇧 Marks & Spencer Cork City - Luxury Selections' : `🇮🇪 ${selectedBranch} Active Daily Range`}
          </h2>
          <p className="text-xs text-zinc-500 uppercase font-semibold mt-0.5 mb-4 font-mono">
            {isMS 
              ? 'Signature crafted luxury pairings with premium premium margins'
              : 'Optimized high-volume value selections and Finest series'
            }
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {branchProducts.map((p, idx) => (
              <button 
                type="button"
                key={idx} 
                onClick={() => {
                  setNewItem(p.name);
                  setNewCategory(p.category);
                  setNewPrice(p.price);
                }}
                className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex flex-col justify-between text-left transition-all hover:bg-zinc-900 hover:shadow-md hover:border-amber-500/50 group/item cursor-pointer"
                title={`Click to load ${p.name} preset`}
              >
                <span className="text-xs font-bold text-zinc-200 group-hover/item:text-amber-400 transition-colors leading-tight">{p.name}</span>
                <span className="text-[10px] text-zinc-500 mt-1 leading-tight">{p.category}</span>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-800/60 w-full">
                  <span className="font-mono text-xs font-bold text-orange-400 font-sans">€{p.price.toFixed(2)}</span>
                  <span className="text-[9px] text-emerald-450 bg-emerald-950/45 px-1.5 py-0.5 rounded font-mono font-medium">{p.margin} margin</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Transaction Ledger and Chart */}
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-sans font-bold text-white">Active Order Ledger</h2>
              <p className="text-xs text-zinc-500 font-medium">Live POS sales logged at <span className="text-amber-450 font-semibold">{selectedBranch}</span></p>
            </div>
            <span className="bg-zinc-950 text-orange-400 font-mono text-[10px] px-3 py-1 rounded-full font-bold border border-zinc-800 self-start">
              {orders.length} Active {isMS ? 'M&S' : 'Tesco'} Transactions
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
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold block leading-none">Preset Product Select</label>
              <select
                value={branchProducts.some(p => p.name === newItem) ? newItem : ''}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const matched = branchProducts.find(p => p.name === e.target.value);
                  if (matched) {
                    setNewItem(matched.name);
                    setNewCategory(matched.category);
                    setNewPrice(matched.price);
                  }
                }}
                className="w-full mt-1.5 p-2.5 text-xs bg-zinc-950 border border-zinc-800 text-amber-550 font-bold rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">-- Or click custom / enter below --</option>
                {branchProducts.map((p) => (
                  <option key={p.name} value={p.name} className="bg-zinc-950 text-white font-bold">{p.name} (€{p.price.toFixed(2)})</option>
                ))}
              </select>
            </div>

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
                  {branchCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Unit Price (€)</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1.5 p-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                />
              </div>
            </div>

            {matchedBarcode && (
              <div className="bg-zinc-950 px-3 py-2 border border-zinc-850 rounded-xl flex items-center justify-between font-mono text-[10px] text-zinc-400 select-none">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">EAN-13 Barcode</span>
                <span className="text-amber-500 font-extrabold">{matchedBarcode}</span>
              </div>
            )}

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
