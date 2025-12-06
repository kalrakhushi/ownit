"use client";

import { useState } from "react";
import TogglePanel from "./components/TogglePanel";
import Section from "./components/Section";
import DataUploader from "./components/DataUploader";
import DataTable from "./components/DataTable";

export default function Home() {
  const [features, setFeatures] = useState({
    dashboard: true,
    streaks: false,
    insights: false,
    ml: false,
    mood: false,
    goals: false,
  });

  // Store uploaded health data - shared across all features
  const [healthData, setHealthData] = useState<any[]>([]);
  const [dataFileName, setDataFileName] = useState<string | null>(null);

  const handleToggleChange = (feature: string, enabled: boolean) => {
    setFeatures(prev => ({ ...prev, [feature]: enabled }));
  };

  const handleDataLoaded = (data: any[], fileName: string) => {
    if (fileName === "quick-entry") {
      // Append quick entries to existing data
      setHealthData(prev => [...prev, ...data]);
      setDataFileName("Quick entries");
    } else {
      // CSV uploads replace existing data
      setHealthData(data);
      setDataFileName(fileName);
    }
    console.log("Data loaded:", data); // TEMP — confirm upload works
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
        <DataUploader onDataLoaded={handleDataLoaded} />

        {healthData.length > 0 && (
          <>
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 mb-2 font-medium">
                ✅ {healthData.length} record{healthData.length !== 1 ? "s" : ""} loaded
              </p>
              <p className="text-sm text-gray-600">
                📊 Data is now available for charts, insights, and ML predictions.
              </p>
            </div>
            <DataTable data={healthData} />
          </>
        )}

        {healthData.length === 0 && (
          <p className="text-gray-600 mt-4 text-center">
            📊 Use <strong>Quick Entry</strong> to log daily data, or <strong>CSV Upload</strong> to import historical data.
          </p>
        )}
      </Section>

      <Section title="Streak Tracker" visible={features.streaks}>
        <p className="text-gray-600">🔥 Habit streak visualization (Duolingo-style).</p>
      </Section>

      <Section title="Insights" visible={features.insights}>
        <p className="text-gray-600">💡 Personalized patterns & wellness insights.</p>
      </Section>

      <Section title="AI Model" visible={features.ml}>
        {healthData.length === 0 ? (
          <p className="text-gray-600">
            🧠 Upload health data in Dashboard first to enable ML predictions.
            <br />
            <span className="text-sm">Model will be trained on Kaggle dataset and applied to your data.</span>
          </p>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              🧠 Using {healthData.length} records for predictions.
              <br />
              <span className="text-sm">Linear regression model trained on Kaggle health dataset.</span>
            </p>
            <p className="text-sm text-gray-500">
              ML predictions coming soon... (Will use your uploaded data + trained model)
            </p>
          </div>
        )}
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
