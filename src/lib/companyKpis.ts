import {
  BranchKpiSummary,
  CompanyKpiMetric,
  CompanyKpiSnapshot,
  CompanyTarget,
  CompanyTargetVariance,
  DailyOperationalLog,
  OperationalDay,
  OverviewBranchComparisonItem,
  SalesOrder,
} from '../types';

const DAYS: OperationalDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BRANCH_META: Record<string, { id: string; shortLabel: string; type: string; color: string; fill: string }> = {
  'Marks & Spencer - Cork City': {
    id: 'm_s_cork',
    shortLabel: 'M&S Cork City',
    type: 'Luxury Gourmet Specialty Store',
    color: '#f59e0b',
    fill: 'url(#gradMS)',
  },
  'Tesco - Cork City': {
    id: 'tesco_cork',
    shortLabel: 'Tesco Cork City',
    type: 'High Volume Center',
    color: '#10b981',
    fill: 'url(#gradTescoCork)',
  },
  'Tesco - Mahon Point': {
    id: 'tesco_mahon',
    shortLabel: 'Tesco Mahon Point',
    type: 'Suburban Shopping Mall',
    color: '#a855f7',
    fill: 'url(#gradTescoMahon)',
  },
};

const METRIC_LABELS: Record<CompanyKpiMetric['id'], string> = {
  sales: 'Company Revenue',
  production: 'Production Attainment',
  wasteCost: 'Waste Cost',
  wasteRate: 'Waste Rate',
  laborEfficiency: 'Labor Efficiency',
  cogs: 'COGS Ratio',
  targetAttainment: 'Target Attainment',
};

export function sumCogs(log: DailyOperationalLog): number {
  return log.cogs.tazaki + log.cogs.sysco + log.cogs.bulza + log.cogs.sticker + log.cogs.others;
}

function roundPct(value: number): number {
  return Number(value.toFixed(1));
}

function calcDelta(current: number, previous: number): number {
  if (!previous) {
    return current > 0 ? 100 : 0;
  }
  return roundPct(((current - previous) / previous) * 100);
}

function getStatus(metric: CompanyKpiMetric['id'], value: number): CompanyKpiMetric['status'] {
  switch (metric) {
    case 'sales':
      return value >= 35000 ? 'healthy' : value >= 25000 ? 'warning' : 'critical';
    case 'production':
      return value >= 100 ? 'healthy' : value >= 94 ? 'warning' : 'critical';
    case 'wasteCost':
      return value <= 500 ? 'healthy' : value <= 650 ? 'warning' : 'critical';
    case 'wasteRate':
      return value <= 3 ? 'healthy' : value <= 4.5 ? 'warning' : 'critical';
    case 'laborEfficiency':
      return value >= 80 ? 'healthy' : value >= 68 ? 'warning' : 'critical';
    case 'cogs':
      return value <= 55 ? 'healthy' : value <= 62 ? 'warning' : 'critical';
    case 'targetAttainment':
      return value >= 90 ? 'healthy' : value >= 75 ? 'warning' : 'critical';
    default:
      return 'warning';
  }
}

function formatDelta(deltaPct: number): string {
  return `${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}%`;
}

function formatMetricValue(metric: CompanyKpiMetric['id'], value: number): string {
  switch (metric) {
    case 'sales':
    case 'wasteCost':
      return `€${Math.round(value).toLocaleString()}`;
    case 'production':
    case 'wasteRate':
    case 'cogs':
    case 'targetAttainment':
      return `${value.toFixed(1)}%`;
    case 'laborEfficiency':
      return `${value.toFixed(1)} u/hr`;
    default:
      return value.toLocaleString();
  }
}

function formatMetricHelper(metric: CompanyKpiMetric['id'], snapshot: CompanyKpiSnapshot): string {
  switch (metric) {
    case 'sales':
      return `${snapshot.period === 'week' ? 'Weekly' : 'Daily'} gross sales across all branches`;
    case 'production':
      return `${snapshot.production.toLocaleString()} made of ${snapshot.productionTarget.toLocaleString()} target units`;
    case 'wasteCost':
      return `Food waste cost recorded for the selected ${snapshot.period}`;
    case 'wasteRate':
      return `Waste as a share of company sales`;
    case 'laborEfficiency':
      return `Units produced per labor hour`;
    case 'cogs':
      return `COGS as a share of company sales`;
    case 'targetAttainment':
      return `Average completion across tracked company targets`;
    default:
      return '';
  }
}

export function getDayLog(logs: DailyOperationalLog[], day: OperationalDay): DailyOperationalLog | undefined {
  return logs.find((log) => log.day === day);
}

export function buildBranchSummaries(options: {
  branchWeeklyLogsByBranch: Record<string, DailyOperationalLog[]>;
  targets: CompanyTarget[];
  period: 'day' | 'week';
  selectedDay?: OperationalDay;
}): BranchKpiSummary[] {
  const { branchWeeklyLogsByBranch, targets, period, selectedDay } = options;

  return Object.entries(branchWeeklyLogsByBranch).map(([branch, logs]) => {
    const relevantLogs =
      period === 'day' && selectedDay
        ? [getDayLog(logs, selectedDay)].filter((log): log is DailyOperationalLog => Boolean(log))
        : logs;

    const sales = relevantLogs.reduce((sum, log) => sum + log.sales, 0);
    const production = relevantLogs.reduce((sum, log) => sum + log.productionMade, 0);
    const productionTarget = relevantLogs.reduce((sum, log) => sum + log.productionTarget, 0);
    const wasteCost = relevantLogs.reduce((sum, log) => sum + log.waste, 0);
    const hours = relevantLogs.reduce((sum, log) => sum + log.hours, 0);
    const cogs = relevantLogs.reduce((sum, log) => sum + sumCogs(log), 0);
    const productionAttainmentPct = productionTarget ? roundPct((production / productionTarget) * 100) : 0;
    const wastePct = sales ? roundPct((wasteCost / sales) * 100) : 0;
    const laborEfficiency = hours ? roundPct(production / hours) : 0;
    const cogsRatioPct = sales ? roundPct((cogs / sales) * 100) : 0;

    const targetAttainmentPct = targets.length
      ? roundPct(
          targets.reduce((sum, target) => {
            if (target.category === 'Hours') {
              return sum + (target.currentValue <= target.targetValue ? 100 : 60);
            }
            return sum + Math.min((target.currentValue / (target.targetValue || 1)) * 100, 100);
          }, 0) / targets.length,
        )
      : 0;

    const efficiencyScore = Math.min(
      100,
      Math.round(productionAttainmentPct * 0.45 + Math.max(0, 100 - wastePct * 12) * 0.3 + Math.min(laborEfficiency, 100) * 0.25),
    );

    const meta = BRANCH_META[branch] || {
      id: branch.toLowerCase().replace(/\W+/g, '_'),
      shortLabel: branch,
      type: 'Operational Branch',
      color: '#f59e0b',
      fill: '#f59e0b',
    };

    return {
      id: meta.id,
      branch,
      shortLabel: meta.shortLabel,
      sales: Math.round(sales),
      production: Math.round(production),
      productionTarget: Math.round(productionTarget),
      productionAttainmentPct,
      wasteCost: Number(wasteCost.toFixed(2)),
      wastePct,
      hours: Number(hours.toFixed(1)),
      laborEfficiency,
      cogs: Number(cogs.toFixed(2)),
      cogsRatioPct,
      targetAttainmentPct,
      efficiencyScore,
    };
  });
}

export function buildCompanySnapshot(options: {
  currentBranchSummaries: BranchKpiSummary[];
  previousBranchSummaries?: BranchKpiSummary[];
  period: 'day' | 'week';
  selectedDay?: OperationalDay;
}): CompanyKpiSnapshot {
  const { currentBranchSummaries, previousBranchSummaries = [], period, selectedDay } = options;

  const current = currentBranchSummaries.reduce(
    (acc, branch) => ({
      sales: acc.sales + branch.sales,
      production: acc.production + branch.production,
      productionTarget: acc.productionTarget + branch.productionTarget,
      wasteCost: acc.wasteCost + branch.wasteCost,
      hours: acc.hours + branch.hours,
      cogs: acc.cogs + branch.cogs,
      targetAttainmentPct: acc.targetAttainmentPct + branch.targetAttainmentPct,
    }),
    { sales: 0, production: 0, productionTarget: 0, wasteCost: 0, hours: 0, cogs: 0, targetAttainmentPct: 0 },
  );

  const previous = previousBranchSummaries.reduce(
    (acc, branch) => ({
      sales: acc.sales + branch.sales,
      production: acc.production + branch.production,
      productionTarget: acc.productionTarget + branch.productionTarget,
      wasteCost: acc.wasteCost + branch.wasteCost,
      hours: acc.hours + branch.hours,
      cogs: acc.cogs + branch.cogs,
      targetAttainmentPct: acc.targetAttainmentPct + branch.targetAttainmentPct,
    }),
    { sales: 0, production: 0, productionTarget: 0, wasteCost: 0, hours: 0, cogs: 0, targetAttainmentPct: 0 },
  );

  const productionAttainmentPct = current.productionTarget ? roundPct((current.production / current.productionTarget) * 100) : 0;
  const wastePct = current.sales ? roundPct((current.wasteCost / current.sales) * 100) : 0;
  const laborEfficiency = current.hours ? roundPct(current.production / current.hours) : 0;
  const cogsRatioPct = current.sales ? roundPct((current.cogs / current.sales) * 100) : 0;
  const targetAttainmentPct = currentBranchSummaries.length
    ? roundPct(current.targetAttainmentPct / currentBranchSummaries.length)
    : 0;

  const previousProductionAttainmentPct = previous.productionTarget ? roundPct((previous.production / previous.productionTarget) * 100) : 0;
  const previousWastePct = previous.sales ? roundPct((previous.wasteCost / previous.sales) * 100) : 0;
  const previousLaborEfficiency = previous.hours ? roundPct(previous.production / previous.hours) : 0;
  const previousCogsRatioPct = previous.sales ? roundPct((previous.cogs / previous.sales) * 100) : 0;
  const previousTargetAttainmentPct = previousBranchSummaries.length
    ? roundPct(previous.targetAttainmentPct / previousBranchSummaries.length)
    : 0;

  const snapshot: CompanyKpiSnapshot = {
    period,
    selectedDay,
    sales: Math.round(current.sales),
    production: Math.round(current.production),
    productionTarget: Math.round(current.productionTarget),
    productionAttainmentPct,
    wasteCost: Number(current.wasteCost.toFixed(2)),
    wastePct,
    hours: Number(current.hours.toFixed(1)),
    laborEfficiency,
    cogs: Number(current.cogs.toFixed(2)),
    cogsRatioPct,
    targetAttainmentPct,
    metrics: [],
  };

  snapshot.metrics = (
    [
      ['sales', snapshot.sales, current.sales, previous.sales],
      ['production', snapshot.productionAttainmentPct, snapshot.productionAttainmentPct, previousProductionAttainmentPct],
      ['wasteCost', snapshot.wasteCost, snapshot.wasteCost, previous.wasteCost],
      ['wasteRate', snapshot.wastePct, snapshot.wastePct, previousWastePct],
      ['laborEfficiency', snapshot.laborEfficiency, snapshot.laborEfficiency, previousLaborEfficiency],
      ['cogs', snapshot.cogsRatioPct, snapshot.cogsRatioPct, previousCogsRatioPct],
      ['targetAttainment', snapshot.targetAttainmentPct, snapshot.targetAttainmentPct, previousTargetAttainmentPct],
    ] as const
  ).map(([id, displayValue, currentValue, previousValue]) => {
    const deltaPct = calcDelta(currentValue, previousValue);
    return {
      id,
      label: METRIC_LABELS[id],
      value: Number(displayValue.toFixed ? displayValue.toFixed(1) : displayValue),
      displayValue: formatMetricValue(id, Number(displayValue)),
      deltaPct,
      deltaLabel: formatDelta(deltaPct),
      status: getStatus(id, Number(displayValue)),
      helperText: formatMetricHelper(id, snapshot),
    };
  });

  return snapshot;
}

export function buildCompanyTrendData(branchWeeklyLogsByBranch: Record<string, DailyOperationalLog[]>, targets: CompanyTarget[]) {
  return DAYS.map((day) => {
    const summaries = buildBranchSummaries({
      branchWeeklyLogsByBranch,
      targets,
      period: 'day',
      selectedDay: day,
    });
    const snapshot = buildCompanySnapshot({ currentBranchSummaries: summaries, period: 'day', selectedDay: day });

    return {
      day,
      sales: snapshot.sales,
      production: snapshot.production,
      wasteCost: snapshot.wasteCost,
      hours: snapshot.hours,
      cogs: snapshot.cogs,
      laborEfficiency: snapshot.laborEfficiency,
      targetAttainmentPct: snapshot.targetAttainmentPct,
    };
  });
}

export function buildTargetVariance(targets: CompanyTarget[]): CompanyTargetVariance[] {
  return targets.map((target) => {
    const variance = target.category === 'Hours'
      ? target.targetValue - target.currentValue
      : target.currentValue - target.targetValue;
    const variancePct = target.targetValue ? roundPct((variance / target.targetValue) * 100) : 0;
    const status = target.category === 'Hours'
      ? target.currentValue <= target.targetValue ? 'ahead' : target.currentValue <= target.targetValue * 1.1 ? 'at-risk' : 'behind'
      : target.currentValue >= target.targetValue ? 'ahead' : target.currentValue >= target.targetValue * 0.9 ? 'at-risk' : 'behind';

    return {
      id: target.id,
      name: target.name,
      category: target.category,
      metric: target.metric,
      currentValue: target.currentValue,
      targetValue: target.targetValue,
      unit: target.unit,
      variance: Number(variance.toFixed(2)),
      variancePct,
      status,
    };
  });
}

export function buildOverviewBranchComparisonData(options: {
  branchSummaries: BranchKpiSummary[];
  selectedBranch: string;
  vsAverageMode: boolean;
}): OverviewBranchComparisonItem[] {
  const { branchSummaries, selectedBranch, vsAverageMode } = options;

  const items = branchSummaries.map((summary) => {
    const meta = BRANCH_META[summary.branch] || {
      shortLabel: summary.branch,
      type: 'Operational Branch',
      color: '#f59e0b',
      fill: '#f59e0b',
    };

    return {
      id: summary.id,
      name: meta.shortLabel,
      fullName: summary.branch,
      type: meta.type,
      sales: summary.sales,
      production: summary.production,
      wastePct: summary.wastePct,
      efficiencyScore: summary.efficiencyScore,
      color: meta.color,
      fill: meta.fill,
    };
  });

  if (!vsAverageMode) {
    return items;
  }

  const selected = items.find((item) => item.fullName === selectedBranch) || items[0];
  const totals = items.reduce(
    (acc, item) => ({
      sales: acc.sales + item.sales,
      production: acc.production + item.production,
      wastePct: acc.wastePct + item.wastePct,
      efficiencyScore: acc.efficiencyScore + item.efficiencyScore,
    }),
    { sales: 0, production: 0, wastePct: 0, efficiencyScore: 0 },
  );

  return [
    selected,
    {
      id: 'company_avg',
      name: 'Company Average',
      fullName: 'Standard Company Average',
      type: 'Combined Corporate Benchmark',
      sales: Math.round(totals.sales / items.length),
      production: Math.round(totals.production / items.length),
      wastePct: roundPct(totals.wastePct / items.length),
      efficiencyScore: Math.round(totals.efficiencyScore / items.length),
      color: '#3b82f6',
      fill: 'url(#gradAvg)',
    },
  ];
}

export function getChampionBranch(branchSummaries: BranchKpiSummary[]): BranchKpiSummary | undefined {
  return [...branchSummaries].sort((left, right) => right.efficiencyScore - left.efficiencyScore)[0];
}

export function buildCompanyInsightPrompt(snapshot: CompanyKpiSnapshot, branchSummaries: BranchKpiSummary[], targetVariance: CompanyTargetVariance[], selectedWeekRange: string): string {
  const topBranch = getChampionBranch(branchSummaries);
  const behindTargets = targetVariance
    .filter((target) => target.status !== 'ahead')
    .slice(0, 3)
    .map((target) => `${target.name} (${target.variancePct}% variance)`)
    .join(', ');

  return [
    `Generate a concise executive company KPI summary for Food Penguin Limited for ${selectedWeekRange}.`,
    `Revenue is €${snapshot.sales.toLocaleString()}, production attainment is ${snapshot.productionAttainmentPct.toFixed(1)}%, waste rate is ${snapshot.wastePct.toFixed(1)}%, labor efficiency is ${snapshot.laborEfficiency.toFixed(1)} units/hour, COGS ratio is ${snapshot.cogsRatioPct.toFixed(1)}%, and target attainment is ${snapshot.targetAttainmentPct.toFixed(1)}%.`,
    `Top branch: ${topBranch?.shortLabel || 'n/a'} at efficiency score ${topBranch?.efficiencyScore || 0}.`,
    `At-risk targets: ${behindTargets || 'none'}.`,
    'Write no more than 4 sentences and keep the advice practical for executives.',
  ].join(' ');
}

export function getWeekComparisonRange(weekRangeOptions: readonly string[], selectedWeekRange: string): string | undefined {
  const index = weekRangeOptions.indexOf(selectedWeekRange);
  if (index === -1) {
    return undefined;
  }
  return weekRangeOptions[index + 1];
}

export function getBranchOrderRevenue(orders: SalesOrder[], branch: string): number {
  return orders
    .filter((order) => (order.branch || 'Marks & Spencer - Cork City') === branch && order.status !== 'Refunded')
    .reduce((sum, order) => sum + order.amount, 0);
}
