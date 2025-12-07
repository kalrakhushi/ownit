"use client";

import { useState, useEffect } from "react";
import { Smile, RefreshCw } from "lucide-react";
import BottomNav from "../components/BottomNav";
import MoodLogger from "../components/MoodLogger";
import MoodHistory from "../components/MoodHistory";
import { MoodEntry } from "@/drizzle/schema.postgres";

export default function MoodPage() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMoodEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/mood");
      if (response.ok) {
        const data = await response.json();
        setMoodEntries(data || []);
      }
    } catch (error) {
      console.error("Error loading mood entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMoodEntries();
  }, []);

  return (
    <>
      <main className="min-h-screen bg-gray-100 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mood Reflection</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Track your daily mood, energy, and reflections
              </p>
            </div>
            <button
              onClick={loadMoodEntries}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
              aria-label="Refresh mood entries"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Mood Logger */}
            <MoodLogger onSave={loadMoodEntries} />

            {/* Mood History */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <MoodHistory entries={moodEntries} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
