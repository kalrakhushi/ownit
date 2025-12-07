"use client";

interface TogglePanelProps {
  onToggleChange: (feature: string, enabled: boolean) => void;
}

export default function TogglePanel({ onToggleChange }: TogglePanelProps) {
  const features = [
    { key: "dashboard", label: "Dashboard" },
    { key: "streaks", label: "Streak Tracker" },
    { key: "insights", label: "Insights" },
    { key: "ml", label: "AI Model" },
    { key: "mood", label: "Mood Reflection" },
    { key: "goals", label: "Goals" },
    { key: "coach", label: "Personal Coach" },
  ];

  return (
    <div className="w-full max-w-2xl mb-8 bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Feature Toggles</h2>
      <div className="space-y-3">
        {features.map((feature) => (
          <label
            key={feature.key}
            className="flex items-center justify-between p-3 rounded hover:bg-gray-50 cursor-pointer"
          >
            <span className="text-gray-700">{feature.label}</span>
            <input
              type="checkbox"
              onChange={(e) => onToggleChange(feature.key, e.target.checked)}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

