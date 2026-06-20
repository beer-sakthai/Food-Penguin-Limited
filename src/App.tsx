import { useState, useEffect } from 'react';
import { initialBranchesData, BRANCHES } from './data';
import {
  BranchId,
  BranchData,
  CoreMetrics,
  SalesOrder,
  CompanyTarget,
  ProductionTask,
  WasteRecord
} from './types';

// Tab Views
import OverviewTab from './components/OverviewTab';
import SellTab from './components/SellTab';
import TargetTab from './components/TargetTab';
import ProductionTab from './components/ProductionTab';
import WasteTab from './components/WasteTab';
import HoursTab from './components/HoursTab';
import PlanningTab from './components/PlanningTab';
import DataInputTab from './components/DataInputTab';
import KPITab from './components/KPITab';

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
  Sun,
  Moon,
  BarChart4
} from 'lucide-react';

const rolePermissions: Record<'Admin' | 'Manager' | 'Staff', string[]> = {
  Admin: ['Overview', 'Sell', 'Target', 'Production', 'Waste', 'Hours', 'Planning', 'Data Input', 'KPI Business'],
  Manager: ['Overview', 'Target', 'Production', 'Waste', 'Hours', 'Planning', 'Data Input', 'KPI Business'],
  Staff: ['Overview', 'Sell', 'Production', 'Waste', 'Data Input']
};

export default function App() {
  // App States
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [userRole, setUserRole] = useState<'Admin' | 'Manager' | 'Staff'>('Admin');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const [selectedBranch, setSelectedBranch] = useState<BranchId>('ms-city-centre');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const [branchesData, setBranchesData] = useState<Record<BranchId, BranchData>>(() => {
    const saved = localStorage.getItem('branchesData');
    return saved ? JSON.parse(saved) : initialBranchesData;
  });

  useEffect(() => {
    localStorage.setItem('branchesData', JSON.stringify(branchesData));
  }, [branchesData]);

  const currentBranchData = branchesData[selectedBranch];
  const { metrics, orders, targets, recipes, tasks, wasteRecords, hoursData, inventory, alerts } = currentBranchData;

  const totalWasteCost = wasteRecords.reduce((acc, row) => acc + row.cost, 0);
  const totalHours = hoursData.reduce((acc, row) => acc + row.scheduledHours, 0);

  const updateBranchData = (branchId: BranchId, updater: (prev: BranchData) => BranchData) => {
    setBranchesData(prev => ({
      ...prev,
      [branchId]: updater(prev[branchId])
    }));
  };

  const handleUpdateMetrics = (newMetrics: Partial<CoreMetrics>) => {
    updateBranchData(selectedBranch, prev => ({
      ...prev,
      metrics: { ...prev.metrics, ...newMetrics }
    }));
  };

  const handleAddOrder = (newOrder: Omit<SalesOrder, 'id' | 'timestamp'>) => {
    const timestampStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const orderId = `FP-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullOrder: SalesOrder = { ...newOrder, id: orderId, timestamp: timestampStr };

    updateBranchData(selectedBranch, prev => {
      const newOrders = [fullOrder, ...prev.orders];
      const newMetrics = { ...prev.metrics, salesToday: prev.metrics.salesToday + fullOrder.amount };
      const newTargets = prev.targets.map(tgt => 
        tgt.category === 'Sell' && tgt.metric.includes('Sales') 
          ? { ...tgt, currentValue: tgt.currentValue + fullOrder.amount } 
          : tgt
      );
      return { ...prev, orders: newOrders, metrics: newMetrics, targets: newTargets };
    });
  };

  const handleAddTarget = (newTarget: Omit<CompanyTarget, 'id'>) => {
    const targetId = `T-${targets.length + 1}`;
    updateBranchData(selectedBranch, prev => ({
      ...prev,
      targets: [...prev.targets, { ...newTarget, id: targetId }]
    }));
  };

  const handleAddTask = (newTask: Omit<ProductionTask, 'id'>) => {
    const taskId = `PT-${Math.floor(400 + Math.random() * 100)}`;
    updateBranchData(selectedBranch, prev => ({
      ...prev,
      tasks: [{ ...newTask, id: taskId }, ...prev.tasks]
    }));
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: ProductionTask['status']) => {
    updateBranchData(selectedBranch, prev => {
      let newMetrics = { ...prev.metrics };
      let newTargets = [...prev.targets];
      
      const newTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          if (newStatus === 'Prepared' && t.status !== 'Prepared') {
            newMetrics.productionItems += t.quantity;
            newTargets = newTargets.map(tgt => 
              tgt.category === 'Production' && tgt.metric.toLowerCase().includes('cook')
                ? { ...tgt, currentValue: tgt.currentValue + t.quantity }
                : tgt
            );
          }
          return { ...t, status: newStatus };
        }
        return t;
      });

      return { ...prev, tasks: newTasks, metrics: newMetrics, targets: newTargets };
    });
  };

  const handleAddWaste = (newWaste: Omit<WasteRecord, 'id' | 'date'>) => {
    const wasteId = `W-${Math.floor(920 + Math.random() * 80)}`;
    const fullWaste: WasteRecord = { ...newWaste, id: wasteId, date: new Date().toISOString().split('T')[0] };

    updateBranchData(selectedBranch, prev => {
      const newWasteRecords = [fullWaste, ...prev.wasteRecords];
      const newTargets = prev.targets.map(tgt => 
        tgt.category === 'Waste' && tgt.metric.toLowerCase().includes('waste')
          ? { ...tgt, currentValue: tgt.currentValue + fullWaste.cost }
          : tgt
      );
      return { ...prev, wasteRecords: newWasteRecords, targets: newTargets };
    });
  };

  const handleToggleClockStatus = (employeeId: string) => {
    updateBranchData(selectedBranch, prev => {
      const newHoursData = prev.hoursData.map(emp => {
        if (emp.id === employeeId) {
          const nextStatus = emp.status === 'Clocked In' ? 'Clocked Out' : 'Clocked In';
          const addHours = nextStatus === 'Clocked Out' ? 8.0 : 0;
          return { ...emp, status: nextStatus as any, actualHours: parseFloat((emp.actualHours + addHours).toFixed(1)) };
        }
        return emp;
      });
      return { ...prev, hoursData: newHoursData };
    });
  };

  const handleOrderRestock = (itemId: string) => {
    updateBranchData(selectedBranch, prev => {
      const newInventory = prev.inventory.map(item => {
        if (item.id === itemId) {
          return { ...item, stockLevel: 100, currentQty: item.reorderLevel + 120, status: 'Healthy' as const };
        }
        return item;
      });
      return { ...prev, inventory: newInventory };
    });
  };

  const handleSyncData = (branchId: BranchId, newMetrics: CoreMetrics) => {
    updateBranchData(branchId, prev => ({
      ...prev,
      metrics: { ...prev.metrics, ...newMetrics }
    }));
    setActiveTab('Overview');
  };

  const allTabMeta = [
    { id: 'Overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'KPI Business', label: 'KPI Business', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'Sell', label: 'Sell', icon: <Coins className="w-4 h-4" /> },
    { id: 'Target', label: 'Target', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'Production', label: 'Production', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'Waste', label: 'Waste', icon: <Trash2 className="w-4 h-4" /> },
    { id: 'Hours', label: 'Hours', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'Planning', label: 'Planning', icon: <Boxes className="w-4 h-4" /> },
    { id: 'Data Input', label: 'Data Input', icon: <Activity className="w-4 h-4" /> }
  ];

  const tabMeta = allTabMeta.filter(tab => rolePermissions[userRole].includes(tab.id));

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
            branchesData={branchesData}
            selectedBranch={selectedBranch}
            onSelectBranch={setSelectedBranch}
          />
        );
      case 'KPI Business':
        return <KPITab branchesData={branchesData} />;
      case 'Sell':
        return <SellTab orders={orders} onAddOrder={handleAddOrder} />;
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
      case 'Data Input':
        return <DataInputTab onSyncData={handleSyncData} branchesData={branchesData} />;
      default:
        return (
          <OverviewTab 
            branchesData={branchesData}
            selectedBranch={selectedBranch}
            onSelectBranch={setSelectedBranch}
          />
        );
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div id="app-workspace" className="h-screen overflow-hidden bg-slate-50 dark:bg-black flex flex-col md:flex-row font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-orange-100">
      
      {/* SIDEBAR: NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 dark:bg-black text-slate-100 flex flex-col shrink-0 border-r border-slate-950 dark:border-amber-500/20 shadow-lg z-40 relative">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 dark:border-amber-500/20 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 relative group shrink-0">
            <span className="font-bold text-white font-sans text-lg tracking-tighter select-none">FP</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border border-slate-950 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-extrabold tracking-tight text-white leading-tight truncate">Food Penguin</h1>
            <span className="text-[11px] font-mono tracking-[0.2em] text-slate-500 uppercase leading-none block mt-0.5 truncate">Limited</span>
          </div>
        </div>

        {/* Global Branch Selector for non-Overview tabs */}
        {activeTab !== 'Overview' && activeTab !== 'KPI Business' && activeTab !== 'Data Input' && (
          <div className="p-4 border-b border-slate-800/80 bg-slate-900">
            <p className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider mb-2">Location Context</p>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value as BranchId)}
              className="w-full bg-slate-800 text-sm font-semibold text-slate-200 border border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              {BRANCHES.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation Actions */}
        <nav className="flex-1 p-4 mt-2 space-y-1 overflow-y-auto">
          {tabMeta.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-800 dark:bg-slate-900 text-white font-bold shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-all duration-300 shrink-0 ${
                  isActive 
                    ? tab.id === 'Data Input' ? 'bg-rose-500 animate-pulse' : 'bg-orange-500 scale-125' 
                    : 'bg-transparent border border-slate-600'
                }`} />
                <span className="flex-1 flex items-center gap-2">
                  <span className={isActive ? 'text-orange-400' : 'text-slate-400'}>{tab.icon}</span>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer info links */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 static mt-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/50 flex flex-col items-center justify-center text-slate-300 relative shrink-0">
              <User className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-orange-500 absolute -bottom-0.5 -right-0.5 border border-slate-900" />
            </div>
            <div className="text-[11px] leading-tight flex-1">
              <p className="font-semibold text-white">Skipper Koala</p>
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value as any)}
                className="mt-0.5 bg-transparent text-slate-400 font-mono text-[10px] uppercase cursor-pointer hover:text-slate-300 focus:outline-none appearance-none w-full"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Global Toolbar */}
        <header className="bg-white dark:bg-slate-900 h-16 border-b border-slate-200/80 dark:border-slate-800/80 px-6 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {tabMeta.find(t => t.id === activeTab)?.label || activeTab} View
            </h2>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              Sushi ops portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">Local time</span>
              <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 block mt-1">
                {new Date().toISOString().split('T')[0]} 14:13 UTC
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-250 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/80 rounded-full transition-all duration-200 shadow-sm"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-orange-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>
        </header>

        {/* Active view port rendering */}
        <main className="flex-1 min-h-0 p-4 overflow-hidden bg-slate-50/50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto h-full overflow-y-auto pr-2 pb-20">
            {renderActiveView()}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}
