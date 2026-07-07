import React, { useState, useEffect } from 'react';
import { WasteRecord, DailyOperationalLog, CompanyTarget } from '../types';
import { 
 PieChart, 
 Pie, 
 Cell, 
 Tooltip, 
 ResponsiveContainer, 
 Legend,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid
} from 'recharts';
import { 
 Trash2, 
 Sparkles, 
 Scale, 
 Euro, 
 AlertCircle, 
 Plus, 
 UtensilsCrossed,
 TrendingDown
} from 'lucide-react';
import { MS_PRODUCTS, TESCO_PRODUCTS } from '../data';

interface WasteTabProps {
 wasteRecords: WasteRecord[];
 onAddWaste: (record: Oimt<WasteRecord, 'id' | 'date'>) => void;
 totalCostToday: number;
 selectedBranch: 'All Branches' | 'Marks & Spencer - Cork City' | 'Tesco - Cork City' | 'Tesco - Mahon Point';
 weeklyLogs?: DailyOperationalLog[];
 targets?: CompanyTarget[];
 theme?: 'light' | 'dark';
}
