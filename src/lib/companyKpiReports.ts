import { jsPDF } from 'jspdf';
import { BranchKpiSummary, CompanyKpiSnapshot, CompanyTargetVariance } from '../types';

export function downloadCompanyKpiCsv(options: {
  snapshot: CompanyKpiSnapshot;
  branchSummaries: BranchKpiSummary[];
  selectedWeekRange: string;
}): void {
  const { snapshot, branchSummaries, selectedWeekRange } = options;
  const headers = ['Branch', 'Sales', 'Production', 'Production Target', 'Waste Cost', 'Waste %', 'Hours', 'Labor Efficiency', 'COGS', 'Efficiency Score'];
  const rows = branchSummaries.map((branch) => [
    branch.shortLabel,
    branch.sales,
    branch.production,
    branch.productionTarget,
    branch.wasteCost.toFixed(2),
    branch.wastePct.toFixed(1),
    branch.hours.toFixed(1),
    branch.laborEfficiency.toFixed(1),
    branch.cogs.toFixed(2),
    branch.efficiencyScore,
  ]);

  const summaryRows = [
    [],
    ['Company Summary', snapshot.sales, snapshot.production, snapshot.productionTarget, snapshot.wasteCost.toFixed(2), snapshot.wastePct.toFixed(1), snapshot.hours.toFixed(1), snapshot.laborEfficiency.toFixed(1), snapshot.cogs.toFixed(2), snapshot.targetAttainmentPct.toFixed(1)],
  ];

  const csv = [headers.join(','), ...rows.map((row) => row.map((value) => `"${value}"`).join(',')), ...summaryRows.map((row) => row.map((value) => `"${value}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `company_kpis_${selectedWeekRange.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCompanyKpiPdf(options: {
  snapshot: CompanyKpiSnapshot;
  branchSummaries: BranchKpiSummary[];
  targetVariance: CompanyTargetVariance[];
  selectedWeekRange: string;
}): void {
  const { snapshot, branchSummaries, targetVariance, selectedWeekRange } = options;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFillColor(24, 24, 27);
  doc.rect(0, 0, 210, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FOOD PENGUIN COMPANY KPI REPORT', 14, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Period: ${selectedWeekRange}`, 14, 22);
  doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 14, 28);

  let y = 46;
  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Company KPI Snapshot', 14, y);
  y += 8;

  const summaryLines = [
    `Revenue: €${snapshot.sales.toLocaleString()}`,
    `Production: ${snapshot.production.toLocaleString()} / ${snapshot.productionTarget.toLocaleString()} (${snapshot.productionAttainmentPct.toFixed(1)}%)`,
    `Waste Cost: €${snapshot.wasteCost.toFixed(2)} (${snapshot.wastePct.toFixed(1)}%)`,
    `Labor Efficiency: ${snapshot.laborEfficiency.toFixed(1)} units/hour`,
    `COGS Ratio: ${snapshot.cogsRatioPct.toFixed(1)}%`,
    `Target Attainment: ${snapshot.targetAttainmentPct.toFixed(1)}%`,
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  summaryLines.forEach((line) => {
    doc.text(line, 14, y);
    y += 6;
  });

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Branch Performance', 14, y);
  y += 7;

  doc.setFillColor(39, 39, 42);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Branch', 16, y + 5);
  doc.text('Sales', 58, y + 5);
  doc.text('Prod %', 86, y + 5);
  doc.text('Waste %', 110, y + 5);
  doc.text('Eff.', 136, y + 5);
  doc.text('COGS %', 156, y + 5);
  doc.text('Score', 182, y + 5);
  y += 8;

  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'normal');
  branchSummaries.forEach((branch, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    if (index % 2 === 0) {
      doc.setFillColor(244, 244, 245);
      doc.rect(14, y, 182, 7, 'F');
    }
    doc.text(branch.shortLabel, 16, y + 4.5);
    doc.text(`€${branch.sales.toLocaleString()}`, 58, y + 4.5);
    doc.text(`${branch.productionAttainmentPct.toFixed(1)}%`, 86, y + 4.5);
    doc.text(`${branch.wastePct.toFixed(1)}%`, 110, y + 4.5);
    doc.text(`${branch.laborEfficiency.toFixed(1)}`, 136, y + 4.5);
    doc.text(`${branch.cogsRatioPct.toFixed(1)}%`, 156, y + 4.5);
    doc.text(`${branch.efficiencyScore}`, 182, y + 4.5);
    y += 7;
  });

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Target Variance', 14, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  targetVariance.slice(0, 6).forEach((target) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${target.name}: ${target.variance >= 0 ? '+' : ''}${target.variance.toFixed(1)} ${target.unit} (${target.variancePct.toFixed(1)}%)`, 14, y);
    y += 5.5;
  });

  doc.save(`company_kpis_${selectedWeekRange.replace(/\s+/g, '_')}.pdf`);
}
