"use client";

import { TrendingUp, TrendingDown, Minus, Activity, Moon, Flame, Scale } from "lucide-react";

interface Prediction {
  value: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  method: string;
}

interface PredictionCardProps {
  metric: string;
  prediction: Prediction;
  unit: string;
}

const metricIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  steps: Activity,
  sleep: Moon,
  calories: Flame,
  weight: Scale,
};

const metricColors: { [key: string]: string } = {
  steps: 'green',
  sleep: 'blue',
  calories: 'orange',
  weight: 'purple',
};

export default function PredictionCard({ metric, prediction, unit }: PredictionCardProps) {
  const Icon = metricIcons[metric] || Activity;
  const color = metricColors[metric] || 'green';

  const getTrendIcon = () => {
    if (prediction.trend === 'increasing') {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (prediction.trend === 'decreasing') {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const formatValue = (value: number) => {
    if (metric === 'steps') {
      return Math.round(value).toLocaleString();
    } else if (metric === 'sleep') {
      return value.toFixed(1);
    } else if (metric === 'calories') {
      return Math.round(value).toLocaleString();
    } else if (metric === 'weight') {
      const sign = value >= 0 ? '+' : '';
      return `${sign}${value.toFixed(2)}`;
    }
    return value.toFixed(1);
  };

  const getColorClasses = () => {
    const colors = {
      green: 'bg-green-50 border-green-200 text-green-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  return (
    <div className={`p-4 rounded-lg border ${getColorClasses()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <span className="font-semibold capitalize">{metric}</span>
        </div>
        {getTrendIcon()}
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {formatValue(prediction.value)}
          </span>
          <span className="text-sm opacity-75">{unit}</span>
        </div>
        <p className="text-xs mt-1 opacity-75">
          Predicted for tomorrow
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Confidence</span>
            <span className="text-xs font-semibold">
              {(prediction.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                color === 'green' ? 'bg-green-600' :
                color === 'blue' ? 'bg-blue-600' :
                color === 'orange' ? 'bg-orange-600' :
                'bg-purple-600'
              }`}
              style={{ width: `${prediction.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-xs mt-2 opacity-60 capitalize">
        Method: {prediction.method.replace(/_/g, ' ')}
      </p>
    </div>
  );
}
