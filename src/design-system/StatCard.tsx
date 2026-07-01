import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardVariant } from "./Card";

export interface StatCardTrend {
  label: string;
  direction: "up" | "down" | "neutral";
}

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  trend?: StatCardTrend;
  variant?: CardVariant;
  isLight?: boolean;
  onClick?: () => void;
  className?: string;
  /** Optional sparkline/chart rendered below the headline value. */
  children?: React.ReactNode;
}

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const TREND_CLASSES_DARK: Record<StatCardTrend["direction"], string> = {
  up: "text-emerald-400",
  down: "text-rose-400",
  neutral: "text-zinc-500",
};

const TREND_CLASSES_LIGHT: Record<StatCardTrend["direction"], string> = {
  up: "text-emerald-600",
  down: "text-rose-600",
  neutral: "text-zinc-500",
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = "gold",
  isLight = false,
  onClick,
  className = "",
  children,
}: StatCardProps) {
  const TrendIcon = trend ? TREND_ICON[trend.direction] : null;

  return (
    <Card
      variant={variant}
      isLight={isLight}
      hover={!!onClick}
      onClick={onClick}
      className={`group relative overflow-hidden flex flex-col justify-between ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p
            className={`text-xs font-mono uppercase tracking-widest font-bold ${isLight ? "text-zinc-400" : "text-zinc-500"}`}
          >
            {label}
          </p>
          <h3
            className={`text-3xl font-sans font-black mt-1.5 ${isLight ? "text-zinc-900" : "text-white"}`}
          >
            {value}
          </h3>
          {trend && TrendIcon && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${isLight ? TREND_CLASSES_LIGHT[trend.direction] : TREND_CLASSES_DARK[trend.direction]}`}
            >
              <TrendIcon className="w-3 h-3" />
              {trend.label}
            </span>
          )}
        </div>
        {icon && (
          <div
            className={`p-2.5 border transition-all duration-300 rounded-xl ${
              isLight
                ? "bg-zinc-100 border-zinc-200 text-orange-600 group-hover:bg-orange-500 group-hover:text-white"
                : "bg-zinc-950 border-zinc-800 text-orange-500 group-hover:bg-orange-500 group-hover:text-white"
            }`}
          >
            {icon}
          </div>
        )}
      </div>
      {children}
    </Card>
  );
}
