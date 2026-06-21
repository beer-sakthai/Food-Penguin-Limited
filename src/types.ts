export interface CoreMetrics {
  salesToday: number;
  salesGrowth: number;
  productionItems: number;
  productionTarget: number;
  wasteCost: number;
  wasteReduction: number;
  hoursScheduled: number;
  overtimeHours: number;
  aiHealthScore: number;
}

export interface SalesOrder {
  id: string;
  timestamp: string;
  item: string;
  category: string;
  quantity: number;
  amount: number;
  status: 'Completed' | 'Pending' | 'Refunded';
}

export interface CompanyTarget {
  id: string;
  name: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'Sell' | 'Production' | 'Waste' | 'Hours';
  deadline: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'archived';
  prepTime: number;
  ingredients: string[];
  allergens: string[];
}

export interface ProductionTask {
  id: string;
  itemName: string;
  assignedTo: string;
  status: 'In Queue' | 'Cooking' | 'Prepared' | 'Out for Delivery';
  quantity: number;
  priority: 'low' | 'medium' | 'high';
}

export interface WasteRecord {
  id: string;
  item: string;
  category: string;
  weight: number; // in kg
  cost: number;
  reason: 'Expired' | 'Overproduced' | 'Quality Issue' | 'Spill/Accident';
  date: string;
}

export interface EmployeeHour {
  id: string;
  name: string;
  role: string;
  status: 'Clocked In' | 'Clocked Out';
  scheduledHours: number;
  actualHours: number;
  shiftStart: string;
  shiftEnd: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stockLevel: number; // percent
  currentQty: number;
  unit: string;
  reorderLevel: number;
  status: 'Healthy' | 'Low' | 'Critical';
}

export interface RealtimeAlert {
  id: string;
  timestamp: string;
  sensor: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
  message: string;
}

export interface DailyOperationalLog {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  date: string;
  sales: number;
  waste: number;
  hours: number;
  productionTarget: number;
  productionMade: number;
  supplierName: 'Tazaki' | 'Sysco' | 'Bulza' | 'Sticker' | 'Others';
  cogs: {
    tazaki: number;
    sysco: number;
    bulza: number;
    sticker: number;
    others: number;
  };
}
