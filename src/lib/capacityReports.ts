import { jsPDF } from 'jspdf';
import type { DailyOperationalLog } from '../types';

export type CapacitySmoothing = 'raw' | 'smoothed';
export type CapacitySortBy = 'date' | 'bottleneck';
export type CapacityOverride = Record<string, { mode: 'ai' | 'manual'; value: number }>;

export interface DailyCapacityBreakdownItem {
  day: DailyOperationalLog['day'];
  date: string;
  current: number;
  projected: number;
}

function calculateTrendFactor(weeklyLogs: DailyOperationalLog[]): number {
  const midIdx = Math.floor(weeklyLogs.length / 2);
  const firstHalf = weeklyLogs.slice(0, midIdx);
  const secondHalf = weeklyLogs.slice(midIdx);

  const firstHalfRate = firstHalf.reduce((sum, log) => sum + (log.productionMade / (log.productionTarget || 1)), 0) / (firstHalf.length || 1);
  const secondHalfRate = secondHalf.reduce((sum, log) => sum + (log.productionMade / (log.productionTarget || 1)), 0) / (secondHalf.length || 1);

  return secondHalfRate / (firstHalfRate || 1);
}

function clampProjection(value: number, fallback: number): number {
  if (Number.isNaN(value) || value <= 0) {
    return Math.min(100, Math.max(0, fallback + 4));
  }

  return Math.min(100, value);
}

export function buildDailyCapacityBreakdown(options: {
  weeklyLogs: DailyOperationalLog[];
  capacitySmoothing: CapacitySmoothing;
  quickAdjustEnabled: boolean;
  capacityOverrides: CapacityOverride;
}): DailyCapacityBreakdownItem[] {
  const { weeklyLogs, capacitySmoothing, quickAdjustEnabled, capacityOverrides } = options;

  if (!weeklyLogs.length) {
    return [];
  }

  const trendFactor = calculateTrendFactor(weeklyLogs);
  const rawList = weeklyLogs.map((log) => {
    const dailyCurrentPct = Math.round(Math.min((log.productionMade / (log.productionTarget || 1)) * 80, 100));
    const rawDailyProjection = Math.round(dailyCurrentPct * Math.max(0.85, Math.min(1.25, trendFactor || 1)));
    let dailyProjectedPct = clampProjection(rawDailyProjection, dailyCurrentPct);

    if (quickAdjustEnabled) {
      const override = capacityOverrides[log.day];
      if (override?.mode === 'manual') {
        dailyProjectedPct = override.value;
      }
    }

    return {
      day: log.day,
      date: log.date.substring(5),
      current: dailyCurrentPct,
      projected: dailyProjectedPct,
    };
  });

  if (capacitySmoothing === 'raw') {
    return rawList;
  }

  return rawList.map((item, index) => {
    const neighbors = [item];
    if (index > 0) neighbors.push(rawList[index - 1]);
    if (index < rawList.length - 1) neighbors.push(rawList[index + 1]);

    return {
      ...item,
      current: Math.round(neighbors.reduce((sum, entry) => sum + entry.current, 0) / neighbors.length),
      projected: Math.round(neighbors.reduce((sum, entry) => sum + entry.projected, 0) / neighbors.length),
    };
  });
}

export function calculateProjectedCapacityPct(options: {
  weeklyLogs: DailyOperationalLog[];
  capacityPct: number;
  quickAdjustEnabled: boolean;
  dailyCapacityBreakdown: DailyCapacityBreakdownItem[];
}): number {
  const { weeklyLogs, capacityPct, quickAdjustEnabled, dailyCapacityBreakdown } = options;

  if (quickAdjustEnabled && dailyCapacityBreakdown.length > 0) {
    return Math.round(dailyCapacityBreakdown.reduce((sum, item) => sum + item.projected, 0) / dailyCapacityBreakdown.length);
  }

  if (!weeklyLogs.length) {
    return capacityPct;
  }

  const trendFactor = calculateTrendFactor(weeklyLogs);
  const rawProjection = Math.round(capacityPct * Math.max(0.85, Math.min(1.25, trendFactor || 1)));

  return clampProjection(rawProjection, capacityPct);
}

export function sortDailyCapacityBreakdown(
  items: DailyCapacityBreakdownItem[],
  capacitySortBy: CapacitySortBy,
): DailyCapacityBreakdownItem[] {
  if (capacitySortBy === 'date') {
    return [...items];
  }

  return [...items].sort((left, right) => right.projected - left.projected);
}

export function downloadCapacityCsv(items: DailyCapacityBreakdownItem[], selectedWeekRange: string): void {
  if (!items.length) {
    return;
  }

  const headers = ['Day', 'Date', 'Current Capacity (%)', 'Projected Capacity (%)'];
  const rows = items.map((item) => [item.day, item.date, item.current, item.projected]);
  const csvContent = [headers.join(','), ...rows.map((row) => row.map((value) => `"${value}"`).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', `weekly_capacity_breakdown_${selectedWeekRange.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCapacityPdf(options: {
  dailyCapacityBreakdown: DailyCapacityBreakdownItem[];
  sortedDailyCapacityBreakdown: DailyCapacityBreakdownItem[];
  selectedWeekRange: string;
  bottleneckThreshold: number;
  capacitySmoothing: CapacitySmoothing;
  capacitySortBy: CapacitySortBy;
}): void {
  const {
    dailyCapacityBreakdown,
    sortedDailyCapacityBreakdown,
    selectedWeekRange,
    bottleneckThreshold,
    capacitySmoothing,
    capacitySortBy,
  } = options;

  if (!dailyCapacityBreakdown.length) {
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const primaryColor = [24, 24, 27];
  const accentColor = [249, 115, 22];
  const lightBg = [244, 244, 245];
  const alertColor = [239, 68, 68];
  const amberAlert = [217, 119, 6];
  const textGray = [113, 113, 122];

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 42, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('FOOD PENGUIN OPERATIONAL CORE SUITE', 15, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('PREDICTIVE WEEKLY CAPACITY PROJECTION REPORT', 15, 20);
  doc.setTextColor(161, 161, 170);
  doc.setFontSize(8);
  doc.text(`Active Calendar Frame: ${selectedWeekRange}`, 15, 26);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-US')}`, 15, 30);
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(168, 10, 27, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('ANALYTICS ENGINE', 170, 13.5);

  let yPos = 52;
  const totalDays = dailyCapacityBreakdown.length;
  const avgProjected = Math.round(dailyCapacityBreakdown.reduce((sum, item) => sum + item.projected, 0) / totalDays);
  const maxProjectedItem = [...dailyCapacityBreakdown].sort((a, b) => b.projected - a.projected)[0];
  const bottlenecksCount = dailyCapacityBreakdown.filter((item) => item.projected > bottleneckThreshold).length;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(15, yPos, 180, 25, 2.5, 2.5, 'F');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('AVERAGE LOAD FACTOR', 22, yPos + 7);
  doc.setFontSize(14);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(`${avgProjected}%`, 22, yPos + 17);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PEAK CAPACITY LIMIT', 80, yPos + 7);
  doc.setFontSize(12.5);
  doc.setTextColor(39, 39, 42);
  doc.text(`${maxProjectedItem.projected}% Load`, 80, yPos + 14.5);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text(`On ${maxProjectedItem.day}`, 80, yPos + 19);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('THRESHOLD BOTTLENECKS', 138, yPos + 7);
  doc.setFontSize(13.5);
  if (bottlenecksCount > 0) {
    doc.setTextColor(alertColor[0], alertColor[1], alertColor[2]);
    doc.text(`${bottlenecksCount} Hot Days`, 138, yPos + 17);
  } else {
    doc.setTextColor(16, 185, 129);
    doc.text('Stable Output (0)', 138, yPos + 17);
  }

  yPos += 35;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('7-DAY DAILY PREDICTED TIMELINE BREAKDOWN', 15, yPos);
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.35);
  doc.line(15, yPos + 2, 195, yPos + 2);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text(`Bottleneck Limit Trigger: ${bottleneckThreshold}%`, 15, yPos);
  doc.text(`Smoothing Mode: ${capacitySmoothing === 'smoothed' ? '3-Day Rolling Moving Average' : 'Raw Metrics (None)'}`, 72, yPos);
  doc.text(`Sequence Filter Order: ${capacitySortBy === 'bottleneck' ? 'Bottleneck Intensity' : 'Calendar Sequence'}`, 142, yPos);

  yPos += 6;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(15, yPos, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('WEEKDAY', 20, yPos + 5.5);
  doc.text('DATE', 50, yPos + 5.5);
  doc.text('BASE CURRENT (%)', 85, yPos + 5.5);
  doc.text('PROJECTED LOAD (%)', 125, yPos + 5.5);
  doc.text('BOTTLENECK STATE', 165, yPos + 5.5);

  const rowHeight = 9.5;
  yPos += 8;

  sortedDailyCapacityBreakdown.forEach((item, index) => {
    const isBottleneck = item.projected > bottleneckThreshold;

    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, yPos, 180, rowHeight, 'F');
    }

    doc.setDrawColor(244, 244, 245);
    doc.setLineWidth(0.2);
    doc.line(15, yPos + rowHeight, 195, yPos + rowHeight);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(item.day, 20, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(82, 82, 91);
    doc.text(item.date, 50, yPos + 6);
    doc.text(`${item.current}%`, 85, yPos + 6);
    doc.setFont('helvetica', 'bold');
    if (isBottleneck) {
      doc.setTextColor(amberAlert[0], amberAlert[1], amberAlert[2]);
      doc.text(`${item.projected}%`, 125, yPos + 6);
    } else {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`${item.projected}%`, 125, yPos + 6);
    }

    if (isBottleneck) {
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(162, yPos + 1.8, 28, 5.5, 0.8, 0.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(180, 83, 9);
      doc.text('BOTTLENECK', 165.5, yPos + 5.6);
    } else {
      doc.setTextColor(113, 113, 122);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('NORMAL LOAD', 165, yPos + 5.6);
    }

    yPos += rowHeight;
  });

  yPos += 10;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('EXECUTIVE INTERPRETATION GUIDELINE', 15, yPos);
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.35);
  doc.line(15, yPos + 2, 195, yPos + 2);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(82, 82, 91);

  const bulletins = [
    '• Capacity forecasts are computed dynamically from completed production batches versus target output.',
    '• Yellow BOTTLENECK badges indicate days exceeding the configured threshold.',
    '• The smoothed view reduces short-term spikes so managers can spot sustained pressure.',
    '• Use this report for staffing, production balancing, and branch-level planning reviews.',
  ];

  bulletins.forEach((bullet) => {
    doc.text(bullet, 15, yPos);
    yPos += 4.5;
  });

  yPos = 282;
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.3);
  doc.line(15, yPos - 3, 195, yPos - 3);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.setFontSize(7);
  doc.text('Automated forecast projection report. Confidential & intended for Food Penguin internal operations.', 15, yPos);
  doc.text('Page 1 of 1', 182, yPos);
  doc.save(`Capacity_Projection_Report_${selectedWeekRange.replace(/\s+/g, '_')}.pdf`);
}
