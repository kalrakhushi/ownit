"use client";

import { Trophy, Target, Clock, CheckCircle2, Play, Award } from "lucide-react";
import { useState } from "react";

interface ChallengeCardProps {
  challenge: any;
  progress: any | null;
  currentProgress: number;
  progressPercent: number;
  daysRemaining: number;
  isCompleted: boolean;
  reward: any | null;
  onStart?: (challengeId: number) => void;
}

export default function ChallengeCard({
  challenge,
  progress,
  currentProgress,
  progressPercent,
  daysRemaining,
  isCompleted,
  reward,
  onStart,
}: ChallengeCardProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (!onStart) return;
    setIsStarting(true);
    try {
      await onStart(challenge.id);
    } finally {
      setIsStarting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'steps':
        return '🚶';
      case 'sleep':
        return '😴';
      case 'calories':
        return '🔥';
      case 'protein':
        return '💪';
      case 'streak':
        return '🔥';
      case 'consistency':
        return '📊';
      default:
        return '🎯';
    }
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'steps' || type === 'calories') {
      return Math.round(value).toLocaleString();
    }
    return value.toFixed(1);
  };

  const getTargetDisplay = () => {
    if (challenge.type === 'sleep' || challenge.type === 'protein') {
      return `${formatValue(challenge.targetValue, challenge.type)} ${getUnit(challenge.type)} daily`;
    }
    if (challenge.type === 'consistency') {
      return `${challenge.targetValue} days`;
    }
    return `${formatValue(challenge.targetValue, challenge.type)} ${getUnit(challenge.type)} total`;
  };

  const getUnit = (type: string) => {
    const units: { [key: string]: string } = {
      steps: 'steps',
      sleep: 'hrs',
      calories: 'cal',
      protein: 'g',
    };
    return units[type] || '';
  };

  return (
    <div
      className={`p-5 rounded-lg border-2 ${
        isCompleted
          ? 'bg-green-50 border-green-300'
          : progress
          ? 'bg-blue-50 border-blue-300'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{getTypeIcon(challenge.type)}</div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{challenge.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
          </div>
        </div>
        {isCompleted && (
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
        )}
      </div>

      {isCompleted ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-700">
            <Award className="w-5 h-5" />
            <span className="font-semibold">Completed!</span>
          </div>
          {reward && (
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-sm">{reward.title}</span>
              </div>
              {reward.points > 0 && (
                <p className="text-xs text-gray-600">{reward.points} points earned</p>
              )}
            </div>
          )}
        </div>
      ) : progress ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">
              {formatValue(currentProgress, challenge.type)} / {getTargetDisplay()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>{progressPercent}% complete</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{daysRemaining} days left</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Target</span>
              <span className="text-sm font-semibold text-gray-900">
                {getTargetDisplay()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Duration</span>
              <span className="text-sm font-semibold">{challenge.duration} days</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Reward</span>
              <span className="text-sm font-semibold text-yellow-600">
                {challenge.rewardBadge} {challenge.rewardPoints} pts
              </span>
            </div>
          </div>
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Challenge
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
