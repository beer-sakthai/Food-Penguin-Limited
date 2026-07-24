import {
  CoreMetrics,
  SalesOrder,
  CompanyTarget,
  Recipe,
  ProductionTask,
  WasteRecord,
  EmployeeHour,
  InventoryItem,
  RealtimeAlert,
  DailyOperationalLog
} from './types';
import {
  COGS_TARGET_PCT,
  COMMISSION_TARGET_PCT,
  WASTE_TARGET_PCT,
  NET_SALES_FACTOR,
  cogsTargetFromSales,
  wasteTargetFromProduction,
} from './business';

export const initialMetrics: CoreMetrics = {
  salesToday: 7500,
  salesGrowth: 12.4,
  productionItems: 2200,
  productionTarget: 2500,
  wasteCost: 196.50,
  wasteReduction: 8.2,
  hoursScheduled: 84,
  overtimeHours: 0,
  aiHealthScore: 94
};

export const initialOrders: SalesOrder[] = [
  // Marks & Spencer - Cork City (Luxury Gourmet Sushi Specialties)
  { id: 'FP-1084', timestamp: '14:10', date: '2026-06-28', item: 'Luxury Salmon & Caviar Platter', category: 'Sashimi & Platters', quantity: 2, amount: 69.00, barcode: '5391548895018', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1083', timestamp: '13:58', date: '2026-06-28', item: 'Gastropub Spicy Truffle Roll', category: 'Specialty Rolls', quantity: 1, amount: 19.95, barcode: '5391548895025', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1081', timestamp: '13:45', date: '2026-06-26', item: 'Handcrafted Premium Dragon Roll', category: 'Sushi Rolls', quantity: 3, amount: 52.50, barcode: '5391548895049', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1079', timestamp: '13:12', item: 'Luxury Salmon & Caviar Platter', category: 'Sashimi & Platters', quantity: 1, date: '2026-06-19', amount: 34.50, barcode: '5391548895018', status: 'Completed', branch: 'Marks & Spencer - Cork City' },

  // Tesco - Cork City (Everyday Value & Finest Selection)
  { id: 'FP-2081', timestamp: '13:51', date: '2026-06-19', item: 'salmon sashimi', category: 'Sashimi Selections', quantity: 1, amount: 7.75, barcode: '5391548890068', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-2080', timestamp: '13:30', date: '2026-06-18', item: 'spicy veggie roll', category: 'Sushi Rolls', quantity: 2, amount: 11.00, barcode: '5391548890266', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-2078', timestamp: '12:45', date: '2026-06-25', item: 'veggie tofu yakisoba noodles', category: 'Noodles & Sides', quantity: 2, amount: 15.90, barcode: '5391548890679', status: 'Completed', branch: 'Tesco - Cork City' },

  // Tesco - Mahon Point (Everyday Value, Meals, & Local Mahon Special)
  { id: 'FP-3081', timestamp: '13:55', date: '2026-06-20', item: 'spicy veggie roll', category: 'Sushi Rolls', quantity: 1, amount: 5.50, barcode: '5391548890266', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-3080', timestamp: '13:20', date: '2026-06-15', item: 'TokYO! party platter', category: 'Party Platters', quantity: 1, amount: 16.75, barcode: '5391548890549', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-3078', timestamp: '12:30', date: '2026-06-28', item: 'veggie tofu yakisoba noodles', category: 'Noodles & Sides', quantity: 3, amount: 23.85, barcode: '5391548890679', status: 'Completed', branch: 'Tesco - Mahon Point' }
];

export const initialTargets: CompanyTarget[] = [
  { id: 'T-1', name: 'Sushi Revenue Target', metric: 'Total Sales (€)', targetValue: 8000, currentValue: 7500, unit: '€', category: 'Sell', deadline: 'Today, 22:00', date: '2026-06-28' },
  { id: 'T-2', name: 'Sushi Rolls Made', metric: 'Items Rolled', targetValue: 2500, currentValue: 2200, unit: 'units', category: 'Production', deadline: 'Today, 21:05', date: '2026-06-28' },
  { id: 'T-3', name: 'Waste Budget', metric: 'Waste vs Production', targetValue: WASTE_TARGET_PCT, currentValue: 8.9, unit: '%', category: 'Waste', deadline: 'Today, 22:00', date: '2026-06-28' },
  { id: 'T-4', name: 'COGS Target', metric: 'COGS vs Net Sales', targetValue: COGS_TARGET_PCT, currentValue: 31.0, unit: '%', category: 'Finance', deadline: 'End of Month', date: '2026-06-28' },
  { id: 'T-5', name: 'Retailer Commission', metric: 'Commission vs Gross', targetValue: COMMISSION_TARGET_PCT, currentValue: COMMISSION_TARGET_PCT, unit: '%', category: 'Finance', deadline: 'Every Sale', date: '2026-06-28' }
];

export const initialRecipes: Recipe[] = [
  { id: 'R-1', name: 'Tokyo Dragon Roll', category: 'Sushi Rolls', status: 'active', prepTime: 8, ingredients: ['Eel Fish', 'Shrimp Tempura', 'Fresh Avocado', 'Cucumber strip', 'Sweet Eel Glaze', 'Nori Seaweed'], allergens: ['Fish', 'Gluten', 'Sulphites'] },
  { id: 'R-2', name: 'Kyoto Salmon Sashimi Platter', category: 'Sashimi & Platters', status: 'active', prepTime: 12, ingredients: ['Atlantic Salmon Fillet', 'White Daikon Radish ruff', 'Fresh Shiso leaves', 'Artisanal Wasabi paste', 'Soy Sauce'], allergens: ['Fish', 'Soya', 'Gluten'] },
  { id: 'R-3', name: 'Spicy Bluefin Tuna Roll', category: 'Sushi Rolls', status: 'active', prepTime: 4, ingredients: ['Spicy Minced Tuna', 'Crispy Cucumber', 'Kyoto Spicy Mayo', 'Toasted Sesame seeds', 'Sushi Grains'], allergens: ['Fish', 'Eggs', 'Sesame'] },
  { id: 'R-4', name: 'California Roll Classic', category: 'Sushi Rolls', status: 'active', prepTime: 15, ingredients: ['Snow Crab Stick', 'Avocado slice', 'Fresh Cucumber', 'Premium Sushi Rice', 'Nori Sheets'], allergens: ['Crustaceans', 'Gluten'] },
  { id: 'R-5', name: 'Volcano Baked Scallop Roll', category: 'Specialty Rolls', status: 'active', prepTime: 6, ingredients: ['Spicy Crab Mix', 'Chopped Sea Scallops', 'Creamy Spicy Mayo', 'Sweet Soy Reduction', 'Masago Fish Roe'], allergens: ['Molluscs', 'Eggs', 'Fish', 'Soya'] }
];

export const initialTasks: ProductionTask[] = [
  { id: 'PT-301', itemName: 'Tokyo Dragon Roll', assignedTo: 'Chef Skipper', status: 'Cooking', quantity: 2, priority: 'high', date: '2026-06-28' },
  { id: 'PT-302', itemName: 'Kyoto Salmon Sashimi Platter', assignedTo: 'Chef Private', status: 'Cooking', quantity: 1, priority: 'medium', date: '2026-06-27' },
  { id: 'PT-303', itemName: 'Spicy Bluefin Tuna Roll', assignedTo: 'Kitchen Aide Rico', status: 'In Queue', quantity: 1, priority: 'low', date: '2026-06-20' },
  { id: 'PT-304', itemName: 'California Roll Classic', assignedTo: 'Chef Kowalski', status: 'Prepared', quantity: 3, priority: 'high', date: '2026-06-19' }
];

export const initialWaste: WasteRecord[] = [
  { id: 'W-901', item: 'Spilled Sushi Rice Vinegar', category: 'Condiments', weight: 4.5, cost: 35.00, reason: 'Spill/Accident', date: '2026-06-19' },
  { id: 'W-902', item: 'Overproduced California Rolls', category: 'Sushi Rolls', weight: 12.0, cost: 48.00, reason: 'Overproduced', date: '2026-06-19' },
  { id: 'W-903', item: 'Expired Tuna Loin Trimmings', category: 'Seafood', weight: 3.2, cost: 74.50, reason: 'Expired', date: '2026-06-19' },
  { id: 'W-904', item: 'Damaged Nori Seaweed Sheets', category: 'Wrapping', weight: 6.0, cost: 24.00, reason: 'Quality Issue', date: '2026-06-19' },
  { id: 'W-905', item: 'Soggy Cucumber Strips', category: 'Produce', weight: 5.0, cost: 15.00, reason: 'Expired', date: '2026-06-18' }
];

export const initialHours: EmployeeHour[] = [
  { id: 'E-01', name: 'Chef Skipper (Lead)', role: 'Head Sushi Chef', status: 'Clocked In', scheduledHours: 40, actualHours: 36.5, shiftStart: '08:00', shiftEnd: '17:00', date: '2026-06-28' },
  { id: 'E-02', name: 'Chef Kowalski', role: 'Sushi Master / Kitchen Analyst', status: 'Clocked In', scheduledHours: 40, actualHours: 35.0, shiftStart: '09:00', shiftEnd: '18:00', date: '2026-06-28' },
  { id: 'E-03', name: 'Chef Private', role: 'Sushi Roll Prep', status: 'Clocked In', scheduledHours: 35, actualHours: 31.0, shiftStart: '10:00', shiftEnd: '18:00', date: '2026-06-27' },
  { id: 'E-04', name: 'Kitchen Aide Rico', role: 'Prep & Rice Cooker', status: 'Clocked In', scheduledHours: 30, actualHours: 28.5, shiftStart: '11:00', shiftEnd: '19:00', date: '2026-06-20' },
  { id: 'E-05', name: 'Alice Smith', role: 'Sushi Counter Manager', status: 'Clocked Out', scheduledHours: 32, actualHours: 32.0, shiftStart: '08:00', shiftEnd: '16:00', date: '2026-06-19' },
  { id: 'E-06', name: 'Bob Johnson', role: 'Cold Logistics Lead', status: 'Clocked Out', scheduledHours: 30, actualHours: 24.0, shiftStart: '12:00', shiftEnd: '20:00', date: '2026-06-18' }
];

export const initialInventory: InventoryItem[] = [
  { id: 'I-101', name: 'Bluefin Tuna Loin', category: 'Seafood', stockLevel: 35, currentQty: 70, unit: 'kg', reorderLevel: 100, status: 'Low' },
  { id: 'I-102', name: 'Atlantic Sushi Salmon', category: 'Seafood', stockLevel: 80, currentQty: 120, unit: 'kg', reorderLevel: 80, status: 'Healthy' },
  { id: 'I-103', name: 'Premium Sushi Rice', category: 'Grains', stockLevel: 55, currentQty: 180, unit: 'kg', reorderLevel: 250, status: 'Low' },
  { id: 'I-104', name: 'Nori Seaweed Sheets', category: 'Dry Goods', stockLevel: 65, currentQty: 1300, unit: 'units', reorderLevel: 1000, status: 'Healthy' },
  { id: 'I-105', name: 'Fresh Avocados', category: 'Produce', stockLevel: 45, currentQty: 90, unit: 'units', reorderLevel: 120, status: 'Low' },
  { id: 'I-106', name: 'Sushi Seasoning Vinegar', category: 'Condiments', stockLevel: 95, currentQty: 475, unit: 'L', reorderLevel: 150, status: 'Healthy' }
];

export const initialAlerts: RealtimeAlert[] = [
  { id: 'A-01', timestamp: '14:12:30', date: '2026-06-28', sensor: 'Cold Room Freezy-01', value: '-19.4°C', status: 'normal', message: 'Temperature remains stable at threshold.' },
  { id: 'A-02', timestamp: '14:08:15', date: '2026-06-28', sensor: 'Sushi Rice Warm Unit A', value: '57.0°C', status: 'normal', message: 'Optimal preservation raw rice temperature verified.' },
  { id: 'A-03', timestamp: '13:55:00', date: '2026-06-27', sensor: 'Seafood Deep Freezer', value: '-12.1°C', status: 'warning', message: 'Slight thermal climb detected during door cycle.' },
  { id: 'A-04', timestamp: '13:10:45', date: '2026-06-19', sensor: 'Dishwasher Rinse Tank', value: '82.5°C', status: 'normal', message: 'Sanitation high-temp rinse verified.' }
];

export const initialWeeklyLogs: DailyOperationalLog[] = [
  {
    day: 'Mon',
    date: '2026-06-15',
    sales: 6400,
    waste: 220.0,
    hours: 82,
    productionTarget: 2500,
    productionMade: 2200,
    supplierName: 'Tazaki',
    cogs: { tazaki: 272, sysco: 268, bulza: 268, sticker: 268, others: 268 }
  },
  {
    day: 'Tue',
    date: '2026-06-16',
    sales: 6900,
    waste: 225.0,
    hours: 84,
    productionTarget: 2500,
    productionMade: 2250,
    supplierName: 'Sysco',
    cogs: { tazaki: 289, sysco: 293, bulza: 289, sticker: 289, others: 289 }
  },
  {
    day: 'Wed',
    date: '2026-06-17',
    sales: 6600,
    waste: 218.0,
    hours: 83,
    productionTarget: 2500,
    productionMade: 2180,
    supplierName: 'Bulza',
    cogs: { tazaki: 277, sysco: 277, bulza: 278, sticker: 277, others: 277 }
  },
  {
    day: 'Thu',
    date: '2026-06-18',
    sales: 7100,
    waste: 232.0,
    hours: 86,
    productionTarget: 2500,
    productionMade: 2320,
    supplierName: 'Sticker',
    cogs: { tazaki: 298, sysco: 298, bulza: 298, sticker: 299, others: 298 }
  },
  {
    day: 'Fri',
    date: '2026-06-19',
    sales: 7600,
    waste: 240.0,
    hours: 88,
    productionTarget: 2500,
    productionMade: 2400,
    supplierName: 'Others',
    cogs: { tazaki: 319, sysco: 319, bulza: 319, sticker: 319, others: 320 }
  },
  {
    day: 'Sat',
    date: '2026-06-20',
    sales: 7800,
    waste: 245.0,
    hours: 90,
    productionTarget: 2500,
    productionMade: 2450,
    supplierName: 'Tazaki',
    cogs: { tazaki: 330, sysco: 327, bulza: 327, sticker: 327, others: 327 }
  },
  {
    day: 'Sun',
    date: '2026-06-21',
    sales: 7500,
    waste: 235.0,
    hours: 88,
    productionTarget: 2500,
    productionMade: 2350,
    supplierName: 'Others',
    cogs: { tazaki: 315, sysco: 315, bulza: 315, sticker: 315, others: 315 }
  }
];

export const alternativeWeeklyLogsMap: Record<string, DailyOperationalLog[]> = {
  '2026-06-15 to 2026-06-21': [
  {
    day: 'Mon',
    date: '2026-06-15',
    sales: 6400,
    waste: 220.0,
    hours: 82,
    productionTarget: 2500,
    productionMade: 2200,
    supplierName: 'Tazaki',
    cogs: { tazaki: 272, sysco: 268, bulza: 268, sticker: 268, others: 268 }
  },
  {
    day: 'Tue',
    date: '2026-06-16',
    sales: 6900,
    waste: 225.0,
    hours: 84,
    productionTarget: 2500,
    productionMade: 2250,
    supplierName: 'Sysco',
    cogs: { tazaki: 289, sysco: 293, bulza: 289, sticker: 289, others: 289 }
  },
  {
    day: 'Wed',
    date: '2026-06-17',
    sales: 6600,
    waste: 218.0,
    hours: 83,
    productionTarget: 2500,
    productionMade: 2180,
    supplierName: 'Bulza',
    cogs: { tazaki: 277, sysco: 277, bulza: 278, sticker: 277, others: 277 }
  },
  {
    day: 'Thu',
    date: '2026-06-18',
    sales: 7100,
    waste: 232.0,
    hours: 86,
    productionTarget: 2500,
    productionMade: 2320,
    supplierName: 'Sticker',
    cogs: { tazaki: 298, sysco: 298, bulza: 298, sticker: 299, others: 298 }
  },
  {
    day: 'Fri',
    date: '2026-06-19',
    sales: 7600,
    waste: 240.0,
    hours: 88,
    productionTarget: 2500,
    productionMade: 2400,
    supplierName: 'Others',
    cogs: { tazaki: 319, sysco: 319, bulza: 319, sticker: 319, others: 320 }
  },
  {
    day: 'Sat',
    date: '2026-06-20',
    sales: 7800,
    waste: 245.0,
    hours: 90,
    productionTarget: 2500,
    productionMade: 2450,
    supplierName: 'Tazaki',
    cogs: { tazaki: 330, sysco: 327, bulza: 327, sticker: 327, others: 327 }
  },
  {
    day: 'Sun',
    date: '2026-06-21',
    sales: 7500,
    waste: 235.0,
    hours: 88,
    productionTarget: 2500,
    productionMade: 2350,
    supplierName: 'Others',
    cogs: { tazaki: 315, sysco: 315, bulza: 315, sticker: 315, others: 315 }
  }
  ],
  '2026-06-22 to 2026-06-28': [
  {
    day: 'Mon',
    date: '2026-06-22',
    sales: 6500,
    waste: 222.0,
    hours: 81,
    productionTarget: 2500,
    productionMade: 2220,
    supplierName: 'Tazaki',
    cogs: { tazaki: 273, sysco: 273, bulza: 273, sticker: 273, others: 273 }
  },
  {
    day: 'Tue',
    date: '2026-06-23',
    sales: 7000,
    waste: 228.0,
    hours: 85,
    productionTarget: 2500,
    productionMade: 2280,
    supplierName: 'Sysco',
    cogs: { tazaki: 294, sysco: 294, bulza: 294, sticker: 294, others: 294 }
  },
  {
    day: 'Wed',
    date: '2026-06-24',
    sales: 6800,
    waste: 224.0,
    hours: 84,
    productionTarget: 2500,
    productionMade: 2240,
    supplierName: 'Bulza',
    cogs: { tazaki: 285, sysco: 285, bulza: 288, sticker: 285, others: 285 }
  },
  {
    day: 'Thu',
    date: '2026-06-25',
    sales: 7300,
    waste: 238.0,
    hours: 87,
    productionTarget: 2500,
    productionMade: 2380,
    supplierName: 'Sticker',
    cogs: { tazaki: 306, sysco: 306, bulza: 306, sticker: 309, others: 306 }
  },
  {
    day: 'Fri',
    date: '2026-06-26',
    sales: 7900,
    waste: 248.0,
    hours: 90,
    productionTarget: 2500,
    productionMade: 2480,
    supplierName: 'Others',
    cogs: { tazaki: 331, sysco: 331, bulza: 331, sticker: 331, others: 335 }
  },
  {
    day: 'Sat',
    date: '2026-06-27',
    sales: 8100,
    waste: 250.0,
    hours: 92,
    productionTarget: 2500,
    productionMade: 2500,
    supplierName: 'Tazaki',
    cogs: { tazaki: 341, sysco: 340, bulza: 340, sticker: 340, others: 340 }
  },
  {
    day: 'Sun',
    date: '2026-06-28',
    sales: 7500,
    waste: 220.0,
    hours: 88,
    productionTarget: 2500,
    productionMade: 2200,
    supplierName: 'Others',
    cogs: { tazaki: 315, sysco: 315, bulza: 315, sticker: 315, others: 315 }
  }
  ],
  '2026-06-08 to 2026-06-14': [
  {
    day: 'Mon',
    date: '2026-06-08',
    sales: 6000,
    waste: 210.0,
    hours: 80,
    productionTarget: 2400,
    productionMade: 2100,
    supplierName: 'Tazaki',
    cogs: { tazaki: 252, sysco: 252, bulza: 252, sticker: 252, others: 252 }
  },
  {
    day: 'Tue',
    date: '2026-06-09',
    sales: 6400,
    waste: 215.0,
    hours: 82,
    productionTarget: 2400,
    productionMade: 2150,
    supplierName: 'Sysco',
    cogs: { tazaki: 268, sysco: 272, bulza: 268, sticker: 268, others: 268 }
  },
  {
    day: 'Wed',
    date: '2026-06-10',
    sales: 6200,
    waste: 212.0,
    hours: 81,
    productionTarget: 2400,
    productionMade: 2120,
    supplierName: 'Bulza',
    cogs: { tazaki: 260, sysco: 260, bulza: 262, sticker: 260, others: 260 }
  },
  {
    day: 'Thu',
    date: '2026-06-11',
    sales: 6800,
    waste: 225.0,
    hours: 84,
    productionTarget: 2400,
    productionMade: 2250,
    supplierName: 'Sticker',
    cogs: { tazaki: 285, sysco: 285, bulza: 285, sticker: 288, others: 285 }
  },
  {
    day: 'Fri',
    date: '2026-06-12',
    sales: 7200,
    waste: 230.0,
    hours: 86,
    productionTarget: 2400,
    productionMade: 2300,
    supplierName: 'Others',
    cogs: { tazaki: 302, sysco: 302, bulza: 302, sticker: 302, others: 304 }
  },
  {
    day: 'Sat',
    date: '2026-06-13',
    sales: 7400,
    waste: 232.0,
    hours: 88,
    productionTarget: 2400,
    productionMade: 2320,
    supplierName: 'Tazaki',
    cogs: { tazaki: 314, sysco: 310, bulza: 310, sticker: 310, others: 310 }
  },
  {
    day: 'Sun',
    date: '2026-06-14',
    sales: 7000,
    waste: 220.0,
    hours: 85,
    productionTarget: 2400,
    productionMade: 2200,
    supplierName: 'Others',
    cogs: { tazaki: 294, sysco: 294, bulza: 294, sticker: 294, others: 294 }
  }
  ],
};
