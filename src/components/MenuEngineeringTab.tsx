import React, { useState } from "react";
import {
  AlertTriangle,
  Star,
  ArrowLeft,
  Loader2,
  Check,
  X,
  Sparkles,
  Brain
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";
import { MenuEngineeringItem, IngredientCost } from "../types";

interface MenuEngineeringTabProps {
  theme: "light" | "dark";
  metallicTheme: "gold" | "silver" | "copper" | "crystal";
  menuItems: MenuEngineeringItem[];
  onUpdateMenuItems: (items: MenuEngineeringItem[]) => void;
}

interface AIAdjustment {
  itemId: string;
  suggestedPrice: number;
  reason: string;
}

export default function MenuEngineeringTab({
  theme,
  metallicTheme,
  menuItems,
  onUpdateMenuItems
}: MenuEngineeringTabProps) {
  const isLight = theme === "light";
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [recommendationsText, setRecommendationsText] = useState<string>("");
  const [aiAdjustments, setAiAdjustments] = useState<AIAdjustment[]>([]);
  const [activeTabSub, setActiveTabSub] = useState<"advice" | "adjustments">("advice");

  // Colors & Classes based on Light/Dark Mode
  const bgClass = isLight ? "bg-white text-gray-900" : "bg-[#131313] text-[#e5e2e1]";
  const panelBgClass = isLight ? "bg-gray-50 border border-gray-200" : "bg-white/[0.03] border border-white/[0.05]";
  const textMutedClass = isLight ? "text-gray-500" : "text-[#8E8E93]";
  const tableRowHoverClass = isLight ? "hover:bg-gray-100/50" : "hover:bg-white/[0.01]";
  const inputBgClass = isLight ? "bg-white text-gray-900 border-gray-300" : "bg-black/20 text-white border-white/10";

  // Calculations for items
  const calculatedItems = menuItems.map((item) => {
    const totalCOGS = item.ingredientCosts.reduce((sum, ing) => sum + ing.cost, 0);
    const margin = item.price - totalCOGS;
    const marginPct = item.price > 0 ? (margin / item.price) * 100 : 0;
    const foodCostPct = item.price > 0 ? (totalCOGS / item.price) * 100 : 0;
    return {
      ...item,
      totalCOGS,
      margin,
      marginPct,
      foodCostPct
    };
  });

  // Calculate Averages for quadrant division
  const totalVolume = calculatedItems.reduce((sum, item) => sum + item.salesVolume, 0);
  const avgVolume = calculatedItems.length > 0 ? totalVolume / calculatedItems.length : 0;

  const totalMarginPct = calculatedItems.reduce((sum, item) => sum + item.marginPct, 0);
  const avgMarginPct = calculatedItems.length > 0 ? totalMarginPct / calculatedItems.length : 0;

  // Classify items
  const classifiedItems = calculatedItems.map((item) => {
    const isHighVolume = item.salesVolume >= avgVolume;
    const isHighMargin = item.marginPct >= avgMarginPct;
    let classification: "Star" | "Puzzle" | "Plowhorse" | "Dog" = "Dog";

    if (isHighVolume && isHighMargin) {
      classification = "Star";
    } else if (!isHighVolume && isHighMargin) {
      classification = "Puzzle";
    } else if (isHighVolume && !isHighMargin) {
      classification = "Plowhorse";
    } else {
      classification = "Dog";
    }

    return {
      ...item,
      classification
    };
  });

  // Bento KPI calculations
  const totalRevenue = classifiedItems.reduce((sum, item) => sum + item.price * item.salesVolume, 0);
  const totalProfit = classifiedItems.reduce((sum, item) => sum + item.margin * item.salesVolume, 0);
  const totalCOGSValue = classifiedItems.reduce((sum, item) => sum + item.totalCOGS * item.salesVolume, 0);

  const avgDishProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const avgFoodCostPct = totalRevenue > 0 ? (totalCOGSValue / totalRevenue) * 100 : 0;

  // Top performer (Star with highest volume)
  const stars = classifiedItems.filter((item) => item.classification === "Star");
  let topPerformer = "";
  if (stars.length > 0) {
    const topStar = stars.reduce((max, item) => (item.salesVolume > max.salesVolume ? item : max), stars[0]);
    topPerformer = topStar.name;
  } else if (classifiedItems.length > 0) {
    const topVol = classifiedItems.reduce((max, item) => (item.salesVolume > max.salesVolume ? item : max), classifiedItems[0]);
    topPerformer = `${topVol.name} (Vol)`;
  } else {
    topPerformer = "N/A";
  }

  // Selected item
  const selectedItem = classifiedItems.find((item) => item.id === selectedItemId);

  // Price & Ingredient cost updates
  const handlePriceChange = (itemId: string, newPrice: number) => {
    const updated = menuItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, price: Math.max(0, newPrice) };
      }
      return item;
    });
    onUpdateMenuItems(updated);
  };

  const handleIngredientCostChange = (itemId: string, ingredientIndex: number, newCost: number) => {
    const updated = menuItems.map((item) => {
      if (item.id === itemId) {
        const updatedCosts = item.ingredientCosts.map((ing, idx) => {
          if (idx === ingredientIndex) {
            return { ...ing, cost: Math.max(0, newCost) };
          }
          return ing;
        });
        return { ...item, ingredientCosts: updatedCosts };
      }
      return item;
    });
    onUpdateMenuItems(updated);
  };

  // Fetch recommendations from API
  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch("/api/gemini/menu-engineering-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItems })
      });
      const data = await response.json();
      if (data.recommendations) {
        setRecommendationsText(data.recommendations);
      }
      if (data.adjustments) {
        setAiAdjustments(data.adjustments);
      }
      setActiveTabSub("advice");
    } catch (error) {
      console.error("Failed to fetch menu suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Accept a price adjustment suggestion
  const handleAcceptAdjustment = (itemId: string, suggestedPrice: number) => {
    handlePriceChange(itemId, suggestedPrice);
    setAiAdjustments((prev) => prev.filter((adj) => adj.itemId !== itemId));
  };

  // Dismiss a suggestion card
  const handleDismissAdjustment = (itemId: string) => {
    setAiAdjustments((prev) => prev.filter((adj) => adj.itemId !== itemId));
  };

  // Volume stars rendering
  const renderStars = (volume: number) => {
    const starsCount = Math.min(5, Math.max(1, Math.ceil(volume / 120)));
    return (
      <div className="flex gap-0.5 text-[#FFBF00]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < starsCount ? "fill-[#FFBF00] text-[#FFBF00]" : "text-gray-600"}`}
          />
        ))}
      </div>
    );
  };

  // Simple Markdown Renderer
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith("###")) {
        return (
          <h3 key={i} className="text-xl font-bold text-[#FFBF00] mt-4 mb-2">
            {cleanLine.replace(/^###\s*/, "")}
          </h3>
        );
      }
      if (cleanLine.startsWith("##")) {
        return (
          <h2 key={i} className="text-xl font-bold text-[#FFBF00] mt-4 mb-2">
            {cleanLine.replace(/^##\s*/, "")}
          </h2>
        );
      }
      if (cleanLine.startsWith("-") || cleanLine.startsWith("*")) {
        const content = cleanLine.replace(/^[-*]\s*/, "");
        const boldMatch = content.match(/\*\*(.*?)\*\*/);
        if (boldMatch) {
          const parts = content.split(/\*\*(.*?)\*\*/);
          return (
            <li key={i} className="ml-4 list-disc text-sm my-1 leading-relaxed">
              <span>{parts[0]}</span>
              <strong className="text-[#FFBF00] font-semibold">{parts[1]}</strong>
              <span>{parts[2]}</span>
            </li>
          );
        }
        return (
          <li key={i} className="ml-4 list-disc text-sm my-1 leading-relaxed">
            {content}
          </li>
        );
      }
      if (/^\d+\./.test(cleanLine)) {
        const boldMatch = cleanLine.match(/\*\*(.*?)\*\*/);
        if (boldMatch) {
          const parts = cleanLine.split(/\*\*(.*?)\*\*/);
          return (
            <p key={i} className="text-sm my-2 leading-relaxed">
              <span className="font-semibold text-yellow-500">{parts[0]}</span>
              <strong className="text-[#FFBF00] font-semibold">{parts[1]}</strong>
              <span>{parts[2]}</span>
            </p>
          );
        }
        return (
          <p key={i} className="text-sm my-2 leading-relaxed">
            {cleanLine}
          </p>
        );
      }
      if (cleanLine === "") return <div key={i} className="h-2" />;
      const boldMatch = cleanLine.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        const parts = cleanLine.split(/\*\*(.*?)\*\*/);
        return (
          <p key={i} className="text-sm my-2 leading-relaxed">
            <span>{parts[0]}</span>
            <strong className="text-[#FFBF00] font-semibold">{parts[1]}</strong>
            <span>{parts[2]}</span>
          </p>
        );
      }
      return (
        <p key={i} className="text-sm my-2 leading-relaxed">
          {cleanLine}
        </p>
      );
    });
  };

  // Recharts scatter plot formatting
  const scatterData = classifiedItems.map((item) => ({
    ...item,
    x: item.salesVolume,
    y: item.marginPct
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg border shadow-lg ${isLight ? "bg-white border-gray-200 text-gray-900" : "bg-[#1a1a1a] border-white/10 text-white"}`}>
          <p className="font-bold text-sm">{data.name}</p>
          <p className="text-xs mt-1">Volume: {data.salesVolume} units</p>
          <p className="text-xs">Margin: {data.marginPct.toFixed(1)}%</p>
          <p className="text-xs">Classification: <span className="text-[#FFBF00] font-semibold">{data.classification}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full min-h-screen ${bgClass} p-6 flex flex-col gap-6 transition-all duration-300`}>
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            Menu Engineering{" "}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-[#FFBF00] border border-yellow-500/20 font-normal">
              Nocturnal Amber
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Analyze pricing performance, map item classifications, and accept optimization adjustments.
          </p>
        </div>
        <div>
          <button
            onClick={fetchSuggestions}
            disabled={loadingSuggestions}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFBF00] hover:bg-[#e0a600] active:scale-[0.98] text-black font-semibold rounded-lg text-sm transition-all shadow-md shadow-yellow-500/10 hover:shadow-yellow-500/20"
          >
            {loadingSuggestions ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Consulting Jules...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Jules' Strategic Advice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bento KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className={`p-5 rounded-2xl ${panelBgClass} transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFBF00]/30 hover:shadow-[0_0_12px_rgba(255,191,0,0.1)]`}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Average Dish Profit Margin
          </div>
          <div className="text-3xl font-extrabold text-[#FFBF00] mt-2">
            {avgDishProfitMargin.toFixed(1)}%
          </div>
          <div className="text-xs text-green-500 mt-1">Weighted margin percentage</div>
        </div>

        {/* KPI 2 */}
        <div className={`p-5 rounded-2xl ${panelBgClass} transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFBF00]/30 hover:shadow-[0_0_12px_rgba(255,191,0,0.1)]`}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Top Performer (Star)
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 truncate">
            {topPerformer}
          </div>
          <div className="text-xs text-[#FFBF00] mt-1">Star dish with highest volume</div>
        </div>

        {/* KPI 3 */}
        <div className={`p-5 rounded-2xl ${panelBgClass} transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFBF00]/30 hover:shadow-[0_0_12px_rgba(255,191,0,0.1)]`}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Average Food Cost %
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {avgFoodCostPct.toFixed(1)}%
          </div>
          <div className="text-xs text-red-400 mt-1">Weighted COGS percentage</div>
        </div>

        {/* KPI 4 */}
        <div className={`p-5 rounded-2xl ${panelBgClass} transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFBF00]/30 hover:shadow-[0_0_12px_rgba(255,191,0,0.1)]`}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Monthly Gross Profit
          </div>
          <div className="text-3xl font-extrabold text-[#FFBF00] mt-2">
            €{totalProfit.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-green-500 mt-1">Sum of volume * profit margin</div>
        </div>
      </div>

      {/* Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (3/5 width) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Quadrant Scatter Plot */}
          <div className={`p-6 rounded-2xl ${panelBgClass}`}>
            <h2 className="text-xl font-bold mb-4">Menu Quadrant Performance Matrix</h2>

            <div className="relative h-[320px] w-full rounded-xl border border-dashed border-white/5 bg-black/25 overflow-hidden">
              {/* Quadrant grid labels */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none p-4">
                <div className="border-r border-b border-white/5 flex flex-col items-start justify-start text-[11px] font-bold text-white/20 uppercase">
                  <span>Puzzles</span>
                  <span className="text-[9px] font-medium text-white/10 normal-case">Low Volume / High Margin</span>
                </div>
                <div className="border-b border-white/5 flex flex-col items-end justify-start text-[11px] font-bold text-white/20 uppercase">
                  <span>Stars</span>
                  <span className="text-[9px] font-medium text-white/10 normal-case">High Volume / High Margin</span>
                </div>
                <div className="border-r border-white/5 flex flex-col items-start justify-end text-[11px] font-bold text-white/20 uppercase">
                  <span>Dogs</span>
                  <span className="text-[9px] font-medium text-white/10 normal-case">Low Volume / Low Margin</span>
                </div>
                <div className="flex flex-col items-end justify-end text-[11px] font-bold text-white/20 uppercase">
                  <span>Plowhorses</span>
                  <span className="text-[9px] font-medium text-white/10 normal-case">High Volume / Low Margin</span>
                </div>
              </div>

              {/* Scatter Plot */}
              <div className="absolute inset-0 pt-6 pr-6 pb-2 pl-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Sales Volume"
                      domain={[0, "auto"]}
                      stroke="#8E8E93"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Margin %"
                      unit="%"
                      domain={[0, 100]}
                      stroke="#8E8E93"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine x={avgVolume} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                    <ReferenceLine y={avgMarginPct} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                    <Scatter name="Menu Items" data={scatterData} fill="#FFBF00">
                      {scatterData.map((entry, index) => {
                        const isSelected = entry.id === selectedItemId;
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={isSelected ? "#FFBF00" : "rgba(255, 191, 0, 0.5)"}
                            stroke={isSelected ? "#ffffff" : "#FFBF00"}
                            strokeWidth={isSelected ? 2 : 1}
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedItemId(entry.id)}
                          />
                        );
                      })}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Profitability & Classification Table */}
          <div className={`p-6 rounded-2xl ${panelBgClass} overflow-x-auto`}>
            <h2 className="text-xl font-bold mb-4">Profitability & Classification</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Dish</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Food Cost %</th>
                  <th className="py-3 px-4 text-center">Volume</th>
                  <th className="py-3 px-4 text-center">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {classifiedItems.map((item) => {
                  const isSelected = item.id === selectedItemId;
                  const rowActiveStyle = isSelected
                    ? "border-y border-yellow-500 bg-[#FFBF00]/[0.03] shadow-[0_0_12px_rgba(255,191,0,0.15)]"
                    : tableRowHoverClass;

                  // Food Cost color coding boundaries
                  let costBadgeColor = "bg-green-500/10 text-green-400 border border-green-500/20";
                  if (item.foodCostPct > 40) {
                    costBadgeColor = "bg-red-500/10 text-red-400 border border-red-500/20";
                  } else if (item.foodCostPct >= 30) {
                    costBadgeColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                  }

                  // Class badge styling
                  let classBadgeColor = "bg-gray-500/10 text-gray-400";
                  if (item.classification === "Star") {
                    classBadgeColor = "bg-[#FFBF00]/10 text-[#FFBF00] border border-[#FFBF00]/20 font-bold";
                  } else if (item.classification === "Puzzle") {
                    classBadgeColor = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                  } else if (item.classification === "Plowhorse") {
                    classBadgeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  } else if (item.classification === "Dog") {
                    classBadgeColor = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                  }

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`cursor-pointer transition-all duration-150 ${rowActiveStyle}`}
                    >
                      <td className="py-4 px-4 font-semibold text-sm">{item.name}</td>
                      <td className="py-4 px-4 text-xs text-gray-500">{item.category}</td>
                      <td className="py-4 px-4 text-right font-semibold text-sm">
                        €{item.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs ${costBadgeColor}`}>
                          {item.foodCostPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 flex justify-center">{renderStars(item.salesVolume)}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs ${classBadgeColor}`}>
                          {item.classification}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (2/5 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {selectedItem ? (
            /* Ingredient Cost Breakdown Panel */
            <div className={`p-6 rounded-2xl ${panelBgClass} flex flex-col gap-4 border border-yellow-500/20 shadow-[0_0_15px_rgba(255,191,0,0.03)]`}>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <button
                  onClick={() => setSelectedItemId(null)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Strategy
                </button>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                  Ingredient Breakdown
                </span>
              </div>

              {/* Summary Header */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedItem.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedItem.category} &bull; Prep Time: {selectedItem.prepTime}m
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Classification</div>
                  <span className="text-[#FFBF00] font-bold text-sm uppercase tracking-wider">
                    {selectedItem.classification}
                  </span>
                </div>
              </div>

              {/* Price Editor & boundaries validation */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Selling Price
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 text-sm">€</span>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedItem.price || ""}
                    onChange={(e) => handlePriceChange(selectedItem.id, parseFloat(e.target.value) || 0)}
                    className={`w-full pl-7 pr-10 py-2.5 rounded-lg border text-sm ${inputBgClass} input-gold-glow`}
                  />
                  {selectedItem.price < selectedItem.totalCOGS && (
                    <span className="absolute right-3 flex items-center text-red-500" title="Price is lower than total ingredient costs!">
                      <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                    </span>
                  )}
                </div>
                {selectedItem.price < selectedItem.totalCOGS && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>Critical Loss Risk:</strong> The price is below the total ingredient cost of €{selectedItem.totalCOGS.toFixed(2)}. Make sure to adjust either the item price or raw cost parameters.
                    </div>
                  </div>
                )}
              </div>

              {/* Ingredients List */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5 pb-2">
                  <span>Ingredient</span>
                  <span>Unit Cost (€)</span>
                </div>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {selectedItem.ingredientCosts.map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-4 bg-white/[0.01] p-2 rounded-lg border border-white/5">
                      <span className="text-sm font-medium text-gray-300">{ing.name}</span>
                      <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-gray-500 text-xs">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={ing.cost || ""}
                          onChange={(e) =>
                            handleIngredientCostChange(selectedItem.id, idx, parseFloat(e.target.value) || 0)
                          }
                          className={`w-24 pl-6 pr-2 py-1 rounded border text-right text-xs ${inputBgClass} input-gold-glow`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total COGS & Margin Summary */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Total COGS (Ingredients):</span>
                  <span className="font-semibold text-white">€{selectedItem.totalCOGS.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Profit Margin:</span>
                  <span className={`font-bold ${selectedItem.margin >= 0 ? "text-[#FFBF00]" : "text-red-400"}`}>
                    €{selectedItem.margin.toFixed(2)} ({selectedItem.marginPct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Jules' Strategic Advice Panel */
            <div className={`p-6 rounded-2xl ${panelBgClass} flex flex-col gap-4 border border-[#FFBF00]/10 shadow-[0_0_20px_rgba(255,191,0,0.02)]`}>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h2 className="text-xl font-bold flex items-center gap-1.5">
                  <span className="text-[#FFBF00]">✦</span> Jules' Strategic Insights
                </h2>
              </div>

              {/* Inner Tab Toggle */}
              {aiAdjustments.length > 0 && (
                <div className="flex border-b border-white/5">
                  <button
                    onClick={() => setActiveTabSub("advice")}
                    className={`flex-1 py-2 text-center text-xs font-semibold border-b-2 transition-all ${
                      activeTabSub === "advice"
                        ? "border-[#FFBF00] text-[#FFBF00]"
                        : "border-transparent text-gray-500 hover:text-white"
                    }`}
                  >
                    Narrative Advice
                  </button>
                  <button
                    onClick={() => setActiveTabSub("adjustments")}
                    className={`flex-1 py-2 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                      activeTabSub === "adjustments"
                        ? "border-[#FFBF00] text-[#FFBF00]"
                        : "border-transparent text-gray-500 hover:text-white"
                    }`}
                  >
                    Actionable Adjustments
                    <span className="bg-yellow-500/10 text-[#FFBF00] border border-yellow-500/20 text-[9px] px-1.5 py-0.5 rounded-full">
                      {aiAdjustments.length}
                    </span>
                  </button>
                </div>
              )}

              {loadingSuggestions ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-[#FFBF00] animate-spin" />
                  <p className="text-xs text-gray-500 font-semibold animate-pulse">
                    Consulting Jules for margin recovery...
                  </p>
                </div>
              ) : activeTabSub === "advice" ? (
                <div className="flex flex-col gap-3">
                  {recommendationsText ? (
                    <div className="bg-[#FFBF00]/[0.01] border border-yellow-500/10 rounded-xl p-5 overflow-y-auto max-h-[480px]">
                      {renderMarkdown(recommendationsText)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
                      <Sparkles className="w-10 h-10 text-gray-600" />
                      <div>
                        <h3 className="text-sm font-bold text-white">No Advice Loaded</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-[250px]">
                          Click the "Jules' Strategic Advice" button in the header to retrieve margin recovery strategies.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Actionable suggestions cards */
                <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {aiAdjustments.length > 0 ? (
                    aiAdjustments.map((adj) => {
                      const item = menuItems.find((m) => m.id === adj.itemId);
                      if (!item) return null;
                      return (
                        <div
                          key={adj.itemId}
                          className="bg-white/[0.02] border border-yellow-500/15 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group hover:border-[#FFBF00]/30 transition-all duration-200"
                        >
                          <div>
                            <h4 className="text-sm font-bold text-white">{item.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{adj.reason}</p>
                          </div>

                          <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1">
                            <div>
                              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
                                Price Shift
                              </span>
                              <div className="text-sm font-bold">
                                €{item.price.toFixed(2)} &rarr;{" "}
                                <span className="text-[#FFBF00]">€{adj.suggestedPrice.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDismissAdjustment(adj.itemId)}
                                className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded transition-all active:scale-[0.95]"
                                title="Dismiss Suggestion"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAcceptAdjustment(adj.itemId, adj.suggestedPrice)}
                                className="px-3 py-1.5 bg-[#FFBF00] hover:bg-[#e0a600] text-black font-semibold text-xs rounded transition-all flex items-center gap-1 active:scale-[0.95]"
                              >
                                <Check className="w-3.5 h-3.5" /> Accept
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-20 gap-3 text-gray-500">
                      <Check className="w-8 h-8 text-green-500" />
                      <p className="text-xs">All suggestions applied or dismissed.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
