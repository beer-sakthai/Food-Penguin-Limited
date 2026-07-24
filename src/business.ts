// Saksee · 2026-07-24 · business rules for 3-kiosk sushi operator
// 2 Tesco + 1 Marks & Spencer. Same cost structure, different products per location.

export const BUSINESS_LOCATIONS = [
  { id: "tesco-cork", name: "Tesco - Cork City", type: "Tesco" },
  { id: "tesco-mahon", name: "Tesco - Mahon Point", type: "Tesco" },
  { id: "ms-cork", name: "Marks & Spencer - Cork City", type: "M&S" },
] as const;

export type BusinessLocation = (typeof BUSINESS_LOCATIONS)[number]["name"];

/** Target waste cost as % of production value/cost. */
export const WASTE_TARGET_PCT = 10;

/** Target COGS as % of net sales (after commission). */
export const COGS_TARGET_PCT = 30;

/** Retailer commission as % of gross sales. */
export const COMMISSION_TARGET_PCT = 30;

/** Net sales after commission = gross sales × (1 - COMMISSION_TARGET_PCT). */
export const NET_SALES_FACTOR = 1 - COMMISSION_TARGET_PCT / 100;

/** Default production target used when none provided. */
export const DEFAULT_DAILY_PRODUCTION_TARGET = 11500;

/** Derive a COGS target from gross sales. */
export const cogsTargetFromSales = (sales: number) => sales * NET_SALES_FACTOR * (COGS_TARGET_PCT / 100);

/** Derive a waste-cost target from production value. */
export const wasteTargetFromProduction = (productionValue: number) => productionValue * (WASTE_TARGET_PCT / 100);
