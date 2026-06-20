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
  { id: 'FP-1084', timestamp: '14:10', item: 'Glacier Salmon Nigiri (8pc)', category: 'Nigiri', quantity: 2, amount: 25.80, status: 'Completed' },
  { id: 'FP-1083', timestamp: '13:58', item: 'Penguin Dragon Roll', category: 'Signature Rolls', quantity: 1, amount: 16.50, status: 'Completed' },
  { id: 'FP-1082', timestamp: '13:51', item: 'Emperor Bluefin Tuna Roll', category: 'Maki Rolls', quantity: 1, amount: 18.90, status: 'Completed' },
  { id: 'FP-1081', timestamp: '13:45', item: 'Ice Shelf Sashimi Platter', category: 'Sashimi', quantity: 3, amount: 74.70, status: 'Completed' },
  { id: 'FP-1080', timestamp: '13:30', item: 'Matcha Snow Latte', category: 'Drinks', quantity: 2, amount: 13.00, status: 'Completed' },
  { id: 'FP-1079', timestamp: '13:12', item: 'North Pole Omakase Combo', category: 'Combos', quantity: 1, amount: 15.90, status: 'Completed' },
  { id: 'FP-1078', timestamp: '12:45', item: 'Snowcap California Roll', category: 'Maki Rolls', quantity: 2, amount: 17.00, status: 'Completed' }
];

export const initialTargets: CompanyTarget[] = [
  { id: 'T-1', name: 'Daily Revenue Marker', metric: 'Total Sales (€)', targetValue: 15000, currentValue: 14820, unit: '€', category: 'Sell', deadline: 'Today, 22:00' },
  { id: 'T-2', name: 'Sushi Plating Threshold', metric: 'Pieces Plated', targetValue: 11500, currentValue: 11240, unit: 'pcs', category: 'Production', deadline: 'Today, 21:00' },
  { id: 'T-3', name: 'Daily Waste Minimizer', metric: 'Food Waste Cost', targetValue: 500, currentValue: 412.50, unit: '€', category: 'Waste', deadline: 'Today, 22:00' },
  { id: 'T-4', name: 'Hourly Roster Precision', metric: 'Overtime Margin', targetValue: 2, currentValue: 0, unit: 'hrs', category: 'Hours', deadline: 'End of Shift' },
  { id: 'T-5', name: 'Weekly Organic Reach', metric: 'Social Promos Run', targetValue: 10, currentValue: 8, unit: 'times', category: 'Sell', deadline: 'Sunday, 18:00' }
];

export const initialRecipes: Recipe[] = [
  { id: 'R-1', name: 'Glacier Salmon Nigiri', category: 'Nigiri', status: 'active', prepTime: 5, ingredients: ['Koshihikari Sushi Rice', 'Norwegian Salmon Neta', 'Fresh Wasabi', 'Rice Vinegar Seasoning', 'Nori Strip'], allergens: ['Fish', 'Soy'] },
  { id: 'R-2', name: 'Emperor Bluefin Tuna Roll', category: 'Maki Rolls', status: 'active', prepTime: 9, ingredients: ['Sushi Rice', 'Bluefin Tuna Loin', 'Nori Sheet', 'Cucumber Julienne', 'Toasted Sesame'], allergens: ['Fish', 'Sesame', 'Soy'] },
  { id: 'R-3', name: 'Penguin Dragon Roll', category: 'Signature Rolls', status: 'active', prepTime: 12, ingredients: ['Sushi Rice', 'Grilled Unagi', 'Avocado Fan', 'Tempura Shrimp', 'Eel Glaze', 'Tobiko'], allergens: ['Fish', 'Shellfish', 'Gluten'] },
  { id: 'R-4', name: 'Ice Shelf Sashimi Platter', category: 'Sashimi', status: 'active', prepTime: 8, ingredients: ['Salmon Belly', 'Bluefin Tuna', 'Yellowtail (Hamachi)', 'Daikon Nest', 'Shiso Leaf'], allergens: ['Fish'] },
  { id: 'R-5', name: 'Snowcap California Roll', category: 'Maki Rolls', status: 'active', prepTime: 7, ingredients: ['Sushi Rice', 'Snow Crab Stick', 'Avocado', 'Cucumber', 'Tobiko Roe'], allergens: ['Shellfish', 'Egg', 'Soy'] }
];

export const initialTasks: ProductionTask[] = [
  { id: 'PT-301', itemName: 'Glacier Salmon Nigiri', assignedTo: 'Itamae Skipper', status: 'Cooking', quantity: 2, priority: 'high' },
  { id: 'PT-302', itemName: 'Emperor Bluefin Tuna Roll', assignedTo: 'Itamae Private', status: 'Cooking', quantity: 1, priority: 'medium' },
  { id: 'PT-303', itemName: 'Penguin Dragon Roll', assignedTo: 'Prep Aide Rico', status: 'In Queue', quantity: 1, priority: 'low' },
  { id: 'PT-304', itemName: 'Ice Shelf Sashimi Platter', assignedTo: 'Itamae Kowalski', status: 'Prepared', quantity: 3, priority: 'high' }
];

export const initialWaste: WasteRecord[] = [
  { id: 'W-901', item: 'Over-seasoned Sushi Rice Batch', category: 'Rice', weight: 4.5, cost: 35.00, reason: 'Overproduced', date: '2026-06-19' },
  { id: 'W-902', item: 'Dried-out Nori Sheets', category: 'Seaweed', weight: 1.2, cost: 28.00, reason: 'Quality Issue', date: '2026-06-19' },
  { id: 'W-903', item: 'Oxidized Bluefin Tuna Trim', category: 'Seafood', weight: 3.2, cost: 74.50, reason: 'Expired', date: '2026-06-19' },
  { id: 'W-904', item: 'Bruised Avocado Fans', category: 'Produce', weight: 2.0, cost: 18.00, reason: 'Quality Issue', date: '2026-06-19' },
  { id: 'W-905', item: 'Spilled Soy & Ponzu Mix', category: 'Condiments', weight: 5.0, cost: 15.00, reason: 'Spill/Accident', date: '2026-06-18' }
];

export const initialHours: EmployeeHour[] = [
  { id: 'E-01', name: 'Itamae Skipper (Lead)', role: 'Head Itamae / Master Sushi Chef', status: 'Clocked In', scheduledHours: 40, actualHours: 36.5, shiftStart: '08:00', shiftEnd: '17:00' },
  { id: 'E-02', name: 'Itamae Kowalski', role: 'Sashimi Analyst / Sous Itamae', status: 'Clocked In', scheduledHours: 40, actualHours: 35.0, shiftStart: '09:00', shiftEnd: '18:00' },
  { id: 'E-03', name: 'Itamae Private', role: 'Junior Roll Specialist', status: 'Clocked In', scheduledHours: 35, actualHours: 31.0, shiftStart: '10:00', shiftEnd: '18:00' },
  { id: 'E-04', name: 'Prep Aide Rico', role: 'Neta Prep & Expeditor', status: 'Clocked In', scheduledHours: 30, actualHours: 28.5, shiftStart: '11:00', shiftEnd: '19:00' },
  { id: 'E-05', name: 'Alice Smith', role: 'Cashier Manager', status: 'Clocked Out', scheduledHours: 32, actualHours: 32.0, shiftStart: '08:00', shiftEnd: '16:00' },
  { id: 'E-06', name: 'Bob Johnson', role: 'Delivery Lead', status: 'Clocked Out', scheduledHours: 30, actualHours: 24.0, shiftStart: '12:00', shiftEnd: '20:00' }
];

export const initialInventory: InventoryItem[] = [
  { id: 'I-101', name: 'Bluefin Tuna Loin (sushi-grade)', category: 'Seafood', stockLevel: 35, currentQty: 70, unit: 'kg', reorderLevel: 100, status: 'Low' },
  { id: 'I-102', name: 'Norwegian Salmon Fillet', category: 'Seafood', stockLevel: 80, currentQty: 120, unit: 'kg', reorderLevel: 80, status: 'Healthy' },
  { id: 'I-103', name: 'Nori Seaweed Sheets', category: 'Seaweed', stockLevel: 12, currentQty: 80, unit: 'packs', reorderLevel: 250, status: 'Critical' },
  { id: 'I-104', name: 'Koshihikari Sushi Rice', category: 'Rice', stockLevel: 65, currentQty: 130, unit: 'kg', reorderLevel: 100, status: 'Healthy' },
  { id: 'I-105', name: 'Hass Avocados', category: 'Produce', stockLevel: 45, currentQty: 90, unit: 'pcs', reorderLevel: 120, status: 'Low' },
  { id: 'I-106', name: 'Rice Vinegar & Soy Base', category: 'Condiments', stockLevel: 95, currentQty: 475, unit: 'L', reorderLevel: 150, status: 'Healthy' }
];

export const initialAlerts: RealtimeAlert[] = [
  { id: 'A-01', timestamp: '14:12:30', sensor: 'Sushi-Neta Display Chiller-01', value: '3.4°C', status: 'normal', message: 'Fish case holding sushi-grade cold threshold.' },
  { id: 'A-02', timestamp: '14:08:15', sensor: 'Shari Rice Warmer Line B', value: '37.0°C', status: 'normal', message: 'Sushi rice held at ideal serving temperature.' },
  { id: 'A-03', timestamp: '13:55:00', sensor: 'Tuna Deep Freezer (-60°C)', value: '-54.1°C', status: 'warning', message: 'Slight thermal climb detected during door cycle.' },
  { id: 'A-04', timestamp: '13:10:45', sensor: 'Hand-wash Sanitation Tank', value: '82.5°C', status: 'normal', message: 'Sanitation high-temp rinse verified.' }
];
