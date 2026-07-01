import React, { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import { Reorder, motion } from "motion/react";
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
import { Sidebar } from "./components/Sidebar";
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
import DataAnalystTab from "./components/DataAnalystTab";
import ResourceAllocationTab from "./components/ResourceAllocationTab";
import ReportsTab from "./components/ReportsTab";
import LoginScreen from "./components/LoginScreen";
import { MS_PRODUCTS, TESCO_PRODUCTS } from "./components/SellTab";
import CapacityVarianceChart from "./components/CapacityVarianceChart";

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
  auth,
  db,
  handleFirestoreError,
  OperationType,
  onAuthStateChanged,
  signOut,
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
  Admin: [
    "Overview",
    "Branch_MS",
    "Branch_Tesco_Cork",
    "Branch_Tesco_Mahon",
    "Advisor",
    "Realtime",
    "Sell",
    "Target",
    "Production",
    "Waste",
    "Hours",
    "Planning",
    "Allocation",
    "Energy",
    "Suppliers",
    "Finance",
    "DataAnalyst",
    "Studio",
    "Reports",
  ],
  Manager: [
    "Overview",
    "Branch_MS",
    "Branch_Tesco_Cork",
    "Branch_Tesco_Mahon",
    "Advisor",
    "Realtime",
    "Target",
    "Production",
    "Waste",
    "Hours",
    "Planning",
    "Allocation",
    "Energy",
    "Suppliers",
    "Finance",
    "DataAnalyst",
    "Studio",
    "Reports",
  ],
  Staff: [
    "Overview",
    "Branch_MS",
    "Branch_Tesco_Cork",
    "Branch_Tesco_Mahon",
    "Advisor",
    "Realtime",
    "Sell",
    "Production",
    "Energy",
    "Waste",
    "Suppliers",
    "DataAnalyst",
    "Reports",
  ],
  User: ["Overview", "Advisor", "Realtime", "DataAnalyst"], // User can only view data
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

  const [metallicTheme, setMetallicTheme] = useState<
    "gold" | "silver" | "copper" | "crystal"
  >(() => {
    try {
      return (
        (localStorage.getItem("metallicTheme") as
          "gold" | "silver" | "copper" | "crystal") || "gold"
      );
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

  const changeMetallicTheme = (
    metal: "gold" | "silver" | "copper" | "crystal",
  ) => {
    setMetallicTheme(metal);
    try {
      localStorage.setItem("metallicTheme", metal);
    } catch (_) {}
  };

  // Apply Theme classes to root HTML element for complete Tailwind/custom utility integration
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("metal-gold", "metal-silver", "metal-copper");
    root.classList.add(`metal-${metallicTheme}`);
  }, [metallicTheme]);

  const getBoxLinerClass = (forceGold: boolean = false) => {
    if (forceGold) return "gold-liner-box";
    if (metallicTheme === "silver") return "silver-liner-box";
    if (metallicTheme === "copper") return "copper-liner-box";
    if (metallicTheme === "crystal") return "crystal-liner-box";
    return "gold-liner-box";
  };

  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<
    "Admin" | "Manager" | "Staff" | "User"
  >("Admin");
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    role: string;
    email?: string;
    photoURL?: string;
  } | null>(null);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          username: user.displayName || user.email || "Google User",
          role: "Admin",
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
        });
        setUserRole("Admin");
      } else {
        const storedUser = localStorage.getItem("localCurrentUser");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setCurrentUser(parsed);
            setUserRole(parsed.role);
          } catch (_) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    });
    return () => unsubscribe();
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
    "Marks & Spencer - Cork City" | "Tesco - Cork City" | "Tesco - Mahon Point" | "All Branches"
  >("All Branches");
  const [metrics, setMetrics] = useState<CoreMetrics>(initialMetrics);
  const [orders, setOrders] = useState<SalesOrder[]>(initialOrders);
  const [targets, setTargets] = useState<CompanyTarget[]>(initialTargets);

  const recipes = useMemo<Recipe[]>(() => {
    const isMS = selectedBranch === "Marks & Spencer - Cork City";
    const activeProducts = selectedBranch === "All Branches" 
      ? [...MS_PRODUCTS, ...TESCO_PRODUCTS].filter((v,i,a)=>a.findIndex(v2=>(v2.name===v.name))===i)
      : isMS ? MS_PRODUCTS : TESCO_PRODUCTS;

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
    const products = selectedBranch === "All Branches"
      ? [...MS_PRODUCTS, ...TESCO_PRODUCTS]
      : isMS ? MS_PRODUCTS : TESCO_PRODUCTS;

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
      "- Capacity forecasts are computed dynamically based on the active rolling index of completed production batches versus target.",
      '- Days highlighted with yellow "BOTTLENECK" alert badges exceed your configured threshold parameter limit.',
      "- Moving average view reduces short-term variation spikes to reveal systemic weekly production limits for senior management reporting.",
      "- Report intended for staff duty scheduling, shifts optimization, and oven heating resource conservation.",
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

  const allTabMeta = [
    {
      id: "Overview",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "Branch_MS",
      label: "M&S Cork City",
      icon: <Store className="w-4 h-4" />,
    },
    {
      id: "Branch_Tesco_Cork",
      label: "Tesco Cork City",
      icon: <Store className="w-4 h-4" />,
    },
    {
      id: "Branch_Tesco_Mahon",
      label: "Tesco Mahon Point",
      icon: <Store className="w-4 h-4" />,
    },
    {
      id: "Advisor",
      label: "Strategic Advisor",
      icon: <BrainCircuit className="w-4 h-4" />,
    },

    {
      id: "Sell",
      label: "Branch Product",
      icon: <Coins className="w-4 h-4" />,
    },
    {
      id: "Target",
      label: "Target",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: "Production",
      label: "Production",
      icon: <ChefHat className="w-4 h-4" />,
    },
    { id: "Waste", label: "Waste", icon: <Trash2 className="w-4 h-4" /> },
    { id: "Hours", label: "Hours", icon: <CalendarDays className="w-4 h-4" /> },
    { id: "Planning", label: "Planning", icon: <Boxes className="w-4 h-4" /> },
    {
      id: "Allocation",
      label: "Allocations",
      icon: <Boxes className="w-4 h-4" />,
    },
    { id: "Energy", label: "Energy", icon: <Zap className="w-4 h-4" /> },
    {
      id: "Suppliers",
      label: "Suppliers",
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: "Finance",
      label: "Finance",
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      id: "DataAnalyst",
      label: "Data Analyst",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "Reports",
      label: "Reports Hub",
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
  ];

  const tabMeta = allTabMeta.filter((tab) =>
    rolePermissions[userRole].includes(tab.id),
  );

  // Switch to allowed tab if role changes and active tab is hidden
  useEffect(() => {
    if (!rolePermissions[userRole].includes(activeTab)) {
      setActiveTab("Overview");
    }
  }, [userRole, activeTab]);

  // Sync selectedBranch when clicking on sidebar branch tabs
  useEffect(() => {
    if (activeTab === "Overview") {
      setSelectedBranch("All Branches");
    } else if (activeTab === "Branch_MS") {
      setSelectedBranch("Marks & Spencer - Cork City");
    } else if (activeTab === "Branch_Tesco_Cork") {
      setSelectedBranch("Tesco - Cork City");
    } else if (activeTab === "Branch_Tesco_Mahon") {
      setSelectedBranch("Tesco - Mahon Point");
    }
  }, [activeTab]);

  const renderActiveView = () => {
    switch (activeTab) {
      case "Overview":
      case "Branch_MS":
      case "Branch_Tesco_Cork":
      case "Branch_Tesco_Mahon":
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
            metallicTheme={metallicTheme}
            lowStockItems={lowStockItems}
          />
        );
      case "Advisor":
        return <AdvisorTab theme={theme} />;

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
      case "DataAnalyst":
        return (
          <DataAnalystTab
            theme={theme}
            orders={orders}
            targets={targets}
            wasteRecords={wasteRecords}
            hoursData={hoursData}
            inventory={processedInventory}
            weeklyLogs={weeklyLogs}
            selectedBranch={selectedBranch}
          />
        );
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
            theme={theme}
            metallicTheme={metallicTheme}
          />
        );
    }
  };

  // Dynamic production system health calculation
  const targetDeficitCount = targets.filter(
    (t) => t.currentValue < t.targetValue * 0.7,
  ).length;

  let healthLabel = "Healthy";
  let healthColorClass = "bg-emerald-500";
  let healthTextClass = "text-emerald-400";
  let healthBgClass = "bg-emerald-500/10 border-emerald-550/20";

  if (
    metrics.aiHealthScore < 75 ||
    lowStockCount >= 3 ||
    targetDeficitCount >= 3
  ) {
    healthLabel = "Critical";
    healthColorClass = "bg-rose-500";
    healthTextClass = "text-rose-400";
    healthBgClass = "bg-rose-500/10 border-rose-550/20";
  } else if (
    metrics.aiHealthScore < 90 ||
    lowStockCount > 0 ||
    targetDeficitCount > 0
  ) {
    healthLabel = "Warning";
    healthColorClass = "bg-amber-500";
    healthTextClass = "text-amber-400";
    healthBgClass = "bg-amber-500/10 border-amber-500/20";
  }

  const healthTooltip = `System Health Status: ${healthLabel}\n- Operations Score: ${metrics.aiHealthScore}%\n- Low Stock Ingredients: ${lowStockCount}\n- Lagging Goals: ${targetDeficitCount}`;

  const isLight = theme === "light";

  if (!currentUser) {
    return (
      <div className={`relative w-screen h-screen overflow-hidden p-[14px] ${isLight ? "bg-zinc-100" : "bg-black"}`}>
        {/* Versace Gold Frame Borders */}
        <div className="versace-frame-top" />
        <div className="versace-frame-bottom" />
        <div className="versace-frame-left" />
        <div className="versace-frame-right" />
        <LoginScreen
          theme={theme}
          onLogin={(username, role) => {
            const userObj = { username, role, email: "demo@foodpenguin.com" };
            localStorage.setItem("localCurrentUser", JSON.stringify(userObj));
            setCurrentUser(userObj);
            setUserRole(role as any);
          }}
        />
      </div>
    );
  }

  return (
    <div
      id="app-workspace"
      className={`h-screen w-screen overflow-hidden p-[1cm] box-border font-sans antialiased transition-colors duration-500 ${
        isLight
          ? "bg-zinc-100 text-zinc-900"
          : "bg-zinc-950 text-zinc-100"
      }`}
    >
      <div
        className={`h-full w-full overflow-hidden rounded-[28px] border shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_rgba(0,0,0,0.35)] ${
          isLight
            ? "bg-white border-zinc-200"
            : "bg-zinc-950 border-zinc-800"
        }`}
      >
        <div className="h-full w-full grid grid-cols-1 md:grid-cols-[252px_minmax(0,1fr)] xl:grid-cols-[252px_minmax(0,1fr)_312px]">
      {/* SIDEBAR: NAVIGATION */}
      <Sidebar
        isLight={isLight}
        healthColorClass={healthColorClass}
        healthTooltip={healthTooltip}
        healthLabel={healthLabel}
        healthBgClass={healthBgClass}
        healthTextClass={healthTextClass}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabMeta={tabMeta}
        lowStockCount={lowStockCount}
        currentUser={currentUser}
        userRole={userRole}
        setUserRole={setUserRole}
        isFirebaseSynced={isFirebaseSynced}
        onSignOut={async () => {
          localStorage.removeItem("localCurrentUser");
          setCurrentUser(null);
          await signOut(auth).catch(() => {});
        }}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-colors duration-500 ${isLight ? "bg-transparent" : "bg-transparent"}`}
      >
        {/* Global Toolbar */}
        <header
          className={`h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-all duration-200 border-b ${
            isLight
              ? "bg-white/95 border-zinc-200 text-zinc-900 shadow-sm backdrop-blur-xl"
              : "bg-zinc-950/95 border-zinc-900 text-white shadow-sm backdrop-blur-xl"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <h2
              className={`text-xs sm:text-sm font-sans font-bold shrink-0 ${isLight ? "text-zinc-900" : "text-white"}`}
            >
              {tabMeta.find((t) => t.id === activeTab)?.label || activeTab}
            </h2>
            <span
              className={`hidden lg:inline-block text-xs font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold border ${
                isLight
                  ? "bg-zinc-100 text-zinc-600 border-zinc-200"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800"
              }`}
            >
              Simple ops workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono text-emerald-500 font-bold uppercase tracking-widest block leading-none">
                Ireland Time (Dublin)
              </span>
              <span
                className={`text-xs font-mono font-bold block mt-1 ${isLight ? "text-zinc-800" : "text-zinc-100"}`}
              >
                {irelandTime || "Updating live..."}
              </span>
            </div>

            {/* Dynamic Day/Night Mode Switcher button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isLight ? "Dark" : "Day"} Mode`}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isLight
                  ? "bg-zinc-100 border border-zinc-200 text-zinc-700 active:scale-[0.98] hover:bg-zinc-200 shadow-sm"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {isLight ? (
                <Moon className="w-4.5 h-4.5 text-zinc-600" />
              ) : (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              )}
            </button>
          </div>
        </header>

        {/* Active view port rendering */}
        <main className="flex-1 p-3 md:p-5 overflow-y-auto md:overflow-hidden bg-transparent flex flex-col">
          <div className="mx-auto w-full h-full flex flex-col md:overflow-hidden pr-1">{renderActiveView()}</div>
        </main>
      </div>

      <aside
        className={`w-full h-full flex flex-col shrink-0 border-b md:border-b-0 md:border-r transition-all duration-300 ${isMobileMenuOpen ? "fixed inset-0 z-50 h-[100dvh] overflow-hidden md:relative md:inset-auto" : "relative z-40"} ${
          isLight
            ? "bg-white text-zinc-800 border-zinc-200"
            : "bg-zinc-950 text-zinc-100 border-zinc-800"
        }`}
      >
        {/* Brand Header */}
        <div
          className={`p-4 md:p-6 border-b flex items-center justify-between gap-3 transition-colors ${isLight ? "border-zinc-150" : "border-zinc-900"}`}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 relative group shrink-0">
              <span className="font-bold text-white font-sans text-lg tracking-tighter select-none">
                FP
              </span>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${healthColorClass} rounded-full border border-black animate-pulse`}
                title={healthTooltip}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h1
                  className={`text-sm font-bold font-sans tracking-tight leading-tight truncate ${isLight ? "text-zinc-900" : "text-white"}`}
                >
                  Food Penguin
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold border shrink-0 cursor-help ${healthBgClass} ${healthTextClass}`}
                  title={healthTooltip}
                >
                  <span
                    className={`w-1 h-1 rounded-full ${healthColorClass} animate-pulse`}
                  />
                  {healthLabel}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono tracking-wider uppercase leading-none block mt-0.5 ${isLight ? "text-zinc-500" : "text-zinc-500"}`}
              >
                Limited
              </span>
            </div>
          </div>
          {/* Mobile Menu Toggle Button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors shrink-0 ${isLight ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Wrapper */}
        <div
          className={`flex-col flex-1 overflow-y-auto ${isMobileMenuOpen ? "flex" : "hidden md:flex"}`}
        >
          <div className="md:hidden">
          {/* Aesthetic & Theme Panel */}
          <div className={`mx-4 mt-4 p-3 gold-liner-box transition-all ${
            isLight ? "bg-amber-50/20" : "bg-zinc-950/40"
          }`}>
            <div className="flex items-center gap-1.5 mb-2.5 pb-1.5 border-b border-yellow-500/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse shrink-0" />
              <span className="text-[10px] font-sans font-black uppercase tracking-wider text-yellow-500">
                Aesthetic Studio
              </span>
            </div>
            
            {/* Dark & Day Mode Select */}
            <div className="flex flex-col gap-1 mb-2.5">
              <span className={`text-[7.5px] uppercase font-mono font-bold ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>
                Visual Mode
              </span>
              <div className="flex rounded-lg p-0.5 bg-zinc-900/10 dark:bg-black/40 border border-zinc-200/50 dark:border-zinc-800/80">
                <button className={`btn-interactive flex-1 flex items-center justify-center gap-1 py-1 rounded text-[8.5px] font-bold uppercase transition-all cursor-pointer ${ isLight ? "bg-white text-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-zinc-500 hover:text-zinc-300" }`} type="button" onClick={() => setTheme("light")}>
                  <Sun className="w-3 h-3 text-amber-500" /> Day
                </button>
                <button className={`btn-interactive flex-1 flex items-center justify-center gap-1 py-1 rounded text-[8.5px] font-bold uppercase transition-all cursor-pointer ${ !isLight ? "bg-zinc-800 text-white shadow-[0_1px_3px_rgba(0,0,0,0.4)]" : "text-zinc-500 hover:text-zinc-700" }`} type="button" onClick={() => setTheme("dark")}>
                  <Moon className="w-3 h-3 text-zinc-400" /> Night
                </button>
              </div>
            </div>

            {/* Metallic Accent Presets */}
            <div className="flex flex-col gap-1">
              <span className={`text-[7.5px] uppercase font-mono font-bold ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>
                Metallic Edition
              </span>
              <div className="grid grid-cols-3 gap-1">
                {/* Gold Button */}
                <button className={`btn-interactive py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all border cursor-pointer hover:-translate-y-0.5 active:scale-95 ${ metallicTheme === "gold" ? "bg-gradient-to-br from-[#dfa033] to-[#6a460b] text-white border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.4)] font-extrabold" : isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" }`} type="button" onClick={() => changeMetallicTheme("gold")}>
                  🥇 Gold
                </button>

                {/* Silver Button */}
                <button className={`btn-interactive py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all border cursor-pointer hover:-translate-y-0.5 active:scale-95 ${ metallicTheme === "silver" ? "bg-gradient-to-br from-[#b0b5b9] to-[#3a4146] text-white border-zinc-400 shadow-[0_0_8px_rgba(148,163,184,0.4)] font-extrabold" : isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" }`} type="button" onClick={() => changeMetallicTheme("silver")}>
                  🥈 Silver
                </button>

                {/* Copper Button */}
                <button className={`btn-interactive py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all border cursor-pointer hover:-translate-y-0.5 active:scale-95 ${ metallicTheme === "copper" ? "bg-gradient-to-br from-[#c96c42] to-[#471d0b] text-white border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.4)] font-extrabold" : isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" }`} type="button" onClick={() => changeMetallicTheme("copper")}>
                  🥉 Copper
                </button>
              </div>
            </div>

            {/* Note confirming Gold Liners */}
            <div className="mt-2 text-[7.5px] leading-tight font-sans text-zinc-500 dark:text-zinc-400 flex items-start gap-1">
              <span className="text-[9px]">👑</span>
              <span>
                <strong>24k Gold Liner</strong> is wrapped around all container boxes to elevate margin security.
              </span>
            </div>
          </div>

          {/* Global Branches Overview */}

          <div
            className={`mx-4 mt-4 p-3 gold-liner-box transition-all ${isLight ? "bg-zinc-50 shadow-sm" : "bg-zinc-900 shadow"}`}
          >
            <div
              className={`flex items-center gap-2 mb-3 pb-2 border-b ${isLight ? "border-zinc-200" : "border-zinc-800/80"}`}
            >
              <Store
                className={`w-3.5 h-3.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
              />
              <span
                className={`text-[10px] font-mono tracking-wider uppercase font-bold ${isLight ? "text-zinc-600" : "text-zinc-400"}`}
              >
                Global Branches
              </span>
            </div>
            <div className="space-y-1.5 font-sans">
              {(
                [
                  "Marks & Spencer - Cork City",
                  "Tesco - Cork City",
                  "Tesco - Mahon Point",
                ] as const
              ).map((branch) => {
                const shortName = branch
                  .replace("Marks & Spencer", "M&S")
                  .replace(" - Cork City", " Cork")
                  .replace(" - Mahon Point", " Mahon");
                const isSelected = selectedBranch === branch;
                return (
                  <div
                    key={branch}
                    onClick={() => setSelectedBranch(branch)}
                    className={`flex justify-between items-center text-[10px] p-2 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? isLight
                          ? "bg-orange-50 border-orange-200"
                          : "bg-orange-500/10 border-orange-500/30"
                        : isLight
                          ? "bg-white border-zinc-200  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-100"
                          : "bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-900"
                    }`}
                  >
                    <span
                      className={`truncate mr-2 ${
                        isSelected
                          ? isLight
                            ? "text-orange-700 font-bold"
                            : "text-orange-400 font-bold"
                          : isLight
                            ? "text-zinc-700 font-medium"
                            : "text-zinc-300 font-medium"
                      }`}
                    >
                      {shortName}
                    </span>
                    <span
                      className={`font-mono tracking-tight shrink-0 flex items-center gap-1.5 ${isLight ? "text-emerald-500 font-bold" : "text-[9px] px-2 py-0.5 rounded-full uppercase bg-3d-silver-dark metallic-base drop-shadow-md animate-pulse font-black"}`}
                    >
                      {isLight && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      )}{" "}
                      Live
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          </div>

          {/* Navigation Actions */}
          <nav className="flex-1 p-4 mt-2 space-y-1 overflow-y-auto">
            {tabMeta.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button className={`btn-interactive w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors duration-200 ${ isActive ? isLight ? "bg-zinc-100 text-zinc-950 font-extrabold shadow-sm" : "bg-zinc-900 text-white font-bold shadow-inner" : isLight ? "text-zinc-600 text-zinc-600 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-50 hover:text-zinc-900" : "text-zinc-500 hover:bg-zinc-905 hover:text-white" }`} key={tab.id} onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}>
                  <span
                    className={`w-2 h-2 rounded-full transition-all duration-300 shrink-0 ${
                      isActive
                        ? tab.id === "Real-time"
                          ? "bg-rose-500 animate-pulse"
                          : "bg-orange-500 scale-125"
                        : isLight
                          ? "bg-transparent border border-zinc-300"
                          : "bg-transparent border border-zinc-800"
                    }`}
                  />
                  <span className="flex-1 flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-2">
                      <span
                        className={
                          isActive
                            ? "text-orange-500"
                            : isLight
                              ? "text-zinc-400"
                              : "text-zinc-500"
                        }
                      >
                        {tab.icon}
                      </span>
                      {tab.label}
                    </span>
                    {(tab.id === "Overview" || tab.id === "Planning") && lowStockCount > 0 && (
                      <span className="bg-red-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse shrink-0">
                        {lowStockCount}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Capacity Card (matches Bento Grid illustration specs) */}
          <div className="px-2 py-1.5">
            <div
              className={`p-3 rounded-xl border relative overflow-hidden group transition-all duration-200 ${
                isLight
                  ? "bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm"
                  : "bg-zinc-900 border-zinc-800 text-white"
              }`}
            >
              <div
                className={`absolute right-0 top-0 w-24 h-24 bg-gradient-to-br rounded-full filter blur-2xl pointer-events-none ${
                  isLight
                    ? "from-orange-500/5"
                    : "from-orange-500/5 to-transparent"
                }`}
              />

              <div className="flex items-center justify-between mb-2">
                <button className={`btn-interactive flex items-center gap-1.5 transition-colors cursor-pointer text-left focus:outline-none ${ isLight ? " hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-zinc-900" : "hover:text-white" }`} onClick={() => setIsCapacityExpanded(!isCapacityExpanded)} title="Click to view daily breakdown">
                  <p
                    className={`text-xs uppercase font-mono font-bold tracking-wider select-none ${
                      isLight ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    Weekly Capacity
                  </p>
                  {isCapacityExpanded ? (
                    <ChevronUp
                      className={`w-3.5 h-3.5 transition-all transform  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:scale-110 ${isLight ? "text-zinc-500 hover:text-zinc-800" : "text-zinc-400 hover:text-white"}`}
                    />
                  ) : (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-all transform  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:scale-110 ${isLight ? "text-zinc-500 hover:text-zinc-800" : "text-zinc-400 hover:text-white"}`}
                    />
                  )}
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 text-xs text-orange-400 font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                    Forecast AI
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs font-mono font-bold px-1.5 py-0.5 rounded border select-none transition-all ${
                      aiAccuracyConfidence >= 90
                        ? isLight
                          ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : aiAccuracyConfidence >= 80
                          ? isLight
                            ? "text-amber-600 bg-amber-50 border-amber-200"
                            : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : isLight
                            ? "text-rose-600 bg-rose-50 border-rose-200"
                            : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                    }`}
                    title={`AI Model Confidence: ${aiAccuracyConfidence}% (calculated dynamically based on historic variance between actual logs and model projections)`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full ${
                        aiAccuracyConfidence >= 90
                          ? "bg-emerald-500 animate-pulse"
                          : aiAccuracyConfidence >= 80
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                    />
                    Accuracy Conf: {aiAccuracyConfidence}%
                  </span>
                </div>
              </div>

              {/* Branch Overlay Selector (Gold Liner style) */}
              <div
                className={`flex flex-col gap-2 mt-1 mb-2.5 p-2 rounded-lg font-mono text-xs select-none border transition-all ${
                  isLight
                    ? "bg-zinc-100/65 border-zinc-200 shadow-sm"
                    : "bg-zinc-950/30 border-zinc-800/45"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex items-center gap-1.5 font-bold ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${overlayBranches.length > 0 ? "bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]" : "bg-zinc-400"}`}
                    />
                    Overlay Branch Trends
                  </span>
                  {overlayBranches.length > 0 && (
                    <button className={`btn-interactive px-1.5 py-0.5 rounded text-xs font-bold border cursor-pointer hover:-translate-y-0.5 active:scale-95 transition-all ${ isLight ? "bg-zinc-200 hover:bg-zinc-300 border-zinc-300 text-zinc-700" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300" }`} onClick={() => setOverlayBranches([])}>
                      Clear Overlay
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      "Marks & Spencer - Cork City",
                      "Tesco - Cork City",
                      "Tesco - Mahon Point",
                    ] as const
                  ).map((branch) => {
                    const isCurrent = branch === selectedBranch;
                    const isSelected = overlayBranches.includes(branch);
                    const shortName = branch
                      .replace("Marks & Spencer", "M&S")
                      .replace(" - Cork City", " Cork")
                      .replace(" - Mahon Point", " Mahon");

                    // Theme colors config
                    const colors: Record<
                      string,
                      { bg: string; text: string; activeBg: string }
                    > = {
                      "Marks & Spencer - Cork City": {
                        bg: isLight
                          ? "bg-amber-50 border-amber-200/50 text-amber-700"
                          : "bg-amber-950/20 border-amber-900/30 text-amber-500",
                        text: "text-amber-500",
                        activeBg:
                          "bg-amber-500 text-zinc-950 border-amber-400 shadow-[0_0_8px_rgba(234,179,8,0.45)]",
                      },
                      "Tesco - Cork City": {
                        bg: isLight
                          ? "bg-blue-50 border-blue-200/50 text-blue-700"
                          : "bg-blue-950/20 border-blue-900/30 text-blue-400",
                        text: "text-blue-400",
                        activeBg:
                          "bg-blue-600 text-white border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.45)]",
                      },
                      "Tesco - Mahon Point": {
                        bg: isLight
                          ? "bg-emerald-50 border-emerald-200/50 text-emerald-700"
                          : "bg-emerald-950/20 border-emerald-900/30 text-emerald-400",
                        text: "text-emerald-400",
                        activeBg:
                          "bg-emerald-600 text-white border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]",
                      },
                    };

                    const style = colors[branch];

                    if (isCurrent) {
                      return (
                        <div
                          key={branch}
                          className={`px-2 py-1 rounded-md border text-xs font-bold flex items-center gap-1 cursor-default opacity-95 ${style.activeBg}`}
                        >
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                          {shortName} (Active)
                        </div>
                      );
                    }

                    return (
                      <button className={`btn-interactive px-2 py-1 rounded-md border text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 hover:-translate-y-0.5 active:scale-[0.98] ${ isSelected ? style.activeBg : `${isLight ? "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-100" : "bg-zinc-900 border-zinc-800/60 text-zinc-400 hover:bg-zinc-800"} opacity-75` }`} key={branch} onClick={() => {
                          setOverlayBranches((prev) =>
                            prev.includes(branch)
                              ? prev.filter((b) => b !== branch)
                              : [...prev, branch],
                          );
                        }}>
                        {shortName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Premium, interactive, layered capacity progress bar */}
              <div
                className={`relative h-3 rounded-full overflow-hidden mt-3 shadow-inner ${
                  isLight ? "bg-zinc-200" : "bg-zinc-800/80"
                }`}
              >
                {/* Visual 'Safe Zone' range marker (40% to bottleneckThreshold) */}
                {bottleneckThreshold > 40 && (
                  <motion.div
                    className={`absolute top-0 h-full border-l border-r border-dashed z-0 ${
                      isLight
                        ? "bg-emerald-500/[0.08] border-emerald-500/25"
                        : "bg-emerald-500/[0.06] border-emerald-400/20"
                    }`}
                    animate={{
                      left: "40%",
                      width: `${bottleneckThreshold - 40}%`,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    title={`Optimal Safe Zone: 40% to ${bottleneckThreshold}%`}
                  />
                )}

                {/* Visual range indicator: Distance from Projected to Bottleneck Threshold */}
                {projectedCapacityPct <= bottleneckThreshold ? (
                  <motion.div
                    className={`absolute top-0 h-full ${isLight ? "bg-emerald-500/20" : "bg-emerald-500/30"}`}
                    animate={{
                      left: `${projectedCapacityPct}%`,
                      width: `${bottleneckThreshold - projectedCapacityPct}%`,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    title={`Safe Buffer: ${bottleneckThreshold - projectedCapacityPct}%`}
                  />
                ) : (
                  <motion.div
                    className={`absolute top-0 h-full animate-pulse ${isLight ? "bg-rose-500/40" : "bg-rose-500/50"}`}
                    animate={{
                      left: `${bottleneckThreshold}%`,
                      width: `${projectedCapacityPct - bottleneckThreshold}%`,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    title={`Threshold Overflow: ${projectedCapacityPct - bottleneckThreshold}%`}
                  />
                )}

                {/* Solid Current Capacity Bar */}
                <motion.div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.2)]"
                  animate={{ width: `${capacityPct}%` }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  title={`Current load: ${capacityPct}%`}
                />

                {/* Optional dynamic striped extension for projected excess over current */}
                {projectedCapacityPct > capacityPct && (
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-amber-500/40"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(245, 158, 11, 0.2) 4px, rgba(245, 158, 11, 0.2) 8px)",
                    }}
                    animate={{
                      left: `${capacityPct}%`,
                      width: `${projectedCapacityPct - capacityPct}%`,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    title={`Projected increase: ${projectedCapacityPct - capacityPct}%`}
                  />
                )}

                {/* Vertical dashed line indicator to point to the projected load */}
                <motion.div
                  className="absolute top-0 h-full w-0.5 border-r border-dashed border-white/70 z-10"
                  animate={{ left: `${projectedCapacityPct}%` }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  title={`7-Day Projection Target: ${projectedCapacityPct}%`}
                />

                {/* Vertical marker for User-set Bottleneck Threshold */}
                <motion.div
                  className="absolute top-0 h-full w-0.5 bg-rose-500 z-20"
                  animate={{ left: `${bottleneckThreshold}%` }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  title={`Bottleneck Threshold: ${bottleneckThreshold}%`}
                />

                {/* Overlay branch markers */}
                {overlayBranches.map((name) => {
                  if (name === selectedBranch) return null;
                  const val =
                    branchProjectionData[
                      name as keyof typeof branchProjectionData
                    ];
                  if (!val) return null;
                  const bData = val as {
                    current: number;
                    projected: number;
                    color: string;
                  };
                  const shortName = name
                    .replace("Marks & Spencer", "M&S")
                    .replace(" - Cork City", " Cork")
                    .replace(" - Mahon Point", " Mahon");
                  return (
                    <motion.div
                      key={name}
                      className="absolute top-0 h-full w-1 rounded-full border border-white/20 z-30 shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                      style={{ backgroundColor: bData.color }}
                      animate={{ left: `${bData.projected}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 20,
                      }}
                      title={`${shortName} Projected Capacity: ${bData.projected}%`}
                    />
                  );
                })}
              </div>

              {/* Text details and comparison metrics */}
              <div
                className={`space-y-1.5 mt-3 pt-2.5 border-t font-mono text-xs leading-relaxed ${
                  isLight ? "border-zinc-200" : "border-zinc-800/60"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`flex items-center gap-1 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />{" "}
                    Current Load:
                  </span>
                  <span
                    className={`font-bold ${isLight ? "text-zinc-800" : "text-white"}`}
                  >
                    {capacityPct}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`flex items-center gap-1 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{" "}
                    7-Day Forecast:
                  </span>
                  <span
                    className={`font-bold ${projectedCapacityPct >= capacityPct ? "text-amber-500" : "text-emerald-500"}`}
                  >
                    {projectedCapacityPct}%{" "}
                    {projectedCapacityPct >= capacityPct ? "up" : "down"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span
                    className={`flex items-center gap-1 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500/15 border border-dashed border-emerald-500/40" />{" "}
                    Safe Zone (40% - {bottleneckThreshold}%):
                  </span>
                  <span className="font-bold text-emerald-500">Active</span>
                </div>

                {/* Branch Projections Overlay Comparison */}
                {overlayBranches.length > 0 && (
                  <div
                    className={`mt-2 pt-2 border-t border-dashed space-y-1.5 ${
                      isLight ? "border-zinc-200" : "border-zinc-800/40"
                    }`}
                  >
                    <p
                      className={`text-xs uppercase tracking-wider font-bold mb-1 select-none ${
                        isLight ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      Projected Branch Comparison
                    </p>
                    {Object.entries(branchProjectionData).map(([name, val]) => {
                      const isCurrentBranch = name === selectedBranch;
                      const isSelected = overlayBranches.includes(name);
                      if (!isCurrentBranch && !isSelected) return null;
                      const bData = val as {
                        current: number;
                        projected: number;
                        color: string;
                      };
                      const shortName = name
                        .replace("Marks & Spencer", "M&S")
                        .replace(" - Cork City", " Cork")
                        .replace(" - Mahon Point", " Mahon");
                      return (
                        <div
                          key={name}
                          className="flex justify-between items-center"
                        >
                          <span
                            className={`flex items-center gap-1.5 ${
                              isLight ? "text-zinc-600" : "text-zinc-300"
                            } ${isCurrentBranch ? "font-bold" : ""}`}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full animate-pulse"
                              style={{ backgroundColor: bData.color }}
                            />
                            {shortName}:
                          </span>
                          <span
                            className="font-bold font-mono text-xs"
                            style={{ color: bData.color }}
                          >
                            {bData.projected}%{" "}
                            {isCurrentBranch && (
                              <span className="text-xs uppercase tracking-wide font-black pl-1">
                                (Active)
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p
                  className={`text-xs leading-normal mt-1 pt-1 italic font-sans border-t ${
                    isLight
                      ? "border-zinc-200 text-zinc-400"
                      : "border-zinc-800/20 text-zinc-500"
                  }`}
                >
                  Estimated from rolling week rates & trend momentum.
                </p>
              </div>

              {/* Expandable daily capacity breakdown block */}
              {isCapacityExpanded && (
                <div
                  className={`mt-4 pt-3.5 border-t font-mono text-xs space-y-3 animate-fadeIn duration-300 ${isLight ? "border-zinc-205" : "border-zinc-800/80"}`}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-bold uppercase tracking-wider text-xs ${isLight ? "text-zinc-500" : "text-zinc-555"}`}
                    >
                      Daily Capacity Breakdown
                    </p>
                    <div className="flex items-center gap-1.5">
                      {/* Global 'Clear All Filters' Button (Gold Liner Style) */}
                      <button className={`btn-interactive p-1 px-1.5 rounded hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center gap-1 border font-bold text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${ capacitySortBy !== "date" || capacitySmoothing !== "raw" || capacityImpactFilter !== "all" || bulkSelectedDays.length > 0 ? isLight ? "bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 shadow-[0_0_8px_rgba(234,179,8,0.25)] cursor-pointer" : "bg-yellow-500/15 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/25 shadow-[0_0_12px_rgba(234,179,8,0.2)] cursor-pointer" : "opacity-40 cursor-not-allowed " + (isLight ? "bg-zinc-100 border-zinc-200 text-zinc-400" : "bg-zinc-800/50 border-zinc-700/35 text-zinc-600") }`} onClick={() => {
                          setCapacitySortBy("date");
                          setCapacitySmoothing("raw");
                          setCapacityImpactFilter("all");
                          setBulkSelectedDays([]);
                        }} disabled={
                          capacitySortBy === "date" &&
                          capacitySmoothing === "raw" &&
                          capacityImpactFilter === "all" &&
                          bulkSelectedDays.length === 0
                        } title="Clear all daily capacity filters, sorting, smoothing, and bulk selections">
                        <RotateCcw
                          className={`w-2.5 h-2.5 ${capacitySortBy !== "date" || capacitySmoothing !== "raw" || capacityImpactFilter !== "all" || bulkSelectedDays.length > 0 ? "text-yellow-500" : ""}`}
                        />
                        <span>Clear Filters</span>
                      </button>
                      <button
                        onClick={handleExportCapacityCSV}
                        className={`p-1 px-1.5 rounded  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-white transition-all cursor-pointer flex items-center gap-1 border ${
                          isLight
                            ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                            : "bg-zinc-800 border-zinc-700/40 text-zinc-400 hover:text-white hover:bg-zinc-700"
                        }`}
                        title="Download daily capacity report as CSV"
                      >
                        <Download className="w-2.5 h-2.5 text-orange-400" />
                        <span
                          className={`text-xs font-bold uppercase tracking-wide ${isLight ? "text-zinc-700  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-zinc-900" : "text-zinc-300"}`}
                        >
                          CSV
                        </span>
                      </button>
                      <button
                        onClick={handleExportCapacityPDF}
                        className={`p-1 px-1.5 rounded  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-white transition-all cursor-pointer flex items-center gap-1 border ${
                          isLight
                            ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                            : "bg-zinc-800 border-zinc-700/40 text-zinc-400 hover:text-white hover:bg-zinc-700"
                        }`}
                        title="Download styled PDF projection summary report"
                      >
                        <Download className="w-2.5 h-2.5 text-amber-500" />
                        <span
                          className={`text-xs font-bold uppercase tracking-wide ${isLight ? "text-zinc-700  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-zinc-900" : "text-zinc-300"}`}
                        >
                          PDF
                        </span>
                      </button>
                      <button className={`btn-interactive p-1 px-1.5 rounded hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-white transition-all cursor-pointer flex items-center gap-1 border ${ isLight ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900" : "bg-zinc-800 border-zinc-700/40 text-zinc-400 hover:text-white hover:bg-zinc-700" }`} onClick={() => setIsScheduleReportModalOpen(true)} title="Schedule automated email report delivery">
                        <Mail className="w-2.5 h-2.5 text-rose-400" />
                        <span
                          className={`text-xs font-bold uppercase tracking-wide ${isLight ? "text-zinc-700  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-zinc-900" : "text-zinc-300"}`}
                        >
                          Schedule
                        </span>
                      </button>
                      <span className="text-xs text-zinc-400 font-semibold ml-1">
                        [Current vs Proj]
                      </span>
                    </div>
                  </div>

                  {/* Sort Option Sorter Selector Dropdown & Smoothing Toggle */}
                  <div
                    className={`flex flex-col gap-2 p-2.5 rounded-xl border ${
                      isLight
                        ? "bg-zinc-100 border-zinc-200"
                        : "bg-zinc-950/80 border-zinc-900/60"
                    }`}
                  >
                    {/* Impact Filter Dropdown */}
                    <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-zinc-200 dark:border-zinc-800/50">
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-zinc-500 font-bold" : "text-zinc-500"}`}
                        title="Filter daily breakdown items by impact severity"
                      >
                        Impact Filter:
                      </span>
                      <select className={`input-gold-glow text-xs rounded px-2 py-0.5 font-mono focus:outline-none cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 font-bold border focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_12px_rgba(234,179,8,0.4)] ${ isLight ? "bg-white border-zinc-200 text-amber-600" : "bg-zinc-900 border-zinc-800/80 text-amber-400 hover:text-amber-300" }`} id="capacity-impact-filter-select" value={capacityImpactFilter} onChange={(e) =>
                          setCapacityImpactFilter(
                            e.target.value as "all" | "critical" | "low"
                          )
                        }>
                        <option
                          value="all"
                          className={
                            isLight
                              ? "bg-white text-zinc-900 font-bold"
                              : "bg-zinc-950 text-white font-bold"
                          }
                        >
                          All Levels
                        </option>
                        <option
                          value="critical"
                          className={
                            isLight
                              ? "bg-white text-zinc-900 font-bold"
                              : "bg-zinc-950 text-white font-bold"
                          }
                        >
                          Critical Only
                        </option>
                        <option
                          value="low"
                          className={
                            isLight
                              ? "bg-white text-zinc-900 font-bold"
                              : "bg-zinc-950 text-white font-bold"
                          }
                        >
                          Low Impact
                        </option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-zinc-500" : "text-zinc-500"}`}
                      >
                        Order by:
                      </span>
                      <select className={`input-gold-glow text-xs rounded px-2 py-0.5 font-mono focus:outline-none cursor-pointer transition-all font-bold border ${ isLight ? "bg-white border-zinc-200 text-amber-600" : "bg-zinc-900 border-zinc-800/80 text-amber-400 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-amber-300" }`} value={capacitySortBy} onChange={(e) =>
                          setCapacitySortBy(
                            e.target.value as "date" | "bottleneck" | "custom",
                          )
                        }>
                        <option
                          value="date"
                          className={
                            isLight
                              ? "bg-white text-zinc-900"
                              : "bg-zinc-950 text-white"
                          }
                        >
                          Date (Chronological)
                        </option>
                        <option
                          value="bottleneck"
                          className={
                            isLight
                              ? "bg-white text-zinc-900"
                              : "bg-zinc-950 text-white"
                          }
                        >
                          Bottleneck Intensity
                        </option>
                        <option
                          value="custom"
                          className={
                            isLight
                              ? "bg-white text-zinc-900"
                              : "bg-zinc-950 text-white"
                          }
                        >
                          Custom Priority
                        </option>
                      </select>
                    </div>

                    {/* Smoothing Mode Toggle */}
                    <div
                      className={`flex items-center justify-between gap-1.5 pt-1.5 border-t ${isLight ? "border-zinc-200" : "border-zinc-900/60"}`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-zinc-500 font-bold" : "text-zinc-500"}`}
                        title="3-Day moving average smoothing vs raw data"
                      >
                        Data View:
                      </span>
                      <div
                        className={`flex rounded p-0.5 border ${isLight ? "bg-zinc-200 border-zinc-200" : "bg-zinc-900 border-zinc-800/80"}`}
                      >
                        <button className={`btn-interactive text-xs px-2 py-0.5 rounded font-mono font-bold transition-all uppercase ${ capacitySmoothing === "raw" ? "bg-orange-500 text-white shadow-sm" : isLight ? "text-zinc-600 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-zinc-900 hover:bg-zinc-300" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" }`} onClick={() => setCapacitySmoothing("raw")}>
                          Raw
                        </button>
                        <button className={`btn-interactive text-xs px-2 py-0.5 rounded font-mono font-bold transition-all uppercase flex items-center gap-0.5 ${ capacitySmoothing === "smoothed" ? "bg-orange-500 text-white shadow-sm" : isLight ? "text-zinc-600 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-zinc-900 hover:bg-zinc-300" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" }`} onClick={() => setCapacitySmoothing("smoothed")} title="3-Day Moving Average Smoothed">
                          Smooth 3D
                        </button>
                      </div>
                    </div>

                    {/* Compare Mode Toggle */}
                    <div
                      className={`flex items-center justify-between gap-1.5 pt-1.5 border-t ${isLight ? "border-zinc-200" : "border-zinc-900/60"}`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1 ${compareModeEnabled ? "text-yellow-600 dark:text-yellow-500 font-extrabold" : isLight ? "text-zinc-500" : "text-zinc-500"}`}
                        title="Compare initial AI forecast with manual simulation value"
                      >
                        <GitCompare
                          className={`w-3 h-3 ${compareModeEnabled ? "text-yellow-500" : ""}`}
                        />
                        Compare Mode:
                      </span>
                      <button className={`btn-interactive text-xs font-bold px-2 py-0.5 rounded transition-all uppercase tracking-wider border cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] ${ compareModeEnabled ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-zinc-950 border-transparent shadow-[0_0_8px_rgba(234,179,8,0.25)]" : isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800" }`} onClick={() =>
                          setCompareModeEnabled(!compareModeEnabled)
                        } type="button">
                        {compareModeEnabled ? "COMPARE ON" : "OFF"}
                      </button>
                    </div>

                    {/* Quick Adjust Mode Toggle */}
                    <div
                      className={`flex flex-col gap-1.5 pt-2 border-t ${isLight ? "border-zinc-200" : "border-zinc-900/60"}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1 ${
                            quickAdjustEnabled
                              ? "text-orange-500 font-extrabold"
                              : isLight
                                ? "text-zinc-500"
                                : "text-zinc-500"
                          }`}
                          title="Toggle manual vs AI capacity adjustments"
                        >
                          <Wand2
                            className={`w-3 h-3 ${quickAdjustEnabled ? "animate-pulse text-orange-500" : ""}`}
                          />
                          Quick Adjust:
                        </span>
                        <button className={`btn-interactive text-xs font-bold px-2 py-0.5 rounded transition-all uppercase tracking-wider border cursor-pointer ${ quickAdjustEnabled ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-sm" : isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800" }`} onClick={() => {
                            setQuickAdjustEnabled(!quickAdjustEnabled);
                            if (quickAdjustEnabled) {
                              handleResetOverrides();
                            }
                          }} type="button">
                          {quickAdjustEnabled ? "What-If ON" : "OFF"}
                        </button>
                      </div>

                      {quickAdjustEnabled && (
                        <div
                          className={`p-2 mt-1.5 rounded-xl border flex flex-col gap-1.5 ${isLight ? "bg-amber-50/50 border-amber-200" : "bg-amber-950/20 border-amber-900/50"}`}
                        >
                          <div className="flex justify-between items-center text-xs uppercase font-bold text-amber-600 dark:text-amber-500">
                            <span>
                              {bulkSelectedDays.length > 0
                                ? `Bulk Adjust (${bulkSelectedDays.length} days)`
                                : "Global Preset"}
                            </span>
                            <div className="flex items-center gap-2">
                              {bulkSelectedDays.length > 0 && (
                                <button className="btn-interactive hover:underline text-xs tracking-wider" onClick={() => setBulkSelectedDays([])}>
                                  Clear Selection
                                </button>
                              )}
                              {Object.keys(capacityOverrides).length > 0 && (
                                <button
                                  onClick={handleResetOverrides}
                                  className="hover:underline text-xs tracking-wider hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all  btn-interactive"
                                >
                                  Reset All
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input className="input-gold-glow flex-1 h-1 bg-zinc-300 dark:bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 active:scale-[0.98] transition-all duration-200" type="range" min={bulkSelectedDays.length > 0 ? "-50" : "10"} max={bulkSelectedDays.length > 0 ? "50" : "110"} step="5" value={
                                bulkSelectedDays.length > 0
                                  ? bulkOverrideValue
                                  : globalAdjustValue
                              } onChange={(e) => {
                                if (bulkSelectedDays.length > 0) {
                                  setBulkOverrideValue(Number(e.target.value));
                                } else {
                                  setGlobalAdjustValue(Number(e.target.value));
                                }
                              }} style={{ accentColor: "#f59e0b" }}/>
                            {(() => {
                              const isBulk = bulkSelectedDays.length > 0;
                              const hasWarning =
                                isBulk &&
                                bulkSelectedDays.some((day) => {
                                  const item = dailyCapacityBreakdown.find(
                                    (d) => d.day === day,
                                  );
                                  if (!item) return false;
                                  const newCap =
                                    item.projected + bulkOverrideValue;
                                  return newCap > 110 || newCap < 0;
                                });

                              return (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {hasWarning && (
                                    <div
                                      title="Warning: Adjustment pushes capacity beyond 110% or below 0%"
                                      className="text-rose-500"
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                  <button className="btn-interactive bg-zinc-800 hover:bg-zinc-700 text-amber-500 dark:bg-zinc-900 border border-zinc-800 dark:border-zinc-700 rounded px-2 py-1 text-xs font-bold uppercase transition-colors active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200" onClick={() => {
                                      if (isBulk) {
                                        const newOverrides = {
                                          ...capacityOverrides,
                                        };
                                        bulkSelectedDays.forEach((day) => {
                                          const item =
                                            dailyCapacityBreakdown.find(
                                              (d) => d.day === day,
                                            );
                                          if (item) {
                                            newOverrides[day] = {
                                              mode: "manual",
                                              value:
                                                item.projected +
                                                bulkOverrideValue,
                                            };
                                          }
                                        });
                                        setCapacityOverrides(newOverrides);
                                        setBulkSelectedDays([]);
                                      } else {
                                        handleGlobalOverride();
                                      }
                                    }}>
                                    Apply{" "}
                                    {isBulk
                                      ? `${bulkOverrideValue > 0 ? "+" : ""}${bulkOverrideValue}%`
                                      : `${globalAdjustValue}%`}
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottleneck Threshold Slider */}
                  <div
                    className={`flex flex-col gap-2 p-2.5 rounded-xl border relative ${
                      isLight
                        ? "bg-zinc-100 border-zinc-200 shadow-sm"
                        : "bg-zinc-950/80 border-zinc-900/60"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs text-zinc-500 font-bold uppercase tracking-widest leading-none">
                      <div className="flex items-center gap-1">
                        <span>Bottleneck Threshold</span>
                        <button className={`btn-interactive p-0.5 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 hover:-translate-y-0.5 active:scale-95 ${ showThresholdTooltip ? "text-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)] bg-yellow-500/10" : isLight ? "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50" }`} type="button" onClick={() =>
                            setShowThresholdTooltip(!showThresholdTooltip)
                          } onMouseEnter={() => setShowThresholdTooltip(true)} onMouseLeave={() => setShowThresholdTooltip(false)} title="Information Tooltip">
                          <Info className="w-3 h-3" />
                        </button>
                      </div>
                      <motion.span
                        key="bottleneck-badge"
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 25,
                        }}
                        className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded border transition-colors duration-200 ${
                          isLight
                            ? "bg-white border-zinc-200 text-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                            : "bg-zinc-900 border-zinc-800/55 text-yellow-450 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                        }`}
                      >
                        {bottleneckThreshold}%
                      </motion.span>
                    </div>

                    {/* Tooltip Popup box aligned directly on top of the container */}
                    {showThresholdTooltip && (
                      <div
                        className={`absolute bottom-full left-0 right-0 mb-2 p-3.5 rounded-xl border shadow-2xl z-50 transition-all font-sans text-xs font-normal normal-case tracking-normal leading-relaxed ${
                          isLight
                            ? "bg-white border-zinc-200/90 text-zinc-700 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
                            : "bg-zinc-900/95 border-zinc-800 text-zinc-300 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5),0_8px_10px_-6px_rgba(0,0,0,0.5)]"
                        }`}
                      >
                        {/* Gold line border indicator on the left side to highlight calibration info */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-yellow-500" />

                        <h4 className="font-bold text-xs text-yellow-500 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
                          <Info className="w-3 h-3 text-yellow-500" />
                          Calibration Parameters
                        </h4>
                        <p className="mb-2.5 text-xs leading-normal">
                          The <strong>Bottleneck Threshold</strong> defines your
                          operational peak capacity tolerance. Adjusting it
                          triggers real-time visual alerts and modifies report
                          metrics.
                        </p>

                        <div className="space-y-2 border-t pt-2 border-zinc-200/50 dark:border-zinc-800/50">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-yellow-500 uppercase tracking-wide text-xs flex items-center gap-1">
                              Live Alert System
                            </span>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Any day with projected capacity above{" "}
                              <span className="font-bold">
                                {bottleneckThreshold}%
                              </span>{" "}
                              automatically lights up with a yellow{" "}
                              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1 py-0.2 rounded font-mono font-bold text-xs shadow-sm shadow-amber-500/20">
                                HOT
                              </span>{" "}
                              bottleneck alert badge inside the Daily Capacity
                              Breakdown list.
                            </p>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-yellow-500 uppercase tracking-wide text-xs flex items-center gap-1">
                              Report Generation
                            </span>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              This threshold is baked directly into generated
                              PDF summaries and CSV sheets. The system uses it
                              to compile bottleneck statistics, mark overflow
                              dates, and formulate staff allocation
                              recommendations.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <input className="input-gold-glow w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_12px_rgba(234,179,8,0.4)] transition-all active:scale-[0.98] hover:-translate-y-0.5 hover:shadow duration-200" type="range" min="50" max="100" step="1" value={bottleneckThreshold} onChange={(e) =>
                        setBottleneckThreshold(Number(e.target.value))
                      } style={{
                        accentColor: "#eab308",
                        background: `linear-gradient(to right, #eab308 0%, #eab308 ${((bottleneckThreshold - 50) / 50) * 100}%, ${isLight ? "#e4e4e7" : "#27272a"} ${((bottleneckThreshold - 50) / 50) * 100}%, ${isLight ? "#e4e4e7" : "#27272a"} 100%)`,
                      }}/>
                    <div className="flex justify-between text-xs text-zinc-500 font-mono leading-none">
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Visual D3 Target vs Actual Variance performance drift Chart */}
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isLight
                        ? "bg-zinc-100 border-zinc-200"
                        : "bg-zinc-950/80 border-zinc-900/60"
                    }`}
                  >
                    <CapacityVarianceChart
                      weeklyLogs={weeklyLogs}
                      isLight={isLight}
                    />
                  </div>

                  {/* Active Bottleneck Jump Button */}
                  {(() => {
                    const maxProjectedItem = [...dailyCapacityBreakdown].sort(
                      (a, b) => b.projected - a.projected,
                    )[0];
                    const hasBottleneck =
                      maxProjectedItem &&
                      maxProjectedItem.projected > bottleneckThreshold;
                    if (hasBottleneck) {
                      const isQuickFixForThisDay = quickFixDay === maxProjectedItem.day;
                      return (
                        <div
                          className={`w-full rounded-xl p-3.5 mb-3 border flex flex-col gap-3 transition-all duration-300 relative ${
                            isLight
                              ? "bg-amber-50/70 border-amber-200/95 shadow-sm"
                              : "bg-amber-950/20 border-amber-900/60 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                          }`}
                        >
                          {/* Gold Liner highlights the left border of this premium card */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-yellow-500" />
                          
                          <div className="flex items-start justify-between gap-1.5 pl-1.5">
                            <div className="flex flex-col">
                              <span className="font-sans font-bold text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1.5 uppercase tracking-wide">
                                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 animate-bounce" />
                                Threshold Exceeded ({maxProjectedItem.projected}%)
                              </span>
                              <span className="text-xs text-zinc-500 font-medium mt-0.5">
                                Capacity on <strong className="text-zinc-700 dark:text-zinc-300 font-bold">{maxProjectedItem.day}</strong> exceeds your safe {bottleneckThreshold}% limit.
                              </span>
                            </div>
                            <button className={`btn-interactive p-1 rounded text-xs font-mono font-bold tracking-wider hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center gap-1 cursor-pointer ${ isLight ? "text-amber-800 bg-amber-100/70 hover:bg-amber-200/80 border border-amber-200" : "text-amber-400 bg-amber-950/50 hover:bg-amber-900/50 border border-amber-900/50 hover:border-amber-500/50" }`} onClick={() => {
                                const el = document.getElementById(
                                  `bottleneck-day-${maxProjectedItem.day}`,
                                );
                                if (el)
                                  el.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });
                                setFocusedDay(maxProjectedItem.day);
                                setTimeout(() => {
                                  setFocusedDay(null);
                                }, 2500);
                              }} title={`Scroll to ${maxProjectedItem.day} inside Daily Capacity Breakdown`}>
                              <span>Jump</span>
                              <span>to</span>
                            </button>
                          </div>

                          {/* Quick Fix Button Section */}
                          <div className="pl-1.5 flex flex-col gap-2">
                            {(!quickFixRecommendation && !quickFixLoading) && (
                              <button className={`btn-interactive w-full py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer ${ isLight ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-zinc-950 font-extrabold shadow-[0_2px_8px_rgba(234,179,8,0.3)] hover:from-yellow-400 hover:to-amber-400" : "bg-gradient-to-r from-yellow-500/90 to-amber-500/90 text-zinc-950 font-extrabold shadow-[0_2px_12px_rgba(234,179,8,0.25)] hover:from-yellow-400 hover:to-amber-400" }`} onClick={() => handleTriggerQuickFix(maxProjectedItem.day, maxProjectedItem.projected, bottleneckThreshold)}>
                                <span>AI</span>
                                <span>Jules Quick Fix</span>
                              </button>
                            )}

                            {/* Loading State */}
                            {quickFixLoading && (
                              <div className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 ${
                                isLight ? "bg-amber-100/30 border-amber-200" : "bg-amber-950/20 border-amber-900/30"
                              }`}>
                                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-mono text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider text-center animate-pulse">
                                  Jules is formulating recalibrations...
                                </span>
                              </div>
                            )}

                            {/* Error State */}
                            {quickFixError && (
                              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs font-medium leading-relaxed">
                                {quickFixError}
                                <button className="btn-interactive block underline font-bold mt-1 text-rose-600 dark:text-rose-400 uppercase tracking-widest text-xs" onClick={() => handleTriggerQuickFix(maxProjectedItem.day, maxProjectedItem.projected, bottleneckThreshold)}>
                                  Retry Fix
                                </button>
                              </div>
                            )}

                            {/* Recommendation Found & Applicable State */}
                            {(quickFixRecommendation && isQuickFixForThisDay) && (
                              <div className={`p-2.5 rounded-lg border flex flex-col gap-2.5 transition-all duration-300 ${
                                isLight
                                  ? "bg-white/80 border-amber-200/80 shadow-[0_1px_5px_rgba(0,0,0,0.02)]"
                                  : "bg-zinc-950/60 border-zinc-800/80 shadow-inner"
                              }`}>
                                <div className="text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed text-justify pl-1 border-l-2 border-yellow-500/60">
                                  {quickFixRecommendation}
                                </div>
                                <div className="flex items-center justify-between gap-1 border-t pt-2 border-zinc-200/50 dark:border-zinc-850/50">
                                  <div className="flex flex-col">
                                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Suggested Overrides:</span>
                                    <span className="text-xs font-mono font-extrabold text-orange-500">
                                      {maxProjectedItem.projected}% to {Math.max(10, Math.min(110, Math.round(maxProjectedItem.projected + (quickFixAdjustment || 0))))}% ({quickFixAdjustment}% Adjustment)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button className="btn-interactive px-1.5 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer" onClick={() => {
                                        setQuickFixRecommendation(null);
                                        setQuickFixAdjustment(null);
                                        setQuickFixDay(null);
                                      }}>
                                      Dismiss
                                    </button>
                                    <button
                                      onClick={handleApplyQuickFix}
                                      className={`px-2 py-1 rounded text-xs font-extrabold uppercase tracking-wider transition-all hover:-translate-y-0.5 active:scale-[0.98] shadow-sm flex items-center gap-1 border focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer ${
                                        isLight
                                          ? "bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 shadow-[0_0_8px_rgba(234,179,8,0.25)]"
                                          : "bg-amber-950/50 border-amber-900/60 text-amber-400 hover:bg-amber-900/40 hover:text-amber-300 hover:border-amber-500/50 shadow-[0_0_12px_rgba(234,179,8,0.2)]"
                                      }`}
                                    >
                                      <span>Apply Override</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <Reorder.Group
                    axis="y"
                    values={filteredDailyCapacityBreakdown}
                    onReorder={(newOrder) => {
                      setCustomSortOrder(newOrder.map((item) => item.day));
                      setCapacitySortBy("custom");
                    }}
                    className="max-h-56 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar"
                  >
                    {(() => {
                      const avgWeeklyProjected = Math.round(
                        dailyCapacityBreakdown.reduce(
                          (sum, d) => sum + d.projected,
                          0,
                        ) / (dailyCapacityBreakdown.length || 1),
                      );
                      if (filteredDailyCapacityBreakdown.length === 0) {
                        return (
                          <div className={`flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl border ${
                            isLight
                              ? "bg-zinc-50 border-zinc-200"
                              : "bg-zinc-950/40 border-zinc-900/40"
                          }`}>
                            <div className="w-8 h-8 rounded-full bg-zinc-500/10 flex items-center justify-center text-zinc-500 mb-2">
                              No days
                            </div>
                            <p className={`font-bold text-xs uppercase tracking-wider ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
                              No Days Found
                            </p>
                            <p className="text-xs text-zinc-500 max-w-[180px] mt-1 leading-normal">
                              All operational loads are clear of this impact level.
                            </p>
                          </div>
                        );
                      }
                      return filteredDailyCapacityBreakdown.map((item, index) => {
                        const isBottleneck =
                          item.projected > bottleneckThreshold;
                        const chronologicalIndex =
                          dailyCapacityBreakdown.findIndex(
                            (d) => d.day === item.day,
                          );

                        // Coordinates for the 7-day sparkline (Mon -> Sun)
                        const points = dailyCapacityBreakdown.map((d, i) => {
                          const x = 2 + (i / 6) * 44;
                          const y = 12 - (d.projected / 100) * 10;
                          return `${x},${y}`;
                        });
                        const pointsString = points.join(" ");

                        const activeX = 2 + (chronologicalIndex / 6) * 44;
                        const activeY = 12 - (item.projected / 100) * 10;
                        const fillPathD = `M 2,12 L ${points.join(" L ")} L 46,12 Z`;

                        return (
                          <Reorder.Item
                            key={item.day}
                            value={item}
                            id={`bottleneck-day-${item.day}`}
                            className={`flex flex-col gap-1.5 pb-2 last:border-0 last:pb-0 transition-all duration-700 ${
                              isLight
                                ? "border-zinc-200"
                                : "border-b border-zinc-950/40"
                            } ${
                              isBottleneck
                                ? isLight
                                  ? "bg-amber-50 border-2 border-amber-400 p-2.5 rounded-xl my-1 text-zinc-900 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-[pulse_2s_ease-in-out_infinite]"
                                  : "bg-amber-900/10 border-2 border-amber-500/60 p-2.5 rounded-xl my-1 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-zinc-300 animate-[pulse_2s_ease-in-out_infinite]"
                                : "px-1 pt-1"
                            } ${
                              focusedDay === item.day
                                ? "ring-2 ring-yellow-500 border-yellow-500 rounded-xl p-2.5 shadow-[0_0_20px_rgba(234,179,8,0.75)] scale-[1.02] bg-yellow-500/5 dark:bg-yellow-500/10 z-10"
                                : ""
                            }`}
                          >
                            <div className="flex justify-between items-center text-xs gap-2">
                              <div className="flex items-center gap-1.5 min-w-[70px]">
                                <div
                                  className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-amber-500 transition-colors"
                                  title="Drag to reorder priority"
                                >
                                  <GripVertical size={12} />
                                </div>
                                <button className={`btn-interactive p-0.5 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 hover:scale-105 active:scale-95 shadow-sm shrink-0 ${ isLight ? "hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950" : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100" }`} type="button" onClick={() => {
                                    setExpandedDays((prev) =>
                                      prev.includes(item.day)
                                        ? prev.filter((d) => d !== item.day)
                                        : [...prev, item.day],
                                    );
                                  }} title="Toggle contributing items">
                                  {expandedDays.includes(item.day) ? (
                                    <ChevronUp size={11} />
                                  ) : (
                                    <ChevronDown size={11} />
                                  )}
                                </button>
                                {quickAdjustEnabled && (
                                  <input className="input-gold-glow w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] focus:ring-2 cursor-pointer transition-colors accent-amber-500" type="checkbox" checked={bulkSelectedDays.includes(
                                      item.day,
                                    )} onChange={(e) => {
                                      if (e.target.checked) {
                                        setBulkSelectedDays([
                                          ...bulkSelectedDays,
                                          item.day,
                                        ]);
                                      } else {
                                        setBulkSelectedDays(
                                          bulkSelectedDays.filter(
                                            (d) => d !== item.day,
                                          ),
                                        );
                                      }
                                    }}/>
                                )}
                                <span
                                  className={`font-sans font-bold flex items-center gap-1 flex-wrap ${isLight ? "text-zinc-800" : "text-zinc-300"}`}
                                >
                                  {item.day.substring(0, 3)}
                                  <span
                                    className={`text-xs font-normal font-mono ${isLight ? "text-zinc-500" : "text-zinc-500"}`}
                                  >
                                    ({item.date})
                                  </span>
                                  {(() => {
                                    let badgeText = "";
                                    let badgeClass = "";
                                    let dotClass = "";
                                    
                                    if (item.projected > bottleneckThreshold) {
                                      badgeText = "Critical";
                                      badgeClass = isLight
                                        ? "bg-red-50 text-red-600 border-red-200 shadow-sm"
                                        : "bg-red-950/20 text-red-400 border-red-900/40 shadow-sm";
                                      dotClass = "bg-red-500";
                                    } else if (item.projected >= 70) {
                                      badgeText = "Medium";
                                      badgeClass = isLight
                                        ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm"
                                        : "bg-amber-950/20 text-amber-400 border-amber-900/40 shadow-sm";
                                      dotClass = "bg-amber-500";
                                    } else {
                                      badgeText = "Low";
                                      badgeClass = isLight
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm"
                                        : "bg-emerald-950/20 text-emerald-400 border-emerald-900/40 shadow-sm";
                                      dotClass = "bg-emerald-500";
                                    }

                                    return (
                                      <span
                                        className={`text-xs font-mono leading-none py-0.5 px-1.5 rounded-md border font-extrabold uppercase inline-flex items-center gap-1 shrink-0 ${badgeClass}`}
                                      >
                                        <span className={`w-1 h-1 rounded-full ${dotClass} animate-pulse`} />
                                        {badgeText}
                                      </span>
                                    );
                                  })()}
                                </span>
                              </div>

                              {/* Center: Sparkline trend & differential */}
                              <div className="flex-1 flex items-center justify-center gap-1.5 px-1">
                                {/* SVG Sparkline */}
                                <div
                                  className="relative cursor-help"
                                  title="7-Day weekly projected capacity trend line (Monday to Sunday)"
                                >
                                  <svg
                                    className="w-12 h-3.5 overflow-visible"
                                    viewBox="0 0 48 14"
                                  >
                                    <defs>
                                      <linearGradient
                                        id={`sparkline-grad-${index}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                      >
                                        <stop
                                          offset="0%"
                                          stopColor={
                                            isBottleneck ? "#f59e0b" : "#ea580c"
                                          }
                                          stopOpacity="0.15"
                                        />
                                        <stop
                                          offset="100%"
                                          stopColor={
                                            isBottleneck ? "#f59e0b" : "#ea580c"
                                          }
                                          stopOpacity="0.0"
                                        />
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
                                      stroke={
                                        isBottleneck ? "#f59e0b" : "#ea580c"
                                      }
                                      strokeWidth="1.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      points={points
                                        .slice(0, chronologicalIndex + 1)
                                        .join(" ")}
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
                                      fill={
                                        isBottleneck ? "#f59e0b" : "#ea580c"
                                      }
                                    />
                                  </svg>
                                </div>

                                {/* Daily trend arrow with previous day comparison */}
                                {chronologicalIndex > 0 ? (
                                  (() => {
                                    const prevProjected =
                                      dailyCapacityBreakdown[
                                        chronologicalIndex - 1
                                      ].projected;
                                    const diff = item.projected - prevProjected;
                                    if (diff > 0) {
                                      return (
                                        <span
                                          className="text-emerald-500 text-xs font-bold font-mono tracking-tighter flex items-center"
                                          title={`Up by +${diff}% from preceding day`}
                                        >
                                          +{diff}%
                                        </span>
                                      );
                                    } else if (diff < 0) {
                                      return (
                                        <span
                                          className="text-rose-500 text-xs font-bold font-mono tracking-tighter flex items-center"
                                          title={`Down by ${diff}% from preceding day`}
                                        >
                                          -{Math.abs(diff)}%
                                        </span>
                                      );
                                    } else {
                                      return (
                                        <span
                                          className="text-zinc-600 text-xs font-bold font-mono tracking-tighter flex items-center"
                                          title="Stable relative to preceding day"
                                        >
                                          00%
                                        </span>
                                      );
                                    }
                                  })()
                                ) : (
                                  <span
                                    className="text-zinc-600 text-xs font-bold font-mono tracking-tighter"
                                    title="First day of active week sequence"
                                  >
                                    -
                                  </span>
                                )}
                              </div>

                              {/* Right side: capacity percentages */}
                              <div className="flex items-center gap-1 shrink-0 text-right min-w-[55px] justify-end">
                                <span
                                  className="text-zinc-500 text-xs"
                                  title="Current"
                                >
                                  {item.current}%
                                </span>
                                <span className="text-zinc-600 text-xs select-none">
                                  to
                                </span>
                                <span
                                  className={`font-bold text-xs ${isBottleneck ? "text-amber-400 font-bold" : item.projected >= item.current ? "text-orange-400" : "text-orange-500/80"}`}
                                  title="Projected"
                                >
                                  {item.projected}%
                                </span>
                                <span
                                  className="ml-0.5 text-xs font-bold"
                                  title={`Trend relative to weekly average (${avgWeeklyProjected}%)`}
                                >
                                  {item.projected > avgWeeklyProjected ? (
                                    <span
                                      className="text-rose-500"
                                      title="Trending Up (Above avg)"
                                    >
                                      up
                                    </span>
                                  ) : item.projected < avgWeeklyProjected ? (
                                    <span
                                      className="text-emerald-500"
                                      title="Trending Down (Below avg)"
                                    >
                                      down
                                    </span>
                                  ) : (
                                    <span
                                      className="text-zinc-500"
                                      title="At weekly average"
                                    >
                                      -
                                    </span>
                                  )}
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
                                    ? "bg-gradient-to-r from-orange-600 to-orange-400"
                                    : item.projected - bottleneckThreshold >= 15
                                      ? "bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                                      : item.projected - bottleneckThreshold >=
                                          8
                                        ? "bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.4)]"
                                        : "bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.3)]"
                                } h-full rounded-r transition-all duration-300`}
                                style={{
                                  width: `${Math.max(0, item.projected - item.current)}%`,
                                }}
                              />
                            </div>

                            {/* Compare Mode Variance Secondary Bar & Info Panel */}
                            {compareModeEnabled && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 350,
                                  damping: 28,
                                }}
                                className={`mt-1.5 p-1.5 rounded-lg border flex flex-col gap-1 overflow-hidden transition-all duration-300 ${
                                  isLight
                                    ? "bg-yellow-50/40 border-yellow-200/50"
                                    : "bg-yellow-950/5 border-yellow-900/10"
                                }`}
                              >
                                <div className="flex justify-between items-center text-xs font-mono leading-none">
                                  <div className="flex items-center gap-0.5 text-zinc-500">
                                    <span>AI:</span>
                                    <span
                                      className={`font-bold ${isLight ? "text-zinc-700" : "text-zinc-300"}`}
                                    >
                                      {item.initialAiForecast}%
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-0.5 text-zinc-500">
                                    <span>Sim:</span>
                                    <span
                                      className={`font-bold ${isLight ? "text-zinc-700" : "text-zinc-300"}`}
                                    >
                                      {item.projected}%
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-0.5 font-bold">
                                    <span className="text-zinc-500">Var:</span>
                                    <span
                                      className={`px-1 rounded-sm ${
                                        item.projected > item.initialAiForecast
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                          : item.projected <
                                              item.initialAiForecast
                                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                            : "bg-zinc-500/10 text-zinc-500"
                                      }`}
                                    >
                                      {item.projected > item.initialAiForecast
                                        ? `+${item.projected - item.initialAiForecast}`
                                        : item.projected -
                                          item.initialAiForecast}
                                      %
                                    </span>
                                  </div>
                                </div>

                                {/* Secondary progress bar representing variance range */}
                                <div className="h-1.5 bg-zinc-950 dark:bg-zinc-950/90 rounded-full relative overflow-hidden flex items-center">
                                  {/* Base AI forecast area in track */}
                                  <div
                                    className="h-full bg-zinc-700/30 dark:bg-zinc-800/40 border-r border-dashed border-zinc-500/30 transition-all duration-300"
                                    style={{
                                      width: `${item.initialAiForecast}%`,
                                    }}
                                  />
                                  {/* Animated Variance Bar Segment */}
                                  <motion.div
                                    className={`absolute h-full rounded ${
                                      item.projected >= item.initialAiForecast
                                        ? "bg-gradient-to-r from-yellow-500 to-amber-500 shadow-[0_0_6px_rgba(234,179,8,0.3)]"
                                        : "bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_6px_rgba(239,68,68,0.3)]"
                                    }`}
                                    animate={{
                                      left: `${Math.min(item.initialAiForecast, item.projected)}%`,
                                      width: `${Math.abs(item.projected - item.initialAiForecast)}%`,
                                    }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 350,
                                      damping: 28,
                                    }}
                                  />
                                  {/* Spark mark at simulated point */}
                                  <motion.div
                                    className={`absolute w-0.5 h-2 rounded-full z-10 ${
                                      item.projected >= item.initialAiForecast
                                        ? "bg-amber-400"
                                        : "bg-rose-400"
                                    }`}
                                    animate={{ left: `${item.projected}%` }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 350,
                                      damping: 28,
                                    }}
                                  />
                                </div>
                              </motion.div>
                            )}

                            {/* Inline What-If adjustments for specific day */}
                            {quickAdjustEnabled && (
                              <div
                                className={`mt-1.5 flex flex-wrap items-center justify-between gap-1.5 p-1.5 rounded-xl border transition-all duration-200 ${
                                  isLight
                                    ? "bg-zinc-50 border-zinc-200/80 shadow-inner"
                                    : "bg-zinc-950/40 border-zinc-800/60 shadow-inner"
                                }`}
                              >
                                <div className="flex border rounded-lg p-0.5 bg-zinc-900 dark:bg-zinc-950 border-zinc-800 shrink-0">
                                  <button className={`btn-interactive text-xs px-1.5 py-0.5 rounded-md font-mono font-bold transition-all uppercase flex items-center gap-0.5 cursor-pointer ${ !capacityOverrides[item.day] || capacityOverrides[item.day].mode === "ai" ? "bg-amber-500 text-zinc-950 shadow-sm font-extrabold" : "text-zinc-500 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-zinc-200" }`} onClick={() =>
                                      handleToggleOverrideMode(
                                        item.day,
                                        "ai",
                                        item.projected,
                                      )
                                    } type="button">
                                    <Sparkles className="w-2 h-2 shrink-0" />
                                    AI
                                  </button>
                                  <button className={`btn-interactive text-xs px-1.5 py-0.5 rounded-md font-mono font-bold transition-all uppercase flex items-center gap-0.5 cursor-pointer ${ capacityOverrides[item.day]?.mode === "manual" ? "bg-orange-500 text-white shadow-sm font-extrabold" : "text-zinc-500 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-zinc-200" }`} onClick={() =>
                                      handleToggleOverrideMode(
                                        item.day,
                                        "manual",
                                        item.projected,
                                      )
                                    } type="button">
                                    <SlidersHorizontal className="w-2 h-2 shrink-0" />
                                    SIM
                                  </button>
                                </div>

                                {capacityOverrides[item.day]?.mode ===
                                "manual" ? (
                                  <div className="flex-1 flex items-center gap-1.5 justify-end">
                                    <button className="btn-interactive text-xs text-zinc-500 hover:text-amber-500 font-mono uppercase tracking-widest underline decoration-dotted transition-colors mr-1 cursor-pointer active:scale-[0.98] hover:-translate-y-0.5 hover:shadow transition-all duration-200" type="button" onClick={() =>
                                        handleClearSingleOverride(item.day)
                                      } title="Reset to AI Forecast">
                                      Reset AI
                                    </button>
                                    <input className="input-gold-glow w-16 h-1 bg-zinc-300 dark:bg-zinc-800 rounded appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 active:scale-[0.98] hover:-translate-y-0.5 hover:shadow transition-all duration-200" type="range" min="10" max="110" step="5" value={
                                        capacityOverrides[item.day]?.value ??
                                        item.projected
                                      } onChange={(e) =>
                                        handleUpdateOverrideValue(
                                          item.day,
                                          Number(e.target.value),
                                        )
                                      } style={{ accentColor: "#f97316" }}/>
                                    <div className="flex flex-col items-end shrink-0 w-8">
                                      <span className="font-mono text-xs font-bold text-orange-500 text-right">
                                        {capacityOverrides[item.day]?.value}%
                                      </span>
                                      {(() => {
                                        const val =
                                          capacityOverrides[item.day]?.value;
                                        if (
                                          val !== undefined &&
                                          val !== item.projected
                                        ) {
                                          const delta = val - item.projected;
                                          const isPos = delta > 0;
                                          return (
                                            <span
                                              className={`font-mono text-xs font-extrabold ${isPos ? "text-rose-500" : "text-emerald-500"}`}
                                            >
                                              {isPos ? "+" : ""}
                                              {delta}%
                                            </span>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-zinc-400 italic font-mono uppercase tracking-wide">
                                    forecast active
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Expandable Details view showing top contributing items */}
                            {expandedDays.includes(item.day) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                transition={{
                                  duration: 0.25,
                                  ease: "easeInOut",
                                }}
                                className={`mt-2 overflow-hidden text-xs border-t pt-2 space-y-1.5 ${
                                  isLight
                                    ? "border-zinc-200 shadow-inner"
                                    : "border-zinc-800/60 shadow-inner"
                                }`}
                              >
                                <div
                                  className={`font-semibold flex items-center justify-between px-1 mb-1 ${
                                    isLight
                                      ? "text-zinc-600 font-bold"
                                      : "text-zinc-400"
                                  }`}
                                >
                                  <span>Top Contributing Production Items</span>
                                  <span className="font-mono text-xs uppercase tracking-wider">
                                    Qty / Impact
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {getDayContributingItems(
                                    item.day,
                                    item.projected,
                                  ).map((prodItem, idx) => {
                                    let badgeColor = "";
                                    let dotColor = "";
                                    if (
                                      prodItem.impact === "Critical" ||
                                      prodItem.impact === "High"
                                    ) {
                                      badgeColor = isLight
                                        ? "bg-red-50 text-red-600 border-red-200"
                                        : "bg-red-950/20 text-red-400 border-red-900/40";
                                      dotColor = "bg-red-500";
                                    } else if (prodItem.impact === "Medium") {
                                      badgeColor = isLight
                                        ? "bg-amber-50 text-amber-600 border-amber-200"
                                        : "bg-amber-950/20 text-amber-400 border-amber-900/40";
                                      dotColor = "bg-amber-500";
                                    } else {
                                      badgeColor = isLight
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                        : "bg-emerald-950/20 text-emerald-400 border-emerald-900/40";
                                      dotColor = "bg-emerald-500";
                                    }

                                    return (
                                      <div
                                        key={idx}
                                        className={`flex items-center justify-between p-1.5 rounded-lg border transition-all duration-200 hover:scale-[1.01] ${
                                          isLight
                                            ? "bg-white border-zinc-100 hover:border-zinc-200 shadow-sm"
                                            : "bg-zinc-900/40 border-zinc-800/40 hover:border-zinc-800"
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor} animate-pulse`} />
                                          <div className="flex flex-col min-w-0">
                                            <span
                                              className={`font-semibold truncate ${isLight ? "text-zinc-800 font-bold" : "text-zinc-200"}`}
                                            >
                                              {prodItem.name}
                                            </span>
                                            <span
                                              className={`text-xs font-normal truncate ${isLight ? "text-zinc-400" : "text-zinc-500"}`}
                                            >
                                              {prodItem.category}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <div className="text-right flex flex-col">
                                            <span
                                              className={`font-bold font-mono text-xs ${isLight ? "text-zinc-800" : "text-zinc-300"}`}
                                            >
                                              {prodItem.quantity} units
                                            </span>
                                            <span
                                              className={`text-xs font-mono font-medium ${isLight ? "text-zinc-400" : "text-zinc-500"}`}
                                            >
                                              {prodItem.loadShare}% Share
                                            </span>
                                          </div>
                                          <span
                                            className={`text-xs font-mono uppercase px-1.5 py-0.5 rounded-md border font-extrabold ${badgeColor}`}
                                          >
                                            {prodItem.impact}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </Reorder.Item>
                        );
                      });
                    })()}
                  </Reorder.Group>

                  {/* Summary Legend explaining Impact levels */}
                  <div
                    className={`mt-3 pt-2.5 border-t flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs ${
                      isLight
                        ? "border-zinc-200 text-zinc-500"
                        : "border-zinc-800/60 text-zinc-400"
                    }`}
                  >
                    <span className="font-sans font-bold uppercase tracking-wider text-xs flex items-center gap-1">
                      Item Impact
                      Legend:
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-sm border ${
                          isLight
                            ? "bg-red-50 border-red-200"
                            : "bg-red-950/20 border-red-900/40"
                        }`}
                      />
                      <span
                        className={`font-mono font-bold ${isLight ? "text-red-600" : "text-red-400"}`}
                      >
                        Critical / High
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-sm border ${
                          isLight
                            ? "bg-amber-50 border-amber-200"
                            : "bg-amber-950/20 border-amber-900/40"
                        }`}
                      />
                      <span
                        className={`font-mono font-bold ${isLight ? "text-amber-600" : "text-amber-400"}`}
                      >
                        Medium
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-sm border ${
                          isLight
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-emerald-950/20 border-emerald-900/40"
                        }`}
                      />
                      <span
                        className={`font-mono font-bold ${isLight ? "text-emerald-600" : "text-emerald-400"}`}
                      >
                        Low Impact
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        {/* Aesthetic & Theme Panel */}
          <div className={`mx-2 mt-1.5 p-2.5 gold-liner-box transition-all ${
            isLight ? "bg-amber-50/20" : "bg-zinc-950/40"
          }`}>
            <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-yellow-500/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse shrink-0" />
              <span className="text-xs font-sans font-black uppercase tracking-wider text-yellow-500">
                Aesthetic Studio
              </span>
            </div>
            
            {/* Dark & Day Mode Select */}
            <div className="flex flex-col gap-1 mb-2.5">
              <span className={`text-xs uppercase font-mono font-bold ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>
                Visual Mode
              </span>
              <div className="flex rounded-lg p-0.5 bg-zinc-900/10 dark:bg-black/40 border border-zinc-200/50 dark:border-zinc-800/80">
                <button className={`btn-interactive flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs font-bold uppercase transition-all cursor-pointer ${ isLight ? "bg-white text-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-zinc-500 hover:text-zinc-300" }`} type="button" onClick={() => setTheme("light")}>
                  <Sun className="w-3 h-3 text-amber-500" /> Day
                </button>
                <button className={`btn-interactive flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs font-bold uppercase transition-all cursor-pointer ${ !isLight ? "bg-zinc-800 text-white shadow-[0_1px_3px_rgba(0,0,0,0.4)]" : "text-zinc-500 hover:text-zinc-700" }`} type="button" onClick={() => setTheme("dark")}>
                  <Moon className="w-3 h-3 text-zinc-400" /> Night
                </button>
              </div>
            </div>

            {/* Metallic Accent Presets */}
            <div className="flex flex-col gap-1">
              <span className={`text-xs uppercase font-mono font-bold ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>
                Metallic Edition
              </span>
              <div className="grid grid-cols-3 gap-1">
                {/* Gold Button */}
                <button className={`btn-interactive py-1 rounded text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer hover:-translate-y-0.5 active:scale-95 ${ metallicTheme === "gold" ? "bg-gradient-to-br from-[#dfa033] to-[#6a460b] text-white border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.4)] font-extrabold" : isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" }`} type="button" onClick={() => changeMetallicTheme("gold")}>
                  Gold
                </button>

                {/* Silver Button */}
                <button className={`btn-interactive py-1 rounded text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer hover:-translate-y-0.5 active:scale-95 ${ metallicTheme === "silver" ? "bg-gradient-to-br from-[#b0b5b9] to-[#3a4146] text-white border-zinc-400 shadow-[0_0_8px_rgba(148,163,184,0.4)] font-extrabold" : isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" }`} type="button" onClick={() => changeMetallicTheme("silver")}>
                  Silver
                </button>

                {/* Copper Button */}
                <button className={`btn-interactive py-1 rounded text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer hover:-translate-y-0.5 active:scale-95 ${ metallicTheme === "copper" ? "bg-gradient-to-br from-[#c96c42] to-[#471d0b] text-white border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.4)] font-extrabold" : isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" }`} type="button" onClick={() => changeMetallicTheme("copper")}>
                  Copper
                </button>
              </div>
            </div>

            {/* Note confirming Gold Liners */}
            <div className="mt-2 text-xs leading-tight font-sans text-zinc-500 dark:text-zinc-400 flex items-start gap-1">
              <span className="text-xs"></span>
              <span>
                <strong>24k Gold Liner</strong> is wrapped around all container boxes to elevate margin security.
              </span>
            </div>
          </div>

          {/* Global Branches Overview */}

          <div
            className={`mx-2 mt-1.5 p-2 gold-liner-box transition-all ${isLight ? "bg-zinc-50 shadow-sm" : "bg-zinc-900 shadow"}`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-zinc-300 relative shrink-0 border overflow-hidden ${
                  isLight
                    ? "bg-zinc-200 border-zinc-300 text-zinc-700"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.username}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span
                  className={`w-2 h-2 rounded-full ${isFirebaseSynced ? "bg-emerald-500 animate-pulse" : "bg-orange-500"} absolute -bottom-0.5 -right-0.5 border ${isLight ? "border-zinc-100" : "border-zinc-950"}`}
                />
              </div>
              <div className="text-[11px] leading-tight flex-1 min-w-0">
                <p
                  className={`font-semibold truncate ${isLight ? "text-zinc-900 font-bold" : "text-white"}`}
                  title={currentUser?.username || ""}
                >
                  {currentUser?.username || "Skipper Koala"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <select className={`input-gold-glow bg-transparent font-mono text-[10px] uppercase cursor-pointer focus:outline-none appearance-none transition-colors ${ isLight ? "text-zinc-500 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-zinc-800 font-bold" : "text-zinc-500 hover:text-zinc-300" }`} value={userRole} onChange={(e) => setUserRole(e.target.value as any)}>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                    <option value="User">User</option>
                  </select>
                  <span className="text-zinc-500 font-mono text-[8px]">•</span>
                  <button className={`btn-interactive text-[9px] font-mono hover:text-rose-500 flex items-center gap-0.5 transition-colors cursor-pointer ${ isLight ? "text-zinc-500 font-bold" : "text-zinc-400" }`} onClick={async () => {
                      localStorage.removeItem("localCurrentUser");
                      setCurrentUser(null);
                      await signOut(auth).catch(() => {});
                    }} title="Sign Out">
                    <LogOut className="w-2.5 h-2.5" />
                    OUT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={`flex h-full min-h-0 flex-col min-w-0 overflow-hidden transition-colors duration-500 ${isLight ? "bg-transparent" : "bg-transparent"}`}
      >
        {/* Global Toolbar */}
        <header
          className={`h-16 px-6 flex items-center justify-between sticky top-0 z-30 transition-all duration-200 border-b ${
            isLight
              ? "bg-white border-zinc-200 text-zinc-900 shadow-sm"
              : "bg-zinc-950 border-zinc-900 text-white shadow-md"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <h2
              className={`text-xs sm:text-sm font-sans font-bold shrink-0 ${isLight ? "text-zinc-900" : "text-white"}`}
            >
              {tabMeta.find((t) => t.id === activeTab)?.label || activeTab} View
            </h2>
            <span
              className={`hidden lg:inline-block text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold border ${
                isLight
                  ? "bg-zinc-100 text-zinc-600 border-zinc-200"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800"
              }`}
            >
              Food chain ops portal
            </span>

            {/* Global Branch Selector Dropdown */}
            <div
              className={`flex items-center gap-2 mb-1.5 pb-1 border-b ${isLight ? "border-zinc-200" : "border-zinc-800/80"}`}
            >
              <Store
                className={`w-3.5 h-3.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
              />
              <span
                className={`text-xs font-mono tracking-wider uppercase font-bold ${isLight ? "text-zinc-600" : "text-zinc-400"}`}
              >
                Global Branches
              </span>
            </div>
            <div className="space-y-1 font-sans">
              {(
                [
                  "Marks & Spencer - Cork City",
                  "Tesco - Cork City",
                  "Tesco - Mahon Point",
                ] as const
              ).map((branch) => {
                const shortName = branch
                  .replace("Marks & Spencer", "M&S")
                  .replace(" - Cork City", " Cork")
                  .replace(" - Mahon Point", " Mahon");
                const isSelected = selectedBranch === branch;
                return (
                  <div
                    key={branch}
                    onClick={() => setSelectedBranch(branch)}
                    className={`flex justify-between items-center text-xs p-1.5 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? isLight
                          ? "bg-orange-50 border-orange-200"
                          : "bg-orange-500/10 border-orange-500/30"
                        : isLight
                          ? "bg-white border-zinc-200  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-100"
                          : "bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-900"
                    }`}
                  >
                    <span
                      className={`truncate mr-2 ${
                        isSelected
                          ? isLight
                            ? "text-orange-700 font-bold"
                            : "text-orange-400 font-bold"
                          : isLight
                            ? "text-zinc-700 font-medium"
                            : "text-zinc-300 font-medium"
                      }`}
                    >
                      {shortName}
                    </span>
                    <span
                      className={`font-mono tracking-tight shrink-0 flex items-center gap-1 ${isLight ? "text-emerald-500 font-bold" : "text-xs px-1.5 py-0.5 rounded-full uppercase bg-3d-silver-dark metallic-base drop-shadow-md animate-pulse font-black"}`}
                    >
                      {isLight && (
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                      )}{" "}
                      Live
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Everyday Focus Panel */}
          <div
            className={`mx-2 mt-1.5 p-2.5 gold-liner-box transition-all ${isLight ? "bg-zinc-50 shadow-sm" : "bg-zinc-900 shadow"}`}
          >
            <div
              className={`flex items-center justify-between gap-2 mb-2 pb-1.5 border-b ${isLight ? "border-zinc-200" : "border-zinc-800/80"}`}
            >
              <div className="flex items-center gap-2">
                <Activity
                  className={`w-3.5 h-3.5 ${isLight ? "text-orange-600" : "text-orange-400"}`}
                />
                <span
                  className={`text-xs font-mono tracking-wider uppercase font-bold ${isLight ? "text-zinc-600" : "text-zinc-400"}`}
                >
                  Today Focus
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-orange-500">
                {lowStockCount} alerts
              </span>
            </div>

            <div className="space-y-1.5">
              {[
                {
                  label: "Restock low ingredients",
                  value: `${lowStockCount} items`,
                  tab: "Planning",
                  tone: "text-amber-500",
                },
                {
                  label: "Check staff hours",
                  value: `${totalHours}h planned`,
                  tab: "Hours",
                  tone: "text-emerald-500",
                },
                {
                  label: "Review sales flow",
                  value: selectedBranch.replace("Marks & Spencer", "M&S"),
                  tab: "Sell",
                  tone: "text-blue-500",
                },
              ].map((item) => (
                <button className={`btn-interactive w-full flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition-all active:scale-[0.98] ${ isLight ? "bg-white border-zinc-200 hover:bg-zinc-100" : "bg-zinc-950/60 border-zinc-800 hover:bg-zinc-900" }`} key={item.label} type="button" onClick={() => setActiveTab(item.tab)}>
                  <span
                    className={`text-xs font-bold ${isLight ? "text-zinc-700" : "text-zinc-200"}`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold truncate max-w-[100px] ${item.tone}`}
                  >
                    {item.value}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Active view port rendering */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-transparent px-4 py-4 md:px-6 md:py-5">
          <div className="mx-auto max-w-7xl min-w-0">{renderActiveView()}</div>
        </main>
      </div>

      <aside
        className={`hidden xl:flex h-full min-h-0 w-full flex-col shrink-0 border-l transition-colors duration-300 overflow-hidden ${
          isLight
            ? "bg-zinc-50 text-zinc-900 border-zinc-200"
            : "bg-zinc-950 text-zinc-100 border-zinc-800"
        }`}
      >
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4">
          <div
            className={`mx-0 p-3 gold-liner-box transition-all ${
              isLight ? "bg-amber-50/20" : "bg-zinc-950/40"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2.5 pb-1.5 border-b border-yellow-500/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse shrink-0" />
              <span className="text-[10px] font-sans font-black uppercase tracking-wider text-yellow-500">
                Aesthetic Studio
              </span>
            </div>
            <div className="flex flex-col gap-1 mb-2.5">
              <span
                className={`text-[7.5px] uppercase font-mono font-bold ${isLight ? "text-zinc-500" : "text-zinc-500"}`}
              >
                Visual Mode
              </span>
              <div className="flex rounded-lg p-0.5 bg-zinc-900/10 dark:bg-black/40 border border-zinc-200/50 dark:border-zinc-800/80">
                <button className={`btn-interactive flex-1 flex items-center justify-center gap-1 py-1 rounded text-[8.5px] font-bold uppercase transition-all cursor-pointer ${ isLight ? "bg-white text-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-zinc-500 hover:text-zinc-300" }`} type="button" onClick={() => setTheme("light")}>
                  <Sun className="w-3 h-3 text-amber-500" /> Day
                </button>
                <button className={`btn-interactive flex-1 flex items-center justify-center gap-1 py-1 rounded text-[8.5px] font-bold uppercase transition-all cursor-pointer ${ !isLight ? "bg-zinc-800 text-white shadow-[0_1px_3px_rgba(0,0,0,0.4)]" : "text-zinc-500 hover:text-zinc-700" }`} type="button" onClick={() => setTheme("dark")}>
                  <Moon className="w-3 h-3 text-zinc-400" /> Night
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span
                className={`text-[7.5px] uppercase font-mono font-bold ${isLight ? "text-zinc-500" : "text-zinc-500"}`}
              >
                Metallic Edition
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button className={`btn-interactive py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all border cursor-pointer hover:-translate-y-0.5 active:scale-95 ${ metallicTheme === "gold" ? "bg-gradient-to-br from-[#dfa033] to-[#6a460b] text-white border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.4)] font-extrabold" : isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" }`} type="button" onClick={() => changeMetallicTheme("gold")}>
                  Gold
                </button>
                <button className={`btn-interactive py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all border cursor-pointer hover:-translate-y-0.5 active:scale-95 ${ metallicTheme === "silver" ? "bg-gradient-to-br from-[#b0b5b9] to-[#3a4146] text-white border-zinc-400 shadow-[0_0_8px_rgba(148,163,184,0.4)] font-extrabold" : isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" }`} type="button" onClick={() => changeMetallicTheme("silver")}>
                  Silver
                </button>
                <button className={`btn-interactive py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all border cursor-pointer hover:-translate-y-0.5 active:scale-95 ${ metallicTheme === "copper" ? "bg-gradient-to-br from-[#c96c42] to-[#471d0b] text-white border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.4)] font-extrabold" : isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" }`} type="button" onClick={() => changeMetallicTheme("copper")}>
                  Copper
                </button>
              </div>
            </div>
          </div>

          <div
            className={`mx-0 p-3 gold-liner-box transition-all ${
              isLight ? "bg-zinc-50 shadow-sm" : "bg-zinc-900 shadow"
            }`}
          >
            <div
              className={`flex items-center gap-2 mb-3 pb-2 border-b ${isLight ? "border-zinc-200" : "border-zinc-800/80"}`}
            >
              <Store className={`w-3.5 h-3.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`} />
              <span
                className={`text-[10px] font-mono tracking-wider uppercase font-bold ${isLight ? "text-zinc-600" : "text-zinc-400"}`}
              >
                Global Branches
              </span>
            </div>
            <div className="space-y-1.5 font-sans">
              {[
                "Marks & Spencer - Cork City",
                "Tesco - Cork City",
                "Tesco - Mahon Point",
              ].map((branch) => {
                const shortName = branch
                  .replace("Marks & Spencer", "M&S")
                  .replace(" - Cork City", " Cork")
                  .replace(" - Mahon Point", " Mahon");
                const isSelected = selectedBranch === branch;
                return (
                  <button className={`btn-interactive w-full flex justify-between items-center text-[10px] p-2 rounded-lg border cursor-pointer transition-colors ${ isSelected ? isLight ? "bg-orange-50 border-orange-200" : "bg-orange-500/10 border-orange-500/30" : isLight ? "bg-white border-zinc-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-100" : "bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-900" }`} key={branch} type="button" onClick={() => setSelectedBranch(branch as typeof selectedBranch)}>
                    <span
                      className={`truncate mr-2 ${
                        isSelected
                          ? isLight
                            ? "text-orange-700 font-bold"
                            : "text-orange-400 font-bold"
                          : isLight
                            ? "text-zinc-700 font-medium"
                            : "text-zinc-300 font-medium"
                      }`}
                    >
                      {shortName}
                    </span>
                    <span
                      className={`font-mono tracking-tight shrink-0 flex items-center gap-1.5 ${isLight ? "text-emerald-500 font-bold" : "text-[9px] px-2 py-0.5 rounded-full uppercase bg-3d-silver-dark metallic-base drop-shadow-md animate-pulse font-black"}`}
                    >
                      {isLight && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      Live
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`mx-0 p-3 gold-liner-box transition-all ${
              isLight ? "bg-zinc-50 shadow-sm" : "bg-zinc-900 shadow"
            }`}
          >
            <div
              className={`flex items-center justify-between mb-3 pb-2 border-b ${isLight ? "border-zinc-200" : "border-zinc-800/80"}`}
            >
              <div className="flex items-center gap-2">
                <Activity className={`w-3.5 h-3.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`} />
                <span
                  className={`text-[10px] font-mono tracking-wider uppercase font-bold ${isLight ? "text-zinc-600" : "text-zinc-400"}`}
                >
                  Weekly Capacity
                </span>
              </div>
              <button className={`btn-interactive text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${ isLight ? "bg-zinc-100 border-zinc-200 text-zinc-600" : "bg-zinc-950 border-zinc-800 text-zinc-400" }`} type="button" onClick={() => setIsCapacityExpanded((prev) => !prev)}>
                {isCapacityExpanded ? "Collapse" : "Expand"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className={`rounded-xl border p-3 ${isLight ? "border-orange-200 bg-orange-50" : "border-orange-500/20 bg-orange-500/10"}`}>
                <p className={`text-[9px] uppercase font-mono font-bold ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>Current</p>
                <p className={`mt-1 text-[26px] font-black leading-none ${isLight ? "text-orange-600" : "text-orange-400"}`}>{capacityPct}%</p>
              </div>
              <div className={`rounded-xl border p-3 ${isLight ? "border-emerald-200 bg-emerald-50" : "border-emerald-500/20 bg-emerald-500/10"}`}>
                <p className={`text-[9px] uppercase font-mono font-bold ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>Forecast</p>
                <p className={`mt-1 text-[26px] font-black leading-none ${isLight ? "text-emerald-600" : "text-emerald-400"}`}>{projectedCapacityPct}%</p>
              </div>
            </div>
            <div className="space-y-2">
              {dailyCapacityBreakdown.slice(0, 3).map((day) => (
                <div key={day.day} className={`rounded-lg border px-2 py-1.5 ${isLight ? "border-zinc-200 bg-white" : "border-zinc-800 bg-zinc-950/60"}`}>
                  <div className="flex items-center justify-between gap-2 text-[9px] font-mono uppercase tracking-wider">
                    <span className={isLight ? "text-zinc-500" : "text-zinc-400"}>{day.day}</span>
                    <span className={day.projectedLoad >= bottleneckThreshold ? "text-amber-500" : isLight ? "text-zinc-700" : "text-zinc-200"}>
                      {day.projectedLoad}%
                    </span>
                  </div>
                  <div className={`mt-1 h-1.5 rounded-full overflow-hidden ${isLight ? "bg-zinc-100" : "bg-zinc-900"}`}>
                    <div className={`h-full rounded-full ${day.projectedLoad >= bottleneckThreshold ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${day.projectedLoad}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`mx-0 p-3 gold-liner-box transition-all ${
              isLight ? "bg-zinc-50 shadow-sm" : "bg-zinc-900 shadow"
            }`}
          >
            <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${isLight ? "border-zinc-200" : "border-zinc-800/80"}`}>
              <CalendarDays className={`w-3.5 h-3.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`} />
              <span className={`text-[10px] font-mono tracking-wider uppercase font-bold ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
                Today Focus
              </span>
            </div>
            <div className="space-y-3">
              <div className={`rounded-xl border p-3 ${isLight ? "border-zinc-200 bg-white" : "border-zinc-800 bg-zinc-950/60"}`}>
                <p className={`text-[9px] uppercase font-mono font-bold ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                  Current view
                </p>
                <p className={`mt-1 text-sm font-bold ${isLight ? "text-zinc-900" : "text-white"}`}>
                  {tabMeta.find((tab) => tab.id === activeTab)?.label || activeTab}
                </p>
                <p className={`mt-1 text-[10px] ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                  {selectedBranch}
                </p>
              </div>
              <div className={`rounded-xl border p-3 ${isLight ? "border-orange-200 bg-orange-50" : "border-orange-500/20 bg-orange-500/10"}`}>
                <p className={`text-[9px] uppercase font-mono font-bold ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                  Immediate action
                </p>
                <p className={`mt-1 text-sm font-bold ${isLight ? "text-orange-700" : "text-orange-300"}`}>
                  {lowStockCount > 0
                    ? `Review ${lowStockCount} low-stock item${lowStockCount === 1 ? "" : "s"}`
                    : "Stock levels are clear"}
                </p>
                <p className={`mt-1 text-[10px] ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
                  Capacity {capacityPct}% against forecast {projectedCapacityPct}%.
                </p>
              </div>
              <div className="space-y-1.5">
                {lowStockItems.slice(0, 2).map((item) => (
                  <div key={item.id} className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-[10px] ${isLight ? "border-zinc-200 bg-white" : "border-zinc-800 bg-zinc-950/60"}`}>
                    <span className={`truncate ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>{item.itemName}</span>
                    <span className={`font-mono shrink-0 ${item.status === "Critical" ? "text-rose-500" : "text-amber-500"}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className={`btn-interactive rounded-xl border px-3 py-2 text-[9px] font-bold uppercase tracking-wider transition-colors ${ isLight ? "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-950 border-zinc-200 hover:bg-white" }`} type="button" onClick={() => setActiveTab("Planning")}>
                  Open Planning
                </button>
                <button className={`btn-interactive rounded-xl border px-3 py-2 text-[9px] font-bold uppercase tracking-wider transition-colors ${ isLight ? "bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-100" : "bg-zinc-900 text-zinc-100 border-zinc-800 hover:bg-zinc-800" }`} type="button" onClick={() => setActiveTab("Reports")}>
                  Open Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      </div>
    </div>


      {/* Schedule Email Report Modal */}
      {isScheduleReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-sm rounded-[1.25rem] shadow-2xl p-6 relative border animate-zoomIn ${
              isLight
                ? "bg-white border-zinc-200"
                : "bg-zinc-950 border-zinc-800"
            }`}
          >
            <h3
              className={`text-sm font-sans font-bold flex items-center gap-2 ${isLight ? "text-zinc-900" : "text-white"}`}
            >
              <Mail className="w-4 h-4 text-rose-500" />
              Schedule Capacity Summary PDF
            </h3>
            <p
              className={`text-xs uppercase font-mono font-bold tracking-widest mt-2 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
            >
              Automated Report Delivery
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className={`text-xs font-bold uppercase tracking-wider font-mono ${isLight ? "text-zinc-600" : "text-zinc-400"}`}
                >
                  Delivery Frequency
                </label>
                <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-1">
                  <button className={`btn-interactive flex-1 py-1.5 text-xs font-bold font-mono tracking-widest uppercase transition-all rounded ${ reportFrequency === "daily" ? "bg-rose-500 text-white shadow" : "text-zinc-500 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800" }`} onClick={() => setReportFrequency("daily")}>
                    Daily
                  </button>
                  <button className={`btn-interactive flex-1 py-1.5 text-xs font-bold font-mono tracking-widest uppercase transition-all rounded ${ reportFrequency === "weekly" ? "bg-rose-500 text-white shadow" : "text-zinc-500 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800" }`} onClick={() => setReportFrequency("weekly")}>
                    Weekly
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className={`text-xs font-bold uppercase tracking-wider font-mono flex gap-1 ${isLight ? "text-zinc-600" : "text-zinc-400"}`}
                >
                  Target Email Address
                  <span className="text-rose-500">*</span>
                </label>
                <input className={`input-gold-glow w-full px-3 py-2 text-xs font-mono rounded border outline-none focus:border-yellow-500 transition-colors ${ isLight ? "bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400" : "bg-black border-zinc-800 text-white placeholder:text-zinc-600" }`} type="email" placeholder="ops.reports@company.com" value={reportEmailAddress} onChange={(e) => setReportEmailAddress(e.target.value)}/>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <button className={`btn-interactive flex-1 py-2 text-xs font-bold uppercase tracking-wider font-mono rounded transition-colors ${ isLight ? "text-zinc-600 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-100" : "text-zinc-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800" }`} onClick={() => setIsScheduleReportModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-interactive flex-[2] py-2 text-xs font-bold uppercase tracking-wider font-mono rounded bg-rose-500 text-white hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-1.5" onClick={() => {
                  if (reportEmailAddress) {
                    setIsScheduleReportModalOpen(false);
                    // Add some dummy action like clearing the input
                    setTimeout(() => {
                      setReportEmailAddress("");
                    }, 300);
                  }
                }} disabled={!reportEmailAddress}>
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


export default App;
