// Saksee · 2026-07-24 · business rules for 3-kiosk sushi operator
// 2 Tesco + 1 Marks & Spencer. Same cost structure, different products per location.

export const BRANCH_META = [
  { id: "tesco-cork", name: "Tesco - Cork City", type: "Tesco", short: "Cork", colour: "#22c55e", css: "branch-cork" },
  { id: "tesco-mahon", name: "Tesco - Mahon Point", type: "Tesco", short: "Mahon", colour: "#3b82f6", css: "branch-mahon" },
  { id: "ms-cork", name: "Marks & Spencer - Cork City", type: "M&S", short: "M&S", colour: "#e8bf66", css: "branch-ms" },
] as const;

export const BUSINESS_LOCATIONS = BRANCH_META.map((b) => ({ id: b.id, name: b.name, type: b.type }));

export type BusinessLocation = (typeof BRANCH_META)[number]["name"];
export type BranchId = (typeof BRANCH_META)[number]["id"];

/** Target waste cost as % of production value/cost. */
export const WASTE_TARGET_PCT = 10;

/** Target COGS as % of net sales (after commission). */
export const COGS_TARGET_PCT = 30;

/** Retailer commission as % of gross sales. */
export const COMMISSION_TARGET_PCT = 30;

/** Net sales after commission = gross sales × (1 - COMMISSION_TARGET_PCT). */
export const NET_SALES_FACTOR = 1 - COMMISSION_TARGET_PCT / 100;

/** Default production target used when none provided. */
export const DEFAULT_DAILY_PRODUCTION_TARGET = 2500;

// Product catalog exported here so both App.tsx and SellTab.tsx can import from one source.
export const TESCO_PRODUCTS = [
  { name: "YO! highlights", price: 11.25, barcode: "5391548890457", category: "Platters" },
  { name: "Veggie tofu yakisoba noodles", price: 7.95, barcode: "5391548890679", category: "Noodles" },
  { name: "Veggie gyoza", price: 5.95, barcode: "5391548890150", category: "Sides" },
  { name: "TokYO! party platter", price: 16.75, barcode: "5391548890549", category: "Platters" },
  { name: "Teriyaki chicken udon noodles", price: 8.25, barcode: "5391548890730", category: "Noodles" },
  { name: "Tokyo top 5", price: 11.25, barcode: "5391548890495", category: "Platters" },
  { name: "Teriyaki chicken rice bowl", price: 7.95, barcode: "5391548890648", category: "Noodles" },
  { name: "Teriyaki chicken karaage", price: 7.75, barcode: "5391548890129", category: "Hot" },
  { name: "Sweet chilli chicken yakitori", price: 5.50, barcode: "5391548890136", category: "Hot" },
  { name: "Sriracha salmon poké bowl", price: 8.25, barcode: "5391548890600", category: "Poke" },
  { name: "St Patrick's Irish stout karaage", price: 7.75, barcode: "5391548892611", category: "Hot" },
  { name: "Strawberry cheesecake mochi", price: 3.95, barcode: "5391548890754", category: "Dessert" },
  { name: "Spicy veggie roll", price: 5.50, barcode: "5391548890266", category: "Rolls" },
  { name: "Spicy salmon avocado sushi sando", price: 4.95, barcode: "5391548892512", category: "Sando" },
  { name: "Spicy salmon & avocado roll", price: 7.25, barcode: "5391548890372", category: "Rolls" },
  { name: "Spicy california roll", price: 5.95, barcode: "5391548890303", category: "Rolls" },
  { name: "Spicy chicken katsu crunch roll", price: 6.50, barcode: "5391548890358", category: "Rolls" },
  { name: "Spicy prawn katsu roll", price: 7.95, barcode: "5391548890419", category: "Rolls" },
  { name: "Spice up YO! life", price: 11.25, barcode: "5391548890464", category: "Platters" },
  { name: "Shinjuku Collection", price: 27.95, barcode: "5391548892376", category: "Platters" },
  { name: "Shibuya Collection", price: 23.50, barcode: "5391548892499", category: "Platters" },
  { name: "Salmon maki", price: 4.50, barcode: "5391548890020", category: "Rolls" },
  { name: "Salmon nigiri", price: 6.95, barcode: "5391548890051", category: "Nigiri" },
  { name: "Seaweed salad", price: 3.95, barcode: "5391548890174", category: "Sides" },
  { name: "Salmon dragon roll", price: 8.75, barcode: "5391548890181", category: "Rolls" },
  { name: "Salmon sashimi", price: 7.75, barcode: "5391548890068", category: "Sashimi" },
  { name: "Salmon Poke", price: 8.25, barcode: "5391548892642", category: "Poke" },
  { name: "Saikou! selects", price: 9.75, barcode: "5391548890518", category: "Platters" },
  { name: "Sakana selects", price: 9.75, barcode: "5391548890501", category: "Platters" },
  { name: "Salmon classics", price: 9.75, barcode: "5391548890440", category: "Platters" },
  { name: "Pumpkin katsu rice bowl", price: 7.25, barcode: "5391548890655", category: "Noodles" },
  { name: "Pumpkin katsu curry", price: 7.75, barcode: "5391548890624", category: "Hot" },
  { name: "Pumpkin katsu bao", price: 4.50, barcode: "5391548890099", category: "Bao" },
  { name: "Nigiri selection", price: 6.95, barcode: "5391548890044", category: "Nigiri" },
  { name: "Osaka veggie platter", price: 14.95, barcode: "5391548890556", category: "Platters" },
  { name: "Plant power", price: 8.50, barcode: "5391548890471", category: "Platters" },
  { name: "Mixed maki box", price: 6.75, barcode: "5391548890525", category: "Rolls" },
  { name: "Mexican Mango Salmon Sharer", price: 19.75, barcode: "5391548892789", category: "Platters" },
  { name: "Mexican Mango Salmon Roll", price: 7.95, barcode: "5391548892741", category: "Rolls" },
  { name: "Mexican Mango Salmon Bento", price: 11.25, barcode: "5391548892765", category: "Platters" },
  { name: "Mexican Crunch Chicken Roll", price: 6.95, barcode: "5391548892734", category: "Rolls" },
  { name: "Korean chicken udon noodles", price: 8.25, barcode: "5391548890723", category: "Noodles" },
  { name: "Lucky dip", price: 12.95, barcode: "5391548890488", category: "Platters" },
  { name: "Mexican Crunch Chicken Bento", price: 10.75, barcode: "5391548892758", category: "Platters" },
  { name: "Inari nigiri", price: 4.75, barcode: "5391548890037", category: "Nigiri" },
  { name: "Harajuku Collection", price: 33.50, barcode: "5391548892406", category: "Platters" },
  { name: "Ginza Collection", price: 36.95, barcode: "5391548892437", category: "Platters" },
  { name: "Crunchy prawn katsu roll", price: 8.25, barcode: "5391548890426", category: "Rolls" },
  { name: "Crunchy salmon & avocado roll", price: 7.50, barcode: "5391548890389", category: "Rolls" },
  { name: "Crunchy veggie roll", price: 5.75, barcode: "5391548890273", category: "Rolls" },
  { name: "Chocolate mochi", price: 3.95, barcode: "5391548890747", category: "Dessert" },
  { name: "Crunchy california roll", price: 6.25, barcode: "5391548890310", category: "Rolls" },
  { name: "Crunchy chicken katsu roll", price: 6.25, barcode: "5391548890341", category: "Rolls" },
  { name: "Chicken teriyaki sushi sando", price: 4.75, barcode: "5391548892505", category: "Sando" },
  { name: "Chicken teriyaki roll", price: 6.50, barcode: "5391548890204", category: "Rolls" },
  { name: "Chicken yakisoba noodles", price: 7.95, barcode: "5391548890662", category: "Noodles" },
  { name: "Chicken katsu curry udon noodles", price: 7.75, barcode: "5391548890716", category: "Noodles" },
  { name: "Chicken teriyaki bao", price: 4.50, barcode: "5391548890075", category: "Bao" },
  { name: "Chicken teriyaki Poke", price: 8.25, barcode: "5391548892635", category: "Poke" },
  { name: "Avocado maki", price: 3.50, barcode: "5391548890006", category: "Rolls" },
  { name: "Chicken gyoza", price: 6.25, barcode: "5391548890143", category: "Sides" },
  { name: "California sushi sando", price: 4.75, barcode: "5391548892529", category: "Sando" },
  { name: "California mango roll", price: 6.50, barcode: "5391548890198", category: "Rolls" },
  { name: "Chicken gyoza udon noodles", price: 7.75, barcode: "5391548890709", category: "Noodles" },
  { name: "Chicken katsu bao", price: 4.50, barcode: "5391548890082", category: "Bao" },
  { name: "Chicken katsu curry", price: 7.95, barcode: "5391548890617", category: "Hot" }
];

export const MS_PRODUCTS = [
  { name: "Avocado Maki", price: 3.50, barcode: "5055372900774", category: "Rolls" },
  { name: "California Catch", price: 10.25, barcode: "5055378900729", category: "Platters" },
  { name: "California Mango Roll", price: 6.75, barcode: "5055372900635", category: "Rolls" },
  { name: "California Mango Volcano Roll", price: 6.25, barcode: "5055372901726", category: "Rolls" },
  { name: "Chicken Karaage", price: 8.50, barcode: "5055372901108", category: "Hot" },
  { name: "Chicken Gyoza Udon Noodles", price: 8.25, barcode: "5055372901634", category: "Noodles" },
  { name: "Chicken Katsu Bao Bun", price: 4.75, barcode: "5055372901214", category: "Bao" },
  { name: "Chicken Katsu Curry", price: 8.25, barcode: "5055372901139", category: "Hot" },
  { name: "Chicken Katsu Curry Udon Noodles", price: 8.25, barcode: "5055372901641", category: "Noodles" },
  { name: "Chicken Teriyaki Poke", price: 8.25, barcode: "5391548892598", category: "Poke" },
  { name: "Chicken Teriyaki Roll", price: 6.75, barcode: "5055372900842", category: "Rolls" },
  { name: "Chicken Yakisoba Noodles", price: 8.50, barcode: "5055372901160", category: "Noodles" },
  { name: "Chicken Yakitori", price: 5.75, barcode: "5055372901221", category: "Hot" },
  { name: "Chocolate Truffle Mochi", price: 4.25, barcode: "5055372901054", category: "Dessert" },
  { name: "Crunchy California Roll", price: 6.50, barcode: "5055372900628", category: "Rolls" },
  { name: "Crunchy Fiesta Chicken Feast", price: 19.95, barcode: "5391548892918", category: "Platters" },
  { name: "Crunchy Fiesta Chicken Roll", price: 7.95, barcode: "5391548892671", category: "Rolls" },
  { name: "Crunchy Fiesta Chicken Trio", price: 11.25, barcode: "5391548892695", category: "Platters" },
  { name: "Cucumber Maki", price: 3.50, barcode: "5055372900781", category: "Rolls" },
  { name: "Duck Gyoza", price: 6.75, barcode: "5055372901481", category: "Sides" },
  { name: "Dynamite Crunch Roll", price: 8.75, barcode: "5055372900611", category: "Rolls" },
  { name: "Fiesta Mango Chicken Poke", price: 8.25, barcode: "5391548892664", category: "Poke" },
  { name: "Fiesta Mango Salmon Feast", price: 21.95, barcode: "5391548892925", category: "Platters" },
  { name: "Fiesta Mango Salmon Roll", price: 8.50, barcode: "5391548892588", category: "Rolls" },
  { name: "Fiesta Mango Salmon Poke", price: 8.95, barcode: "5391548892657", category: "Poke" },
  { name: "Fiesta Mango Salmon Trio", price: 11.75, barcode: "5391548892901", category: "Platters" },
  { name: "Fiji Collection", price: 11.25, barcode: "5055372900682", category: "Platters" },
  { name: "Ginza Group", price: 8.25, barcode: "5391548892177", category: "Platters" },
  { name: "Green Scene", price: 8.95, barcode: "5055372900699", category: "Platters" },
  { name: "Inari Pocket", price: 4.95, barcode: "5055372901450", category: "Nigiri" },
  { name: "Kaiso Seaweed Salad", price: 4.25, barcode: "5055372901030", category: "Sides" },
  { name: "Kiso Selection", price: 24.95, barcode: "5391548892352", category: "Platters" },
  { name: "Korean Chicken Karaage", price: 8.50, barcode: "5055372901115", category: "Hot" },
  { name: "Korean Chicken Rice Bowl", price: 8.25, barcode: "5055372901146", category: "Noodles" },
  { name: "Korean Chicken Udon Noodles", price: 8.50, barcode: "5055372901658", category: "Noodles" },
  { name: "Kyoto Sharer", price: 15.95, barcode: "5055372900767", category: "Platters" },
  { name: "Lucky No.7", price: 11.75, barcode: "5055372900712", category: "Platters" },
  { name: "Nagoya Selection", price: 29.95, barcode: "5391548892583", category: "Platters" },
  { name: "Nigiri Allsorts", price: 7.25, barcode: "5055372900910", category: "Nigiri" },
  { name: "Osaka Selects", price: 11.75, barcode: "5055372900675", category: "Platters" },
  { name: "Otaki Selection", price: 39.95, barcode: "5391548892451", category: "Platters" },
  { name: "Prawn Firecracker Yakisoba Noodles", price: 8.75, barcode: "5055372901191", category: "Noodles" },
  { name: "Pumpkin Katsu Bao", price: 4.75, barcode: "5055372901092", category: "Bao" },
  { name: "Pumpkin Katsu Curry", price: 7.95, barcode: "5055372901078", category: "Hot" },
  { name: "Pumpkin Katsu with rice", price: 7.75, barcode: "5055372901085", category: "Noodles" },
  { name: "Sakura Spring Selection", price: 23.95, barcode: "5391548892703", category: "Platters" },
  { name: "Salmon Avocado Roll", price: 7.50, barcode: "5055372900873", category: "Rolls" },
  { name: "Salmon and Avocado Crystal Roll", price: 7.95, barcode: "5391548892888", category: "Rolls" },
  { name: "Salmon and Cream cheese Poke", price: 8.75, barcode: "5391548892581", category: "Poke" },
  { name: "Salmon and Tuna Poke", price: 9.95, barcode: "5391548892567", category: "Poke" },
  { name: "Salmon Blossom Box", price: 15.95, barcode: "5391548892697", category: "Platters" },
  { name: "Salmon Cream Cheese Roll", price: 7.95, barcode: "5391548892191", category: "Rolls" },
  { name: "Salmon Cream Cheese Trio", price: 10.95, barcode: "5391548892710", category: "Platters" },
  { name: "Salmon Dragon Roll", price: 9.25, barcode: "5055372900804", category: "Rolls" },
  { name: "Salmon Lovers", price: 10.25, barcode: "5055372900668", category: "Platters" },
  { name: "Salmon Maki", price: 4.75, barcode: "5055372900798", category: "Rolls" },
  { name: "Salmon Nigiri", price: 7.50, barcode: "5055372901474", category: "Nigiri" },
  { name: "Salmon Non-stop", price: 13.75, barcode: "5055372900705", category: "Platters" },
  { name: "Salmon Poke", price: 8.75, barcode: "5391548892574", category: "Poke" },
  { name: "Salmon Sashimi", price: 7.95, barcode: "5055372900927", category: "Sashimi" },
  { name: "Salmon Volcano Roll", price: 7.75, barcode: "5055372901702", category: "Rolls" },
  { name: "Seikai Salmon Collection", price: 12.25, barcode: "5391548892314", category: "Platters" },
  { name: "Sesame Prawn Katsu Roll", price: 8.25, barcode: "5055372900659", category: "Rolls" },
  { name: "Shibuya Sharer", price: 17.75, barcode: "5055372900750", category: "Platters" },
  { name: "Sláinte Roll", price: 7.75, barcode: "5055372900903", category: "Rolls" },
  { name: "Spicy California Roll", price: 6.25, barcode: "5055372901869", category: "Rolls" },
  { name: "Spicy Chicken Katsu Roll", price: 7.25, barcode: "5055372900866", category: "Rolls" },
  { name: "Spicy Crunchy Salmon Avocado Roll", price: 8.25, barcode: "5055372901405", category: "Rolls" },
  { name: "Spicy Salmon Avocado Roll", price: 7.75, barcode: "5055372901389", category: "Rolls" },
  { name: "Spicy Salmon Gunkan", price: 5.25, barcode: "5391548892321", category: "Nigiri" },
  { name: "Sriracha Salmon Poké", price: 8.75, barcode: "5055372900958", category: "Poke" },
  { name: "Strawberry Cheesecake Mochi", price: 4.25, barcode: "5055372901061", category: "Dessert" },
  { name: "Teriyaki Chicken Karaage", price: 8.50, barcode: "5055372901122", category: "Hot" },
  { name: "Teriyaki Chicken Rice Bowl", price: 8.25, barcode: "5055372901153", category: "Noodles" },
  { name: "Teriyaki Chicken Udon Noodles", price: 8.50, barcode: "5055372901665", category: "Noodles" },
  { name: "Tofu and Veggie Yakisoba Noodles", price: 8.50, barcode: "5055372901177", category: "Noodles" },
  { name: "Tofu Firecracker Yakisoba Noodles", price: 8.50, barcode: "5055372901184", category: "Noodles" },
  { name: "Tokyo Market Specials", price: 13.95, barcode: "5391548892558", category: "Platters" },
  { name: "Toyosu Duo", price: 10.25, barcode: "5055372900736", category: "Platters" },
  { name: "Veggie Gyoza", price: 6.25, barcode: "5055372901145", category: "Sides" },
  { name: "Yasai Roll", price: 5.75, barcode: "5055372900897", category: "Rolls" }
];

/** Derive a COGS target from gross sales. */
export const cogsTargetFromSales = (sales: number) => sales * NET_SALES_FACTOR * (COGS_TARGET_PCT / 100);

/** Derive a waste-cost target from production value. */
export const wasteTargetFromProduction = (productionValue: number) => productionValue * (WASTE_TARGET_PCT / 100);
