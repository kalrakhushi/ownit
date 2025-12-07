"use client";

import { Smile, Frown, Meh, Calendar } from "lucide-react";
import { MoodEntry } from "@/drizzle/schema.postgres";

interface MoodHistoryProps {
  entries: MoodEntry[];
  isLoading?: boolean;
}

export default function MoodHistory({ entries, isLoading }: MoodHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No mood entries yet</p>
        <p className="text-sm text-gray-500">
          Start logging your mood to see your emotional patterns over time.
        </p>
      </div>
    );
  }

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return <Smile className="w-5 h-5 text-green-600" />;
    if (mood >= 5) return <Meh className="w-5 h-5 text-yellow-600" />;
    return <Frown className="w-5 h-5 text-red-600" />;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return "bg-green-50 border-green-200";
    if (mood >= 5) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood History</h3>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`p-4 rounded-lg border ${getMoodColor(entry.mood)}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              {getMoodEmoji(entry.mood)}
              <div>
                <div className="font-semibold text-gray-900">
                  {formatDate(entry.date)}
                </div>
                <div className="text-xs text-gray-600">
                  Mood: {entry.mood}/10
                  {entry.energy && ` • Energy: ${entry.energy}/10`}
                  {entry.stress && ` • Stress: ${entry.stress}/10`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{entry.mood}</div>
            </div>
          </div>

          {entry.reflection && (
            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {entry.reflection}
              </p>
            </div>
          )}

          {entry.tags && (
            <div className="mt-2 flex flex-wrap gap-1">
              {entry.tags.split(",").map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-white/60 rounded-full text-gray-700"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
