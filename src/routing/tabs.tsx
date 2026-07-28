import React from "react";
import {
  LayoutDashboard,
  Lightbulb,
  DollarSign,
  FileSpreadsheet,
  ShieldCheck,
  Trash2,
  Clock,
  Package,
  Coins,
  Upload,
  BrainCircuit,
  BarChart3,
} from "lucide-react";

export type TabMeta = { id: string; label: string; icon: React.ReactNode };

const primaryTabMeta: TabMeta[] = [
  { id: "Overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "Solution", label: "What to do", icon: <Lightbulb className="w-4 h-4" /> },
  { id: "P&L", label: "P&L", icon: <DollarSign className="w-4 h-4" /> },
  { id: "Reports", label: "Reports", icon: <FileSpreadsheet className="w-4 h-4" /> },
];

const operationsTabMeta: TabMeta[] = [
  { id: "Targets & Production", label: "Targets & Production", icon: <ShieldCheck className="w-4 h-4" /> },
  { id: "Waste", label: "Waste", icon: <Trash2 className="w-4 h-4" /> },
  { id: "Hours", label: "Hours", icon: <Clock className="w-4 h-4" /> },
  { id: "Suppliers", label: "Suppliers", icon: <Package className="w-4 h-4" /> },
];

const moreToolsTabMeta: TabMeta[] = [
  { id: "Sell", label: "Sales", icon: <Coins className="w-4 h-4" /> },
  { id: "Price Import", label: "Price Import", icon: <Upload className="w-4 h-4" /> },
  { id: "Advisor", label: "Advisor", icon: <BrainCircuit className="w-4 h-4" /> },
  { id: "Analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
];

export function getPermittedTabs(permittedTabIds: string[]): TabMeta[] {
  const allTabMeta = [...primaryTabMeta, ...operationsTabMeta, ...moreToolsTabMeta];
  return allTabMeta.filter((tab) => permittedTabIds.includes(tab.id));
}
