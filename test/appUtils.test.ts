import test from "node:test";
import assert from "node:assert/strict";
import { autoFlagInventory, getDayContributingItems } from "../src/appUtils";
import type { InventoryItem } from "../src/types";

test("getDayContributingItems scales quantities from projected capacity", () => {
  const items = getDayContributingItems("Fri", 100);
  assert.equal(items[0].name, "Tokyo Dragon Roll");
  assert.equal(items[0].quantity, 660);
  assert.equal(items[0].impact, "Critical");
  assert.equal(items.reduce((sum, item) => sum + item.loadShare, 0), 100);
});

test("getDayContributingItems falls back for unknown days", () => {
  const items = getDayContributingItems("Holiday", 10);
  assert.deepEqual(items.map((item) => item.quantity), [60, 60]);
});

test("autoFlagInventory derives stock health without mutating source items", () => {
  const items: InventoryItem[] = [
    { id: "1", name: "Rice", category: "Dry", stockLevel: 80, currentQty: 20, unit: "kg", reorderLevel: 10, status: "Critical" },
    { id: "2", name: "Nori", category: "Dry", stockLevel: 50, currentQty: 20, unit: "packs", reorderLevel: 10, status: "Healthy" },
    { id: "3", name: "Salmon", category: "Fish", stockLevel: 19, currentQty: 20, unit: "kg", reorderLevel: 10, status: "Healthy" },
    { id: "4", name: "Wasabi", category: "Condiment", stockLevel: 90, currentQty: 4, unit: "kg", reorderLevel: 5, status: "Healthy" },
  ];

  const flagged = autoFlagInventory(items);
  assert.deepEqual(flagged.map((item) => item.status), ["Healthy", "Low", "Critical", "Low"]);
  assert.equal(items[0].status, "Critical");
  assert.notEqual(flagged[0], items[0]);
});
