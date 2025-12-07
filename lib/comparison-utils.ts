/**
 * Comparison utilities for past vs present analysis
 */

export interface ComparisonResult {
  metric: string;
  label: string;
  current: {
    value: number;
    period: string;
  };
  previous: {
    value: number;
    period: string;
  };
  change: number;
  changePercent: number;
  trend: 'improving' | 'declining' | 'stable';
  unit: string;
}

/**
 * Compare current period vs previous period
 */
export function comparePeriods(
  data: any[],
  metric: string,
  days: number = 7
): ComparisonResult | null {
  if (data.length === 0) {
    return null;
  }

  // Sort by date (most recent first)
  const sortedData = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get current period (last N days)
  const currentPeriod = sortedData.slice(0, days);
  const currentDate = new Date(currentPeriod[0]?.date);
  const currentEndDate = new Date(currentPeriod[currentPeriod.length - 1]?.date);

  // Get previous period (N days before current)
  const previousStartIndex = days;
  const previousPeriod = sortedData.slice(previousStartIndex, previousStartIndex + days);
  
  if (previousPeriod.length === 0) {
    return null; // Not enough data for comparison
  }

  const previousDate = new Date(previousPeriod[0]?.date);
  const previousEndDate = new Date(previousPeriod[previousPeriod.length - 1]?.date);

  // Calculate averages/totals for current period
  const currentValue = calculateMetricValue(currentPeriod, metric);
  const previousValue = calculateMetricValue(previousPeriod, metric);

  if (currentValue === null || previousValue === null) {
    return null;
  }

  // Calculate change
  const change = currentValue - previousValue;
  const changePercent = previousValue > 0
    ? ((change / previousValue) * 100)
    : currentValue > 0 ? 100 : 0;

  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  const threshold = 0.05; // 5% threshold
  if (changePercent > threshold) {
    trend = metric === 'weight' ? 'declining' : 'improving';
  } else if (changePercent < -threshold) {
    trend = metric === 'weight' ? 'improving' : 'declining';
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return {
    metric,
    label: getMetricLabel(metric),
    current: {
      value: currentValue,
      period: `${formatDate(currentEndDate)} - ${formatDate(currentDate)}`,
    },
    previous: {
      value: previousValue,
      period: `${formatDate(previousEndDate)} - ${formatDate(previousDate)}`,
    },
    change,
    changePercent: Math.abs(changePercent),
    trend,
    unit: getMetricUnit(metric),
  };
}

/**
 * Calculate metric value (average or total)
 */
function calculateMetricValue(data: any[], metric: string): number | null {
  const values = data
    .map((d) => {
      const value = d[metric];
      if (value === null || value === undefined || value === '') {
        return null;
      }
      return typeof value === 'string' ? parseFloat(value) : value;
    })
    .filter((v) => v !== null && v > 0) as number[];

  if (values.length === 0) {
    return null;
  }

  // For averages: sleep, protein, weight
  if (metric === 'sleep' || metric === 'protein' || metric === 'weight') {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  // For totals: steps, calories
  if (metric === 'steps' || metric === 'calories') {
    return values.reduce((sum, v) => sum + v, 0);
  }

  return null;
}

/**
 * Get metric label
 */
function getMetricLabel(metric: string): string {
  const labels: { [key: string]: string } = {
    steps: 'Steps',
    sleep: 'Sleep',
    calories: 'Calories',
    protein: 'Protein',
    weight: 'Weight',
  };
  return labels[metric] || metric;
}

/**
 * Get metric unit
 */
function getMetricUnit(metric: string): string {
  const units: { [key: string]: string } = {
    steps: 'steps',
    sleep: 'hrs',
    calories: 'cal',
    protein: 'g',
    weight: 'kg',
  };
  return units[metric] || '';
}

/**
 * Compare all metrics
 */
export function compareAllMetrics(
  data: any[],
  days: number = 7
): ComparisonResult[] {
  const metrics = ['steps', 'sleep', 'calories', 'protein', 'weight'];
  const results: ComparisonResult[] = [];

  for (const metric of metrics) {
    const comparison = comparePeriods(data, metric, days);
    if (comparison) {
      results.push(comparison);
    }
  }

  return results;
}
