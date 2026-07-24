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
  salesToday: 14820,
  salesGrowth: 12.4,
  productionItems: 11240,
  productionTarget: 11500,
  wasteCost: 412.50,
  wasteReduction: 18.2,
  hoursScheduled: 124,
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
  { id: 'T-1', name: 'Sushi Revenue Target', metric: 'Total Sales (€)', targetValue: 15000, currentValue: 14820, unit: '€', category: 'Sell', deadline: 'Today, 22:00', date: '2026-06-28' },
  { id: 'T-2', name: 'Sushi Rolls Made', metric: 'Items Rolled', targetValue: 11500, currentValue: 11240, unit: 'units', category: 'Production', deadline: 'Today, 21:05', date: '2026-06-28' },
  { id: 'T-3', name: 'Waste Budget', metric: 'Waste vs Production', targetValue: WASTE_TARGET_PCT, currentValue: 3.7, unit: '%', category: 'Waste', deadline: 'Today, 22:00', date: '2026-06-28' },
  { id: 'T-4', name: 'COGS Target', metric: 'COGS vs Net Sales', targetValue: COGS_TARGET_PCT, currentValue: 33.0, unit: '%', category: 'Finance', deadline: 'End of Month', date: '2026-06-28' },
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
    sales: 10450,
    waste: 980.0,
    hours: 110,
    productionTarget: 11500,
    productionMade: 9800,
    supplierName: 'Tazaki',
    cogs: { tazaki: 442, sysco: 438, bulza: 438, sticker: 438, others: 438 }
  },
  {
    day: 'Tue',
    date: '2026-06-16',
    sales: 11200,
    waste: 1020.0,
    hours: 115,
    productionTarget: 11500,
    productionMade: 10200,
    supplierName: 'Sysco',
    cogs: { tazaki: 470, sysco: 472, bulza: 470, sticker: 470, others: 470 }
  },
  {
    day: 'Wed',
    date: '2026-06-17',
    sales: 10800,
    waste: 1010.0,
    hours: 118,
    productionTarget: 11500,
    productionMade: 10100,
    supplierName: 'Bulza',
    cogs: { tazaki: 453, sysco: 453, bulza: 456, sticker: 453, others: 453 }
  },
  {
    day: 'Thu',
    date: '2026-06-18',
    sales: 12500,
    waste: 1110.0,
    hours: 120,
    productionTarget: 11500,
    productionMade: 11100,
    supplierName: 'Sticker',
    cogs: { tazaki: 525, sysco: 525, bulza: 525, sticker: 525, others: 525 }
  },
  {
    day: 'Fri',
    date: '2026-06-19',
    sales: 13800,
    waste: 1130.0,
    hours: 122,
    productionTarget: 11500,
    productionMade: 11300,
    supplierName: 'Others',
    cogs: { tazaki: 579, sysco: 579, bulza: 579, sticker: 579, others: 582 }
  },
  {
    day: 'Sat',
    date: '2026-06-20',
    sales: 14200,
    waste: 1140.0,
    hours: 125,
    productionTarget: 11500,
    productionMade: 11400,
    supplierName: 'Tazaki',
    cogs: { tazaki: 598, sysco: 596, bulza: 596, sticker: 596, others: 596 }
  },
  {
    day: 'Sun',
    date: '2026-06-21',
    sales: 14820,
    waste: 1124.0,
    hours: 124,
    productionTarget: 11500,
    productionMade: 11240,
    supplierName: 'Others',
    cogs: { tazaki: 622, sysco: 622, bulza: 622, sticker: 622, others: 624 }
  }
];

export const alternativeWeeklyLogsMap: Record<string, DailyOperationalLog[]> = {
  '2026-06-15 to 2026-06-21': [
  {
    day: 'Mon',
    date: '2026-06-15',
    sales: 10450,
    waste: 980.0,
    hours: 110,
    productionTarget: 11500,
    productionMade: 9800,
    supplierName: 'Tazaki',
    cogs: { tazaki: 442, sysco: 438, bulza: 438, sticker: 438, others: 438 }
  },
  {
    day: 'Tue',
    date: '2026-06-16',
    sales: 11200,
    waste: 1020.0,
    hours: 115,
    productionTarget: 11500,
    productionMade: 10200,
    supplierName: 'Sysco',
    cogs: { tazaki: 470, sysco: 472, bulza: 470, sticker: 470, others: 470 }
  },
  {
    day: 'Wed',
    date: '2026-06-17',
    sales: 10800,
    waste: 1010.0,
    hours: 118,
    productionTarget: 11500,
    productionMade: 10100,
    supplierName: 'Bulza',
    cogs: { tazaki: 453, sysco: 453, bulza: 456, sticker: 453, others: 453 }
  },
  {
    day: 'Thu',
    date: '2026-06-18',
    sales: 12500,
    waste: 1110.0,
    hours: 120,
    productionTarget: 11500,
    productionMade: 11100,
    supplierName: 'Sticker',
    cogs: { tazaki: 525, sysco: 525, bulza: 525, sticker: 525, others: 525 }
  },
  {
    day: 'Fri',
    date: '2026-06-19',
    sales: 13800,
    waste: 1130.0,
    hours: 122,
    productionTarget: 11500,
    productionMade: 11300,
    supplierName: 'Others',
    cogs: { tazaki: 579, sysco: 579, bulza: 579, sticker: 579, others: 582 }
  },
  {
    day: 'Sat',
    date: '2026-06-20',
    sales: 14200,
    waste: 1140.0,
    hours: 125,
    productionTarget: 11500,
    productionMade: 11400,
    supplierName: 'Tazaki',
    cogs: { tazaki: 598, sysco: 596, bulza: 596, sticker: 596, others: 596 }
  },
  {
    day: 'Sun',
    date: '2026-06-21',
    sales: 14820,
    waste: 1124.0,
    hours: 124,
    productionTarget: 11500,
    productionMade: 11240,
    supplierName: 'Others',
    cogs: { tazaki: 622, sysco: 622, bulza: 622, sticker: 622, others: 624 }
  }
  ],
  '2026-06-22 to 2026-06-28': [
  {
    day: 'Mon',
    date: '2026-06-22',
    sales: 11000,
    waste: 990.0,
    hours: 108,
    productionTarget: 11500,
    productionMade: 9900,
    supplierName: 'Tazaki',
    cogs: { tazaki: 462, sysco: 462, bulza: 462, sticker: 462, others: 462 }
  },
  {
    day: 'Tue',
    date: '2026-06-23',
    sales: 11500,
    waste: 1040.0,
    hours: 114,
    productionTarget: 11500,
    productionMade: 10400,
    supplierName: 'Sysco',
    cogs: { tazaki: 483, sysco: 483, bulza: 483, sticker: 483, others: 483 }
  },
  {
    day: 'Wed',
    date: '2026-06-24',
    sales: 11200,
    waste: 1030.0,
    hours: 116,
    productionTarget: 11500,
    productionMade: 10300,
    supplierName: 'Bulza',
    cogs: { tazaki: 470, sysco: 470, bulza: 472, sticker: 470, others: 470 }
  },
  {
    day: 'Thu',
    date: '2026-06-25',
    sales: 12100,
    waste: 1090.0,
    hours: 118,
    productionTarget: 11500,
    productionMade: 10900,
    supplierName: 'Sticker',
    cogs: { tazaki: 508, sysco: 508, bulza: 508, sticker: 509, others: 508 }
  },
  {
    day: 'Fri',
    date: '2026-06-26',
    sales: 14000,
    waste: 1150.0,
    hours: 120,
    productionTarget: 11500,
    productionMade: 11500,
    supplierName: 'Others',
    cogs: { tazaki: 588, sysco: 588, bulza: 588, sticker: 588, others: 588 }
  },
  {
    day: 'Sat',
    date: '2026-06-27',
    sales: 14500,
    waste: 1160.0,
    hours: 122,
    productionTarget: 11500,
    productionMade: 11600,
    supplierName: 'Tazaki',
    cogs: { tazaki: 609, sysco: 609, bulza: 609, sticker: 609, others: 609 }
  },
  {
    day: 'Sun',
    date: '2026-06-28',
    sales: 15200,
    waste: 1180.0,
    hours: 126,
    productionTarget: 11500,
    productionMade: 11800,
    supplierName: 'Others',
    cogs: { tazaki: 638, sysco: 638, bulza: 638, sticker: 638, others: 640 }
  }
  ],
  '2026-06-08 to 2026-06-14': [
  {
    day: 'Mon',
    date: '2026-06-08',
    sales: 9800,
    waste: 940.0,
    hours: 112,
    productionTarget: 11000,
    productionMade: 9400,
    supplierName: 'Tazaki',
    cogs: { tazaki: 414, sysco: 411, bulza: 411, sticker: 411, others: 411 }
  },
  {
    day: 'Tue',
    date: '2026-06-09',
    sales: 10500,
    waste: 980.0,
    hours: 116,
    productionTarget: 11000,
    productionMade: 9800,
    supplierName: 'Sysco',
    cogs: { tazaki: 441, sysco: 441, bulza: 441, sticker: 441, others: 441 }
  },
  {
    day: 'Wed',
    date: '2026-06-10',
    sales: 10100,
    waste: 970.0,
    hours: 119,
    productionTarget: 11000,
    productionMade: 9700,
    supplierName: 'Bulza',
    cogs: { tazaki: 424, sysco: 424, bulza: 425, sticker: 424, others: 424 }
  },
  {
    day: 'Thu',
    date: '2026-06-11',
    sales: 11800,
    waste: 1050.0,
    hours: 121,
    productionTarget: 11000,
    productionMade: 10500,
    supplierName: 'Sticker',
    cogs: { tazaki: 495, sysco: 495, bulza: 495, sticker: 498, others: 495 }
  },
  {
    day: 'Fri',
    date: '2026-06-12',
    sales: 13000,
    waste: 1080.0,
    hours: 124,
    productionTarget: 11000,
    productionMade: 10800,
    supplierName: 'Others',
    cogs: { tazaki: 546, sysco: 546, bulza: 546, sticker: 546, others: 546 }
  },
  {
    day: 'Sat',
    date: '2026-06-13',
    sales: 13505,
    waste: 1090.0,
    hours: 127,
    productionTarget: 11000,
    productionMade: 10900,
    supplierName: 'Tazaki',
    cogs: { tazaki: 568, sysco: 567, bulza: 567, sticker: 567, others: 567 }
  },
  {
    day: 'Sun',
    date: '2026-06-14',
    sales: 14100,
    waste: 1075.0,
    hours: 125,
    productionTarget: 11000,
    productionMade: 10750,
    supplierName: 'Others',
    cogs: { tazaki: 592, sysco: 592, bulza: 592, sticker: 592, others: 593 }
  }
  ],
};
