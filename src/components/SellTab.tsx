import { Barcode } from './Barcode';
import React from 'react';
import { SalesOrder } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, Euro } from 'lucide-react';

export const MS_PRODUCTS = [
  { name: 'Avocado Maki', category: 'General', price: 3.50, margin: '75%', barcode: '5055372900774' },
  { name: 'California Catch', category: 'General', price: 10.25, margin: '75%', barcode: '5055378900729' },
  { name: 'California Mango Roll', category: 'General', price: 6.75, margin: '75%', barcode: '5055372900635' },
  { name: 'California Mango Volcano Roll', category: 'General', price: 6.25, margin: '75%', barcode: '5055372901726' },
  { name: 'Chicken Karaage', category: 'General', price: 8.50, margin: '75%', barcode: '5055372901108' },
  { name: 'Chicken Gyoza Udon Noodles', category: 'General', price: 8.25, margin: '75%', barcode: '5055372901634' },
  { name: 'Chicken Katsu Bao Bun', category: 'General', price: 4.75, margin: '75%', barcode: '5055372901214' },
  { name: 'Chicken Katsu Curry', category: 'General', price: 8.25, margin: '75%', barcode: '5055372901139' },
  { name: 'Chicken Katsu Curry Udon Noodles', category: 'General', price: 8.25, margin: '75%', barcode: '5055372901641' },
  { name: 'Chicken Teriyaki Poke', category: 'General', price: 8.25, margin: '75%', barcode: '5391548892598' },
  { name: 'Chicken Teriyaki Roll', category: 'General', price: 6.75, margin: '75%', barcode: '5055372900842' },
  { name: 'Chicken Yakisoba Noodles', category: 'General', price: 8.50, margin: '75%', barcode: '5055372901160' },
  { name: 'Chicken Yakitori', category: 'General', price: 5.75, margin: '75%', barcode: '5055372901221' },
  { name: 'Chocolate Truffle Mochi', category: 'General', price: 4.25, margin: '75%', barcode: '5055372901054' },
  { name: 'Crunchy California Roll', category: 'General', price: 6.50, margin: '75%', barcode: '5055372900628' },
  { name: 'Crunchy Fiesta Chicken Feast', category: 'General', price: 19.95, margin: '75%', barcode: '5391548892918' },
  { name: 'Crunchy Fiesta Chicken Roll', category: 'General', price: 7.95, margin: '75%', barcode: '5391548892671' },
  { name: 'Crunchy Fiesta Chicken Trio', category: 'General', price: 11.25, margin: '75%', barcode: '5391548892695' },
  { name: 'Cucumber Maki', category: 'General', price: 3.50, margin: '75%', barcode: '5055372900781' },
  { name: 'Duck Gyoza - Heat me first!', category: 'General', price: 6.75, margin: '75%', barcode: '5055372901481' },
  { name: 'Dynamite Crunch Roll', category: 'General', price: 8.75, margin: '75%', barcode: '5055372900611' },
  { name: 'Fiesta Mango Chicken Poke', category: 'General', price: 8.25, margin: '75%', barcode: '5391548892664' },
  { name: 'Fiesta Mango Salmon Feast', category: 'General', price: 21.95, margin: '75%', barcode: '5391548892925' },
  { name: 'Fiesta Mango Salmon Roll', category: 'General', price: 8.50, margin: '75%', barcode: '5391548892588' },
  { name: 'Fiesta Mango Salmon Poke', category: 'General', price: 8.95, margin: '75%', barcode: '5391548892657' },
  { name: 'Fiesta Mango Salmon Trio', category: 'General', price: 11.75, margin: '75%', barcode: '5391548892901' },
  { name: 'Fiji Collection', category: 'General', price: 11.25, margin: '75%', barcode: '5055372900682' },
  { name: 'Ginza Group', category: 'General', price: 8.25, margin: '75%', barcode: '5391548892177' },
  { name: 'Green Scene', category: 'General', price: 8.95, margin: '75%', barcode: '5055372900699' },
  { name: 'Inari Pocket', category: 'General', price: 4.95, margin: '75%', barcode: '5055372901450' },
  { name: 'Kaiso Seaweed Salad', category: 'General', price: 4.25, margin: '75%', barcode: '5055372901030' },
  { name: 'Kiso Selection', category: 'General', price: 24.95, margin: '75%', barcode: '5391548892352' },
  { name: 'Korean Chicken Karaage', category: 'General', price: 8.50, margin: '75%', barcode: '5055372901115' },
  { name: 'Korean Chicken Rice Bowl', category: 'General', price: 8.25, margin: '75%', barcode: '5055372901146' },
  { name: 'Korean Chicken Udon Noodles', category: 'General', price: 8.50, margin: '75%', barcode: '5055372901658' },
  { name: 'Kyoto Sharer', category: 'General', price: 15.95, margin: '75%', barcode: '5055372900767' },
  { name: 'Lucky No.7', category: 'General', price: 11.75, margin: '75%', barcode: '5055372900712' },
  { name: 'Nagoya Selection', category: 'General', price: 29.95, margin: '75%', barcode: '5391548892583' },
  { name: 'Nigiri Allsorts', category: 'General', price: 7.25, margin: '75%', barcode: '5055372900910' },
  { name: 'Osaka Selects', category: 'General', price: 11.75, margin: '75%', barcode: '5055372900675' },
  { name: 'Otaki Selection', category: 'General', price: 39.95, margin: '75%', barcode: '5391548892451' },
  { name: 'Prawn Firecracker Yakisoba Noodles', category: 'General', price: 8.75, margin: '75%', barcode: '5055372901191' },
  { name: 'Pumpkin Katsu Bao', category: 'General', price: 4.75, margin: '75%', barcode: '5055372901092' },
  { name: 'Pumpkin Katsu Curry', category: 'General', price: 7.95, margin: '75%', barcode: '5055372901078' },
  { name: 'Pumpkin Katsu with rice', category: 'General', price: 7.75, margin: '75%', barcode: '5055372901085' },
  { name: 'Sakura Spring Selection', category: 'General', price: 23.95, margin: '75%', barcode: '5391548892703' },
  { name: 'Salmon Avocado Roll', category: 'General', price: 7.50, margin: '75%', barcode: '5055372900873' },
  { name: 'Salmon and Avocado Crystal Roll', category: 'General', price: 7.95, margin: '75%', barcode: '5391548892888' },
  { name: 'Salmon and Cream cheese Poke', category: 'General', price: 8.75, margin: '75%', barcode: '5391548892581' },
  { name: 'Salmon and Tuna Poke', category: 'General', price: 9.95, margin: '75%', barcode: '5391548892567' },
  { name: 'Salmon Blossom Box', category: 'General', price: 15.95, margin: '75%', barcode: '5391548892697' },
  { name: 'Salmon Cream Cheese Roll', category: 'General', price: 7.95, margin: '75%', barcode: '5391548892191' },
  { name: 'Salmon Cream Cheese Trio', category: 'General', price: 10.95, margin: '75%', barcode: '5391548892710' },
  { name: 'Salmon Dragon Roll', category: 'General', price: 9.25, margin: '75%', barcode: '5055372900804' },
  { name: 'Salmon Lovers', category: 'General', price: 10.25, margin: '75%', barcode: '5055372900668' },
  { name: 'Salmon Maki', category: 'General', price: 4.75, margin: '75%', barcode: '5055372900798' },
  { name: 'Salmon Nigiri', category: 'General', price: 7.50, margin: '75%', barcode: '5055372901474' },
  { name: 'Salmon Non-stop', category: 'General', price: 13.75, margin: '75%', barcode: '5055372900705' },
  { name: 'Salmon Poke', category: 'General', price: 8.75, margin: '75%', barcode: '5391548892574' },
  { name: 'Salmon Sashimi', category: 'General', price: 7.95, margin: '75%', barcode: '5055372900927' },
  { name: 'Salmon Volcano Roll', category: 'General', price: 7.75, margin: '75%', barcode: '5055372901702' },
  { name: 'Seikai Salmon Collection', category: 'General', price: 12.25, margin: '75%', barcode: '5391548892314' },
  { name: 'Sesame Prawn Katsu Roll', category: 'General', price: 8.25, margin: '75%', barcode: '5055372900659' },
  { name: 'Shibuya Sharer', category: 'General', price: 17.75, margin: '75%', barcode: '5055372900750' },
  { name: 'Sláinte Roll', category: 'General', price: 7.75, margin: '75%', barcode: '5055372900903' },
  { name: 'Spicy California Roll', category: 'General', price: 6.25, margin: '75%', barcode: '5055372901869' },
  { name: 'Spicy Chicken Katsu Roll', category: 'General', price: 7.25, margin: '75%', barcode: '5055372900866' },
  { name: 'Spicy Crunchy Salmon Avocado Roll', category: 'General', price: 8.25, margin: '75%', barcode: '5055372901405' },
  { name: 'Spicy Salmon Avocado Roll', category: 'General', price: 7.75, margin: '75%', barcode: '5055372901389' },
  { name: 'Spicy Salmon Gunkan', category: 'General', price: 5.25, margin: '75%', barcode: '5391548892321' },
  { name: 'Sriracha Salmon Poké', category: 'General', price: 8.75, margin: '75%', barcode: '5055372900958' },
  { name: 'Strawberry Cheesecake Mochi', category: 'General', price: 4.25, margin: '75%', barcode: '5055372901061' },
  { name: 'Teriyaki Chicken Karaage', category: 'General', price: 8.50, margin: '75%', barcode: '5055372901122' },
  { name: 'Teriyaki Chicken Rice Bowl', category: 'General', price: 8.25, margin: '75%', barcode: '5055372901153' },
  { name: 'Teriyaki Chicken Udon Noodles', category: 'General', price: 8.50, margin: '75%', barcode: '5055372901665' },
  { name: 'Tofu and Veggie Yakisoba Noodles', category: 'General', price: 8.50, margin: '75%', barcode: '5055372901177' },
  { name: 'Tofu Firecracker Yakisoba Noodles', category: 'General', price: 8.50, margin: '75%', barcode: '5055372901184' },
  { name: 'Tokyo Market Specials', category: 'General', price: 13.95, margin: '75%', barcode: '5391548892558' },
  { name: 'Toyosu Duo', category: 'General', price: 10.25, margin: '75%', barcode: '5055372900736' },
  { name: 'Veggie Gyoza - Heat me first!', category: 'General', price: 6.25, margin: '75%', barcode: '5055372901145' },
  { name: 'Yasai Roll', category: 'General', price: 5.75, margin: '75%', barcode: '5055372900897' }
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

interface SellTabProps {
  selectedBranch: 'Marks & Spencer - Cork City' | 'Tesco - Cork City' | 'Tesco - Mahon Point';
  theme: 'dark' | 'light';
}

export default function SellTab({ selectedBranch, theme }: SellTabProps) {
  const isLight = theme === 'light';
  const isMS = selectedBranch === 'Marks & Spencer - Cork City';
  
  // Decide which branch products list to show!
  const branchProducts = isMS ? MS_PRODUCTS : TESCO_PRODUCTS;

  // Analysis of the current branch's products
  const determineType = (name: string) => {
    const n = name.toLowerCase();
    
    // Seafood rules
    if (n.includes('salmon') || n.includes('prawn') || n.includes('tuna') || n.includes('seafood') || n.includes('catch')) {
      return 'seafood';
    }
    // Chicken rules
    if (n.includes('chicken') || n.includes('duck')) {
      return 'chicken';
    }
    // Veggie/Vegan rules
    if (n.includes('veggie') || n.includes('vegan') || n.includes('tofu') || n.includes('avocado') || 
        n.includes('cucumber') || n.includes('mango') || n.includes('green') || n.includes('plant') || n.includes('yasai') || n.includes('pumpkin')) {
      return 'veggie';
    }
    
    return 'other';
  };

  let counts = { seafood: 0, chicken: 0, veggie: 0, total: branchProducts.length };
  
  branchProducts.forEach(p => {
    const type = determineType(p.name);
    if (type === 'seafood') counts.seafood++;
    if (type === 'chicken') counts.chicken++;
    if (type === 'veggie') counts.veggie++;
  });

  const getPct = (val: number) => Math.round((val / counts.total) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-4">
      {/* HEADER */}
      <div className={`p-8 rounded-3xl text-center ${isLight ? 'bg-zinc-50 border border-zinc-200' : 'bg-zinc-900 border border-zinc-800'}`}>
        <h1 className={`text-4xl font-extrabold mb-2 ${isLight ? 'text-zinc-900' : 'text-3d-gold drop-shadow-md'}`}>
          {selectedBranch}
        </h1>
        <p className={`text-lg font-medium ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {branchProducts.length} unique products listed for this branch
        </p>
      </div>

      {/* SALES PERFORMANCE VISUALIZATION */}
      <div className={`p-6 rounded-3xl transition-all duration-300 ${
        isLight ? 'bg-white border border-zinc-200 shadow-sm' : 'bg-zinc-900 border border-zinc-800 shadow-xl'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <h2 className={`text-xl font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Monthly Revenue Trajectory</h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Gourmet sushi sales performance over the past 6-month period</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Average Monthly Sales</p>
              <p className={`text-lg font-extrabold ${isLight ? 'text-zinc-900' : 'text-amber-400'}`}>€51.0K</p>
            </div>
            <div className="text-right border-l pl-4 border-zinc-200 dark:border-zinc-800">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Peak Performance</p>
              <p className="text-lg font-extrabold text-emerald-500">€62.0K (Jun)</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { month: 'Jan', Sales: 42000 },
              { month: 'Feb', Sales: 48000 },
              { month: 'Mar', Sales: 51000 },
              { month: 'Apr', Sales: 49000 },
              { month: 'May', Sales: 55000 },
              { month: 'Jun', Sales: 62000 },
            ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sellRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e4e4e7' : '#27272a'} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#a1a1aa', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#a1a1aa', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: isLight ? '#fff' : '#18181b', borderRadius: '12px', border: `1px solid ${isLight ? '#e4e4e7' : '#27272a'}` }}
                formatter={(value: any) => [`€${value.toLocaleString()}`, 'Sales Revenue']}
              />
              <Area type="monotone" dataKey="Sales" stroke="#f59e0b" strokeWidth={3} fill="url(#sellRevenueGrad)" dot={{ r: 4, strokeWidth: 2, fill: '#f59e0b' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PRODUCTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branchProducts.map((p, i) => (
          <div key={i} className={`p-6 rounded-2xl transition-transform hover:-translate-y-1 ${
            isLight ? 'bg-white shadow-sm border border-zinc-200' : 'bg-zinc-900 border border-zinc-800'
          }`}>
            <h3 className={`text-2xl font-bold leading-tight mb-2 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{p.name}</h3>
            <p className={`text-xl font-bold mb-6 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>€{p.price.toFixed(2)}</p>
            <Barcode value={p.barcode || '0000000000000'} isLight={isLight} />
          </div>
        ))}
      </div>

      {/* ANALYTICS FOOTER */}
      <div className={`mt-12 p-8 rounded-3xl ${isLight ? 'bg-zinc-50 border border-zinc-200' : 'bg-zinc-900 border border-zinc-800'}`}>
        <h2 className={`text-2xl font-bold mb-6 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>Product Distribution Analysis</h2>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className={`p-6 rounded-2xl ${isLight ? 'bg-white shadow-sm' : 'bg-zinc-950'}`}>
            <div className={`text-5xl font-extrabold mb-2 ${isLight ? 'text-rose-500' : 'text-rose-400'}`}>{getPct(counts.seafood)}%</div>
            <p className={`text-lg font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Salmon & Seafood</p>
          </div>
          <div className={`p-6 rounded-2xl ${isLight ? 'bg-white shadow-sm' : 'bg-zinc-950'}`}>
            <div className={`text-5xl font-extrabold mb-2 ${isLight ? 'text-amber-500' : 'text-amber-400'}`}>{getPct(counts.chicken)}%</div>
            <p className={`text-lg font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Chicken</p>
          </div>
          <div className={`p-6 rounded-2xl ${isLight ? 'bg-white shadow-sm' : 'bg-zinc-950'}`}>
            <div className={`text-5xl font-extrabold mb-2 ${isLight ? 'text-emerald-500' : 'text-emerald-400'}`}>{getPct(counts.veggie)}%</div>
            <p className={`text-lg font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Vegan / Veggie</p>
          </div>
        </div>

        {/* HORIZONTAL BAR CHART */}
        <div className="mt-10 pt-10 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className={`text-xl font-bold mb-6 ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>Comparative Volume Breakdown</h3>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className={`w-36 text-right text-base font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Seafood</div>
              <div className={`flex-1 h-8 rounded-full overflow-hidden ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
                <div style={{ width: `${getPct(counts.seafood)}%` }} className="h-full bg-rose-500 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]"></div>
              </div>
              <div className={`w-12 text-lg font-black ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{getPct(counts.seafood)}%</div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`w-36 text-right text-base font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Chicken</div>
              <div className={`flex-1 h-8 rounded-full overflow-hidden ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
                <div style={{ width: `${getPct(counts.chicken)}%` }} className="h-full bg-amber-500 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]"></div>
              </div>
              <div className={`w-12 text-lg font-black ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{getPct(counts.chicken)}%</div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-36 text-right text-base font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Veg/Vegan</div>
              <div className={`flex-1 h-8 rounded-full overflow-hidden ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
                <div style={{ width: `${getPct(counts.veggie)}%` }} className="h-full bg-emerald-500 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]"></div>
              </div>
              <div className={`w-12 text-lg font-black ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{getPct(counts.veggie)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
