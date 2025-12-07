"use client";

import { useMemo } from "react";
import { Moon, Footprints, Flame, Beef, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DashboardOverviewProps {
  data: any[];
}

interface MetricCard {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    period: string;
  };
  color: string;
}

export default function DashboardOverview({ data }: DashboardOverviewProps) {
  // Calculate averages for all metrics
  const metrics = useMemo(() => {
    if (data.length === 0) return null;

    // Filter records with actual data
    const recordsWithData = data.filter(r => 
      r.weight || r.steps || r.sleep || r.calories || r.protein
    );

    if (recordsWithData.length === 0) return null;

    // Calculate overall averages
    const avgSleep = recordsWithData
      .filter(r => r.sleep)
      .reduce((sum, r) => sum + r.sleep, 0) / recordsWithData.filter(r => r.sleep).length || 0;

    const avgSteps = recordsWithData
      .filter(r => r.steps)
      .reduce((sum, r) => sum + r.steps, 0) / recordsWithData.filter(r => r.steps).length || 0;

    const avgCalories = recordsWithData
      .filter(r => r.calories)
      .reduce((sum, r) => sum + r.calories, 0) / recordsWithData.filter(r => r.calories).length || 0;

    const avgProtein = recordsWithData
      .filter(r => r.protein)
      .reduce((sum, r) => sum + r.protein, 0) / recordsWithData.filter(r => r.protein).length || 0;

    // Get last 7 days and previous 7 days
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0); // Start of 7 days ago
    
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0); // Start of 14 days ago

    const last7Days = sortedData.filter(r => {
      const recordDate = new Date(r.date);
      recordDate.setHours(12, 0, 0, 0); // Normalize to noon for comparison
      return recordDate >= sevenDaysAgo && recordDate <= today;
    });

    const previous7Days = sortedData.filter(r => {
      const recordDate = new Date(r.date);
      recordDate.setHours(12, 0, 0, 0); // Normalize to noon for comparison
      return recordDate >= fourteenDaysAgo && recordDate < sevenDaysAgo;
    });

    // Calculate averages for last 7 days
    const last7Sleep = last7Days
      .filter(r => r.sleep)
      .reduce((sum, r) => sum + r.sleep, 0) / last7Days.filter(r => r.sleep).length || 0;

    const last7Steps = last7Days
      .filter(r => r.steps)
      .reduce((sum, r) => sum + r.steps, 0) / last7Days.filter(r => r.steps).length || 0;

    const last7Calories = last7Days
      .filter(r => r.calories)
      .reduce((sum, r) => sum + r.calories, 0) / last7Days.filter(r => r.calories).length || 0;

    const last7Protein = last7Days
      .filter(r => r.protein)
      .reduce((sum, r) => sum + r.protein, 0) / last7Days.filter(r => r.protein).length || 0;

    // Calculate averages for previous 7 days
    const prev7Sleep = previous7Days
      .filter(r => r.sleep)
      .reduce((sum, r) => sum + r.sleep, 0) / previous7Days.filter(r => r.sleep).length || 0;

    const prev7Steps = previous7Days
      .filter(r => r.steps)
      .reduce((sum, r) => sum + r.steps, 0) / previous7Days.filter(r => r.steps).length || 0;

    const prev7Calories = previous7Days
      .filter(r => r.calories)
      .reduce((sum, r) => sum + r.calories, 0) / previous7Days.filter(r => r.calories).length || 0;

    const prev7Protein = previous7Days
      .filter(r => r.protein)
      .reduce((sum, r) => sum + r.protein, 0) / previous7Days.filter(r => r.protein).length || 0;

    // Calculate trends (percentage change)
    const calculateTrend = (current: number, previous: number): number | null => {
      if (previous === 0 || !previous || !current) return null;
      return ((current - previous) / previous) * 100;
    };

    const sleepTrend = calculateTrend(last7Sleep, prev7Sleep);
    const stepsTrend = calculateTrend(last7Steps, prev7Steps);
    const caloriesTrend = calculateTrend(last7Calories, prev7Calories);
    const proteinTrend = calculateTrend(last7Protein, prev7Protein);

    return {
      averages: {
        sleep: avgSleep,
        steps: avgSteps,
        calories: avgCalories,
        protein: avgProtein,
      },
      last7Days: {
        sleep: last7Sleep,
        steps: last7Steps,
        calories: last7Calories,
        protein: last7Protein,
      },
      previous7Days: {
        sleep: prev7Sleep,
        steps: prev7Steps,
        calories: prev7Calories,
        protein: prev7Protein,
      },
      trends: {
        sleep: sleepTrend,
        steps: stepsTrend,
        calories: caloriesTrend,
        protein: proteinTrend,
      },
    };
  }, [data]);

  if (!metrics) {
    return null;
  }

  const cards: MetricCard[] = [
    {
      label: "Avg Sleep",
      value: metrics.averages.sleep > 0 ? metrics.averages.sleep.toFixed(1) : "—",
      unit: "hrs",
      icon: <Moon className="w-6 h-6" />,
      trend: metrics.trends.sleep !== null ? {
        value: metrics.trends.sleep,
        period: "vs last week",
      } : undefined,
      color: "blue",
    },
    {
      label: "Avg Steps",
      value: metrics.averages.steps > 0 ? Math.round(metrics.averages.steps).toLocaleString() : "—",
      unit: "steps",
      icon: <Footprints className="w-6 h-6" />,
      trend: metrics.trends.steps !== null ? {
        value: metrics.trends.steps,
        period: "vs last week",
      } : undefined,
      color: "green",
    },
    {
      label: "Avg Calories",
      value: metrics.averages.calories > 0 ? Math.round(metrics.averages.calories).toLocaleString() : "—",
      unit: "cal",
      icon: <Flame className="w-6 h-6" />,
      trend: metrics.trends.calories !== null ? {
        value: metrics.trends.calories,
        period: "vs last week",
      } : undefined,
      color: "orange",
    },
    {
      label: "Avg Protein",
      value: metrics.averages.protein > 0 ? metrics.averages.protein.toFixed(1) : "—",
      unit: "g",
      icon: <Beef className="w-6 h-6" />,
      trend: metrics.trends.protein !== null ? {
        value: metrics.trends.protein,
        period: "vs last week",
      } : undefined,
      color: "purple",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
      purple: "bg-purple-50 border-purple-200 text-purple-700",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = (trend: number | null) => {
    if (trend === null) return <Minus className="w-4 h-4 text-gray-400" />;
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number | null) => {
    if (trend === null) return "text-gray-500";
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`p-4 rounded-lg border ${getColorClasses(card.color)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {card.icon}
                  <span className="text-sm font-medium">{card.label}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {card.value}
                  </span>
                  {card.value !== "—" && (
                    <span className="text-sm opacity-75">{card.unit}</span>
                  )}
                </div>
                {card.trend && (
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(card.trend.value)}
                    <span className={`text-xs font-medium ${getTrendColor(card.trend.value)}`}>
                      {card.trend.value > 0 ? "+" : ""}
                      {card.trend.value.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">{card.trend.period}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">7-Day Comparison</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {Object.values(metrics.last7Days).some(v => v > 0) || Object.values(metrics.previous7Days).some(v => v > 0) ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Last 7 Days */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Last 7 Days</h4>
                  <div className="space-y-3">
                    {metrics.last7Days.sleep > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sleep</span>
                        <span className="font-semibold">{metrics.last7Days.sleep.toFixed(1)} hrs</span>
                      </div>
                    )}
                    {metrics.last7Days.steps > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Steps</span>
                        <span className="font-semibold">{Math.round(metrics.last7Days.steps).toLocaleString()}</span>
                      </div>
                    )}
                    {metrics.last7Days.calories > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Calories</span>
                        <span className="font-semibold">{Math.round(metrics.last7Days.calories).toLocaleString()}</span>
                      </div>
                    )}
                    {metrics.last7Days.protein > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Protein</span>
                        <span className="font-semibold">{metrics.last7Days.protein.toFixed(1)} g</span>
                      </div>
                    )}
                    {Object.values(metrics.last7Days).every(v => v === 0) && (
                      <p className="text-sm text-gray-500">No data for last 7 days</p>
                    )}
                  </div>
                </div>

                {/* Previous 7 Days */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Previous 7 Days</h4>
                  <div className="space-y-3">
                    {metrics.previous7Days.sleep > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sleep</span>
                        <span className="font-semibold">{metrics.previous7Days.sleep.toFixed(1)} hrs</span>
                      </div>
                    )}
                    {metrics.previous7Days.steps > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Steps</span>
                        <span className="font-semibold">{Math.round(metrics.previous7Days.steps).toLocaleString()}</span>
                      </div>
                    )}
                    {metrics.previous7Days.calories > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Calories</span>
                        <span className="font-semibold">{Math.round(metrics.previous7Days.calories).toLocaleString()}</span>
                      </div>
                    )}
                    {metrics.previous7Days.protein > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Protein</span>
                        <span className="font-semibold">{metrics.previous7Days.protein.toFixed(1)} g</span>
                      </div>
                    )}
                    {Object.values(metrics.previous7Days).every(v => v === 0) && (
                      <p className="text-sm text-gray-500">No data for previous 7 days</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Comparison Summary */}
              {(metrics.trends.sleep !== null || metrics.trends.steps !== null || 
                metrics.trends.calories !== null || metrics.trends.protein !== null) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Changes</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {metrics.trends.sleep !== null && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {getTrendIcon(metrics.trends.sleep)}
                          <span className={`text-sm font-semibold ${getTrendColor(metrics.trends.sleep)}`}>
                            {metrics.trends.sleep > 0 ? "+" : ""}
                            {metrics.trends.sleep.toFixed(1)}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">Sleep</span>
                      </div>
                    )}
                    {metrics.trends.steps !== null && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {getTrendIcon(metrics.trends.steps)}
                          <span className={`text-sm font-semibold ${getTrendColor(metrics.trends.steps)}`}>
                            {metrics.trends.steps > 0 ? "+" : ""}
                            {metrics.trends.steps.toFixed(1)}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">Steps</span>
                      </div>
                    )}
                    {metrics.trends.calories !== null && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {getTrendIcon(metrics.trends.calories)}
                          <span className={`text-sm font-semibold ${getTrendColor(metrics.trends.calories)}`}>
                            {metrics.trends.calories > 0 ? "+" : ""}
                            {metrics.trends.calories.toFixed(1)}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">Calories</span>
                      </div>
                    )}
                    {metrics.trends.protein !== null && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {getTrendIcon(metrics.trends.protein)}
                          <span className={`text-sm font-semibold ${getTrendColor(metrics.trends.protein)}`}>
                            {metrics.trends.protein > 0 ? "+" : ""}
                            {metrics.trends.protein.toFixed(1)}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">Protein</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Need at least 7 days of data to show comparison. Keep logging your health data!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
