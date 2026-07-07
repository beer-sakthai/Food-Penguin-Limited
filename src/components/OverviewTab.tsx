import React, { useState, useMemo, useCallback } from "react";
import {
  CoreMetrics,
  CompanyTarget,
  SalesOrder,
  ProductionTask,
  WasteRecord,
  EmployeeHour,
  InventoryItem,
  RealtimeAlert,
  DailyOperationalLog,
} from "../types";

interface OverviewTabProps {
  metrics: CoreMetrics;
  onNavigateTab: (tabId: string) => void;
  targets: CompanyTarget[];
  userRole: "Admin" | "Manager" | "Staff" | "User";