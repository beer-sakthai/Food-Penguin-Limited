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
  barcode?: string;
  status: 'Completed' | 'Pending' | 'Refunded';
  branch?: string;
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

export type OperationalDay = DailyOperationalLog['day'];
export type SupplierName = DailyOperationalLog['supplierName'];

export interface BranchOperationalSnapshot {
  sales: number;
  production: number;
  productionTarget: number;
  wasteCost: number;
  hours: number;
  cogs: number;
}

export type BranchOperationalWeekMap = Record<string, Record<string, DailyOperationalLog[]>>;

export interface BranchKpiSummary {
  id: string;
  branch: string;
  shortLabel: string;
  sales: number;
  production: number;
  productionTarget: number;
  productionAttainmentPct: number;
  wasteCost: number;
  wastePct: number;
  hours: number;
  laborEfficiency: number;
  cogs: number;
  cogsRatioPct: number;
  targetAttainmentPct: number;
  efficiencyScore: number;
}

export interface CompanyKpiMetric {
  id: 'sales' | 'production' | 'wasteCost' | 'wasteRate' | 'laborEfficiency' | 'cogs' | 'targetAttainment';
  label: string;
  value: number;
  displayValue: string;
  deltaPct: number;
  deltaLabel: string;
  status: 'healthy' | 'warning' | 'critical';
  helperText: string;
}

export interface CompanyKpiSnapshot {
  period: 'day' | 'week';
  selectedDay?: OperationalDay;
  sales: number;
  production: number;
  productionTarget: number;
  productionAttainmentPct: number;
  wasteCost: number;
  wastePct: number;
  hours: number;
  laborEfficiency: number;
  cogs: number;
  cogsRatioPct: number;
  targetAttainmentPct: number;
  metrics: CompanyKpiMetric[];
}

export interface CompanyKpiTrendPoint {
  day: OperationalDay;
  sales: number;
  production: number;
  wasteCost: number;
  hours: number;
  cogs: number;
  laborEfficiency: number;
  targetAttainmentPct: number;
}

export interface CompanyTargetVariance {
  id: string;
  name: string;
  category: CompanyTarget['category'];
  metric: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  variance: number;
  variancePct: number;
  status: 'ahead' | 'at-risk' | 'behind';
}

export interface OverviewBranchComparisonItem {
  id: string;
  name: string;
  fullName: string;
  type: string;
  sales: number;
  production: number;
  wastePct: number;
  efficiencyScore: number;
  color: string;
  fill?: string;
}
