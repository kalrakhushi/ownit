"use client";

import { Lightbulb, TrendingUp, Activity, AlertCircle } from "lucide-react";
import { Pattern } from "@/lib/pattern-detection";

interface PatternInsightsProps {
  patterns: Pattern[];
  isLoading?: boolean;
}

export default function PatternInsights({ patterns, isLoading }: PatternInsightsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No patterns detected yet</p>
        <p className="text-sm text-gray-500">
          Keep logging your health data to discover insights and patterns.
        </p>
      </div>
    );
  }

  const getPatternIcon = (type: Pattern['type']) => {
    switch (type) {
      case 'correlation':
        return <Activity className="w-5 h-5" />;
      case 'temporal':
        return <TrendingUp className="w-5 h-5" />;
      case 'trend':
        return <TrendingUp className="w-5 h-5" />;
      case 'anomaly':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getPatternColor = (type: Pattern['type']) => {
    switch (type) {
      case 'correlation':
        return 'bg-blue-50 border-blue-100 text-gray-900';
      case 'temporal':
        return 'bg-purple-50 border-purple-100 text-gray-900';
      case 'trend':
        return 'bg-emerald-50 border-emerald-100 text-gray-900';
      case 'anomaly':
        return 'bg-amber-50 border-amber-100 text-gray-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-emerald-100 text-emerald-800';
    if (confidence >= 0.6) return 'bg-amber-100 text-amber-800';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Detected Patterns ({patterns.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.map((pattern, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border shadow-sm transition-shadow hover:shadow-md ${getPatternColor(pattern.type)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getPatternIcon(pattern.type)}
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {pattern.type}
                </span>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${getConfidenceColor(
                  pattern.confidence
                )}`}
              >
                {(pattern.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <p className="text-sm font-medium mb-3">{pattern.description}</p>

            {pattern.correlation && (
              <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                <div className="flex items-center justify-between text-xs">
                  <span>Correlation:</span>
                  <span className="font-semibold">
                    {(pattern.correlation * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}

            {pattern.metric1 && pattern.metric2 && (
              <div className="mt-2 text-xs opacity-75">
                {pattern.metric1} ↔ {pattern.metric2}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
