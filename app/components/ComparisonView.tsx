"use client";

import { TrendingUp, TrendingDown, Minus, Activity, Moon, Flame, Beef, Scale } from "lucide-react";
import { ComparisonResult } from "@/lib/comparison-utils";

interface ComparisonViewProps {
  comparisons: ComparisonResult[];
  isLoading?: boolean;
  period?: string;
}

const metricIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  steps: Activity,
  sleep: Moon,
  calories: Flame,
  protein: Beef,
  weight: Scale,
};

export default function ComparisonView({ comparisons, isLoading, period = "7 days" }: ComparisonViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (comparisons.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-600 mb-2">Not enough data for comparison</p>
        <p className="text-sm text-gray-500">
          Need at least {period} of historical data to compare periods.
        </p>
      </div>
    );
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'steps' || unit === 'calories') {
      return Math.round(value).toLocaleString();
    }
    return value.toFixed(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Past vs Present</h3>
        <span className="text-sm text-gray-600">Comparing last {period}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comparisons.map((comparison) => {
          const Icon = metricIcons[comparison.metric] || Activity;
          const isImproving = comparison.trend === 'improving';
          const isDeclining = comparison.trend === 'declining';

          return (
            <div
              key={comparison.metric}
              className={`p-4 rounded-lg border shadow-sm transition-shadow hover:shadow-md ${
                isImproving
                  ? 'bg-emerald-50 border-emerald-100'
                  : isDeclining
                  ? 'bg-rose-50 border-rose-100'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-gray-700" />
                  <span className="font-semibold text-gray-900">{comparison.label}</span>
                </div>
                {isImproving ? (
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                ) : isDeclining ? (
                  <TrendingDown className="w-5 h-5 text-rose-700" />
                ) : (
                  <Minus className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <div className="space-y-2">
                {/* Current Period */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Current</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatValue(comparison.current.value, comparison.unit)}
                    </p>
                    <p className="text-xs text-gray-500">{comparison.current.period}</p>
                  </div>
                </div>

                {/* Previous Period */}
                <div className="flex items-center justify-between pt-2 border-t border-current border-opacity-20">
                  <div>
                    <p className="text-xs text-gray-600">Previous</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {formatValue(comparison.previous.value, comparison.unit)}
                    </p>
                    <p className="text-xs text-gray-500">{comparison.previous.period}</p>
                  </div>
                </div>

                {/* Change */}
                <div className="pt-2 border-t border-current border-opacity-20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">Change</span>
                    <span className="text-sm font-bold text-gray-800">
                      {isImproving ? '+' : isDeclining ? '-' : ''}
                      {formatValue(Math.abs(comparison.change), comparison.unit)} (
                      {comparison.changePercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
