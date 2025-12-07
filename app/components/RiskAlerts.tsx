"use client";

import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { RiskAlert } from "@/lib/risk-detection";
import { useState } from "react";

interface RiskAlertsProps {
  alerts: RiskAlert[];
  isLoading?: boolean;
  onDismiss?: (index: number) => void;
}

export default function RiskAlerts({ alerts, isLoading, onDismiss }: RiskAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-6 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2 text-emerald-800 mb-2">
          <Info className="w-5 h-5" />
          <span className="font-semibold">All Clear!</span>
        </div>
        <p className="text-sm text-emerald-700">
          No health risks detected. Keep up the great work!
        </p>
      </div>
    );
  }

  const getSeverityIcon = (severity: RiskAlert['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-sky-600" />;
    }
  };

  const getSeverityColor = (severity: RiskAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-rose-50 border-rose-100 text-rose-900';
      case 'medium':
        return 'bg-amber-50 border-amber-100 text-amber-900';
      default:
        return 'bg-sky-50 border-sky-100 text-sky-900';
    }
  };

  const handleDismiss = (index: number) => {
    setDismissed(new Set([...dismissed, index]));
    if (onDismiss) {
      onDismiss(index);
    }
  };

  const visibleAlerts = alerts.filter((_, index) => !dismissed.has(index));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Health Alerts</h3>
        <span className="text-sm text-gray-600">
          {visibleAlerts.length} alert{visibleAlerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {visibleAlerts.map((alert, index) => {
        const originalIndex = alerts.indexOf(alert);
        return (
          <div
            key={originalIndex}
            className={`p-4 rounded-lg border shadow-sm transition-shadow hover:shadow-md ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{alert.title}</h4>
                    <span className="text-xs px-2 py-0.5 bg-white/60 rounded-full uppercase font-medium">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm mb-2 opacity-90">{alert.description}</p>
                  {alert.recommendation && (
                    <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                    <p className="text-sm font-medium mb-1">Recommendation:</p>
                    <p className="text-sm opacity-90">{alert.recommendation}</p>
                  </div>
                  )}
                  {alert.value !== undefined && alert.threshold !== undefined && (
                    <div className="mt-2 text-xs opacity-75">
                      Current: {alert.value.toFixed(1)} | Threshold: {alert.threshold}
                    </div>
                  )}
                </div>
              </div>
              {onDismiss && (
                <button
                  onClick={() => handleDismiss(originalIndex)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
