"use client";

import { useState } from "react";
import TogglePanel from "./components/TogglePanel";
import Section from "./components/Section";

export default function Home() {
  const [features, setFeatures] = useState({
    dashboard: true,
    streaks: false,
    insights: false,
    ml: false,
    mood: false,
    goals: false,
  });

  const handleToggleChange = (feature: string, enabled: boolean) => {
    setFeatures(prev => ({ ...prev, [feature]: enabled }));
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12 bg-gray-100 text-gray-900">

      {/* Header */}
      <h1 className="text-5xl font-extrabold tracking-tight">OwnIt 💚</h1>
      <p className="text-gray-600 mt-2 mb-10 text-center max-w-xl">
        A calm, minimal space to understand your health — without overwhelm.
        Enable only what you need. Grow at your pace.
      </p>

      <TogglePanel onToggleChange={handleToggleChange} />

      <Section title="Dashboard" visible={features.dashboard}>
        <p className="text-gray-600">📊 Charts, sleep/activity overview will live here.</p>
      </Section>

      <Section title="Streak Tracker" visible={features.streaks}>
        <p className="text-gray-600">🔥 Habit streak visualization (Duolingo-style).</p>
      </Section>

      <Section title="Insights" visible={features.insights}>
        <p className="text-gray-600">💡 Personalized patterns & wellness insights.</p>
      </Section>

      <Section title="AI Model" visible={features.ml}>
        <p className="text-gray-600">🧠 Regression model predictions from Kaggle dataset.</p>
      </Section>

      <Section title="Mood Reflection" visible={features.mood}>
        <p className="text-gray-600">🌿 Daily notes, mood sliders & emotion tracking.</p>
      </Section>

      <Section title="Goals" visible={features.goals}>
        <p className="text-gray-600">🎯 Goal settings (fat loss, muscle gain, protein targets).</p>
      </Section>

    </main>
  );
}
