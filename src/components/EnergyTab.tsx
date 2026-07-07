import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ComposedChart
} from 'recharts';
import { 
  Zap, 
  Leaf, 
  AlertCircle, 
  TrendingDown,
  Sparkles,
  RefreshCw,
  Flame,
  BatteryCharging
} from 'lucide-react';
import { DailyOperationalLog } from '../types';

interface EnergyTabProps {
  theme?: 'light' | 'dark';
  weeklyLogs?: DailyOperationalLog[];
}

// Mock real-time energy usage data (kWh) vs production volume (units)
const generateEnergyData = () => {
  const data: any[] = [];
  const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'];
  let totalEnergy = 0;
  let totalVolume = 0;
  
  hours.forEach(hour => {
    // Peak hours around 10AM-2PM
    const isPeak = hour === '10AM' || hour === '12PM' || hour === '2PM';
    const volume = isPeak ? Math.floor(Math.random() * 200 + 300) : Math.floor(Math.random() * 100 + 100);
    // Base energy + variable energy based on volume + some inefficiency noise
    const baseEnergy = 10;
    const variableEnergy = volume * 0.05;
    const inefficiency = Math.random() * 5;
    const energy = Number((baseEnergy + variableEnergy + inefficiency).toFixed(1));
    
    totalEnergy += energy;
    totalVolume += volume;
    
    data.push({
      time: hour,
      energy: energy,
      volume: volume,
      efficiency: Number((energy / volume * 1000).toFixed(1)) // Wh per unit
    });
  });
  
  return { data, totalEnergy, totalVolume };
};