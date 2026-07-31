import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

import OverviewTab from "./OverviewTab";
import SellTab from "./SellTab";
import WasteTab from "./WasteTab";
import HoursTab from "./HoursTab";
import ProductionTab from "./ProductionTab";
import PlanningTab from "./PlanningTab";
import TargetTab from "./TargetTab";
import TargetsProductionTab from "./TargetsProductionTab";
import ReportsTab from "./ReportsTab";
import SolutionView from "./SolutionView";
import SuppliersTab from "./SuppliersTab";
import FinanceTab from "./FinanceTab";
import PriceImporterTab from "./PriceImporterTab";
import SplashScreen from "./SplashScreen";

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
  initialAlerts,
} from "../data";

const noop = () => {};

describe("tab smoke tests", () => {
  it("OverviewTab renders without crashing", () => {
    expect(() =>
      render(
        <OverviewTab
          metrics={initialMetrics}
          weeklyLogs={initialWeeklyLogs}
          inventory={initialInventory}
          orders={initialOrders}
          selectedBranch="All branches"
          onNavigateTab={noop}
          onReviewAlerts={noop}
          onOpenLogForm={noop}
        />
      )
    ).not.toThrow();
  });

  it("SellTab renders without crashing", () => {
    expect(() =>
      render(
        <SellTab orders={initialOrders} onAddOrder={noop} selectedBranch="Tesco - Cork City" />
      )
    ).not.toThrow();
  });

  it("WasteTab renders without crashing", () => {
    expect(() =>
      render(
        <WasteTab
          wasteRecords={initialWaste}
          onAddWaste={noop}
          totalCostToday={412.5}
          selectedBranch="All branches"
          theme="dark"
        />
      )
    ).not.toThrow();
  });

  it("HoursTab renders without crashing", () => {
    expect(() =>
      render(
        <HoursTab hoursData={initialHours} onToggleClockStatus={noop} totalHoursScheduled={124} />
      )
    ).not.toThrow();
  });

  it("ProductionTab renders without crashing", () => {
    expect(() =>
      render(
        <ProductionTab
          recipes={initialRecipes}
          tasks={initialTasks}
          onAddTask={noop}
          onUpdateTaskStatus={noop}
        />
      )
    ).not.toThrow();
  });

  it("PlanningTab renders without crashing", () => {
    expect(() =>
      render(
        <PlanningTab
          inventory={initialInventory}
          onOrderRestock={noop}
          selectedBranch="All branches"
          theme="dark"
          weeklyLogs={initialWeeklyLogs}
        />
      )
    ).not.toThrow();
  });

  it("TargetTab renders without crashing", () => {
    expect(() =>
      render(<TargetTab targets={initialTargets} onAddTarget={noop} />)
    ).not.toThrow();
  });

  it("TargetsProductionTab renders without crashing", () => {
    expect(() =>
      render(
        <TargetsProductionTab
          targets={initialTargets}
          onAddTarget={noop}
          onUpdateTarget={noop}
          recipes={initialRecipes}
          tasks={initialTasks}
          onAddTask={noop}
          onUpdateTaskStatus={noop}
          weeklyLogs={initialWeeklyLogs}
          metrics={{ productionItems: initialMetrics.productionItems, productionTarget: initialMetrics.productionTarget }}
        />
      )
    ).not.toThrow();
  });

  it("ReportsTab renders without crashing", () => {
    expect(() =>
      render(
        <ReportsTab
          orders={initialOrders}
          targets={initialTargets}
          tasks={initialTasks}
          wasteRecords={initialWaste}
          hoursData={initialHours}
          inventory={initialInventory}
          weeklyLogs={initialWeeklyLogs}
          alerts={initialAlerts}
          theme="dark"
        />
      )
    ).not.toThrow();
  });

  it("SolutionView renders without crashing", () => {
    expect(() =>
      render(
        <SolutionView
          metrics={{
            salesToday: initialMetrics.salesToday,
            cogsToday: initialMetrics.salesToday * 0.3,
            wasteCost: initialMetrics.wasteCost,
            productionItems: initialMetrics.productionItems,
            productionTarget: initialMetrics.productionTarget,
          }}
          weeklyLogs={initialWeeklyLogs}
          orders={initialOrders}
          selectedBranch="All branches"
          onNavigateTab={noop}
        />
      )
    ).not.toThrow();
  });

  it("SuppliersTab renders without crashing", () => {
    expect(() => render(<SuppliersTab theme="dark" />)).not.toThrow();
  });

  it("FinanceTab renders without crashing", () => {
    expect(() => render(<FinanceTab theme="dark" />)).not.toThrow();
  });

  it("PriceImporterTab renders without crashing", () => {
    expect(() => render(<PriceImporterTab onProductsImported={noop} />)).not.toThrow();
  });

  it("SplashScreen renders without crashing", () => {
    vi.useFakeTimers();
    expect(() =>
      render(<SplashScreen onComplete={noop} selectedBranch="All branches" />)
    ).not.toThrow();
    vi.useRealTimers();
  });
});
