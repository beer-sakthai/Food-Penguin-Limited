import { useState, useEffect } from 'react';
import {
  initialMetrics,
  initialOrders,
  initialTargets,
  initialRecipes,
  initialTasks,
  initialWaste,
  initialHours,
  initialInventory,
  initialAlerts
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
  RealtimeAlert
} from './types';

// Tab Views
import OverviewTab from './components/OverviewTab';
import SellTab from './components/SellTab';
import TargetTab from './components/TargetTab';
import ProductionTab from './components/ProductionTab';
import WasteTab from './components/WasteTab';
import HoursTab from './components/HoursTab';
import PlanningTab from './components/PlanningTab';
import RealtimeTab from './components/RealtimeTab';

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
  GlassWater
} from 'lucide-react';

const rolePermissions: Record<'Admin' | 'Manager' | 'Staff', string[]> = {
  Admin: ['Overview', 'Sell', 'Target', 'Production', 'Waste', 'Hours', 'Planning', 'Real-time'],
  Manager: ['Overview', 'Target', 'Production', 'Waste', 'Hours', 'Planning', 'Real-time'],
  Staff: ['Overview', 'Sell', 'Production', 'Waste', 'Real-time']
};

export default function App() {
  // App States
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [userRole, setUserRole] = useState<'Admin' | 'Manager' | 'Staff'>('Admin');
  const [metrics, setMetrics] = useState<CoreMetrics>(initialMetrics);
  const [orders, setOrders] = useState<SalesOrder[]>(initialOrders);
  const [targets, setTargets] = useState<CompanyTarget[]>(initialTargets);
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [tasks, setTasks] = useState<ProductionTask[]>(initialTasks);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(initialWaste);
  const [hoursData, setHoursData] = useState<EmployeeHour[]>(initialHours);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [alerts, setAlerts] = useState<RealtimeAlert[]>(initialAlerts);

  // Sync core metrics periodically if mock transactions run
  const totalWasteCost = wasteRecords.reduce((acc, row) => acc + row.cost, 0);
  const totalHours = hoursData.reduce((acc, row) => acc + row.scheduledHours, 0);

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
      timestamp: timestampStr
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

  // Live simulation tick every few seconds to append background transactions/alerts
  useEffect(() => {
    const interval = setInterval(() => {
      // 10% chance to report a normal sensory ping or clear status
      if (Math.random() < 0.15) {
        const timestampStr = new Date().toLocaleTimeString('en-US', { hour12: false });
        const newAlert: RealtimeAlert = {
          id: `A-${Math.floor(50 + Math.random() * 100)}`,
          timestamp: timestampStr,
          sensor: 'Sub-Zero Shelf Guard-02',
          value: '-18.1°C',
          status: 'normal',
          message: 'Sensory threshold scan completed: optimal shelf preservation.'
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 15)]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const allTabMeta = [
    { id: 'Overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'Sell', label: 'Sell', icon: <Coins className="w-4 h-4" /> },
    { id: 'Target', label: 'Target', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'Production', label: 'Production', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'Waste', label: 'Waste', icon: <Trash2 className="w-4 h-4" /> },
    { id: 'Hours', label: 'Hours', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'Planning', label: 'Planning', icon: <Boxes className="w-4 h-4" /> },
    { id: 'Real-time', label: 'Real-time', icon: <Activity className="w-4 h-4" /> }
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
          />
        );
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
      case 'Real-time':
        return <RealtimeTab alerts={alerts} />;
      default:
        return (
          <OverviewTab 
            metrics={metrics} 
            onNavigateTab={setActiveTab} 
            targets={targets} 
            userRole={userRole}
            onUpdateMetrics={handleUpdateMetrics}
          />
        );
    }
  };

  return (
    <div id="app-workspace" className="h-screen overflow-hidden bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-orange-100">
      
      {/* SIDEBAR: NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-950 shadow-lg">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 relative group">
            <span className="font-bold text-white font-sans text-lg tracking-tighter select-none">FP</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border border-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-sans tracking-tight text-white leading-tight">Food Penguin</h1>
            <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase leading-none block mt-0.5">Limited</span>
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
                className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-all duration-300 shrink-0 ${
                  isActive 
                    ? tab.id === 'Real-time' ? 'bg-rose-500 animate-pulse' : 'bg-orange-500 scale-125' 
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

        {/* Sidebar Capacity Card (matches Bento Grid illustration specs) */}
        <div className="px-4 py-2 mt-auto mb-2 hidden md:block">
          <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800/50">
            <p className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider mb-2">Weekly Capacity</p>
            <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-[78%] rounded-full"></div>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2">78% Production Load</p>
          </div>
        </div>

        {/* Footer info links */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 static">
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
                className="mt-0.5 bg-transparent text-slate-400 font-mono text-[10px] uppercase cursor-pointer hover:text-slate-300 focus:outline-none appearance-none"
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
        <header className="bg-white h-16 border-b border-slate-200/80 px-6 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-sans font-bold text-slate-900">
              {tabMeta.find(t => t.id === activeTab)?.label || activeTab} View
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              Food chain ops portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block leading-none">Local time</span>
              <span className="text-sm font-mono font-bold text-slate-700 block mt-1">
                {new Date().toISOString().split('T')[0]} 14:13 UTC
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <Cpu className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[11px] font-mono text-slate-600 font-bold">Gemini-3 Unified Intel</span>
            </div>
          </div>
        </header>

        {/* Active view port rendering */}
        <main className="flex-1 min-h-0 p-4 overflow-hidden bg-slate-50/50">
          <div className="max-w-7xl mx-auto h-full">
            {renderActiveView()}
          </div>
        </main>
      </div>

    </div>
  );
}
