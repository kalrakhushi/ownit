"use client";

import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  streakStartDate: string | null;
  calendar: Array<{ date: string; active: boolean }>;
}

export default function StreakTracker() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStreaks = async () => {
      try {
        const response = await fetch('/api/streaks');
        if (response.ok) {
          const data = await response.json();
          setStreakData(data);
        }
      } catch (error) {
        console.error('Error fetching streaks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreaks();
    
    // Refresh streaks every 30 seconds
    const interval = setInterval(fetchStreaks, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow border">
        <p className="text-gray-600 text-center">Loading streak data...</p>
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow border">
        <p className="text-gray-600 text-center">No streak data available.</p>
      </div>
    );
  }

  const { currentStreak, longestStreak, calendar } = streakData;

  // Get motivational message based on streak
  const getMotivationalMessage = () => {
    if (currentStreak === 0) {
      return "Start your streak today! Log any health data to begin.";
    } else if (currentStreak === 1) {
      return "Great start! Keep it going! 🔥";
    } else if (currentStreak < 7) {
      return "You're on fire! Keep logging daily! 🔥";
    } else if (currentStreak < 30) {
      return `Amazing! ${currentStreak} days strong! 💪`;
    } else if (currentStreak < 100) {
      return `Incredible! ${currentStreak} days! You're unstoppable! 🚀`;
    } else {
      return `Legendary! ${currentStreak} days! You're a champion! 👑`;
    }
  };

  // Get calendar for last 30 days (or show all if less)
  const displayCalendar = calendar.slice(-30);

  return (
    <div className="space-y-6">
      {/* Streak Stats */}
      <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow border border-orange-200">
        <div className="text-center mb-4">
          <div className="text-6xl font-bold text-orange-600 mb-2">
            🔥 {currentStreak}
          </div>
          <p className="text-lg font-semibold text-gray-800">
            Day{currentStreak !== 1 ? 's' : ''} Streak
          </p>
          {longestStreak > currentStreak && (
            <p className="text-sm text-gray-600 mt-2">
              Best: {longestStreak} days
            </p>
          )}
        </div>
        
        <div className="mt-4 p-3 bg-white rounded-lg border border-orange-100">
          <p className="text-sm text-center text-gray-700">
            {getMotivationalMessage()}
          </p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Activity Calendar (Last 30 Days)
        </h3>
        
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div
              key={idx}
              className="text-xs font-medium text-gray-500 text-center py-1"
            >
              {day}
            </div>
          ))}
          
          {/* Calendar cells */}
          {displayCalendar.map((day, idx) => {
            const date = new Date(day.date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isFuture = date > new Date();
            
            return (
              <div
                key={idx}
                className={`
                  aspect-square rounded-md flex items-center justify-center text-xs
                  ${day.active
                    ? 'bg-green-500 text-white font-semibold'
                    : isFuture
                    ? 'bg-gray-100 text-gray-300'
                    : 'bg-gray-200 text-gray-400'
                  }
                  ${isToday ? 'ring-2 ring-orange-400 ring-offset-1' : ''}
                `}
                title={`${day.date} - ${day.active ? 'Active' : 'No data'}`}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span>No data</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded ring-2 ring-orange-400"></div>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Tip:</strong> Log any health data (weight, steps, sleep, calories, or protein) 
            each day to maintain your streak. Even one field counts!
          </span>
        </p>
      </div>
    </div>
  );
}
