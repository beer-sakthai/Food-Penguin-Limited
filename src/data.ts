import {
  CoreMetrics,
  SalesOrder,
  CompanyTarget,
  Recipe,
  ProductionTask,
  WasteRecord,
  EmployeeHour,
  InventoryItem,
  RealtimeAlert
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
  { id: 'FP-1084', timestamp: '14:10', item: 'Glacier Cod Burger XL', category: 'Arctic Burgers', quantity: 2, amount: 25.80, status: 'Completed' },
  { id: 'FP-1083', timestamp: '13:58', item: 'Penguin Peppermint Sundae', category: 'Desserts', quantity: 1, amount: 6.50, status: 'Completed' },
  { id: 'FP-1082', timestamp: '13:51', item: 'Imperial Emperor Pizza', category: 'Glacier Pizzas', quantity: 1, amount: 18.90, status: 'Completed' },
  { id: 'FP-1081', timestamp: '13:45', item: 'Ice Shelf Salmon Slabs', category: 'Arctic Platters', quantity: 3, amount: 74.70, status: 'Completed' },
  { id: 'FP-1080', timestamp: '13:30', item: 'Snowball Protein Shake', category: 'Glacier Drinks', quantity: 2, amount: 13.00, status: 'Completed' },
  { id: 'FP-1079', timestamp: '13:12', item: 'North Pole Nibbles Combo', category: 'Combos', quantity: 1, amount: 15.90, status: 'Completed' },
  { id: 'FP-1078', timestamp: '12:45', item: 'Pebble Batter Pancakes', category: 'Desserts', quantity: 2, amount: 17.00, status: 'Completed' }
];

export const initialTargets: CompanyTarget[] = [
  { id: 'T-1', name: 'Daily Revenue Marker', metric: 'Total Sales (€)', targetValue: 15000, currentValue: 14820, unit: '€', category: 'Sell', deadline: 'Today, 22:00' },
  { id: 'T-2', name: 'Kitchen Cook Threshold', metric: 'Items Cooked', targetValue: 11500, currentValue: 11240, unit: 'pcs', category: 'Production', deadline: 'Today, 21:00' },
  { id: 'T-3', name: 'Daily Waste Minimizer', metric: 'Food Waste Cost', targetValue: 500, currentValue: 412.50, unit: '€', category: 'Waste', deadline: 'Today, 22:00' },
  { id: 'T-4', name: 'Hourly Roster Precision', metric: 'Overtime Margin', targetValue: 2, currentValue: 0, unit: 'hrs', category: 'Hours', deadline: 'End of Shift' },
  { id: 'T-5', name: 'Weekly Organic Reach', metric: 'Social Promos Run', targetValue: 10, currentValue: 8, unit: 'times', category: 'Sell', deadline: 'Sunday, 18:00' }
];

export const initialRecipes: Recipe[] = [
  { id: 'R-1', name: 'Glacier Cod Burger XL', category: 'Burgers', status: 'active', prepTime: 8, ingredients: ['Deep-sea Cod Fillet', 'Chilled Sesame Bun', 'Iceberg Lettuce', 'Artic Special Sauce', 'Pickles'], allergens: ['Fish', 'Gluten', 'Eggs'] },
  { id: 'R-2', name: 'Imperial Emperor Pizza', category: 'Pizzas', status: 'active', prepTime: 12, ingredients: ['Stretched Yeast Dough', 'Cold-pressed Tomato Sauce', 'Shredded Mozzarella', 'Marinated Pepperoni Slits', 'Oregano'], allergens: ['Gluten', 'Milk'] },
  { id: 'R-3', name: 'Penguin Peppermint Sundae', category: 'Desserts', status: 'active', prepTime: 4, ingredients: ['Mint Gelato Mash', 'Crushed Oreos', 'Dark Chocolate Fudge', 'Whipping Frost', 'Cherry On Top'], allergens: ['Milk', 'Soya', 'Gluten'] },
  { id: 'R-4', name: 'Ice Shelf Salmon Slabs', category: 'Platters', status: 'active', prepTime: 15, ingredients: ['Atlantic Salmon Fillet', 'Cranberry Dill Chutney', 'Winter Butter Asparagus', 'Lemon Wedges'], allergens: ['Fish', 'Milk'] },
  { id: 'R-5', name: 'Pebble Batter Pancakes', category: 'Desserts', status: 'active', prepTime: 6, ingredients: ['Buttermilk Batter mix', 'Organic Blueberries', 'Maple Glaze Melt', 'Whipped Salted Butter'], allergens: ['Gluten', 'Eggs', 'Milk'] }
];

export const initialTasks: ProductionTask[] = [
  { id: 'PT-301', itemName: 'Glacier Cod Burger XL', assignedTo: 'Chef Skipper', status: 'Cooking', quantity: 2, priority: 'high' },
  { id: 'PT-302', itemName: 'Imperial Emperor Pizza', assignedTo: 'Chef Private', status: 'Cooking', quantity: 1, priority: 'medium' },
  { id: 'PT-303', itemName: 'Penguin Peppermint Sundae', assignedTo: 'Kitchen Aide Rico', status: 'In Queue', quantity: 1, priority: 'low' },
  { id: 'PT-304', itemName: 'Ice Shelf Salmon Slabs', assignedTo: 'Chef Kowalski', status: 'Prepared', quantity: 3, priority: 'high' }
];

export const initialWaste: WasteRecord[] = [
  { id: 'W-901', item: 'Spilled Milk Gelato Mix', category: 'Dairy', weight: 4.5, cost: 35.00, reason: 'Spill/Accident', date: '2026-06-19' },
  { id: 'W-902', item: 'Overproduced Glacier Buns', category: 'Bakery', weight: 12.0, cost: 48.00, reason: 'Overproduced', date: '2026-06-19' },
  { id: 'W-903', item: 'Expired Cod Fillet Trimmings', category: 'Seafood', weight: 3.2, cost: 74.50, reason: 'Expired', date: '2026-06-19' },
  { id: 'W-904', item: 'Burnt Pizza Dough', category: 'Bakery', weight: 6.0, cost: 24.00, reason: 'Quality Issue', date: '2026-06-19' },
  { id: 'W-905', item: 'Soggy Iceberg Lettuce', category: 'Produce', weight: 5.0, cost: 15.00, reason: 'Expired', date: '2026-06-18' }
];

export const initialHours: EmployeeHour[] = [
  { id: 'E-01', name: 'Chef Skipper (Lead)', role: 'Head Coach / Chef', status: 'Clocked In', scheduledHours: 40, actualHours: 36.5, shiftStart: '08:00', shiftEnd: '17:00' },
  { id: 'E-02', name: 'Chef Kowalski', role: 'Kitchen Analyst / Sous Chef', status: 'Clocked In', scheduledHours: 40, actualHours: 35.0, shiftStart: '09:00', shiftEnd: '18:00' },
  { id: 'E-03', name: 'Chef Private', role: 'Junior Chef', status: 'Clocked In', scheduledHours: 35, actualHours: 31.0, shiftStart: '10:00', shiftEnd: '18:00' },
  { id: 'E-04', name: 'Kitchen Aide Rico', role: 'Prep & Expeditor', status: 'Clocked In', scheduledHours: 30, actualHours: 28.5, shiftStart: '11:00', shiftEnd: '19:00' },
  { id: 'E-05', name: 'Alice Smith', role: 'Cashier Manager', status: 'Clocked Out', scheduledHours: 32, actualHours: 32.0, shiftStart: '08:00', shiftEnd: '16:00' },
  { id: 'E-06', name: 'Bob Johnson', role: 'Delivery Lead', status: 'Clocked Out', scheduledHours: 30, actualHours: 24.0, shiftStart: '12:00', shiftEnd: '20:00' }
];

export const initialInventory: InventoryItem[] = [
  { id: 'I-101', name: 'Deep-sea Cod Fillet', category: 'Seafood', stockLevel: 35, currentQty: 70, unit: 'kg', reorderLevel: 100, status: 'Low' },
  { id: 'I-102', name: 'Atlantic Salmon Slabs', category: 'Seafood', stockLevel: 80, currentQty: 120, unit: 'kg', reorderLevel: 80, status: 'Healthy' },
  { id: 'I-103', name: 'Glacier Brioche Buns', category: 'Bakery', stockLevel: 12, currentQty: 80, unit: 'pcs', reorderLevel: 250, status: 'Critical' },
  { id: 'I-104', name: 'Milk Gelato Custard', category: 'Dairy', stockLevel: 65, currentQty: 130, unit: 'L', reorderLevel: 100, status: 'Healthy' },
  { id: 'I-105', name: 'Iceberg Lettuce heads', category: 'Produce', stockLevel: 45, currentQty: 90, unit: 'pcs', reorderLevel: 120, status: 'Low' },
  { id: 'I-106', name: 'Stretched Yeast Flour Batter', category: 'Bakery', stockLevel: 95, currentQty: 475, unit: 'kg', reorderLevel: 150, status: 'Healthy' }
];

export const initialAlerts: RealtimeAlert[] = [
  { id: 'A-01', timestamp: '14:12:30', sensor: 'Cold Room Freezy-01', value: '-18.4°C', status: 'normal', message: 'Temperature remains stable at threshold.' },
  { id: 'A-02', timestamp: '14:08:15', sensor: 'Glacier Oven Line B', value: '185.0°C', status: 'normal', message: 'Target baking temp achieved.' },
  { id: 'A-03', timestamp: '13:55:00', sensor: 'Seafood Deep Freezer', value: '-12.1°C', status: 'warning', message: 'Slight thermal climb detected during door cycle.' },
  { id: 'A-04', timestamp: '13:10:45', sensor: 'Dishwasher Rinse Tank', value: '82.5°C', status: 'normal', message: 'Sanitation high-temp rinse verified.' }
];
