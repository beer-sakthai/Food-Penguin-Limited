import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  FileSpreadsheet, 
  Search, 
  Calendar, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  ChefHat, 
  Trash2, 
  CalendarDays, 
  Boxes,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  SalesOrder, 
  CompanyTarget, 
  ProductionTask, 
  WasteRecord, 
  EmployeeHour, 
  InventoryItem, 
  RealtimeAlert, 
  DailyOperationalLog 
} from '../types';

interface ReportsTabProps {
  theme: 'dark' | 'light';
  orders: SalesOrder[];
  targets: CompanyTarget[];
  tasks: ProductionTask[];
  wasteRecords: WasteRecord[];
  hoursData: EmployeeHour[];
  inventory: InventoryItem[];
  weeklyLogs: DailyOperationalLog[];
  alerts: RealtimeAlert[];
}

type ReportSection = 'Sell' | 'Target' | 'Production' | 'Waste' | 'Hours' | 'Planning' | 'Real-time';

export default function ReportsTab({
  theme,
  orders,
  targets,
  tasks,
  wasteRecords,
  hoursData,
  inventory,
  weeklyLogs,
  alerts
}: ReportsTabProps) {
  const isLight = theme === 'light';

  // State managers
  const [activeSection, setActiveSection] = useState<ReportSection>('Sell');
  const [startDate, setStartDate] = useState<string>('2026-06-15');
  const [endDate, setEndDate] = useState<string>('2026-06-28');
  
  // Section-specific sub-filters
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [targetCategoryFilter, setTargetCategoryFilter] = useState<string>('All');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('All');
  const [wasteReasonFilter, setWasteReasonFilter] = useState<string>('All');
  const [hoursRoleFilter, setHoursRoleFilter] = useState<string>('All');
  const [planningSupplierFilter, setPlanningSupplierFilter] = useState<string>('All');
  const [alertStatusFilter, setAlertStatusFilter] = useState<string>('All');

  // AI advisory state
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Helper: check if a date string falls within the range inclusive
  const isWithinRange = (dateStr: string | undefined): boolean => {
    if (!dateStr) return false;
    return dateStr >= startDate && dateStr <= endDate;
  };

  // 1. Sell Report Data
  const sellData = useMemo(() => {
    return orders.filter(item => {
      const matchDate = isWithinRange(item.date || '2026-06-28');
      const matchBranch = branchFilter === 'All' || item.branch === branchFilter;
      return matchDate && matchBranch;
    });
  }, [orders, startDate, endDate, branchFilter]);

  // 2. Target Report Data
  const targetData = useMemo(() => {
    return targets.filter(item => {
      const matchDate = isWithinRange(item.date || '2026-06-28');
      const matchCategory = targetCategoryFilter === 'All' || item.category === targetCategoryFilter;
      return matchDate && matchCategory;
    });
  }, [targets, startDate, endDate, targetCategoryFilter]);

  // 3. Production Report Data
  const productionData = useMemo(() => {
    return tasks.filter(item => {
      const matchDate = isWithinRange(item.date || '2026-06-28');
      const matchPriority = taskPriorityFilter === 'All' || item.priority === taskPriorityFilter.toLowerCase();
      return matchDate && matchPriority;
    });
  }, [tasks, startDate, endDate, taskPriorityFilter]);

  // 4. Waste Report Data
  const wasteData = useMemo(() => {
    return wasteRecords.filter(item => {
      const matchDate = isWithinRange(item.date);
      const matchReason = wasteReasonFilter === 'All' || item.reason === wasteReasonFilter;
      return matchDate && matchReason;
    });
  }, [wasteRecords, startDate, endDate, wasteReasonFilter]);

  // 5. Hours Report Data
  const hoursReportData = useMemo(() => {
    return hoursData.filter(item => {
      const matchDate = isWithinRange(item.date || '2026-06-28');
      const matchRole = hoursRoleFilter === 'All' || item.role.includes(hoursRoleFilter);
      return matchDate && matchRole;
    });
  }, [hoursData, startDate, endDate, hoursRoleFilter]);

  // 6. Planning Report Data (Weekly operational log days)
  const planningData = useMemo(() => {
    return weeklyLogs.filter(item => {
      const matchDate = isWithinRange(item.date);
      const matchSupplier = planningSupplierFilter === 'All' || item.supplierName === planningSupplierFilter;
      return matchDate && matchSupplier;
    });
  }, [weeklyLogs, startDate, endDate, planningSupplierFilter]);

  // 7. Real-time Report Data (Alert logs)
  const realtimeReportData = useMemo(() => {
    return alerts.filter(item => {
      const matchDate = isWithinRange(item.date || '2026-06-28');
      const matchStatus = alertStatusFilter === 'All' || item.status === alertStatusFilter.toLowerCase();
      return matchDate && matchStatus;
    });
  }, [alerts, startDate, endDate, alertStatusFilter]);

  // Dynamic values depending on active tab
  const activeReportDetails = useMemo(() => {
    switch (activeSection) {
      case 'Sell':
        const totalSales = sellData.reduce((acc, curr) => acc + curr.amount, 0);
        const totalQty = sellData.reduce((acc, curr) => acc + curr.quantity, 0);
        return {
          count: sellData.length,
          metrics: [
            { label: 'Filtered Sales Count', value: sellData.length },
            { label: 'Total Sales Revenue', value: `€${totalSales.toFixed(2)}` },
            { label: 'Total Quantity Shipped', value: `${totalQty} units` }
          ],
          headers: ['Order ID', 'Timestamp', 'Date', 'Item', 'Category', 'Quantity', 'Amount', 'Barcode', 'Status', 'Branch'],
          rows: sellData.map(o => [
            o.id, o.timestamp, o.date || '2026-06-28', o.item, o.category, o.quantity.toString(), `€${o.amount.toFixed(2)}`, o.barcode || 'N/A', o.status, o.branch || 'N/A'
          ])
        };
      case 'Target':
        const achieved = targetData.filter(t => t.currentValue >= t.targetValue).length;
        return {
          count: targetData.length,
          metrics: [
            { label: 'Total Goals Monitored', value: targetData.length },
            { label: 'Goals Achieved', value: `${achieved} of ${targetData.length}` },
            { label: 'Completion Rate', value: `${targetData.length ? Math.round((achieved / targetData.length) * 100) : 0}%` }
          ],
          headers: ['Target ID', 'Goal Name', 'Metric Name', 'Target Value', 'Current Value', 'Unit', 'Category', 'Deadline', 'Date'],
          rows: targetData.map(t => [
            t.id, t.name, t.metric, t.targetValue.toString(), t.currentValue.toString(), t.unit, t.category, t.deadline, t.date || '2026-06-28'
          ])
        };
      case 'Production':
        const totalItems = productionData.reduce((acc, curr) => acc + curr.quantity, 0);
        const cookingCount = productionData.filter(t => t.status === 'Cooking').length;
        return {
          count: productionData.length,
          metrics: [
            { label: 'Production Tasks', value: productionData.length },
            { label: 'Total Units Produced', value: `${totalItems} units` },
            { label: 'Active In Kitchen', value: `${cookingCount} tasks` }
          ],
          headers: ['Task ID', 'Item Name', 'Assigned Chef', 'Status', 'Quantity', 'Priority', 'Date'],
          rows: productionData.map(p => [
            p.id, p.itemName, p.assignedTo, p.status, p.quantity.toString(), p.priority, p.date || '2026-06-28'
          ])
        };
      case 'Waste':
        const totalWasteWeight = wasteData.reduce((acc, curr) => acc + curr.weight, 0);
        const totalWasteCost = wasteData.reduce((acc, curr) => acc + curr.cost, 0);
        return {
          count: wasteData.length,
          metrics: [
            { label: 'Waste Logs Count', value: wasteData.length },
            { label: 'Total Weight Trashed', value: `${totalWasteWeight.toFixed(1)} kg` },
            { label: 'Financial Loss (COGS)', value: `€${totalWasteCost.toFixed(2)}` }
          ],
          headers: ['Record ID', 'Ingredient/Item', 'Category', 'Weight (kg)', 'Financial Cost', 'Reason For Waste', 'Date'],
          rows: wasteData.map(w => [
            w.id, w.item, w.category, `${w.weight} kg`, `€${w.cost.toFixed(2)}`, w.reason, w.date
          ])
        };
      case 'Hours':
        const totalSched = hoursReportData.reduce((acc, curr) => acc + curr.scheduledHours, 0);
        const totalActual = hoursReportData.reduce((acc, curr) => acc + curr.actualHours, 0);
        const overtime = hoursReportData.reduce((acc, curr) => acc + Math.max(0, curr.actualHours - curr.scheduledHours), 0);
        return {
          count: hoursReportData.length,
          metrics: [
            { label: 'Logged Roster Staff', value: hoursReportData.length },
            { label: 'Total Roster Scheduled', value: `${totalSched} hrs` },
            { label: 'Total Actual Hours', value: `${totalActual} hrs` },
            { label: 'Calculated Overtime', value: `${overtime.toFixed(1)} hrs` }
          ],
          headers: ['Staff ID', 'Employee Name', 'Role', 'Status', 'Scheduled Hours', 'Actual Hours', 'Shift Start', 'Shift End', 'Date'],
          rows: hoursReportData.map(h => [
            h.id, h.name, h.role, h.status, h.scheduledHours.toString(), h.actualHours.toString(), h.shiftStart, h.shiftEnd, h.date || '2026-06-28'
          ])
        };
      case 'Planning':
        const totalLogsSales = planningData.reduce((acc, curr) => acc + curr.sales, 0);
        const totalLogsWaste = planningData.reduce((acc, curr) => acc + curr.waste, 0);
        const avgCogs = planningData.reduce((acc, curr) => {
          const cogsSum = Object.values(curr.cogs).reduce((a, b) => (a as number) + (b as number), 0);
          return acc + cogsSum;
        }, 0);
        return {
          count: planningData.length,
          metrics: [
            { label: 'Daily Logs Count', value: planningData.length },
            { label: 'Accumulated Sales Forecast', value: `€${totalLogsSales.toLocaleString()}` },
            { label: 'Accumulated Waste Target', value: `€${totalLogsWaste.toLocaleString()}` },
            { label: 'Calculated Supplier COGS', value: `€${avgCogs.toLocaleString()}` }
          ],
          headers: ['Day', 'Calendar Date', 'Sales Revenue', 'Waste Expense', 'Rostered Hours', 'Production Goal', 'Production Made', 'Primary Supplier', 'Tazaki COGS', 'Sysco COGS', 'Bulza COGS', 'Sticker COGS', 'Others COGS'],
          rows: planningData.map(l => [
            l.day, l.date, `€${l.sales}`, `€${l.waste}`, `${l.hours} hrs`, l.productionTarget.toString(), l.productionMade.toString(), l.supplierName, `€${l.cogs.tazaki}`, `€${l.cogs.sysco}`, `€${l.cogs.bulza}`, `€${l.cogs.sticker}`, `€${l.cogs.others}`
          ])
        };
      case 'Real-time':
        const criticalCount = realtimeReportData.filter(a => a.status === 'critical').length;
        const warningCount = realtimeReportData.filter(a => a.status === 'warning').length;
        return {
          count: realtimeReportData.length,
          metrics: [
            { label: 'Telemetry Alerts Captured', value: realtimeReportData.length },
            { label: 'Critical Incident Count', value: criticalCount },
            { label: 'Warning Anomalies', value: warningCount }
          ],
          headers: ['Alert ID', 'Incident Time', 'Calendar Date', 'Hardware Sensor', 'Trigger Value', 'Severity Status', 'Anomalous Message'],
          rows: realtimeReportData.map(a => [
            a.id, a.timestamp, a.date || '2026-06-28', a.sensor, a.value, a.status, a.message
          ])
        };
    }
  }, [
    activeSection, 
    sellData, 
    targetData, 
    productionData, 
    wasteData, 
    hoursReportData, 
    planningData, 
    realtimeReportData
  ]);

  // Export to CSV triggered locally
  const handleExportCSV = () => {
    const { headers, rows } = activeReportDetails;
    const filename = `FP_${activeSection}_Report_${startDate}_to_${endDate}`;
    
    // Client-side secure CSV generator
    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Consult Jules strategic advisor insights
  const handleConsultJules = async () => {
    setIsAiLoading(true);
    setAiInsight('');
    
    // Format a high-precision summary of the filtered report data for Jules
    const statsSummary = activeReportDetails.metrics.map(m => `• ${m.label}: ${m.value}`).join('\n');
    const prompt = `As Jules (Google AI Chief Strategy Officer), perform an executive margin-recovery audit and cost reduction analysis on the following filtered "${activeSection}" operational report for Food Penguin Limited.

Operational Window: ${startDate} to ${endDate}
Active Report Metrics Summary:
${statsSummary}

Please analyze this dataset specifically targeting margin leaks, labor waste, food trim waste, and energy usage patterns. Recommend 3 highly-actionable, mathematically-grounded operational tweaks to maximize net profits, lower logistics overhead, and ensure deep ESG-compliant waste reduction. Format in extremely polished, concise Markdown with bold headers and bullet points.`;

    try {
      const res = await fetch('/api/gemini/strategic-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.error) {
        setAiInsight(`Audit incomplete: ${data.error}`);
      } else {
        setAiInsight(data.text);
      }
    } catch (err: any) {
      setAiInsight(`Error fetching strategic insight: ${err.message || err}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Section details mapping for UI icons
  const sectionsList: { id: ReportSection; label: string; icon: any; color: string }[] = [
    { id: 'Sell', label: 'Sell / Product', icon: Coins, color: 'text-amber-500 bg-amber-500/10' },
    { id: 'Target', label: 'Targets Log', icon: ClipboardCheckIcon, color: 'text-sky-500 bg-sky-500/10' },
    { id: 'Production', label: 'Production Queue', icon: ChefHat, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'Waste', label: 'Food Waste', icon: Trash2, color: 'text-rose-500 bg-rose-500/10' },
    { id: 'Hours', label: 'Staff Hours', icon: CalendarDays, color: 'text-violet-500 bg-violet-500/10' },
    { id: 'Planning', label: 'Daily Planning', icon: Boxes, color: 'text-indigo-500 bg-indigo-500/10' },
    { id: 'Real-time', label: 'Sensor Alerts', icon: Activity, color: 'text-orange-500 bg-orange-500/10' },
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden gap-6">
      {/* HEADER SECTION */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${isLight ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-yellow-950/30 border-yellow-900/40 text-yellow-400'}`}>
              <FileSpreadsheet className="w-6 h-6" id="reports-hub-logo-icon" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight font-sans ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Reporting & Export Hub
              </h1>
              <p className={`text-sm ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Filter, preview, and extract CSV reports for all kitchen departments
              </p>
            </div>
          </div>
        </div>

        {/* QUICK CSV BULK EXPORT TRIG */}
        <button
          onClick={handleExportCSV}
          disabled={activeReportDetails.count === 0}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.98] ${
            activeReportDetails.count === 0 
              ? 'opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500 border border-zinc-700'
              : isLight 
                ? 'bg-yellow-500 text-zinc-950 hover:bg-yellow-400 border border-yellow-300' 
                : 'bg-yellow-500 text-zinc-950 hover:bg-yellow-400 border border-yellow-600'
          }`}
          id="reports-hub-csv-download-button"
        >
          <Download className="w-4 h-4" />
          Export {activeSection} CSV ({activeReportDetails.count})
        </button>
      </div>

      {/* SEARCH AND CONTROLS CARD */}
      <div className={`shrink-0 rounded-2xl border p-5 transition-all shadow-sm ${
        isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800 text-white'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-end">
          
          {/* SECTION RANGE CONTROLLER */}
          <div className="space-y-2 lg:col-span-1">
            <label className={`text-xs font-semibold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Operational Department
            </label>
            <div className="relative">
              <select className="input-gold-glow"
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value as ReportSection)}
                className={`w-full text-xs rounded-xl p-2.5 border transition-all duration-200 bg-transparent ${
                  isLight 
                    ? 'border-zinc-300 text-zinc-800 hover:border-zinc-400' 
                    : 'border-zinc-700 text-zinc-100 hover:border-zinc-600'
                } focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none focus:shadow-[0_0_10px_rgba(234,179,8,0.3)]`}
                id="reports-hub-department-selector"
              >
                {sectionsList.map(s => (
                  <option key={s.id} value={s.id} className={isLight ? 'text-zinc-900' : 'text-black'}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DATE START */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              <Calendar className="w-3.5 h-3.5" /> Start Date
            </label>
            <input className="input-gold-glow"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full text-xs rounded-xl p-2.5 border transition-all bg-transparent ${
                isLight ? 'border-zinc-300 text-zinc-800' : 'border-zinc-700 text-zinc-100'
              } focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none focus:shadow-[0_0_10px_rgba(234,179,8,0.3)]`}
              id="reports-hub-start-date"
            />
          </div>

          {/* DATE END */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              <Calendar className="w-3.5 h-3.5" /> End Date
            </label>
            <input className="input-gold-glow"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full text-xs rounded-xl p-2.5 border transition-all bg-transparent ${
                isLight ? 'border-zinc-300 text-zinc-800' : 'border-zinc-700 text-zinc-100'
              } focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none focus:shadow-[0_0_10px_rgba(234,179,8,0.3)]`}
              id="reports-hub-end-date"
            />
          </div>

          {/* DYNAMIC SECTION-SPECIFIC SUB-FILTER */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Department Sub-filter
            </label>
            
            {activeSection === 'Sell' && (
              <select className="input-gold-glow"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 border transition-all bg-transparent ${
                  isLight ? 'border-zinc-300 text-zinc-800' : 'border-zinc-700 text-zinc-100'
                } focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none focus:shadow-[0_0_10px_rgba(234,179,8,0.3)]`}
                id="reports-sell-branch-filter"
              >
                <option value="All" className={isLight ? 'text-zinc-900' : 'text-black'}>All Branches</option>
                <option value="Marks & Spencer - Cork City" className={isLight ? 'text-zinc-900' : 'text-black'}>M&S Cork City</option>
                <option value="Tesco - Cork City" className={isLight ? 'text-zinc-900' : 'text-black'}>Tesco Cork City</option>
                <option value="Tesco - Mahon Point" className={isLight ? 'text-zinc-900' : 'text-black'}>Tesco Mahon Point</option>
              </select>
            )}

            {activeSection === 'Target' && (
              <select className="input-gold-glow"
                value={targetCategoryFilter}
                onChange={(e) => setTargetCategoryFilter(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 border transition-all bg-transparent ${
                  isLight ? 'border-zinc-300 text-zinc-800' : 'border-zinc-700 text-zinc-100'
                } focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none focus:shadow-[0_0_10px_rgba(234,179,8,0.3)]`}
                id="reports-target-category-filter"
              >
                <option value="All" className={isLight ? 'text-zinc-900' : 'text-black'}>All Categories</option>
                <option value="Sell" className={isLight ? 'text-zinc-900' : 'text-black'}>Sell</option>
                <option value="Production" className={isLight ? 'text-zinc-900' : 'text-black'}>Production</option>
                <option value="Waste" className={isLight ? 'text-zinc-900' : 'text-black'}>Waste</option>
                <option value="Hours" className={isLight ? 'text-zinc-900' : 'text-black'}>Hours</option>
              </select>
            )}

            {activeSection === 'Production' && (
              <select className="input-gold-glow"
                value={taskPriorityFilter}
                onChange={(e) => setTaskPriorityFilter(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 border transition-all bg-transparent ${
                  isLight ? 'border-zinc-300 text-zinc-800' : 'border-zinc-700 text-zinc-100'
                } focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none focus:shadow-[0_0_10px_rgba(234,179,8,0.3)]`}
                id="reports-production-priority-filter"
              >
                <option value="All" className={isLight ? 'text-zinc-900' : 'text-black'}>All Priorities</option>
                <option value="Low" className={isLight ? 'text-zinc-900' : 'text-black'}>Low</option>
                <option value="Medium" className={isLight ? 'text-zinc-900' : 'text-black'}>Medium</option>
                <option value="High" className={isLight ? 'text-zinc-900' : 'text-black'}>High</option>
              </select>
            )}

            {activeSection === 'Waste' && (
              <select className="input-gold-glow"
                value={wasteReasonFilter}
                onChange={(e) => setWasteReasonFilter(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 border transition-all bg-transparent ${
                  isLight ? 'border-zinc-300 text-zinc-800' : 'border-zinc-700 text-zinc-100'
                } focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none focus:shadow-[0_0_10px_rgba(234,179,8,0.3)]`}
                id="reports-waste-reason-filter"
              >
                <option value="All" className={isLight ? 'text-zinc-900' : 'text-black'}>All Reasons</option>
                <option value="Expired" className={isLight ? 'text-zinc-900' : 'text-black'}>Expired</option>
                <option value="Overproduced" className={isLight ? 'text-zinc-900' : 'text-black'}>Overproduced</option>
                <option value="Quality Issue" className={isLight ? 'text-zinc-900' : 'text-black'}>Quality Issue</option>
                <option value="Spill/Accident" className={isLight ? 'text-zinc-900' : 'text-black'}>Spill/Accident</option>
              </select>
            )}

            {activeSection === 'Hours' && (
              <select className="input-gold-glow"
                value={hoursRoleFilter}
                onChange={(e) => setHoursRoleFilter(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 border transition-all bg-transparent ${
                  isLight ? 'border-zinc-300 text-zinc-800' : 'border-zinc-700 text-zinc-100'
                } focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none focus:shadow-[0_0_10px_rgba(234,179,8,0.3)]`}
                id="reports-hours-role-filter"
              >
                <option value="All" className={isLight ? 'text-zinc-900' : 'text-black'}>All Roles</option>
                <option value="Chef" className={isLight ? 'text-zinc-900' : 'text-black'}>Chef</option>
                <option value="Prep" className={isLight ? 'text-zinc-900' : 'text-black'}>Prep / Kitchen Aide</option>
                <option value="Manager" className={isLight ? 'text-zinc-900' : 'text-black'}>Manager</option>
                <option value="Logistics" className={isLight ? 'text-zinc-900' : 'text-black'}>Logistics Lead</option>
              </select>
            )}

            {activeSection === 'Planning' && (
              <select className="input-gold-glow"
                value={planningSupplierFilter}
                onChange={(e) => setPlanningSupplierFilter(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 border transition-all bg-transparent ${
                  isLight ? 'border-zinc-300 text-zinc-800' : 'border-zinc-700 text-zinc-100'
                } focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none focus:shadow-[0_0_10px_rgba(234,179,8,0.3)]`}
                id="reports-planning-supplier-filter"
              >
                <option value="All" className={isLight ? 'text-zinc-900' : 'text-black'}>All Suppliers</option>
                <option value="Tazaki" className={isLight ? 'text-zinc-900' : 'text-black'}>Tazaki</option>
                <option value="Sysco" className={isLight ? 'text-zinc-900' : 'text-black'}>Sysco</option>
                <option value="Bulza" className={isLight ? 'text-zinc-900' : 'text-black'}>Bulza</option>
                <option value="Sticker" className={isLight ? 'text-zinc-900' : 'text-black'}>Sticker</option>
                <option value="Others" className={isLight ? 'text-zinc-900' : 'text-black'}>Others</option>
              </select>
            )}

            {activeSection === 'Real-time' && (
              <select className="input-gold-glow"
                value={alertStatusFilter}
                onChange={(e) => setAlertStatusFilter(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 border transition-all bg-transparent ${
                  isLight ? 'border-zinc-300 text-zinc-800' : 'border-zinc-700 text-zinc-100'
                } focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none focus:shadow-[0_0_10px_rgba(234,179,8,0.3)]`}
                id="reports-realtime-status-filter"
              >
                <option value="All" className={isLight ? 'text-zinc-900' : 'text-black'}>All Severities</option>
                <option value="Normal" className={isLight ? 'text-zinc-900' : 'text-black'}>Normal</option>
                <option value="Warning" className={isLight ? 'text-zinc-900' : 'text-black'}>Warning</option>
                <option value="Critical" className={isLight ? 'text-zinc-900' : 'text-black'}>Critical</option>
              </select>
            )}
          </div>

        </div>
      </div>

      {/* THREE-CARD STAT PREVIEW WITH ENTRY ANIMATIONS */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {activeReportDetails.metrics.map((metric, idx) => (
            <motion.div
              key={`${activeSection}-${metric.label}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 ${
                isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {metric.label}
              </span>
              <span className={`text-3xl font-mono font-black mt-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                {metric.value}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* DATA PREVIEW TABLE & JULES CONSULTING */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">

        {/* DATA PREVIEW TABLE CARD */}
        <div className={`lg:col-span-2 rounded-2xl border p-5 overflow-hidden flex flex-col min-h-0 ${
          isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="shrink-0 pb-4 flex items-center justify-between border-b border-zinc-800/20 mb-4">
            <div>
              <h2 className={`text-base font-semibold ${isLight ? 'text-zinc-800' : 'text-white'}`}>
                {activeSection} Report Preview
              </h2>
              <p className="text-xs text-zinc-500">
                Displaying first {Math.min(50, activeReportDetails.count)} rows within custom range
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              activeReportDetails.count > 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
            }`}>
              {activeReportDetails.count} records
            </span>
          </div>

          <div className="overflow-x-auto overflow-y-auto rounded-xl border border-zinc-800/10 flex-1 min-h-0">
            <table className="w-full text-xs text-left">
              <thead className={`text-xs font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-zinc-800/25 ${
                isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-950 text-zinc-400'
              }`}>
                <tr>
                  {activeReportDetails.headers.map((h, i) => (
                    <th key={i} className="p-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y divide-zinc-800/10 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                {activeReportDetails.count === 0 ? (
                  <tr>
                    <td colSpan={activeReportDetails.headers.length} className="p-10 text-center text-zinc-500 font-mono">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                        No operational records fall inside the filtered criteria.
                      </div>
                    </td>
                  </tr>
                ) : (
                  activeReportDetails.rows.slice(0, 50).map((row, rIdx) => (
                    <tr key={rIdx} className={`hover:bg-yellow-500/5 transition-all duration-150`}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3 font-mono whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* JULES (GOOGLE AI) CONSULTING AUDITOR */}
        <div className={`rounded-2xl border p-5 flex flex-col justify-between relative overflow-hidden min-h-0 ${
          isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800 text-white'
        }`}>
          {/* Decorative glowing gradient */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full filter blur-xl pointer-events-none" />
          
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-yellow-500 rounded-lg flex items-center justify-center text-zinc-950 font-bold text-xs shadow-md">
                J
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isLight ? 'text-zinc-800' : 'text-white'}`}>
                  Consult Jules (Google AI)
                </h3>
                <p className="text-xs text-zinc-500">Executive Advisor & Margin Specialist</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-xs leading-relaxed max-h-72 overflow-y-auto ${
              isLight ? 'bg-yellow-50/50 border-yellow-200/50 text-zinc-700' : 'bg-yellow-950/10 border-yellow-900/20 text-zinc-300'
            }`}>
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-5 h-5 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                  <span className="text-xs font-mono text-yellow-500 animate-pulse uppercase font-bold tracking-wider">
                    Jules is auditing report...
                  </span>
                </div>
              ) : aiInsight ? (
                <div className="prose prose-sm prose-invert text-xs space-y-2 whitespace-pre-line font-sans">
                  {aiInsight}
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-500 space-y-2">
                  <Sparkles className="w-6 h-6 mx-auto text-yellow-500/40 animate-pulse" />
                  <p>Request Jules to perform a strategic margin-leak check, waste audit, or shift optimization analysis on the current report data.</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleConsultJules}
            disabled={isAiLoading || activeReportDetails.count === 0}
            className={`w-full mt-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-[0.98] ${
              activeReportDetails.count === 0
                ? 'opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500 border border-zinc-700'
                : isLight
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-2 focus:ring-yellow-500'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-zinc-950 focus:ring-2 focus:ring-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.3)]'
            }`}
            id="reports-hub-ai-audit-button"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Audit Operational Report
          </button>
        </div>

      </div>
    </div>
  );
}

// Custom internal sub-component to safely map icon helper
function ClipboardCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}
