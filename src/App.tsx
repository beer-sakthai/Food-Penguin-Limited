import { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import {
  initialMetrics,
  initialOrders,
  initialTargets,
  initialRecipes,
  initialTasks,
  initialWaste,
  initialHours,
  initialInventory,
  initialWeeklyLogs,
  alternativeWeeklyLogsMap
} from './data';
import {
  CoreMetrics,
  SalesOrder,
  CompanyTarget,
  Recipe,
  ProductionTask,
  WasteRecord,
  EmployeeHour,
  InventoryItem,
  DailyOperationalLog
} from './types';

// Tab Views
import OverviewTab from './components/OverviewTab';
import SellTab from './components/SellTab';
import TargetTab from './components/TargetTab';
import ProductionTab from './components/ProductionTab';
import WasteTab from './components/WasteTab';
import HoursTab from './components/HoursTab';
import PlanningTab from './components/PlanningTab';
import { MS_PRODUCTS, TESCO_PRODUCTS } from './components/SellTab';


// Main Icons
import {
  LayoutDashboard,
  Coins,
  ShieldCheck,
  ChefHat,
  Trash2,
  CalendarDays,
  Boxes,
  Activity,
  User,
  Power,
  Cpu,
  GlassWater,
  ChevronDown,
  ChevronUp,
  Download,
  Sun,
  Moon
} from 'lucide-react';

const rolePermissions: Record<'Admin' | 'Manager' | 'Staff', string[]> = {
  Admin: ['Overview', 'Sell', 'Target', 'Production', 'Waste', 'Hours', 'Planning'],
  Manager: ['Overview', 'Target', 'Production', 'Waste', 'Hours', 'Planning'],
  Staff: ['Overview', 'Sell', 'Production', 'Waste']
};

export default function App() {
  // App States
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch (_) {}
  };

  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [userRole, setUserRole] = useState<'Admin' | 'Manager' | 'Staff'>('Admin');
  const [selectedBranch, setSelectedBranch] = useState<'Marks & Spencer - Cork City' | 'Tesco - Cork City' | 'Tesco - Mahon Point'>('Marks & Spencer - Cork City');
  const [metrics, setMetrics] = useState<CoreMetrics>(initialMetrics);
  const [orders, setOrders] = useState<SalesOrder[]>(initialOrders);
  const [targets, setTargets] = useState<CompanyTarget[]>(initialTargets);

  const recipes = useMemo<Recipe[]>(() => {
    const isMS = selectedBranch === 'Marks & Spencer - Cork City';
    const activeProducts = isMS ? MS_PRODUCTS : TESCO_PRODUCTS;

    const getIngredients = (category: string, name: string) => {
      const lowerName = name.toLowerCase();
      if (lowerName.includes('salmon')) {
        return ['Atlantic Salmon Fillet', 'Fresh Wasabi Paste', 'Premium Sushi Rice', 'Grated Daikon Radish', 'Soy Sauce'];
      }
      if (lowerName.includes('chicken')) {
        return ['Free-range Chicken Fillet', 'Katsu Curry Sauce', 'Panko Breadcrumbs', 'Seasoned Jasmine Rice', 'Spring Onions'];
      }
      if (lowerName.includes('tofu') || lowerName.includes('veggie') || lowerName.includes('plant')) {
        return ['Pressed Silken Tofu', 'Fresh Avocado', 'Cucumber ribbon', 'Mixed Sesame seeds', 'Sweet Glaze Drizzle'];
      }
      if (category === 'Sushi Rolls' || category === 'Maki Rolls' || category === 'Nigiri Duos') {
        return ['Seasoned Hinohikari Rice', 'Premium Toasted Nori Sheets', 'Crispy Cucumber', 'Kyoto Japanese Mayo', 'Soy Glaze'];
      }
      if (category === 'Noodles & Sides' || lowerName.includes('noodles')) {
        return ['Fresh Udon Grains', 'Julienned Sweet Peppers', 'Savory Soy Brew sauce', 'Crushed Peanuts', 'Chili Flakes'];
      }
      if (category === 'Desserts & Sweets' || lowerName.includes('mochi')) {
        return ['Sweetened Rice Flour Paste', 'Artisanal Ice Cream Core', 'Powdered Starch coating', 'Natural Strawberry syrup'];
      }
      return ['Hand-picked Nori', 'Select Sushi Rice', 'Signature Dipping Sauce', 'Crisp Cucumber slice'];
    };

    const getAllergens = (category: string, name: string) => {
      const lowerName = name.toLowerCase();
      const allergens: string[] = [];
      if (lowerName.includes('salmon') || lowerName.includes('fish')) allergens.push('Fish');
      if (lowerName.includes('chicken')) allergens.push('Gluten');
      if (lowerName.includes('tofu') || lowerName.includes('veggie')) allergens.push('Soya');
      if (lowerName.includes('noodles') || lowerName.includes('gyoza') || lowerName.includes('katsu')) {
        if (!allergens.includes('Gluten')) allergens.push('Gluten');
      }
      if (lowerName.includes('mochi')) allergens.push('Milk');
      if (category.toLowerCase().includes('roll')) {
        allergens.push('Sesame');
      }
      if (allergens.length === 0) allergens.push('Soya');
      return allergens;
    };

    return activeProducts.map((p, idx) => ({
      id: `${isMS ? 'R-MS' : 'R-T'}-${idx + 1}`,
      name: p.name,
      category: p.category,
      status: 'active' as const,
      prepTime: Math.min(15, Math.max(3, Math.round(p.price * 1.2))),
      ingredients: getIngredients(p.category, p.name),
      allergens: getAllergens(p.category, p.name)
    }));
  }, [selectedBranch]);

  const [tasks, setTasks] = useState<ProductionTask[]>(initialTasks);

  // Sync tasks list with active branch products on branch switch
  useEffect(() => {
    const isMS = selectedBranch === 'Marks & Spencer - Cork City';
    const products = isMS ? MS_PRODUCTS : TESCO_PRODUCTS;

    if (products.length >= 4) {
      setTasks([
        { id: 'PT-301', itemName: products[0].name, assignedTo: 'Chef Skipper', status: 'Cooking', quantity: 2, priority: 'high' },
        { id: 'PT-302', itemName: products[1].name, assignedTo: 'Chef Private', status: 'Cooking', quantity: 1, priority: 'medium' },
        { id: 'PT-303', itemName: products[2].name, assignedTo: 'Kitchen Aide Rico', status: 'In Queue', quantity: 3, priority: 'low' },
        { id: 'PT-304', itemName: products[3 % products.length].name, assignedTo: 'Chef Kowalski', status: 'Prepared', quantity: 4, priority: 'high' }
      ]);
    }
  }, [selectedBranch]);

  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(initialWaste);
  const [hoursData, setHoursData] = useState<EmployeeHour[]>(initialHours);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [selectedWeekRange, setSelectedWeekRange] = useState<string>('2026-06-15 to 2026-06-21');
  const [weeklyLogsMap, setWeeklyLogsMap] = useState<Record<string, DailyOperationalLog[]>>(alternativeWeeklyLogsMap);
  const [isCapacityExpanded, setIsCapacityExpanded] = useState<boolean>(false);
  const [capacitySortBy, setCapacitySortBy] = useState<'date' | 'bottleneck'>('date');
  const [bottleneckThreshold, setBottleneckThreshold] = useState<number>(90);
  const [capacitySmoothing, setCapacitySmoothing] = useState<'raw' | 'smoothed'>('raw');

  const weeklyLogs = weeklyLogsMap[selectedWeekRange] || alternativeWeeklyLogsMap['2026-06-15 to 2026-06-21'];

  // Keep metrics in perfect alignment with selected week range and logs
  useEffect(() => {
    const sundayLog = weeklyLogs.find(l => l.day === 'Sun') || weeklyLogs[6];
    if (sundayLog) {
      setMetrics(prev => ({
        ...prev,
        salesToday: sundayLog.sales,
        wasteCost: sundayLog.waste,
        hoursScheduled: sundayLog.hours,
        productionTarget: sundayLog.productionTarget,
        productionItems: sundayLog.productionMade,
        aiHealthScore: Math.round(Math.min(100, Math.max(50, 90 + (sundayLog.productionMade / sundayLog.productionTarget) * 10 - (sundayLog.waste / sundayLog.sales) * 50)))
      }));
    }
  }, [selectedWeekRange, weeklyLogsMap]);

  // Ireland real-time Clock state (Dublin)
  const [irelandTime, setIrelandTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-IE', {
        timeZone: 'Europe/Dublin',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setIrelandTime(formatter.format(now));
    };
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Sync core metrics periodically if mock transactions run
  const totalWasteCost = wasteRecords.reduce((acc, row) => acc + row.cost, 0);
  const totalHours = hoursData.reduce((acc, row) => acc + row.scheduledHours, 0);

  // Calculative capacity metric that matches initial 78% but moves dynamically with metrics.productionItems
  const capacityPct = Math.round(Math.min((metrics.productionItems / metrics.productionTarget) * 80, 100));

  // Determine rolling 7-day predictive capacity projection based on operational rates of the selected week context
  const projectedCapacityPct = useMemo(() => {
    if (!weeklyLogs || weeklyLogs.length === 0) return capacityPct;

    const totalMade = weeklyLogs.reduce((sum, log) => sum + log.productionMade, 0);
    const totalTarget = weeklyLogs.reduce((sum, log) => sum + log.productionTarget, 0);
    const baseRate = totalTarget > 0 ? (totalMade / totalTarget) : 0.8;

    // Estimate relative trend/momentum comparing the back-half of week with front-half
    const midIdx = Math.floor(weeklyLogs.length / 2);
    const firstHalf = weeklyLogs.slice(0, midIdx);
    const secondHalf = weeklyLogs.slice(midIdx);

    const firstHalfRate = firstHalf.reduce((sum, l) => sum + (l.productionMade / (l.productionTarget || 1)), 0) / (firstHalf.length || 1);
    const secondHalfRate = secondHalf.reduce((sum, l) => sum + (l.productionMade / (l.productionTarget || 1)), 0) / (secondHalf.length || 1);

    const trendFactor = secondHalfRate / (firstHalfRate || 1);
    
    // Core predictive calculation: current baseline capacity adjusted by rolling trend momentum
    const rawProjection = Math.round(capacityPct * Math.max(0.85, Math.min(1.25, trendFactor || 1)));

    return isNaN(rawProjection) || rawProjection <= 0 
      ? Math.min(100, Math.max(0, capacityPct + 4)) 
      : Math.min(100, rawProjection);
  }, [weeklyLogs, capacityPct]);

  // Daily breakdown of 7-day projected capacity for the expandable section
  const dailyCapacityBreakdown = useMemo(() => {
    if (!weeklyLogs || weeklyLogs.length === 0) return [];
    
    const midIdx = Math.floor(weeklyLogs.length / 2);
    const firstHalf = weeklyLogs.slice(0, midIdx);
    const secondHalf = weeklyLogs.slice(midIdx);

    const firstHalfRate = firstHalf.reduce((sum, l) => sum + (l.productionMade / (l.productionTarget || 1)), 0) / (firstHalf.length || 1);
    const secondHalfRate = secondHalf.reduce((sum, l) => sum + (l.productionMade / (l.productionTarget || 1)), 0) / (secondHalf.length || 1);

    const trendFactor = secondHalfRate / (firstHalfRate || 1);

    const rawList = weeklyLogs.map(log => {
      const dailyCurrentPct = Math.round(Math.min((log.productionMade / (log.productionTarget || 1)) * 80, 100));
      const rawDailyProjection = Math.round(dailyCurrentPct * Math.max(0.85, Math.min(1.25, trendFactor || 1)));
      const dailyProjectedPct = isNaN(rawDailyProjection) || rawDailyProjection <= 0
        ? Math.min(100, Math.max(0, dailyCurrentPct + 4))
        : Math.min(100, rawDailyProjection);

      return {
        day: log.day,
        date: log.date.substring(5), // simplified 'MM-DD'
        current: dailyCurrentPct,
        projected: dailyProjectedPct
      };
    });

    if (capacitySmoothing === 'smoothed') {
      // Apply 3-day moving average centering around current index to reduce visual spikes
      return rawList.map((item, idx) => {
        const neighbors = [item];
        if (idx > 0) neighbors.push(rawList[idx - 1]);
        if (idx < rawList.length - 1) neighbors.push(rawList[idx + 1]);

        const avgCurrent = Math.round(neighbors.reduce((sum, n) => sum + n.current, 0) / neighbors.length);
        const avgProjected = Math.round(neighbors.reduce((sum, n) => sum + n.projected, 0) / neighbors.length);

        return {
          ...item,
          current: avgCurrent,
          projected: avgProjected
        };
      });
    }

    return rawList;
  }, [weeklyLogs, capacitySmoothing]);
  
  // Sorted daily capacity breakdown based on selected sort order (Chronological vs Bottleneck Intensity)
  const sortedDailyCapacityBreakdown = useMemo(() => {
    const list = [...dailyCapacityBreakdown];
    if (capacitySortBy === 'bottleneck') {
      return list.sort((a, b) => b.projected - a.projected);
    }
    return list; // 'date' is default chronological order of weeklyLogs
  }, [dailyCapacityBreakdown, capacitySortBy]);
  
  // Export Daily projected capacity as a CSV string file download
  const handleExportCapacityCSV = () => {
    if (!dailyCapacityBreakdown || dailyCapacityBreakdown.length === 0) return;
    
    const headers = ['Day', 'Date', 'Current Capacity (%)', 'Projected Capacity (%)'];
    const rows = dailyCapacityBreakdown.map(item => [
      item.day,
      item.date,
      item.current,
      item.projected
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `weekly_capacity_breakdown_${selectedWeekRange.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Daily projected capacity as a stunning, styled PDF summary document for reporting purposes
  const handleExportCapacityPDF = () => {
    if (!dailyCapacityBreakdown || dailyCapacityBreakdown.length === 0) return;

    // Initialize portrait PDF (A4 size page dimensions: 210mm x 297mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Helper color palette following the elegant Slate & Amber UI dashboard theme
    const primaryColor = [24, 24, 27]; // Dark Slate (Zinc 900)
    const accentColor = [249, 115, 22]; // Orange 500
    const lightBg = [244, 244, 245]; // Light Gray (Zinc 100)
    const alertColor = [239, 68, 68]; // Red 500
    const amberAlert = [217, 119, 6]; // Amber 600
    const textGray = [113, 113, 122]; // Zinc 500

    // --- Page Header Background Accent Banner ---
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 42, 'F');

    // Header Metadata & Typography branding
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('BAKERY OPERATIONAL CORE SUITE', 15, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text('PREDICTIVE WEEKLY CAPACITY PROJECTION REPORT', 15, 20);

    doc.setTextColor(161, 161, 170); // Zinc 400
    doc.setFontSize(8);
    doc.text(`Active Calendar Frame: ${selectedWeekRange}`, 15, 26);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-US')}`, 15, 30);

    // Dynamic watermarked badge
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(168, 10, 27, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('ANALYTICS ENGINE', 170, 13.5);

    // --- KPIs / Summary Metric Cards Banner ---
    let yPos = 52;
    
    const totalDays = dailyCapacityBreakdown.length;
    const avgProjected = Math.round(dailyCapacityBreakdown.reduce((sum, item) => sum + item.projected, 0) / totalDays);
    const maxProjectedItem = [...dailyCapacityBreakdown].sort((a, b) => b.projected - a.projected)[0];
    const bottlenecksCount = dailyCapacityBreakdown.filter(item => item.projected > bottleneckThreshold).length;

    // Background container sheet for key summaries
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(15, yPos, 180, 25, 2.5, 2.5, 'F');

    // KPI Box 1: Average Load
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('AVERAGE LOAD FACTOR', 22, yPos + 7);
    doc.setFontSize(14);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(`${avgProjected}%`, 22, yPos + 17);

    // KPI Box 2: Peak Loaded Day
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('PEAK CAPACITY LIMIT', 80, yPos + 7);
    doc.setFontSize(12.5);
    doc.setTextColor(39, 39, 42); // Zinc 800
    doc.text(`${maxProjectedItem.projected}% Load`, 80, yPos + 14.5);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(`On ${maxProjectedItem.day}`, 80, yPos + 19);

    // KPI Box 3: Bottleneck Threshold Alarms
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('THRESHOLD BOTTLENECKS', 138, yPos + 7);
    doc.setFontSize(13.5);
    if (bottlenecksCount > 0) {
      doc.setTextColor(alertColor[0], alertColor[1], alertColor[2]);
      doc.text(`${bottlenecksCount} Hot Days`, 138, yPos + 17);
    } else {
      doc.setTextColor(16, 185, 129); // Green 500
      doc.text('Stable Output (0)', 138, yPos + 17);
    }

    // --- Subtitle parameter summary line ---
    yPos += 35;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('7-DAY DAILY PREDICTED TIMELINE BREAKDOWN', 15, yPos);

    // Thin grey spacer boundary line
    doc.setDrawColor(228, 228, 231); // Zinc 200
    doc.setLineWidth(0.35);
    doc.line(15, yPos + 2, 195, yPos + 2);

    // Print metadata variables 
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(`Bottleneck Limit Trigger: ${bottleneckThreshold}%`, 15, yPos);
    doc.text(`Smoothing Mode: ${capacitySmoothing === 'smoothed' ? '3-Day Rolling Moving Average' : 'Raw Metrics (None)'}`, 72, yPos);
    doc.text(`Sequence Filter Order: ${capacitySortBy === 'bottleneck' ? 'Bottleneck Intensity' : 'Calendar Sequence'}`, 142, yPos);

    // --- Main Capacity Breakdown Table ---
    yPos += 6;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPos, 180, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('WEEKDAY', 20, yPos + 5.5);
    doc.text('DATE', 50, yPos + 5.5);
    doc.text('BASE CURRENT (%)', 85, yPos + 5.5);
    doc.text('PROJECTED LOAD (%)', 125, yPos + 5.5);
    doc.text('BOTTLENECK STATE', 165, yPos + 5.5);

    const rowHeight = 9.5;
    yPos += 8;

    sortedDailyCapacityBreakdown.forEach((item, idx) => {
      const isBottleneck = item.projected > bottleneckThreshold;

      // Alternating row highlighting background
      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, yPos, 180, rowHeight, 'F');
      }

      // Draw light wire separators
      doc.setDrawColor(244, 244, 245);
      doc.setLineWidth(0.2);
      doc.line(15, yPos + rowHeight, 195, yPos + rowHeight);

      // Value rendering block
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(item.day, 20, yPos + 6);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(82, 82, 91);
      doc.text(item.date, 50, yPos + 6);

      doc.text(`${item.current}%`, 85, yPos + 6);

      // Project highlighting styling
      doc.setFont('helvetica', 'bold');
      if (isBottleneck) {
        doc.setTextColor(amberAlert[0], amberAlert[1], amberAlert[2]);
        doc.text(`${item.projected}%`, 125, yPos + 6);
      } else {
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`${item.projected}%`, 125, yPos + 6);
      }

      // Alert cell tag
      if (isBottleneck) {
        doc.setFillColor(254, 243, 199); // Amber 100
        doc.roundedRect(162, yPos + 1.8, 28, 5.5, 0.8, 0.8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(180, 83, 9); // Amber 700
        doc.text('BOTTLENECK', 165.5, yPos + 5.6);
      } else {
        doc.setTextColor(113, 113, 122);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text('NORMAL LOAD', 165, yPos + 5.6);
      }

      yPos += rowHeight;
    });

    // --- Footer Explanatory Bullet Points & Notes ---
    yPos += 10;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('EXECUTIVE INTERPRETATION GUIDELINE', 15, yPos);

    doc.setDrawColor(228, 228, 231);
    doc.setLineWidth(0.35);
    doc.line(15, yPos + 2, 195, yPos + 2);

    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(82, 82, 91);

    const bulletins = [
      '• Capacity forecasts are computed dynamically based on the active rolling index of completed production batches versus target.',
      '• Days highlighted with yellow "BOTTLENECK" alert badges exceed your configured threshold parameter limit.',
      '• Moving average view reduces short-term variation spikes to reveal systemic weekly production limits for senior management reporting.',
      '• Report intended for staff duty scheduling, shifts optimization, and oven heating resource conservation.'
    ];

    bulletins.forEach(bullet => {
      doc.text(bullet, 15, yPos);
      yPos += 4.5;
    });

    // Ground footer copyright boundary lines
    yPos = 282;
    doc.setDrawColor(228, 228, 231);
    doc.setLineWidth(0.3);
    doc.line(15, yPos - 3, 195, yPos - 3);

    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFontSize(7);
    doc.text('Automated forecast projection report. Confidential & intended for Bakery Internal Operations.', 15, yPos);
    doc.text('Page 1 of 1', 182, yPos);

    // Trigger PDF browser-side download
    doc.save(`Capacity_Projection_Report_${selectedWeekRange.replace(/\s+/g, '_')}.pdf`);
  };

  const handleUpdateMetrics = (newMetrics: Partial<CoreMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  // Reactive State Handlers
  const handleAddOrder = (newOrder: Omit<SalesOrder, 'id' | 'timestamp'>) => {
    const timestampStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const orderId = `FP-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullOrder: SalesOrder = {
      ...newOrder,
      id: orderId,
      timestamp: timestampStr,
      branch: selectedBranch
    };

    setOrders(prev => [fullOrder, ...prev]);
    
    // Reactive Sales Metrics update
    setMetrics(prev => ({
      ...prev,
      salesToday: prev.salesToday + fullOrder.amount
    }));

    // Update the targets currentValue for Sales category
    setTargets(prev => prev.map(tgt => {
      if (tgt.category === 'Sell' && tgt.metric.includes('Sales')) {
        return { ...tgt, currentValue: tgt.currentValue + fullOrder.amount };
      }
      return tgt;
    }));
  };

  const handleAddTarget = (newTarget: Omit<CompanyTarget, 'id'>) => {
    const targetId = `T-${targets.length + 1}`;
    setTargets(prev => [...prev, { ...newTarget, id: targetId }]);
  };

  const handleAddTask = (newTask: Omit<ProductionTask, 'id'>) => {
    const taskId = `PT-${Math.floor(400 + Math.random() * 100)}`;
    setTasks(prev => [{ ...newTask, id: taskId }, ...prev]);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: ProductionTask['status']) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        // If transitioning from cooking to prepared, reactive add to cooked metrics
        if (newStatus === 'Prepared' && t.status !== 'Prepared') {
          setMetrics(m => ({
            ...m,
            productionItems: m.productionItems + t.quantity
          }));
          
          // Reactive update target cooked pcs
          setTargets(tg => tg.map(tgt => {
            if (tgt.category === 'Production' && tgt.metric.toLowerCase().includes('cook')) {
              return { ...tgt, currentValue: tgt.currentValue + t.quantity };
            }
            return tgt;
          }));
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const handleAddWaste = (newWaste: Omit<WasteRecord, 'id' | 'date'>) => {
    const wasteId = `W-${Math.floor(920 + Math.random() * 80)}`;
    const fullWaste: WasteRecord = {
      ...newWaste,
      id: wasteId,
      date: new Date().toISOString().split('T')[0]
    };

    setWasteRecords(prev => [fullWaste, ...prev]);

    // Reactive update target waste cost
    setTargets(tg => tg.map(tgt => {
      if (tgt.category === 'Waste' && tgt.metric.toLowerCase().includes('waste')) {
        return { ...tgt, currentValue: tgt.currentValue + fullWaste.cost };
      }
      return tgt;
    }));
  };

  const handleToggleClockStatus = (employeeId: string) => {
    setHoursData(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const nextStatus = emp.status === 'Clocked In' ? 'Clocked Out' : 'Clocked In';
        const addHours = nextStatus === 'Clocked Out' ? 8.0 : 0;
        return {
          ...emp,
          status: nextStatus as any,
          actualHours: parseFloat((emp.actualHours + addHours).toFixed(1))
        };
      }
      return emp;
    }));
  };

  const handleOrderRestock = (itemId: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          stockLevel: 100,
          currentQty: item.reorderLevel + 120,
          status: 'Healthy'
        };
      }
      return item;
    }));
  };

  const handleUpdateWeeklyLog = (updatedLog: DailyOperationalLog) => {
    setWeeklyLogsMap(prev => {
      const currentWeekLogs = prev[selectedWeekRange] || [];
      const updatedWeekLogs = currentWeekLogs.map(log => log.day === updatedLog.day ? updatedLog : log);
      return {
        ...prev,
        [selectedWeekRange]: updatedWeekLogs
      };
    });

    // Sync Sunday's log with active today metrics
    if (updatedLog.day === 'Sun') {
      setMetrics(prev => ({
        ...prev,
        salesToday: updatedLog.sales,
        wasteCost: updatedLog.waste,
        hoursScheduled: updatedLog.hours,
        productionTarget: updatedLog.productionTarget,
        productionItems: updatedLog.productionMade
      }));
    }
  };

  const allTabMeta = [
    { id: 'Overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'Sell', label: 'Branch Product', icon: <Coins className="w-4 h-4" /> },
    { id: 'Target', label: 'Target', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'Production', label: 'Production', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'Waste', label: 'Waste', icon: <Trash2 className="w-4 h-4" /> },
    { id: 'Hours', label: 'Hours', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'Planning', label: 'Planning', icon: <Boxes className="w-4 h-4" /> }
  ];

  const tabMeta = allTabMeta.filter(tab => rolePermissions[userRole].includes(tab.id));

  // Switch to allowed tab if role changes and active tab is hidden
  useEffect(() => {
    if (!rolePermissions[userRole].includes(activeTab)) {
      setActiveTab('Overview');
    }
  }, [userRole, activeTab]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <OverviewTab 
            metrics={metrics} 
            onNavigateTab={setActiveTab}
            targets={targets}
            userRole={userRole}
            onUpdateMetrics={handleUpdateMetrics}
            irelandTime={irelandTime}
            weeklyLogs={weeklyLogs}
            onAddOrUpdateLog={handleUpdateWeeklyLog}
            selectedWeekRange={selectedWeekRange}
            onSelectedWeekRangeChange={setSelectedWeekRange}
            orders={orders}
            selectedBranch={selectedBranch}
            theme={theme}
          />
        );
      case 'Sell': {
        const filteredOrders = orders.filter(o => !o.branch || o.branch === selectedBranch);
        return <SellTab orders={filteredOrders} onAddOrder={handleAddOrder} selectedBranch={selectedBranch} theme={theme} />;
      }
      case 'Target':
        return <TargetTab targets={targets} onAddTarget={handleAddTarget} />;
      case 'Production':
        return (
          <ProductionTab 
            recipes={recipes} 
            tasks={tasks} 
            onAddTask={handleAddTask} 
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        );
      case 'Waste':
        return (
          <WasteTab 
            wasteRecords={wasteRecords} 
            onAddWaste={handleAddWaste} 
            totalCostToday={totalWasteCost}
            selectedBranch={selectedBranch}
          />
        );
      case 'Hours':
        return (
          <HoursTab 
            hoursData={hoursData} 
            onToggleClockStatus={handleToggleClockStatus}
            totalHoursScheduled={totalHours}
          />
        );
      case 'Planning':
        return <PlanningTab inventory={inventory} onOrderRestock={handleOrderRestock} />;
      default:
        return (
          <OverviewTab 
            metrics={metrics} 
            onNavigateTab={setActiveTab} 
            targets={targets} 
            userRole={userRole}
            onUpdateMetrics={handleUpdateMetrics}
            irelandTime={irelandTime}
            weeklyLogs={weeklyLogs}
            onAddOrUpdateLog={handleUpdateWeeklyLog}
            selectedWeekRange={selectedWeekRange}
            onSelectedWeekRangeChange={setSelectedWeekRange}
            orders={orders}
            selectedBranch={selectedBranch}
          />
        );
    }
  };

  // Dynamic production system health calculation
  const lowStockCount = inventory.filter(item => item.status === 'Low').length;
  const targetDeficitCount = targets.filter(t => t.currentValue < t.targetValue * 0.7).length;
  
  let healthLabel = 'Healthy';
  let healthColorClass = 'bg-emerald-500';
  let healthTextClass = 'text-emerald-400';
  let healthBgClass = 'bg-emerald-500/10 border-emerald-550/20';

  if (metrics.aiHealthScore < 75 || lowStockCount >= 3 || targetDeficitCount >= 3) {
    healthLabel = 'Critical';
    healthColorClass = 'bg-rose-500';
    healthTextClass = 'text-rose-400';
    healthBgClass = 'bg-rose-500/10 border-rose-550/20';
  } else if (metrics.aiHealthScore < 90 || lowStockCount > 0 || targetDeficitCount > 0) {
    healthLabel = 'Warning';
    healthColorClass = 'bg-amber-500';
    healthTextClass = 'text-amber-400';
    healthBgClass = 'bg-amber-500/10 border-amber-550/20';
  }

  const healthTooltip = `System Health Status: ${healthLabel}\n• Operations Score: ${metrics.aiHealthScore}%\n• Low Stock Ingredients: ${lowStockCount}\n• Lagging Goals: ${targetDeficitCount}`;

  const isLight = theme === 'light';

  return (
    <div 
      id="app-workspace" 
      className={`min-h-screen flex flex-col md:flex-row font-sans antialiased transition-colors duration-200 ${
        isLight ? 'bg-zinc-50 text-zinc-900 selection:bg-zinc-200' : 'bg-black text-zinc-100 selection:bg-zinc-800'
      }`}
    >
      
      {/* SIDEBAR: NAVIGATION */}
      <aside className={`w-full md:w-64 flex flex-col shrink-0 border-r shadow-xl transition-colors duration-200 ${
        isLight ? 'bg-zinc-105 bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-900 text-zinc-100'
      }`}>
        {/* Brand Header */}
        <div className={`p-6 border-b flex items-center gap-3 transition-colors ${isLight ? 'border-zinc-150' : 'border-zinc-900'}`}>
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 relative group">
            <span className="font-bold text-white font-sans text-lg tracking-tighter select-none">FP</span>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${healthColorClass} rounded-full border border-black animate-pulse`} title={healthTooltip} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h1 className={`text-sm font-bold font-sans tracking-tight leading-tight truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>Food Penguin</h1>
              <span 
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold border shrink-0 cursor-help ${healthBgClass} ${healthTextClass}`}
                title={healthTooltip}
              >
                <span className={`w-1 h-1 rounded-full ${healthColorClass} animate-pulse`} />
                {healthLabel}
              </span>
            </div>
            <span className={`text-[10px] font-mono tracking-wider uppercase leading-none block mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Limited</span>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="flex-1 p-4 mt-2 space-y-1 overflow-y-auto">
          {tabMeta.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors duration-200 ${
                  isActive
                    ? isLight
                      ? 'bg-zinc-100 text-zinc-950 font-extrabold shadow-sm'
                      : 'bg-zinc-900 text-white font-bold shadow-inner'
                    : isLight
                      ? 'text-zinc-605 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                      : 'text-zinc-500 hover:bg-zinc-905 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-all duration-300 shrink-0 ${
                  isActive 
                    ? tab.id === 'Real-time' ? 'bg-rose-500 animate-pulse' : 'bg-orange-500 scale-125' 
                    : isLight ? 'bg-transparent border border-zinc-300' : 'bg-transparent border border-zinc-800'
                }`} />
                <span className="flex-1 flex items-center gap-2">
                  <span className={isActive ? 'text-orange-500' : isLight ? 'text-zinc-400' : 'text-zinc-500'}>{tab.icon}</span>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Capacity Card (matches Bento Grid illustration specs) */}
        <div className="px-4 py-3 mt-auto mb-2 hidden md:block">
          <div className={`p-4 rounded-2xl border relative overflow-hidden group transition-all duration-200 ${
            isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm' : 'bg-zinc-900 border-zinc-800 text-white'
          }`}>
            <div className={`absolute right-0 top-0 w-24 h-24 bg-gradient-to-br rounded-full filter blur-2xl pointer-events-none ${
              isLight ? 'from-orange-550/5' : 'from-orange-500/5 to-transparent'
            }`} />
            
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={() => setIsCapacityExpanded(!isCapacityExpanded)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer text-left focus:outline-none ${
                  isLight ? 'hover:text-zinc-900' : 'hover:text-white'
                }`}
                title="Click to view daily breakdown"
              >
                <p className={`text-[10px] uppercase font-mono font-bold tracking-wider select-none ${
                  isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`}>Weekly Capacity</p>
                {isCapacityExpanded ? (
                  <ChevronUp className={`w-3.5 h-3.5 transition-all transform hover:scale-110 ${isLight ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-white'}`} />
                ) : (
                  <ChevronDown className={`w-3.5 h-3.5 transition-all transform hover:scale-110 ${isLight ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-white'}`} />
                )}
              </button>
              <span className="flex items-center gap-1 text-[8px] text-orange-400 font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                Forecast AI
              </span>
            </div>

            {/* Premium, interactive, layered capacity progress bar */}
            <div className={`relative h-3 rounded-full overflow-hidden mt-3 shadow-inner ${
              isLight ? 'bg-zinc-200' : 'bg-zinc-800/80'
            }`}>
              {/* Optional dynamic striped extension for projected excess */}
              {projectedCapacityPct > capacityPct && (
                <div 
                  className="absolute left-0 top-0 h-full bg-amber-500/40 animate-pulse transition-all duration-500 ease-out"
                  style={{ 
                    width: `${projectedCapacityPct}%`,
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(245, 158, 11, 0.2) 4px, rgba(245, 158, 11, 0.2) 8px)'
                  }}
                  title={`Projected 7-day load: ${projectedCapacityPct}%`}
                />
              )}
              {/* Solid Current Capacity Bar */}
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(249,115,22,0.2)]"
                style={{ width: `${capacityPct}%` }}
                title={`Current load: ${capacityPct}%`}
              />
              
              {/* Vertical dashed line indicator to point to the projected load */}
              <div 
                className="absolute top-0 h-full w-0.5 border-r border-dashed border-white/70 z-10 transition-all duration-500 ease-out"
                style={{ left: `${projectedCapacityPct}%` }}
                title={`7-Day Projection Target: ${projectedCapacityPct}%`}
              />
            </div>

            {/* Text details and comparison metrics */}
            <div className={`space-y-1.5 mt-3 pt-2.5 border-t font-mono text-[10px] leading-relaxed ${
              isLight ? 'border-zinc-200' : 'border-zinc-800/60'
            }`}>
              <div className="flex justify-between items-center">
                <span className={`flex items-center gap-1 ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Current Load:
                </span>
                <span className={`font-bold ${isLight ? 'text-zinc-800' : 'text-white'}`}>{capacityPct}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`flex items-center gap-1 ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 7-Day Forecast:
                </span>
                <span className={`font-bold ${projectedCapacityPct >= capacityPct ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {projectedCapacityPct}% {projectedCapacityPct >= capacityPct ? '↑' : '↓'}
                </span>
              </div>
              <p className={`text-[9px] leading-normal mt-1 pt-1 italic font-sans border-t ${
                isLight ? 'border-zinc-200 text-zinc-400' : 'border-zinc-800/20 text-zinc-550'
              }`}>
                Estimated from rolling week rates & trend momentum.
              </p>
            </div>

            {/* Expandable daily capacity breakdown block */}
            {isCapacityExpanded && (
              <div className={`mt-4 pt-3.5 border-t font-mono text-[9px] space-y-3 animate-fadeIn duration-300 ${isLight ? 'border-zinc-205' : 'border-zinc-800/80'}`}>
                <div className="flex items-center justify-between">
                  <p className={`font-bold uppercase tracking-wider text-[8px] ${isLight ? 'text-zinc-500' : 'text-zinc-555'}`}>Daily Capacity Breakdown</p>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={handleExportCapacityCSV}
                      className={`p-1 px-1.5 rounded hover:text-white transition-all cursor-pointer flex items-center gap-1 border ${
                        isLight 
                          ? 'bg-zinc-100 border-zinc-250 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900' 
                          : 'bg-zinc-800 border-zinc-700/40 text-zinc-400 hover:text-white hover:bg-zinc-700'
                      }`}
                      title="Download daily capacity report as CSV"
                    >
                      <Download className="w-2.5 h-2.5 text-orange-400" />
                      <span className={`text-[7.5px] font-bold uppercase tracking-wide ${isLight ? 'text-zinc-700 hover:text-zinc-900' : 'text-zinc-300'}`}>CSV</span>
                    </button>
                    <button 
                      onClick={handleExportCapacityPDF}
                      className={`p-1 px-1.5 rounded hover:text-white transition-all cursor-pointer flex items-center gap-1 border ${
                        isLight 
                          ? 'bg-zinc-100 border-zinc-250 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900' 
                          : 'bg-zinc-800 border-zinc-700/40 text-zinc-400 hover:text-white hover:bg-zinc-700'
                      }`}
                      title="Download styled PDF projection summary report"
                    >
                      <Download className="w-2.5 h-2.5 text-amber-500" />
                      <span className={`text-[7.5px] font-bold uppercase tracking-wide ${isLight ? 'text-zinc-700 hover:text-zinc-900' : 'text-zinc-300'}`}>PDF</span>
                    </button>
                    <span className="text-[8px] text-zinc-400 font-semibold ml-1">[Current vs Proj]</span>
                  </div>
                </div>

                {/* Sort Option Sorter Selector Dropdown & Smoothing Toggle */}
                <div className={`flex flex-col gap-2 p-2.5 rounded-xl border ${
                  isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950/80 border-zinc-900/60'
                }`}>
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`text-[7.5px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Order by:</span>
                    <select
                      value={capacitySortBy}
                      onChange={(e) => setCapacitySortBy(e.target.value as 'date' | 'bottleneck')}
                      className={`text-[8.5px] rounded px-2 py-0.5 font-mono focus:outline-none cursor-pointer transition-all font-bold border ${
                        isLight 
                          ? 'bg-white border-zinc-250 text-amber-600' 
                          : 'bg-zinc-900 border-zinc-800/80 text-amber-450 hover:text-amber-300'
                      }`}
                    >
                      <option value="date" className={isLight ? 'bg-white text-zinc-900' : 'bg-zinc-950 text-white'}>📅 Date (Chronological)</option>
                      <option value="bottleneck" className={isLight ? 'bg-white text-zinc-900' : 'bg-zinc-950 text-white'}>🔥 Bottleneck Intensity</option>
                    </select>
                  </div>
                  
                  {/* Smoothing Mode Toggle */}
                  <div className={`flex items-center justify-between gap-1.5 pt-1.5 border-t ${isLight ? 'border-zinc-200' : 'border-zinc-900/60'}`}>
                    <span className={`text-[7.5px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-500 font-bold' : 'text-zinc-500'}`} title="3-Day moving average smoothing vs raw data">Data View:</span>
                    <div className={`flex rounded p-0.5 border ${isLight ? 'bg-zinc-200 border-zinc-250' : 'bg-zinc-900 border-zinc-800/80'}`}>
                      <button
                        onClick={() => setCapacitySmoothing('raw')}
                        className={`text-[8px] px-2 py-0.5 rounded font-mono font-bold transition-all uppercase ${
                          capacitySmoothing === 'raw' 
                            ? 'bg-orange-500 text-white shadow-sm' 
                            : isLight 
                              ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-300' 
                              : 'text-zinc-500 hover:text-zinc-350 hover:bg-zinc-850'
                        }`}
                      >
                        Raw
                      </button>
                      <button
                        onClick={() => setCapacitySmoothing('smoothed')}
                        className={`text-[8px] px-2 py-0.5 rounded font-mono font-bold transition-all uppercase flex items-center gap-0.5 ${
                          capacitySmoothing === 'smoothed' 
                            ? 'bg-orange-500 text-white shadow-sm' 
                            : isLight 
                              ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-300' 
                              : 'text-zinc-500 hover:text-zinc-350 hover:bg-zinc-850'
                        }`}
                        title="3-Day Moving Average Smoothed"
                      >
                        Smooth 3D
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottleneck Threshold Slider */}
                <div className={`flex flex-col gap-2 p-2.5 rounded-xl border ${
                  isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950/80 border-zinc-900/60'
                }`}>
                  <div className="flex justify-between items-center text-[7.5px] text-zinc-550 font-bold uppercase tracking-widest leading-none">
                    <span>Bottleneck Threshold</span>
                    <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      isLight 
                        ? 'bg-white border-zinc-250 text-amber-600' 
                        : 'bg-zinc-900 border-zinc-800/55 text-amber-450'
                    }`}>{bottleneckThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={bottleneckThreshold}
                    onChange={(e) => setBottleneckThreshold(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 focus:outline-none transition-all"
                    style={{ accentColor: '#f97316' }}
                  />
                  <div className="flex justify-between text-[7px] text-zinc-500 font-mono leading-none">
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="max-h-56 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                  {sortedDailyCapacityBreakdown.map((item, index) => {
                    const isBottleneck = item.projected > bottleneckThreshold;
                    const chronologicalIndex = dailyCapacityBreakdown.findIndex(d => d.day === item.day);
                    
                    // Coordinates for the 7-day sparkline (Mon -> Sun)
                    const points = dailyCapacityBreakdown.map((d, i) => {
                      const x = 2 + (i / 6) * 44;
                      const y = 12 - (d.projected / 100) * 10;
                      return `${x},${y}`;
                    });
                    const pointsString = points.join(' ');
                    
                    const activeX = 2 + (chronologicalIndex / 6) * 44;
                    const activeY = 12 - (item.projected / 100) * 10;
                    const fillPathD = `M 2,12 L ${points.join(' L ')} L 46,12 Z`;

                    return (
                      <div 
                        key={index} 
                        className={`flex flex-col gap-1.5 pb-2 last:border-0 last:pb-0 transition-all duration-300 ${
                          isLight ? 'border-zinc-200' : 'border-b border-zinc-950/40'
                        } ${
                          isBottleneck 
                            ? isLight 
                              ? 'bg-amber-50/70 border border-amber-200 p-2.5 rounded-xl my-1 text-zinc-900' 
                              : 'bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-xl my-1 shadow-[inset_0_1px_1px_rgba(245,158,11,0.05)] text-zinc-300' 
                            : 'px-1 pt-1'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] gap-2">
                          <span className={`font-sans font-bold flex items-center gap-1 flex-wrap min-w-[70px] ${isLight ? 'text-zinc-800' : 'text-zinc-350'}`}>
                            {item.day.substring(0, 3)} 
                            <span className={`text-[8px] font-normal font-mono ${isLight ? 'text-zinc-550' : 'text-zinc-500'}`}>({item.date})</span>
                            {isBottleneck && (
                              <span className="text-[7.5px] font-mono leading-none bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 py-0.5 px-1 rounded-sm font-bold uppercase tracking-wider animate-pulse inline-flex items-center gap-0.5">
                                <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" /> Hot
                              </span>
                            )}
                          </span>

                          {/* Center: Sparkline trend & differential */}
                          <div className="flex-1 flex items-center justify-center gap-1.5 px-1">
                            {/* SVG Sparkline */}
                            <div className="relative cursor-help" title="7-Day weekly projected capacity trend line (Monday to Sunday)">
                              <svg className="w-12 h-3.5 overflow-visible" viewBox="0 0 48 14">
                                <defs>
                                  <linearGradient id={`sparkline-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={isBottleneck ? '#f59e0b' : '#ea580c'} stopOpacity="0.15" stop={''} />
                                    <stop offset="100%" stopColor={isBottleneck ? '#f59e0b' : '#ea580c'} stopOpacity="0.0" stop={''} />
                                  </linearGradient>
                                </defs>
                                
                                {/* Fill underneath sparkline */}
                                <path
                                  d={fillPathD}
                                  fill={`url(#sparkline-grad-${index})`}
                                />
                                
                                {/* Base weekly line */}
                                <polyline
                                  fill="none"
                                  stroke="#3f3f46"
                                  strokeWidth="1"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  points={pointsString}
                                />
                                
                                {/* Highlight sequence up to today */}
                                <polyline
                                  fill="none"
                                  stroke={isBottleneck ? '#f59e0b' : '#ea580c'}
                                  strokeWidth="1.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  points={points.slice(0, chronologicalIndex + 1).join(' ')}
                                />
                                
                                {/* Active day pulsing dot */}
                                {isBottleneck && (
                                  <circle
                                    cx={activeX}
                                    cy={activeY}
                                    r="2.5"
                                    fill="#f59e0b"
                                    className="animate-ping opacity-75"
                                  />
                                )}
                                <circle
                                  cx={activeX}
                                  cy={activeY}
                                  r="1.5"
                                  fill={isBottleneck ? '#f59e0b' : '#ea580c'}
                                />
                              </svg>
                            </div>

                            {/* Daily trend arrow with previous day comparison */}
                            {chronologicalIndex > 0 ? (
                              (() => {
                                const prevProjected = dailyCapacityBreakdown[chronologicalIndex - 1].projected;
                                const diff = item.projected - prevProjected;
                                if (diff > 0) {
                                  return (
                                    <span className="text-emerald-500 text-[8px] font-bold font-mono tracking-tighter flex items-center" title={`Up by +${diff}% from preceding day`}>
                                      ▲{diff}%
                                    </span>
                                  );
                                } else if (diff < 0) {
                                  return (
                                    <span className="text-rose-500 text-[8px] font-bold font-mono tracking-tighter flex items-center" title={`Down by ${diff}% from preceding day`}>
                                      ▼{Math.abs(diff)}%
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="text-zinc-600 text-[8px] font-bold font-mono tracking-tighter flex items-center" title="Stable relative to preceding day">
                                      ■0%
                                    </span>
                                  );
                                }
                              })()
                            ) : (
                              <span className="text-zinc-650 text-[8px] font-bold font-mono tracking-tighter" title="First day of active week sequence">
                                •
                              </span>
                            )}
                          </div>

                          {/* Right side: capacity percentages */}
                          <div className="flex items-center gap-1 shrink-0 text-right min-w-[55px] justify-end">
                            <span className="text-zinc-500 text-[8px]" title="Current">{item.current}%</span>
                            <span className="text-zinc-600 text-[8px] select-none">→</span>
                            <span className={`font-bold text-[10px] ${isBottleneck ? 'text-amber-400 font-bold' : item.projected >= item.current ? 'text-orange-400' : 'text-orange-500/80'}`} title="Projected">
                              {item.projected}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Interactive miniature double graph bar indicator */}
                        <div className="h-1 bg-zinc-950 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-zinc-700 h-full rounded-l transition-all duration-300"
                            style={{ width: `${item.current}%` }}
                          />
                          <div 
                            className={`${isBottleneck ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-orange-600 to-orange-400'} h-full rounded-r transition-all duration-300`}
                            style={{ width: `${Math.max(0, item.projected - item.current)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info links */}
        <div className={`p-4 border-t static transition-colors duration-200 ${isLight ? 'border-zinc-200 bg-zinc-50/50' : 'border-zinc-900 bg-black/40'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-zinc-300 relative shrink-0 border ${
              isLight ? 'bg-zinc-200 border-zinc-300 text-zinc-700' : 'bg-zinc-900 border-zinc-800'
            }`}>
              <User className="w-4 h-4" />
              <span className={`w-2 h-2 rounded-full bg-orange-500 absolute -bottom-0.5 -right-0.5 border ${isLight ? 'border-zinc-100' : 'border-zinc-950'}`} />
            </div>
            <div className="text-[11px] leading-tight flex-1">
              <p className={`font-semibold ${isLight ? 'text-zinc-900 font-bold' : 'text-white'}`}>Skipper Koala</p>
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value as any)}
                className={`mt-0.5 bg-transparent font-mono text-[10px] uppercase cursor-pointer focus:outline-none appearance-none transition-colors ${
                  isLight ? 'text-zinc-500 hover:text-zinc-800 font-bold' : 'text-zinc-550 hover:text-zinc-300'
                }`}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-200 ${isLight ? 'bg-zinc-50' : 'bg-black'}`}>
        
        {/* Global Toolbar */}
        <header className={`h-16 px-6 flex items-center justify-between sticky top-0 z-30 transition-all duration-200 border-b ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900 shadow-sm' : 'bg-zinc-950 border-zinc-900 text-white shadow-md'
        }`}>
          <div className="flex items-center gap-2.5">
            <h2 className={`text-xs sm:text-sm font-sans font-bold shrink-0 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {tabMeta.find(t => t.id === activeTab)?.label || activeTab} View
            </h2>
            <span className={`hidden lg:inline-block text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold border ${
              isLight ? 'bg-zinc-100 text-zinc-650 border-zinc-200' : 'bg-zinc-900 text-zinc-400 border-zinc-850'
            }`}>
              Food chain ops portal
            </span>
            
            {/* Global Branch Selector Dropdown */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border shadow-inner transition-colors ${
              isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
            }`}>
              <span className={`text-[8px] font-bold uppercase tracking-wider font-mono shrink-0 pl-1 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Store:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value as any)}
                className="bg-transparent text-amber-500 hover:text-amber-400 font-bold text-[10px] sm:text-xs cursor-pointer focus:outline-none border-none py-0.5 pl-0.5 pr-4 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23f59e0b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:6px_6px] bg-[right_1px_center] bg-no-repeat font-sans font-bold leading-none select-none rounded focus:ring-0 active:ring-0 outline-none"
                style={{ outline: 'none' }}
              >
                <option value="Marks & Spencer - Cork City" className={`${isLight ? 'bg-white text-zinc-900' : 'bg-zinc-950 text-white'} font-bold`}>Marks & Spencer Cork City</option>
                <option value="Tesco - Cork City" className={`${isLight ? 'bg-white text-zinc-900' : 'bg-zinc-950 text-white'} font-bold`}>Tesco Cork City</option>
                <option value="Tesco - Mahon Point" className={`${isLight ? 'bg-white text-zinc-900' : 'bg-zinc-950 text-white'} font-bold`}>Tesco Mahon Point</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest block leading-none">🇮🇪 Ireland Time (Dublin)</span>
              <span className={`text-xs font-mono font-bold block mt-1 ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>
                {irelandTime || 'Updating live...'}
              </span>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
              isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
            }`}>
              <Cpu className="w-3.5 h-3.5 text-orange-500" />
              <span className={`text-[11px] font-mono font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Gemini-3 Unified Intel</span>
            </div>

            {/* Dynamic Day/Night Mode Switcher button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isLight ? 'Dark' : 'Day'} Mode`}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isLight 
                  ? 'bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200 shadow-sm' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {isLight ? <Moon className="w-4.5 h-4.5 text-zinc-600" /> : <Sun className="w-4.5 h-4.5 text-amber-400" />}
            </button>
          </div>
        </header>

        {/* Active view port rendering */}
        <main className="flex-1 p-6 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

    </div>
  );
}
