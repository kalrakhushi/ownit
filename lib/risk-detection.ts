/**
 * Risk Detection utilities for health alerts
 */

export interface RiskAlert {
  type: 'sleep' | 'activity' | 'nutrition' | 'weight' | 'mood' | 'consistency';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  metric?: string;
  value?: number;
  threshold?: number;
  daysAffected?: number;
}

/**
 * Detect sleep-related risks
 */
export function detectSleepRisks(data: any[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const recentData = data.slice(0, 7); // Last 7 days
  const sleepValues = recentData
    .filter((d) => d.sleep && d.sleep > 0)
    .map((d) => parseFloat(d.sleep));

  if (sleepValues.length === 0) {
    return alerts;
  }

  const avgSleep = sleepValues.reduce((sum, val) => sum + val, 0) / sleepValues.length;
  const lowSleepDays = sleepValues.filter((s) => s < 6).length;
  const veryLowSleepDays = sleepValues.filter((s) => s < 5).length;

  // Very low sleep (high risk)
  if (veryLowSleepDays > 0) {
    alerts.push({
      type: 'sleep',
      severity: 'high',
      title: 'Very Low Sleep Detected',
      description: `${veryLowSleepDays} day(s) with less than 5 hours of sleep in the past week.`,
      recommendation: 'Aim for at least 7-9 hours of sleep. Consider establishing a consistent bedtime routine.',
      metric: 'sleep',
      value: Math.min(...sleepValues.filter((s) => s < 5)),
      threshold: 5,
      daysAffected: veryLowSleepDays,
    });
  }

  // Low average sleep (medium risk)
  if (avgSleep < 6 && lowSleepDays >= 3) {
    alerts.push({
      type: 'sleep',
      severity: 'medium',
      title: 'Consistently Low Sleep',
      description: `Average sleep is ${avgSleep.toFixed(1)} hours over the past week.`,
      recommendation: 'Try to improve sleep quality and duration. Consider reducing screen time before bed.',
      metric: 'sleep',
      value: avgSleep,
      threshold: 6,
      daysAffected: lowSleepDays,
    });
  }

  return alerts;
}

/**
 * Detect activity-related risks
 */
export function detectActivityRisks(data: any[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const recentData = data.slice(0, 7); // Last 7 days
  const stepsValues = recentData
    .filter((d) => d.steps && d.steps > 0)
    .map((d) => parseInt(d.steps));

  if (stepsValues.length === 0) {
    alerts.push({
      type: 'activity',
      severity: 'medium',
      title: 'No Activity Data',
      description: 'No step data recorded in the past week.',
      recommendation: 'Start tracking your daily steps. Aim for at least 5,000-10,000 steps per day.',
      metric: 'steps',
    });
    return alerts;
  }

  const avgSteps = stepsValues.reduce((sum, val) => sum + val, 0) / stepsValues.length;
  const veryLowActivityDays = stepsValues.filter((s) => s < 3000).length;
  const noActivityDays = 7 - stepsValues.length;

  // Very low activity (high risk)
  if (avgSteps < 3000 && veryLowActivityDays >= 3) {
    alerts.push({
      type: 'activity',
      severity: 'high',
      title: 'Very Low Activity Level',
      description: `Average steps: ${Math.round(avgSteps).toLocaleString()} per day. ${veryLowActivityDays} day(s) with less than 3,000 steps.`,
      recommendation: 'Increase daily activity. Try taking short walks, using stairs, or setting step goals.',
      metric: 'steps',
      value: avgSteps,
      threshold: 3000,
      daysAffected: veryLowActivityDays,
    });
  }

  // Missing activity data
  if (noActivityDays >= 4) {
    alerts.push({
      type: 'activity',
      severity: 'medium',
      title: 'Inconsistent Activity Tracking',
      description: `${noActivityDays} day(s) without step data in the past week.`,
      recommendation: 'Try to log your steps daily for better insights and motivation.',
      metric: 'steps',
      daysAffected: noActivityDays,
    });
  }

  return alerts;
}

/**
 * Detect nutrition-related risks
 */
export function detectNutritionRisks(data: any[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const recentData = data.slice(0, 7); // Last 7 days
  const caloriesValues = recentData
    .filter((d) => d.calories && d.calories > 0)
    .map((d) => parseInt(d.calories));
  const proteinValues = recentData
    .filter((d) => d.protein && d.protein > 0)
    .map((d) => parseFloat(d.protein));

  // Very low calories (high risk)
  if (caloriesValues.length > 0) {
    const avgCalories = caloriesValues.reduce((sum, val) => sum + val, 0) / caloriesValues.length;
    const veryLowCalorieDays = caloriesValues.filter((c) => c < 1200).length;

    if (avgCalories < 1200 && veryLowCalorieDays >= 2) {
      alerts.push({
        type: 'nutrition',
        severity: 'high',
        title: 'Very Low Calorie Intake',
        description: `Average calories: ${Math.round(avgCalories).toLocaleString()} per day. ${veryLowCalorieDays} day(s) below 1,200 calories.`,
        recommendation: 'Ensure adequate calorie intake for your body\'s needs. Consult a healthcare provider if needed.',
        metric: 'calories',
        value: avgCalories,
        threshold: 1200,
        daysAffected: veryLowCalorieDays,
      });
    }
  }

  // Low protein (medium risk)
  if (proteinValues.length > 0) {
    const avgProtein = proteinValues.reduce((sum, val) => sum + val, 0) / proteinValues.length;
    const lowProteinDays = proteinValues.filter((p) => p < 50).length;

    if (avgProtein < 50 && lowProteinDays >= 3) {
      alerts.push({
        type: 'nutrition',
        severity: 'medium',
        title: 'Low Protein Intake',
        description: `Average protein: ${avgProtein.toFixed(1)}g per day. ${lowProteinDays} day(s) below 50g.`,
        recommendation: 'Increase protein intake through lean meats, legumes, or protein supplements.',
        metric: 'protein',
        value: avgProtein,
        threshold: 50,
        daysAffected: lowProteinDays,
      });
    }
  }

  return alerts;
}

/**
 * Detect weight-related risks
 */
export function detectWeightRisks(data: any[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const sortedData = [...data]
    .filter((d) => d.weight && d.weight > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14); // Last 14 days

  if (sortedData.length < 3) {
    return alerts;
  }

  const weights = sortedData.map((d) => parseFloat(d.weight));
  const firstWeight = weights[0];
  const lastWeight = weights[weights.length - 1];
  const change = lastWeight - firstWeight;
  const percentChange = (change / firstWeight) * 100;
  const days = weights.length - 1;
  const dailyChange = change / days;

  // Rapid weight loss (high risk)
  if (percentChange < -5 && dailyChange < -0.5) {
    alerts.push({
      type: 'weight',
      severity: 'high',
      title: 'Rapid Weight Loss',
      description: `Weight decreased by ${Math.abs(percentChange).toFixed(1)}% (${Math.abs(change).toFixed(1)}kg) over ${days} days.`,
      recommendation: 'Rapid weight loss may indicate health issues. Consider consulting a healthcare provider.',
      metric: 'weight',
      value: change,
      daysAffected: days,
    });
  }

  // Rapid weight gain (medium risk)
  if (percentChange > 5 && dailyChange > 0.5) {
    alerts.push({
      type: 'weight',
      severity: 'medium',
      title: 'Rapid Weight Gain',
      description: `Weight increased by ${percentChange.toFixed(1)}% (${change.toFixed(1)}kg) over ${days} days.`,
      recommendation: 'Monitor your diet and activity levels. Consider consulting a healthcare provider if this continues.',
      metric: 'weight',
      value: change,
      daysAffected: days,
    });
  }

  return alerts;
}

/**
 * Detect consistency risks (missing data)
 */
export function detectConsistencyRisks(data: any[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const recentData = data.slice(0, 14); // Last 14 days
  const daysWithData = recentData.filter((d) => {
    return d.weight || d.steps || d.sleep || d.calories || d.protein;
  }).length;

  const missingDays = 14 - daysWithData;

  if (missingDays >= 7) {
    alerts.push({
      type: 'consistency',
      severity: 'medium',
      title: 'Inconsistent Data Logging',
      description: `${missingDays} out of the last 14 days have no health data logged.`,
      recommendation: 'Try to log at least one health metric daily to maintain your streak and get better insights.',
      daysAffected: missingDays,
    });
  }

  return alerts;
}

/**
 * Detect all risks in health data
 */
export function detectAllRisks(data: any[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  // Only analyze if we have some data
  if (data.length === 0) {
    return [
      {
        type: 'consistency',
        severity: 'low',
        title: 'No Health Data',
        description: 'Start logging your health data to receive personalized risk alerts.',
        recommendation: 'Begin by logging at least one metric daily (steps, sleep, weight, calories, or protein).',
      },
    ];
  }

  alerts.push(...detectSleepRisks(data));
  alerts.push(...detectActivityRisks(data));
  alerts.push(...detectNutritionRisks(data));
  alerts.push(...detectWeightRisks(data));
  alerts.push(...detectConsistencyRisks(data));

  // Sort by severity (high > medium > low)
  const severityOrder = { high: 3, medium: 2, low: 1 };
  return alerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
}
