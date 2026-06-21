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
  Plus,
  Printer,
  EyeOff
} from 'lucide-react';

interface SellTabProps {
  orders: SalesOrder[];
  onAddOrder: (order: Omit<SalesOrder, 'id' | 'timestamp'>) => void;
  selectedBranch: 'Marks & Spencer - Cork City' | 'Tesco - Cork City' | 'Tesco - Mahon Point';
  theme: 'dark' | 'light';
}

// Highly authentic visual barcode renderer according to standard UPC-A/EAN-13 binary representation
export function Barcode({ value, isLight }: { value: string; isLight: boolean }) {
  const bars = React.useMemo(() => {
    let pattern: number[] = [];
    // Start guards
    pattern.push(1, 0, 1);
    for (let i = 0; i < value.length; i++) {
      const num = parseInt(value[i], 10) || 0;
      // standard binary patterns for digits
      const codes = [
        [0,0,0,1,1,0,1], // 0
        [0,0,1,1,0,0,1], // 1
        [0,0,1,0,0,1,1], // 2
        [0,1,1,1,1,0,1], // 3
        [0,1,0,0,0,1,1], // 4
        [0,1,1,0,0,0,1], // 5
        [0,1,0,1,1,1,1], // 6
        [0,1,1,1,0,1,1], // 7
        [0,1,1,0,1,1,1], // 8
        [0,0,0,1,0,1,1]  // 9
      ];
      pattern.push(...codes[num]);
      if (i === 6) {
        // Center guards
        pattern.push(0, 1, 0, 1, 0);
      }
    }
    // End guards
    pattern.push(1, 0, 1);
    return pattern;
  }, [value]);

  return (
    <div className={`p-2 rounded-xl border flex flex-col justify-center items-center transition-colors duration-200 mt-2 ${
      isLight 
        ? 'bg-zinc-100 border-zinc-200 text-zinc-800' 
        : 'bg-zinc-950 border-zinc-800 text-zinc-350'
    }`}>
      <div className="flex h-5 w-full items-stretch justify-center max-w-[150px] overflow-hidden bg-white px-1 py-0.5 rounded" style={{ gap: '0.1px' }}>
        {bars.map((bit, idx) => (
          <div
            key={idx}
            className={`flex-1 ${bit === 1 ? 'bg-black' : 'bg-transparent'}`}
            style={{ minWidth: '1px' }}
          />
        ))}
      </div>
      <span className="text-[8px] font-mono tracking-[1px] mt-1 font-bold leading-none select-all">
        {value}
      </span>
    </div>
  );
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

export const MS_PRODUCTS = [
  { name: 'Luxury Salmon & Caviar Platter', category: 'Sashimi & Platters', price: 34.50, margin: '76%', barcode: '5391548895018' },
  { name: 'Gastropub Spicy Truffle Roll', category: 'Specialty Rolls', price: 19.95, margin: '73%', barcode: '5391548895025' },
  { name: 'M&S Gold Grade Lobster Nigiri', category: 'Nigiri Selections', price: 24.00, margin: '80%', barcode: '5391548895032' },
  { name: 'Handcrafted Premium Dragon Roll', category: 'Sushi Rolls', price: 17.50, margin: '78%', barcode: '5391548895049' },
  { name: 'Gourmet Signature Bento Set', category: 'Bento Lunch Sets', price: 26.50, margin: '70%', barcode: '5391548895056' }
];

export const TESCO_PRODUCTS = [
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

export default function SellTab({ orders, onAddOrder, selectedBranch, theme }: SellTabProps) {
  const isLight = theme === 'light';
  const isMS = selectedBranch === 'Marks & Spencer - Cork City';
  const branchProducts = isMS ? MS_PRODUCTS : TESCO_PRODUCTS;
  const branchCategories = isMS 
    ? ['Sushi Rolls', 'Sashimi & Platters', 'Specialty Rolls', 'Nigiri Selections', 'Bento Lunch Sets']
    : Array.from(new Set(TESCO_PRODUCTS.map(p => p.category))).sort();

  // Multi-select & Bulk actions state
  const [selectedProductNames, setSelectedProductNames] = useState<string[]>([]);
  const [hiddenProducts, setHiddenProducts] = useState<string[]>([]);

  // Search and Category Filter state for Product Presets
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // New Order Form state
  const [newItem, setNewItem] = useState(branchProducts[0].name);
  const [newCategory, setNewCategory] = useState(branchProducts[0].category);
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(branchProducts[0].price);

  const matchedProduct = branchProducts.find(p => p.name === newItem);
  const matchedBarcode = (matchedProduct as any)?.barcode;

  // Compute filtered product presets matching search & category
  const filteredProducts = React.useMemo(() => {
    return branchProducts.filter(p => {
      if (hiddenProducts.includes(p.name)) return false;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.barcode?.includes(searchTerm) || 
                            p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [branchProducts, searchTerm, selectedCategory, hiddenProducts]);

  // Automatically sync presets and reset quantity when active store branch shifts
  React.useEffect(() => {
    const firstProduct = branchProducts[0];
    setNewItem(firstProduct.name);
    setNewCategory(firstProduct.category);
    setNewPrice(firstProduct.price);
    setNewQty(1);
    // Reset search
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedProductNames([]);
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
      barcode: matchedBarcode,
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
        <div className={`rounded-3xl border p-6 shadow-sm transition-all duration-200 ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900 shadow-sm' : 'bg-zinc-900 border-zinc-800 text-white'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-805">
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                {isMS ? '🇬🇧 Marks & Spencer Cork City - Luxury Selections' : `🇮🇪 ${selectedBranch} Active Range`}
              </h2>
              <p className={`text-xs uppercase font-semibold mt-0.5 font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {isMS 
                  ? 'Signature crafted luxury pairings with premium margins'
                  : 'Optimized high-volume value selections and Finest series'
                }
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-tight border ${
              isLight ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-orange-950/40 border-orange-850 text-orange-400'
            }`}>
              {filteredProducts.length} unique SKUs listed
            </span>
          </div>

          {/* Search and Category Filter Bar */}
          <div className="space-y-3 mb-6 bg-zinc-950/5 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/60">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="🔍 Search name, category, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full p-2.5 pl-3 text-xs rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all ${
                    isLight 
                      ? 'bg-white border border-zinc-200 text-zinc-800 placeholder-zinc-400' 
                      : 'bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500'
                  }`}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-xs font-bold text-zinc-400 hover:text-zinc-200"
                  >
                    Clear Match
                  </button>
                )}
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`p-2.5 text-xs rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all font-sans font-semibold cursor-pointer ${
                  isLight 
                    ? 'bg-white border border-zinc-200 text-zinc-850' 
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-300'
                }`}
              >
                <option value="All">All Categories</option>
                {branchCategories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Quick Filter Pill tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 invisible-scrollbar">
              <span className={`text-[9px] font-mono uppercase tracking-wider shrink-0 mr-1.5 ${isLight ? 'text-zinc-400' : 'text-zinc-550'}`}>Quick:</span>
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all whitespace-nowrap ${
                  selectedCategory === 'All'
                    ? 'bg-amber-500 text-zinc-950 shadow'
                    : isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600' : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400'
                }`}
              >
                All
              </button>
              {branchCategories.slice(0, 4).map((cat, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-zinc-950 shadow'
                      : isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600' : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* Bulk Actions Toolbar */}
          {selectedProductNames.length > 0 && (
            <div className={`mb-4 p-3 rounded-xl flex items-center justify-between border shadow-sm transition-all ${
              isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/20 border-amber-900/50'
            }`}>
              <div className="flex items-center gap-2">
                 <span className={`text-xs font-bold font-mono ${isLight ? 'text-amber-800' : 'text-amber-500'}`}>
                   {selectedProductNames.length} selected
                 </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Printing labels for ${selectedProductNames.length} items:\n${selectedProductNames.join('\n')}`);
                    setSelectedProductNames([]);
                  }}
                  className={`px-3 py-1.5 text-[10px] font-bold tracking-wide rounded-lg flex items-center gap-1.5 transition-all ${
                    isLight ? 'bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 shadow-sm' : 'bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 shadow-sm'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Labels
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHiddenProducts(prev => [...prev, ...selectedProductNames]);
                    setSelectedProductNames([]);
                  }}
                  className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wide rounded-lg flex items-center gap-1.5 transition-all ${
                    isLight ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 shadow-sm' : 'bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/50 shadow-sm'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Hide from POS
                </button>
              </div>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className={`p-8 rounded-2xl text-center border border-dashed ${
              isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-500' : 'bg-zinc-950/40 border-zinc-850 text-zinc-400'
            }`}>
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold">No products matches your parameters</p>
              <p className="text-xs text-zinc-500 mt-1">Try refining your search keyword or selecting "All Categories"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredProducts.map((p, idx) => (
                <div key={idx} className="relative group">
                  <div 
                    className="absolute top-2 right-2 z-10 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <input 
                      type="checkbox" 
                      title="Select product"
                      checked={selectedProductNames.includes(p.name)}
                      onChange={(e) => {
                         if (e.target.checked) {
                           setSelectedProductNames(prev => [...prev, p.name]);
                         } else {
                           setSelectedProductNames(prev => prev.filter(n => n !== p.name));
                         }
                      }}
                      className="w-4 h-4 rounded border-zinc-400 text-amber-500 focus:ring-amber-500 cursor-pointer shadow-sm disabled:opacity-50"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setNewItem(p.name);
                      setNewCategory(p.category);
                      setNewPrice(p.price);
                    }}
                    className={`w-full p-3 rounded-2xl flex flex-col justify-between text-left transition-all shadow-sm border cursor-pointer hover:shadow hover:scale-[1.01] ${
                      isLight 
                        ? 'bg-white border-zinc-200 hover:bg-zinc-50 hover:border-amber-500/50' 
                        : 'bg-zinc-950 border-zinc-850/80 hover:bg-zinc-900 hover:border-amber-500/40'
                    } ${selectedProductNames.includes(p.name) ? (isLight ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/50 hover:bg-amber-50' : 'ring-2 ring-amber-500 border-amber-500 bg-amber-950/20 hover:bg-amber-950/30') : ''}`}
                    title={`Click to load ${p.name} preset`}
                  >
                    <div className="pr-6">
                      <span className={`text-[11px] font-bold transition-colors leading-snug block ${
                        isLight 
                          ? 'text-zinc-850 group-hover/item:text-amber-600' 
                          : 'text-zinc-200 group-hover/item:text-amber-400'
                      }`}>{p.name}</span>
                      <span className={`text-[9px] block mt-0.5 leading-none ${isLight ? 'text-zinc-400' : 'text-zinc-550'}`}>{p.category}</span>
                    </div>

                    <div className="mt-3 w-full">
                      {/* Visual Barcode Segment */}
                      {p.barcode && <Barcode value={p.barcode} isLight={isLight} />}

                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-850 w-full">
                        <span className={`font-mono text-xs font-extrabold ${isLight ? 'text-orange-600' : 'text-orange-400'}`}>€{p.price.toFixed(2)}</span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isLight ? 'text-emerald-700 bg-emerald-55' : 'text-emerald-400 bg-emerald-950/45'
                        }`}>{p.margin} margin</span>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Transaction Ledger and Chart */}
        <div className={`rounded-3xl border p-6 transition-all duration-200 shadow-sm ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900 shadow-sm' : 'bg-zinc-900 border-zinc-800 text-white'
        }`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b ${
            isLight ? 'border-zinc-200' : 'border-zinc-800'
          }`}>
            <div>
              <h2 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Active Order Ledger</h2>
              <p className={`text-xs font-medium ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Live POS sales logged at <span className="text-amber-500 font-bold">{selectedBranch}</span></p>
            </div>
            <span className={`font-mono text-[10px] px-3 py-1 rounded-full font-bold border ${
              isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-700' : 'bg-zinc-950 border-zinc-800 text-orange-400'
            }`}>
              {orders.length} Active {isMS ? 'M&S' : 'Tesco'} Transactions
            </span>
          </div>

          <div className="h-56 mt-6 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e4e4e7' : '#1f2937'} />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#9ca3af', fontSize: 10 }} tickFormatter={(val) => `€${val}`} />
                <Tooltip 
                  cursor={{ fill: isLight ? '#f4f4f5' : '#1e293b' }}
                  contentStyle={{ 
                    backgroundColor: isLight ? '#ffffff' : '#09090b', 
                    borderRadius: '12px', 
                    border: isLight ? '1px solid #e4e4e7' : '1px solid #27272a', 
                    color: isLight ? '#18181b' : '#fff', 
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
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

          <div className={`overflow-x-auto border-t pt-4 ${isLight ? 'border-zinc-200' : 'border-zinc-805'}`}>
            <table className="w-full text-left text-xs">
              <thead className={`text-[10px] uppercase font-mono tracking-wider border-b ${
                isLight ? 'bg-zinc-100/60 border-zinc-250 text-zinc-630' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
              }`}>
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Specialty Item</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Barcode</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-zinc-100 text-zinc-800' : 'divide-zinc-800/60 text-zinc-300'}`}>
                {orders.map((order) => (
                  <tr key={order.id} className={`transition-colors ${isLight ? 'hover:bg-zinc-50' : 'hover:bg-zinc-950/50'}`}>
                    <td className={`py-3 px-3 font-mono font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>{order.id}</td>
                    <td className="py-3 px-3 font-mono text-zinc-500">{order.timestamp}</td>
                    <td className={`py-3 px-3 font-medium ${isLight ? 'text-zinc-850' : 'text-zinc-200'}`}>{order.item}</td>
                    <td className={`py-3 px-3 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{order.category}</td>
                    <td className={`py-3 px-3 font-mono text-[10px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>{order.barcode || 'N/A'}</td>
                    <td className="py-3 px-3 text-center font-mono">{order.quantity}</td>
                    <td className={`py-3 px-3 text-right font-mono font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>€{order.amount.toFixed(2)}</td>
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
        <div className={`rounded-3xl border p-6 shadow-sm transition-all duration-200 ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-white'
        }`}>
          <div className={`flex items-center gap-2 pb-4 mb-4 font-sans border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-900' : 'text-white'}`}>Kitchen POS Terminal</span>
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
                className={`w-full mt-1.5 p-2.5 text-xs font-bold rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all ${
                  isLight 
                    ? 'bg-zinc-150 border border-zinc-200 text-zinc-800' 
                    : 'bg-zinc-950 border border-zinc-800 text-amber-500'
                }`}
              >
                <option value="">-- Or click custom / enter below --</option>
                {branchProducts.map((p) => (
                  <option key={p.name} value={p.name} className={`${isLight ? 'text-zinc-800' : 'text-white'}`}>{p.name} (€{p.price.toFixed(2)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`text-[10px] font-mono uppercase font-semibold ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>Specialty Item Name</label>
              <input
                type="text"
                required
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g. Kyoto Spicy Tuna Roll"
                className={`w-full mt-1.5 p-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all ${
                  isLight 
                    ? 'bg-zinc-50 border border-zinc-200 text-zinc-900' 
                    : 'bg-zinc-950 border border-zinc-800 text-white'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] font-mono uppercase font-semibold ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>Grouping</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={`w-full mt-1.5 p-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all ${
                    isLight 
                      ? 'bg-zinc-50 border border-zinc-200 text-zinc-900 font-semibold' 
                      : 'bg-zinc-950 border border-zinc-800 text-white'
                  }`}
                >
                  {branchCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-[10px] font-mono uppercase font-semibold ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>Unit Price (€)</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                  className={`w-full mt-1.5 p-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono transition-all ${
                    isLight 
                      ? 'bg-zinc-50 border border-zinc-200 text-zinc-900' 
                      : 'bg-zinc-950 border border-zinc-800 text-white'
                  }`}
                />
              </div>
            </div>

            {matchedBarcode && (
              <div className={`px-3 py-2 border rounded-xl flex items-center justify-between font-mono text-[10px] select-none ${
                isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-850 text-zinc-400'
              }`}>
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">EAN-13 Barcode</span>
                <span className="text-amber-500 font-extrabold">{matchedBarcode}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewQty(prev => Math.max(1, prev - 1))}
                  className={`w-8 h-8 font-bold font-mono text-xs rounded-xl flex items-center justify-center transition-all ${
                    isLight 
                      ? 'border border-zinc-205 bg-zinc-100 hover:bg-zinc-200 text-zinc-800' 
                      : 'border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  -
                </button>
                <span className={`font-mono text-xs font-bold w-4 text-center ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{newQty}</span>
                <button
                  type="button"
                  onClick={() => setNewQty(prev => prev + 1)}
                  className={`w-8 h-8 font-bold font-mono text-xs rounded-xl flex items-center justify-center transition-all ${
                    isLight 
                      ? 'border border-zinc-205 bg-zinc-100 hover:bg-zinc-200 text-zinc-800' 
                      : 'border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  +
                </button>
              </div>

              <button
                type="submit"
                className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 shadow ${
                  isLight 
                    ? 'bg-zinc-900 hover:bg-zinc-850 text-white' 
                    : 'bg-zinc-955 bg-zinc-950 border border-zinc-800 hover:bg-zinc-850 text-white'
                }`}
              >
                <Plus className="w-4 h-4 text-orange-400" />
                Commit POS Sale
              </button>
            </div>
          </form>
        </div>

        {/* AI Menu Banner Maker: Supports ratio control as requested */}
        <div className={`rounded-3xl border p-6 shadow-sm space-y-4 transition-all duration-200 ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border border-zinc-900 text-white'
        }`}>
          <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-zinc-150' : 'border-zinc-800/80'}`}>
            <div className="flex items-center gap-2 font-sans">
              <ImageIcon className="w-5 h-5 text-orange-500" />
              <span className={`text-xs font-bold uppercase tracking-widest ${isLight ? 'text-zinc-900' : 'text-white'}`}>AI Banner Illustrator</span>
            </div>
            <span className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold ${
              isLight ? 'bg-teal-50 text-teal-600 border border-teal-200' : 'bg-teal-950/85 text-teal-400 border border-teal-900/40'
            }`}>
              gemini-2.5-flash-image
            </span>
          </div>

          <div>
            <label className={`text-[10px] font-mono uppercase font-semibold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Banner Marketing Prompt</label>
            <textarea
              value={bannerPrompt}
              onChange={(e) => setBannerPrompt(e.target.value)}
              className={`w-full h-20 mt-1.5 p-3 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-sans shadow-inner leading-relaxed transition-all ${
                isLight 
                  ? 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400' 
                  : 'border border-zinc-800 bg-zinc-900 text-white'
              }`}
              placeholder="Describe the aesthetic and food element..."
            />
          </div>

          <div>
            <label className={`text-[10px] font-mono uppercase font-semibold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Controlled Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {ASPECT_RATIOS.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setSelectedRatio(r.value)}
                  className={`px-3 py-2 border text-[10px] rounded-xl text-left transition-all ${
                    selectedRatio === r.value
                      ? 'bg-orange-600 border-orange-600 text-white font-bold shadow'
                      : isLight 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100' 
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
            className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-sm ${
              isLight 
                ? 'bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-200' 
                : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-white disabled:bg-zinc-950'
            }`}
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
