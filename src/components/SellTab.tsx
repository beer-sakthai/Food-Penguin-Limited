import React from "react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from "recharts";
import { ShoppingBag, TrendingDown, TrendingUp, Sparkles } from "lucide-react";

interface SellTabProps {
  selectedBranch: string;
  theme: 'light' | 'dark';
}

export default function SellTab({ selectedBranch, theme }: SellTabProps) {
  const isLight = theme === 'light';