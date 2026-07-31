import { describe, it, expect } from "vitest";
import {
  cogsTargetFromSales,
  wasteTargetFromProduction,
  BRANCH_META,
  BUSINESS_LOCATIONS,
  TESCO_PRODUCTS,
  MS_PRODUCTS,
  NET_SALES_FACTOR,
  COGS_TARGET_PCT,
  WASTE_TARGET_PCT,
  COMMISSION_TARGET_PCT,
} from "./business";

describe("cogsTargetFromSales", () => {
  it("applies the commission and COGS target rates", () => {
    // sales=1000 -> net sales after 30% commission = 700 -> 30% COGS target = 210
    expect(cogsTargetFromSales(1000)).toBeCloseTo(210, 5);
  });

  it("is derived consistently from the exported constants", () => {
    const sales = 4321;
    const expected = sales * NET_SALES_FACTOR * (COGS_TARGET_PCT / 100);
    expect(cogsTargetFromSales(sales)).toBeCloseTo(expected, 5);
  });

  it("returns 0 for 0 sales", () => {
    expect(cogsTargetFromSales(0)).toBe(0);
  });

  it("scales linearly with sales", () => {
    expect(cogsTargetFromSales(2000)).toBeCloseTo(cogsTargetFromSales(1000) * 2, 5);
  });
});

describe("wasteTargetFromProduction", () => {
  it("applies the waste target rate", () => {
    // productionValue=500 -> 10% waste target = 50
    expect(wasteTargetFromProduction(500)).toBeCloseTo(50, 5);
  });

  it("is derived consistently from the exported constant", () => {
    const productionValue = 837.5;
    expect(wasteTargetFromProduction(productionValue)).toBeCloseTo(
      productionValue * (WASTE_TARGET_PCT / 100),
      5
    );
  });

  it("returns 0 for 0 production value", () => {
    expect(wasteTargetFromProduction(0)).toBe(0);
  });
});

describe("business constants", () => {
  it("keeps commission/COGS/waste targets as sane percentages", () => {
    for (const pct of [COMMISSION_TARGET_PCT, COGS_TARGET_PCT, WASTE_TARGET_PCT]) {
      expect(pct).toBeGreaterThan(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });

  it("derives BUSINESS_LOCATIONS 1:1 from BRANCH_META", () => {
    expect(BUSINESS_LOCATIONS).toHaveLength(BRANCH_META.length);
    BUSINESS_LOCATIONS.forEach((loc, i) => {
      expect(loc.id).toBe(BRANCH_META[i].id);
      expect(loc.name).toBe(BRANCH_META[i].name);
      expect(loc.type).toBe(BRANCH_META[i].type);
    });
  });

  it("has unique branch ids and names", () => {
    const ids = BRANCH_META.map((b) => b.id);
    const names = BRANCH_META.map((b) => b.name);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe.each([
  ["TESCO_PRODUCTS", TESCO_PRODUCTS],
  ["MS_PRODUCTS", MS_PRODUCTS],
])("%s catalog", (_label, products) => {
  it("has no duplicate barcodes", () => {
    const barcodes = products.map((p) => p.barcode);
    const duplicates = barcodes.filter((b, i) => barcodes.indexOf(b) !== i);
    expect(duplicates).toEqual([]);
  });

  it("has a positive price and non-empty name/category for every item", () => {
    for (const p of products) {
      expect(p.price).toBeGreaterThan(0);
      expect(p.name.trim().length).toBeGreaterThan(0);
      expect(p.category.trim().length).toBeGreaterThan(0);
    }
  });
});
