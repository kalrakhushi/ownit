/**
 * Prediction utilities for ML/Prediction Engine
 */

interface PredictionResult {
  value: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  method: string;
}

/**
 * Simple linear regression prediction
 */
export function linearRegressionPrediction(values: number[]): PredictionResult {
  if (values.length < 2) {
    return {
      value: values[0] || 0,
      confidence: 0.3,
      trend: 'stable',
      method: 'insufficient_data',
    };
  }

  const n = values.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  
  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = values.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict next value
  const nextIndex = n;
  const prediction = slope * nextIndex + intercept;

  // Calculate confidence based on R-squared
  const meanY = sumY / n;
  const ssRes = values.reduce((sum, y, i) => {
    const predicted = slope * indices[i] + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const ssTot = values.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  const confidence = Math.max(0.3, Math.min(0.95, rSquared));

  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (slope > 0.01) trend = 'increasing';
  else if (slope < -0.01) trend = 'decreasing';

  return {
    value: Math.max(0, prediction), // Ensure non-negative
    confidence,
    trend,
    method: 'linear_regression',
  };
}

/**
 * Moving average prediction
 */
export function movingAveragePrediction(values: number[], window: number = 7): PredictionResult {
  if (values.length === 0) {
    return {
      value: 0,
      confidence: 0.1,
      trend: 'stable',
      method: 'no_data',
    };
  }

  const recentValues = values.slice(-window);
  const average = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;

  // Calculate trend from recent values
  const firstHalf = recentValues.slice(0, Math.floor(recentValues.length / 2));
  const secondHalf = recentValues.slice(Math.floor(recentValues.length / 2));
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  const diff = secondAvg - firstAvg;
  if (diff > average * 0.05) trend = 'increasing';
  else if (diff < -average * 0.05) trend = 'decreasing';

  // Confidence based on variance
  const variance = recentValues.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / recentValues.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = average > 0 ? stdDev / average : 1;
  const confidence = Math.max(0.3, Math.min(0.9, 1 - coefficientOfVariation));

  return {
    value: Math.max(0, average),
    confidence,
    trend,
    method: 'moving_average',
  };
}

/**
 * Predict tomorrow's steps
 */
export function predictSteps(historicalData: any[]): PredictionResult {
  const steps = historicalData
    .filter((d) => d.steps && d.steps > 0)
    .map((d) => parseInt(d.steps))
    .slice(-14); // Last 14 days

  if (steps.length < 3) {
    return {
      value: steps.length > 0 ? steps[steps.length - 1] : 0,
      confidence: 0.2,
      trend: 'stable',
      method: 'insufficient_data',
    };
  }

  // Use linear regression for better accuracy with enough data
  if (steps.length >= 7) {
    return linearRegressionPrediction(steps);
  }

  return movingAveragePrediction(steps, steps.length);
}

/**
 * Predict tomorrow's sleep
 */
export function predictSleep(historicalData: any[]): PredictionResult {
  const sleep = historicalData
    .filter((d) => d.sleep && d.sleep > 0)
    .map((d) => parseFloat(d.sleep))
    .slice(-14); // Last 14 days

  if (sleep.length < 3) {
    return {
      value: sleep.length > 0 ? sleep[sleep.length - 1] : 0,
      confidence: 0.2,
      trend: 'stable',
      method: 'insufficient_data',
    };
  }

  // Sleep patterns are often cyclical, use moving average
  return movingAveragePrediction(sleep, Math.min(7, sleep.length));
}

/**
 * Predict calories based on sleep
 */
export function predictCaloriesFromSleep(historicalData: any[]): PredictionResult | null {
  const dataPoints = historicalData
    .filter((d) => d.sleep && d.sleep > 0 && d.calories && d.calories > 0)
    .slice(-30);

  if (dataPoints.length < 5) {
    return null; // Not enough data
  }

  const sleepValues = dataPoints.map((d) => parseFloat(d.sleep));
  const calorieValues = dataPoints.map((d) => parseInt(d.calories));

  // Simple linear regression: calories = a * sleep + b
  const n = dataPoints.length;
  const sumSleep = sleepValues.reduce((sum, s) => sum + s, 0);
  const sumCalories = calorieValues.reduce((sum, c) => sum + c, 0);
  const sumSleepCalories = sleepValues.reduce((sum, s, i) => sum + s * calorieValues[i], 0);
  const sumSleepSquared = sleepValues.reduce((sum, s) => sum + s * s, 0);

  const slope = (n * sumSleepCalories - sumSleep * sumCalories) / (n * sumSleepSquared - sumSleep * sumSleep);
  const intercept = (sumCalories - slope * sumSleep) / n;

  // Get average sleep for prediction
  const avgSleep = sumSleep / n;
  const predictedCalories = slope * avgSleep + intercept;

  // Calculate correlation for confidence
  const avgCalories = sumCalories / n;
  const ssRes = calorieValues.reduce((sum, c, i) => {
    const predicted = slope * sleepValues[i] + intercept;
    return sum + Math.pow(c - predicted, 2);
  }, 0);
  const ssTot = calorieValues.reduce((sum, c) => sum + Math.pow(c - avgCalories, 2), 0);
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  const confidence = Math.max(0.4, Math.min(0.85, rSquared));

  return {
    value: Math.max(0, predictedCalories),
    confidence,
    trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
    method: 'sleep_correlation',
  };
}

/**
 * Predict weight change based on calories and protein
 */
export function predictWeightChange(historicalData: any[]): PredictionResult | null {
  const dataPoints = historicalData
    .filter((d) => d.weight && d.weight > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30);

  if (dataPoints.length < 7) {
    return null;
  }

  // Calculate weight change trend
  const weights = dataPoints.map((d) => parseFloat(d.weight));
  const firstWeight = weights[0];
  const lastWeight = weights[weights.length - 1];
  const change = lastWeight - firstWeight;
  const days = weights.length - 1;
  const dailyChange = change / days;

  // Predict next weight
  const predictedChange = dailyChange; // Next day's change
  const predictedWeight = lastWeight + predictedChange;

  // Confidence based on consistency of trend
  const changes = [];
  for (let i = 1; i < weights.length; i++) {
    changes.push(weights[i] - weights[i - 1]);
  }
  const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
  const variance = changes.reduce((sum, c) => sum + Math.pow(c - avgChange, 2), 0) / changes.length;
  const consistency = variance > 0 ? 1 / (1 + variance) : 1;
  const confidence = Math.max(0.3, Math.min(0.8, consistency));

  return {
    value: predictedChange,
    confidence,
    trend: predictedChange > 0.01 ? 'increasing' : predictedChange < -0.01 ? 'decreasing' : 'stable',
    method: 'weight_trend',
  };
}
