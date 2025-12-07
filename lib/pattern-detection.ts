/**
 * Pattern Detection utilities for AI insights
 */

export interface Pattern {
  type: 'correlation' | 'temporal' | 'anomaly' | 'trend';
  description: string;
  confidence: number;
  metric1?: string;
  metric2?: string;
  correlation?: number;
  details?: any;
}

/**
 * Calculate Pearson correlation coefficient
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  const sumYY = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Detect weekend vs weekday patterns
 */
export function detectWeekendPattern(data: any[], metric: string): Pattern | null {
  const weekdays: number[] = [];
  const weekends: number[] = [];

  data.forEach((record) => {
    const date = new Date(record.date);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const value = record[metric];

    if (value !== null && value !== undefined && value > 0) {
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekends.push(typeof value === 'string' ? parseFloat(value) : value);
      } else {
        weekdays.push(typeof value === 'string' ? parseFloat(value) : value);
      }
    }
  });

  if (weekdays.length < 3 || weekends.length < 2) {
    return null;
  }

  const weekdayAvg = weekdays.reduce((sum, val) => sum + val, 0) / weekdays.length;
  const weekendAvg = weekends.reduce((sum, val) => sum + val, 0) / weekends.length;
  const difference = weekdayAvg - weekendAvg;
  const percentDiff = (Math.abs(difference) / weekdayAvg) * 100;

  // Only report if difference is significant (>10%)
  if (percentDiff < 10) {
    return null;
  }

  const confidence = Math.min(0.95, 0.6 + (Math.min(weekdays.length, weekends.length) / 20));

  return {
    type: 'temporal',
    description: `You ${metric} ${Math.abs(difference).toFixed(1)} ${getUnit(metric)} ${
      difference > 0 ? 'more' : 'less'
    } on weekdays than weekends (${weekdayAvg.toFixed(1)} vs ${weekendAvg.toFixed(1)})`,
    confidence,
    metric1: metric,
    details: {
      weekdayAvg,
      weekendAvg,
      difference,
      percentDiff,
    },
  };
}

/**
 * Detect correlation between two metrics
 */
export function detectCorrelation(
  data: any[],
  metric1: string,
  metric2: string
): Pattern | null {
  const pairs: { x: number; y: number }[] = [];

  data.forEach((record) => {
    const val1 = record[metric1];
    const val2 = record[metric2];

    if (
      val1 !== null &&
      val1 !== undefined &&
      val1 > 0 &&
      val2 !== null &&
      val2 !== undefined &&
      val2 > 0
    ) {
      pairs.push({
        x: typeof val1 === 'string' ? parseFloat(val1) : val1,
        y: typeof val2 === 'string' ? parseFloat(val2) : val2,
      });
    }
  });

  if (pairs.length < 5) {
    return null;
  }

  const x = pairs.map((p) => p.x);
  const y = pairs.map((p) => p.y);
  const correlation = pearsonCorrelation(x, y);

  // Only report significant correlations
  if (Math.abs(correlation) < 0.5) {
    return null;
  }

  const confidence = Math.min(0.95, 0.5 + Math.abs(correlation) * 0.5);
  const strength = Math.abs(correlation) > 0.7 ? 'strong' : 'moderate';
  const direction = correlation > 0 ? 'increases' : 'decreases';

  return {
    type: 'correlation',
    description: `${strength.charAt(0).toUpperCase() + strength.slice(1)} correlation: When ${metric1} increases, ${metric2} tends to ${direction} (${(correlation * 100).toFixed(0)}% correlation)`,
    confidence,
    metric1,
    metric2,
    correlation,
    details: {
      strength,
      direction,
      sampleSize: pairs.length,
    },
  };
}

/**
 * Detect time-lagged correlation (e.g., sleep affects next day's steps)
 */
export function detectTimeLagCorrelation(
  data: any[],
  metric1: string,
  metric2: string,
  maxLag: number = 3
): Pattern | null {
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let bestCorrelation = 0;
  let bestLag = 0;

  for (let lag = 1; lag <= maxLag; lag++) {
    const pairs: { x: number; y: number }[] = [];

    for (let i = 0; i < sortedData.length - lag; i++) {
      const val1 = sortedData[i][metric1];
      const val2 = sortedData[i + lag][metric2];

      if (
        val1 !== null &&
        val1 !== undefined &&
        val1 > 0 &&
        val2 !== null &&
        val2 !== undefined &&
        val2 > 0
      ) {
        pairs.push({
          x: typeof val1 === 'string' ? parseFloat(val1) : val1,
          y: typeof val2 === 'string' ? parseFloat(val2) : val2,
        });
      }
    }

    if (pairs.length < 5) continue;

    const x = pairs.map((p) => p.x);
    const y = pairs.map((p) => p.y);
    const correlation = Math.abs(pearsonCorrelation(x, y));

    if (correlation > Math.abs(bestCorrelation)) {
      bestCorrelation = pearsonCorrelation(x, y);
      bestLag = lag;
    }
  }

  if (Math.abs(bestCorrelation) < 0.5) {
    return null;
  }

  const confidence = Math.min(0.95, 0.5 + Math.abs(bestCorrelation) * 0.5);
  const direction = bestCorrelation > 0 ? 'increases' : 'decreases';
  const lagText = bestLag === 1 ? 'next day' : `${bestLag} days later`;

  return {
    type: 'correlation',
    description: `When ${metric1} is low, ${metric2} ${direction} the ${lagText} (${(Math.abs(bestCorrelation) * 100).toFixed(0)}% correlation)`,
    confidence,
    metric1,
    metric2,
    correlation: bestCorrelation,
    details: {
      lag: bestLag,
      direction,
    },
  };
}

/**
 * Detect sleep affecting steps pattern
 */
export function detectSleepAffectsSteps(data: any[]): Pattern | null {
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const lowSleepDays: number[] = [];
  const highSleepDays: number[] = [];
  const threshold = 6; // hours

  for (let i = 0; i < sortedData.length - 1; i++) {
    const sleep = sortedData[i].sleep;
    const nextDaySteps = sortedData[i + 1].steps;

    if (sleep && nextDaySteps && nextDaySteps > 0) {
      const sleepHours = typeof sleep === 'string' ? parseFloat(sleep) : sleep;
      if (sleepHours < threshold) {
        lowSleepDays.push(typeof nextDaySteps === 'string' ? parseInt(nextDaySteps) : nextDaySteps);
      } else {
        highSleepDays.push(typeof nextDaySteps === 'string' ? parseInt(nextDaySteps) : nextDaySteps);
      }
    }
  }

  if (lowSleepDays.length < 3 || highSleepDays.length < 3) {
    return null;
  }

  const lowSleepAvg = lowSleepDays.reduce((sum, val) => sum + val, 0) / lowSleepDays.length;
  const highSleepAvg = highSleepDays.reduce((sum, val) => sum + val, 0) / highSleepDays.length;
  const percentChange = ((lowSleepAvg - highSleepAvg) / highSleepAvg) * 100;

  if (Math.abs(percentChange) < 15) {
    return null;
  }

  const confidence = Math.min(0.95, 0.6 + Math.min(lowSleepDays.length, highSleepDays.length) / 20);

  return {
    type: 'correlation',
    description: `When sleep drops below ${threshold} hrs, step count ${percentChange > 0 ? 'increases' : 'falls'} ${Math.abs(percentChange).toFixed(0)}% the next day`,
    confidence,
    metric1: 'sleep',
    metric2: 'steps',
    correlation: percentChange / 100,
    details: {
      threshold,
      lowSleepAvg,
      highSleepAvg,
      percentChange,
    },
  };
}

/**
 * Detect trends in a metric
 */
export function detectTrend(data: any[], metric: string): Pattern | null {
  const values = data
    .filter((d) => d[metric] && d[metric] > 0)
    .map((d) => (typeof d[metric] === 'string' ? parseFloat(d[metric]) : d[metric]))
    .slice(-30);

  if (values.length < 7) {
    return null;
  }

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (Math.abs(percentChange) < 10) {
    return null;
  }

  const confidence = Math.min(0.9, 0.5 + values.length / 40);

  return {
    type: 'trend',
    description: `Your ${metric} has been ${percentChange > 0 ? 'increasing' : 'decreasing'} by ${Math.abs(percentChange).toFixed(0)}% over the past ${values.length} days`,
    confidence,
    metric1: metric,
    details: {
      firstAvg,
      secondAvg,
      percentChange,
      days: values.length,
    },
  };
}

/**
 * Get unit for a metric
 */
function getUnit(metric: string): string {
  const units: { [key: string]: string } = {
    sleep: 'hours',
    steps: 'steps',
    calories: 'calories',
    protein: 'grams',
    weight: 'kg',
  };
  return units[metric] || '';
}

/**
 * Detect all patterns in health data
 */
export function detectAllPatterns(data: any[]): Pattern[] {
  const patterns: Pattern[] = [];

  if (data.length < 5) {
    return patterns;
  }

  // Weekend vs weekday patterns
  ['sleep', 'steps', 'calories'].forEach((metric) => {
    const pattern = detectWeekendPattern(data, metric);
    if (pattern) patterns.push(pattern);
  });

  // Correlations
  const correlations = [
    ['sleep', 'steps'],
    ['sleep', 'calories'],
    ['protein', 'weight'],
    ['steps', 'calories'],
  ];

  correlations.forEach(([m1, m2]) => {
    const pattern = detectCorrelation(data, m1, m2);
    if (pattern) patterns.push(pattern);
  });

  // Time-lagged correlations
  const timeLagPattern = detectSleepAffectsSteps(data);
  if (timeLagPattern) patterns.push(timeLagPattern);

  // Trends
  ['sleep', 'steps', 'calories', 'weight'].forEach((metric) => {
    const pattern = detectTrend(data, metric);
    if (pattern) patterns.push(pattern);
  });

  // Sort by confidence
  return patterns.sort((a, b) => b.confidence - a.confidence);
}
