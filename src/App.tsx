import React, { useState, useEffect, useMemo } from "react";
import { Reorder, motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
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
  alternativeWeeklyLogsMap,
  initialAlerts,
} from "./data";
import {
  fetchMetrics, fetchOrders, fetchTargets, fetchTasks,
  fetchWaste, fetchHours, fetchInventory, fetchLogs, fetchAlerts,
} from "./api";
import {
  CoreMetrics,
  SalesOrder,
  CompanyTarget,
  Recipe,
  ProductionTask,
  WasteRecord,
  EmployeeHour,
  InventoryItem,
  DailyOperationalLog,
  RealtimeAlert,
} from "./types";

// Tab Views
import OverviewTab from "./components/OverviewTab";
import AdvisorTab from "./components/AdvisorTab";
import SellTab from "./components/SellTab";
import TargetTab from "./components/TargetTab";
import StudioTab from "./components/StudioTab";
import ProductionTab from "./components/ProductionTab";
import WasteTab from "./components/WasteTab";
import HoursTab from "./components/HoursTab";
import PlanningTab from "./components/PlanningTab";
import EnergyTab from "./components/EnergyTab";
import SuppliersTab from "./components/SuppliersTab";
import FinanceTab from "./components/FinanceTab";
import RealtimeTab from "./components/RealtimeTab";
import ResourceAllocationTab from "./components/ResourceAllocationTab";
import ReportsTab from "./components/ReportsTab";
import AnalyticsTab from "./components/AnalyticsTab";
import LoginScreen from "./components/LoginScreen";
import { MS_PRODUCTS, TESCO_PRODUCTS } from "./components/SellTab";
import CapacityVarianceChart from "./components/CapacityVarianceChart";
import { useAnalytics } from "./hooks/useAnalytics";

// Main Icons
import {
  AlertTriangle,
  LayoutDashboard,
  Camera,
  Menu,
  X,
  Coins,
  Zap,
  Package,
  DollarSign,
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
  Store,
  FileSpreadsheet,
  GripVertical,
  BarChart3,
} from "lucide-react";

import { RotateCcw, Info, LogOut, GitCompare, BrainCircuit } from "lucide-react";
import {
  db,
  handleFirestoreError,
  OperationType,
  collection,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  getDocs,
} from "./firebase";

const rolePermissions: Record<
  "Admin" | "Manager" | "Staff" | "User",
  string[]
> = {
  Admin: ["Overview", "Advisor", "Sell", "Target", "Studio", "Production", "Waste", "Hours", "Planning", "Energy", "Suppliers", "Finance", "Realtime", "Allocation", "Reports", "Analytics"],
  Manager: ["Overview", "Sell", "Target", "Production", "Waste", "Hours", "Planning", "Energy", "Suppliers", "Finance", "Realtime", "Allocation", "Reports"],
  Staff: ["Overview", "Production", "Waste", "Hours", "Planning", "Suppliers", "Realtime"],
  User: ["Overview"],
};

const getDayContributingItems = (day: string, projectedLoad: number) => {
  const totalUnits = Math.round(projectedLoad * 12);
  switch (day) {
    case "Mon":
      return [
        {
          name: "Tokyo Dragon Roll",
          quantity: Math.round(totalUnits * 0.45),
          category: "Sushi Rolls",
          loadShare: 45,
          impact: "High",
        },
        {
          name: "California Roll Classic",
          quantity: Math.round(totalUnits * 0.35),
          category: "Sushi Rolls",
          loadShare: 35,
          impact: "Medium",
        },
        {
          name: "Premium Sushi Rice Prep",
          quantity: Math.round(totalUnits * 0.2),
          category: "Grains",
          loadShare: 20,
          impact: "Low",
        },
      ];
    case "Tue":
      return [
        {
          name: "Spicy Bluefin Tuna Roll",
          quantity: Math.round(totalUnits * 0.5),
          category: "Sushi Rolls",
          loadShare: 50,
          impact: "High",
        },
        {
          name: "Kyoto Salmon Sashimi Platter",
          quantity: Math.round(totalUnits * 0.3),
          category: "Sashimi & Platters",
          loadShare: 30,
          impact: "Medium",
        },
        {
          name: "Nori Seaweed Processing",
          quantity: Math.round(totalUnits * 0.2),
          category: "Dry Goods",
          loadShare: 20,
          impact: "Low",
        },
      ];
    case "Wed":
      return [
        {
          name: "Volcano Baked Scallop Roll",
          quantity: Math.round(totalUnits * 0.4),
          category: "Specialty Rolls",
          loadShare: 40,
          impact: "High",
        },
        {
          name: "Tokyo Dragon Roll",
          quantity: Math.round(totalUnits * 0.35),
          category: "Sushi Rolls",
          loadShare: 35,
          impact: "Medium",
        },
        {
          name: "Fresh Avocados Slicing",
          quantity: Math.round(totalUnits * 0.25),
          category: "Produce",
          loadShare: 25,
          impact: "Low",
        },
      ];
    case "Thu":
      return [
        {
          name: "Kyoto Salmon Sashimi Platter",
          quantity: Math.round(totalUnits * 0.45),
          category: "Sashimi & Platters",
          loadShare: 45,
          impact: "High",
        },
        {
          name: "California Roll Classic",
          quantity: Math.round(totalUnits * 0.35),
          category: "Sushi Rolls",
          loadShare: 35,
          impact: "Medium",
        },
        {
          name: "Sushi Seasoning Vinegar Mix",
          quantity: Math.round(totalUnits * 0.2),
          category: "Condiments",
          loadShare: 20,
          impact: "Low",
        },
      ];
    case "Fri":
      return [
        {
          name: "Tokyo Dragon Roll",
          quantity: Math.round(totalUnits * 0.55),
          category: "Sushi Rolls",
          loadShare: 55,
          impact: "Critical",
        },
        {
          name: "Spicy Bluefin Tuna Roll",
          quantity: Math.round(totalUnits * 0.3),
          category: "Sushi Rolls",
          loadShare: 30,
          impact: "Medium",
        },
        {
          name: "Bluefin Tuna Loin Portioning",
          quantity: Math.round(totalUnits * 0.15),
          category: "Seafood",
          loadShare: 15,
          impact: "Low",
        },
      ];
    case "Sat":
      return [
        {
          name: "Volcano Baked Scallop Roll",
          quantity: Math.round(totalUnits * 0.45),
          category: "Specialty Rolls",
          loadShare: 45,
          impact: "High",
        },
        {
          name: "Kyoto Salmon Sashimi Platter",
          quantity: Math.round(totalUnits * 0.4),
          category: "Sashimi & Platters",
          loadShare: 40,
          impact: "High",
        },
        {
          name: "Atlantic Sushi Salmon Slicing",
          quantity: Math.round(totalUnits * 0.15),
          category: "Seafood",
          loadShare: 15,
          impact: "Low",
        },
      ];
    case "Sun":
      return [
        {
          name: "Tokyo Dragon Roll",
          quantity: Math.round(totalUnits * 0.4),
          category: "Sushi Rolls",
          loadShare: 40,
          impact: "High",
        },
        {
          name: "Spicy Bluefin Tuna Roll",
          quantity: Math.round(totalUnits * 0.35),
          category: "Sushi Rolls",
          loadShare: 35,
          impact: "Medium",
        },
        {
          name: "California Roll Classic",
          quantity: Math.round(totalUnits * 0.25),
          category: "Sushi Rolls",
          loadShare: 25,
          impact: "Low",
        },
      ];
    default:
      return [
        {
          name: "Tokyo Dragon Roll",
          quantity: Math.round(totalUnits * 0.5),
          category: "Sushi Rolls",
          loadShare: 50,
          impact: "High",
        },
        {
          name: "California Roll Classic",
          quantity: Math.round(totalUnits * 0.5),
          category: "Sushi Rolls",
          loadShare: 50,
          impact: "Medium",
        },
      ];
  }
};

export default function App() {
  // App States
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return (localStorage.getItem("theme") as "dark" | "light") || "dark";
    } catch {
      return "dark";
    }
  });
  const [metallicTheme, setMetallicTheme] = useState<"gold" | "silver" | "copper">(() => {
    try {
      return (localStorage.getItem("metallicTheme") as "gold" | "silver" | "copper") || "gold";
    } catch {
      return "gold";
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch (_) {}
  };

  const changeMetallicTheme = (metal: "gold" | "silver" | "copper") => {
    setMetallicTheme(metal);
    try {
      localStorage.setItem("metallicTheme", metal);
    } catch (_) {}
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Sync metallic theme CSS class
  useEffect(() => {
    document.documentElement.classList.remove("metal-gold", "metal-silver", "metal-copper");
    document.documentElement.classList.add(`metal-${metallicTheme}`);
  }, [metallicTheme]);

  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isMoreToolsOpen, setIsMoreToolsOpen] = useState(false);
  const [userRole, setUserRole] = useState<
    "Admin" | "Manager" | "Staff" | "User"
  >("Admin");
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    role: string;
    email?: string;
    photoURL?: string;
  } | null>({
    username: "Administrator",
    role: "Admin",
    email: "admin@foodpenguin.com",
  });
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);

  // Local session initialization on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("localCurrentUser");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        setUserRole(parsed.role);
      } catch (_) {
        // Keep the default state
      }
    }
  }, []);

  // Load data from SQLite API (falls back to hardcoded data on failure)
  const [dataLoaded, setDataLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [m, o, t, tk, w, h, inv, l, a] = await Promise.all([
          fetchMetrics(),
          fetchOrders(),
          fetchTargets(),
          fetchTasks(),
          fetchWaste(),
          fetchHours(),
          fetchInventory(),
          fetchLogs("2026-06-15 to 2026-06-21"),
          fetchAlerts(),
        ]);
        if (cancelled) return;
        setMetrics(m);
        setOrders(o);
        setTargets(t);
        setTasks(tk);
        setWasteRecords(w);
        setHoursData(h);
        setInventory(inv);
        setWeeklyLogsMap({ "2026-06-15 to 2026-06-21": l });
        setAlerts(a);
      } catch (err) {
        console.warn("API load failed, using hardcoded data:", err);
      } finally {
        if (!cancelled) setDataLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Firestore Sync Listener
  useEffect(() => {
    if (
      !currentUser ||
      !currentUser.email ||
      currentUser.email === "demo@foodpenguin.com"
    ) {
      setIsFirebaseSynced(false);
      return;
    }

    const unsubscribeList: (() => void)[] = [];

    const syncCollection = async <T extends { id: string }>(
      colName: string,
      initialData: T[],
      setList: React.Dispatch<React.SetStateAction<T[]>>,
      opType: OperationType,
    ) => {
      try {
        const ref = collection(db, colName);
        const snap = await getDocs(ref).catch((err) =>
          handleFirestoreError(err, OperationType.LIST, colName),
        );

        if (snap.empty) {
          // Seed initial data
          for (const item of initialData) {
            await setDoc(doc(db, colName, item.id), item).catch((err) =>
              handleFirestoreError(
                err,
                OperationType.WRITE,
                `${colName}/${item.id}`,
              ),
            );
          }
        }

        const unsub = onSnapshot(
          ref,
          (snapshot) => {
            const list: T[] = [];
            snapshot.forEach((doc) => {
              list.push(doc.data() as T);
            });
            setList(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, colName),
        );

        unsubscribeList.push(unsub);
      } catch (e) {
        console.error(`Error syncing ${colName} with Firestore:`, e);
      }
    };

    const initSync = async () => {
      await syncCollection(
        "orders",
        initialOrders,
        setOrders,
        OperationType.WRITE,
      );
      await syncCollection(
        "tasks",
        initialTasks,
        setTasks,
        OperationType.WRITE,
      );
      await syncCollection(
        "waste",
        initialWaste,
        setWasteRecords,
        OperationType.WRITE,
      );
      await syncCollection(
        "targets",
        initialTargets,
        setTargets,
        OperationType.WRITE,
      );
      await syncCollection(
        "hours",
        initialHours,
        setHoursData,
        OperationType.WRITE,
      );
      await syncCollection(
        "inventory",
        initialInventory,
        setInventory,
        OperationType.WRITE,
      );
      setIsFirebaseSynced(true);
    };

    initSync();

    return () => {
      unsubscribeList.forEach((unsub) => unsub());
    };
  }, [currentUser]);

  const [selectedBranch, setSelectedBranch] = useState<
    "Marks & Spencer - Cork City" | "Tesco - Cork City" | "Tesco - Mahon Point"
  >("Marks & Spencer - Cork City");
  // Self-hosted analytics tracker (sends batches every 2s)
  useAnalytics({ userRole, selectedBranch, activeTab });
  const [metrics, setMetrics] = useState<CoreMetrics>(initialMetrics);
  const [orders, setOrders] = useState<SalesOrder[]>(initialOrders);
  const [targets, setTargets] = useState<CompanyTarget[]>(initialTargets);

  const recipes = useMemo<Recipe[]>(() => {
    const isMS = selectedBranch === "Marks & Spencer - Cork City";
    const activeProducts = isMS ? MS_PRODUCTS : TESCO_PRODUCTS;

    const getIngredients = (category: string, name: string) => {
      const lowerName = name.toLowerCase();
      if (lowerName.includes("salmon")) {
        return [
          "Atlantic Salmon Fillet",
          "Fresh Wasabi Paste",
          "Premium Sushi Rice",
          "Grated Daikon Radish",
          "Soy Sauce",
        ];
      }
      if (lowerName.includes("chicken")) {
        return [
          "Free-range Chicken Fillet",
          "Katsu Curry Sauce",
          "Panko Breadcrumbs",
          "Seasoned Jasmine Rice",
          "Spring Onions",
        ];
      }
      if (
        lowerName.includes("tofu") ||
        lowerName.includes("veggie") ||
        lowerName.includes("plant")
      ) {
        return [
          "Pressed Silken Tofu",
          "Fresh Avocado",
          "Cucumber ribbon",
          "Mixed Sesame seeds",
          "Sweet Glaze Drizzle",
        ];
      }
      if (
        category === "Sushi Rolls" ||
        category === "Maki Rolls" ||
        category === "Nigiri Duos"
      ) {
        return [
          "Seasoned Hinohikari Rice",
          "Premium Toasted Nori Sheets",
          "Crispy Cucumber",
          "Kyoto Japanese Mayo",
          "Soy Glaze",
        ];
      }
      if (category === "Noodles & Sides" || lowerName.includes("noodles")) {
        return [
          "Fresh Udon Grains",
          "Julienned Sweet Peppers",
          "Savory Soy Brew sauce",
          "Crushed Peanuts",
          "Chili Flakes",
        ];
      }
      if (category === "Desserts & Sweets" || lowerName.includes("mochi")) {
        return [
          "Sweetened Rice Flour Paste",
          "Artisanal Ice Cream Core",
          "Powdered Starch coating",
          "Natural Strawberry syrup",
        ];
      }
      return [
        "Hand-picked Nori",
        "Select Sushi Rice",
        "Signature Dipping Sauce",
        "Crisp Cucumber slice",
      ];
    };

    const getAllergens = (category: string, name: string) => {
      const lowerName = name.toLowerCase();
      const allergens: string[] = [];
      if (lowerName.includes("salmon") || lowerName.includes("fish"))
        allergens.push("Fish");
      if (lowerName.includes("chicken")) allergens.push("Gluten");
      if (lowerName.includes("tofu") || lowerName.includes("veggie"))
        allergens.push("Soya");
      if (
        lowerName.includes("noodles") ||
        lowerName.includes("gyoza") ||
        lowerName.includes("katsu")
      ) {
        if (!allergens.includes("Gluten")) allergens.push("Gluten");
      }
      if (lowerName.includes("mochi")) allergens.push("Milk");
      if (category.toLowerCase().includes("roll")) {
        allergens.push("Sesame");
      }
      if (allergens.length === 0) allergens.push("Soya");
      return allergens;
    };

    return activeProducts.map((p, idx) => ({
      id: `${isMS ? "R-MS" : "R-T"}-${idx + 1}`,
      name: p.name,
      category: p.category,
      status: "active" as const,
      prepTime: Math.min(15, Math.max(3, Math.round(p.price * 1.2))),
      ingredients: getIngredients(p.category, p.name),
      allergens: getAllergens(p.category, p.name),
    }));
  }, [selectedBranch]);

  const [tasks, setTasks] = useState<ProductionTask[]>(initialTasks);

  // Sync tasks list with active branch products on branch switch
  useEffect(() => {
    if (isFirebaseSynced) return;
    const isMS = selectedBranch === "Marks & Spencer - Cork City";
    const products = isMS ? MS_PRODUCTS : TESCO_PRODUCTS;

    if (products.length >= 4) {
      setTasks([
        {
          id: "PT-301",
          itemName: products[0].name,
          assignedTo: "Chef Skipper",
          status: "Cooking",
          quantity: 2,
          priority: "high",
        },
        {
          id: "PT-302",
          itemName: products[1].name,
          assignedTo: "Chef Private",
          status: "Cooking",
          quantity: 1,
          priority: "medium",
        },
        {
          id: "PT-303",
          itemName: products[2].name,
          assignedTo: "Kitchen Aide Rico",
          status: "In Queue",
          quantity: 3,
          priority: "low",
        },
        {
          id: "PT-304",
          itemName: products[3 % products.length].name,
          assignedTo: "Chef Kowalski",
          status: "Prepared",
          quantity: 4,
          priority: "high",
        },
      ]);
    }
  }, [selectedBranch, isFirebaseSynced]);

  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(initialWaste);
  const [alerts, setAlerts] = useState<RealtimeAlert[]>(initialAlerts);
  const [hoursData, setHoursData] = useState<EmployeeHour[]>(initialHours);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

  // Automatically flags inventory items based on stock level and reorder thresholds
  const autoFlagInventory = (items: InventoryItem[]): InventoryItem[] => {
    return items.map((item) => {
      let status: "Healthy" | "Low" | "Critical" = "Healthy";
      if (item.stockLevel <= 20) {
        status = "Critical";
      } else if (item.stockLevel <= 50 || item.currentQty <= item.reorderLevel) {
        status = "Low";
      }
      return { ...item, status };
    });
  };

  const processedInventory = useMemo(() => {
    return autoFlagInventory(inventory);
  }, [inventory]);

  const lowStockCount = useMemo(() => {
    return processedInventory.filter(
      (item) => item.status === "Low" || item.status === "Critical"
    ).length;
  }, [processedInventory]);

  const lowStockItems = useMemo(() => {
    return processedInventory.filter(
      (item) => item.status === "Low" || item.status === "Critical"
    );
  }, [processedInventory]);
  const [selectedWeekRange, setSelectedWeekRange] = useState<string>(
    "2026-06-15 to 2026-06-21",
  );
  const [weeklyLogsMap, setWeeklyLogsMap] = useState<
    Record<string, DailyOperationalLog[]>
  >(alternativeWeeklyLogsMap);
  const [isCapacityExpanded, setIsCapacityExpanded] = useState<boolean>(false);
  const [overlayBranches, setOverlayBranches] = useState<string[]>([]);
  const [capacitySortBy, setCapacitySortBy] = useState<
    "date" | "bottleneck" | "custom"
  >("date");
  const [customSortOrder, setCustomSortOrder] = useState<string[]>([]);
  const [bottleneckThreshold, setBottleneckThreshold] = useState<number>(90);
  const [showThresholdTooltip, setShowThresholdTooltip] =
    useState<boolean>(false);
  const [focusedDay, setFocusedDay] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [capacitySmoothing, setCapacitySmoothing] = useState<
    "raw" | "smoothed"
  >("raw");
  const [compareModeEnabled, setCompareModeEnabled] = useState<boolean>(false);
  const [capacityImpactFilter, setCapacityImpactFilter] = useState<
    "all" | "critical" | "low"
  >("all");

  // Quick Adjust simulated capacity overrides states
  const [quickAdjustEnabled, setQuickAdjustEnabled] = useState<boolean>(false);
  const [capacityOverrides, setCapacityOverrides] = useState<
    Record<string, { mode: "ai" | "manual"; value: number }>
  >({});
  const [globalAdjustValue, setGlobalAdjustValue] = useState<number>(100);
  const [bulkSelectedDays, setBulkSelectedDays] = useState<string[]>([]);
  const [bulkOverrideValue, setBulkOverrideValue] = useState<number>(0);

  // Capacity Quick Fix States
  const [quickFixLoading, setQuickFixLoading] = useState<boolean>(false);
  const [quickFixRecommendation, setQuickFixRecommendation] = useState<string | null>(null);
  const [quickFixAdjustment, setQuickFixAdjustment] = useState<number | null>(null);
  const [quickFixDay, setQuickFixDay] = useState<string | null>(null);
  const [quickFixError, setQuickFixError] = useState<string | null>(null);

  const handleTriggerQuickFix = async (day: string, projected: number, threshold: number) => {
    setQuickFixLoading(true);
    setQuickFixRecommendation(null);
    setQuickFixAdjustment(null);
    setQuickFixDay(day);
    setQuickFixError(null);

    try {
      const response = await fetch("/api/gemini/capacity-quickfix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day,
          projected,
          threshold,
          wasteRecords,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate quick fix: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setQuickFixRecommendation(data.recommendationText);
      setQuickFixAdjustment(data.suggestedAdjustmentPct);
    } catch (err: any) {
      console.error(err);
      setQuickFixError(err.message || "An unexpected error occurred during quick fix generation.");
    } finally {
      setQuickFixLoading(false);
    }
  };

  const handleApplyQuickFix = () => {
    if (!quickFixDay || quickFixAdjustment === null) return;
    const maxProjectedItem = dailyCapacityBreakdown.find((d) => d.day === quickFixDay);
    if (!maxProjectedItem) return;

    // Apply manual override to the day: target value is projected + suggested adjustment
    const targetValue = Math.max(10, Math.min(110, Math.round(maxProjectedItem.projected + quickFixAdjustment)));
    
    setCapacityOverrides((prev) => ({
      ...prev,
      [quickFixDay]: {
        mode: "manual",
        value: targetValue,
      },
    }));
    setQuickAdjustEnabled(true);
    
    // Reset quick fix display state
    setQuickFixRecommendation(null);
    setQuickFixAdjustment(null);
    setQuickFixDay(null);
  };

  // Email report schedule states
  const [isScheduleReportModalOpen, setIsScheduleReportModalOpen] =
    useState<boolean>(false);
  const [reportFrequency, setReportFrequency] = useState<"daily" | "weekly">(
    "weekly",
  );
  const [reportEmailAddress, setReportEmailAddress] = useState<string>("");

  const handleToggleOverrideMode = (
    day: string,
    mode: "ai" | "manual",
    currentValue: number,
  ) => {
    setCapacityOverrides((prev) => {
      const existing = prev[day];
      return {
        ...prev,
        [day]: {
          mode,
          value: existing ? existing.value : currentValue,
        },
      };
    });
  };

  const handleUpdateOverrideValue = (day: string, value: number) => {
    setCapacityOverrides((prev) => {
      const existing = prev[day];
      return {
        ...prev,
        [day]: {
          mode: existing ? existing.mode : "manual",
          value,
        },
      };
    });
  };

  const handleClearSingleOverride = (day: string) => {
    setCapacityOverrides((prev) => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  };

  const handleResetOverrides = () => {
    setCapacityOverrides({});
    setBulkSelectedDays([]);
  };

  const handleGlobalOverride = () => {
    if (!weeklyLogs) return;
    const newOverrides: Record<
      string,
      { mode: "ai" | "manual"; value: number }
    > = {};
    weeklyLogs.forEach((log) => {
      newOverrides[log.day] = { mode: "manual", value: globalAdjustValue };
    });
    setCapacityOverrides(newOverrides);
  };

  const weeklyLogs =
    weeklyLogsMap[selectedWeekRange] ||
    alternativeWeeklyLogsMap["2026-06-15 to 2026-06-21"];

  // Keep metrics in perfect alignment with selected week range and logs
  useEffect(() => {
    const sundayLog = weeklyLogs.find((l) => l.day === "Sun") || weeklyLogs[6];
    if (sundayLog) {
      setMetrics((prev) => ({
        ...prev,
        salesToday: sundayLog.sales,
        wasteCost: sundayLog.waste,
        hoursScheduled: sundayLog.hours,
        productionTarget: sundayLog.productionTarget,
        productionItems: sundayLog.productionMade,
        aiHealthScore: Math.round(
          Math.min(
            100,
            Math.max(
              50,
              90 +
                (sundayLog.productionMade / sundayLog.productionTarget) * 10 -
                (sundayLog.waste / sundayLog.sales) * 50,
            ),
          ),
        ),
      }));
    }
  }, [selectedWeekRange, weeklyLogsMap]);

  // Polling mechanism to simulate real-time operational database updates every 60 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setMetrics((prev) => {
        // Slightly randomize metrics.salesToday by +/- 2%
        const percentChange = Math.random() * 0.04 - 0.02;
        const newSalesToday = Number(
          (prev.salesToday * (1 + percentChange)).toFixed(2),
        );

        // Slightly randomize metrics.productionItems by a small integer delta (+/- 1-2 items)
        const productionDelta = Math.floor(Math.random() * 5) - 2;
        const newProductionItems = Math.max(
          0,
          prev.productionItems + productionDelta,
        );

        // Recompute the real-time AI Health Score based on updated figures
        const newHealth = Math.round(
          Math.min(
            100,
            Math.max(
              50,
              90 +
                (newProductionItems / (prev.productionTarget || 1)) * 10 -
                (prev.wasteCost / (newSalesToday || 1)) * 50,
            ),
          ),
        );

        return {
          ...prev,
          salesToday: newSalesToday,
          productionItems: newProductionItems,
          aiHealthScore: newHealth,
        };
      });
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Ireland real-time Clock state (Dublin)
  const [irelandTime, setIrelandTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-IE", {
        timeZone: "Europe/Dublin",
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setIrelandTime(formatter.format(now));
    };
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Sync core metrics periodically if mock transactions run
  const totalWasteCost = wasteRecords.reduce((acc, row) => acc + row.cost, 0);
  const totalHours = hoursData.reduce(
    (acc, row) => acc + row.scheduledHours,
    0,
  );

  // Calculative capacity metric that matches initial 78% but moves dynamically with metrics.productionItems
  const capacityPct = Math.round(
    Math.min((metrics.productionItems / metrics.productionTarget) * 80, 100),
  );

  // Daily breakdown of 7-day projected capacity for the expandable section
  const dailyCapacityBreakdown = useMemo(() => {
    if (!weeklyLogs || weeklyLogs.length === 0) return [];

    const midIdx = Math.floor(weeklyLogs.length / 2);
    const firstHalf = weeklyLogs.slice(0, midIdx);
    const secondHalf = weeklyLogs.slice(midIdx);

    const firstHalfRate =
      firstHalf.reduce(
        (sum, l) => sum + l.productionMade / (l.productionTarget || 1),
        0,
      ) / (firstHalf.length || 1);
    const secondHalfRate =
      secondHalf.reduce(
        (sum, l) => sum + l.productionMade / (l.productionTarget || 1),
        0,
      ) / (secondHalf.length || 1);

    const trendFactor = secondHalfRate / (firstHalfRate || 1);

    const rawList = weeklyLogs.map((log) => {
      const dailyCurrentPct = Math.round(
        Math.min((log.productionMade / (log.productionTarget || 1)) * 80, 100),
      );
      const rawDailyProjection = Math.round(
        dailyCurrentPct * Math.max(0.85, Math.min(1.25, trendFactor || 1)),
      );
      let dailyProjectedPct =
        isNaN(rawDailyProjection) || rawDailyProjection <= 0
          ? Math.min(100, Math.max(0, dailyCurrentPct + 4))
          : Math.min(100, rawDailyProjection);

      const initialAiForecastVal = dailyProjectedPct;

      // Support live 'What-If' manual overrides when Quick Adjust mode is active
      if (quickAdjustEnabled) {
        const override = capacityOverrides[log.day];
        if (override && override.mode === "manual") {
          dailyProjectedPct = override.value;
        }
      }

      return {
        day: log.day,
        date: log.date.substring(5), // simplified 'MM-DD'
        current: dailyCurrentPct,
        projected: dailyProjectedPct,
        initialAiForecast: initialAiForecastVal,
      };
    });

    if (capacitySmoothing === "smoothed") {
      // Apply 3-day moving average centering around current index to reduce visual spikes
      return rawList.map((item, idx) => {
        const neighbors = [item];
        if (idx > 0) neighbors.push(rawList[idx - 1]);
        if (idx < rawList.length - 1) neighbors.push(rawList[idx + 1]);

        const avgCurrent = Math.round(
          neighbors.reduce((sum, n) => sum + n.current, 0) / neighbors.length,
        );
        const avgProjected = Math.round(
          neighbors.reduce((sum, n) => sum + n.projected, 0) / neighbors.length,
        );
        const avgInitialAiForecast = Math.round(
          neighbors.reduce((sum, n) => sum + n.initialAiForecast, 0) /
            neighbors.length,
        );

        return {
          ...item,
          current: avgCurrent,
          projected: avgProjected,
          initialAiForecast: avgInitialAiForecast,
        };
      });
    }

    return rawList;
  }, [weeklyLogs, capacitySmoothing, quickAdjustEnabled, capacityOverrides]);

  // Determine rolling 7-day predictive capacity projection based on operational rates of the selected week context
  const projectedCapacityPct = useMemo(() => {
    // If Quick Adjust simulation mode is active, the global projection is computed as the simple average of daily projected capacities
    if (
      quickAdjustEnabled &&
      dailyCapacityBreakdown &&
      dailyCapacityBreakdown.length > 0
    ) {
      return Math.round(
        dailyCapacityBreakdown.reduce((sum, d) => sum + d.projected, 0) /
          dailyCapacityBreakdown.length,
      );
    }

    if (!weeklyLogs || weeklyLogs.length === 0) return capacityPct;

    const totalMade = weeklyLogs.reduce(
      (sum, log) => sum + log.productionMade,
      0,
    );
    const totalTarget = weeklyLogs.reduce(
      (sum, log) => sum + log.productionTarget,
      0,
    );
    const baseRate = totalTarget > 0 ? totalMade / totalTarget : 0.8;

    // Estimate relative trend/momentum comparing the back-half of week with front-half
    const midIdx = Math.floor(weeklyLogs.length / 2);
    const firstHalf = weeklyLogs.slice(0, midIdx);
    const secondHalf = weeklyLogs.slice(midIdx);

    const firstHalfRate =
      firstHalf.reduce(
        (sum, l) => sum + l.productionMade / (l.productionTarget || 1),
        0,
      ) / (firstHalf.length || 1);
    const secondHalfRate =
      secondHalf.reduce(
        (sum, l) => sum + l.productionMade / (l.productionTarget || 1),
        0,
      ) / (secondHalf.length || 1);

    const trendFactor = secondHalfRate / (firstHalfRate || 1);

    // Core predictive calculation: current baseline capacity adjusted by rolling trend momentum
    const rawProjection = Math.round(
      capacityPct * Math.max(0.85, Math.min(1.25, trendFactor || 1)),
    );

    return isNaN(rawProjection) || rawProjection <= 0
      ? Math.min(100, Math.max(0, capacityPct + 4))
      : Math.min(100, rawProjection);
  }, [weeklyLogs, capacityPct, quickAdjustEnabled, dailyCapacityBreakdown]);

  // AI Accuracy Confidence metric based on the variance between past projected capacity and actual historical production logs
  const aiAccuracyConfidence = useMemo(() => {
    if (!dailyCapacityBreakdown || dailyCapacityBreakdown.length === 0)
      return 95;
    const variances = dailyCapacityBreakdown.map((item) =>
      Math.abs(item.projected - item.current),
    );
    const avgVariance =
      variances.reduce((sum, v) => sum + v, 0) / variances.length;
    // Map average variance to a confidence percentage from 0 to 100%
    const score = Math.round(100 - avgVariance * 1.25);
    return Math.max(50, Math.min(100, score));
  }, [dailyCapacityBreakdown]);

  // Multi-branch capacity projection data for overlay comparisons
  const branchProjectionData = useMemo(() => {
    const branches = [
      "Marks & Spencer - Cork City",
      "Tesco - Cork City",
      "Tesco - Mahon Point",
    ] as const;

    const colors: Record<string, string> = {
      "Marks & Spencer - Cork City": "#eab308", // Gold/Amber
      "Tesco - Cork City": "#3b82f6", // Blue
      "Tesco - Mahon Point": "#10b981", // Emerald
    };

    const data: Record<
      string,
      { current: number; projected: number; color: string }
    > = {};

    branches.forEach((br) => {
      if (br === selectedBranch) {
        data[br] = {
          current: capacityPct,
          projected: projectedCapacityPct,
          color: colors[br],
        };
      } else {
        let currentScale = 1.0;
        let projectedScale = 1.0;

        if (br === "Marks & Spencer - Cork City") {
          currentScale = 0.88;
          projectedScale = 0.92;
        } else if (br === "Tesco - Cork City") {
          currentScale = 1.12;
          projectedScale = 1.06;
        } else if (br === "Tesco - Mahon Point") {
          currentScale = 0.94;
          projectedScale = 1.14;
        }

        let weekModifier = 0;
        if (selectedWeekRange.includes("06-22")) {
          weekModifier = 3;
        } else if (selectedWeekRange.includes("06-15")) {
          weekModifier = -2;
        }

        const calculatedCurrent = Math.min(
          100,
          Math.max(30, Math.round(capacityPct * currentScale + weekModifier)),
        );
        const calculatedProjected = Math.min(
          100,
          Math.max(
            30,
            Math.round(
              projectedCapacityPct * projectedScale + weekModifier * 1.5,
            ),
          ),
        );

        data[br] = {
          current: calculatedCurrent,
          projected: calculatedProjected,
          color: colors[br],
        };
      }
    });

    return data;
  }, [selectedBranch, capacityPct, projectedCapacityPct, selectedWeekRange]);

  // Sorted daily capacity breakdown based on selected sort order (Chronological vs Bottleneck Intensity)
  const sortedDailyCapacityBreakdown = useMemo(() => {
    const list = [...dailyCapacityBreakdown];
    if (capacitySortBy === "bottleneck") {
      return list.sort((a, b) => b.projected - a.projected);
    } else if (capacitySortBy === "custom" && customSortOrder.length > 0) {
      return list.sort((a, b) => {
        const idxA = customSortOrder.indexOf(a.day);
        const idxB = customSortOrder.indexOf(b.day);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }
    return list;
  }, [dailyCapacityBreakdown, capacitySortBy, customSortOrder]);

  // Filtered daily capacity breakdown based on selected impact filter (All vs Critical Only vs Low Impact)
  const filteredDailyCapacityBreakdown = useMemo(() => {
    return sortedDailyCapacityBreakdown.filter((item) => {
      if (capacityImpactFilter === "critical") {
        return item.projected > bottleneckThreshold;
      }
      if (capacityImpactFilter === "low") {
        return item.projected < 70;
      }
      return true;
    });
  }, [sortedDailyCapacityBreakdown, capacityImpactFilter, bottleneckThreshold]);

  // Export Daily projected capacity as a CSV string file download
  const handleExportCapacityCSV = () => {
    if (!dailyCapacityBreakdown || dailyCapacityBreakdown.length === 0) return;

    const headers = [
      "Day",
      "Date",
      "Current Capacity (%)",
      "Projected Capacity (%)",
    ];
    const rows = dailyCapacityBreakdown.map((item) => [
      item.day,
      item.date,
      item.current,
      item.projected,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `weekly_capacity_breakdown_${selectedWeekRange.replace(/\s+/g, "_")}.csv`,
    );
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
      orientation: "portrait",
      unit: "mm",
      format: "a4",
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
    doc.rect(0, 0, 210, 42, "F");

    // Header Metadata & Typography branding
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("BAKERY OPERATIONAL CORE SUITE", 15, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("PREDICTIVE WEEKLY CAPACITY PROJECTION REPORT", 15, 20);

    doc.setTextColor(161, 161, 170); // Zinc 400
    doc.setFontSize(8);
    doc.text(`Active Calendar Frame: ${selectedWeekRange}`, 15, 26);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at ${new Date().toLocaleTimeString("en-US")}`,
      15,
      30,
    );

    // Dynamic watermarked badge
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(168, 10, 27, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("ANALYTICS ENGINE", 170, 13.5);

    // --- KPIs / Summary Metric Cards Banner ---
    let yPos = 52;

    const totalDays = dailyCapacityBreakdown.length;
    const avgProjected = Math.round(
      dailyCapacityBreakdown.reduce((sum, item) => sum + item.projected, 0) /
        totalDays,
    );
    const maxProjectedItem = [...dailyCapacityBreakdown].sort(
      (a, b) => b.projected - a.projected,
    )[0];
    const bottlenecksCount = dailyCapacityBreakdown.filter(
      (item) => item.projected > bottleneckThreshold,
    ).length;

    // Background container sheet for key summaries
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(15, yPos, 180, 25, 2.5, 2.5, "F");

    // KPI Box 1: Average Load
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("AVERAGE LOAD FACTOR", 22, yPos + 7);
    doc.setFontSize(14);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(`${avgProjected}%`, 22, yPos + 17);

    // KPI Box 2: Peak Loaded Day
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("PEAK CAPACITY LIMIT", 80, yPos + 7);
    doc.setFontSize(12.5);
    doc.setTextColor(39, 39, 42); // Zinc 800
    doc.text(`${maxProjectedItem.projected}% Load`, 80, yPos + 14.5);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(`On ${maxProjectedItem.day}`, 80, yPos + 19);

    // KPI Box 3: Bottleneck Threshold Alarms
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("THRESHOLD BOTTLENECKS", 138, yPos + 7);
    doc.setFontSize(13.5);
    if (bottlenecksCount > 0) {
      doc.setTextColor(alertColor[0], alertColor[1], alertColor[2]);
      doc.text(`${bottlenecksCount} Hot Days`, 138, yPos + 17);
    } else {
      doc.setTextColor(16, 185, 129); // Green 500
      doc.text("Stable Output (0)", 138, yPos + 17);
    }

    // --- Subtitle parameter summary line ---
    yPos += 35;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("7-DAY DAILY PREDICTED TIMELINE BREAKDOWN", 15, yPos);

    // Thin grey spacer boundary line
    doc.setDrawColor(228, 228, 231); // Zinc 200
    doc.setLineWidth(0.35);
    doc.line(15, yPos + 2, 195, yPos + 2);

    // Print metadata variables
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(`Bottleneck Limit Trigger: ${bottleneckThreshold}%`, 15, yPos);
    doc.text(
      `Smoothing Mode: ${capacitySmoothing === "smoothed" ? "3-Day Rolling Moving Average" : "Raw Metrics (None)"}`,
      72,
      yPos,
    );
    doc.text(
      `Sequence Filter Order: ${capacitySortBy === "bottleneck" ? "Bottleneck Intensity" : capacitySortBy === "custom" ? "Custom Priority" : "Calendar Sequence"}`,
      142,
      yPos,
    );

    // --- Main Capacity Breakdown Table ---
    yPos += 6;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPos, 180, 8, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("WEEKDAY", 20, yPos + 5.5);
    doc.text("DATE", 50, yPos + 5.5);
    doc.text("BASE CURRENT (%)", 85, yPos + 5.5);
    doc.text("PROJECTED LOAD (%)", 125, yPos + 5.5);
    doc.text("BOTTLENECK STATE", 165, yPos + 5.5);

    const rowHeight = 9.5;
    yPos += 8;

    sortedDailyCapacityBreakdown.forEach((item, idx) => {
      const isBottleneck = item.projected > bottleneckThreshold;

      // Alternating row highlighting background
      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, yPos, 180, rowHeight, "F");
      }

      // Draw light wire separators
      doc.setDrawColor(244, 244, 245);
      doc.setLineWidth(0.2);
      doc.line(15, yPos + rowHeight, 195, yPos + rowHeight);

      // Value rendering block
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(item.day, 20, yPos + 6);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(82, 82, 91);
      doc.text(item.date, 50, yPos + 6);

      doc.text(`${item.current}%`, 85, yPos + 6);

      // Project highlighting styling
      doc.setFont("helvetica", "bold");
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
        doc.roundedRect(162, yPos + 1.8, 28, 5.5, 0.8, 0.8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(180, 83, 9); // Amber 700
        doc.text("BOTTLENECK", 165.5, yPos + 5.6);
      } else {
        doc.setTextColor(113, 113, 122);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text("NORMAL LOAD", 165, yPos + 5.6);
      }

      yPos += rowHeight;
    });

    // --- Footer Explanatory Bullet Points & Notes ---
    yPos += 10;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("EXECUTIVE INTERPRETATION GUIDELINE", 15, yPos);

    doc.setDrawColor(228, 228, 231);
    doc.setLineWidth(0.35);
    doc.line(15, yPos + 2, 195, yPos + 2);

    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(82, 82, 91);

    const bulletins = [
      "• Capacity forecasts are computed dynamically based on the active rolling index of completed production batches versus target.",
      '• Days highlighted with yellow "BOTTLENECK" alert badges exceed your configured threshold parameter limit.',
      "• Moving average view reduces short-term variation spikes to reveal systemic weekly production limits for senior management reporting.",
      "• Report intended for staff duty scheduling, shifts optimization, and oven heating resource conservation.",
    ];

    bulletins.forEach((bullet) => {
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
    doc.text(
      "Automated forecast projection report. Confidential & intended for Bakery Internal Operations.",
      15,
      yPos,
    );
    doc.text("Page 1 of 1", 182, yPos);

    // Trigger PDF browser-side download
    doc.save(
      `Capacity_Projection_Report_${selectedWeekRange.replace(/\s+/g, "_")}.pdf`,
    );
  };

  const handleUpdateMetrics = (newMetrics: Partial<CoreMetrics>) => {
    setMetrics((prev) => ({ ...prev, ...newMetrics }));
  };

  // Reactive State Handlers
  const handleAddOrder = async (newOrder) => {
    const timestampStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const orderId = `FP-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullOrder = {
      ...newOrder,
      id: orderId,
      timestamp: timestampStr,
      branch: selectedBranch,
    };

    if (isFirebaseSynced) {
      await setDoc(doc(db, "orders", orderId), fullOrder).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`),
      );
    } else {
      setOrders((prev) => [fullOrder, ...prev]);
    }

    // Reactive Sales Metrics update
    setMetrics((prev) => ({
      ...prev,
      salesToday: prev.salesToday + fullOrder.amount,
    }));

    // Update the targets currentValue for Sales category
    setTargets((prev) =>
      prev.map((tgt) => {
        if (tgt.category === "Sell" && tgt.metric.includes("Sales")) {
          const newVal = tgt.currentValue + fullOrder.amount;
          if (isFirebaseSynced) {
            updateDoc(doc(db, "targets", tgt.id), {
              currentValue: newVal,
            }).catch((err) =>
              handleFirestoreError(
                err,
                OperationType.UPDATE,
                `targets/${tgt.id}`,
              ),
            );
          }
          return { ...tgt, currentValue: newVal };
        }
        return tgt;
      }),
    );
  };

  const handleAddTarget = async (newTarget) => {
    const targetId = `T-${targets.length + 1}`;
    const fullTarget = { ...newTarget, id: targetId };

    if (isFirebaseSynced) {
      await setDoc(doc(db, "targets", targetId), fullTarget).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `targets/${targetId}`),
      );
    } else {
      setTargets((prev) => [...prev, fullTarget]);
    }
  };

  const handleAddTask = async (newTask) => {
    const taskId = `PT-${Math.floor(400 + Math.random() * 100)}`;
    const fullTask = { ...newTask, id: taskId };

    if (isFirebaseSynced) {
      await setDoc(doc(db, "tasks", taskId), fullTask).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `tasks/${taskId}`),
      );
    } else {
      setTasks((prev) => [{ ...newTask, id: taskId }, ...prev]);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    if (isFirebaseSynced) {
      await updateDoc(doc(db, "tasks", taskId), { status: newStatus }).catch(
        (err) =>
          handleFirestoreError(err, OperationType.UPDATE, `tasks/${taskId}`),
      );
    } else {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            return { ...t, status: newStatus };
          }
          return t;
        }),
      );
    }

    // If transitioning from cooking to prepared, reactive add to cooked metrics
    if (newStatus === "Prepared" && targetTask.status !== "Prepared") {
      setMetrics((m) => ({
        ...m,
        productionItems: m.productionItems + targetTask.quantity,
      }));

      // Reactive update target cooked units
      setTargets((tg) =>
        tg.map((tgt) => {
          if (
            tgt.category === "Production" &&
            tgt.metric.toLowerCase().includes("cook")
          ) {
            const newVal = tgt.currentValue + targetTask.quantity;
            if (isFirebaseSynced) {
              updateDoc(doc(db, "targets", tgt.id), {
                currentValue: newVal,
              }).catch((err) =>
                handleFirestoreError(
                  err,
                  OperationType.UPDATE,
                  `targets/${tgt.id}`,
                ),
              );
            }
            return { ...tgt, currentValue: newVal };
          }
          return tgt;
        }),
      );
    }
  };

  const handleAddWaste = async (newWaste) => {
    const wasteId = `W-${Math.floor(920 + Math.random() * 80)}`;
    const fullWaste = {
      ...newWaste,
      id: wasteId,
      date: new Date().toISOString().split("T")[0],
    };

    if (isFirebaseSynced) {
      await setDoc(doc(db, "waste", wasteId), fullWaste).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `waste/${wasteId}`),
      );
    } else {
      setWasteRecords((prev) => [fullWaste, ...prev]);
    }

    // Reactive update target waste cost
    setTargets((tg) =>
      tg.map((tgt) => {
        if (
          tgt.category === "Waste" &&
          tgt.metric.toLowerCase().includes("waste")
        ) {
          const newVal = tgt.currentValue + fullWaste.cost;
          if (isFirebaseSynced) {
            updateDoc(doc(db, "targets", tgt.id), {
              currentValue: newVal,
            }).catch((err) =>
              handleFirestoreError(
                err,
                OperationType.UPDATE,
                `targets/${tgt.id}`,
              ),
            );
          }
          return { ...tgt, currentValue: newVal };
        }
        return tgt;
      }),
    );
  };

  const handleToggleClockStatus = async (employeeId) => {
    const emp = hoursData.find((e) => e.id === employeeId);
    if (!emp) return;

    const nextStatus =
      emp.status === "Clocked In" ? "Clocked Out" : "Clocked In";
    const addHours = nextStatus === "Clocked Out" ? 8.0 : 0;
    const newActual = parseFloat((emp.actualHours + addHours).toFixed(1));

    if (isFirebaseSynced) {
      await updateDoc(doc(db, "hours", employeeId), {
        status: nextStatus,
        actualHours: newActual,
      }).catch((err) =>
        handleFirestoreError(err, OperationType.UPDATE, `hours/${employeeId}`),
      );
    } else {
      setHoursData((prev) =>
        prev.map((e) => {
          if (e.id === employeeId) {
            return { ...e, status: nextStatus, actualHours: newActual };
          }
          return e;
        }),
      );
    }
  };

  const handleOrderRestock = async (itemId) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const updated = {
      ...item,
      stockLevel: 100,
      currentQty: item.reorderLevel + 120,
      status: "Healthy",
    };

    if (isFirebaseSynced) {
      await setDoc(doc(db, "inventory", itemId), updated).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `inventory/${itemId}`),
      );
    } else {
      setInventory((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    }
  };

  const handleUpdateWeeklyLog = (updatedLog: DailyOperationalLog) => {
    setWeeklyLogsMap((prev) => {
      const currentWeekLogs = prev[selectedWeekRange] || [];
      const updatedWeekLogs = currentWeekLogs.map((log) =>
        log.day === updatedLog.day ? updatedLog : log,
      );
      return {
        ...prev,
        [selectedWeekRange]: updatedWeekLogs,
      };
    });

    // Sync Sunday's log with active today metrics
    if (updatedLog.day === "Sun") {
      setMetrics((prev) => ({
        ...prev,
        salesToday: updatedLog.sales,
        wasteCost: updatedLog.waste,
        hoursScheduled: updatedLog.hours,
        productionTarget: updatedLog.productionTarget,
        productionItems: updatedLog.productionMade,
      }));
    }
  };

  type TabMeta = { id: string; label: string; icon: React.ReactNode };

  const primaryTabMeta: TabMeta[] = [
    { id: "Overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "Planning", label: "Planning", icon: <Boxes className="w-4 h-4" /> },
    { id: "Finance", label: "Finance", icon: <DollarSign className="w-4 h-4" /> },
    { id: "Reports", label: "Reports", icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  const operationsTabMeta: TabMeta[] = [
    { id: "Production", label: "Production", icon: <ChefHat className="w-4 h-4" /> },
    { id: "Waste", label: "Waste", icon: <Trash2 className="w-4 h-4" /> },
    { id: "Hours", label: "Hours", icon: <Clock className="w-4 h-4" /> },
    { id: "Suppliers", label: "Suppliers", icon: <Package className="w-4 h-4" /> },
    { id: "Allocation", label: "Resource Allocation", icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: "Energy", label: "Energy", icon: <Zap className="w-4 h-4" /> },
    { id: "Realtime", label: "Real-time", icon: <Activity className="w-4 h-4" /> },
  ];

  const moreToolsTabMeta: TabMeta[] = [
    { id: "Sell", label: "Sales", icon: <Coins className="w-4 h-4" /> },
    { id: "Target", label: "Targets", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "Advisor", label: "Advisor", icon: <BrainCircuit className="w-4 h-4" /> },
    { id: "Studio", label: "Studio", icon: <Wand2 className="w-4 h-4" /> },
    { id: "Analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const permittedTabIds = rolePermissions[userRole];
  const primaryTabs = primaryTabMeta.filter((tab) => permittedTabIds.includes(tab.id));
  const operationsTabs = operationsTabMeta.filter((tab) => permittedTabIds.includes(tab.id));
  const moreToolsTabs = moreToolsTabMeta.filter((tab) => permittedTabIds.includes(tab.id));
  const tabMeta = [...primaryTabs, ...operationsTabs, ...moreToolsTabs];

  const navigateToTab = (tabId: string) => {
    if (permittedTabIds.includes(tabId)) {
      setActiveTab(tabId);
      setIsMobileMenuOpen(false);
    }
  };

  // Switch to allowed tab if role changes and active tab is hidden
  useEffect(() => {
    if (!rolePermissions[userRole].includes(activeTab)) {
      setActiveTab("Overview");
    }
  }, [userRole, activeTab]);

  const renderActiveView = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <OverviewTab
            metrics={metrics}
            onNavigateTab={navigateToTab}
            targets={targets}
            userRole={userRole}
            availableTabIds={permittedTabIds}
            onUpdateMetrics={handleUpdateMetrics}
            irelandTime={irelandTime}
            weeklyLogs={weeklyLogs}
            onAddOrUpdateLog={handleUpdateWeeklyLog}
            selectedWeekRange={selectedWeekRange}
            onSelectedWeekRangeChange={setSelectedWeekRange}
            orders={orders}
            selectedBranch={selectedBranch}
            theme={theme}
            lowStockItems={lowStockItems}
          />
        );
      case "Advisor":
        return <AdvisorTab theme={theme} />;
      case "Realtime":
        return <RealtimeTab theme={theme} />;
      case "Sell": {
        const filteredOrders = orders.filter(
          (o) => !o.branch || o.branch === selectedBranch,
        );
        return <SellTab selectedBranch={selectedBranch} theme={theme} />;
      }
      case "Target":
        return <TargetTab targets={targets} onAddTarget={handleAddTarget} />;
      case "Reports":
        return (
          <ReportsTab
            theme={theme}
            orders={orders}
            targets={targets}
            tasks={tasks}
            wasteRecords={wasteRecords}
            hoursData={hoursData}
            inventory={inventory}
            weeklyLogs={weeklyLogs}
            alerts={alerts}
          />
        );
      case "Analytics":
        return <AnalyticsTab theme={theme} />;
      case "Allocation":
        return (
          <ResourceAllocationTab
            theme={theme}
            branches={["M&S Cork", "Tesco Cork", "Tesco Mahon"]}
          />
        );
      case "Studio":
        return <StudioTab theme={theme} />;
      case "Production":
        return (
          <ProductionTab
            recipes={recipes}
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        );
      case "Waste":
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
      case "Hours":
        return (
          <HoursTab
            hoursData={hoursData}
            onToggleClockStatus={handleToggleClockStatus}
            totalHoursScheduled={totalHours}
          />
        );
      case "Planning":
        return (
          <PlanningTab
            inventory={processedInventory}
            onOrderRestock={handleOrderRestock}
            selectedBranch={selectedBranch}
            theme={theme}
            weeklyLogs={weeklyLogs}
          />
        );
      case "Energy":
        return <EnergyTab theme={theme} weeklyLogs={weeklyLogs} />;
      case "Suppliers":
        return <SuppliersTab theme={theme} />;
      case "Finance":
        return <FinanceTab theme={theme} />;
      default:
        return (
          <OverviewTab
            metrics={metrics}
            onNavigateTab={navigateToTab}
            targets={targets}
            userRole={userRole}
            availableTabIds={permittedTabIds}
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
    }
  };

  // Dynamic production system health calculation
  const targetDeficitCount = targets.filter(
    (t) => t.currentValue < t.targetValue * 0.7,
  ).length;

  let healthLabel = "Healthy";
  let healthColorClass = "status-healthy";
  let healthTextClass = "status-healthy";
  let healthBgClass = "bg-emerald-500/10 border-emerald-550/20";

  if (
    metrics.aiHealthScore < 75 ||
    lowStockCount >= 3 ||
    targetDeficitCount >= 3
  ) {
    healthLabel = "Critical";
    healthColorClass = "status-critical";
    healthTextClass = "status-critical";
    healthBgClass = "bg-rose-500/10 border-rose-550/20";
  } else if (
    metrics.aiHealthScore < 90 ||
    lowStockCount > 0 ||
    targetDeficitCount > 0
  ) {
    healthLabel = "Warning";
    healthColorClass = "status-warning";
    healthTextClass = "status-warning";
    healthBgClass = "bg-amber-500/10 border-amber-550/20";
  }

  const healthTooltip = `System Health Status: ${healthLabel}\n• Operations Score: ${metrics.aiHealthScore}%\n• Low Stock Ingredients: ${lowStockCount}\n• Lagging Goals: ${targetDeficitCount}`;

  const activeAlerts = alerts.filter((alert) => alert.status !== "normal");
  const criticalAlertCount = activeAlerts.filter(
    (alert) => alert.status === "critical",
  ).length;

  const isLight = theme === "light";

  const renderNavigationButton = (tab: TabMeta) => {
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-current={isActive ? "page" : undefined}
        onClick={() => navigateToTab(tab.id)}
        className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors ${
          isActive
            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
            : "text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--text)]"
        }`}
      >
        <span className="w-4 h-4">{tab.icon}</span>
        <span className="truncate">{tab.label}</span>
      </button>
    );
  };

  if (!currentUser) {
    return (
      <LoginScreen
        theme={theme}
        onLogin={(username, role) => {
          const userObj = { username, role, email: "demo@foodpenguin.com" };
          localStorage.setItem("localCurrentUser", JSON.stringify(userObj));
          setCurrentUser(userObj);
          setUserRole(role as any);
        }}
      />
    );
  }
  return (    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--text)]">      <aside className="w-56 shrink-0 flex flex-col bg-[var(--surface)] border-r border-[var(--border)]">        <div className="p-4">          <div className="flex items-center gap-2.5">            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center text-sm font-bold shadow-sm">FP</div>            <div className="min-w-0">              <p className="text-sm font-bold leading-tight truncate">Food Penguin</p>              <p className="text-[10px] text-[var(--muted)]">{healthLabel}</p>            </div>          </div>        </div>        <nav className="flex-1 px-2 pb-4 space-y-0.5 overflow-y-auto">          {primaryTabs.map((tab) => renderNavigationButton(tab))}          {operationsTabs.length > 0 && (            <div className="pt-4 mt-3 space-y-0.5 border-t border-[var(--border)]">              {operationsTabs.map((tab) => renderNavigationButton(tab))}            </div>          )}          {moreToolsTabs.length > 0 && (            <div className="pt-4 mt-3 space-y-0.5 border-t border-[var(--border)]">              <div className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">More tools</div>              {moreToolsTabs.map((tab) => renderNavigationButton(tab))}            </div>          )}        </nav>        <div className="p-3 border-t border-[var(--border)]">          <div className="flex items-center justify-between text-xs">            <span className="font-medium text-[var(--text)] truncate">{currentUser?.username || "Skipper Koala"}</span>            <select value={userRole} onChange={(e) => setUserRole(e.target.value as any)} className="bg-transparent text-[var(--muted)] text-[10px] font-medium uppercase cursor-pointer focus:outline-none appearance-none">              <option value="Admin">Admin</option>              <option value="Manager">Manager</option>              <option value="Staff">Staff</option>              <option value="User">User</option>            </select>          </div>        </div>      </aside>      <div className="flex-1 flex flex-col min-w-0">        <header className="h-14 px-5 flex items-center justify-between bg-[var(--surface)] border-b border-[var(--border)]">          <div className="flex items-center gap-4">            <h1 className="text-sm font-bold">{tabMeta.find((t) => t.id === activeTab)?.label || activeTab}</h1>            <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value as any)} className="bg-transparent text-[var(--muted)] text-xs font-medium focus:outline-none cursor-pointer">              <option value="Marks & Spencer - Cork City">M&S Cork</option>              <option value="Tesco - Cork City">Tesco Cork</option>              <option value="Tesco - Mahon Point">Tesco Mahon</option>            </select>          </div>          <div className="flex items-center gap-3">            <span className="text-xs font-mono text-[var(--muted)]">{irelandTime || "—"}</span>            <button type="button" onClick={toggleTheme} className="p-1.5 rounded-md text-[var(--muted)] hover:bg-[var(--panel)] transition-colors">{isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</button>          </div>        </header>        <main className="flex-1 p-6 overflow-y-auto">          <div className="max-w-6xl mx-auto">            <AnimatePresence mode="wait" initial={false}>              <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>                {renderActiveView()}              </motion.div>            </AnimatePresence>          </div>        </main>      </div>    </div>  );}