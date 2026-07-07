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
  InitialEmployeeHours,
  initialInventory,
  initialAlerts,
  initialMenuItems,
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
  RealtimeAlert,
  DailyOperationalLog,
  MenuEngineeringItem,
} from "./types";
import {
  app,
  db,
  auth,
  signOut,
  onAuthChange,
  isFirebaseSynced,
  setDoc,
  doc,
  getDocs,
  collectionDocs,
  handleFirestoreError,
  OperationType,
} from "./firebase";
import { Badge, Button, Card, Input, Select, StatCard } from "./design-system";
