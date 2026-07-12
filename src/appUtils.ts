import { InventoryItem } from "./types";

export interface DayContributingItem {
  name: string;
  quantity: number;
  category: string;
  loadShare: number;
  impact: "Low" | "Medium" | "High" | "Critical";
}

export function getDayContributingItems(day: string, projected: number): DayContributingItem[] {
  const totalUnits = Math.round(projected * 12);
  switch (day) {
    case "Mon":
      return [
        { name: "Tokyo Dragon Roll", quantity: Math.round(totalUnits * 0.45), category: "Sushi Rolls", loadShare: 45, impact: "High" },
        { name: "California Roll Classic", quantity: Math.round(totalUnits * 0.35), category: "Sushi Rolls", loadShare: 35, impact: "Medium" },
        { name: "Premium Sushi Rice Prep", quantity: Math.round(totalUnits * 0.2), category: "Grains", loadShare: 20, impact: "Low" },
      ];
    case "Tue":
      return [
        { name: "Spicy Bluefin Tuna Roll", quantity: Math.round(totalUnits * 0.5), category: "Sushi Rolls", loadShare: 50, impact: "High" },
        { name: "Kyoto Salmon Sashimi Platter", quantity: Math.round(totalUnits * 0.3), category: "Sashimi & Platters", loadShare: 30, impact: "Medium" },
        { name: "Nori Seaweed Processing", quantity: Math.round(totalUnits * 0.2), category: "Dry Goods", loadShare: 20, impact: "Low" },
      ];
    case "Wed":
      return [
        { name: "Volcano Baked Scallop Roll", quantity: Math.round(totalUnits * 0.4), category: "Specialty Rolls", loadShare: 40, impact: "High" },
        { name: "Tokyo Dragon Roll", quantity: Math.round(totalUnits * 0.35), category: "Sushi Rolls", loadShare: 35, impact: "Medium" },
        { name: "Fresh Avocados Slicing", quantity: Math.round(totalUnits * 0.25), category: "Produce", loadShare: 25, impact: "Low" },
      ];
    case "Thu":
      return [
        { name: "Kyoto Salmon Sashimi Platter", quantity: Math.round(totalUnits * 0.45), category: "Sashimi & Platters", loadShare: 45, impact: "High" },
        { name: "California Roll Classic", quantity: Math.round(totalUnits * 0.35), category: "Sushi Rolls", loadShare: 35, impact: "Medium" },
        { name: "Sushi Seasoning Vinegar Mix", quantity: Math.round(totalUnits * 0.2), category: "Condiments", loadShare: 20, impact: "Low" },
      ];
    case "Fri":
      return [
        { name: "Tokyo Dragon Roll", quantity: Math.round(totalUnits * 0.55), category: "Sushi Rolls", loadShare: 55, impact: "Critical" },
        { name: "Spicy Bluefin Tuna Roll", quantity: Math.round(totalUnits * 0.3), category: "Sushi Rolls", loadShare: 30, impact: "Medium" },
        { name: "Bluefin Tuna Loin Portioning", quantity: Math.round(totalUnits * 0.15), category: "Seafood", loadShare: 15, impact: "Low" },
      ];
    case "Sat":
      return [
        { name: "Volcano Baked Scallop Roll", quantity: Math.round(totalUnits * 0.45), category: "Specialty Rolls", loadShare: 45, impact: "High" },
        { name: "Kyoto Salmon Sashimi Platter", quantity: Math.round(totalUnits * 0.4), category: "Sashimi & Platters", loadShare: 40, impact: "High" },
        { name: "Atlantic Sushi Salmon Slicing", quantity: Math.round(totalUnits * 0.15), category: "Seafood", loadShare: 15, impact: "Low" },
      ];
    case "Sun":
      return [
        { name: "Tokyo Dragon Roll", quantity: Math.round(totalUnits * 0.4), category: "Sushi Rolls", loadShare: 40, impact: "High" },
        { name: "Spicy Bluefin Tuna Roll", quantity: Math.round(totalUnits * 0.35), category: "Sushi Rolls", loadShare: 35, impact: "Medium" },
        { name: "California Roll Classic", quantity: Math.round(totalUnits * 0.25), category: "Sushi Rolls", loadShare: 25, impact: "Low" },
      ];
    default:
      return [
        { name: "Tokyo Dragon Roll", quantity: Math.round(totalUnits * 0.5), category: "Sushi Rolls", loadShare: 50, impact: "High" },
        { name: "California Roll Classic", quantity: Math.round(totalUnits * 0.5), category: "Sushi Rolls", loadShare: 50, impact: "Medium" },
      ];
  }
}

export function autoFlagInventory(items: InventoryItem[]): InventoryItem[] {
  return items.map((item) => {
    let status: "Healthy" | "Low" | "Critical" = "Healthy";
    if (item.stockLevel <= 20) {
      status = "Critical";
    } else if (item.stockLevel <= 50 || item.currentQty <= item.reorderLevel) {
      status = "Low";
    }
    return { ...item, status };
  });
}
