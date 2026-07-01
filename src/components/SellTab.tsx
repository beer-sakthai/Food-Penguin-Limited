import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface SellTabProps {
  selectedBranch: string;
  theme: string;
}

export const MS_PRODUCTS = [
  { name: 'Avocado Maki', category: 'General', price: 3.50, margin: '75%', barcode: '5055372900774' },
  { name: 'California Catch', category: 'General', price: 10.25, margin: '75%', barcode: '5055378900729' },
  { name: 'California Mango Roll', category: 'General', price: 6.75, margin: '75%', barcode: '5055372900635' },
  { name: 'Chicken Karaage', category: 'General', price: 8.50, margin: '75%', barcode: '5055372901108' },
  { name: 'Chicken Gyoza Udon Noodles', category: 'General', price: 8.25, margin: '75%', barcode: '5055372901634' },
  { name: 'Chicken Katsu Bao Bun', category: 'General', price: 4.75, margin: '75%', barcode: '5055372901214' },
  { name: 'Chicken Katsu Curry', category: 'General', price: 8.25, margin: '75%', barcode: '5055372901139' },
  { name: 'Chicken Teriyaki Poke', category: 'General', price: 8.25, margin: '75%', barcode: '5391548892598' },
  { name: 'Crunchy California Roll', category: 'General', price: 6.50, margin: '75%', barcode: '5055372900628' },
  { name: 'Cucumber Maki', category: 'General', price: 3.50, margin: '75%', barcode: '5055372900781' },
  { name: 'Duck Gyoza - Heat me first!', category: 'General', price: 6.75, margin: '75%', barcode: '5055372901481' },
  { name: 'Dynamite Crunch Roll', category: 'General', price: 8.75, margin: '75%', barcode: '5055372900611' },
  { name: 'Inari Pocket', category: 'General', price: 4.95, margin: '75%', barcode: '5055372901450' },
  { name: 'Kaiso Seaweed Salad', category: 'General', price: 4.25, margin: '75%', barcode: '5055372901030' },
  { name: 'Korean Chicken Karaage', category: 'General', price: 8.50, margin: '75%', barcode: '5055372901115' },
  { name: 'Nigiri Allsorts', category: 'General', price: 7.25, margin: '75%', barcode: '5055372900910' },
  { name: 'Pumpkin Katsu Bao', category: 'General', price: 4.75, margin: '75%', barcode: '5055372901092' },
  { name: 'Pumpkin Katsu Curry', category: 'General', price: 7.95, margin: '75%', barcode: '5055372901078' },
  { name: 'Salmon Avocado Roll', category: 'General', price: 7.50, margin: '75%', barcode: '5055372900873' },
  { name: 'Salmon Maki', category: 'General', price: 4.75, margin: '75%', barcode: '5055372900798' },
  { name: 'Salmon Nigiri', category: 'General', price: 7.50, margin: '75%', barcode: '5055372901474' },
  { name: 'Salmon Sashimi', category: 'General', price: 7.95, margin: '75%', barcode: '5055372900927' },
  { name: 'Spicy California Roll', category: 'General', price: 6.25, margin: '75%', barcode: '5055372901869' },
  { name: 'Strawberry Cheesecake Mochi', category: 'General', price: 4.25, margin: '75%', barcode: '5055372901061' },
  { name: 'Veggie Gyoza - Heat me first!', category: 'General', price: 6.25, margin: '75%', barcode: '5055372901145' },
  { name: 'Yasai Roll', category: 'General', price: 5.75, margin: '75%', barcode: '5055372900897' }
];

export const TESCO_PRODUCTS = [
  { name: 'veggie tofu yakisoba noodles', category: 'Noodles & Sides', price: 7.95, margin: '78%', barcode: '5391548890679' },
  { name: 'veggie gyoza - heat me first!', category: 'Gyoza & Starters', price: 5.95, margin: '82%', barcode: '5391548890150' },
  { name: 'TokYO! party platter', category: 'Party Platters', price: 16.75, margin: '71%', barcode: '5391548890549' },
  { name: 'teriyaki chicken udon noodles', category: 'Noodles & Sides', price: 8.25, margin: '76%', barcode: '5391548890730' },
  { name: 'teriyaki chicken rice bowl', category: 'Rice Bowls & Pok', price: 7.95, margin: '77%', barcode: '5391548890648' },
  { name: 'sweet chilli chicken yakitori', category: 'Warm Street Food', price: 5.50, margin: '84%', barcode: '5391548890136' },
  { name: 'sriracha salmon pok bowl', category: 'Rice Bowls & Pok', price: 8.25, margin: '78%', barcode: '5391548890600' },
  { name: 'strawberry cheesecake mochi', category: 'Desserts & Sweets', price: 3.95, margin: '85%', barcode: '5391548890754' },
  { name: 'spicy veggie roll', category: 'Sushi Rolls', price: 5.50, margin: '81%', barcode: '5391548890266' },
  { name: 'spicy salmon & avocado roll', category: 'Sushi Rolls', price: 7.25, margin: '79%', barcode: '5391548890372' },
  { name: 'spicy california roll', category: 'Sushi Rolls', price: 5.95, margin: '81%', barcode: '5391548890303' },
  { name: 'salmon maki', category: 'Maki Rolls', price: 4.50, margin: '84%', barcode: '5391548890020' },
  { name: 'salmon nigiri', category: 'Nigiri Duos', price: 6.95, margin: '82%', barcode: '5391548890051' },
  { name: 'seaweed salad', category: 'Sides & Starters', price: 3.95, margin: '86%', barcode: '5391548890174' },
  { name: 'salmon sashimi', category: 'Sashimi Selections', price: 7.75, margin: '79%', barcode: '5391548890068' },
  { name: 'pumpkin katsu curry', category: 'Warm Street Food', price: 7.75, margin: '79%', barcode: '5391548890624' },
  { name: 'pumpkin katsu bao', category: 'Bao & Buns', price: 4.50, margin: '83%', barcode: '5391548890099' },
  { name: 'inari nigiri', category: 'Nigiri Duos', price: 4.75, margin: '84%', barcode: '5391548890037' },
  { name: 'crunchy prawn katsu roll', category: 'Sushi Rolls', price: 8.25, margin: '78%', barcode: '5391548890426' },
  { name: 'crunchy veggie roll', category: 'Sushi Rolls', price: 5.75, margin: '81%', barcode: '5391548890273' },
  { name: 'chocolate mochi', category: 'Desserts & Sweets', price: 3.95, margin: '85%', barcode: '5391548890747' },
  { name: 'chicken yakisoba noodles', category: 'Noodles & Sides', price: 7.95, margin: '79%', barcode: '5391548890662' },
  { name: 'chicken teriyaki bao', category: 'Bao & Buns', price: 4.50, margin: '84%', barcode: '5391548890075' },
  { name: 'avocado maki', category: 'Maki Rolls', price: 3.50, margin: '86%', barcode: '5391548890006' }
];

export function Barcode({ value, isLight }: { value: string; isLight: boolean }) {
  const bars = useMemo(() => {
    let pattern: number[] = [];
    pattern.push(1, 0, 1);
    for (let i = 0; i < value.length; i++) {
      const num = parseInt(value[i], 10) || 0;
      const codes = [
        [0,0,0,1,1,0,1], [0,0,1,1,0,0,1], [0,0,1,0,0,1,1], [0,1,1,1,1,0,1],
        [0,1,0,0,0,1,1], [0,1,1,0,0,0,1], [0,1,0,1,1,1,1], [0,1,1,1,0,1,1],
        [0,1,1,0,1,1,1], [0,0,0,1,0,1,1]
      ];
      pattern.push(...codes[num]);
      if (i === 6) pattern.push(0, 1, 0, 1, 0);
    }
    pattern.push(1, 0, 1);
    return pattern;
  }, [value]);

  return (
    <div className="flex h-8 gap-[1px]">
      {bars.map((bar, i) => (
        <div key={i} className={`w-[1.5px] h-full ${bar ? (isLight ? 'bg-zinc-800' : 'bg-zinc-200') : 'bg-transparent'}`} />
      ))}
    </div>
  );
}

export default function SellTab({ selectedBranch, theme }: SellTabProps) {
  const isLight = theme === 'light';
  const branchProducts = selectedBranch.toLowerCase().includes('tesco') ? TESCO_PRODUCTS : MS_PRODUCTS;
  
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(branchProducts.length / itemsPerPage);
  const currentProducts = branchProducts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const getPct = (val: number) => Math.round((val / branchProducts.length) * 100) || 0;
  const counts = branchProducts.reduce((acc, p) => {
    const n = p.name.toLowerCase();
    if (n.includes('salmon') || n.includes('prawn') || n.includes('catch') || n.includes('seaweed')) acc.seafood++;
    else if (n.includes('chicken') || n.includes('duck')) acc.chicken++;
    else acc.veggie++;
    return acc;
  }, { seafood: 0, chicken: 0, veggie: 0 });

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-12 items-start pb-16 pt-8">
      {/* LEFT COLUMN: Data & Analysis */}
      <div className="space-y-16">
        {/* HEADER */}
        <div className="flex flex-col gap-2">
          <h1 className={`text-2xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
            {selectedBranch}
          </h1>
          <p className={`text-base font-medium ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {branchProducts.length} unique products listed
          </p>
        </div>

        {/* SALES PERFORMANCE VISUALIZATION */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/50 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <h2 className={`text-lg font-bold tracking-wide uppercase ${isLight ? 'text-zinc-900' : 'text-zinc-300'}`}>Revenue Trajectory</h2>
              </div>
              <p className="text-sm text-zinc-500">Gourmet sushi sales performance over 6 months</p>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Average</p>
                <p className={`text-3xl font-black ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>€51.0K</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Peak</p>
                <p className="text-3xl font-black text-amber-500">€62.0K <span className="text-sm text-zinc-500 font-medium">(Jun)</span></p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { month: 'Jan', Sales: 42000 },
                { month: 'Feb', Sales: 48000 },
                { month: 'Mar', Sales: 51000 },
                { month: 'Apr', Sales: 49000 },
                { month: 'May', Sales: 55000 },
                { month: 'Jun', Sales: 62000 },
              ]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sellRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={isLight ? '#e4e4e7' : '#27272a'} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#71717a', fontSize: 15 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#71717a', fontSize: 15 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isLight ? '#fff' : '#18181b', borderRadius: '8px', border: `1px solid ${isLight ? '#e4e4e7' : '#27272a'}`, boxShadow: 'none' }}
                  formatter={(value: number) => [`€${value.toLocaleString()}`, 'Sales']}
                />
                <Area type="monotone" dataKey="Sales" stroke="#f59e0b" strokeWidth={2} fill="url(#sellRevenueGrad)" dot={{ r: 3, strokeWidth: 2, fill: '#18181b', stroke: '#f59e0b' }} activeDot={{ r: 5, fill: '#f59e0b' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ANALYTICS FOOTER */}
        <div className="space-y-8 pt-8 border-t border-zinc-200 dark:border-zinc-800/50">
          <h2 className={`text-lg font-bold tracking-wide uppercase ${isLight ? 'text-zinc-900' : 'text-zinc-300'}`}>Distribution Analysis</h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className={`text-4xl font-black mb-1 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{getPct(counts.seafood)}%</div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Seafood</p>
            </div>
            <div>
              <div className={`text-4xl font-black mb-1 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{getPct(counts.chicken)}%</div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Chicken</p>
            </div>
            <div>
              <div className={`text-4xl font-black mb-1 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{getPct(counts.veggie)}%</div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Veg/Vegan</p>
            </div>
          </div>

          {/* HORIZONTAL BAR CHART */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className={`w-24 text-sm font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Seafood</div>
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
                <div style={{ width: `${getPct(counts.seafood)}%` }} className="h-full bg-zinc-400 dark:bg-zinc-500"></div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`w-24 text-sm font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Chicken</div>
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
                <div style={{ width: `${getPct(counts.chicken)}%` }} className="h-full bg-amber-500"></div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-24 text-sm font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Veg/Vegan</div>
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
                <div style={{ width: `${getPct(counts.veggie)}%` }} className="h-full bg-zinc-300 dark:bg-zinc-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Products List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800/50 mb-4">
          <h2 className={`text-lg font-bold tracking-wide uppercase ${isLight ? 'text-zinc-900' : 'text-zinc-300'}`}>Product Inventory</h2>
          <div className={`font-mono text-xs font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
            PAGE {currentPage + 1} OF {totalPages}
          </div>
        </div>

        <div className="flex flex-col">
          {currentProducts.map((p, i) => (
            <div key={i} className={`py-4 border-b ${isLight ? 'border-zinc-100' : 'border-zinc-800/50'} flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] group cursor-default`}>
              <div className="flex-1 pr-4">
                <h3 className={`text-base font-bold leading-tight transition-colors ${isLight ? 'text-zinc-800 group-hover:text-zinc-900' : 'text-zinc-300 group-hover:text-zinc-100'}`}>{p.name}</h3>
                <p className={`text-sm font-bold mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>€{p.price.toFixed(2)}</p>
              </div>
              <div className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                <Barcode value={p.barcode || '0000000000000'} isLight={isLight} />
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-8">
            <button className="btn-interactive"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all ${
                currentPage === 0 
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:-translate-y-0.5 active:scale-[0.98] hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 rounded-md p-1'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            
            <button className="btn-interactive"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all ${
                currentPage === totalPages - 1
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:-translate-y-0.5 active:scale-[0.98] hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 rounded-md p-1'
              }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

