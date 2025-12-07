"use client";

import { useState, useEffect } from "react";
import { Lightbulb, RefreshCw } from "lucide-react";
import BottomNav from "../components/BottomNav";
import PatternInsights from "../components/PatternInsights";
import { Pattern } from "@/lib/pattern-detection";

export default function InsightsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataPoints, setDataPoints] = useState(0);

  const loadPatterns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/patterns");
      if (response.ok) {
        const data = await response.json();
        setPatterns(data.patterns || []);
        setDataPoints(data.dataPoints || 0);
      }
    } catch (error) {
      console.error("Error loading patterns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatterns();
  }, []);

  return (
    <>
      <main className="min-h-screen bg-gray-100 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
              <p className="text-gray-600 mt-1 text-sm">
                AI-powered pattern detection and correlations
              </p>
            </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadPatterns}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                  aria-label="Analyze patterns"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Analyzing...' : 'Analyze Now'}
                </button>
              </div>
          </div>

          {dataPoints < 5 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-800 font-medium mb-2">
                    Need more data
                  </p>
                  <p className="text-sm text-gray-600">
                    Pattern detection requires at least 5 data points.
                    <br />
                    <span className="text-xs">
                      Keep logging your health data to discover insights and correlations.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {dataPoints > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-800">
                    <strong>Analyzing {dataPoints} data points</strong> to detect patterns, correlations, and trends.
                  </p>
                </div>
              )}

              <PatternInsights patterns={patterns} isLoading={isLoading} />

              {patterns.length > 0 && (
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3">Pattern Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <strong className="text-gray-800">Correlation:</strong> Relationships between different metrics
                    </div>
                    <div>
                      <strong className="text-gray-800">Temporal:</strong> Patterns based on time (weekdays vs weekends)
                    </div>
                    <div>
                      <strong className="text-gray-800">Trend:</strong> Long-term increases or decreases
                    </div>
                    <div>
                      <strong className="text-gray-800">Anomaly:</strong> Unusual patterns or outliers
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
