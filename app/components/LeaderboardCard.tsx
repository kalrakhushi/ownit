"use client";

import { useState, useEffect } from "react";
import { Trophy, TrendingUp, Flame, Moon, Footprints, Activity } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface LeaderboardEntry {
  userId: string;
  score: number;
  rank: number;
}

interface LeaderboardProps {
  type?: 'steps' | 'sleep' | 'calories' | 'streaks';
  limit?: number;
}

export default function LeaderboardCard({ type = 'steps', limit = 5 }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(type);

  useEffect(() => {
    fetchLeaderboard();
    // Track leaderboard view
    analytics.leaderboardViewed(selectedType);
  }, [selectedType]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?type=${selectedType}&limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const leaderboardTypes = [
    { id: 'steps', label: 'Steps', icon: Footprints, color: 'text-blue-600' },
    { id: 'streaks', label: 'Streaks', icon: Flame, color: 'text-orange-600' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-purple-600' },
    { id: 'calories', label: 'Calories', icon: Activity, color: 'text-red-600' },
  ];

  const formatScore = (score: number) => {
    if (selectedType === 'sleep') {
      return `${(score / 100).toFixed(1)}h`;
    }
    return score.toLocaleString();
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className={`w-5 h-5 ${getRankColor(rank)}`} />;
    }
    return <span className="text-gray-400 font-semibold">#{rank}</span>;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Leaderboard
        </h3>
      </div>

      {/* Type Selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {leaderboardTypes.map((typeOption) => {
          const Icon = typeOption.icon;
          return (
            <button
              key={typeOption.id}
              onClick={() => {
                const previousType = selectedType;
                setSelectedType(typeOption.id as any);
                analytics.leaderboardTypeChanged(previousType, typeOption.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedType === typeOption.id
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {typeOption.label}
            </button>
          );
        })}
      </div>

      {/* Leaderboard List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No data yet</p>
          <p className="text-xs mt-1">Start tracking to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                entry.rank <= 3
                  ? 'bg-gradient-to-r from-emerald-50 to-transparent border border-emerald-100'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(entry.rank)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {entry.userId === 'user' ? 'You' : `User ${entry.userId}`}
                </p>
                <p className="text-sm text-gray-600">
                  {formatScore(entry.score)} {selectedType}
                </p>
              </div>
              {entry.rank === 1 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  <Trophy className="w-3 h-3" />
                  Top
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Your Rank (if not in top N) */}
      {!isLoading && leaderboard.length > 0 && !leaderboard.some(e => e.userId === 'user') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Your rank will appear here once you have data
          </p>
        </div>
      )}
    </div>
  );
}
