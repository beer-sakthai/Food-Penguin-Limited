import {
  BranchOperationalWeekMap,
  CoreMetrics,
  SalesOrder,
  CompanyTarget,
  Recipe,
  ProductionTask,
  WasteRecord,
  EmployeeHour,
  InventoryItem,
  RealtimeAlert,
  DailyOperationalLog,
  OperationalDay,
  SupplierName
} from './types';

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
  { id: 'FP-1084', timestamp: '14:10', item: 'Luxury Salmon & Caviar Platter', category: 'Sashimi & Platters', quantity: 2, amount: 69.00, barcode: '5391548895018', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1083', timestamp: '13:58', item: 'Gastropub Spicy Truffle Roll', category: 'Specialty Rolls', quantity: 1, amount: 19.95, barcode: '5391548895025', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1081', timestamp: '13:45', item: 'Handcrafted Premium Dragon Roll', category: 'Sushi Rolls', quantity: 3, amount: 52.50, barcode: '5391548895049', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1079', timestamp: '13:12', item: 'Luxury Salmon & Caviar Platter', category: 'Sashimi & Platters', quantity: 1, amount: 34.50, barcode: '5391548895018', status: 'Completed', branch: 'Marks & Spencer - Cork City' },

  // Tesco - Cork City (Everyday Value & Finest Selection)
  { id: 'FP-2081', timestamp: '13:51', item: 'salmon sashimi', category: 'Sashimi Selections', quantity: 1, amount: 7.75, barcode: '5391548890068', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-2080', timestamp: '13:30', item: 'spicy veggie roll', category: 'Sushi Rolls', quantity: 2, amount: 11.00, barcode: '5391548890266', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-2078', timestamp: '12:45', item: 'veggie tofu yakisoba noodles', category: 'Noodles & Sides', quantity: 2, amount: 15.90, barcode: '5391548890679', status: 'Completed', branch: 'Tesco - Cork City' },

  // Tesco - Mahon Point (Everyday Value, Meals, & Local Mahon Special)
  { id: 'FP-3081', timestamp: '13:55', item: 'spicy veggie roll', category: 'Sushi Rolls', quantity: 1, amount: 5.50, barcode: '5391548890266', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-3080', timestamp: '13:20', item: 'TokYO! party platter', category: 'Party Platters', quantity: 1, amount: 16.75, barcode: '5391548890549', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-3078', timestamp: '12:30', item: 'veggie tofu yakisoba noodles', category: 'Noodles & Sides', quantity: 3, amount: 23.85, barcode: '5391548890679', status: 'Completed', branch: 'Tesco - Mahon Point' }
];

export const initialTargets: CompanyTarget[] = [
  { id: 'T-1', name: 'Sushi Revenue Target', metric: 'Total Sales (€)', targetValue: 15000, currentValue: 14820, unit: '€', category: 'Sell', deadline: 'Today, 22:00' },
  { id: 'T-2', name: 'Sushi Rolls Made', metric: 'Items Rolled', targetValue: 11500, currentValue: 11240, unit: 'units', category: 'Production', deadline: 'Today, 21:05' },
  { id: 'T-3', name: 'Daily Waste Minimizer', metric: 'Food Waste Cost', targetValue: 500, currentValue: 412.50, unit: '€', category: 'Waste', deadline: 'Today, 22:00' },
  { id: 'T-4', name: 'Hourly Roster Precision', metric: 'Overtime Margin', targetValue: 2, currentValue: 0, unit: 'hrs', category: 'Hours', deadline: 'End of Shift' },
  { id: 'T-5', name: 'Weekly Organic Reach', metric: 'Social Promos Run', targetValue: 10, currentValue: 8, unit: 'times', category: 'Sell', deadline: 'Sunday, 18:00' }
];

export const initialRecipes: Recipe[] = [
  { id: 'R-1', name: 'Tokyo Dragon Roll', category: 'Sushi Rolls', status: 'active', prepTime: 8, ingredients: ['Eel Fish', 'Shrimp Tempura', 'Fresh Avocado', 'Cucumber strip', 'Sweet Eel Glaze', 'Nori Seaweed'], allergens: ['Fish', 'Gluten', 'Sulphites'] },
  { id: 'R-2', name: 'Kyoto Salmon Sashimi Platter', category: 'Sashimi & Platters', status: 'active', prepTime: 12, ingredients: ['Atlantic Salmon Fillet', 'White Daikon Radish ruff', 'Fresh Shiso leaves', 'Artisanal Wasabi paste', 'Soy Sauce'], allergens: ['Fish', 'Soya', 'Gluten'] },
  { id: 'R-3', name: 'Spicy Bluefin Tuna Roll', category: 'Sushi Rolls', status: 'active', prepTime: 4, ingredients: ['Spicy Minced Tuna', 'Crispy Cucumber', 'Kyoto Spicy Mayo', 'Toasted Sesame seeds', 'Sushi Grains'], allergens: ['Fish', 'Eggs', 'Sesame'] },
  { id: 'R-4', name: 'California Roll Classic', category: 'Sushi Rolls', status: 'active', prepTime: 15, ingredients: ['Snow Crab Stick', 'Avocado slice', 'Fresh Cucumber', 'Premium Sushi Rice', 'Nori Sheets'], allergens: ['Crustaceans', 'Gluten'] },
  { id: 'R-5', name: 'Volcano Baked Scallop Roll', category: 'Specialty Rolls', status: 'active', prepTime: 6, ingredients: ['Spicy Crab Mix', 'Chopped Sea Scallops', 'Creamy Spicy Mayo', 'Sweet Soy Reduction', 'Masago Fish Roe'], allergens: ['Molluscs', 'Eggs', 'Fish', 'Soya'] }
];

export const initialTasks: ProductionTask[] = [
  { id: 'PT-301', itemName: 'Tokyo Dragon Roll', assignedTo: 'Chef Skipper', status: 'Cooking', quantity: 2, priority: 'high' },
  { id: 'PT-302', itemName: 'Kyoto Salmon Sashimi Platter', assignedTo: 'Chef Private', status: 'Cooking', quantity: 1, priority: 'medium' },
  { id: 'PT-303', itemName: 'Spicy Bluefin Tuna Roll', assignedTo: 'Kitchen Aide Rico', status: 'In Queue', quantity: 1, priority: 'low' },
  { id: 'PT-304', itemName: 'California Roll Classic', assignedTo: 'Chef Kowalski', status: 'Prepared', quantity: 3, priority: 'high' }
];

export const initialWaste: WasteRecord[] = [
  { id: 'W-901', item: 'Spilled Sushi Rice Vinegar', category: 'Condiments', weight: 4.5, cost: 35.00, reason: 'Spill/Accident', date: '2026-06-19' },
  { id: 'W-902', item: 'Overproduced California Rolls', category: 'Sushi Rolls', weight: 12.0, cost: 48.00, reason: 'Overproduced', date: '2026-06-19' },
  { id: 'W-903', item: 'Expired Tuna Loin Trimmings', category: 'Seafood', weight: 3.2, cost: 74.50, reason: 'Expired', date: '2026-06-19' },
  { id: 'W-904', item: 'Damaged Nori Seaweed Sheets', category: 'Wrapping', weight: 6.0, cost: 24.00, reason: 'Quality Issue', date: '2026-06-19' },
  { id: 'W-905', item: 'Soggy Cucumber Strips', category: 'Produce', weight: 5.0, cost: 15.00, reason: 'Expired', date: '2026-06-18' }
];

export const initialHours: EmployeeHour[] = [
  { id: 'E-01', name: 'Chef Skipper (Lead)', role: 'Head Sushi Chef', status: 'Clocked In', scheduledHours: 40, actualHours: 36.5, shiftStart: '08:00', shiftEnd: '17:00' },
  { id: 'E-02', name: 'Chef Kowalski', role: 'Sushi Master / Kitchen Analyst', status: 'Clocked In', scheduledHours: 40, actualHours: 35.0, shiftStart: '09:00', shiftEnd: '18:00' },
  { id: 'E-03', name: 'Chef Private', role: 'Sushi Roll Prep', status: 'Clocked In', scheduledHours: 35, actualHours: 31.0, shiftStart: '10:00', shiftEnd: '18:00' },
  { id: 'E-04', name: 'Kitchen Aide Rico', role: 'Prep & Rice Cooker', status: 'Clocked In', scheduledHours: 30, actualHours: 28.5, shiftStart: '11:00', shiftEnd: '19:00' },
  { id: 'E-05', name: 'Alice Smith', role: 'Sushi Counter Manager', status: 'Clocked Out', scheduledHours: 32, actualHours: 32.0, shiftStart: '08:00', shiftEnd: '16:00' },
  { id: 'E-06', name: 'Bob Johnson', role: 'Cold Logistics Lead', status: 'Clocked Out', scheduledHours: 30, actualHours: 24.0, shiftStart: '12:00', shiftEnd: '20:00' }
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
  { id: 'A-01', timestamp: '14:12:30', sensor: 'Cold Room Freezy-01', value: '-19.4°C', status: 'normal', message: 'Temperature remains stable at threshold.' },
  { id: 'A-02', timestamp: '14:08:15', sensor: 'Sushi Rice Warm Unit A', value: '57.0°C', status: 'normal', message: 'Optimal preservation raw rice temperature verified.' },
  { id: 'A-03', timestamp: '13:55:00', sensor: 'Seafood Deep Freezer', value: '-12.1°C', status: 'warning', message: 'Slight thermal climb detected during door cycle.' },
  { id: 'A-04', timestamp: '13:10:45', sensor: 'Dishwasher Rinse Tank', value: '82.5°C', status: 'normal', message: 'Sanitation high-temp rinse verified.' }
];

export const initialWeeklyLogs: DailyOperationalLog[] = [
  {
    day: 'Mon',
    date: '2026-06-15',
    sales: 10450,
    waste: 520,
    hours: 110,
    productionTarget: 11500,
    productionMade: 9800,
    supplierName: 'Tazaki',
    cogs: {
      tazaki: 3500,
      sysco: 1200,
      bulza: 600,
      sticker: 120,
      others: 200
    }
  },
  {
    day: 'Tue',
    date: '2026-06-16',
    sales: 11200,
    waste: 480,
    hours: 115,
    productionTarget: 11500,
    productionMade: 10200,
    supplierName: 'Sysco',
    cogs: {
      tazaki: 3600,
      sysco: 1100,
      bulza: 550,
      sticker: 100,
      others: 250
    }
  },
  {
    day: 'Wed',
    date: '2026-06-17',
    sales: 10800,
    waste: 460,
    hours: 118,
    productionTarget: 11500,
    productionMade: 10100,
    supplierName: 'Bulza',
    cogs: {
      tazaki: 3450,
      sysco: 1300,
      bulza: 620,
      sticker: 150,
      others: 180
    }
  },
  {
    day: 'Thu',
    date: '2026-06-18',
    sales: 12500,
    waste: 410,
    hours: 120,
    productionTarget: 11500,
    productionMade: 11100,
    supplierName: 'Sticker',
    cogs: {
      tazaki: 4100,
      sysco: 1250,
      bulza: 700,
      sticker: 180,
      others: 210
    }
  },
  {
    day: 'Fri',
    date: '2026-06-19',
    sales: 13800,
    waste: 390,
    hours: 122,
    productionTarget: 11500,
    productionMade: 11300,
    supplierName: 'Others',
    cogs: {
      tazaki: 4500,
      sysco: 1150,
      bulza: 750,
      sticker: 200,
      others: 330
    }
  },
  {
    day: 'Sat',
    date: '2026-06-20',
    sales: 14200,
    waste: 405,
    hours: 125,
    productionTarget: 11500,
    productionMade: 11400,
    supplierName: 'Tazaki',
    cogs: {
      tazaki: 4700,
      sysco: 1100,
      bulza: 800,
      sticker: 220,
      others: 350
    }
  },
  {
    day: 'Sun',
    date: '2026-06-21',
    sales: 14820,
    waste: 412.50,
    hours: 124,
    productionTarget: 11500,
    productionMade: 11240,
    supplierName: 'Others',
    cogs: {
      tazaki: 4890,
      sysco: 1100,
      bulza: 820,
      sticker: 240,
      others: 380
    }
  }
];

export const alternativeWeeklyLogsMap: Record<string, DailyOperationalLog[]> = {
  '2026-06-15 to 2026-06-21': initialWeeklyLogs,
  '2026-06-22 to 2026-06-28': [
    {
      day: 'Mon',
      date: '2026-06-22',
      sales: 11000,
      waste: 500,
      hours: 108,
      productionTarget: 11500,
      productionMade: 9900,
      supplierName: 'Tazaki',
      cogs: { tazaki: 3600, sysco: 1150, bulza: 580, sticker: 110, others: 190 }
    },
    {
      day: 'Tue',
      date: '2026-06-23',
      sales: 11500,
      waste: 470,
      hours: 114,
      productionTarget: 11500,
      productionMade: 10400,
      supplierName: 'Sysco',
      cogs: { tazaki: 3700, sysco: 1200, bulza: 530, sticker: 110, others: 240 }
    },
    {
      day: 'Wed',
      date: '2026-06-24',
      sales: 11200,
      waste: 450,
      hours: 116,
      productionTarget: 11500,
      productionMade: 10300,
      supplierName: 'Bulza',
      cogs: { tazaki: 3500, sysco: 1250, bulza: 610, sticker: 140, others: 200 }
    },
    {
      day: 'Thu',
      date: '2026-06-25',
      sales: 12100,
      waste: 430,
      hours: 118,
      productionTarget: 11500,
      productionMade: 10900,
      supplierName: 'Sticker',
      cogs: { tazaki: 4000, sysco: 1200, bulza: 680, sticker: 170, others: 220 }
    },
    {
      day: 'Fri',
      date: '2026-06-26',
      sales: 14000,
      waste: 380,
      hours: 120,
      productionTarget: 11500,
      productionMade: 11500,
      supplierName: 'Others',
      cogs: { tazaki: 4600, sysco: 1100, bulza: 720, sticker: 190, others: 310 }
    },
    {
      day: 'Sat',
      date: '2026-06-27',
      sales: 14500,
      waste: 395,
      hours: 122,
      productionTarget: 11500,
      productionMade: 11600,
      supplierName: 'Tazaki',
      cogs: { tazaki: 4800, sysco: 1150, bulza: 780, sticker: 210, others: 340 }
    },
    {
      day: 'Sun',
      date: '2026-06-28',
      sales: 15200,
      waste: 400,
      hours: 126,
      productionTarget: 11500,
      productionMade: 11800,
      supplierName: 'Others',
      cogs: { tazaki: 5000, sysco: 1050, bulza: 800, sticker: 230, others: 360 }
    }
  ],
  '2026-06-08 to 2026-06-14': [
    {
      day: 'Mon',
      date: '2026-06-08',
      sales: 9800,
      waste: 550,
      hours: 112,
      productionTarget: 11000,
      productionMade: 9400,
      supplierName: 'Tazaki',
      cogs: { tazaki: 3300, sysco: 1250, bulza: 620, sticker: 130, others: 210 }
    },
    {
      day: 'Tue',
      date: '2026-06-09',
      sales: 10500,
      waste: 510,
      hours: 116,
      productionTarget: 11000,
      productionMade: 9800,
      supplierName: 'Sysco',
      cogs: { tazaki: 3400, sysco: 1150, bulza: 570, sticker: 120, others: 260 }
    },
    {
      day: 'Wed',
      date: '2026-06-10',
      sales: 10100,
      waste: 490,
      hours: 119,
      productionTarget: 11000,
      productionMade: 9700,
      supplierName: 'Bulza',
      cogs: { tazaki: 3350, sysco: 1350, bulza: 640, sticker: 160, others: 190 }
    },
    {
      day: 'Thu',
      date: '2026-06-11',
      sales: 11800,
      waste: 440,
      hours: 121,
      productionTarget: 11000,
      productionMade: 10500,
      supplierName: 'Sticker',
      cogs: { tazaki: 3900, sysco: 1300, bulza: 720, sticker: 190, others: 230 }
    },
    {
      day: 'Fri',
      date: '2026-06-12',
      sales: 13000,
      waste: 410,
      hours: 124,
      productionTarget: 11000,
      productionMade: 10800,
      supplierName: 'Others',
      cogs: { tazaki: 4300, sysco: 1200, bulza: 770, sticker: 210, others: 350 }
    },
    {
      day: 'Sat',
      date: '2026-06-13',
      sales: 13505,
      waste: 420,
      hours: 127,
      productionTarget: 11000,
      productionMade: 10900,
      supplierName: 'Tazaki',
      cogs: { tazaki: 4500, sysco: 1150, bulza: 820, sticker: 230, others: 370 }
    },
    {
      day: 'Sun',
      date: '2026-06-14',
      sales: 14100,
      waste: 425,
      hours: 125,
      productionTarget: 11000,
      productionMade: 10750,
      supplierName: 'Others',
      cogs: { tazaki: 4650, sysco: 1150, bulza: 840, sticker: 250, others: 390 }
    }
  ]
};

export const WEEK_RANGE_OPTIONS = [
  '2026-06-15 to 2026-06-21',
  '2026-06-22 to 2026-06-28',
  '2026-06-08 to 2026-06-14',
] as const;

export const DEFAULT_WEEK_RANGE = WEEK_RANGE_OPTIONS[0];

const BRANCH_SPLIT_PROFILES: Record<string, {
  shortLabel: string;
  salesWeights: number[];
  productionWeights: number[];
  targetWeights: number[];
  wasteWeights: number[];
  hoursWeights: number[];
  cogsWeights: number[];
  supplierCycle: SupplierName[];
}> = {
  'Marks & Spencer - Cork City': {
    shortLabel: 'M&S Cork',
    salesWeights: [0.44, 0.43, 0.42, 0.43, 0.44, 0.45, 0.44],
    productionWeights: [0.39, 0.39, 0.38, 0.39, 0.40, 0.40, 0.39],
    targetWeights: [0.39, 0.39, 0.39, 0.39, 0.40, 0.40, 0.39],
    wasteWeights: [0.27, 0.26, 0.25, 0.25, 0.26, 0.26, 0.27],
    hoursWeights: [0.35, 0.35, 0.34, 0.34, 0.35, 0.35, 0.34],
    cogsWeights: [0.42, 0.41, 0.41, 0.42, 0.42, 0.43, 0.42],
    supplierCycle: ['Tazaki', 'Tazaki', 'Sysco', 'Tazaki', 'Tazaki', 'Tazaki', 'Others'],
  },
  'Tesco - Cork City': {
    shortLabel: 'Tesco Cork',
    salesWeights: [0.32, 0.33, 0.34, 0.33, 0.33, 0.32, 0.33],
    productionWeights: [0.36, 0.36, 0.37, 0.36, 0.35, 0.35, 0.36],
    targetWeights: [0.36, 0.36, 0.36, 0.36, 0.35, 0.35, 0.36],
    wasteWeights: [0.36, 0.36, 0.37, 0.37, 0.36, 0.36, 0.36],
    hoursWeights: [0.35, 0.35, 0.36, 0.35, 0.35, 0.35, 0.35],
    cogsWeights: [0.34, 0.34, 0.35, 0.34, 0.34, 0.33, 0.34],
    supplierCycle: ['Sysco', 'Sysco', 'Bulza', 'Sysco', 'Others', 'Sysco', 'Others'],
  },
  'Tesco - Mahon Point': {
    shortLabel: 'Tesco Mahon',
    salesWeights: [0.24, 0.24, 0.24, 0.24, 0.23, 0.23, 0.23],
    productionWeights: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25],
    targetWeights: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25],
    wasteWeights: [0.37, 0.38, 0.38, 0.38, 0.38, 0.38, 0.37],
    hoursWeights: [0.30, 0.30, 0.30, 0.31, 0.30, 0.30, 0.31],
    cogsWeights: [0.24, 0.25, 0.24, 0.24, 0.24, 0.24, 0.24],
    supplierCycle: ['Others', 'Bulza', 'Others', 'Sticker', 'Others', 'Tazaki', 'Others'],
  },
};

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function scaleCogs(log: DailyOperationalLog, weight: number) {
  return {
    tazaki: roundMoney(log.cogs.tazaki * weight),
    sysco: roundMoney(log.cogs.sysco * weight),
    bulza: roundMoney(log.cogs.bulza * weight),
    sticker: roundMoney(log.cogs.sticker * weight),
    others: roundMoney(log.cogs.others * weight),
  };
}

function buildBranchWeekLogs(baseWeekLogs: DailyOperationalLog[], branch: keyof typeof BRANCH_SPLIT_PROFILES): DailyOperationalLog[] {
  const profile = BRANCH_SPLIT_PROFILES[branch];

  return baseWeekLogs.map((log, index) => ({
    day: log.day,
    date: log.date,
    sales: Math.round(log.sales * profile.salesWeights[index]),
    waste: roundMoney(log.waste * profile.wasteWeights[index]),
    hours: roundMoney(log.hours * profile.hoursWeights[index]),
    productionTarget: Math.round(log.productionTarget * profile.targetWeights[index]),
    productionMade: Math.round(log.productionMade * profile.productionWeights[index]),
    supplierName: profile.supplierCycle[index] || log.supplierName,
    cogs: scaleCogs(log, profile.cogsWeights[index]),
  }));
}

export const branchWeeklyLogsMap: BranchOperationalWeekMap = Object.fromEntries(
  WEEK_RANGE_OPTIONS.map((range) => {
    const baseLogs = alternativeWeeklyLogsMap[range];
    return [
      range,
      Object.fromEntries(
        Object.keys(BRANCH_SPLIT_PROFILES).map((branch) => [
          branch,
          buildBranchWeekLogs(baseLogs, branch as keyof typeof BRANCH_SPLIT_PROFILES),
        ]),
      ),
    ];
  }),
);

export function buildCoreMetricsFromLog(log: DailyOperationalLog): CoreMetrics {
  return {
    salesToday: log.sales,
    salesGrowth: 12.4,
    productionItems: log.productionMade,
    productionTarget: log.productionTarget,
    wasteCost: log.waste,
    wasteReduction: 18.2,
    hoursScheduled: log.hours,
    overtimeHours: 0,
    aiHealthScore: Math.round(
      Math.min(
        100,
        Math.max(50, 90 + (log.productionMade / (log.productionTarget || 1)) * 10 - (log.waste / (log.sales || 1)) * 50),
      ),
    ),
  };
}

export function aggregateDailyLogs(logsByBranch: Record<string, DailyOperationalLog[]>, day: OperationalDay): DailyOperationalLog {
  const branchLogs = Object.values(logsByBranch)
    .map((logs) => logs.find((log) => log.day === day))
    .filter((log): log is DailyOperationalLog => Boolean(log));

  const firstLog = branchLogs[0];
  const totalCogs = branchLogs.reduce(
    (acc, log) => ({
      tazaki: acc.tazaki + log.cogs.tazaki,
      sysco: acc.sysco + log.cogs.sysco,
      bulza: acc.bulza + log.cogs.bulza,
      sticker: acc.sticker + log.cogs.sticker,
      others: acc.others + log.cogs.others,
    }),
    { tazaki: 0, sysco: 0, bulza: 0, sticker: 0, others: 0 },
  );

  return {
    day,
    date: firstLog?.date || '',
    sales: Math.round(branchLogs.reduce((sum, log) => sum + log.sales, 0)),
    waste: roundMoney(branchLogs.reduce((sum, log) => sum + log.waste, 0)),
    hours: roundMoney(branchLogs.reduce((sum, log) => sum + log.hours, 0)),
    productionTarget: Math.round(branchLogs.reduce((sum, log) => sum + log.productionTarget, 0)),
    productionMade: Math.round(branchLogs.reduce((sum, log) => sum + log.productionMade, 0)),
    supplierName: firstLog?.supplierName || 'Others',
    cogs: {
      tazaki: roundMoney(totalCogs.tazaki),
      sysco: roundMoney(totalCogs.sysco),
      bulza: roundMoney(totalCogs.bulza),
      sticker: roundMoney(totalCogs.sticker),
      others: roundMoney(totalCogs.others),
    },
  };
}
