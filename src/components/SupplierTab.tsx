interface SupplierTabProps {
  theme: 'dark' | 'light';
}

const supplierCatalog = [
  {
    name: 'TAZAKI',
    items: [
      'YO! KFC Sauce 6x1L',
      'Vegan Mayonnaise 6x1L',
      'YO! Curry Sauce 6x2kg',
      'Katsu Pumpkin Croquette 5.4kg (IRE only)',
      'Springsnow Chicken Karaage 10x1kg',
      'Snowfox Chicken Katsu 5x2kg',
      'Japcook Yakitori Marinated Chicken Skewer 40pc',
      'Frozen Cooked Breaded Prawn 240g',
      'LUF Surimi Maki Sticks (without E120) 500g',
      'Sushi Prawn 3L ASC certified 30pc',
      'Super Frozen Bigeye Tuna Saku AA-grade MSC',
      'Koshi Yutaka Standard Rice 5kg',
      'Sushi Ginger Sachet 200x3g',
      'Wasabi Sachets 500x1.5g',
      'Shoda Soy Sauce Sachets 200x8g',
      "King's Harvest Crispy Fried Onions 1kg",
      'Yutaka Edamame Shelled Soybeans 500g',
      'Seasoned Seaweed Salad (Goma Wakame, MSG/AZO free) 500g',
      'Kofuku Nori Roasted Seaweed Yakinori C Full Size 100 sheets',
      'Otafuku Okonomi Sauce 2.1kg',
      'Mizkan Sushi Vinegar JS-47 18L',
      'Teriyaki Sauce Thin Type 6kg',
      'Yamasa Soy Sauce 1L',
      'Yamasa Soy Sauce 18L',
      'Yutaka Shredded Pickled Ginger (Benishoga) 1.5kg',
      'Yutaka Gua Bao Buns 300g',
      'Yutaka GM&MSG Free Seasoned Soy Bean Curd (Inari) 40pc',
      'Yutaka Rice Vinegar 1L',
      'Yutaka Blended Sesame Oil 1.8L',
      'Yutaka Chili Pepper (Shichimi) 300g',
      'Yutaka Sriracha Chilli Sauce 1kg',
      'Yutaka Roasted White Sesame Seeds 1kg',
      'Yutaka Roasted Black Sesame Seeds 1kg',
      'Yutaka Wok Ready Udon Noodles 200g',
      'Yutaka Wok Ready Yakisoba Noodles 150g',
      'Yutaka Genroku Bamboo Chopsticks 100pc',
      'Bamboo rolling mat',
      'Little Moons Strawberry Cheese Cake Mochi 30x2pc',
      'Little Moons Chocolate Ganache Mochi 30x2pc',
      'Hata Bin Ramune Soda Pop 200ml'
    ]
  },
  {
    name: 'BUNZL',
    items: [
      'CS 400 Sushi Paper Tray Size #1 260ml Black',
      'CS 400 Sushi Paper Tray Size #2 380ml Black',
      'CS 400 Sushi Paper Tray Size #5 470ml Black',
      'CS 300 Sushi Paper Tray Size #7 600ml Black',
      'CS 400 Sushi Anti-Fog PET Lid for #1 (152958)',
      'CS 400 Sushi Anti-Fog PET Lid for #2 (152959)',
      'CS 400 Sushi Anti-Fog PET Lid for #5 (152961)',
      'CS 400 Sushi Anti-Fog PET Lid for #7 (152962)',
      'CS 300 Brown Kraft Bowl 750ml',
      'CS 300 RPET Clear Lid for Kraft Bowl 750-1000',
      'CS 50 Black Platter Tray with Hinged Lid',
      'CS 1850 RPET Insert for 1000ml Round Bowl',
      'Grab & Go Square Tray (Bao Bun) 13cm RPET',
      'CS 5000 1oz Clear PP Portion Pot',
      'CS 5000 1oz Clear PET Portion Pot Lid',
      'Label Bin Bag',
      'Sushi grease paper',
      'Dishwasher Salt',
      'Blue gloves - Small',
      'Blue gloves - Medium',
      'Blue gloves - Large',
      'Blue gloves - XL',
      'Blue roll'
    ]
  },
  {
    name: 'Asia Market',
    items: [
      'LJ Instant Boba Kit 24x174g',
      'Chicken & Vegetable Dumplings 10x600g',
      'Duck Dumplings 10x600g',
      'Vegan Vegetable Dumplings 10x600g',
      'Tao Kae Noi Crispy Seaweed Hot & Spicy 24x32g',
      'Tao Kae Noi Crispy Seaweed Original 24x32g',
      'Kikkoman Less Salt Soy Sauce 6x150ml',
      'Kikkoman Teriyaki Sauce with Roasted Garlic 6x250ml'
    ]
  },
  {
    name: 'VS Direct - Stickers',
    items: [
      'Chicken sticker',
      'Salmon sticker',
      'Seafood sticker',
      'Surimi sticker',
      'Plant based sticker',
      'Prawn sticker',
      'Duck sticker',
      'Choc Moji barcode',
      'Strawberry Moji barcode'
    ]
  }
];

export default function SupplierTab({ theme }: SupplierTabProps) {
  const isLight = theme === 'light';

  return (
    <section className="space-y-6">
      <div className={`rounded-3xl border p-6 transition-colors ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-900'}`}>
        <p className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>COG Supplier Master List</p>
        <h2 className={`mt-2 text-xl font-black ${isLight ? 'text-zinc-900' : 'text-3d-gold drop-shadow-md'}`}>Supplier Catalog</h2>
        <p className="mt-1 text-xs text-zinc-500">Centralized COG supplier and item mapping for purchasing and planning.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {supplierCatalog.map((supplier) => (
          <article
            key={supplier.name}
            className={`rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
              isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-zinc-200'}`}>{supplier.name}</h3>
              <span className={`text-[10px] font-mono px-2 py-1 rounded-full border ${isLight ? 'border-zinc-300 text-zinc-600' : 'border-zinc-700 text-zinc-400'}`}>
                {supplier.items.length} items
              </span>
            </div>
            <ul className={`space-y-1.5 text-xs ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              {supplier.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
