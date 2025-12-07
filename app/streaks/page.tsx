"use client";

import StreakTracker from "../components/StreakTracker";
import BottomNav from "../components/BottomNav";

export default function StreaksPage() {
  return (
    <>
      <main className="min-h-screen bg-gray-100 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Streak Tracker</h1>
          <StreakTracker />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
