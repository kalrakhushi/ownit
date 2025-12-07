"use client";

import ChatBot from "../components/ChatBot";
import BottomNav from "../components/BottomNav";

export default function CoachPage() {
  return (
    <>
      <main className="min-h-screen bg-gray-100 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personal Coach</h1>
              <p className="text-sm text-gray-600 mt-1">
                Chat with your AI coach for guidance, explanations, and quick summaries.
              </p>
            </div>
          </div>

          <ChatBot />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
