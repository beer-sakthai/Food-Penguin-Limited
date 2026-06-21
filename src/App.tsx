import { useState, useEffect, useMemo } from 'react';
import {
 initialOrders,
 initialTargets,
 initialWaste,
 initialHours,
 initialInventory,
 branchWeeklyLogsMap as seededBranchWeeklyLogsMap,
 buildCoreMetricsFromLog,
 DEFAULT_WEEK_RANGE,
 WEEK_RANGE_OPTIONS,
} from './data';
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
 DailyOperationalLog
} from './types';

// Tab Views
import OverviewTab from './components/OverviewTab';
import SellTab from './components/SellTab';
import TargetTab from './components/TargetTab';
import StudioTab from './components/StudioTab';
import ProductionTab from './components/ProductionTab';
import WasteTab from './components/WasteTab';
import HoursTab from './components/HoursTab';
import PlanningTab from './components/PlanningTab';
import CompanyKpiTab from './components/CompanyKpiTab';
import CapacityVarianceChart from './components/CapacityVarianceChart';
import DublinClock from './components/DublinClock';
import {
  BRANCHES,
  buildRecipesForBranch,
  buildTasksForBranch,
  formatBranchLabel,
  formatBranchOptionLabel,
  rolePermissions,
  type BranchName,
  type UserRole,
} from './lib/branchConfig';
import {
  buildDailyCapacityBreakdown,
  calculateProjectedCapacityPct,
  downloadCapacityCsv,
  downloadCapacityPdf,
  sortDailyCapacityBreakdown,
  type CapacityOverride,
  type CapacitySortBy,
  type CapacitySmoothing,
} from './lib/capacityReports';


// Main Icons
import {
 LayoutDashboard, Camera,
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
 Moon,
 Wand2,
 Sparkles,
 SlidersHorizontal,
 Mail,
 Clock,
 Store
} from 'lucide-react';


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
 const [userRole, setUserRole] = useState<UserRole>('Admin');
 const [selectedBranch, setSelectedBranch] = useState<BranchName>(BRANCHES[0]);
 const [metrics, setMetrics] = useState<CoreMetrics>(() => buildCoreMetricsFromLog(seededBranchWeeklyLogsMap[DEFAULT_WEEK_RANGE][BRANCHES[0]][6]));
 const [orders, setOrders] = useState<SalesOrder[]>(initialOrders);
 const [targets, setTargets] = useState<CompanyTarget[]>(initialTargets);

 const recipes = useMemo<Recipe[]>(() => buildRecipesForBranch(selectedBranch), [selectedBranch]);

 const [tasks, setTasks] = useState<ProductionTask[]>(() => buildTasksForBranch(selectedBranch));

 const handleSelectBranch = (branch: BranchName) => {
 setSelectedBranch(branch);
 setTasks(buildTasksForBranch(branch));
 };

 const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(initialWaste);
 const [hoursData, setHoursData] = useState<EmployeeHour[]>(initialHours);
 const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
 const [selectedWeekRange, setSelectedWeekRange] = useState<string>(DEFAULT_WEEK_RANGE);
 const [weeklyLogsMap, setWeeklyLogsMap] = useState<BranchOperationalWeekMap>(seededBranchWeeklyLogsMap);
 const [isCapacityExpanded, setIsCapacityExpanded] = useState<boolean>(false);
 const [capacitySortBy, setCapacitySortBy] = useState<CapacitySortBy>('date');
 const [bottleneckThreshold, setBottleneckThreshold] = useState<number>(90);
 const [capacitySmoothing, setCapacitySmoothing] = useState<CapacitySmoothing>('raw');

 // Quick Adjust simulated capacity overrides states
 const [quickAdjustEnabled, setQuickAdjustEnabled] = useState<boolean>(false);
 const [capacityOverrides, setCapacityOverrides] = useState<CapacityOverride>({});
 const [globalAdjustValue, setGlobalAdjustValue] = useState<number>(100);

 // Email report schedule states
 const [isScheduleReportModalOpen, setIsScheduleReportModalOpen] = useState<boolean>(false);
 const [reportFrequency, setReportFrequency] = useState<'daily' | 'weekly'>('weekly');
 const [reportEmailAddress, setReportEmailAddress] = useState<string>('');

 const handleToggleOverrideMode = (day: string, mode: 'ai' | 'manual', currentValue: number) => {
 setCapacityOverrides(prev => {
 const existing = prev[day];
 return {
 ...prev,
 [day]: {
 mode,
 value: existing ? existing.value : currentValue
 }
 };
 });
 };

 const handleUpdateOverrideValue = (day: string, value: number) => {
 setCapacityOverrides(prev => {
 const existing = prev[day];
 return {
 ...prev,
 [day]: {
 mode: existing ? existing.mode : 'manual',
 value
 }
 };
 });
 };

 const handleClearSingleOverride = (day: string) => {
 setCapacityOverrides(prev => {
 const next = { ...prev };
 delete next[day];
 return next;
 });
 };

 const handleResetOverrides = () => {
 setCapacityOverrides({});
 };

 const handleGlobalOverride = () => {
 if (!weeklyLogs) return;
 const newOverrides: CapacityOverride = {};
 weeklyLogs.forEach(log => {
 newOverrides[log.day] = { mode: 'manual', value: globalAdjustValue };
 });
 setCapacityOverrides(newOverrides);
 };

 const weeklyLogsByBranch = weeklyLogsMap[selectedWeekRange] || seededBranchWeeklyLogsMap[DEFAULT_WEEK_RANGE];
 const weeklyLogs = weeklyLogsByBranch[selectedBranch] || seededBranchWeeklyLogsMap[DEFAULT_WEEK_RANGE][selectedBranch];

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
 }, [weeklyLogs]);

 // Polling mechanism to simulate real-time operational database updates every 60 seconds
 useEffect(() => {
 const intervalId = setInterval(() => {
 setMetrics(prev => {
 // Slightly randomize metrics.salesToday by +/- 2%
 const percentChange = (Math.random() * 0.04 - 0.02);
 const newSalesToday = Number((prev.salesToday * (1 + percentChange)).toFixed(2));
 
 // Slightly randomize metrics.productionItems by a small integer delta (+/- 1-2 items)
 const productionDelta = Math.floor(Math.random() * 5) - 2;
 const newProductionItems = Math.max(0, prev.productionItems + productionDelta);

 // Recompute the real-time AI Health Score based on updated figures
 const newHealth = Math.round(Math.min(100, Math.max(50, 90 + (newProductionItems / (prev.productionTarget || 1)) * 10 - (prev.wasteCost / (newSalesToday || 1)) * 50)));

 return {
 ...prev,
 salesToday: newSalesToday,
 productionItems: newProductionItems,
 aiHealthScore: newHealth
 };
 });
 }, 60000);

 return () => clearInterval(intervalId);
 }, []);


 // Sync core metrics periodically if mock transactions run
 const totalWasteCost = wasteRecords.reduce((acc, row) => acc + row.cost, 0);
 const totalHours = hoursData.reduce((acc, row) => acc + row.scheduledHours, 0);

 // Calculative capacity metric that matches initial 78% but moves dynamically with metrics.productionItems
 const capacityPct = Math.round(Math.min((metrics.productionItems / metrics.productionTarget) * 80, 100));

 // Daily breakdown of 7-day projected capacity for the expandable section
 const dailyCapacityBreakdown = useMemo(() => buildDailyCapacityBreakdown({
 weeklyLogs,
 capacitySmoothing,
 quickAdjustEnabled,
 capacityOverrides
 }), [weeklyLogs, capacitySmoothing, quickAdjustEnabled, capacityOverrides]);

 // Determine rolling 7-day predictive capacity projection based on operational rates of the selected week context
 const projectedCapacityPct = useMemo(() => calculateProjectedCapacityPct({
 weeklyLogs,
 capacityPct,
 quickAdjustEnabled,
 dailyCapacityBreakdown
 }), [weeklyLogs, capacityPct, quickAdjustEnabled, dailyCapacityBreakdown]);
 
 // Sorted daily capacity breakdown based on selected sort order (Chronological vs Bottleneck Intensity)
 const sortedDailyCapacityBreakdown = useMemo(() => sortDailyCapacityBreakdown(dailyCapacityBreakdown, capacitySortBy), [dailyCapacityBreakdown, capacitySortBy]);
 
 // Export Daily projected capacity as a CSV string file download
 const handleExportCapacityCSV = () => {
 downloadCapacityCsv(dailyCapacityBreakdown, selectedWeekRange);
 };

 // Export Daily projected capacity as a styled PDF summary document for reporting purposes
 const handleExportCapacityPDF = () => {
 downloadCapacityPdf({
 dailyCapacityBreakdown,
 sortedDailyCapacityBreakdown,
 selectedWeekRange,
 bottleneckThreshold,
 capacitySmoothing,
 capacitySortBy
 });
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
 
 // Reactive update target cooked units
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
 const currentWeekByBranch = prev[selectedWeekRange] || {};
 const currentWeekLogs = currentWeekByBranch[selectedBranch] || [];
 const updatedWeekLogs = currentWeekLogs.map(log => log.day === updatedLog.day ? updatedLog : log);
 return {
 ...prev,
 [selectedWeekRange]: {
 ...currentWeekByBranch,
 [selectedBranch]: updatedWeekLogs
 }
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
 { id: 'Company KPI', label: 'Company KPI', icon: <Activity className="w-4 h-4" /> },
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
 weeklyLogs={weeklyLogs}
 onAddOrUpdateLog={handleUpdateWeeklyLog}
 selectedWeekRange={selectedWeekRange}
 onSelectedWeekRangeChange={setSelectedWeekRange}
 selectedBranch={selectedBranch}
 branchWeeklyLogsByBranch={weeklyLogsByBranch}
 theme={theme}
 />
 );
 case 'Sell': {
 const filteredOrders = orders.filter(o => !o.branch || o.branch === selectedBranch);
 return <SellTab selectedBranch={selectedBranch} theme={theme} />;
 }
 case 'Target':
 return <TargetTab targets={targets} onAddTarget={handleAddTarget} />;
 case 'Company KPI':
 return (
 <CompanyKpiTab
 branchWeeklyLogsMap={weeklyLogsMap}
 selectedWeekRange={selectedWeekRange}
 weekRangeOptions={WEEK_RANGE_OPTIONS}
 onSelectedWeekRangeChange={setSelectedWeekRange}
 targets={targets}
 theme={theme}
 onNavigateTab={setActiveTab}
 selectedBranch={selectedBranch}
 />
 );
    case 'Studio':
      return <StudioTab theme={theme} />;
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
 weeklyLogs={weeklyLogs}
 targets={targets}
 theme={theme}
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
 return <PlanningTab inventory={inventory} onOrderRestock={handleOrderRestock} selectedBranch={selectedBranch} theme={theme} weeklyLogs={weeklyLogs} />;
 default:
 return (
 <OverviewTab 
 metrics={metrics} 
 onNavigateTab={setActiveTab} 
 targets={targets} 
 userRole={userRole}
 onUpdateMetrics={handleUpdateMetrics}
 weeklyLogs={weeklyLogs}
 onAddOrUpdateLog={handleUpdateWeeklyLog}
 selectedWeekRange={selectedWeekRange}
 onSelectedWeekRangeChange={setSelectedWeekRange}
 selectedBranch={selectedBranch}
 branchWeeklyLogsByBranch={weeklyLogsByBranch}
 theme={theme}
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
 isLight ? 'bg-zinc-50 text-zinc-900 selection:bg-yellow-500/30 selection:text-yellow-900' : 'bg-black text-zinc-100 selection:bg-yellow-500/30 selection:text-yellow-100'
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


 {/* Global Branches Overview */}
 <div className={`mx-4 mt-6 p-3 rounded-2xl border transition-colors ${isLight ? 'bg-zinc-50 border-zinc-200 shadow-sm' : 'bg-zinc-900 border-zinc-800 shadow'}`}>
 <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800/80'}`}>
 <Store className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
 <span className={`text-[10px] font-mono tracking-wider uppercase font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Global Branches</span>
 </div>
 <div className="space-y-1.5 font-sans">
 {BRANCHES.map(branch => {
 const shortName = formatBranchLabel(branch);
 const isSelected = selectedBranch === branch;
 return (
 <div 
 key={branch} 
 onClick={() => handleSelectBranch(branch)}
 className={`flex justify-between items-center text-[10px] p-2 rounded-lg border cursor-pointer transition-colors ${
 isSelected 
 ? isLight ? 'bg-orange-50 border-orange-200' : 'bg-orange-500/10 border-orange-500/30'
 : isLight ? 'bg-white border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-900'
 }`}
 >
 <span className={`truncate mr-2 ${
 isSelected 
 ? isLight ? 'text-orange-700 font-bold' : 'text-orange-400 font-bold' 
 : isLight ? 'text-zinc-700 font-medium' : 'text-zinc-300 font-medium'
 }`}>
 {shortName}
 </span>
 <span className={`font-mono tracking-tight shrink-0 flex items-center gap-1.5 ${isLight ? 'text-emerald-500 font-bold' : 'text-[9px] px-2 py-0.5 rounded-full uppercase bg-3d-silver-dark metallic-base drop-shadow-md animate-pulse font-black'}`}>
                      {isLight && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>} Live
                    </span>
 </div>
 );
 })}
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
 <button 
 onClick={() => setIsScheduleReportModalOpen(true)}
 className={`p-1 px-1.5 rounded hover:text-white transition-all cursor-pointer flex items-center gap-1 border ${
 isLight 
 ? 'bg-zinc-100 border-zinc-250 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900' 
 : 'bg-zinc-800 border-zinc-700/40 text-zinc-400 hover:text-white hover:bg-zinc-700'
 }`}
 title="Schedule automated email report delivery"
 >
 <Mail className="w-2.5 h-2.5 text-rose-400" />
 <span className={`text-[7.5px] font-bold uppercase tracking-wide ${isLight ? 'text-zinc-700 hover:text-zinc-900' : 'text-zinc-300'}`}>Schedule</span>
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
 
 {/* Quick Adjust Mode Toggle */}
 <div className={`flex flex-col gap-1.5 pt-2 border-t ${isLight ? 'border-zinc-200' : 'border-zinc-900/60'}`}>
 <div className="flex items-center justify-between gap-1">
 <span className={`text-[7.5px] font-bold uppercase tracking-widest flex items-center gap-1 ${
 quickAdjustEnabled 
 ? 'text-orange-500 font-extrabold' 
 : isLight 
 ? 'text-zinc-500' 
 : 'text-zinc-550'
 }`} title="Toggle manual vs AI capacity adjustments">
 <Wand2 className={`w-3 h-3 ${quickAdjustEnabled ? 'animate-pulse text-orange-500' : ''}`} />
 Quick Adjust:
 </span>
 <button
 onClick={() => {
 setQuickAdjustEnabled(!quickAdjustEnabled);
 if (quickAdjustEnabled) {
 handleResetOverrides();
 }
 }}
 type="button"
 className={`text-[8px] font-bold px-2 py-0.5 rounded transition-all uppercase tracking-wider border cursor-pointer ${
 quickAdjustEnabled
 ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-sm'
 : isLight
 ? 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
 : 'bg-zinc-900 border-zinc-800 text-zinc-350 hover:text-white hover:bg-zinc-850'
 }`}
 >
 {quickAdjustEnabled ? 'What-If ON' : 'OFF'}
 </button>
 </div>

 {quickAdjustEnabled && (
 <div className="flex flex-col gap-1.5 pt-1.5 border-t border-dashed border-zinc-200 dark:border-zinc-800/80 mt-1">
 <div className="flex items-center justify-between">
 <span className={`text-[7px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
 Global Preset: {globalAdjustValue}%
 </span>
 {Object.keys(capacityOverrides).length > 0 && (
 <button
 onClick={handleResetOverrides}
 type="button"
 className={`text-[7px] font-mono uppercase tracking-wide font-extrabold transition-all underline decoration-dotted hover:text-amber-500 cursor-pointer ${
 isLight ? 'text-zinc-500' : 'text-zinc-400'
 }`}
 >
 Clear All
 </button>
 )}
 </div>
 <div className="flex items-center gap-2">
 <input
 type="range"
 min="10"
 max="110"
 step="5"
 value={globalAdjustValue}
 onChange={(e) => setGlobalAdjustValue(Number(e.target.value))}
 className="flex-1 h-1 bg-zinc-300 dark:bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 active:scale-[0.98] hover:-translate-y-0.5 hover:shadow transition-all duration-200"
 style={{ accentColor: '#f59e0b' }}
 />
 <button
 onClick={handleGlobalOverride}
 type="button"
 className="bg-zinc-800 hover:bg-zinc-700 text-amber-500 dark:bg-zinc-900 border border-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors rounded px-2 py-0.5 text-[8px] font-bold uppercase font-mono tracking-wider active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
 >
 Apply
 </button>
 </div>
 </div>
 )}
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
 className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 focus:outline-none transition-all active:scale-[0.98] hover:-translate-y-0.5 hover:shadow transition-all duration-200"
 style={{ accentColor: '#f97316' }}
 />
 <div className="flex justify-between text-[7px] text-zinc-500 font-mono leading-none">
 <span>50%</span>
 <span>75%</span>
 <span>100%</span>
 </div>
 </div>

 {/* Visual D3 Target vs Actual Variance performance drift Chart */}
 <div className={`p-2.5 rounded-xl border ${
 isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950/80 border-zinc-900/60'
 }`}>
 <CapacityVarianceChart weeklyLogs={weeklyLogs} isLight={isLight} />
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
 <span className={`text-[7.5px] font-mono leading-none py-0.5 px-1 rounded-sm font-bold uppercase tracking-wider animate-pulse inline-flex items-center gap-0.5 ${isLight ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-3d-copper-dark metallic-base drop-shadow-xl'}`}>
                        {isLight && <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />} Hot
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
 <stop offset="0%" stopColor={isBottleneck ? '#f59e0b' : '#ea580c'} stopOpacity="0.15" />
 <stop offset="100%" stopColor={isBottleneck ? '#f59e0b' : '#ea580c'} stopOpacity="0.0" />
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
 className={`${
 !isBottleneck 
 ? 'bg-gradient-to-r from-orange-600 to-orange-400' 
 : item.projected - bottleneckThreshold >= 15 
 ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_8px_rgba(220,38,38,0.5)]' 
 : item.projected - bottleneckThreshold >= 8 
 ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.4)]'
 : 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.3)]'
 } h-full rounded-r transition-all duration-300`}
 style={{ width: `${Math.max(0, item.projected - item.current)}%` }}
 />
 </div>

 {/* Inline What-If adjustments for specific day */}
 {quickAdjustEnabled && (
 <div className={`mt-1.5 flex flex-wrap items-center justify-between gap-1.5 p-1.5 rounded-xl border transition-all duration-200 ${
 isLight ? 'bg-zinc-50 border-zinc-200/80 shadow-inner' : 'bg-zinc-950/40 border-zinc-800/60 shadow-inner'
 }`}>
 <div className="flex border rounded-lg p-0.5 bg-zinc-900 dark:bg-zinc-950 border-zinc-800 shrink-0">
 <button
 onClick={() => handleToggleOverrideMode(item.day, 'ai', item.projected)}
 type="button"
 className={`text-[7px] px-1.5 py-0.5 rounded-md font-mono font-bold transition-all uppercase flex items-center gap-0.5 cursor-pointer ${
 (!capacityOverrides[item.day] || capacityOverrides[item.day].mode === 'ai')
 ? 'bg-amber-500 text-zinc-950 shadow-sm font-extrabold'
 : 'text-zinc-500 hover:text-zinc-200'
 }`}
 >
 <Sparkles className="w-2 h-2 shrink-0" />
 AI
 </button>
 <button
 onClick={() => handleToggleOverrideMode(item.day, 'manual', item.projected)}
 type="button"
 className={`text-[7px] px-1.5 py-0.5 rounded-md font-mono font-bold transition-all uppercase flex items-center gap-0.5 cursor-pointer ${
 (capacityOverrides[item.day]?.mode === 'manual')
 ? 'bg-orange-500 text-white shadow-sm font-extrabold'
 : 'text-zinc-500 hover:text-zinc-200'
 }`}
 >
 <SlidersHorizontal className="w-2 h-2 shrink-0" />
 SIM
 </button>
 </div>

 {capacityOverrides[item.day]?.mode === 'manual' ? (
 <div className="flex-1 flex items-center gap-1.5 justify-end">
 <button
 type="button"
 onClick={() => handleClearSingleOverride(item.day)}
 className="text-[7px] text-zinc-500 hover:text-amber-500 font-mono uppercase tracking-widest underline decoration-dotted transition-colors mr-1 cursor-pointer active:scale-[0.98] hover:-translate-y-0.5 hover:shadow transition-all duration-200"
 title="Reset to AI Forecast"
 >
 Reset AI
 </button>
 <input
 type="range"
 min="10"
 max="110"
 step="5"
 value={capacityOverrides[item.day]?.value ?? item.projected}
 onChange={(e) => handleUpdateOverrideValue(item.day, Number(e.target.value))}
 className="w-16 h-1 bg-zinc-300 dark:bg-zinc-800 rounded appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 active:scale-[0.98] hover:-translate-y-0.5 hover:shadow transition-all duration-200"
 style={{ accentColor: '#f97316' }}
 />
 <span className="font-mono text-[8px] font-bold text-orange-500 w-6 text-right shrink-0">
 {capacityOverrides[item.day]?.value}%
 </span>
 </div>
 ) : (
 <span className="text-[7px] text-zinc-400 italic font-mono uppercase tracking-wide">
 forecast active
 </span>
 )}
 </div>
 )}
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
 onChange={(e) => handleSelectBranch(e.target.value as BranchName)}
 className="bg-transparent text-amber-500 hover:text-amber-400 font-bold text-[10px] sm:text-xs cursor-pointer focus:outline-none border-none py-0.5 pl-0.5 pr-4 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23f59e0b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:6px_6px] bg-[right_1px_center] bg-no-repeat font-sans font-bold leading-none select-none rounded focus:ring-0 active:ring-0 outline-none active:scale-[0.98] hover:-translate-y-0.5 hover:shadow transition-all duration-200"
 style={{ outline: 'none' }}
 >
 {BRANCHES.map(branch => (
 <option key={branch} value={branch} className={`${isLight ? 'bg-white text-zinc-900' : 'bg-zinc-950 text-white'} font-bold`}>{formatBranchOptionLabel(branch)}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <div className="text-right hidden sm:block">
 <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest block leading-none">🇮🇪 Ireland Time (Dublin)</span>
 <span className={`text-xs font-mono font-bold block mt-1 ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>
 <DublinClock />
 </span>
 </div>

 {/* Dynamic Day/Night Mode Switcher button */}
 <button
 onClick={toggleTheme}
 title={`Switch to ${isLight ? 'Dark' : 'Day'} Mode`}
 aria-label={`Switch to ${isLight ? 'Dark' : 'Day'} Mode`}
 className={`w-9 h-9 rounded-full flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
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

 {/* Schedule Email Report Modal */}
 {isScheduleReportModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fadeIn">
 <div className={`w-full max-w-sm rounded-[1.25rem] shadow-2xl p-6 relative border animate-zoomIn ${
 isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
 }`}>
 <h3 className={`text-sm font-sans font-bold flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
 <Mail className="w-4 h-4 text-rose-500" />
 Schedule Capacity Summary PDF
 </h3>
 <p className={`text-[10px] uppercase font-mono font-bold tracking-widest mt-2 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
 Automated Report Delivery
 </p>
 
 <div className="mt-5 space-y-4">
 <div className="flex flex-col gap-1.5">
 <label className={`text-[9px] font-bold uppercase tracking-wider font-mono ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
 Delivery Frequency
 </label>
 <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-1">
 <button
 onClick={() => setReportFrequency('daily')}
 className={`flex-1 py-1.5 text-[9px] font-bold font-mono tracking-widest uppercase transition-all rounded ${
 reportFrequency === 'daily' 
 ? 'bg-rose-500 text-white shadow' 
 : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
 }`}
 >
 Daily
 </button>
 <button
 onClick={() => setReportFrequency('weekly')}
 className={`flex-1 py-1.5 text-[9px] font-bold font-mono tracking-widest uppercase transition-all rounded ${
 reportFrequency === 'weekly' 
 ? 'bg-rose-500 text-white shadow' 
 : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
 }`}
 >
 Weekly
 </button>
 </div>
 </div>
 <div className="flex flex-col gap-1.5">
 <label className={`text-[9px] font-bold uppercase tracking-wider font-mono flex gap-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
 Target Email Address
 <span className="text-rose-500">*</span>
 </label>
 <input
 type="email"
 placeholder="ops.reports@company.com"
 value={reportEmailAddress}
 onChange={(e) => setReportEmailAddress(e.target.value)}
 className={`w-full px-3 py-2 text-xs font-mono rounded border outline-none focus:border-yellow-500 transition-colors ${
 isLight ? 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400' : 'bg-black border-zinc-800 text-white placeholder:text-zinc-600'
 }`}
 />
 </div>
 </div>

 <div className="flex items-center gap-2 mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
 <button
 onClick={() => setIsScheduleReportModalOpen(false)}
 className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider font-mono rounded transition-colors ${
 isLight ? 'text-zinc-600 hover:bg-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
 }`}
 >
 Cancel
 </button>
 <button
 onClick={() => {
 if (reportEmailAddress) {
 setIsScheduleReportModalOpen(false);
 // Add some dummy action like clearing the input
 setTimeout(() => {
 setReportEmailAddress('');
 }, 300);
 }
 }}
 disabled={!reportEmailAddress}
 className="flex-[2] py-2 text-[10px] font-bold uppercase tracking-wider font-mono rounded bg-rose-500 text-white hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5"
 >
 <Clock className="w-3 h-3" />
 Activate Schedule
 </button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
}
