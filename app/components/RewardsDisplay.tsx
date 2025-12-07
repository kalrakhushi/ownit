"use client";

import { Trophy, Award, Star } from "lucide-react";
import { Reward } from "@/drizzle/schema.postgres";

interface RewardsDisplayProps {
  rewards: Reward[];
  totalPoints: number;
  isLoading?: boolean;
}

export default function RewardsDisplay({ rewards, totalPoints, isLoading }: RewardsDisplayProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Points */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Total Points</h3>
            <p className="text-sm text-gray-600">Earned from completed challenges</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-gray-900">{totalPoints}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards List */}
      {rewards.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No rewards earned yet</p>
          <p className="text-sm text-gray-500">
            Complete challenges to earn badges and points!
          </p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Earned Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-yellow-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{reward.icon || '🏆'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{reward.title}</h4>
                      {reward.points > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                          +{reward.points} pts
                        </span>
                      )}
                    </div>
                    {reward.description && (
                      <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {typeof reward.earnedDate === 'number'
                        ? new Date(reward.earnedDate * 1000).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : new Date(reward.earnedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
