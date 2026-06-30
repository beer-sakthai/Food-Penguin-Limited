import React, { useState } from 'react';
import { Truck, Search, Box, ChevronDown, Package, Tag, ShoppingCart } from 'lucide-react';

interface SupplierItem {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
  icon: React.ElementType;
  items: SupplierItem[];
}

const SUPPLIERS: Supplier[] = [
  {
    id: 'tazaki',
    name: 'Tazaki',
    icon: Truck,
    items: [
      "YO! KFC Sauce 6x1L",
      "Vegan Mayonnaise 6x1L",
      "YO! Curry Sauce 6x2kg",
      "Katsu Pumpkin Croquette 5.4 kg - IRE only",
      "Springsnow Chicken Karaage 10x1kg",
      "Snowfox Chicken Katsu 5x2kg",
      "Japcook Yakitori - Marinated Chicken Skewer 40pc",
      "Frozen Cooked Breaded Prawn 240g",
      "LUF Surimi Maki Sticks (without E120) 500g",
      "Sushi Prawn 3L ASC certified 30pc",
      "Super Frozen Bigeye Tuna Saku AA-grade MSC",
      "Koshi Yutaka Standard Rice 5kg",
      "Sushi Ginger Sachet 200x3g",
      "Wasabi Sachets 500x1.5g",
      "Shoda Soy Sauce Sachets 200x8g",
      "King's Harvest Crispy Fried Onions 1kg",
      "Yutaka Edamame Shelled Soybeans 500g",
      "Seasoned Seaweed Salad- Goma Wakame MSG, AZO free 500g",
      "Kofuku nori Roasted Seaweed Yakinori C Full Size 100 sheets",
      "Otafuku Okonomi Sauce 2.1kg",
      "Mizkan Sushi Vinegar JS-47 18L",
      "Teriyaki Sauce Thin Type 6kg",
      "Yamasa Soy Sauce 1L. XXX",
      "Yamasa Soy Sauce 18L",
      "Yutaka Shredded Pickled Ginger - Benishoga 1.5kg",
      "Yutaka Gua Bao Buns 300g",
      "Yutaka GM&MSG Free Seasoned Soy Bean Curd - Inari 40pc",
      "Yutaka Rice Vinegar 1L",
      "Yutaka Blended Sesame Oil 1.8L",
      "Yutaka Chili Pepper - Shichimi 300g",
      "Yutaka Sriracha Chilli Sauce 1kg",
      "Yutaka Roasted White Sesame Seeds 1kg",
      "Yutaka Roasted Black Sesame Seeds 1kg",
      "Yutaka Wok Ready Udon Noodles 200g",
      "Yutaka Wok Ready Yakisoba Noodles 150g",
      "Yutaka Genroku Bamboo Chopsticks 100pc",
      "Bamboo rolling mat",
      "Little Moons Strawberry Cheese Cake Mochi 30x2pc",
      "Little Moons Chocolate Ganache Mochi 30x2pc",
      "Hata Bin Ramune -Soda Pop 200ml"
    ].map((name, idx) => ({ id: `tazaki-${idx}`, name }))
  },
  {
    id: 'bunzl',
    name: 'BUNZL',
    icon: Box,
    items: [
      "CS 400 SUSHI PAPER TRAY SIZE #1 260ML BLK",
      "CS 400 SUSHI PAPER TRAY SIZE #2 380ML BLK",
      "CS 400 SUSHI PAPER TRAY SIZE #5 470ML BLK",
      "CS 300 SUSHI PAPER TRAY SIZE #7 600ML BLK",
      "CS 400 SUSHI ANTI-FOG PET LID FOR #1 152958",
      "CS 400 SUSHI ANTI-FOG PET LID FOR #2 152959",
      "CS 400 SUSHI ANTI-FOG PET LID FOR #5 152961",
      "CS 400 SUSHI ANTI-FOG PET LID FOR #7 152962",
      "CS 300 BROWN KRAFT BOWL 750ML",
      "CS 300 RPET CLEAR LID FOR KRAFT BOWL 750-1000",
      "CS 50 BLK PLATTER TRAY W/HINGED LID",
      "CS 1850 RPET INSERT FOR 1000ML RND BOWL",
      "GRAB & GO (bao bun) Square Tray 13xm",
      "rPET GRAB & GO Square Tray (bao bun) 13xm",
      "CS 5000 1 OZ CLR PP PORTION POT",
      "CS 5000 1 OZ CLR PET PORTION POT LID",
      "Label",
      "Bin Bag",
      "Sushi grease paper",
      "Dishwasher Salt",
      "Blue gloves - Small",
      "Blue gloves - M (SYSCO)",
      "Blue gloves L (SYSCO)",
      "Blue gloves XL (SYSCO)",
      "Blue roll (SYSCO)"
    ].map((name, idx) => ({ id: `bunzl-${idx}`, name }))
  },
  {
    id: 'asia-market',
    name: 'Asia Market',
    icon: ShoppingCart,
    items: [
      "LJ Instant Boba Kit 24x174g",
      "CHICKEN& Vegetable Dumplings (10x600g)",
      "Duck Dumplings (10x600g)",
      "Vegan Vegetable Dumplings (10x600g)",
      "Tao Kae Noi Crispy Seaweed Hot & Spicy flavour (24x32g)",
      "Tao Kae Noi Crispy Seaweed Original flavour (24x32g)",
      "Kikkoman less salt soy sauce - 6x150 ml bottle",
      "Kikkoman Teriyaki Sauce with roasted garlic 6x250 ml"
    ].map((name, idx) => ({ id: `asia-market-${idx}`, name }))
  },
  {
    id: 'vs-direct',
    name: 'VS Direct - Stickers',
    icon: Tag,
    items: [
      "Chicken",
      "Salmon",
      "Seafood",
      "Surimi",
      "Plant based",
      "Prawn",
      "Duck",
      "Choc Moji Barcode",
      "Strawberry Moji Barcode"
    ].map((name, idx) => ({ id: `vs-direct-${idx}`, name }))
  }
];

interface SuppliersTabProps {
  theme?: 'light' | 'dark';
}

export default function SuppliersTab({ theme = 'dark' }: SuppliersTabProps) {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSuppliers, setExpandedSuppliers] = useState<Record<string, boolean>>(
    SUPPLIERS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );

  const toggleSupplier = (id: string) => {
    setExpandedSuppliers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSuppliers = SUPPLIERS.map(supplier => {
    const filteredItems = supplier.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...supplier, items: filteredItems };
  }).filter(supplier => supplier.items.length > 0 || supplier.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      <div className="flex flex-col md:flex-row md:items-end justify-between transition-all gap-4">
        <div>
          <h1 className={`text-2xl font-bold font-sans tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'} flex items-center gap-2`}>
            <Package className={`${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} size={28} />
            Supplier Directory
          </h1>
          <p className={`text-sm mt-1 font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Inventory catalog and order lists categorized by supplier.
          </p>
        </div>
        
        <div className="relative">
          <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`} />
          <input
            type="text"
            placeholder="Search items or suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 pr-4 py-2 w-full md:w-64 rounded-xl border text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-sm ${
              isLight 
                ? 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400' 
                : 'bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-800'
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredSuppliers.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
            No items found matching "{searchQuery}".
          </div>
        ) : (
          filteredSuppliers.map(supplier => {
            const isExpanded = expandedSuppliers[supplier.id];
            const Icon = supplier.icon;
            
            return (
              <div 
                key={supplier.id} 
                className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                  isLight ? 'bg-white border-zinc-200' : 'bg-black border-zinc-800'
                }`}
              >
                <button
                  onClick={() => toggleSupplier(supplier.id)}
                  className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${
                    isLight ? 'hover:bg-zinc-50' : 'hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                      <Icon size={20} />
                    </div>
                    <div className="text-left">
                      <h2 className={`font-bold font-sans tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        {supplier.name}
                      </h2>
                      <div className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {supplier.items.length} {supplier.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                  </div>
                  <div className={`p-1.5 rounded-full transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out origin-top ${
                    isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className={`p-2 border-t ${isLight ? 'border-zinc-100 bg-zinc-50/50' : 'border-zinc-800/50 bg-zinc-900/20'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {supplier.items.map(item => (
                        <div 
                          key={item.id}
                          className={`px-4 py-3 rounded-xl border text-sm flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                            isLight 
                              ? 'bg-white border-zinc-200 text-zinc-700 hover:border-indigo-300 hover:shadow-indigo-500/5' 
                              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-indigo-500/50 hover:bg-zinc-800/80 hover:shadow-[0_4px_12px_rgba(99,102,241,0.05)]'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLight ? 'bg-indigo-400' : 'bg-indigo-500'}`} />
                          <span className="leading-snug">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
