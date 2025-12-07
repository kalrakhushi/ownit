"use client";

import { useState, useEffect } from "react";
import { Brain, RefreshCw } from "lucide-react";
import BottomNav from "../components/BottomNav";
import PredictionCard from "../components/PredictionCard";

interface Prediction {
  value: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  method: string;
}

interface Predictions {
  steps?: Prediction;
  sleep?: Prediction;
  calories?: Prediction;
  weight?: Prediction;
}

export default function MLPage() {
  const [predictions, setPredictions] = useState<Predictions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dataPoints, setDataPoints] = useState(0);

  const loadPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/predictions?metric=all");
      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || {});
        setDataPoints(data.dataPoints || 0);
      }
    } catch (error) {
      console.error("Error loading predictions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  return (
    <>
      <main className="min-h-screen bg-gray-100 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Predictions</h1>
              <p className="text-gray-600 mt-1 text-sm">
                ML-powered predictions based on your health data
              </p>
            </div>
            <button
              onClick={loadPredictions}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
              aria-label="Refresh predictions"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {dataPoints === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-800 font-medium mb-2">
                    No data available
                  </p>
                  <p className="text-sm text-gray-600">
                    Upload health data in Dashboard first to enable ML predictions.
                    <br />
                    <span className="text-xs">
                      Predictions use linear regression and moving average algorithms.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : Object.keys(predictions).length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <p className="text-gray-600 text-center">
                Not enough data to generate predictions. Need at least 3-5 data points.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Using {dataPoints} data points</strong> to generate predictions using linear regression and moving average algorithms.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.steps && (
                  <PredictionCard
                    metric="steps"
                    prediction={predictions.steps}
                    unit="steps"
                  />
                )}
                {predictions.sleep && (
                  <PredictionCard
                    metric="sleep"
                    prediction={predictions.sleep}
                    unit="hrs"
                  />
                )}
                {predictions.calories && (
                  <PredictionCard
                    metric="calories"
                    prediction={predictions.calories}
                    unit="cal"
                  />
                )}
                {predictions.weight && (
                  <PredictionCard
                    metric="weight"
                    prediction={predictions.weight}
                    unit="kg"
                  />
                )}
              </div>

              {Object.keys(predictions).length > 0 && (
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">How it works</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>
                        <strong>Linear Regression:</strong> Analyzes trends in your data to predict future values
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>
                        <strong>Moving Average:</strong> Uses recent averages to forecast tomorrow's values
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>
                        <strong>Confidence:</strong> Based on data consistency and pattern strength
                      </span>
                    </li>
                  </ul>
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
