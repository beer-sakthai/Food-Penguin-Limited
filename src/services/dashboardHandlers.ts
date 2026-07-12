import React from "react";
import { db, doc, handleFirestoreError, OperationType, setDoc, updateDoc } from "../firebase";
import { CompanyTarget, CoreMetrics, DailyOperationalLog, EmployeeHour, InventoryItem, ProductionTask, SalesOrder, WasteRecord } from "../types";

interface HandlerDeps {
  selectedBranch: string;
  isFirebaseSynced: boolean;
  orders: SalesOrder[];
  targets: CompanyTarget[];
  tasks: ProductionTask[];
  hoursData: EmployeeHour[];
  inventory: InventoryItem[];
  selectedWeekRange: string;
  setOrders: React.Dispatch<React.SetStateAction<SalesOrder[]>>;
  setTargets: React.Dispatch<React.SetStateAction<CompanyTarget[]>>;
  setTasks: React.Dispatch<React.SetStateAction<ProductionTask[]>>;
  setWasteRecords: React.Dispatch<React.SetStateAction<WasteRecord[]>>;
  setHoursData: React.Dispatch<React.SetStateAction<EmployeeHour[]>>;
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  setMetrics: React.Dispatch<React.SetStateAction<CoreMetrics>>;
  setWeeklyLogsMap: React.Dispatch<React.SetStateAction<Record<string, DailyOperationalLog[]>>>;
}

export function createDashboardHandlers(deps: HandlerDeps) {
  const {
    selectedBranch,
    isFirebaseSynced,
    targets,
    tasks,
    hoursData,
    inventory,
    selectedWeekRange,
    setOrders,
    setTargets,
    setTasks,
    setWasteRecords,
    setHoursData,
    setInventory,
    setMetrics,
    setWeeklyLogsMap,
  } = deps;

  const handleAddOrder = async (newOrder: Partial<SalesOrder>) => {
    if (!newOrder || typeof newOrder.item !== "string" || typeof newOrder.quantity !== "number" || typeof newOrder.amount !== "number" || !["Completed", "Pending", "Refunded"].includes(newOrder.status as any)) {
      console.warn("handleAddOrder: Invalid or incomplete order data received. Aborting.", newOrder);
      return;
    }

    const timestampStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const orderId = `FP-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullOrder: SalesOrder = {
      item: newOrder.item,
      category: newOrder.category ?? "Sushi Rolls",
      quantity: Math.max(0, Math.floor(newOrder.quantity)),
      amount: Math.max(0, newOrder.amount),
      status: newOrder.status as SalesOrder["status"],
      id: orderId,
      timestamp: timestampStr,
      branch: selectedBranch,
    };

    if (isFirebaseSynced) {
      await setDoc(doc(db, "orders", orderId), fullOrder).catch((err) => handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`));
    } else {
      setOrders((prev) => [fullOrder, ...prev]);
    }

    setMetrics((prev) => ({ ...prev, salesToday: prev.salesToday + fullOrder.amount }));
    setTargets((prev) => prev.map((tgt) => {
      if (tgt.category === "Sell" && tgt.metric.includes("Sales")) {
        const currentValue = tgt.currentValue + fullOrder.amount;
        if (isFirebaseSynced) {
          updateDoc(doc(db, "targets", tgt.id), { currentValue }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `targets/${tgt.id}`));
        }
        return { ...tgt, currentValue };
      }
      return tgt;
    }));
  };

  const handleAddTarget = async (newTarget: Partial<CompanyTarget>) => {
    if (!newTarget || typeof newTarget.name !== "string" || typeof newTarget.metric !== "string" || typeof newTarget.targetValue !== "number" || typeof newTarget.currentValue !== "number" || !["Sell", "Production", "Waste", "Hours"].includes(newTarget.category as any)) {
      console.warn("handleAddTarget: Invalid or incomplete target data received. Aborting.", newTarget);
      return;
    }
    const targetId = `T-${targets.length + 1}`;
    const fullTarget = { ...newTarget, id: targetId } as CompanyTarget;
    if (isFirebaseSynced) {
      await setDoc(doc(db, "targets", targetId), fullTarget).catch((err) => handleFirestoreError(err, OperationType.WRITE, `targets/${targetId}`));
    } else {
      setTargets((prev) => [...prev, fullTarget]);
    }
  };

  const handleAddTask = async (newTask: Partial<ProductionTask>) => {
    if (!newTask || typeof newTask.itemName !== "string" || typeof newTask.assignedTo !== "string" || typeof newTask.quantity !== "number" || !["In Queue", "Cooking", "Prepared", "Out for Delivery"].includes(newTask.status as any)) {
      console.warn("handleAddTask: Invalid or incomplete task data received. Aborting.", newTask);
      return;
    }
    const taskId = `PT-${Math.floor(400 + Math.random() * 100)}`;
    const fullTask: ProductionTask = { itemName: newTask.itemName, assignedTo: newTask.assignedTo, status: newTask.status as ProductionTask["status"], quantity: Math.max(0, Math.floor(newTask.quantity)), priority: newTask.priority || "low", id: taskId };
    if (isFirebaseSynced) {
      await setDoc(doc(db, "tasks", taskId), fullTask).catch((err) => handleFirestoreError(err, OperationType.WRITE, `tasks/${taskId}`));
    } else {
      setTasks((prev) => [fullTask, ...prev]);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: ProductionTask["status"]) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;
    if (isFirebaseSynced) {
      await updateDoc(doc(db, "tasks", taskId), { status: newStatus }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `tasks/${taskId}`));
    } else {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    }
    if (newStatus === "Prepared" && targetTask.status !== "Prepared") {
      setMetrics((m) => ({ ...m, productionItems: m.productionItems + targetTask.quantity }));
      setTargets((tg) => tg.map((tgt) => {
        if (tgt.category === "Production" && tgt.metric.toLowerCase().includes("cook")) {
          const currentValue = tgt.currentValue + targetTask.quantity;
          if (isFirebaseSynced) updateDoc(doc(db, "targets", tgt.id), { currentValue }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `targets/${tgt.id}`));
          return { ...tgt, currentValue };
        }
        return tgt;
      }));
    }
  };

  const handleAddWaste = async (newWaste: Partial<WasteRecord>) => {
    if (!newWaste || typeof newWaste.item !== "string" || typeof newWaste.weight !== "number" || typeof newWaste.cost !== "number" || !["Expired", "Overproduced", "Quality Issue", "Spill/Accident"].includes(newWaste.reason as any)) {
      console.warn("handleAddWaste: Invalid or incomplete waste data received. Aborting.", newWaste);
      return;
    }
    const wasteId = `W-${Math.floor(920 + Math.random() * 80)}`;
    const fullWaste: WasteRecord = { item: newWaste.item, category: newWaste.category || "Unknown", weight: Math.max(0, newWaste.weight), cost: Math.max(0, newWaste.cost), reason: newWaste.reason as WasteRecord["reason"], id: wasteId, date: new Date().toISOString().split("T")[0] };
    if (isFirebaseSynced) {
      await setDoc(doc(db, "waste", wasteId), fullWaste).catch((err) => handleFirestoreError(err, OperationType.WRITE, `waste/${wasteId}`));
    } else {
      setWasteRecords((prev) => [fullWaste, ...prev]);
    }
    setTargets((tg) => tg.map((tgt) => {
      if (tgt.category === "Waste" && tgt.metric.toLowerCase().includes("waste")) {
        const currentValue = tgt.currentValue + fullWaste.cost;
        if (isFirebaseSynced) updateDoc(doc(db, "targets", tgt.id), { currentValue }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `targets/${tgt.id}`));
        return { ...tgt, currentValue };
      }
      return tgt;
    }));
  };

  const handleToggleClockStatus = async (employeeId: string) => {
    const emp = hoursData.find((e) => e.id === employeeId);
    if (!emp) return;
    const nextStatus = emp.status === "Clocked In" ? "Clocked Out" : "Clocked In";
    const actualHours = parseFloat((emp.actualHours + (nextStatus === "Clocked Out" ? 8.0 : 0)).toFixed(1));
    if (isFirebaseSynced) {
      await updateDoc(doc(db, "hours", employeeId), { status: nextStatus, actualHours }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `hours/${employeeId}`));
    } else {
      setHoursData((prev) => prev.map((e) => (e.id === employeeId ? { ...e, status: nextStatus, actualHours } : e)));
    }
  };

  const handleOrderRestock = async (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    const updated = { ...item, stockLevel: 100, currentQty: item.reorderLevel + 120, status: "Healthy" as const };
    if (isFirebaseSynced) {
      await setDoc(doc(db, "inventory", itemId), updated).catch((err) => handleFirestoreError(err, OperationType.WRITE, `inventory/${itemId}`));
    } else {
      setInventory((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    }
  };

  const handleUpdateWeeklyLog = (updatedLog: DailyOperationalLog) => {
    setWeeklyLogsMap((prev) => ({ ...prev, [selectedWeekRange]: (prev[selectedWeekRange] || []).map((log) => (log.day === updatedLog.day ? updatedLog : log)) }));
    if (updatedLog.day === "Sun") setMetrics((prev) => ({ ...prev, salesToday: updatedLog.sales, wasteCost: updatedLog.waste, hoursScheduled: updatedLog.hours, productionTarget: updatedLog.productionTarget, productionItems: updatedLog.productionMade }));
  };

  const handleAddOrUpdateLog = (log: DailyOperationalLog) => {
    setWeeklyLogsMap((prev) => {
      const currentWeekLogs = prev[selectedWeekRange] || [];
      const exists = currentWeekLogs.some((l) => l.day === log.day);
      return { ...prev, [selectedWeekRange]: exists ? currentWeekLogs.map((l) => (l.day === log.day ? log : l)) : [...currentWeekLogs, log] };
    });
    if (log.day === "Sun") setMetrics((prev) => ({ ...prev, salesToday: log.sales, wasteCost: log.waste, hoursScheduled: log.hours, productionTarget: log.productionTarget, productionItems: log.productionMade }));
  };

  return { handleAddOrder, handleAddTarget, handleAddTask, handleUpdateTaskStatus, handleAddWaste, handleToggleClockStatus, handleOrderRestock, handleUpdateWeeklyLog, handleAddOrUpdateLog };
}
