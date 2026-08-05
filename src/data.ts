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
  TESCO_PRODUCTS,
  MS_PRODUCTS,
} from './business';

export { TESCO_PRODUCTS, MS_PRODUCTS };

export const initialMetrics: CoreMetrics = {
  salesToday: 7500,
  salesGrowth: 8.2,
  cogsToday: 2250,
  productionItems: 2200,
  productionTarget: 2500,
  wasteCost: 157.50,
  wasteReduction: 4.5,
  hoursScheduled: 84,
  overtimeHours: 0,
  aiHealthScore: 92
};

export const initialOrders: SalesOrder[] = [
  { id: 'FP-1000', timestamp: '12:10', date: '2026-06-08', item: 'Spicy salmon & avocado roll', category: 'Sushi Specials', quantity: 1, amount: 7.25, barcode: '5391548890372', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-1021', timestamp: '15:31', date: '2026-06-08', item: 'Nigiri selection', category: 'Sushi Specials', quantity: 1, amount: 6.95, barcode: '5391548890044', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-1001', timestamp: '13:11', date: '2026-06-09', item: 'Plant power', category: 'Sushi Specials', quantity: 1, amount: 8.50, barcode: '5391548890471', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-1022', timestamp: '16:32', date: '2026-06-09', item: 'Chicken teriyaki Poke', category: 'Noodles & Sides', quantity: 2, amount: 16.50, barcode: '5391548892635', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-1002', timestamp: '14:12', date: '2026-06-10', item: 'Green Scene', category: 'Sushi Specials', quantity: 1, amount: 8.95, barcode: '5055372900699', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1023', timestamp: '17:33', date: '2026-06-10', item: 'Crunchy Fiesta Chicken Feast', category: 'Sashimi & Platters', quantity: 2, amount: 39.90, barcode: '5391548892918', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1003', timestamp: '15:13', date: '2026-06-11', item: 'Spicy salmon avocado sushi sando', category: 'Sushi Specials', quantity: 3, amount: 14.85, barcode: '5391548892512', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-1024', timestamp: '12:34', date: '2026-06-11', item: 'St Patrick\'s Irish stout karaage', category: 'Sushi Specials', quantity: 2, amount: 15.50, barcode: '5391548892611', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-1004', timestamp: '16:14', date: '2026-06-12', item: 'Strawberry cheesecake mochi', category: 'Sushi Specials', quantity: 2, amount: 7.90, barcode: '5391548890754', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-1025', timestamp: '13:35', date: '2026-06-12', item: 'Mexican Mango Salmon Sharer', category: 'Sashimi & Platters', quantity: 3, amount: 59.25, barcode: '5391548892789', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-1005', timestamp: '17:15', date: '2026-06-13', item: 'Salmon Lovers', category: 'Sushi Specials', quantity: 1, amount: 10.25, barcode: '5055372900668', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1026', timestamp: '14:36', date: '2026-06-13', item: 'Veggie Gyoza', category: 'Noodles & Sides', quantity: 1, amount: 6.25, barcode: '5055372901145', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1006', timestamp: '12:16', date: '2026-06-14', item: 'TokYO! party platter', category: 'Sushi Specials', quantity: 1, amount: 16.75, barcode: '5391548890549', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-1027', timestamp: '15:37', date: '2026-06-14', item: 'Salmon dragon roll', category: 'Sushi Specials', quantity: 3, amount: 26.25, barcode: '5391548890181', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-1007', timestamp: '13:17', date: '2026-06-15', item: 'Saikou! selects', category: 'Sushi Specials', quantity: 1, amount: 9.75, barcode: '5391548890518', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-1028', timestamp: '16:38', date: '2026-06-15', item: 'Sweet chilli chicken yakitori', category: 'Sushi Specials', quantity: 1, amount: 5.50, barcode: '5391548890136', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-1008', timestamp: '14:18', date: '2026-06-16', item: 'Sláinte Roll', category: 'Sushi Rolls', quantity: 2, amount: 15.50, barcode: '5055372900903', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1029', timestamp: '17:39', date: '2026-06-16', item: 'Inari Pocket', category: 'Sushi Specials', quantity: 1, amount: 4.95, barcode: '5055372901450', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1009', timestamp: '15:19', date: '2026-06-17', item: 'TokYO! party platter', category: 'Sushi Specials', quantity: 2, amount: 33.50, barcode: '5391548890549', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-1010', timestamp: '16:20', date: '2026-06-18', item: 'Salmon sashimi', category: 'Sushi Specials', quantity: 3, amount: 23.25, barcode: '5391548890068', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-1011', timestamp: '17:21', date: '2026-06-19', item: 'Spicy Salmon Gunkan', category: 'Sushi Specials', quantity: 2, amount: 10.50, barcode: '5391548892321', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1012', timestamp: '12:22', date: '2026-06-20', item: 'Sakana selects', category: 'Sushi Specials', quantity: 2, amount: 19.50, barcode: '5391548890501', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-1013', timestamp: '13:23', date: '2026-06-21', item: 'Plant power', category: 'Sushi Specials', quantity: 1, amount: 8.50, barcode: '5391548890471', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-1014', timestamp: '14:24', date: '2026-06-22', item: 'Dynamite Crunch Roll', category: 'Sushi Rolls', quantity: 3, amount: 26.25, barcode: '5055372900611', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1015', timestamp: '15:25', date: '2026-06-23', item: 'Chicken teriyaki roll', category: 'Sushi Specials', quantity: 1, amount: 6.50, barcode: '5391548890204', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-1016', timestamp: '16:26', date: '2026-06-24', item: 'Plant power', category: 'Sushi Specials', quantity: 1, amount: 8.50, barcode: '5391548890471', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-1017', timestamp: '17:27', date: '2026-06-25', item: 'Ginza Group', category: 'Sashimi & Platters', quantity: 1, amount: 8.25, barcode: '5391548892177', status: 'Completed', branch: 'Marks & Spencer - Cork City' },
  { id: 'FP-1018', timestamp: '12:28', date: '2026-06-26', item: 'Spicy salmon avocado sushi sando', category: 'Sushi Specials', quantity: 1, amount: 4.95, barcode: '5391548892512', status: 'Completed', branch: 'Tesco - Cork City' },
  { id: 'FP-1019', timestamp: '13:29', date: '2026-06-27', item: 'Crunchy salmon & avocado roll', category: 'Sushi Specials', quantity: 1, amount: 7.50, barcode: '5391548890389', status: 'Completed', branch: 'Tesco - Mahon Point' },
  { id: 'FP-1020', timestamp: '14:30', date: '2026-06-28', item: 'Sakura Spring Selection', category: 'Sashimi & Platters', quantity: 1, amount: 23.95, barcode: '5391548892703', status: 'Completed', branch: 'Marks & Spencer - Cork City' }
];

export const initialTargets: CompanyTarget[] = [
  { id: 'T-1', name: 'Daily Revenue Target', metric: 'Total Sales (€)', targetValue: 8000, currentValue: 7500, unit: '€', category: 'Sell', deadline: 'Today, 22:00', date: '2026-06-28' },
  { id: 'T-2', name: 'Daily Production Target', metric: 'Items Made', targetValue: 2500, currentValue: 2200, unit: 'units', category: 'Production', deadline: 'Today, 21:05', date: '2026-06-28' },
  { id: 'T-3', name: 'Waste vs Production', metric: 'Waste Cost', targetValue: WASTE_TARGET_PCT, currentValue: 10.0, unit: '%', category: 'Waste', deadline: 'Today, 22:00', date: '2026-06-28' },
  { id: 'T-4', name: 'COGS Target', metric: 'COGS vs Net Sales', targetValue: COGS_TARGET_PCT, currentValue: 30.0, unit: '%', category: 'Finance', deadline: 'End of Month', date: '2026-06-28' },
  { id: 'T-5', name: 'Retailer Commission', metric: 'Commission vs Gross', targetValue: COMMISSION_TARGET_PCT, currentValue: COMMISSION_TARGET_PCT, unit: '%', category: 'Finance', deadline: 'Every Sale', date: '2026-06-28' }
];

export const initialRecipes: Recipe[] = [
  { id: 'R-1', name: 'Salmon Dragon Roll', category: 'Sushi Rolls', status: 'active', prepTime: 5, ingredients: ['Salmon', 'Avocado', 'Sushi rice', 'Nori', 'Sesame seeds'], allergens: ['Fish', 'Sesame'] },
  { id: 'R-2', name: 'California Roll', category: 'Sushi Rolls', status: 'active', prepTime: 7, ingredients: ['Surimi sticks', 'Avocado', 'Cucumber', 'Sushi rice', 'Nori'], allergens: ['Crustaceans'] },
  { id: 'R-3', name: 'Spicy Salmon Avocado Roll', category: 'Sushi Rolls', status: 'active', prepTime: 5, ingredients: ['Salmon', 'Spicy mayo', 'Avocado', 'Sushi rice', 'Nori'], allergens: ['Fish', 'Eggs', 'Sesame'] },
  { id: 'R-4', name: 'Chicken Katsu Curry', category: 'Hot Meals', status: 'active', prepTime: 10, ingredients: ['Chicken katsu', 'Curry sauce', 'Steamed rice'], allergens: ['Gluten'] },
  { id: 'R-5', name: 'Chicken Teriyaki Udon Noodles', category: 'Noodles', status: 'active', prepTime: 8, ingredients: ['Udon noodles', 'Teriyaki chicken', 'Soy sauce', 'Sesame oil'], allergens: ['Gluten', 'Soya', 'Sesame'] },
  { id: 'R-6', name: 'Salmon Poke', category: 'Poke Bowls', status: 'active', prepTime: 11, ingredients: ['Salmon', 'Sushi rice', 'Edamame', 'Seaweed salad', 'Sriracha mayo'], allergens: ['Fish', 'Soya', 'Sesame'] },
  { id: 'R-7', name: 'Pumpkin Katsu Curry', category: 'Hot Meals', status: 'active', prepTime: 14, ingredients: ['Pumpkin katsu', 'Curry sauce', 'Steamed rice'], allergens: ['Gluten'] },
  { id: 'R-8', name: 'Salmon Sashimi', category: 'Sashimi', status: 'active', prepTime: 9, ingredients: ['Salmon', 'Soy sauce sachet', 'Wasabi sachet', 'Ginger sachet'], allergens: ['Fish', 'Soya'] },
  { id: 'R-9', name: 'Veggie Gyoza', category: 'Sides', status: 'active', prepTime: 6, ingredients: ['Veggie gyoza', 'Soy sauce sachet'], allergens: ['Gluten', 'Soya'] },
  { id: 'R-10', name: 'Chocolate Ganache Mochi', category: 'Dessert', status: 'active', prepTime: 9, ingredients: ['Mochi'], allergens: ['None declared'] }
];

export const initialTasks: ProductionTask[] = [
  { id: 'PT-301', itemName: 'Salmon Dragon Roll', assignedTo: 'A. Chen', status: 'Cooking', quantity: 24, priority: 'high', date: '2026-06-28' },
  { id: 'PT-302', itemName: 'California Roll', assignedTo: 'M. OBrien', status: 'Cooking', quantity: 18, priority: 'medium', date: '2026-06-27' },
  { id: 'PT-303', itemName: 'Chicken Teriyaki Udon Noodles', assignedTo: 'L. Nguyen', status: 'In Queue', quantity: 12, priority: 'low', date: '2026-06-28' },
  { id: 'PT-304', itemName: 'Spicy Salmon Avocado Roll', assignedTo: 'A. Chen', status: 'Prepared', quantity: 20, priority: 'high', date: '2026-06-27' }
];

export const initialWaste: WasteRecord[] = [
  { id: 'W-901', item: 'Spilled sushi rice vinegar', category: 'Condiments', weight: 1.2, cost: 14.80, reason: 'Spill/Accident', date: '2026-06-27' },
  { id: 'W-902', item: 'Overproduced California rolls', category: 'Sushi Rolls', weight: 4.5, cost: 38.20, reason: 'Overproduced', date: '2026-06-27' },
  { id: 'W-903', item: 'Expired tuna loin trimmings', category: 'Seafood', weight: 1.1, cost: 58.60, reason: 'Expired', date: '2026-06-26' },
  { id: 'W-904', item: 'Damaged nori seaweed sheets', category: 'Wrapping', weight: 1.0, cost: 53.30, reason: 'Quality Issue', date: '2026-06-25' },
  { id: 'W-905', item: 'Soggy cucumber strips', category: 'Produce', weight: 1.5, cost: 28.50, reason: 'Expired', date: '2026-06-24' },
  { id: 'W-906', item: 'Discarded spicy mayo batch', category: 'Condiments', weight: 0.8, cost: 42.80, reason: 'Quality Issue', date: '2026-06-27' },
  { id: 'W-907', item: 'Expired avocado halves', category: 'Produce', weight: 2.0, cost: 36.70, reason: 'Expired', date: '2026-06-26' },
  { id: 'W-908', item: 'Broken salmon skin trim', category: 'Seafood', weight: 0.7, cost: 31.00, reason: 'Spill/Accident', date: '2026-06-25' },
  { id: 'W-909', item: 'Stale cooked rice', category: 'Grains', weight: 3.5, cost: 35.60, reason: 'Overproduced', date: '2026-06-24' },
  { id: 'W-910', item: 'Wilted nori sheets', category: 'Wrapping', weight: 0.6, cost: 25.20, reason: 'Quality Issue', date: '2026-06-24' }
];

export const initialHours: EmployeeHour[] = [
  { id: 'E-01', name: 'A. Chen', role: 'Head Sushi Chef', status: 'Clocked In', scheduledHours: 40, actualHours: 36.5, shiftStart: '08:00', shiftEnd: '17:00', date: '2026-06-28' },
  { id: 'E-02', name: 'M. O\'Brien', role: 'Sushi Chef', status: 'Clocked In', scheduledHours: 40, actualHours: 35.0, shiftStart: '08:00', shiftEnd: '17:00', date: '2026-06-28' },
  { id: 'E-03', name: 'L. Nguyen', role: 'Prep Cook', status: 'Clocked In', scheduledHours: 35, actualHours: 31.0, shiftStart: '08:00', shiftEnd: '17:00', date: '2026-06-28' },
  { id: 'E-04', name: 'S. Kelly', role: 'Kitchen Assistant', status: 'Clocked In', scheduledHours: 30, actualHours: 28.5, shiftStart: '08:00', shiftEnd: '17:00', date: '2026-06-28' },
  { id: 'E-05', name: 'R. Murphy', role: 'Counter Manager', status: 'Clocked In', scheduledHours: 32, actualHours: 32.0, shiftStart: '08:00', shiftEnd: '17:00', date: '2026-06-28' },
  { id: 'E-06', name: 'T. Walsh', role: 'Cold Chain Lead', status: 'Clocked In', scheduledHours: 30, actualHours: 24.0, shiftStart: '08:00', shiftEnd: '17:00', date: '2026-06-28' }
];

export const initialInventory: InventoryItem[] = [
  { id: 'I-101', name: 'Atlantic Sushi Salmon', category: 'Seafood', stockLevel: 80, currentQty: 120, unit: 'kg', reorderLevel: 80, status: 'Healthy' },
  { id: 'I-102', name: 'Bluefin Tuna Saku', category: 'Seafood', stockLevel: 35, currentQty: 70, unit: 'kg', reorderLevel: 100, status: 'Low' },
  { id: 'I-103', name: 'Premium Sushi Rice', category: 'Grains', stockLevel: 55, currentQty: 180, unit: 'kg', reorderLevel: 250, status: 'Low' },
  { id: 'I-104', name: 'Nori Seaweed Sheets', category: 'Dry Goods', stockLevel: 65, currentQty: 1300, unit: 'units', reorderLevel: 1000, status: 'Healthy' },
  { id: 'I-105', name: 'Fresh Avocados', category: 'Produce', stockLevel: 45, currentQty: 90, unit: 'units', reorderLevel: 120, status: 'Low' },
  { id: 'I-106', name: 'Sushi Seasoning Vinegar', category: 'Condiments', stockLevel: 95, currentQty: 475, unit: 'L', reorderLevel: 150, status: 'Healthy' },
  { id: 'I-107', name: 'Frozen Cooked Breaded Prawn', category: 'Seafood', stockLevel: 40, currentQty: 200, unit: 'units', reorderLevel: 120, status: 'Healthy' },
  { id: 'I-108', name: 'Chicken Katsu', category: 'Poultry', stockLevel: 30, currentQty: 60, unit: 'kg', reorderLevel: 80, status: 'Low' }
];

export const initialAlerts: RealtimeAlert[] = [
  { id: 'A-01', timestamp: '14:12:30', date: '2026-06-28', sensor: 'Cold Room 01', value: '-19.4°C', status: 'normal', message: 'Temperature remains stable at threshold.' },
  { id: 'A-02', timestamp: '14:08:15', date: '2026-06-28', sensor: 'Rice Warmer A', value: '57.0°C', status: 'normal', message: 'Optimal holding temperature verified.' },
  { id: 'A-03', timestamp: '13:55:00', date: '2026-06-27', sensor: 'Seafood Freezer', value: '-12.1°C', status: 'warning', message: 'Slight thermal climb detected during door cycle.' },
  { id: 'A-04', timestamp: '13:10:45', date: '2026-06-26', sensor: 'Dishwasher Rinse', value: '82.5°C', status: 'normal', message: 'Sanitation high-temp rinse verified.' }
];

export const initialWeeklyLogs: DailyOperationalLog[] = [
  {
    day: 'Mon',
    date: '2026-06-15',
    sales: 6400,
    waste: 134.4,
    hours: 82,
    productionTarget: 2500,
    productionMade: 2200,
    supplierName: 'Tazaki',
    cogs: { tazaki: 403.2, sysco: 235.2, bulza: 235.2, sticker: 235.2, others: 235.2 }
  },
  {
    day: 'Tue',
    date: '2026-06-16',
    sales: 6900,
    waste: 144.9,
    hours: 84,
    productionTarget: 2500,
    productionMade: 2250,
    supplierName: 'Sysco',
    cogs: { tazaki: 253.57, sysco: 434.7, bulza: 253.57, sticker: 253.57, others: 253.57 }
  },
  {
    day: 'Wed',
    date: '2026-06-17',
    sales: 6600,
    waste: 138.6,
    hours: 83,
    productionTarget: 2500,
    productionMade: 2180,
    supplierName: 'Bulza',
    cogs: { tazaki: 242.55, sysco: 242.55, bulza: 415.8, sticker: 242.55, others: 242.55 }
  },
  {
    day: 'Thu',
    date: '2026-06-18',
    sales: 7500,
    waste: 157.5,
    hours: 86,
    productionTarget: 2500,
    productionMade: 2320,
    supplierName: 'Sticker',
    cogs: { tazaki: 275.62, sysco: 275.62, bulza: 275.62, sticker: 472.5, others: 275.62 }
  },
  {
    day: 'Fri',
    date: '2026-06-19',
    sales: 7800,
    waste: 163.8,
    hours: 88,
    productionTarget: 2500,
    productionMade: 2400,
    supplierName: 'Others',
    cogs: { tazaki: 286.65, sysco: 286.65, bulza: 286.65, sticker: 286.65, others: 491.4 }
  },
  {
    day: 'Sat',
    date: '2026-06-20',
    sales: 8100,
    waste: 170.1,
    hours: 90,
    productionTarget: 2500,
    productionMade: 2450,
    supplierName: 'Tazaki',
    cogs: { tazaki: 510.3, sysco: 297.67, bulza: 297.67, sticker: 297.67, others: 297.67 }
  },
  {
    day: 'Sun',
    date: '2026-06-21',
    sales: 7500,
    waste: 157.5,
    hours: 88,
    productionTarget: 2500,
    productionMade: 2350,
    supplierName: 'Others',
    cogs: { tazaki: 275.62, sysco: 275.62, bulza: 275.62, sticker: 275.62, others: 472.5 }
  }
];

export const alternativeWeeklyLogsMap: Record<string, DailyOperationalLog[]> = {
  '2026-06-15 to 2026-06-21': [
  {
    day: 'Mon',
    date: '2026-06-15',
    sales: 6400,
    waste: 134.4,
    hours: 82,
    productionTarget: 2500,
    productionMade: 2200,
    supplierName: 'Tazaki',
    cogs: { tazaki: 403.2, sysco: 235.2, bulza: 235.2, sticker: 235.2, others: 235.2 }
  },
  {
    day: 'Tue',
    date: '2026-06-16',
    sales: 6900,
    waste: 144.9,
    hours: 84,
    productionTarget: 2500,
    productionMade: 2250,
    supplierName: 'Sysco',
    cogs: { tazaki: 253.57, sysco: 434.7, bulza: 253.57, sticker: 253.57, others: 253.57 }
  },
  {
    day: 'Wed',
    date: '2026-06-17',
    sales: 6600,
    waste: 138.6,
    hours: 83,
    productionTarget: 2500,
    productionMade: 2180,
    supplierName: 'Bulza',
    cogs: { tazaki: 242.55, sysco: 242.55, bulza: 415.8, sticker: 242.55, others: 242.55 }
  },
  {
    day: 'Thu',
    date: '2026-06-18',
    sales: 7500,
    waste: 157.5,
    hours: 86,
    productionTarget: 2500,
    productionMade: 2320,
    supplierName: 'Sticker',
    cogs: { tazaki: 275.62, sysco: 275.62, bulza: 275.62, sticker: 472.5, others: 275.62 }
  },
  {
    day: 'Fri',
    date: '2026-06-19',
    sales: 7800,
    waste: 163.8,
    hours: 88,
    productionTarget: 2500,
    productionMade: 2400,
    supplierName: 'Others',
    cogs: { tazaki: 286.65, sysco: 286.65, bulza: 286.65, sticker: 286.65, others: 491.4 }
  },
  {
    day: 'Sat',
    date: '2026-06-20',
    sales: 8100,
    waste: 170.1,
    hours: 90,
    productionTarget: 2500,
    productionMade: 2450,
    supplierName: 'Tazaki',
    cogs: { tazaki: 510.3, sysco: 297.67, bulza: 297.67, sticker: 297.67, others: 297.67 }
  },
  {
    day: 'Sun',
    date: '2026-06-21',
    sales: 7500,
    waste: 157.5,
    hours: 88,
    productionTarget: 2500,
    productionMade: 2350,
    supplierName: 'Others',
    cogs: { tazaki: 275.62, sysco: 275.62, bulza: 275.62, sticker: 275.62, others: 472.5 }
  }
  ],
  '2026-06-22 to 2026-06-28': [
  {
    day: 'Mon',
    date: '2026-06-22',
    sales: 6500,
    waste: 136.5,
    hours: 81,
    productionTarget: 2500,
    productionMade: 2220,
    supplierName: 'Tazaki',
    cogs: { tazaki: 409.5, sysco: 238.87, bulza: 238.87, sticker: 238.87, others: 238.87 }
  },
  {
    day: 'Tue',
    date: '2026-06-23',
    sales: 7000,
    waste: 147.0,
    hours: 85,
    productionTarget: 2500,
    productionMade: 2280,
    supplierName: 'Sysco',
    cogs: { tazaki: 257.25, sysco: 441.0, bulza: 257.25, sticker: 257.25, others: 257.25 }
  },
  {
    day: 'Wed',
    date: '2026-06-24',
    sales: 6800,
    waste: 142.8,
    hours: 84,
    productionTarget: 2500,
    productionMade: 2240,
    supplierName: 'Bulza',
    cogs: { tazaki: 249.9, sysco: 249.9, bulza: 428.4, sticker: 249.9, others: 249.9 }
  },
  {
    day: 'Thu',
    date: '2026-06-25',
    sales: 7300,
    waste: 153.3,
    hours: 87,
    productionTarget: 2500,
    productionMade: 2380,
    supplierName: 'Sticker',
    cogs: { tazaki: 268.27, sysco: 268.27, bulza: 268.27, sticker: 459.9, others: 268.27 }
  },
  {
    day: 'Fri',
    date: '2026-06-26',
    sales: 7900,
    waste: 165.9,
    hours: 90,
    productionTarget: 2500,
    productionMade: 2480,
    supplierName: 'Others',
    cogs: { tazaki: 290.32, sysco: 290.32, bulza: 290.32, sticker: 290.32, others: 497.7 }
  },
  {
    day: 'Sat',
    date: '2026-06-27',
    sales: 8200,
    waste: 172.2,
    hours: 92,
    productionTarget: 2500,
    productionMade: 2500,
    supplierName: 'Tazaki',
    cogs: { tazaki: 516.6, sysco: 301.35, bulza: 301.35, sticker: 301.35, others: 301.35 }
  },
  {
    day: 'Sun',
    date: '2026-06-28',
    sales: 7500,
    waste: 157.5,
    hours: 88,
    productionTarget: 2500,
    productionMade: 2200,
    supplierName: 'Others',
    cogs: { tazaki: 275.62, sysco: 275.62, bulza: 275.62, sticker: 275.62, others: 472.5 }
  }
  ],
  '2026-06-08 to 2026-06-14': [
  {
    day: 'Mon',
    date: '2026-06-08',
    sales: 6000,
    waste: 126.0,
    hours: 80,
    productionTarget: 2400,
    productionMade: 2100,
    supplierName: 'Tazaki',
    cogs: { tazaki: 378.0, sysco: 220.5, bulza: 220.5, sticker: 220.5, others: 220.5 }
  },
  {
    day: 'Tue',
    date: '2026-06-09',
    sales: 6400,
    waste: 134.4,
    hours: 82,
    productionTarget: 2400,
    productionMade: 2150,
    supplierName: 'Sysco',
    cogs: { tazaki: 235.2, sysco: 403.2, bulza: 235.2, sticker: 235.2, others: 235.2 }
  },
  {
    day: 'Wed',
    date: '2026-06-10',
    sales: 6200,
    waste: 130.2,
    hours: 81,
    productionTarget: 2400,
    productionMade: 2120,
    supplierName: 'Bulza',
    cogs: { tazaki: 227.85, sysco: 227.85, bulza: 390.6, sticker: 227.85, others: 227.85 }
  },
  {
    day: 'Thu',
    date: '2026-06-11',
    sales: 6800,
    waste: 142.8,
    hours: 84,
    productionTarget: 2400,
    productionMade: 2250,
    supplierName: 'Sticker',
    cogs: { tazaki: 249.9, sysco: 249.9, bulza: 249.9, sticker: 428.4, others: 249.9 }
  },
  {
    day: 'Fri',
    date: '2026-06-12',
    sales: 7200,
    waste: 151.2,
    hours: 86,
    productionTarget: 2400,
    productionMade: 2300,
    supplierName: 'Others',
    cogs: { tazaki: 264.6, sysco: 264.6, bulza: 264.6, sticker: 264.6, others: 453.6 }
  },
  {
    day: 'Sat',
    date: '2026-06-13',
    sales: 7400,
    waste: 155.4,
    hours: 88,
    productionTarget: 2400,
    productionMade: 2320,
    supplierName: 'Tazaki',
    cogs: { tazaki: 466.2, sysco: 271.95, bulza: 271.95, sticker: 271.95, others: 271.95 }
  },
  {
    day: 'Sun',
    date: '2026-06-14',
    sales: 7000,
    waste: 147.0,
    hours: 85,
    productionTarget: 2400,
    productionMade: 2200,
    supplierName: 'Others',
    cogs: { tazaki: 257.25, sysco: 257.25, bulza: 257.25, sticker: 257.25, others: 441.0 }
  }
  ],
};
