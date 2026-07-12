import { useEffect, useState } from "react";
import {
  initialHours,
  initialInventory,
  initialOrders,
  initialTargets,
  initialTasks,
  initialWaste,
} from "../data";
import {
  CompanyTarget,
  EmployeeHour,
  InventoryItem,
  SalesOrder,
  WasteRecord,
  ProductionTask,
} from "../types";
import {
  collection,
  db,
  doc,
  getDocs,
  handleFirestoreError,
  onSnapshot,
  OperationType,
  setDoc,
} from "../firebase";
import { DashboardUser } from "./useDashboardAuth";

export function useDashboardCollections(currentUser: DashboardUser | null) {
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);
  const [orders, setOrders] = useState<SalesOrder[]>(initialOrders);
  const [targets, setTargets] = useState<CompanyTarget[]>(initialTargets);
  const [tasks, setTasks] = useState<ProductionTask[]>(initialTasks);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(initialWaste);
  const [hoursData, setHoursData] = useState<EmployeeHour[]>(initialHours);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

  useEffect(() => {
    if (!currentUser || !currentUser.email || currentUser.email === "demo@foodpenguin.com") {
      setIsFirebaseSynced(false);
      return;
    }

    const unsubscribeList: (() => void)[] = [];

    const syncCollection = async <T extends { id: string }>(
      colName: string,
      initialData: T[],
      setList: React.Dispatch<React.SetStateAction<T[]>>,
    ) => {
      try {
        const ref = collection(db, colName);
        const snap = await getDocs(ref).catch((err) =>
          handleFirestoreError(err, OperationType.LIST, colName),
        );

        if (snap.empty) {
          for (const item of initialData) {
            await setDoc(doc(db, colName, item.id), item).catch((err) =>
              handleFirestoreError(err, OperationType.WRITE, `${colName}/${item.id}`),
            );
          }
        }

        const unsub = onSnapshot(
          ref,
          (snapshot) => {
            const list: T[] = [];
            snapshot.forEach((doc: any) => {
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
      await syncCollection("orders", initialOrders, setOrders);
      await syncCollection("tasks", initialTasks, setTasks);
      await syncCollection("waste", initialWaste, setWasteRecords);
      await syncCollection("targets", initialTargets, setTargets);
      await syncCollection("hours", initialHours, setHoursData);
      await syncCollection("inventory", initialInventory, setInventory);
      setIsFirebaseSynced(true);
    };

    initSync();

    return () => {
      unsubscribeList.forEach((unsub) => unsub());
    };
  }, [currentUser]);

  return {
    isFirebaseSynced,
    orders,
    setOrders,
    targets,
    setTargets,
    tasks,
    setTasks,
    wasteRecords,
    setWasteRecords,
    hoursData,
    setHoursData,
    inventory,
    setInventory,
  };
}
